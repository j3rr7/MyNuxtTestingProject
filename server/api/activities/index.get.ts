import { z } from "zod";

const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export default defineEventHandler(async (event) => {
  const parseResult = await getValidatedQuery(event, (body) =>
    paginationSchema.safeParse(body)
  );

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid query",
    });
  }

  try {
    const sql = useDatabase(event);

    if (!sql) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    const { limit, offset } = parseResult.data;

    const logs =
      await sql`SELECT id, actor, action, target, status, description, metadata, ip_address, created_at
      FROM internal_admin.audit_logs
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};`;

    return logs;
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
