import jwt from "jsonwebtoken"; // Import the `jsonwebtoken` library to handle JWT creation and verification

// Function to generate a JWT token and set it as a cookie in the response
export const generateTokenAndSetCookie = (res, userId) => {
    // Generate a token with `userId` as payload, using the secret key from environment variables.
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d", // Token will expire in 7 days
    });

    // Set the token in the `token` cookie with various security settings
    res.cookie("token", token, {
        httpOnly: true, // Prevents JavaScript from accessing the cookie (XSS protection)
        secure: process.env.NODE_ENV === "production", // Cookie is sent only over HTTPS in production
        sameSite: "strict", // Cookie is sent only with same-site requests to prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry time in milliseconds (7 days)
    });

    // Return the generated token
    return token;
};
