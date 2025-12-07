import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";

const sendEmail = async function (email, subject, message, URL) {
  const client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

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

  await client.sendTransacEmail({
    sender: { email: process.env.GMAIL_USER || "no-reply@yourdomain.com" },
    to: [{ email }],
    subject,
    htmlContent,
  });
};

// import nodemailer from "nodemailer";

export const mail = async (email, subject, message) => {
  try {
    console.log('detailsl');
    
    console.log(process.env.BREVO_USER);
    console.log(process.env.BREVO_PASS);
    
    
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.BREVO_USER,   // Your Brevo email
        pass: process.env.BREVO_PASS,   // Your SMTP KEY
      },
    });

    // ✅ VERIFY SMTP CONNECTION
    await transporter.verify();
    console.log("SMTP is working!");

    // ⚠ USE Brevo verified sender, not Gmail
    const fromEmail = process.env.BREVO_FROM;
    console.log('from email',fromEmail,email);
    
    const htmlContent = `
      <p>${message}</p>
    `;

    // SEND MAIL
    await transporter.sendMail({
      from: `"LMS Support" <${fromEmail}>`,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log("Mail Sent Successfully");
  } catch (error) {
    console.error("Email Error:", error);
  }
};

export default sendEmail;
