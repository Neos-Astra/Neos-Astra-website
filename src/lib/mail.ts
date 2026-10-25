// src/lib/mail.ts
import nodemailer from "nodemailer";

export const sendMail = async (to: string, subject: string, html: string) => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "SMTP credentials (SMTP_USER and SMTP_PASS) are not configured in your .env file. Please add your email and app password in .env to send real emails."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from: `"Neos Astra School of Innovation" <${user}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent successfully: %s", info.messageId);
  return info;
};
