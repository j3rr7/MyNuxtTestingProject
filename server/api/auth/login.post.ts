import { z } from 'zod';

const requestSchema = z.object({
  name: z.string().min(1, "Name is required and must not be empty"),
})

export default defineEventHandler(async (event) => {
  const parseResult = await readValidatedBody(event, (body) => requestSchema.safeParse(body));
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name is required and must not be empty",
    });
  }

  const { name } = parseResult.data;

  await setUserSession(event, {
    user: { name },
    secure: { token: 'todo', permission: 'a++' },
    loggedInAt: new Date()
  })

  await insertAuditLog({
    actor: name,
    action: 'LOGIN',
    target: "USER",
    status: 'SUCCESS',
    description: `User '${name}' logged in at ${new Date().toISOString()}`
  }, event);

  return { result: true };
});
