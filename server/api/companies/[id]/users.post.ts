import { z } from "zod";

const requestSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.number().int().positive("Role is required"),
});

export default defineEventHandler(async (event) => {
  const companyId = getRouterParam(event, 'id');
  if (!companyId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing company ID in the request path.",
    });
  }

  const parseResult = await readValidatedBody(event, (body) => requestSchema.safeParse(body));
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body.",
    });
  }

  const { displayName, username, email, password, role } = parseResult.data;

  const sql = useDatabase(event);

  if (!sql) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection is not available.",
    });
  }

  try {
    const [newUser] = await sql.begin(async (tx) => {
      // TODO: Implement proper password hashing
      const hashedPassword = password

      const createdUsers = await tx`
        INSERT INTO "public"."users" (
          company_id, username, email, password_hash, fullname, is_active, is_email_verified
        ) VALUES (
          ${companyId}, ${username}, ${email}, ${hashedPassword}, ${displayName}, true, false
        )
        RETURNING user_uuid;
      `;
      const newUserUuid = createdUsers[0]?.user_uuid;

      if (!newUserUuid) {
        throw new Error("Failed to create user in the public schema.");
      }

      const companyResult = await tx`
        SELECT database_name FROM public.companies WHERE company_id = ${companyId}
      `;
      const companyDatabase = companyResult[0]?.database_name;
      
      if (!companyDatabase) {
        throw createError({
          statusCode: 404,
          statusMessage: "Company not found.",
        });
      }

      const companyUsersSchema = companyDatabase + '.company_users'
      const userRolesSchema = companyDatabase + '.user_roles'
      
      const [insertedCompanyUser] = await tx`
        INSERT INTO ${companyUsersSchema} (
          "user_uuid", "fullname", "username", "email"
        ) VALUES (
          ${newUserUuid}, ${displayName}, ${username}, ${email}
        ) RETURNING user_id;
      `;

      await tx`
        INSERT INTO ${userRolesSchema} (
          user_id, role_id
        ) VALUES (
          ${insertedCompanyUser.user_id}, ${role}
        )
      `;
      
      return createdUsers;
    });

    setResponseStatus(event, 201);

    return {
      message: "User created successfully.",
      user: newUser,
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
       throw createError({
        statusCode: 409, // Conflict
        statusMessage: "A user with that username or email already exists.",
       });
    }

    console.error("Error creating user:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "An internal error occurred while creating the user.",
    });
  }
});