import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1, "Name must not be empty if provided").optional(),
  code: z.string().min(1, "Code must not be empty if provided").optional(),
  database: z
    .string()
    .min(1, "Database must not be empty if provided")
    .optional(),
  expiresAt: z.coerce.date().optional(),
});

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
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
      statusMessage: "Invalid request body: " + parseResult.error,
    });
  }

  const nitroApp = useNitroApp();
  const { name, code, database, expiresAt } = parseResult.data;

  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`company_name = $${paramIndex++}`);
    params.push(name);
  }
  if (code !== undefined) {
    updates.push(`company_code = $${paramIndex++}`);
    params.push(code);
  }
  if (database !== undefined) {
    updates.push(`database_name = $${paramIndex++}`);
    params.push(database);
  }
  if (expiresAt !== undefined) {
    updates.push(`subscription_expires_at = $${paramIndex++}`);
    params.push(expiresAt.toISOString());
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Request body must contain at least one field to update.",
    });
  }

  params.push(id);

  const sqlQuery = `UPDATE public.companies SET ${updates.join(
    ", "
  )} WHERE company_id = $${paramIndex};`;

  try {
    if (!nitroApp.sql) {
      console.error("Database connection (nitroApp.sql) is not available.");
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    await nitroApp.sql.unsafe(sqlQuery, params);

    setResponseStatus(event, 200);

    return {
      message: "Company updated successfully.",
    };
  } catch (error: unknown) {
    console.error("Database operation failed:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Database operation failed: " + error,
    });
  }
});
