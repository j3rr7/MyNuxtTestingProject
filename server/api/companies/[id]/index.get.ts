export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid company id",
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

    const sqlQuery = `SELECT
      "company_id",
	    "company_name",
	    "company_code",
	    "database_name",
	    "created_at",
	    "subscription_expires_at",
	    "is_active" 
      FROM public.companies 
      WHERE company_id = $1`;
    const company = await sql.unsafe(sqlQuery, [id]);

    return {
      data: company,
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
