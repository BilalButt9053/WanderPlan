import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { CheckCircle } from 'lucide-react';
import { useResendOTPMutation } from '@/redux/api/businessApi';

export function OnboardingSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [resendOTP] = useResendOTPMutation();

  // Get pending business data from sessionStorage
  const pendingBusinessData = JSON.parse(
    sessionStorage.getItem('pendingBusiness') || '{}'
  );

  useEffect(() => {
    // Automatically trigger OTP email when onboarding is complete
    if (pendingBusinessData.businessId) {
      resendOTP({ businessId: pendingBusinessData.businessId });
    }
  }, [pendingBusinessData.businessId, resendOTP]);

  const handleContinue = () => {
    // Navigate to verify email page
    navigate('/verify-email');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-12 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Setup Complete!</h1>
          <p className="text-muted-foreground">
            Your business profile has been created. We've sent a verification code to
            your email address.
          </p>
        </div>

        <div className="pt-4">
          <Button size="lg" onClick={handleContinue}>
            Verify Email
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          After verification, your account will be reviewed by our team (1-2 business
          days)
        </p>
      </Card>
    </div>
  );
}
