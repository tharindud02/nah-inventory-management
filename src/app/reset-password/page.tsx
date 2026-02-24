"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Shield,
} from "lucide-react";
import { confirmPassword as confirmForgotPassword } from "@/lib/cognito-aws-sdk";

function ResetPasswordPageContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email and code from URL parameters
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

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

  const isFormValid = () => {
    const hasValidPassword = newPassword.length >= 8;
    const hasMatchingPassword =
      newPassword === confirmPassword && confirmPassword.length > 0;

    return hasValidPassword && hasMatchingPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

    if (!email || !code) {
      setError("Invalid reset link. Please request a new password reset.");
      setIsLoading(false);
      return;
    }

    try {
      await confirmForgotPassword(email, code, newPassword);

      // Show success message and redirect
      setSuccess(true);
      setError("");

      setTimeout(() => {
        router.push("/signin?message=password_reset");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to reset password. Please try again or request a new reset link.",
      );
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
              Create a strong new password to secure your account
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-3">
              Password Security Tips
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Use at least 8 characters</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Include uppercase and lowercase letters</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Add numbers and special characters</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Avoid using common passwords</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Reset Password Form */}
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

            <div className="flex items-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-2xl mr-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Reset Password
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your new password below
                </p>
              </div>
            </div>

            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Resetting password for: <strong>{email}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {success ? (
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
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <AlertCircle className="w-3 h-3" />
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
