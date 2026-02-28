"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  image?: string;
  active: boolean;
};

type AppLayoutProps = {
  children: ReactNode;
  user: { name: string; email: string; role: string } | null;
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
};

export default function AppLayout({ children, user, selectedCategory, onCategorySelect }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:4000/categories/active");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("easypos_token");
    localStorage.removeItem("easypos_user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#eef4ff' }}>
      {/* Top Navigation - Full Width */}
      <header className="bg-white shadow-sm">
        <div className="px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/dashboard")}
            >
              <span className="text-slate-800">Easy</span>
              <span className="text-orange-500"> POS</span>
            </h1>
          </div>

          {/* Right Side - Navigation + User */}
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => router.push("/dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => router.push("/sales")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/sales")
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => router.push("/customers")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/customers")
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => router.push("/pos")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/pos")
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Cashier
              </button>
              <button
                onClick={() => {
                  // Navigate to POS route first
                  router.push("/pos");
                  // Clear cart after navigation completes
                  setTimeout(() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }, 100);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                New Order
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">
                🔔
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-sm" suppressHydrationWarning={true}>
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-800" suppressHydrationWarning={true}>{user?.name}</div>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        router.push("/users");
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                    >
                      <span className="mr-3">👤</span>
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                    >
                      <span className="mr-3">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area with Sidebar */}
      <div className="flex-1 flex">
        {/* Left Sidebar with Categories */}
        <aside className="w-28 bg-white shadow-md flex flex-col items-center py-6 gap-4" style={{ marginTop: '10px' }}>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="w-20 h-20 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (pathname !== "/pos") {
                      router.push("/pos");
                    }
                    if (onCategorySelect) {
                      onCategorySelect(category.name);
                    }
                  }}
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
                    selectedCategory === category.name && pathname === "/pos"
                      ? "bg-[#1ba672] text-white shadow-md"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {category.image ? (
                    <div className="w-12 h-12 mb-1 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                      <img
                        src={`http://localhost:4000${category.image}`}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl mb-1">📁</span>
                  )}
                  <span className="text-xs text-center leading-tight">{category.name}</span>
                </button>
              ))
            )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full bg-white p-8 overflow-y-auto" style={{ marginTop: '10px', marginLeft: '10px' }}>{children}</main>
      </div>
    </div>
  );
}
