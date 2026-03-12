"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function OAuthExchangeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setStatus("error");
      setMessage("No authorization code found in URL");
      // Notify parent window of error
      if (window.opener) {
        window.opener.postMessage(
          { type: "NYLAS_AUTH_ERROR", error: "No authorization code found" },
          window.location.origin
        );
      }
      // Close popup after 2 seconds
      setTimeout(() => window.close(), 2000);
      return;
    }

    const exchangeToken = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        
        if (!accessToken) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await fetch("/api/nylas/token", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to exchange token");
        }

        setStatus("success");
        setMessage("Calendar connected successfully!");

        // Notify parent window of success
        if (window.opener) {
          window.opener.postMessage(
            { type: "NYLAS_AUTH_SUCCESS" },
            window.location.origin
          );
        }

        // Close popup after 1.5 seconds
        setTimeout(() => window.close(), 1500);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Authentication failed");
        
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage(
            { 
              type: "NYLAS_AUTH_ERROR", 
              error: error instanceof Error ? error.message : "Authentication failed" 
            },
            window.location.origin
          );
        }

        // Close popup after 2 seconds
        setTimeout(() => window.close(), 2000);
      }
    };

    exchangeToken();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <h1 className="mt-4 text-lg font-semibold text-gray-800">Connecting Calendar</h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="mt-4 text-lg font-semibold text-gray-800">Success!</h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <p className="mt-4 text-xs text-gray-400">This window will close automatically...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h1 className="mt-4 text-lg font-semibold text-gray-800">Connection Failed</h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <p className="mt-4 text-xs text-gray-400">This window will close automatically...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthExchangePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <OAuthExchangeContent />
    </Suspense>
  );
}
