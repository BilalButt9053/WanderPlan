import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Building2, ImageIcon, FileCheck, MapPin, CheckCircle, Sun, Moon } from 'lucide-react';
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

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tempData = useSelector(selectTempRegistrationData);
  const [registerBusiness, { isLoading, error }] = useRegisterBusinessMutation();
  
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
    setFormData({ ...formData, ...data });
    // Also update Redux temp storage
    dispatch(updateTempRegistrationData(data));
  };

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5) {
      // Final step - submit registration
      await handleCompleteRegistration();
    }
  };

  const handleCompleteRegistration = async () => {
    try {
      // Helper function to extract URL from file object
      const extractUrl = (fileData) => {
        if (!fileData) return null;
        if (typeof fileData === 'string') return fileData;
        return fileData.url || null;
      };

      // Helper function to extract URLs from gallery array
      const extractGalleryUrls = (gallery) => {
        if (!gallery || !Array.isArray(gallery)) return [];
        return gallery.map(item => {
          if (typeof item === 'string') return { url: item };
          return { url: item.url || item };
        }).filter(item => item.url);
      };

      // Combine signup data with onboarding data
      const registrationData = {
        // From signup
        ownerName: tempData.ownerName,
        email: tempData.email,
        password: tempData.password,
        
        // From onboarding
        businessName: formData.businessName,
        description: formData.description,
        phone: formData.phone,
        website: formData.website,
        businessType: formData.category || 'other',
        
        // Address
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        
        // Media (extract URLs from file objects)
        logo: extractUrl(formData.logo),
        galleryImages: extractGalleryUrls(formData.galleryImages),
        
        // Documents (extract URLs from file objects)
        documents: [
          formData.businessLicense && {
            type: 'license',
            url: extractUrl(formData.businessLicense)
          },
          formData.proofOfAddress && {
            type: 'other',
            url: extractUrl(formData.proofOfAddress)
          }
        ].filter(item => item && item.url)
      };

      console.log('Submitting registration:', registrationData);
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
      alert(err?.data?.message || 'Registration failed. Please try again.');
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
            {error?.data?.message || 'An error occurred. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
}
