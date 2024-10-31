import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailVerificationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const isLoading = false;

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("Text").slice(0, 6); // Get only the first 6 characters
        if (pasteData.length === 6) {
            const newCode = pasteData.split("");
            setCode(newCode);

            // Focus on the last input after pasting
            inputRefs.current[5].focus();
        }
        e.preventDefault(); // Prevent the default paste behavior
    };

    const handleChange = (index, value) => {
        const newCode = [...code];
        newCode[index] = value.slice(0, 1); // Ensure only one character is added
        setCode(newCode);

        // Move focus to the next input if the current input is filled
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        console.log(`Verification code submitted: ${verificationCode}`);
        // Add navigation or verification logic here
    };

    // Auto-submit when all fields are filled
    useEffect(() => {
        if (code.every((digit) => digit)) {
            handleSubmit(new Event("submit"));
        }
    }, [code]);

    return (
        <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Verify Your Email
                </h2>
                <p className="text-center text-gray-300 mb-6">
                    Enter the 6-digit code sent to your email address
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste} // Handle paste event here
                                className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                            />
                        ))}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading || code.some((digit) => !digit)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                    >
                        {isLoading ? "Verifying..." : "Verify Email"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default EmailVerificationPage;
