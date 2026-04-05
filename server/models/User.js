import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "User name is required"],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true, // Prevents duplicate accounts
        lowercase: true, // Saves 'User@Mail.com' as 'user@mail.com'
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    },
    address: { 
        type: String,
        trim: true 
    },
    role: { 
        type: String, 
        enum: ["admin", "customer"], // Limits roles to these specific options
        default: "customer" 
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model("User", userSchema);
export default User;