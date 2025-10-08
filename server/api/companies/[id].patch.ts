import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1, "Name must not be empty if provided").optional(),
  code: z.string().min(1, "Code must not be empty if provided").optional(),
  database: z
    .string()
    .min(1, "Database must not be empty if provided")
    .optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().optional()
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

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

  const { name, code, database, expiresAt, isActive } = parseResult.data;

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

  if (isActive !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    params.push(isActive);
  }

  params.push(id);

  const sqlQuery = `UPDATE public.companies SET ${updates.join(
    ", "
  )} WHERE company_id = $${paramIndex};`;

  try {
    const sql = useDatabase(event);

    if (!sql) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    await sql.unsafe(sqlQuery, params);

    setResponseStatus(event, 200);

    return {
      message: "Company updated successfully.",
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
    })
  }
});
