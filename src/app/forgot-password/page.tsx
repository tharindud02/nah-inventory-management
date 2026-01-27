"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import {
  forgotPassword,
  confirmPassword as confirmForgotPassword,
} from "@/lib/cognito-aws-sdk";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    const newCode = [...confirmationCode];
    newCode[index] = numericValue;
    setConfirmationCode(newCode);

    // Auto-focus next input
    if (numericValue && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !confirmationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const getFullCode = () => {
    return confirmationCode.join("");
  };

  const isFormValid = () => {
    const fullCode = getFullCode();
    const hasValidCode = fullCode.length === 6;
    const hasValidPassword = newPassword.length >= 8;
    const hasMatchingPassword =
      newPassword === confirmPassword && confirmPassword.length > 0;

    return hasValidCode && hasValidPassword && hasMatchingPassword;
  };

  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { strength: 0, text: "Very Weak", color: "bg-red-500" },
      { strength: 1, text: "Weak", color: "bg-red-400" },
      { strength: 2, text: "Fair", color: "bg-yellow-500" },
      { strength: 3, text: "Good", color: "bg-blue-500" },
      { strength: 4, text: "Strong", color: "bg-green-500" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const numericPastedData = pastedData.replace(/[^0-9]/g, "");

    if (numericPastedData.length >= 6) {
      // Take first 6 digits and distribute them
      const digits = numericPastedData.slice(0, 6).split("");
      const newCode = [...confirmationCode];

      digits.forEach((digit, index) => {
        if (index < 6) {
          newCode[index] = digit;
        }
      });

      setConfirmationCode(newCode);

      // Focus the last filled input
      const lastFilledIndex = Math.min(5, digits.length - 1);
      setTimeout(() => {
        const lastInput = document.getElementById(`code-${lastFilledIndex}`);
        lastInput?.focus();
      }, 0);
    }
  };

  const handleSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      await forgotPassword(email);
      // Directly show confirmation form without success message
      setShowConfirmation(true);
      setError("");
    } catch (err: any) {
      setError(
        err.message || "Failed to send reset code. Please check your email.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const fullCode = getFullCode();

    if (!fullCode || fullCode.length !== 6) {
      setError("Please enter the complete 6-digit confirmation code.");
      setIsLoading(false);
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      await confirmForgotPassword(email, fullCode, newPassword);

      // Show success message and redirect
      setSuccess(true);
      setError("");

      setTimeout(() => {
        router.push("/signin?message=password_reset");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Branding/Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden fixed h-screen">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Inventory Hub</h1>
            <p className="text-xl text-gray-300">
              Reset your password to regain access to your inventory management
              system
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-3">Quick Reset Process</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Enter your email address
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Check your email for reset code
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Enter code and new password
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Access your account instantly
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Forgot Password Form */}
      <div className="flex-1 lg:ml-[50%] flex items-start justify-center px-4 py-12 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/signin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">
              {showConfirmation ? "Reset Your Password" : "Forgot Password?"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {showConfirmation
                ? "Enter the code from your email and your new password"
                : "Enter your email address and we'll send you a code to reset your password"}
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {success && showConfirmation ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Password Reset Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Your password has been reset. Redirecting you to sign in...
                  </p>
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
                </div>
              ) : showConfirmation ? (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Enter Reset Code
                    </h3>
                    <p className="text-gray-600">
                      We've sent a password reset code to{" "}
                      <strong>{email}</strong>. Please enter the code below and
                      your new password.
                    </p>
                  </div>
                  <form onSubmit={handleConfirmReset} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 text-center block">
                        Confirmation Code
                      </Label>
                      <div className="flex space-x-2 justify-center">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <Input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            value={confirmationCode[index]}
                            onChange={(e) =>
                              handleCodeChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="h-12 w-12 text-center text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            maxLength={1}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Enter the 6-digit code from your email
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-gray-700"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Password Strength
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                passwordStrength.strength <= 2
                                  ? "text-red-500"
                                  : passwordStrength.strength === 3
                                    ? "text-yellow-500"
                                    : "text-green-500"
                              }`}
                            >
                              {passwordStrength.text}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{
                                width: `${(passwordStrength.strength / 4) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Password Matching Indicator */}
                      {confirmPassword && newPassword !== confirmPassword && (
                        <div className="flex items-center space-x-1 text-xs text-red-500">
                          <X className="w-3 h-3" />
                          <span>Passwords do not match</span>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                      disabled={isLoading || !isFormValid()}
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleSubmitReset} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    disabled={isLoading || !isEmailValid()}
                  >
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
