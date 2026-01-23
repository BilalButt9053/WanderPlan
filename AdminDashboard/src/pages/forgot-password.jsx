import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, Lock } from "lucide-react";
import api from "@/services/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: formData.email,
      });

      setSuccess(response.data.message || "OTP sent to your email");
      setTimeout(() => {
        setStep(2);
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      setSuccess(response.data.message || "Password reset successful!");
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: formData.email,
      });

      setSuccess("OTP resent to your email");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to resend OTP");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <Link 
            to="/sign-in" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 
              ? "Enter your email address and we'll send you an OTP to reset your password"
              : "Enter the OTP sent to your email and your new password"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
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
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@wanderplan.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
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
                <Label htmlFor="email-display">Email Address</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-11 bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  disabled={isLoading}
                  className="h-11 text-center text-2xl tracking-widest"
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => {
                    setStep(1);
                    setFormData({ ...formData, otp: "", newPassword: "", confirmPassword: "" });
                    setError("");
                    setSuccess("");
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
