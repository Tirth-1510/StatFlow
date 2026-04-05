import User from '../models/User.js'
import bcrypt from 'bcrypt';
import xlsx from 'xlsx';
import fs from 'fs';

/* ================= ADD USER (MANUAL) ================= */
const addUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        const exUser = await User.findOne({ email });
        if (exUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            address,
            role,
        });

        await newUser.save();
        return res.status(201).json({ success: true, message: 'User added successfully' });
    } catch (error) {
        console.error('Error adding user.', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

/* ================= GET ALL USERS ================= */
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Generally best not to send passwords
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET SINGLE USER PROFILE ================= */
const getUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user })
    } catch (error) {
        console.error("Error fetching user profile.", error);
        return res.status(500).json({ success: false, message: 'Server error in getting user profile' });
    }
}

/* ================= UPDATE PROFILE ================= */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, address, password } = req.body;

        const updatedata = { name, email, address };

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedata.password = hashedPassword;
        }

        const user = await User.findByIdAndUpdate(userId, updatedata, { new: true }).select('-password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile', error);
        return res.status(500).json({ success: false, message: 'Server error in updating profile' });
    }
}

/* ================= DELETE USER ================= */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        await User.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

/* ================= BULK UPLOAD USERS (NEW) ================= */
const bulkUploadUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const filePath = req.file.path;
        let userData = [];

        // 1. Parse File
        if (req.file.mimetype === "application/json") {
            userData = JSON.parse(fs.readFileSync(filePath));
        } else {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            userData = xlsx.utils.sheet_to_json(sheet);
        }

        // 2. Fetch existing emails to prevent duplicates
        const existingUsers = await User.find({}, 'email');
        const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

        // 3. Format, Validate, and Hash Passwords
        const finalUsers = [];
        for (const item of userData) {
            const email = item.email?.toString().toLowerCase().trim();
            
            // Skip if user exists or email is missing
            if (!email || existingEmails.has(email)) continue;

            const password = item.password ? item.password.toString() : "Welcome@123";
            const hashedPassword = await bcrypt.hash(password, 10);

            finalUsers.push({
                name: item.name?.toString().trim(),
                email: email,
                password: hashedPassword,
                address: item.address?.toString().trim() || "",
                role: item.role?.toString().toLowerCase().trim() || "user"
            });
        }

        // 4. Batch Insert
        if (finalUsers.length > 0) {
            await User.insertMany(finalUsers);
        }

        // 5. Cleanup temp file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        return res.status(201).json({
            success: true,
            message: `Bulk import finished. Added ${finalUsers.length} new users.`,
            skipped: userData.length - finalUsers.length
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("Bulk upload error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { addUser, getUsers, deleteUser, getUser, updateUserProfile, bulkUploadUsers };