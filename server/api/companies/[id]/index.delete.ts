import { z } from "zod";
import { insertAuditLog } from "~~/server/utils/database";

const requestSchema = z.object({
  reason: z.string().min(1, "Reason is required and must not be empty"),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid company id",
    });
  }

  const parseResult = await readValidatedBody(event, (body) =>
    requestSchema.safeParse(body)
  );

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Please provide a reason, this is destructive and cannot be undone.",
    });
  }

  const { reason } = parseResult.data;

  try {
    const sql = useDatabase(event);

    if (!sql) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    await sql.unsafe(`DROP SCHEMA IF EXISTS ${id} CASCADE`);

    await sql.unsafe(`DELETE FROM companies WHERE company_id = ${id}`);

    await insertAuditLog(
      {
        actor: event.context.user?.name || "UNKNOWN",
        action: "COMPANY.DELETE",
        target: "DATABASE",
        status: "SUCCESS",
        description: `Deleted company ${id}`,
        metadata: { id, reason },
      },
      event
    );

    return {
      message: "Company deleted successfully.",
    };
  } catch (error) {
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Service temporarily unavailable",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Service temporarily unavailable",
    });
  }
});
