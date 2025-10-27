import * as OTPAuth from "otpauth";
const config = useRuntimeConfig();

export const $totp = new OTPAuth.TOTP({
    issuer: "SSS",
    label: "Administrator",
    secret: config.secretKey as string,
});