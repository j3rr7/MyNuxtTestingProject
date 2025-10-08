import { z } from "zod";

const requestSchema = z.object({
  reason: z.string().min(1, "Reason is required and must not be empty"),
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

  throw createError({
    statusCode: 501,
    statusMessage: "Not implemented",
  });
});
