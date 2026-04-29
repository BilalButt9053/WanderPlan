const Business = require("../modals/business-modal");
const nodemailer = require("nodemailer");
const EmailVerificationToken = require("../modals/EmailVerificationToken");

const BUSINESS_TYPES = ['hotel', 'restaurant', 'tour', 'activity', 'attraction', 'transport', 'other'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s().-]{7,20}$/;

class MailDeliveryError extends Error {
    constructor(message = "Verification email could not be sent right now. Please try again later.") {
        super(message);
        this.name = "MailDeliveryError";
        this.status = 503;
    }
}

// Generate OTP
const generateOTP = () => {
    let OTP = "";
    for (let i = 0; i < 6; i++) {
        const randomValue = Math.round(Math.random() * 9);
        OTP += randomValue;
    }
    return OTP;
};

const isEmailDevMode = () => process.env.EMAIL_DEV_MODE === "true";

const getMailConfig = () => {
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = process.env.SMTP_SECURE === "true";

    return {
        host: process.env.SMTP_HOST,
        port,
        secure,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
    };
};

const createMailTransport = () => {
    const config = getMailConfig();

    if (!config.host || !config.user || !config.pass || !config.from) {
        throw new MailDeliveryError();
    }

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });
};

const sendBusinessEmail = async ({ to, subject, html }) => {
    if (isEmailDevMode()) {
        console.log('[business-auth] EMAIL_DEV_MODE=true, skipped email send', { to, subject });
        return { devMode: true };
    }

    const config = getMailConfig();
    const transport = createMailTransport();

    return transport.sendMail({
        from: config.from,
        to,
        subject,
        html,
    });
};

const logMailError = (context, err) => {
    console.error(`[business-auth] ${context}`, {
        name: err?.name,
        code: err?.code,
        command: err?.command,
        responseCode: err?.responseCode,
        message: err?.message,
    });
};

// Send OTP Email
const sendOTPEmail = async (email, OTP, businessName) => {
    if (isEmailDevMode()) {
        console.log('[business-auth] EMAIL_DEV_MODE OTP for local testing', {
            email,
            businessName,
            otp: OTP,
        });
        return { devMode: true };
    }

    try {
        const info = await sendBusinessEmail({
            to: email,
            subject: "Email Verification - WanderPlan Business",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to WanderPlan Business, ${businessName}!</h2>
                    <p>Thank you for registering your business. Please verify your email address using the OTP below:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #4CAF50; font-size: 32px; margin: 0;">${OTP}</h1>
                    </div>
                    <p style="color: #666;">This code will expire in 1 hour.</p>
                    <p style="color: #999; font-size: 12px;">Note: Your business account will be pending admin approval after email verification.</p>
                    <p style="color: #666;">If you didn't create an account, please ignore this email.</p>
                </div>
            `,
        });

        console.log('[business-auth] OTP email sent to business', { to: email, messageId: info && info.messageId });
        return info;
    } catch (err) {
        logMailError('Error sending OTP email', err);
        throw new MailDeliveryError();
    }
};

// Send approval notification email
const sendApprovalEmail = async (email, businessName, status, reason = null) => {
    const isApproved = status === 'approved';
    const subject = isApproved ? 'Business Approved - WanderPlan' : 'Business Application Update - WanderPlan';
    
    const html = isApproved ? `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Congratulations, ${businessName}!</h2>
            <p>Your business has been approved by our admin team.</p>
            <p>You can now access all features of the WanderPlan Business Dashboard.</p>
            <div style="margin: 30px 0;">
                <a href="${process.env.BUSINESS_DASHBOARD_URL || 'http://localhost:5174'}/login" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Login to Dashboard
                </a>
            </div>
            <p style="color: #666;">Thank you for choosing WanderPlan!</p>
        </div>
    ` : `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f44336;">Business Application Update</h2>
            <p>Dear ${businessName},</p>
            <p>We regret to inform you that your business application has been ${status}.</p>
            ${reason ? `<p style="background-color: #fff3cd; padding: 15px; border-radius: 5px;"><strong>Reason:</strong> ${reason}</p>` : ''}
            <p style="color: #666;">If you have any questions, please contact our support team.</p>
        </div>
    `;

    try {
        const info = await sendBusinessEmail({
            to: email,
            subject: subject,
            html: html,
        });

        console.log('[business-auth] Approval email sent', { to: email, status });
        return info;
    } catch (err) {
        logMailError('Error sending approval email', err);
        throw new MailDeliveryError("Notification email could not be sent right now.");
    }
};

const normalizeString = (value) => typeof value === 'string' ? value.trim() : '';

const isValidUrl = (value) => {
    if (!value) return true;

    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_error) {
        return false;
    }
};

const validateBusinessRegistration = (body = {}) => {
    const errors = [];
    const address = body.address && typeof body.address === 'object' ? body.address : {};
    const documents = Array.isArray(body.documents) ? body.documents : [];
    const normalized = {
        ownerName: normalizeString(body.ownerName),
        businessName: normalizeString(body.businessName),
        email: normalizeString(body.email).toLowerCase(),
        password: typeof body.password === 'string' ? body.password : '',
        phone: normalizeString(body.phone),
        businessType: normalizeString(body.businessType),
        description: normalizeString(body.description),
        website: normalizeString(body.website),
        logo: body.logo || null,
        galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
        documents,
        address: {
            street: normalizeString(address.street),
            city: normalizeString(address.city),
            state: normalizeString(address.state),
            zipCode: normalizeString(address.zipCode),
            country: normalizeString(address.country),
        },
    };

    if (normalized.ownerName.length < 2) errors.push("Owner name must be at least 2 characters.");
    if (normalized.businessName.length < 2) errors.push("Business name must be at least 2 characters.");
    if (!EMAIL_REGEX.test(normalized.email)) errors.push("Please enter a valid email address.");
    if (normalized.password.length < 8) errors.push("Password must be at least 8 characters.");
    if (!PHONE_REGEX.test(normalized.phone)) errors.push("Please enter a valid phone number.");
    if (!BUSINESS_TYPES.includes(normalized.businessType)) errors.push("Please select a valid business category.");
    if (normalized.description.length < 10) errors.push("Description must be at least 10 characters.");
    if (!normalized.address.street) errors.push("Street address is required.");
    if (!normalized.address.city) errors.push("City is required.");
    if (!normalized.address.country) errors.push("Country is required.");
    if (!isValidUrl(normalized.website)) errors.push("Please enter a valid website URL.");
    if (!documents.some((doc) => doc?.type === 'license' && doc?.url && !String(doc.url).startsWith('blob:'))) {
        errors.push("Business license document is required.");
    }

    return { errors, normalized };
};

const validateBusinessLogin = (body = {}) => {
    const normalized = {
        email: normalizeString(body.email).toLowerCase(),
        password: typeof body.password === 'string' ? body.password : '',
    };
    const errors = [];

    if (!EMAIL_REGEX.test(normalized.email)) errors.push("Please enter a valid email address.");
    if (!normalized.password) errors.push("Password is required.");

    return { errors, normalized };
};

// Business Registration
const registerBusiness = async (req, res, next) => {
    try {
        const { errors, normalized } = validateBusinessRegistration(req.body);

        if (errors.length) {
            return res.status(400).json({ message: errors[0], errors });
        }

        const { 
            businessName, 
            ownerName, 
            email, 
            password, 
            phone, 
            businessType, 
            address,
            description,
            website,
            logo,
            galleryImages,
            documents
        } = normalized;

        // Check if business already exists
        const businessExist = await Business.findOne({ email });

        if (businessExist) {
            if (!businessExist.isVerified) {
                // Delete old unverified business and their tokens
                await EmailVerificationToken.deleteMany({ owner: businessExist._id });
                await Business.deleteOne({ _id: businessExist._id });
                console.log('[business-auth] Deleted unverified business for re-registration');
            } else {
                return res.status(400).json({ message: "Business email already exists" });
            }
        }

        // Create new business with all data
        const businessCreated = await Business.create({
            businessName,
            ownerName,
            email,
            password,
            phone,
            businessType,
            address,
            description,
            website,
            logo: logo || null,
            galleryImages: galleryImages || [],
            documents: documents || [],
            status: 'pending',
            isVerified: false
        });

        // Generate and send OTP
        const OTP = generateOTP();

        // Delete any existing tokens for this business
        await EmailVerificationToken.deleteMany({ owner: businessCreated._id });

        // Save OTP to database
        const emailVerificationToken = new EmailVerificationToken({
            owner: businessCreated._id,
            token: OTP,
        });
        await emailVerificationToken.save();

        // Send OTP via email
        await sendOTPEmail(email, OTP, businessName);

        res.status(201).json({
            message: "Business registered successfully. Please verify your email with the OTP sent.",
            businessId: businessCreated._id,
            email: businessCreated.email,
            status: businessCreated.status
        });

    } catch (error) {
        console.error('[business-auth] Registration error', error);
        next(error);
    }
};

// Business Login
const loginBusiness = async (req, res, next) => {
    try {
        const { errors, normalized } = validateBusinessLogin(req.body);

        if (errors.length) {
            return res.status(400).json({ message: errors[0], errors });
        }

        const { email, password } = normalized;

        const business = await Business.findOne({ email });

        if (!business) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!business.isVerified) {
            return res.status(403).json({ 
                message: "Please verify your email first",
                businessId: business._id
            });
        }

        const isPasswordValid = await business.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check business status
        if (business.status === 'pending') {
            return res.status(403).json({ 
                message: "Your business is pending admin approval. You will be notified once approved.",
                status: 'pending'
            });
        }

        if (business.status === 'rejected') {
            return res.status(403).json({ 
                message: "Your business application was rejected. Please contact support for more information.",
                status: 'rejected',
                reason: business.rejectionReason
            });
        }

        if (business.status === 'suspended') {
            return res.status(403).json({ 
                message: "Your business account has been suspended. Please contact support.",
                status: 'suspended'
            });
        }

        // Generate token only if approved
        const token = await business.generateToken();

        res.status(200).json({
            message: "Login successful",
            token: token,
            business: {
                _id: business._id,
                businessName: business.businessName,
                ownerName: business.ownerName,
                email: business.email,
                phone: business.phone,
                businessType: business.businessType,
                status: business.status,
                logo: business.logo,
                subscription: business.subscription
            }
        });

    } catch (error) {
        console.error('[business-auth] Login error', error);
        next(error);
    }
};

// Get Business Profile
const getBusinessProfile = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;

        const business = await Business.findById(businessId).select('-password');

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json(business);

    } catch (error) {
        console.error('[business-auth] Get profile error', error);
        next(error);
    }
};

// Update Business Profile
const updateBusinessProfile = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const updates = req.body;

        // Fields that can be updated
        const allowedUpdates = [
            'businessName',
            'description',
            'phone',
            'website',
            'businessType',
            'address',
            'logo',
            'galleryImages',
            'operatingHours'
        ];

        // Filter only allowed fields
        const filteredUpdates = {};
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        const business = await Business.findByIdAndUpdate(
            businessId,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            business
        });

    } catch (error) {
        console.error('[business-auth] Update profile error', error);
        next(error);
    }
};

// Verify Business Email
const verifyBusinessEmail = async (req, res, next) => {
    try {
        const { businessId, otp } = req.body;

        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        if (business.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const token = await EmailVerificationToken.findOne({ owner: businessId });

        if (!token) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }

        const isMatched = await token.compareToken(otp);

        if (!isMatched) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Mark as verified
        business.isVerified = true;
        await business.save();

        // Delete the token
        await EmailVerificationToken.deleteOne({ _id: token._id });

        res.status(200).json({
            message: "Email verified successfully. Your business is now pending admin approval.",
            status: business.status
        });

    } catch (error) {
        console.error('[business-auth] Email verification error', error);
        next(error);
    }
};

// Change Password
const changePassword = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        const isPasswordValid = await business.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        business.password = newPassword;
        await business.save();

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error('[business-auth] Change password error', error);
        next(error);
    }
};

// Update Notification Settings
const updateNotificationSettings = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { notifications } = req.body;

        const business = await Business.findByIdAndUpdate(
            businessId,
            { 
                $set: { 
                    'settings.notifications': notifications,
                    updatedAt: Date.now()
                } 
            },
            { new: true }
        ).select('-password');

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json({
            message: "Notification settings updated successfully",
            settings: business.settings
        });

    } catch (error) {
        console.error('[business-auth] Update notification settings error', error);
        next(error);
    }
};

module.exports = {
    registerBusiness,
    loginBusiness,
    getBusinessProfile,
    updateBusinessProfile,
    verifyBusinessEmail,
    sendApprovalEmail,
    changePassword,
    updateNotificationSettings
};
