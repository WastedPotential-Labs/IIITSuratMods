import crypto from "crypto";
import nodemailer from "nodemailer";

const OTP_LENGTH = 6;

const requiredEmailVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"];

export const isEmailConfigured = () => requiredEmailVars.every((name) => process.env[name]);

const requireEmailConfig = () => {
  const missing = requiredEmailVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Email delivery is not configured. Missing: ${missing.join(", ")}`);
  }
};

// Local development fallback: when SMTP is not configured, print the OTP to
// the server console instead of failing the whole signup/reset flow. Without
// this, register() always returned 503 on a fresh checkout because .env has
// no SMTP credentials.
const logOtpToConsole = (kind, email, otp) => {
  console.warn(
    `[DEV EMAIL FALLBACK] SMTP is not configured (${requiredEmailVars.join(", ")}). ` +
      `${kind} code for ${email}: ${otp} (expires in 10 minutes)`
  );
};

const createTransporter = () => {
  requireEmailConfig();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.replace(/\s/g, "")
    }
  });
};

export const createOtp = () => crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");

export const hashOtp = (userId, otp) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET or JWT_SECRET is missing in .env");
  }

  return crypto.createHmac("sha256", secret).update(`${userId}:${otp}`).digest("hex");
};

export const sendEmailOtp = async ({ email, otp }) => {
  if (!isEmailConfigured()) {
    logOtpToConsole("Verification", email, otp);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM.trim(),
    to: email,
    subject: "Verify your IIIT Surat MODs email",
    text: `Your IIIT Surat MODs verification code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`
  }).catch((error) => {
    console.error("Email verification delivery failed:", error.message);
    throw error;
  });
};

export const sendPasswordResetOtp = async ({ email, otp }) => {
  if (!isEmailConfigured()) {
    logOtpToConsole("Password reset", email, otp);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM.trim(),
    to: email,
    subject: "Reset your IIIT Surat MODs password",
    text: `Your IIIT Surat MODs password reset code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`
  }).catch((error) => {
    console.error("Password reset email delivery failed:", error.message);
    throw error;
  });
};
