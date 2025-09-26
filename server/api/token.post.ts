// import { cryptoRandomBase64, puzzleForSlot, SLOT_SECONDS } from "../utils/crypto";
import { authenticator } from 'otplib';

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig();
  const sharedKey = config.secretKey;
  if (!sharedKey) {
    throw createError({ statusCode: 500, statusMessage: 'Shared key not configured' });
  }

  // const parseResult = await readValidatedBody(event, (body) => requestSchema.safeParse(body));
  // if (!parseResult.success) {
  //   // Log validation error for debugging (in production, log to a service like Sentry)
  //   console.error('Invalid request body:', parseResult.error);
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: 'Invalid request body: challengeInput must be a string under 1024 characters'
  //   });
  // }

  // const { challengeInput } = parseResult.data;
  // const inputBody = challengeInput.toString(); // Ensure it's a string

  // const now = Date.now() / 1000;
  // const ts = Math.floor(now);
  // const nonce = cryptoRandomBase64(12);
  // const inputBodyBase64 = inputBody ? Buffer.from(inputBody, 'utf-8').toString('base64') : '';
  // const clientInput = `${ts}:${nonce}:${inputBodyBase64}`;
  // const slot = Math.floor(ts / SLOT_SECONDS);
  // const claimedPuzzleHex = await puzzleForSlot(sharedKey, slot, clientInput);

  // const accToken = authenticator.generate(secret);
  // const keyuri = authenticator.keyuri("test", "Solusi Sistem Internal Tools by Jere", secret)
  // console.log(accToken, keyuri)

  const secret = authenticator.generateSecret();
  const accToken = authenticator.generate(secret);
  const keyuri = authenticator.keyuri("administrator", "Solusi Sistem Internal Tools by Jere", secret)
  console.log(secret, accToken, keyuri)

  return {
    keyuri
  };
});