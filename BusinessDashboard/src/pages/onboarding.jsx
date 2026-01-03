import { useState } from 'react';
import { Building2, ImageIcon, FileCheck, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { OnboardingStepOne } from '../components/onboarding/step-one';
import { OnboardingStepTwo } from '../components/onboarding/step-two';
import { OnboardingStepThree } from '../components/onboarding/step-three';
import { OnboardingStepFour } from '../components/onboarding/step-four';
import { OnboardingStepFive } from '../components/onboarding/step-five';
import { OnboardingSuccess } from '../components/onboarding/success';

const steps = [
  { number: 1, title: 'Business Info', icon: Building2 },
  { number: 2, title: 'Gallery', icon: ImageIcon },
  { number: 3, title: 'Category', icon: FileCheck },
  { number: 4, title: 'Location', icon: MapPin },
  { number: 5, title: 'Verification', icon: CheckCircle },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Business Info
    businessName: '',
    description: '',
    phone: '',
    website: '',
    contactEmail: '',
    
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

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data) => {
    setFormData({ ...formData, ...data });
  };

  // Show success screen after completing all steps
  if (currentStep === 6) {
    return <OnboardingSuccess />;
  }

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-background">
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
                        <Icon
                          className={`h-5 w-5 ${
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
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
            disabled={currentStep === 1}
          >
            Back
          </Button>

          <Button onClick={handleNext}>
            {currentStep === 5 ? 'Complete Setup' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
}
