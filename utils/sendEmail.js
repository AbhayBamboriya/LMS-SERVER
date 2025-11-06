import nodemailer from "nodemailer";

const sendEmail = async function (email, subject, message, URL) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const htmlContent = `
    <p>${message}</p>
    <p>
      <a href="${URL}" 
         style="display:inline-block;padding:10px 18px;background:#4CAF50;color:white;
         text-decoration:none;border-radius:5px;font-weight:bold;">
         Reset Password
      </a>
    </p>
    <p>Or copy and paste this link in your browser:</p>
    <p>${URL}</p>
  `;

  await transporter.sendMail({
    from: `"LMS Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: htmlContent,
  });
};

export const mail = async function (email, subject, message, URL) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const htmlContent = `
    <p>${message}</p>
  `;

  await transporter.sendMail({
    from: `"LMS Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: htmlContent,
  });
};
export default sendEmail;
