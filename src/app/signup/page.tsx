"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Bell,
  User,
  Check,
  X,
} from "lucide-react";
import { signUp, confirmSignUp } from "@/lib/cognito-aws-sdk";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    const newCode = [...confirmationCode];
    newCode[index] = numericValue;
    setConfirmationCode(newCode);

    // Auto-focus next input
    if (numericValue && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !confirmationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const getFullCode = () => confirmationCode.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      // Show confirmation form instead of redirecting
      setSignupSuccess(true);
      setShowConfirmation(true);
      setError("");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const fullCode = getFullCode();
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits of the confirmation code.");
      setIsLoading(false);
      return;
    }

    try {
      await confirmSignUp(formData.email, fullCode);

      // Show success state instead of redirecting immediately
      setSignupSuccess(true);
      setShowConfirmation(false);
      setError("");

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/signin?message=account_confirmed");
      }, 2000);
    } catch (err: any) {
      console.error("Confirmation error:", err);
      // Don't show phone number errors as they're not critical for confirmation
      if (err.message.includes("phone number")) {
        setSuccessMessage(
          "Account confirmed successfully! Redirecting to sign-in...",
        );
        setError("");
        // Still redirect despite phone number error
        setTimeout(() => {
          router.push("/signin?message=account_confirmed");
        }, 2000);
      } else {
        setError(
          err.message ||
            "Confirmation failed. Please check the code and try again.",
        );
        setSuccessMessage("");
      }
    } finally {
      setIsLoading(false);
    }
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Features - FIXED POSITION */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden fixed h-screen">
        <div className="absolute inset-0 opacity-20 bg-grid-pattern"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Join Inventory Management
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Get started with powerful tools to manage your automotive
              inventory efficiently
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Real-time Analytics
                </h3>
                <p className="text-gray-400">
                  Track inventory performance with live dashboards and detailed
                  insights
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Market Intelligence
                </h3>
                <p className="text-gray-400">
                  Get AI-powered pricing recommendations and market trend
                  analysis
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
                <p className="text-gray-400">
                  Receive notifications for price changes, inventory issues, and
                  opportunities
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="flex items-center space-x-2 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2 text-sm mt-1">
              <Check className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2 text-sm mt-1">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form - SCROLLABLE */}
      <div className="flex-1 lg:ml-[50%] flex items-start justify-center px-4 py-12 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start managing your inventory today
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {signupSuccess && !showConfirmation ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Account Confirmed Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your account has been activated. Redirecting you to sign
                    in...
                  </p>
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : showConfirmation ? (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Confirm Your Email
                    </h3>
                    <p className="text-gray-600">
                      We've sent a confirmation code to{" "}
                      <strong>{formData.email}</strong>. Please enter the
                      6-digit code below.
                    </p>
                  </div>

                  <form onSubmit={handleConfirmation} className="space-y-6">
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
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex">
                          <Check className="h-5 w-5 text-green-400" />
                          <div className="ml-3">
                            <p className="text-sm text-green-800">
                              {successMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmationCode"
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirmation Code
                      </Label>
                      <div className="flex space-x-2 justify-center">
                        {confirmationCode.map((digit, index) => (
                          <Input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            value={digit}
                            onChange={(e) =>
                              handleCodeChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleCodeKeyDown(index, e)}
                            placeholder="0"
                            className="w-12 h-12 text-center text-lg font-mono border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            maxLength={1}
                            required
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Enter the 6-digit code from your email
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                      disabled={isLoading || getFullCode().length !== 6}
                    >
                      {isLoading ? "Confirming..." : "Confirm Email"}
                    </Button>
                  </form>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        placeholder="John"
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        placeholder="Doe"
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

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
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="john@example.com"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="Create a strong password"
                        className="h-11 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Password strength
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
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        placeholder="Confirm your password"
                        className={`h-11 pr-10 ${
                          formData.confirmPassword &&
                          formData.password !== formData.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        }`}
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
                    {formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <div className="flex items-center space-x-1 text-xs text-red-500">
                          <X className="w-3 h-3" />
                          <span>Passwords do not match</span>
                        </div>
                      )}
                  </div>

                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 text-sm text-gray-600"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    disabled={
                      isLoading ||
                      !agreedToTerms ||
                      !formData.email ||
                      !formData.password ||
                      formData.password !== formData.confirmPassword
                    }
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or sign up with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="h-11">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
