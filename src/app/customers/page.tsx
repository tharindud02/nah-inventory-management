"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import type { Customer } from "@/types/customer";

const STORAGE_KEY = "inventory-customers";

function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  useEffect(() => {
    setCustomers(loadCustomers());
  }, []);

  const persist = (next: Customer[]) => {
    setCustomers(next);
    saveCustomers(next);
  };

  const openAdd = () => {
    setEditCustomer(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
    };

    if (editCustomer) {
      persist(
        customers.map((c) =>
          c.id === editCustomer.id ? { ...c, ...payload } : c,
        ),
      );
    } else {
      const newCustomer: Customer = {
        id: `customer-${Date.now()}`,
        ...payload,
      };
      persist([...customers, newCustomer]);
    }

    setModalOpen(false);
  };

  const openDelete = (c: Customer) => {
    setDeleteCustomer(c);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteCustomer) {
      persist(customers.filter((c) => c.id !== deleteCustomer.id));
      setDeleteCustomer(null);
    }
    setDeleteConfirmOpen(false);
  };

  return (
    <ProtectedRoute>
      <Layout title="Customers" showSearch={false}>
        <div className="mb-6 flex items-center justify-between">
          <Breadcrumb items={[{ label: "Customers", isCurrent: true }]} />
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Customer List
            </h2>
          </div>

          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-600">No customers yet</p>
              <p className="mb-4 text-sm text-gray-500">
                Add your first customer to get started
              </p>
              <Button onClick={openAdd} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-700">
                      Phone
                    </th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="py-4 text-sm font-medium text-gray-900">
                        {c.name}
                      </td>
                      <td className="py-4 text-sm text-gray-600">{c.email}</td>
                      <td className="py-4 text-sm text-gray-600">{c.phone}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(c)}
                            aria-label="Edit customer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDelete(c)}
                            aria-label="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>
                  {editCustomer ? "Edit Customer" : "Add Customer"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!formName.trim()}>
                  {editCustomer ? "Save" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Customer</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete &quot;{deleteCustomer?.name}&quot;?
              This action cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </ProtectedRoute>
  );
}
