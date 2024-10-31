// Import jsonwebtoken (jwt) library for handling JWT verification
import jwt from "jsonwebtoken";

// Define verifyToken middleware to authenticate requests
export const verifyToken = (req, res, next) => {
    // Retrieve the token from cookies (usually set as 'token')
    const token = req.cookies.token;

    // If no token is present in cookies, send a 401 response (Unauthorized)
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    }

    try {
        // Verify the token using jwt.verify with the secret key from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If decoding fails (unlikely as jwt.verify throws an error on failure), send a 401 response
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
        }

        // Attach the user ID from the decoded token to the request object for use in subsequent handlers
        req.userId = decoded.userId;

        // Call next to proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Log any errors encountered for debugging on the server
        console.log("Error in verifyToken:", error);

        // Send a 400 response if an error occurs, with a general error message
        return res.status(400).json({ success: false, message: "Server Error" });
    }
};
