import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1, "Name is required and must not be empty"),
  code: z.string().min(1, "Code is required and must not be empty"),
  database: z.string().min(1, "Database is required and must not be empty"),
});

export default defineEventHandler(async (event) => {
  const parseResult = await readValidatedBody(event, (body) => requestSchema.safeParse(body));
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body: " + parseResult.error,
    });
  }

  const { name, code, database } = parseResult.data;
  console.log("Create company:", name, code, database);

  const nitroApp = useNitroApp();

  try {
    if (!nitroApp.sql) {
      console.error("Database connection (nitroApp.sql) is not available.");
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    const result = await nitroApp.sql.unsafe(
      `SELECT * FROM public.create_company_and_schema($1, $2, $3, now() + interval '1 year');`,
      [name, code, database]
    );

    console.log("Database operation successful. Result:", result.length);

    setResponseStatus(event, 201);

    return {
      message: "Company created successfully.",
      data: result[0] || null,
    }
  } 
  catch(error: unknown) {
    console.error("Database operation failed:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Database operation failed: " + error,
    });
  }
});
