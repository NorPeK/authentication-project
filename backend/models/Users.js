import mongoose from "mongoose"; // Import Mongoose library to interact with MongoDB

// Define a schema for User documents in MongoDB
const userSchema = new mongoose.Schema({
    // Email field with validation
    email: {
        type: String, // Data type of email
        required: true, // This field must be provided
        unique: true, // Ensures email uniqueness across all documents
    },
    // Password field with validation
    password: {
        type: String, // Data type of password (hashed for security)
        required: true, // This field must be provided
    },
    // User's name field with validation
    name: {
        type: String, // Data type of name
        required: true, // This field must be provided
    },
    // Last login date of the user
    lastLogin: {
        type: Date, // Data type of last login
        default: Date.now, // Sets default value to current date and time
    },
    // Boolean to indicate if the user is verified
    isVerified: {
        type: Boolean, // Data type of verification status
        default: false, // Default value is false (not verified)
    },
    // Token used to reset password
    resetPasswordToken: String, // Token value (optional)
    // Expiration time for reset password token
    resetPasswordExpireAt: Date, // Expiration date for reset token (optional)
    // Token used for email verification
    verificationToken: String, // Token for verifying user's email (optional)
    // Expiration time for verification token
    verificationTokenExpiresAt: Date, // Expiration date for verification token (optional)

}, 
{
    timestamps: true // Adds `createdAt` and `updatedAt` timestamps automatically
});

// Create and export the User model based on the schema
export const User = mongoose.model('User', userSchema); // 'User' model is linked to `userSchema`
