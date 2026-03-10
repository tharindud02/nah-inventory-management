"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Check, UserPlus, Users, Mail, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

interface InvitedUser {
  id: string;
  email: string;
  name: string;
  status: "pending" | "active" | "invited";
  invitedAt: string;
}


export default function DealershipPage() {
  return (
    <ProtectedRoute>
      <DealershipContent />
    </ProtectedRoute>
  );
}

function DealershipContent() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [dealershipId, setDealershipId] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDealershipData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Not authenticated");
        }

        const response = await fetch("/api/dealerships", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.warn("Failed to fetch dealership data:", data.error);
          return;
        }

        // Extract dealership ID from the API response
        // Adjust based on your actual API response structure
        if (data.dealerId || data.id) {
          setDealershipId(data.dealerId || data.id);
        }
      } catch (err) {
        console.error("Error fetching dealership data:", err);
      }
    };

    fetchDealershipData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      if (!dealershipId) {
        throw new Error("Dealership ID not found");
      }

      const response = await fetch(`/api/dealerships/${dealershipId}/dealers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite user");
      }

      setSuccess(`Invitation sent to ${email}`);
      setEmail("");
      setName("");

      // Add to local list (optimistic update)
      const newUser: InvitedUser = {
        id: Date.now().toString(),
        email,
        name,
        status: "invited",
        invitedAt: new Date().toISOString(),
      };
      setInvitedUsers((prev) => [newUser, ...prev]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: InvitedUser["status"]) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      invited: "bg-blue-100 text-blue-700",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dealership</h1>
            <p className="text-slate-500 mt-1">
              Manage your dealership and invite team members
            </p>
          </div>
        </div>

        {/* Invite Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-slate-500" />
              Invite Team Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="ml-3 text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="ml-3 text-sm text-emerald-600">{success}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="h-11 pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={isLoading || !email || !name}
                >
                  {isLoading ? "Sending Invitation..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Invited Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-slate-500" />
              Team Members
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({invitedUsers.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitedUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No team members yet</p>
                <p className="text-sm">
                  Invite users to join your dealership
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Invited
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-slate-600">
                        {user.email}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(user.invitedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Invited users will receive an email with
            temporary credentials. They will need to set a new password on first
            login.
          </p>
        </div>
      </div>
    </Layout>
  );
}
