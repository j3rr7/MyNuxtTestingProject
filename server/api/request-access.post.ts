import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1, "Name is required and must not be empty"),
  token: z.string().min(1, "Token is required and must not be empty"),
  scope: z.string().optional().default("*"),
});

export default defineEventHandler(async (event) => {
  const parseResult = await readValidatedBody(event, (body) => requestSchema.safeParse(body));
  if (!parseResult.success) {
    console.error("Invalid request body:", parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body: " + parseResult.error,
    });
  }

  const { name, token, scope } = parseResult.data;
  console.log("Request access:", name, scope, token);

  if (token !== "admintoken") {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  await setUserSession(event, {
    user: {
      name
    },
  })

  return { message: "Request access - to be implemented" };
});
