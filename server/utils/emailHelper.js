import { Resend } from 'resend';

export const sendEmail = async (to, subject, htmlContent) => {
    try {
        // Sanitize the key in case it was pasted into Render with spaces or quotes
        const rawKey = process.env.RESEND_API_KEY || "";
        const cleanKey = rawKey.replace(/['"]/g, '').trim();

        if (!cleanKey) {
             throw new Error("Missing RESEND_API_KEY in environment variables.");
        }
        
        const resend = new Resend(cleanKey);

        const { data, error } = await resend.emails.send({
            from: "StatFlow Team <onboarding@resend.dev>", // Free tier must use verified domain or resend testing address
            to: [to],
            // Resend restricted domains typically dictate you can only send to yourself unless you verify a domain.
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error("Resend API rejected email:", error);
            throw new Error(error.message);
        }

        console.log(`Email sent successfully via Resend to ${to} [ID: ${data?.id}]`);
    } catch (error) {
        console.error("Critical Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};