import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"; // Import the email template for verification emails
import { mailtrapClient, sender } from "./mailtrapConfig.js"; // Import Mailtrap client and sender information


export const sendVerificationEmail = async (email, verificationToken) => {
    const recipent = [{ email }]; // Set up the recipient list with the user's email address

    try {
        // Use the Mailtrap client to send an email
        const response = await mailtrapClient.send({
            from: sender, // The sender's information (configured in mailtrapConfig.js)
            to: recipent, // Recipient email address array
            subject: "Verify your email", // Email subject line
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken), // Insert verification token into the email template
            category: "Email Verification" // Category for email tracking or filtering purposes
        });

        console.log("Email sent successfully", response); // Log successful email response

    } catch (error) {
        // Log error details and rethrow an error for further handling
        console.error("Error sending verification", error);
        throw new Error(`Error sending verification email: ${error}`);
    }
};


export const sendWelcomeEmail = async (email, name) => {
    const recipent = [{ email }]; // Set up recipient list with user's email

    try {
        // Send the welcome email using Mailtrap's client with a pre-defined template
        const response = await mailtrapClient.send({
            from: sender, // The sender's information
            to: recipent, // Recipient email address array
            template_uuid: "830bad83-c81b-4951-8182-ad14a14448b4", // Unique ID for Mailtrap's welcome email template
            template_variables: {
                "company_info_name": "NorPeK authentication", // Custom variable for company name
                "name": name, // Custom variable for user name
            }
        });

        console.log("Welcome Email sent successfully", response); // Log successful email response

    } catch (error) {
        // Log error details and rethrow a custom error
        console.error(`Error sending welcome email`, error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
};
