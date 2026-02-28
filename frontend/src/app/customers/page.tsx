"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Swal from "sweetalert2";

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  email?: string;
  createdAt?: string;
  _count?: {
    sales: number;
  };
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      const userData = localStorage.getItem("easypos_user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("easypos_token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    fetchCustomers();
  }, [mounted, router]);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("easypos_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:4000/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          console.error("Customers API returned non-array data:", data);
          setCustomers([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("easypos_token");
    if (!token) return;

    try {
      const url = editingCustomer 
        ? `http://localhost:4000/customers/${editingCustomer.id}`
        : "http://localhost:4000/customers";
      
      const method = editingCustomer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCustomers();
        setShowModal(false);
        setEditingCustomer(null);
        setFormData({ name: "", phone: "", email: "", address: "" });
      }
    } catch (error) {
      console.error("Failed to save customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (customer: Customer) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Name:</strong> ${customer.name}</p>
          <p class="mb-2"><strong>Phone:</strong> ${customer.phone}</p>
          ${customer.email ? `<p class="mb-2"><strong>Email:</strong> ${customer.email}</p>` : ""}
        </div>
        <p class="text-red-600 mt-4">This action cannot be undone.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;
    
    const token = localStorage.getItem("easypos_token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/customers/${customer.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await fetchCustomers();
      Swal.fire({
        title: "Deleted!",
        text: "Customer has been deleted.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Failed to delete customer:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete customer",
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: "", phone: "", email: "", address: "" });
  };

  if (!mounted) {
    return null;
  }

  const filteredCustomers = Array.isArray(customers) 
    ? customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <AppLayout user={user}>
      <div className="h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Customers</h1>
        </div>

        {/* Search & Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm w-80 bg-white"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={openAddModal}
            className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
          >
            Add New Customer
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-white border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Customer Name</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Mobile Number</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Address</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Orders</div>
          </div>

          {/* Table Body */}
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              onClick={() => handleEdit(customer)}
              className={`grid grid-cols-4 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                index !== filteredCustomers.length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <div className="text-sm text-slate-800 font-medium text-center">{customer.name}</div>
              <div className="text-sm text-slate-600 text-center">{customer.phone}</div>
              <div className="text-sm text-slate-600 text-center">{customer.address || "—"}</div>
              <div className="text-sm text-slate-900 font-semibold text-center">{customer._count?.sales || 0}</div>
            </div>
          ))}
        </div>

        {/* Empty States */}
        {filteredCustomers.length === 0 && customers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
            <div className="text-slate-300 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No customers found</p>
            <p className="text-slate-400 text-sm mt-1">Add your first customer to get started</p>
          </div>
        )}

        {filteredCustomers.length === 0 && customers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
            <div className="text-slate-300 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No results found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-transparent-100 bg-opacity-10 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {editingCustomer ? "Update customer details below" : "Enter customer details below"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter customer address"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (editingCustomer ? "Updating..." : "Adding...") : (editingCustomer ? "Update Customer" : "Add Customer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
