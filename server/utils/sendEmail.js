import nodemailer from 'nodemailer';

// Sends an email using the existing SMTP_* env vars. If SMTP isn't
// configured (e.g. local development), logs the message instead of
// throwing, so password-reset flows stay usable without real credentials.
const sendEmail = async ({ to, subject, html, text }) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD } = process.env;

    if (!SMTP_HOST || !SMTP_EMAIL || !SMTP_PASSWORD) {
        console.log('[sendEmail] SMTP not configured — logging email instead of sending.');
        console.log(`To: ${to}\nSubject: ${subject}\n${text || html}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || SMTP_EMAIL,
        to,
        subject,
        text,
        html,
    });
};

export default sendEmail;
