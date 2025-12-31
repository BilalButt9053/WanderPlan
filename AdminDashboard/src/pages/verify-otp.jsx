import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useVerifyOtpMutation, useResendOtpMutation } from "@/services/authApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  
  const email = location.state?.email || "";
  const isLogin = location.state?.isLogin || false;
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/auth/sign-in");
      return;
    }

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      console.log('Sending OTP verification:', { email, otp });
      const response = await verifyOtp({ 
        email, 
        otp: otp 
      }).unwrap();
      console.log('OTP verification response:', response);
      
      if (response.token && response.user) {
        // Check if user is admin
        if (!response.user.isAdmin) {
          setError("Access denied. Admin privileges required.");
          localStorage.clear();
          return;
        }
        
        // Save token to localStorage
        localStorage.setItem("authToken", response.token);
        
        // Save user data
        localStorage.setItem("userData", JSON.stringify(response.user));
        
        setSuccess("Verification successful! Redirecting...");
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    
    try {
      await resendOtp({ email }).unwrap();
      setSuccess("New OTP sent to your email!");
      setTimer(60);
      setCanResend(false);
      
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err?.data?.message || "Failed to resend OTP. Please try again.");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit OTP to<br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-500 text-green-700 dark:text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Enter OTP Code
              </Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                required
                disabled={isVerifying}
                className="h-14 text-center text-2xl tracking-widest font-semibold"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center space-y-2">
              {!canResend ? (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {timer}s
                </p>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              )}
            </div>

            <div className="pt-4 border-t">
              <Link 
                to="/auth/sign-in" 
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
