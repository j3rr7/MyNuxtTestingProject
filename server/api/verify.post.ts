// import { cryptoRandomBase64, puzzleForSlot, SLOT_SECONDS } from "../utils/crypto";
import { authenticator } from 'otplib';
import { z } from 'zod';

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
    // Log validation error for debugging (in production, log to a service like Sentry)
    console.error('Invalid request body:', parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body: '
    });
  }

  const accToken = authenticator.generate(sharedKey);
  const keyuri = authenticator.keyuri("administrator", "SSS-IT", sharedKey)
  const result = authenticator.verify({ token: parseResult.data.token, secret: sharedKey })
  console.log(sharedKey, accToken, keyuri, result)

  console.log("====")
  const a1 = authenticator.keyuri("test1", "SSS-IT", sharedKey);
  const a2 = authenticator.keyuri("test2", "SSS-IT", sharedKey);
  const a3 = authenticator.keyuri("test3", "SSS-IT", sharedKey);
  console.log(a1, a2, a3)

  return {
    result,
  };
});