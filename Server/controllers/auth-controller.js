const Signup = require("../modals/user-modals");
const nodemailer = require("nodemailer");
const EmailVerificationToken = require("../modals/EmailVerificationToken");

// Generate OTP
const generateOTP = () => {
    let OTP = "";
    for (let i = 0; i < 6; i++) {
        const randomValue = Math.round(Math.random() * 9);
        OTP += randomValue;
    }
    return OTP;
};

// Send OTP Email
const sendOTPEmail = async (email, OTP) => {
    // Use environment-configured SMTP (falls back to Mailtrap test credentials)
    const host = process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io";
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 2525;
    const user = process.env.SMTP_USER || "02c0b2df6efaeb";
    const pass = process.env.SMTP_PASS || "6e297ec4cd36c6";
    const secure = process.env.SMTP_SECURE === "true" ? true : port === 465;

    const transport = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    try {
        await transport.verify();
        console.log('[auth-controller] Email transport verified for register', { host, port, secure, user: user && (user.length > 0 ? 'set' : 'not-set') });

        const info = await transport.sendMail({
            from: "WanderPlan@example.com",
            to: email,
            subject: "Email Verification - WanderPlan",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to WanderPlan!</h2>
                    <p>Thank you for registering. Please verify your email address using the OTP below:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #4CAF50; font-size: 32px; margin: 0;">${OTP}</h1>
                    </div>
                    <p style="color: #666;">This code will expire in 1 hour.</p>
                    <p style="color: #666;">If you didn't create an account, please ignore this email.</p>
                </div>
            `,
        });

        console.log('[auth-controller] OTP email sent', { to: email, messageId: info && info.messageId });
        return info;
    } catch (err) {
        console.error('[auth-controller] Error sending OTP email', err);
        throw err;
    }
};

const register = async(req,res,next)=>{
    try{
        console.log(req.body);
        const {fullName,email,password}=req.body
       
       const userExist =await Signup.findOne({email });

       if(userExist){
        // If user exists but is not verified, allow re-registration
        if(!userExist.isVerified){
            // Delete old unverified user and their tokens
            await EmailVerificationToken.deleteMany({ owner: userExist._id });
            await Signup.deleteOne({ _id: userExist._id });
            console.log('Deleted unverified user for re-registration');
        } else {
            return res.status(400).json({message:"email already exists"});
        }
       }
       
       const UserCreated =await Signup.create({
        fullName,
        email,
        password
        });

       // Generate and send OTP automatically
       const OTP = generateOTP();
       
       // Delete any existing tokens for this user
       await EmailVerificationToken.deleteMany({ owner: UserCreated._id });

       // Save OTP to database
       const emailVerificationToken = new EmailVerificationToken({
           owner: UserCreated._id,
           token: OTP,
       });
       await emailVerificationToken.save();

       // Send OTP via email
       await sendOTPEmail(email, OTP);

       res.status(200).json({
        msg:"Registration successful! Please check your email for verification OTP",
        requiresVerification: true,
        email: email
    });
    }catch(error){
        // res.status(500).json("internal server error", error);
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        console.log("login", req.body);
        
        const { email, password } = req.body;
        
        // Check if the user exists
        const userExist = await Signup.findOne({ email });
        console.log("userExist", userExist);

        if (!userExist) {
            // User does not exist, send error response
            return res.status(400).json({ message: "Invalid Credential" });
        }

        // Check if the password matches
        const match = await userExist.comparePassword(password);
        console.log("match", match);

        if (match) {
            // Check if email is verified
            if (!userExist.isVerified) {
                // Generate and send OTP for unverified users
                const OTP = generateOTP();
                
                // Delete any existing tokens
                await EmailVerificationToken.deleteMany({ owner: userExist._id });
                
                // Save OTP to database
                const emailVerificationToken = new EmailVerificationToken({
                    owner: userExist._id,
                    token: OTP,
                });
                await emailVerificationToken.save();
                
                // Send OTP via email
                try {
                    await sendOTPEmail(email, OTP);
                } catch (emailError) {
                    console.error('[auth-controller] Failed to send OTP email:', emailError.message);
                }
                
                return res.status(403).json({
                    message: "Please verify your email before logging in. OTP sent to your email.",
                    requiresVerification: true,
                    email: userExist.email
                });
            }

            // For verified users, also send OTP for login verification
            const OTP = generateOTP();
            console.log('[auth-controller] Generated login OTP:', OTP);
            
            // Delete any existing tokens
            await EmailVerificationToken.deleteMany({ owner: userExist._id });
            
            // Save OTP to database
            const loginOtpToken = new EmailVerificationToken({
                owner: userExist._id,
                token: OTP,
            });
            await loginOtpToken.save();
            
            // Send OTP via email (with error handling)
            try {
                await sendOTPEmail(email, OTP);
                console.log('[auth-controller] Login OTP sent successfully');
            } catch (emailError) {
                console.error('[auth-controller] Failed to send login OTP email:', emailError.message);
                // Continue anyway - OTP is saved in database
            }

            // Return response requiring OTP verification
            return res.status(200).json({
                msg: "OTP sent to your email for login verification",
                requiresLoginOtp: true,
                email: userExist.email,
            });
        } else {
            // Password does not match, send error response
            return res.status(400).json({ message: "Invalid Credential" });
        }

    } catch (error) {
        // Catch any other errors and send a 500 response
        console.error("Login error:", error);
        res.status(500).json("internal server error");
        next(error); // Make sure this is the last thing called in the catch block
    }
};


const user = async (req, res,next) => {
    try {
        const userData = req.user;
        res.status(200).json({ userData });
    } catch (error) {
        // console.log(`error from the user route ${error}`);
        // res.status(500).json({ message: "Internal server error" });
        next(error)
    }
};

// Forgot Password - Send Reset OTP
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const userExist = await Signup.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        // Generate OTP for password reset
        const OTP = generateOTP();

        // Delete any existing tokens for this user
        await EmailVerificationToken.deleteMany({ owner: userExist._id });

        // Save OTP to database
        const resetToken = new EmailVerificationToken({
            owner: userExist._id,
            token: OTP,
        });
        await resetToken.save();

        // Send reset OTP via email
        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 2525,
            secure: process.env.SMTP_SECURE === "true" ? true : false,
            auth: {
                user: process.env.SMTP_USER || "02c0b2df6efaeb",
                pass: process.env.SMTP_PASS || "6e297ec4cd36c6",
            },
        });

        await transport.sendMail({
            from: "WanderPlan@example.com",
            to: email,
            subject: "Password Reset - WanderPlan",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested to reset your password. Use the OTP below to proceed:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #FF5722; font-size: 32px; margin: 0;">${OTP}</h1>
                    </div>
                    <p style="color: #666;">This code will expire in 1 hour.</p>
                    <p style="color: #666;">If you didn't request a password reset, please ignore this email.</p>
                </div>
            `,
        });

        res.status(200).json({
            message: "Password reset OTP sent to your email",
            success: true,
            email: email
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        next(error);
    }
};

// Reset Password - Verify OTP and Update Password
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ 
                message: "Email and new password are required" 
            });
        }

        const userExist = await Signup.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // If OTP is provided, verify it
        if (otp) {
            // Find the reset token
            const token = await EmailVerificationToken.findOne({ owner: userExist._id });

            if (!token) {
                return res.status(400).json({ 
                    message: "Invalid or expired OTP. Please request a new one." 
                });
            }

            // Verify OTP
            const isValid = await token.compareToken(otp);

            if (!isValid) {
                return res.status(400).json({ message: "Invalid OTP" });
            }

            // Delete the used token
            await EmailVerificationToken.deleteOne({ _id: token._id });
        }

        // Update password
        userExist.password = newPassword;
        await userExist.save();

        res.status(200).json({
            message: "Password reset successful. You can now login with your new password.",
            success: true
        });
    } catch (error) {
        console.error("Reset password error:", error);
        next(error);
    }
};

// Social Login - Google/Facebook
const socialLogin = async (req, res, next) => {
    try {
        const { email, fullName, profilePhoto, provider, providerId, accessToken } = req.body;

        if (!email || !provider || !providerId) {
            return res.status(400).json({ 
                message: "Email, provider, and providerId are required" 
            });
        }

        // Check if user already exists
        let user = await Signup.findOne({ email });

        if (user) {
            // Update social login info if not already set
            if (!user.socialLogins) {
                user.socialLogins = [];
            }

            const existingSocial = user.socialLogins.find(s => s.provider === provider);
            
            if (!existingSocial) {
                user.socialLogins.push({
                    provider,
                    providerId,
                    connectedAt: new Date()
                });
            }

            // Update profile photo if provided and user doesn't have one
            if (profilePhoto && !user.profilePhoto) {
                user.profilePhoto = profilePhoto;
            }

            // Mark as verified since social login confirms email
            user.isVerified = true;
            await user.save();
        } else {
            // Create new user with social login
            user = await Signup.create({
                fullName: fullName || email.split('@')[0],
                email,
                password: Math.random().toString(36).slice(-12) + "!" + Math.random().toString(36).slice(-12).toUpperCase(), // Random secure password
                profilePhoto,
                isVerified: true, // Social login confirms email
                socialLogins: [{
                    provider,
                    providerId,
                    connectedAt: new Date()
                }]
            });
        }

        // Generate JWT token
        const token = await user.jwtToken();

        res.status(200).json({
            message: "Social login successful",
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePhoto: user.profilePhoto,
                isVerified: user.isVerified,
            },
            token
        });
    } catch (error) {
        console.error("Social login error:", error);
        next(error);
    }
};

module.exports={register,login,user,forgotPassword,resetPassword,socialLogin}; 
