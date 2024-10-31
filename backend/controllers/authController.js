import { User } from "../models/Users.js"; // Import the User model for database interaction
import bcryptjs from 'bcryptjs'; // Import bcryptjs for password hashing
import { generateVerificationToken } from "../utils/generateVerificationToken.js"; // Import token generation utility
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"; // Import JWT generation and cookie-setting function
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"; // Import email utilities for sending emails
import crypto from "crypto";

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



// Define an asynchronous login function that takes in Express.js request (req) and response (res) objects
export const login = async (req, res) => {
    // Destructure email and password from the request body
    const { email, password } = req.body;

    try {
        // Attempt to find a user in the database with the provided email
        const user = await User.findOne({ email });

        // If no user is found, return a 400 response with an error message
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Compare the provided password with the stored hashed password using bcryptjs
        const isPasswordValid = await bcryptjs.compare(password, user.password);

        // If the password does not match, return a 400 response with an error message
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate a token for the user and set it in a cookie in the response
        generateTokenAndSetCookie(res, user._id);

        // Update the user's last login timestamp
        user.lastLogin = new Date();

        // Save the updated user data in the database
        await user.save();

        // Send a success response back to the client, excluding the password for security reasons
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,  // Include all user fields except password
                password: undefined,  // Remove the password field from the response
            },
        });
        
        // Log a message in the server console to confirm the response was sent
        console.log("Response sent successfully");

    } catch (error) {
        // Log an error message if any issue occurs during the login process
        console.log("Error occurred in login process:", error.message);
        
        // Send a 500 server error response if there was a problem
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Define an asynchronous logout function that takes Express.js request (req) and response (res) objects
export const logout = async (req, res) => {
    try {
        // Clear the authentication token cookie from the response to log the user out
        res.clearCookie("token");

        // Send a 202 Accepted status to indicate the logout action was successfully processed
        res.status(202).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        // Log any errors encountered during the logout process for server-side debugging
        console.log("Error occurred in logging out", error.message);

        // Send a 401 Unauthorized status if there was an error, with an error message
        return res.status(401).json({ success: false, message: error.message });
    }
};




// Define an asynchronous forgotPassword function that takes Express.js request (req) and response (res) objects
export const forgotPassword = async (req, res) => {
    // Destructure the email from the request body
    const { email } = req.body;

    try {
        // Search for a user in the database by the provided email
        const user = await User.findOne({ email });

        // If no user is found, return a 400 response with an error message
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        // Generate a random token using crypto library (20 bytes converted to hexadecimal string)
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Set the token expiration to 1 hour from the current time
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour in milliseconds

        // Assign the generated token and its expiration time to the user's fields in the database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpireAt = resetTokenExpiresAt;

        // Save the updated user with the reset token and expiration in the database
        await user.save();

        // Send an email to the user with the reset link that includes the reset token
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        // Send a 203 Non-Authoritative Information status indicating email sent successfully
        res.status(203).json({ success: true, message: "Password reset link sent to your email" });

    } catch (error) {
        // Log any errors encountered during the process for server-side debugging
        console.log("Error occurred in forgot password process:", error.message);

        // Send a 401 Unauthorized status if there was an error, with an error message
        return res.status(401).json({ success: false, message: error.message });
    }
};




// Define an asynchronous resetPassword function that takes Express.js request (req) and response (res) objects
export const resetPassword = async (req, res) => {
    // Extract the token from the request parameters and the new password from the request body
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Search for a user with a matching reset token and an expiration date that is still in the future
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpireAt: { $gt: Date.now() }, // Ensures the token is still valid
        });

        // If no user is found (either the token is invalid or expired), send a 400 response
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        // Hash the new password using bcryptjs with a salt round of 10
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Update the user's password in the database with the newly hashed password
        user.password = hashedPassword;

        // Clear the reset token and its expiration fields to ensure they cannot be reused
        user.resetPasswordToken = undefined;
        user.resetPasswordExpireAt = undefined;

        // Save the updated user data in the database
        await user.save();

        // Send a success email notification to the user indicating the password was successfully reset
        await sendResetSuccessEmail(user.email);

        // Respond with a 200 status code and a success message
        res.status(200).json({ success: true, message: "Password reset successful" });

    } catch (error) {
        // Log any errors encountered during the process for server-side debugging
        console.log("Error in resetPassword", error);

        // Send a 400 response if an error occurs, with an error message
        res.status(400).json({ success: false, message: error.message });
    }
};



// Define an asynchronous checkAuth function that takes Express.js request (req) and response (res) objects
export const checkAuth = async (req, res) => {

    try {
        // Find the user in the database using the user ID from the request (req.userId),
        // selecting all fields except the password field
        const user = await User.findById(req.userId).select("-password");

        // If no user is found, send a 400 response with an error message
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // If the user is found, send a 200 response with user data (excluding password)
        res.status(200).json({ success: true, user });

    } catch (error) {
        // Log any errors encountered during the process for server-side debugging
        console.log("Error in checkAuth", error);

        // Send a 400 response if an error occurs, with an error message
        res.status(400).json({ success: false, message: error.message });
    }
};


