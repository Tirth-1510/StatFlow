import nodemailer from 'nodemailer';

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