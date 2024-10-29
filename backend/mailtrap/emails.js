import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrapConfig.js";

export const sendVerificationEmail = async (email , verificationToken) => {
    const recipent = [{email}];

    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipent,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Email sent sucessfully" , response);
        

    } catch (error) {
        console.error("Error sending verification" , error);
        
        throw new Error(`Error sending verification email: ${error}`);
    }
}

export const sendWelcomeEmail = async (email , name) => {
    
}