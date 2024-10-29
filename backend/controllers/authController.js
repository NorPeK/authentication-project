import { User } from "../models/Users.js";
import bcryptjs from 'bcryptjs';
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {
    console.log("Received signup request"); // Log start
    const { email, password, name } = req.body;
    
    try {
        if (!email || !password || !name) {
            console.log("Missing fields"); // Log missing fields
            throw new Error("All fields are required.");
        }
        console.log("All fields are present");

        const userAlreadyExists = await User.findOne({ email });
        console.log("Checked if user exists");

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const verificationToken = generateVerificationToken();
        console.log("Generated verification token");

        const hashedPassword = await bcryptjs.hash(password, 10);
        console.log("Password hashed");

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        await user.save();
        console.log("User saved to database");

        generateTokenAndSetCookie(res, user._id);
        console.log("Token generated and cookie set");

        sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({
            success: true,
            message: "User Created Successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
        console.log("Response sent successfully");




    } catch (error) {
        console.log("Error occurred:", error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
};


export const verifyEmail = async(req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })

        if(!user) {
            return res.status(400).json({success: false, message: "Invalid or expired verification code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
        
    }
}


export const login = async (req,res) => {
    res.send("login route");
}


export const logout = async (req,res) => {
    res.send("logout route");
}