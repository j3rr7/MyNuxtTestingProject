import { z } from 'zod';
import { $totp } from "../utils/oauth";

const requestSchema = z.object({
  token: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const sharedKey = config.secretKey;
  if (!sharedKey) {
    throw createError({ statusCode: 500, statusMessage: 'Shared key not configured' });
  }

  const parseResult = await readValidatedBody(event, (body) => requestSchema.safeParse(body));
  if (!parseResult.success) {
    console.error('Invalid request body:', parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body: '
    });
  }

  const delta: number | null = $totp.validate({ token: parseResult.data.token, window: 1 });

  // === DEBUG INFO ===
  const counter = $totp.counter(); // period counter from timestamp 0
  const remaining = $totp.remaining(); // remaining time in milliseconds until the next token is generated
  const token = $totp.generate();
  console.log(`Token: ${token}, Counter: ${counter}, Remaining: ${remaining}, Delta: ${delta}`);
  // === DEBUG INFO ===

  const isValid = delta !== null;

  return {
    result: isValid,
    delta,
    token: isValid ? "admintoken" : undefined
  };
});