import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

export const sendOTPEmail = async (to: string, otp: string, purpose: string) => {
  const mailOptions = {
    from: `"GlamBook" <${process.env.EMAIL_USER}>`,
    to,
    subject: `GlamBook - Your verification code`,
    html: `
      <div style="font-family: Montserrat, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 16px;">
        <h1 style="color: #5B62B3; font-size: 24px; margin-bottom: 8px;">GlamBook</h1>
        <p style="color: #374151; font-size: 16px;">Your verification code for <strong>${purpose}</strong>:</p>
        <div style="background: #5B62B3; color: white; font-size: 36px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 24px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6B7280; font-size: 14px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"GlamBook" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to GlamBook!',
    html: `
      <div style="font-family: Montserrat, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 16px;">
        <h1 style="color: #5B62B3; font-size: 24px; margin-bottom: 8px;">Welcome to GlamBook, ${name}! 💄</h1>
        <p style="color: #374151; font-size: 16px;">Your account has been created successfully.</p>
        <p style="color: #374151; font-size: 14px;">Start exploring beauty services and courses today.</p>
        <a href="http://localhost:5173/client/services" style="display: inline-block; background: #5B62B3; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; margin-top: 16px;">
          Browse Services
        </a>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  const mailOptions = {
    from: `"GlamBook" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};
