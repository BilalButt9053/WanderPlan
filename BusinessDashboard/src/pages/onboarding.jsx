import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Building2, ImageIcon, FileCheck, MapPin, CheckCircle, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { OnboardingStepOne } from '../components/onboarding/step-one';
import { OnboardingStepTwo } from '../components/onboarding/step-two';
import { OnboardingStepThree } from '../components/onboarding/step-three';
import { OnboardingStepFour } from '../components/onboarding/step-four';
import { OnboardingStepFive } from '../components/onboarding/step-five';
import { OnboardingSuccess } from '../components/onboarding/success';
import { useTheme } from '@/contexts/ThemeContext';
import { useRegisterBusinessMutation } from '@/redux/api/businessApi';
import { 
  selectTempRegistrationData, 
  updateTempRegistrationData,
  setPendingBusiness 
} from '@/redux/slices/businessAuthSlice';

const steps = [
  { number: 1, title: 'Business Info', icon: Building2 },
  { number: 2, title: 'Gallery', icon: ImageIcon },
  { number: 3, title: 'Category', icon: FileCheck },
  { number: 4, title: 'Location', icon: MapPin },
  { number: 5, title: 'Verification', icon: CheckCircle },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s().-]{7,20}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const hasUploadedUrl = (value) => Boolean(value?.url && !value.url.startsWith('blob:'));

const getFriendlyApiMessage = (message, fallback) => {
  if (!message || typeof message !== 'string') return fallback;
  const looksTechnical = /(smtp|gmail|nodemailer|stack|exception|invalid login|webloginrequired)/i.test(message);
  return looksTechnical || message.length > 160 ? fallback : message;
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tempData = useSelector(selectTempRegistrationData);
  const [registerBusiness, { isLoading, error }] = useRegisterBusinessMutation();
  const [stepError, setStepError] = useState('');
  
  // Redirect if no signup data
  useEffect(() => {
    if (!tempData || !tempData.email) {
      navigate('/signup');
    }
  }, [tempData, navigate]);

  const [formData, setFormData] = useState({
    // Step 1 - Business Info
    businessName: '',
    description: '',
    phone: '',
    website: '',
    
    // Step 2 - Gallery
    logo: null,
    galleryImages: [],
    
    // Step 3 - Category
    category: '',
    
    // Step 4 - Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Step 5 - Verification
    businessLicense: null,
    proofOfAddress: null,
  });

  const updateFormData = (data) => {
    setFormData((current) => ({ ...current, ...data }));
    setStepError('');
    // Also update Redux temp storage
    dispatch(updateTempRegistrationData(data));
  };

  const validateSignupData = () => {
    const ownerName = tempData?.ownerName?.trim() || '';
    const email = tempData?.email?.trim().toLowerCase() || '';
    const password = tempData?.password || '';

    if (ownerName.length < 2) return 'Owner name must be at least 2 characters.';
    if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';
    if (password.length < 8 || !PASSWORD_REGEX.test(password)) {
      return 'Password must be at least 8 characters and include a letter and number.';
    }

    return '';
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!formData.businessName.trim()) return 'Business name is required.';
      if (!formData.description.trim()) return 'Description is required.';
      if (!PHONE_REGEX.test(formData.phone.trim())) return 'Please enter a valid phone number.';
      if (!isValidUrl(formData.website.trim())) return 'Please enter a valid website URL.';
    }

    if (currentStep === 2) {
      if (formData.logo?.file) return 'Please wait for the logo upload to finish.';
      if ((formData.galleryImages || []).length > 10) return 'Gallery can include up to 10 images.';
      if ((formData.galleryImages || []).some((item) => item?.file || item?.url?.startsWith('blob:') || (typeof item === 'string' && item.startsWith('blob:')))) {
        return 'Please wait for gallery uploads to finish.';
      }
    }

    if (currentStep === 3 && !formData.category) {
      return 'Please select a business category.';
    }

    if (currentStep === 4) {
      if (!formData.address.trim()) return 'Street address is required.';
      if (!formData.city.trim()) return 'City is required.';
      if (!formData.country.trim()) return 'Country is required.';
    }

    if (currentStep === 5) {
      if (!hasUploadedUrl(formData.businessLicense)) return 'Business license document is required.';
      if (formData.proofOfAddress && !hasUploadedUrl(formData.proofOfAddress)) {
        return 'Please wait for proof of address upload to finish.';
      }
    }

    return '';
  };

  const handleNext = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setStepError(validationError);
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5) {
      // Final step - submit registration
      await handleCompleteRegistration();
    }
  };

  const handleCompleteRegistration = async () => {
    try {
      const signupError = validateSignupData();
      if (signupError) {
        setStepError(signupError);
        return;
      }

      // Helper function to extract URL from file object
      const extractUrl = (fileData) => {
        if (!fileData) return null;
        if (typeof fileData === 'string') return fileData;
        return fileData.url && !fileData.url.startsWith('blob:') ? fileData.url : null;
      };

      // Helper function to extract URLs from gallery array
      const extractGalleryUrls = (gallery) => {
        if (!gallery || !Array.isArray(gallery)) return [];
        return gallery.map(item => {
          if (typeof item === 'string') return { url: item };
          return { url: item.url || item, publicId: item.publicId };
        }).filter(item => item.url && !item.url.startsWith('blob:'));
      };

      // Combine signup data with onboarding data
      const registrationData = {
        // From signup
        ownerName: tempData.ownerName?.trim(),
        email: tempData.email?.trim().toLowerCase(),
        password: tempData.password,
        
        // From onboarding
        businessName: formData.businessName.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        businessType: formData.category || 'other',
        
        // Address
        address: {
          street: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim(),
        },
        
        // Media (extract URLs from file objects)
        logo: extractUrl(formData.logo),
        galleryImages: extractGalleryUrls(formData.galleryImages),
        
        // Documents (extract URLs from file objects)
        documents: [
          formData.businessLicense && {
            type: 'license',
            url: extractUrl(formData.businessLicense),
            publicId: formData.businessLicense.publicId,
          },
          formData.proofOfAddress && {
            type: 'other',
            url: extractUrl(formData.proofOfAddress),
            publicId: formData.proofOfAddress.publicId,
          }
        ].filter(item => item && item.url)
      };

      const response = await registerBusiness(registrationData).unwrap();
      
      // Store business ID and email for OTP verification
      dispatch(setPendingBusiness({
        businessId: response.businessId,
        email: response.email
      }));
      
      // Move to success step
      setCurrentStep(6);
    } catch (err) {
      console.error('Registration failed:', err);
      const message = getFriendlyApiMessage(err?.data?.message, 'Registration failed. Please try again.');
      setStepError(message);
      toast.error(message);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show success screen after completing all steps
  if (currentStep === 6) {
    return <OnboardingSuccess />;
  }

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Business Profile</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of 5 - {steps[currentStep - 1].title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {/* Step Circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-primary border-primary'
                          : isCurrent
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all ${
                          isCompleted ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>

                  {/* Step Label */}
                  <p
                    className={`text-xs mt-2 text-center ${
                      isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-6">
          {currentStep === 1 && (
            <OnboardingStepOne formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <OnboardingStepTwo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <OnboardingStepThree formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <OnboardingStepFour formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <OnboardingStepFive formData={formData} updateFormData={updateFormData} />
          )}
        </Card>

        {stepError && (
          <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {stepError}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            Back
          </Button>

          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <>Loading...</>
            ) : currentStep === 5 ? (
              'Complete Registration'
            ) : (
              'Next Step'
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {getFriendlyApiMessage(error?.data?.message, 'An error occurred. Please try again.')}
          </div>
        )}
      </div>
    </div>
  );
}
