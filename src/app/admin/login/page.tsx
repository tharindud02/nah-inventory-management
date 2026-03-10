"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";

const ADMIN_EMAIL = "admin@autohause.com";
const ADMIN_PASSWORD = "admin@4312";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 400));

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuthenticated", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid admin credentials");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-400">
            AutoHause Inventory Management
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="ml-2 text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@autohause.com"
                  className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="h-11 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign in to Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
