import nodemailer from "nodemailer";

export async function POST(req) {
  const { to, name, email, phone, pdfBase64 } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Resume Builder" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Resume – ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 32px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #111827; margin-bottom: 8px;">Hi there!</h2>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
            Please find the resume of <strong style="color: #111827">${name}</strong> attached to this email as a PDF.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0" />
          <p style="color: #9ca3af; font-size: 12px;">Sent via Resume Builder</p>
        </div>
      `,
      attachments: [
        {
          filename: `${name}-resume.pdf`,
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
