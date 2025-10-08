export default defineEventHandler(async (_event) => {
  try {
    const sql = useDatabase();

    if (!sql) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database connection is not available.",
      });
    }

    await sql`SELECT 1`;

    return {
      status: "ok",
      message: "Database connection is available.",
    };
  } catch (error) {
    
    // Generic error message
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Service temporarily unavailable",
      });
    }

    // Fallback 
    throw createError({
      statusCode: 500,
      statusMessage: "Unexpected health check failure",
    });
  }
});
