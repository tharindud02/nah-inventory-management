"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Dashboard
            </h2>
            <p className="text-gray-500">
              Select a section from the sidebar to get started
            </p>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
