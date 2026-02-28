"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

type DashboardStats = {
  totalSales: number;
  orderCount: number;
  avgTicket: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      setCurrentDate(new Date());
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

    fetch("http://localhost:4000/sales/dashboard/today", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, [mounted, router]);

  if (!mounted) {
    return null;
  }

  return (
    <AppLayout user={user}>
      <div className="h-full overflow-y-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-500 mt-1" suppressHydrationWarning={true}>
                {currentDate ? currentDate.toLocaleDateString("en-US", { 
                  weekday: "long",
                  year: "numeric", 
                  month: "long", 
                  day: "numeric"
                }) : ""}
              </p>
            </div>
            <div className="text-right" suppressHydrationWarning={true}>
              <p className="text-sm text-slate-500">Welcome back,</p>
              <p className="text-lg font-semibold text-slate-800">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Sales Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Today</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Sales</p>
              <p className="text-3xl font-bold text-slate-900">
                ${Number(stats?.totalSales ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Orders</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.orderCount ?? 0}
              </p>
            </div>
          </div>

          {/* Average Ticket Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Avg</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Average Sale Amount</p>
              <p className="text-3xl font-bold text-slate-900">
                ${Number(stats?.avgTicket ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center mb-6">
              <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/pos")}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-left text-white hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-base mb-1">New Sale</h3>
                    <p className="text-xs text-white/80">Start a new transaction</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/sales")}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-left text-white hover:from-emerald-600 hover:to-emerald-700 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-base mb-1">Sales History</h3>
                    <p className="text-xs text-white/80">View all transactions</p>
                  </div>
                </div>
              </button>

              {user?.role === "admin" && (
                <div suppressHydrationWarning={true} className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push("/categories")}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left hover:bg-slate-100 hover:border-slate-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-1">Categories</h3>
                    <p className="text-xs text-slate-500">Manage categories</p>
                  </button>

                  <button
                    onClick={() => router.push("/products")}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left hover:bg-slate-100 hover:border-slate-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-1">Products</h3>
                    <p className="text-xs text-slate-500">Manage products</p>
                  </button>

                  <button
                    onClick={() => router.push("/users")}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left hover:bg-slate-100 hover:border-slate-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-1">Users</h3>
                    <p className="text-xs text-slate-500">Manage users</p>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Info - Takes 1 column */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center mb-6">
              <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-lg font-bold text-slate-800">Account Info</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg" suppressHydrationWarning={true}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0" suppressHydrationWarning={true}>
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Role</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 capitalize" suppressHydrationWarning={true}>
                    {user?.role}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between" suppressHydrationWarning={true}>
                  <span className="text-sm text-slate-500">Today</span>
                  <span className="text-xs font-medium text-slate-700">
                    {currentDate ? currentDate.toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric"
                    }) : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
