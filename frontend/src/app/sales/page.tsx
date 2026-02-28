"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Swal from "sweetalert2";

type SaleItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
    image?: string;
  };
};

type Sale = {
  id: number;
  invoiceNumber?: string;
  orderNumber?: string;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  cashier: {
    name: string;
    email: string;
  };
  customer?: {
    id: number;
    name: string;
    phone: string;
    email?: string;
  };
  items: SaleItem[];
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const loadSales = useCallback(() => {
    if (!mounted) return;
    const token = localStorage.getItem("easypos_token");
    fetch("http://localhost:4000/sales/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSales(data);
        } else {
          console.error("Sales API returned non-array data:", data);
          setSales([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch sales:", error);
        setSales([]);
      });
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("easypos_token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    loadSales();
  }, [mounted, router, loadSales]);

  if (!mounted) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategory = (sale: Sale) => {
    // Get unique categories from sale items
    const categories = sale.items
      .map(item => item.product.category?.name || "Uncategorized")
      .filter((value, index, self) => self.indexOf(value) === index);
    
    if (categories.length === 0) return "Uncategorized";
    if (categories.length === 1) return categories[0];
    return categories[0] + ` +${categories.length - 1}`;
  };

  // Filter sales based on search query and date filter
  const filteredSales = sales.filter((sale) => {
    // First apply date filter
    if (filter === "last Month") {
      const saleDate = new Date(sale.createdAt);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      // Keep only sales from the last month (date should be AFTER one month ago)
      if (saleDate < oneMonthAgo) return false;
    }
    
    // If no search query, pass (date filter already checked above)
    if (!searchQuery.trim()) return true;
    
    // Apply search filter
    const query = searchQuery.toLowerCase();
    
    // Format date for searching
    const formattedDate = formatDate(sale.createdAt).toLowerCase();
    const fullDate = new Date(sale.createdAt).toLocaleDateString("en-US").toLowerCase();
    
    // Search in ALL fields
    return (
      // Transaction ID
      sale.id.toString().includes(query) ||
      sale.id.toString().padStart(10, "0").includes(query) ||
      
      // Date (both formatted and full date)
      formattedDate.includes(query) ||
      fullDate.includes(query) ||
      
      // Amount
      Number(sale.total).toFixed(2).includes(query) ||
      sale.total.toString().includes(query) ||
      
      // Orders (number of items)
      sale.items.length.toString().includes(query) ||
      
      // Category
      getCategory(sale).toLowerCase().includes(query) ||
      
      // Menu/Product names
      sale.items.some(item => item.product.name.toLowerCase().includes(query)) ||
      
      // Cashier name and email
      sale.cashier.name.toLowerCase().includes(query) ||
      sale.cashier.email.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout user={user}>
      <div className="h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter("All")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === "All"
                  ? "bg-black text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("last Month")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === "last Month"
                  ? "bg-black text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              last Month
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu..."
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-white border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction ID</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Menu</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</div>
          </div>

          {/* Table Body */}
          {Array.isArray(filteredSales) && filteredSales.slice(0, 10).map((sale, index) => (
            <div
              key={sale.id}
              className={`grid grid-cols-7 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${
                index !== filteredSales.slice(0, 10).length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <div className="text-sm text-slate-600 cursor-pointer" onClick={() => setSelectedSale(sale)}>{sale.id.toString().padStart(10, "0")}</div>
              <div className="text-sm text-slate-800 cursor-pointer" onClick={() => setSelectedSale(sale)}>{formatDate(sale.createdAt)}</div>
              <div className="text-sm text-slate-900 font-medium cursor-pointer" onClick={() => setSelectedSale(sale)}>${Number(sale.total).toFixed(2)}</div>
              <div className="text-sm text-slate-900 font-semibold cursor-pointer" onClick={() => setSelectedSale(sale)}>{sale.items.length}</div>
              <div className="text-sm cursor-pointer" onClick={() => setSelectedSale(sale)}>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {getCategory(sale)}
                </span>
              </div>
              <div className="text-sm text-slate-800 cursor-pointer" onClick={() => setSelectedSale(sale)}>
                {sale.items.length > 0 ? sale.items[0].product.name : "-"}
                {sale.items.length > 1 && ` +${sale.items.length - 1}`}
              </div>
              <div>
                {sale.customer ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const customer = sale.customer!;
                      
                      Swal.fire({
                        title: "Customer Details",
                        html: `
                          <div style="text-align: left;">
                            <div style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Customer Information</div>
                            <div style="margin-bottom: 8px;"><strong>Name:</strong> ${customer.name}</div>
                            <div style="margin-bottom: 8px;"><strong>Phone:</strong> ${customer.phone}</div>
                            ${customer.email ? `<div><strong>Email:</strong> ${customer.email}</div>` : ''}
                          </div>
                        `,
                        width: '400px',
                        confirmButtonColor: "#f97316",
                        confirmButtonText: "Close"
                      });
                    }}
                    className="px-4 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Walk-in</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty States */}
        {sales.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
            <div className="text-slate-300 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No sales records found</p>
            <p className="text-slate-400 text-sm mt-1">Sales will appear here once created</p>
          </div>
        )}

        {sales.length > 0 && filteredSales.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
            <div className="text-slate-300 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No results found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {filteredSales.length > 10 && (
          <div className="text-center mt-8">
            <button className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Order #{selectedSale.id}</h2>
                  {selectedSale.invoiceNumber && (
                    <p className="text-sm text-orange-600 font-semibold mt-1">
                      {selectedSale.invoiceNumber}
                    </p>
                  )}
                  {selectedSale.orderNumber && (
                    <p className="text-sm text-slate-700 font-medium">
                      Order: {selectedSale.orderNumber}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(selectedSale.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short", 
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-8 py-6">
              <div className="mb-6">
                <div className="text-sm text-slate-600 mb-2">Cashier</div>
                <div className="text-base font-semibold text-slate-800">{selectedSale.cashier.name}</div>
                <div className="text-sm text-slate-500">{selectedSale.cashier.email}</div>
              </div>

              {selectedSale.customer && (
                <div className="mb-6">
                  <div className="text-sm text-slate-600 mb-2">Customer</div>
                  <div className="text-base font-semibold text-slate-800">{selectedSale.customer.name}</div>
                  <div className="text-sm text-slate-500">{selectedSale.customer.phone}</div>
                  {selectedSale.customer.email && (
                    <div className="text-sm text-slate-500">{selectedSale.customer.email}</div>
                  )}
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-700 mb-3">Order Items</div>
                <div className="space-y-2">
                  {Array.isArray(selectedSale?.items) && selectedSale.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-slate-500">
                        ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-orange-500">
                      ${Number(item.lineTotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${Number(selectedSale.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax</span>
                  <span className="font-semibold">${Number(selectedSale.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-orange-500 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>${Number(selectedSale.total).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSale(null)}
                className="mt-6 w-full py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
