"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Settings">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">Settings page coming soon...</p>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
