import { $totp } from "../utils/oauth";

export default defineEventHandler(async (_event) => {
  const uri = $totp.toString();
  console.log(uri);

  return { token: uri };
});
