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
    const recipent = [{email}];

    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipent,
            template_uuid: "830bad83-c81b-4951-8182-ad14a14448b4",
            template_variables: {
                "company_info_name": "NorPeK authentication",
                "name": name,
            }
        })

        console.log("Welcome Email sent sucessfully" , response)
        
    } catch (error) {
        console.error(`Error sending welcome email` , error);
        throw new Error(`Error sending welcome email: ${Error}`);
    }
}