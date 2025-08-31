// config/sendEmail.ts
import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL || !process.env.PASSWORD) {
    throw new Error("EMAIL and PASSWORD must be set in environment");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"LuTuon Support" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: "./src/assets/logo.png", 
          cid: "logo" 
        }
      ],
    });
  } catch (e) {
    throw new Error("Failed to send email: " + (e as Error).message);
  }
}
