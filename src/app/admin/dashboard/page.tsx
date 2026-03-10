"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Check,
  LogOut,
  Shield,
  Building2,
  UserPlus,
} from "lucide-react";

interface DealershipFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  mcDealerId: string;
}

interface DealerFormData {
  name: string;
  email: string;
  phone: string;
}

const INITIAL_DEALERSHIP: DealershipFormData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  mcDealerId: "",
};

const INITIAL_DEALER: DealerFormData = {
  name: "",
  email: "",
  phone: "",
};

export default function AdminDashboardPage() {
  const [dealership, setDealership] =
    useState<DealershipFormData>(INITIAL_DEALERSHIP);
  const [dealer, setDealer] = useState<DealerFormData>(INITIAL_DEALER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuthenticated");
    if (adminAuth !== "true") {
      router.replace("/admin/login");
      return;
    }
    setIsAuthed(true);
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.removeItem("adminAuthenticated");
    router.push("/admin/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/dealerships/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealership, dealer }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to onboard dealer");
      }

      setSuccess(
        `Dealer "${dealer.name}" onboarded successfully. An invitation email has been sent to ${dealer.email}.`,
      );
      setDealership(INITIAL_DEALERSHIP);
      setDealer(INITIAL_DEALER);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDealership = (
    field: keyof DealershipFormData,
    value: string,
  ) => {
    setDealership((prev) => ({ ...prev, [field]: value }));
  };

  const updateDealer = (field: keyof DealerFormData, value: string) => {
    setDealer((prev) => ({ ...prev, [field]: value }));
  };

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-500" />
            <span className="text-white font-semibold">Admin Portal</span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
              AutoHause
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Onboard Dealer</h1>
          <p className="text-slate-400 mt-1">
            Add a new dealership and dealer. They will receive an invitation
            email with temporary credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="ml-3 text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="ml-3 text-sm text-emerald-400">{success}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  Dealership Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-300">
                    Dealership Name
                  </Label>
                  <Input
                    value={dealership.name}
                    onChange={(e) => updateDealership("name", e.target.value)}
                    placeholder="Viking Hiline"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-slate-300">Phone</Label>
                    <Input
                      value={dealership.phone}
                      onChange={(e) =>
                        updateDealership("phone", e.target.value)
                      }
                      placeholder="+7132010856"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-slate-300">Email</Label>
                    <Input
                      type="email"
                      value={dealership.email}
                      onChange={(e) =>
                        updateDealership("email", e.target.value)
                      }
                      placeholder="karl@vikinghiline.com"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-300">Address</Label>
                  <Input
                    value={dealership.address}
                    onChange={(e) =>
                      updateDealership("address", e.target.value)
                    }
                    placeholder="2408 Timberloch Pl Ste C1"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-slate-300">City</Label>
                    <Input
                      value={dealership.city}
                      onChange={(e) => updateDealership("city", e.target.value)}
                      placeholder="The Woodlands"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-slate-300">State</Label>
                    <Input
                      value={dealership.state}
                      onChange={(e) =>
                        updateDealership("state", e.target.value)
                      }
                      placeholder="TX"
                      maxLength={2}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 uppercase"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-slate-300">ZIP</Label>
                    <Input
                      value={dealership.zip}
                      onChange={(e) => updateDealership("zip", e.target.value)}
                      placeholder="77380"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-300">MC Dealer ID</Label>
                  <Input
                    value={dealership.mcDealerId}
                    onChange={(e) =>
                      updateDealership("mcDealerId", e.target.value)
                    }
                    placeholder="11018373"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <UserPlus className="w-5 h-5 text-slate-400" />
                  Dealer Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-300">Full Name</Label>
                  <Input
                    value={dealer.name}
                    onChange={(e) => updateDealer("name", e.target.value)}
                    placeholder="Nipul Mallikarachchi"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={dealer.email}
                    onChange={(e) => updateDealer("email", e.target.value)}
                    placeholder="dealer@example.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-300">Phone</Label>
                  <Input
                    value={dealer.phone}
                    onChange={(e) => updateDealer("phone", e.target.value)}
                    placeholder="+14155559999"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-11 px-8 bg-amber-500 hover:bg-amber-600 text-black font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Onboarding..." : "Onboard Dealer"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
