# Business Module Implementation Plan - WanderPlan

## 📋 Current Issues Identified

### 1. **Authentication Flow Problems**
- ✗ Signup asks for business name and email twice (signup + onboarding step 1)
- ✗ OTP is sent immediately after registration (before onboarding completion)
- ✗ User should complete onboarding BEFORE OTP verification
- ✗ Profile page shows hardcoded/empty data instead of real business data

### 2. **Missing Features**
- ✗ No Cloudinary integration for media uploads (logo, gallery images, documents)
- ✗ Profile page not connected to real business data from Redux store
- ✗ No API to update business profile after onboarding
- ✗ Onboarding data not being saved to backend

### 3. **Data Flow Issues**
- ✗ Signup collects: businessName, firstName, lastName, email, password
- ✗ Onboarding Step 1 asks again for: businessName, description, phone, website, contactEmail
- ✗ No connection between signup data and onboarding data

---

## 🎯 Implementation Roadmap

### **PHASE 1: Fix Authentication Flow** ⭐ (Priority 1)

#### Task 1.1: Restructure Signup Process
**File: `/BusinessDashboard/src/pages/signup.jsx`**

**Changes:**
```javascript
// CURRENT FLOW:
Signup (businessName, firstName, lastName, email, password) 
  → Register API Call
  → OTP Sent ✗ 
  → Navigate to Onboarding

// NEW FLOW:
Signup (ownerName, email, password ONLY)
  → Store in Redux (NO API call yet)
  → Navigate to Onboarding
  → Complete ALL 5 steps
  → Click "Complete Registration"
  → Register API Call (with all onboarding data)
  → OTP Sent ✓
  → Navigate to Verify Email page
```

**Implementation Steps:**
1. Simplify signup form to only: Owner Name, Email, Password
2. Remove API call from signup
3. Store data temporarily in Redux (`businessAuthSlice`)
4. Navigate directly to onboarding

#### Task 1.2: Modify Onboarding Flow
**Files:**
- `/BusinessDashboard/src/pages/onboarding.jsx`
- `/BusinessDashboard/src/components/onboarding/step-*.jsx`

**Changes:**
1. **Step 1** - Business Info (businessName, description, phone, website)
2. **Step 2** - Logo & Gallery (with Cloudinary upload)
3. **Step 3** - Category selection
4. **Step 4** - Location details
5. **Step 5** - Documents upload (license, permits)
6. **Final Step** - Submit all data to `/business/register` API

#### Task 1.3: Update Backend Registration
**File: `/Server/controllers/business-auth-controller.js`**

**Changes:**
```javascript
// Add new fields to registration:
- logo (URL from Cloudinary)
- galleryImages (array of URLs)
- documents (array with type and URL)
- website, description, address details
```

---

### **PHASE 2: Implement Cloudinary Integration** ⭐ (Priority 1)

#### Task 2.1: Setup Cloudinary
**File: `/Server/package.json`**
```bash
npm install cloudinary multer-storage-cloudinary
```

#### Task 2.2: Create Cloudinary Configuration
**File: `/Server/config/cloudinary.js`** (NEW FILE)
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

#### Task 2.3: Create Upload Middleware
**File: `/Server/middleware/cloudinary-upload.js`** (NEW FILE)
```javascript
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// For business logos
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderplan/business/logos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }]
  }
});

// For gallery images
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderplan/business/gallery',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

// For documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderplan/business/documents',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
  }
});

module.exports = {
  uploadLogo: multer({ storage: logoStorage }),
  uploadGallery: multer({ storage: galleryStorage }),
  uploadDocument: multer({ storage: documentStorage })
};
```

#### Task 2.4: Create Upload Routes
**File: `/Server/router/business-upload-router.js`** (NEW FILE)
```javascript
const express = require('express');
const router = express.Router();
const { uploadLogo, uploadGallery, uploadDocument } = require('../middleware/cloudinary-upload');
const businessAuthMiddleware = require('../middleware/business-auth-middleware');

// Upload logo
router.post('/logo', uploadLogo.single('logo'), (req, res) => {
  res.json({ url: req.file.path, publicId: req.file.filename });
});

// Upload gallery images (multiple)
router.post('/gallery', uploadGallery.array('images', 10), (req, res) => {
  const urls = req.files.map(file => ({ url: file.path, publicId: file.filename }));
  res.json({ images: urls });
});

// Upload document
router.post('/document', uploadDocument.single('document'), (req, res) => {
  res.json({ url: req.file.path, publicId: req.file.filename });
});

module.exports = router;
```

#### Task 2.5: Update Server Index
**File: `/Server/index.js`**
```javascript
const businessUploadRoute = require("./router/business-upload-router");
app.use("/api/business/upload", businessUploadRoute);
```

#### Task 2.6: Frontend Upload Component
**File: `/BusinessDashboard/src/components/onboarding/image-upload.jsx`** (NEW FILE)
```javascript
import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImageUpload({ onUploadComplete, type = 'logo', multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    
    if (multiple) {
      Array.from(files).forEach(file => formData.append('images', file));
    } else {
      formData.append(type, files[0]);
    }

    try {
      const endpoint = multiple ? '/gallery' : `/${type}`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/business/upload${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onUploadComplete(data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload {multiple ? 'images' : 'image'}
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          multiple={multiple}
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
```

---

### **PHASE 3: Fix Profile Page** ⭐ (Priority 2)

#### Task 3.1: Connect Profile to Real Data
**File: `/BusinessDashboard/src/components/profile/profile-info.jsx`**

**Changes:**
```javascript
import { useSelector } from 'react-redux';
import { selectCurrentBusiness } from '@/redux/slices/businessAuthSlice';

export default function ProfileInfo() {
  const business = useSelector(selectCurrentBusiness);
  
  // Use real data from Redux store
  const businessName = business?.businessName || '';
  const description = business?.description || '';
  const email = business?.email || '';
  const phone = business?.phone || '';
  const website = business?.website || '';
  
  // Add edit functionality
  const handleUpdate = async (updatedData) => {
    // Call update API
  };
  
  return (
    // Display real data with edit capability
  );
}
```

#### Task 3.2: Create Update Profile API
**File: `/Server/controllers/business-auth-controller.js`**

Add new endpoint:
```javascript
const updateBusinessProfile = async (req, res, next) => {
  try {
    const businessId = req.business._id;
    const updates = req.body;
    
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Profile updated successfully',
      business: updatedBusiness
    });
  } catch (error) {
    next(error);
  }
};
```

**File: `/Server/router/business-auth-router.js`**
```javascript
router.route("/profile")
  .get(businessAuthMiddleware, businessAuthController.getBusinessProfile)
  .put(businessAuthMiddleware, businessAuthController.updateBusinessProfile); // NEW
```

---

### **PHASE 4: Backend API Enhancements** ⭐ (Priority 2)

#### Task 4.1: Update Business Schema
**File: `/Server/modals/business-modal.js`**

Add new fields:
```javascript
website: {
  type: String,
  default: ''
},
galleryImages: [{
  url: String,
  publicId: String,
  uploadedAt: { type: Date, default: Date.now }
}],
socialMedia: {
  facebook: String,
  instagram: String,
  twitter: String
},
businessHours: {
  monday: { open: String, close: String, isClosed: Boolean },
  tuesday: { open: String, close: String, isClosed: Boolean },
  // ... other days
},
amenities: [String],
priceRange: {
  type: String,
  enum: ['$', '$$', '$$$', '$$$$']
}
```

#### Task 4.2: Add Resend OTP Endpoint
**File: `/Server/controllers/business-auth-controller.js`**
```javascript
const resendOTP = async (req, res, next) => {
  try {
    const { businessId } = req.body;
    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    if (business.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Generate new OTP
    const OTP = generateOTP();
    
    // Delete old tokens
    await EmailVerificationToken.deleteMany({ owner: businessId });
    
    // Save new OTP
    const emailVerificationToken = new EmailVerificationToken({
      owner: businessId,
      token: OTP,
    });
    await emailVerificationToken.save();
    
    // Send email
    await sendOTPEmail(business.email, OTP, business.businessName);
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};
```

---

## 🔄 Updated Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS REGISTRATION                   │
└─────────────────────────────────────────────────────────────┘

Step 1: Signup Page
├── Input: Owner Name, Email, Password
├── Action: Store in Redux (NO API call)
└── Navigate: → Onboarding

Step 2: Onboarding (5 Steps)
├── Step 1: Business Info
│   ├── Business Name
│   ├── Description
│   ├── Phone
│   └── Website
│
├── Step 2: Media Upload
│   ├── Logo (Cloudinary)
│   └── Gallery Images (Cloudinary)
│
├── Step 3: Category
│   └── Select business type
│
├── Step 4: Location
│   ├── Address
│   ├── City, State, ZIP
│   └── Country
│
└── Step 5: Documents
    ├── Business License (Cloudinary)
    └── Proof of Address (Cloudinary)

Step 3: Complete Registration
├── Collect all data (signup + onboarding)
├── POST /api/business/register
├── Backend: Create business record
├── Backend: Generate & save OTP
├── Backend: Send OTP email
└── Navigate: → Verify Email

Step 4: Email Verification
├── Input: 6-digit OTP
├── POST /api/business/verify-email
├── Backend: Verify OTP
├── Backend: Set isVerified = true
├── Backend: Keep status = 'pending' (awaits admin approval)
└── Navigate: → Login

Step 5: Login (After Email Verification)
├── Input: Email, Password
├── POST /api/business/login
├── Backend: Check if verified AND approved
│   ├── If verified + approved → Return token
│   ├── If verified + pending → Show "Awaiting approval" message
│   └── If verified + rejected → Show rejection reason
└── Navigate: → Dashboard (if approved)
```

---

## 📝 File Changes Summary

### **New Files to Create:**
1. `/Server/config/cloudinary.js` - Cloudinary configuration
2. `/Server/middleware/cloudinary-upload.js` - Upload middleware
3. `/Server/router/business-upload-router.js` - Upload routes
4. `/BusinessDashboard/src/components/onboarding/image-upload.jsx` - Upload component
5. `/BusinessDashboard/src/redux/slices/onboardingSlice.js` - Temporary onboarding data storage

### **Files to Modify:**

#### Frontend:
1. `/BusinessDashboard/src/pages/signup.jsx` - Simplify form, remove API call
2. `/BusinessDashboard/src/pages/onboarding.jsx` - Add API call at the end
3. `/BusinessDashboard/src/components/onboarding/step-one.jsx` - Remove duplicate fields
4. `/BusinessDashboard/src/components/onboarding/step-two.jsx` - Add Cloudinary upload
5. `/BusinessDashboard/src/components/onboarding/step-five.jsx` - Add document upload
6. `/BusinessDashboard/src/components/profile/profile-info.jsx` - Connect to real data
7. `/BusinessDashboard/src/components/profile/profile-gallery.jsx` - Connect to real data
8. `/BusinessDashboard/src/components/profile/profile-location.jsx` - Connect to real data
9. `/BusinessDashboard/src/redux/api/businessApi.js` - Add update profile endpoint
10. `/BusinessDashboard/src/redux/slices/businessAuthSlice.js` - Add temp storage actions

#### Backend:
1. `/Server/index.js` - Add business upload route
2. `/Server/modals/business-modal.js` - Add new fields
3. `/Server/controllers/business-auth-controller.js` - Update registration logic
4. `/Server/router/business-auth-router.js` - Add update/resend OTP routes
5. `/Server/package.json` - Add cloudinary dependency
6. `/Server/.env` - Add Cloudinary credentials

---

## 🎬 Implementation Priority Order

### **Week 1: Core Flow Fix**
- [ ] Task 1.1: Restructure signup (remove API call)
- [ ] Task 1.2: Modify onboarding to call API at end
- [ ] Task 1.3: Update backend registration to accept all fields
- [ ] Task 4.1: Update business schema with new fields

### **Week 2: Cloudinary Integration**
- [ ] Task 2.1: Install Cloudinary packages
- [ ] Task 2.2: Setup Cloudinary config
- [ ] Task 2.3: Create upload middleware
- [ ] Task 2.4: Create upload routes
- [ ] Task 2.5: Update server index
- [ ] Task 2.6: Create frontend upload component
- [ ] Integrate uploads into onboarding steps

### **Week 3: Profile Page**
- [ ] Task 3.1: Connect profile to real data
- [ ] Task 3.2: Create update profile API
- [ ] Task 4.2: Add resend OTP functionality
- [ ] Add edit functionality to all profile sections

### **Week 4: Testing & Polish**
- [ ] Test complete registration flow
- [ ] Test image uploads
- [ ] Test profile updates
- [ ] Test OTP verification
- [ ] Test admin approval flow
- [ ] Fix bugs and edge cases
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success messages

---

## ⚙️ Environment Variables Needed

Add to `/Server/.env`:
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Business Dashboard URL (for email links)
BUSINESS_DASHBOARD_URL=http://localhost:5174
```

---

## 🧪 Testing Checklist

### Registration Flow:
- [ ] Can fill signup form with owner name, email, password
- [ ] Form data is stored in Redux
- [ ] Navigates to onboarding without API call
- [ ] Can complete all 5 onboarding steps
- [ ] Can upload logo and gallery images
- [ ] Can upload documents
- [ ] Final submit calls API with all data
- [ ] OTP email is received
- [ ] Can verify email with OTP
- [ ] Cannot login before email verification
- [ ] Cannot access dashboard before admin approval

### Profile Page:
- [ ] Shows real business data
- [ ] Can edit business info
- [ ] Can update logo
- [ ] Can add/remove gallery images
- [ ] Can update location
- [ ] Changes are saved to database
- [ ] Changes reflect immediately

### Upload System:
- [ ] Logo uploads to Cloudinary
- [ ] Gallery images upload to Cloudinary
- [ ] Documents upload to Cloudinary
- [ ] Correct file types accepted
- [ ] Shows loading state during upload
- [ ] Shows error if upload fails
- [ ] Can delete uploaded images

---

## 🚀 Quick Start Implementation

Run these commands to begin:

```bash
# 1. Install Cloudinary
cd Server
npm install cloudinary multer-storage-cloudinary

# 2. Create required files
touch config/cloudinary.js
touch middleware/cloudinary-upload.js
touch router/business-upload-router.js

# 3. Add environment variables
echo "CLOUDINARY_CLOUD_NAME=your_cloud_name" >> .env
echo "CLOUDINARY_API_KEY=your_api_key" >> .env
echo "CLOUDINARY_API_SECRET=your_api_secret" >> .env

# 4. Start implementing Phase 1
cd ../BusinessDashboard
# Begin modifying signup.jsx
```

---

## 📊 Success Metrics

After implementation, verify:
- ✅ No duplicate data entry
- ✅ OTP sent only after onboarding completion
- ✅ All images stored on Cloudinary
- ✅ Profile page shows real data
- ✅ Business can update their profile
- ✅ Smooth registration flow (no confusion)
- ✅ Admin can approve/reject businesses
- ✅ Email notifications working

---

**Next Steps:** Start with Phase 1 - Fix the authentication flow first, as it's the foundation for everything else.
