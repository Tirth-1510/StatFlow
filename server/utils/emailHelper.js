import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js to use IPv4 first to prevent Render IPv6 ENETUNREACH routing errors
dns.setDefaultResultOrder('ipv4first');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"StatFlow Team" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent, // We use HTML to make the email look professional
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};