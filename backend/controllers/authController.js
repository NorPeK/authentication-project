import { User } from "../models/Users.js"; // Import the User model for database interaction
import bcryptjs from 'bcryptjs'; // Import bcryptjs for password hashing
import { generateVerificationToken } from "../utils/generateVerificationToken.js"; // Import token generation utility
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"; // Import JWT generation and cookie-setting function
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"; // Import email utilities for sending emails


export const signup = async (req, res) => {
    console.log("Received signup request"); // Log request start
    const { email, password, name } = req.body; // Extract data from request body
    
    try {
        // Check if all required fields are present
        if (!email || !password || !name) {
            console.log("Missing fields"); // Log missing fields
            throw new Error("All fields are required.");
        }
        console.log("All fields are present");

        // Check if a user with the same email already exists
        const userAlreadyExists = await User.findOne({ email });
        console.log("Checked if user exists");

        if (userAlreadyExists) {
            // Return a 400 status if user already exists
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Generate a unique token for email verification
        const verificationToken = generateVerificationToken();
        console.log("Generated verification token");

        // Hash the password using bcrypt with a salt factor of 10
        const hashedPassword = await bcryptjs.hash(password, 10);
        console.log("Password hashed");

        // Create a new user document
        const user = new User({
            email,
            password: hashedPassword, // Store the hashed password
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // Set token expiration to 24 hours from now
        });

        // Save the user to the database
        await user.save();
        console.log("User saved to database");

        // Generate JWT and set it as an HTTP-only cookie in the response
        generateTokenAndSetCookie(res, user._id);
        console.log("Token generated and cookie set");

        // Send a verification email with the token
        sendVerificationEmail(user.email, verificationToken);

        // Respond with success, excluding the password field for security
        res.status(201).json({
            success: true,
            message: "User Created Successfully",
            user: {
                ...user._doc,
                password: undefined, // Omit password field from response
            },
        });
        console.log("Response sent successfully");

    } catch (error) {
        // Catch and log any errors, then return a 400 status
        console.log("Error occurred:", error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
};



export const verifyEmail = async(req, res) => {
    const {code} = req.body; // Extract verification code from request body

    try {
        // Find the user with the matching verification token and an expiration date greater than the current time
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            // If user not found or token expired, send a 400 status
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        // Mark user as verified and remove token fields
        user.isVerified = true;
        user.verificationToken = undefined; // Clear token after verification
        user.verificationTokenExpiresAt = undefined;

        await user.save(); // Save changes to the user document

        // Send a welcome email after successful verification
        await sendWelcomeEmail(user.email, user.name);

        // Respond with success, excluding the password field
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
        console.log("Response sent successfully");

    } catch (error) {
        // Catch and log any errors, then return a 500 status
        console.log("Error occurred in verifying email:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};



export const login = async (req,res) => {
    res.send("login route");
}


export const logout = async (req,res) => {
    res.send("logout route");
}