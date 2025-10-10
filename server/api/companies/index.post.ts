import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1, "Name is required and must not be empty"),
  code: z.string().min(1, "Code is required and must not be empty"),
  database: z.string().min(1, "Database is required and must not be empty"),
  expiresAt: z.coerce.date().optional().default(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }),
});

export default defineEventHandler(async (event) => {
  const parseResult = await readValidatedBody(event, (body) => requestSchema.safeParse(body));
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body: " + parseResult.error,
    });
  }

  const { name, code, database, expiresAt } = parseResult.data;

  try {
    const sql = useDatabase(event);

    if (!sql) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    await sql.unsafe(
      `SELECT * FROM public.create_company_and_schema($1, $2, $3, $4);`,
      [name, code, database, expiresAt.toISOString()]
    );

    await insertAuditLog({
      actor: event.context.user?.name || "UNKNOWN",
      action: "COMPANY.CREATE",
      target: "DATABASE",
      status: "SUCCESS",
      description: `Created company ${name}`,
      metadata: { name, code, database, expiresAt },
    }, event);

    await sql.unsafe(
      `SELECT * FROM public.populate_company_schema($1);`,
      [database]
    )

    await insertAuditLog({
      actor: event.context.user?.name || "UNKNOWN",
      action: "COMPANY.POPULATE",
      target: "DATABASE",
      status: "SUCCESS",
      description: `Populated company ${name}`,
      metadata: { database },
    }, event);

    setResponseStatus(event, 201);

    return {
      message: "Company created successfully.",
    }
  } 
  catch(error) {

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
