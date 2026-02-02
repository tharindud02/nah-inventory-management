"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { signIn, confirmSignUp } from "@/lib/cognito-aws-sdk";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

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

  const getFullCode = () => {
    return confirmationCode.join("");
  };

  // Check for message from sign-up
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "check_email") {
      setError(
        "Account created! Please check your email for the confirmation code, then sign in.",
      );
      setSuccess(false);
      setSuccessMessage("");
    } else if (message === "account_confirmed") {
      setSuccess(true);
      setSuccessMessage("Account confirmed! You can now sign in.");
      setError("");
    } else if (message === "password_reset") {
      setSuccess(true);
      setSuccessMessage(
        "Password reset successfully! You can now sign in with your new password.",
      );
      setError("");
    }
  }, [searchParams]);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail") || "";
    const savedPassword = localStorage.getItem("rememberedPassword") || "";
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedPassword && savedRememberMe) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    setSuccessMessage("");

    try {
      const result = await signIn({ email, password });

      // Store tokens in localStorage for the AuthContext to use
      if (result.AuthenticationResult) {
        localStorage.setItem(
          "accessToken",
          result.AuthenticationResult.AccessToken || "",
        );
        localStorage.setItem(
          "idToken",
          result.AuthenticationResult.IdToken || "",
        );
        localStorage.setItem(
          "refreshToken",
          result.AuthenticationResult.RefreshToken || "",
        );
      }

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        // Clear saved credentials if remember me is not checked
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.removeItem("rememberMe");
      }

      await refreshUser();

      // Redirect immediately without showing success message
      router.push("/dashboard");
    } catch (err: any) {
      if (
        err.message.includes("User is not confirmed") ||
        err.name === "UserNotConfirmedException"
      ) {
        // Show confirmation input but don't change the button - keep it as "Sign in"
        setShowConfirmation(true);
        setError(
          "Your account needs confirmation. Please enter the code from your email and click Sign in again.",
        );
      } else if (
        err.name === "NotAuthorizedException" ||
        err.message.includes("Incorrect username or password")
      ) {
        setError(
          "Invalid email or password. Please check your credentials and try again.",
        );
      } else {
        setError(err.message || "An error occurred during sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationAndSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    setSuccessMessage("");

    if (!getFullCode() || getFullCode().length !== 6) {
      setError("Please enter the complete 6-digit confirmation code.");
      setIsLoading(false);
      return;
    }

    try {
      // First confirm the user
      await confirmSignUp(email, getFullCode());

      // Then immediately sign in with the same credentials
      const result = await signIn({ email, password });

      if (result.AuthenticationResult) {
        localStorage.setItem(
          "accessToken",
          result.AuthenticationResult.AccessToken || "",
        );
        localStorage.setItem(
          "idToken",
          result.AuthenticationResult.IdToken || "",
        );
        localStorage.setItem(
          "refreshToken",
          result.AuthenticationResult.RefreshToken || "",
        );
      }

      await refreshUser();

      // Redirect immediately without showing success message
      router.push("/dashboard");
    } catch (err: any) {
      if (
        err.name === "NotAuthorizedException" ||
        err.message.includes("Incorrect username or password")
      ) {
        setError(
          "Invalid email or password. Please check your credentials and try again.",
        );
      } else {
        setError(
          err.message ||
            "Confirmation failed. Please check the code and try again.",
        );
      }
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
              Your complete inventory management solution for modern businesses
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-3">
              Why Choose Inventory Hub?
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Real-time inventory tracking
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Automated stock management
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Advanced analytics dashboard
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Multi-location support
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 lg:ml-[50%] flex items-start justify-center px-4 py-12 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your inventory management account
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <form
                onSubmit={
                  showConfirmation ? handleConfirmationAndSignIn : handleSubmit
                }
                className="space-y-6"
              >
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
                {success && (
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                {showConfirmation && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmationCode"
                      className="text-sm font-medium text-gray-700 text-center block"
                    >
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
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
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
                      Check your email for the confirmation code
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                  disabled={
                    isLoading ||
                    (showConfirmation && getFullCode().length !== 6)
                  }
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
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
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
