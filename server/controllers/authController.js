    import bcrypt from 'bcrypt';
    import jwt from 'jsonwebtoken';
    import User from '../models/User.js';
    import Otp from '../models/Otp.js'; // Ensure you created this model
    import { sendEmail } from '../utils/emailHelper.js';

    // --- 1. SEND OTP LOGIC ---
    export const sendOtp = async (req, res) => {
        try {
            const { email } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email is already registered" });
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Save OTP to DB (Update if exists, else create new)
            // The 'expires' in the model will handle auto-deletion
            await Otp.findOneAndUpdate(
                { email },
                { otp, createdAt: Date.now() },
                { upsert: true, new: true }
            );

            const otpMessage = `
                <div style="font-family: Arial, sans-serif; text-align: center; border: 1px solid #ddd; padding: 20px;">
                    <h2 style="color: #6366f1;">StatFlow Verification</h2>
                    <p>Use the code below to verify your email address. It is valid for 5 minutes.</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #1c2141;">${otp}</h1>
                </div>
            `;

            try {
                await sendEmail(email, "Your StatFlow Verification Code", otpMessage);
            } catch (err) {
                console.warn("⚠️ SMTP Firewall Block Detected (Expected on Render Free Tier).");
                console.warn(`✅ [DEVELOPER OTP BACKDOOR]: The OTP for ${email} is -> ${otp}`);
                // Proceed without crashing the signup process
            }

            res.status(200).json({ success: true, message: "OTP processed! If email fails, check Render Logs." });
        } catch (error) {
            console.error("OTP Error:", error);
            res.status(500).json({ success: false, message: "Failed to generate OTP" });
        }
    };

    // --- 2. UPDATED REGISTER LOGIC ---
    export const register = async (req, res) => {
        try {
            const { name, email, password, role, address, otp } = req.body;

            // 1. Verify OTP
            const otpRecord = await Otp.findOne({ email, otp });
            if (!otpRecord) {
                return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
            }

            // 2. Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Save User
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: role || 'customer',
                address: address || ''
            });

            await newUser.save();

            // 4. Cleanup: Delete OTP after successful registration
            await Otp.deleteOne({ email });

            // 5. Send Welcome Email
            const welcomeMessage = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #6366f1;">Welcome to StatFlow, ${name}!</h2>
                    <p>Your account is now verified and active as a <strong>${newUser.role}</strong>.</p>
                    <p>Best Regards,<br/>The StatFlow Team</p>
                </div>
            `;

            try {
                await sendEmail(email, "Welcome to StatFlow!", welcomeMessage);
            } catch (mailError) {
                console.error("Welcome email failed:", mailError);
            }

            return res.status(201).json({ success: true, message: "Registration successful!" });

        } catch (error) {
            console.error("Registration Error:", error);
            return res.status(500).json({ success: false, message: "Server error during registration" });
        }
    };

    // --- LOGIN LOGIC (Remains Same) ---
    // --- LOGIN LOGIC (Fixed for Specific Errors) ---
    // --- LOGIN LOGIC (Updated for Specific Errors) ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find User
        const user = await User.findOne({ email });
        
        // If user doesn't exist, return 'User not found'
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }

        // 3. Success Logic
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "2d" }
        );

        return res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};