"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import AppLayout from "@/components/AppLayout";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      const userData = localStorage.getItem("easypos_user");
      if (userData) {
        try {
          setCurrentUser(JSON.parse(userData));
        } catch {
          setCurrentUser(null);
        }
      }
    });
  }, []);

  const loadUsers = useCallback(() => {
    const token = localStorage.getItem("easypos_token");
    fetch("http://localhost:4000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("easypos_token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    if (currentUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    loadUsers();
  }, [mounted, router, loadUsers, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("easypos_token");
    
    try {
      await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      setShowForm(false);
      setFormData({ name: "", email: "", password: "" });
      loadUsers();
      Swal.fire({
        title: "Success!",
        text: "User created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to create user",
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    }
  };

  if (!mounted) {
    return (
      <AppLayout user={currentUser}>
        <div className="p-8 h-[82vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded mb-6"></div>
            <div className="grid gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={currentUser}>
      {/* Main Content */}
      <main className="p-6 h-[82vh] overflow-y-auto bg-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Users Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setFormData({ name: "", email: "", password: "" });
            }}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            + Add Cashier
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { 
                      year: "numeric", 
                      month: "short", 
                      day: "numeric"
                    })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-3xl bg-white px-8 py-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-800">Add New Cashier</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", email: "", password: "" });
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                  Create Cashier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
