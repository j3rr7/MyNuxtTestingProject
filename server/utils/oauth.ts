import * as OTPAuth from "otpauth";
const config = useRuntimeConfig();

export const $totp = new OTPAuth.TOTP({
    issuer: "SSS",
    label: "Administrator",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: config.secretKey || "change-me",
});