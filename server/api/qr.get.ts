export default defineEventHandler(async (_event) => {
  return { token: $totp.toString(), otp: $totp.generate() };
});
