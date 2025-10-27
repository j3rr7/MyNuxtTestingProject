export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid company id",
    });
  }

  const sql = useDatabase(event);

  if (!sql) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection is not available.",
    });
  }

  try {
    const companyQuery = `
    SELECT
        public.companies.database_name
    FROM
        public.companies
    WHERE
        public.companies.company_id = $1;
    `;

    const company = await sql.unsafe(companyQuery, [id]);
    const databaseName = company[0].database_name;

    // Validate database name
    if (!databaseName) {
      throw createError({
        statusCode: 404,
        statusMessage: "Company not found.",
      });
    }

    const usersQuery = `
    SELECT
        public.users.fullname,
        public.users.email,
        public.users.username,
        public.users.user_uuid,
        "${databaseName}".company_users.user_id,
        "${databaseName}".company_users.user_external_id,
        public.companies.company_name,
        public.companies.company_id,
        public.companies.database_name,
        public.users.is_active,
        public.users.is_email_verified,
        public.users.created_at,
        "${databaseName}".company_users.avatar
    FROM
        public.companies 
    INNER JOIN
        public.users 
    ON
        public.companies.company_id = public.users.company_id 
    INNER JOIN
        "${databaseName}".company_users 
    ON
        "${databaseName}".company_users.user_uuid = public.users.user_uuid 
    `

    const users = await sql.unsafe(usersQuery, []);

    return { data: users };
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: 500,
      statusMessage: "An internal error occurred while fetching users.",
    });
  }
});
