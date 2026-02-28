"use client";

import { useEffect, useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import CartSidebar from "@/components/CartSidebar";
import Swal from "sweetalert2";

type Category = {
  id: number;
  name: string;
  image?: string;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  price: number;
  categoryId?: number;
  category?: Category;
  image?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
};

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");

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

  // Update date on client side only and set up real-time timer
  useEffect(() => {
    if (mounted) {
      // Generate unique invoice and order numbers on mount
      setTimeout(() => {
        const now = new Date();
        const timestamp = now.getTime();
        setInvoiceNumber(`INV-${timestamp}`);
        setOrderNumber(`#${String(timestamp).slice(-6)}`);
      }, 0);
      
      // Set up interval to update date every second for real-time display
      const dateInterval = setInterval(() => {
        setCurrentDate(new Date());
      }, 1000);

      // Set initial date immediately without causing cascading renders
      setTimeout(() => {
        setCurrentDate(new Date());
      }, 0);

      // Cleanup interval on unmount
      return () => {
        clearInterval(dateInterval);
      };
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("easypos_token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch categories
    fetch("http://localhost:4000/categories/active")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((error) => {
        console.error("Categories API error:", error);
        setCategories([]);
      });

    // Fetch products  
    fetch("http://localhost:4000/products/active", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("Products API response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Products API response data:", data);
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Products API returned non-array data:", data);
          setProducts([]);
        }
      })
      .catch((error) => {
        console.error("Products API error:", error);
        // Fallback: If API fails, keep products empty
        setProducts([]);
      });

    // Fetch customers
    fetch("http://localhost:4000/customers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          console.error("Customers API returned non-array data:", data);
          setCustomers([]);
        }
      })
      .catch((error) => {
        console.error("Customers API error:", error);
        setCustomers([]);
      });
  }, [mounted, router]);

  const { subtotal, tax, total } = useMemo(() => {
    const s = cart.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const t = s * 0.1;
    return { subtotal: s, tax: t, total: s + t };
  }, [cart]);

  const totalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  if (!mounted) {
    return null;
  }

  // Create dynamic categories list with "All" option
  const categoryOptions = ["All", ...categories.map(cat => cat.name)];

  const filteredProducts = selectedCategory === "All" 
    ? (Array.isArray(products) ? products : [])
    : (Array.isArray(products) ? products.filter(p => p.category?.name === selectedCategory) : []);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (!existing) {
        return [...prev, { product, quantity: 1 }];
      }
      return prev.map((c) =>
        c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    });
  }

  function increment(product: Product) {
    setCart((prev) => {
      return prev.map((c) =>
        c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    });
  }

  function decrement(product: Product) {
    setCart((prev) => {
      return prev.map((c) => {
        if (c.product.id === product.id) {
          const newQty = c.quantity - 1;
          if (newQty < 1) {
            return c;
          }
          return { ...c, quantity: newQty };
        }
        return c;
      });
    });
  }

  function removeFromCart(product: Product) {
    setCart((prev) => prev.filter((c) => c.product.id !== product.id));
  }

  async function handleConfirm() {
    const token = localStorage.getItem("easypos_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    const saleData: {
      items: { productId: number; quantity: number }[];
      taxRate: number;
      customerId?: number;
      invoiceNumber?: string;
      orderNumber?: string;
    } = {
      items: cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
      })),
      taxRate: 0.1,
      invoiceNumber: invoiceNumber,
      orderNumber: orderNumber,
    };

    // Add customer ID if a customer is selected
    if (selectedCustomer) {
      saleData.customerId = selectedCustomer.id;
    }
    
    console.log("=== SALE CREATION REQUEST ===");
    console.log("Sale data:", saleData);
    console.log("Auth token:", token?.substring(0, 20) + "...");
    console.log("Selected customer:", selectedCustomer?.name || "None");
    
    try {
      const response = await fetch("http://localhost:4000/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });

      console.log("=== RESPONSE RECEIVED ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!response.ok) {
        let errorData = null;
        let errorText = "";
        
        try {
          if (contentType?.includes("application/json")) {
            errorData = await response.json();
            console.log("Error data (JSON):", errorData);
          } else {
            errorText = await response.text();
            console.log("Error data (Text):", errorText);
            errorData = { message: errorText };
          }
        } catch (e) {
          console.log("Failed to parse error response:", e);
        }
        
        const errorMessage = errorData?.message || errorText || response.statusText;
        console.error("=== SALE CREATION FAILED ===");
        console.error("Status:", response.status);
        console.error("Error:", errorMessage);
        
        Swal.fire({
          title: "Failed to Complete Sale",
          html: `<p><strong>HTTP ${response.status}</strong></p><p>${errorMessage}</p>`,
          icon: "error",
          confirmButtonColor: "#f97316"
        });
        return;
      }

      const result = await response.json();
      console.log("=== SALE CREATED SUCCESSFULLY ===");
      console.log("Result:", result);
      
      setShowConfirm(false);
      setShowReceipt(true);
    } catch (error) {
      console.error("=== NETWORK/FETCH ERROR ===");
      console.error("Error:", error);
      Swal.fire({
        title: "Failed to Complete Sale",
        html: `
          <p>Please check:</p>
          <ol class="text-left list-decimal ml-4">
            <li>Backend is running on port 4000</li>
            <li>Network connection is OK</li>
          </ol>
        `,
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleNewOrder() {
    setCart([]);
    setShowReceipt(false);
    // Generate new invoice and order numbers for next order
    const now = new Date();
    const timestamp = now.getTime();
    setInvoiceNumber(`INV-${timestamp}`);
    setOrderNumber(`#${String(timestamp).slice(-6)}`);
  }

  return (
    <AppLayout 
      user={user}
      selectedCategory={selectedCategory}
      onCategorySelect={setSelectedCategory}
    >
      <div className="flex h-[82vh] bg-slate-50 overflow-hidden">
        {/* Main Content - Products Grid */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Category Tabs */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex-shrink-0 border border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-[#ff6900] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-4 gap-4 overflow-y-auto flex-1 scrollbar-hide">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((c) => c.product.id === product.id);
              const qty = cartItem?.quantity ?? 0;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 flex flex-col shadow-sm hover:shadow-md transition-all border border-slate-100"
                >
                  {/* Product Image Placeholder */}
                  <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 mb-3 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={`http://localhost:4000${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">🍕</span>
                    )}
                  </div>
                  
                  {/* Product Name */}
                  <div className="mb-2">
                    <div className="text-sm font-bold text-slate-800">
                      {product.name}
                    </div>
                  </div>
                  
                  {/* Price and Controls */}
                  <div className="mt-auto">
                    <div className="text-xs text-slate-400 mb-2">Price</div>
                    <div className="text-base font-bold text-orange-500 mb-3">
                      $ {Number(product.price).toFixed(2)}
                    </div>
                    
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-orange-50 rounded-lg p-1">
                        <button
                          onClick={() => decrement(product)}
                          className="w-8 h-8 rounded-md bg-white text-orange-500 text-lg font-bold flex items-center justify-center hover:bg-orange-100 border border-orange-200"
                        >
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-sm font-bold text-white bg-orange-500 px-3 py-1 rounded">{qty}</span>
                        </div>
                        <button
                          onClick={() => increment(product)}
                          className="w-8 h-8 rounded-md bg-orange-500 text-white text-lg font-bold flex items-center justify-center hover:bg-orange-600"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - Cart */}  
        <CartSidebar
          cart={cart}
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          invoiceNumber={invoiceNumber}
          orderNumber={orderNumber}
          currentDate={currentDate}
          total={total}
          totalQuantity={totalQuantity}
          increment={increment}
          decrement={decrement}
          removeFromCart={removeFromCart}
          handlePrint={handlePrint}
          setShowConfirm={setShowConfirm}
        />
      </div>

      {/* Order Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800">Order confirmation</h2>
              <p className="text-sm text-slate-500 mt-1">
                Please confirm the order below to completed payment
              </p>
            </div>

            {/* Order Table */}
            <div className="px-8 py-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">
                      Item Name
                    </th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase pb-3">
                      QTY
                    </th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase pb-3">
                      Price
                    </th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase pb-3">
                      TAX
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase pb-3">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                  const itemTax = (Number(item.product.price) * item.quantity * 0.1);
                  const itemSubtotal = Number(item.product.price) * item.quantity + itemTax;
                    return (
                      <tr key={item.product.id} className="border-b border-slate-100">
                        <td className="py-4 text-sm text-slate-800">
                          {item.product.name}
                        </td>
                        <td className="py-4 text-sm text-slate-800 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-4 text-sm text-slate-800 text-center">
                        $ {Number(item.product.price).toFixed(2)}
                        </td>
                        <td className="py-4 text-sm text-slate-800 text-center">
                          $ {itemTax.toFixed(2)}
                        </td>
                        <td className="py-4 text-sm text-slate-800 text-right font-semibold">
                          $ {itemSubtotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>Tax</span>
                  <span className="font-semibold">$ {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-orange-500 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <div className="text-sm text-slate-600 mb-2">Payment method</div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                    <div className="flex space-x-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Credit Card</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-slate-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-orange-500 bg-white border-2 border-orange-500 hover:bg-orange-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleNewOrder}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xl"
            >
              ✕
            </button>

            {/* Receipt Content */}
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  Easy <span className="text-orange-500">Fashion</span>
                </h1>
                <p className="text-sm font-semibold text-slate-700">Fashion Retail Solution</p>
              </div>

              {/* Location Info */}
              <div className="text-center mb-6 text-sm text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Location</div>
                <div className="font-semibold">Dhaka</div>
                <div>House 23, Road 7, Dhanmondi, Dhaka 1205</div>
                <div>Dhaka, Bangladesh</div>
                <div className="text-blue-600">info@easyfashion.com.bd</div>
                <div>+880 1712-345678</div>
              </div>

              {/* Receipt Section */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-center mb-4">Receipt</h2>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice No:</span>
                    <span className="font-mono" suppressHydrationWarning={true}>{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order No:</span>
                    <span suppressHydrationWarning={true}>{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span suppressHydrationWarning={true}>{currentDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created by:</span>
                    <span suppressHydrationWarning={true}>{user?.name} ({user?.role})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created at:</span>
                    <span suppressHydrationWarning={true}>{currentDate ? `${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${currentDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}` : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Printed at:</span>
                    <span suppressHydrationWarning={true}>{currentDate ? `${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${currentDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}` : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span suppressHydrationWarning={true}>{selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : "Walk-in Customer"}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6 bg-slate-50 rounded-xl p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="text-left pb-2 font-semibold text-slate-700">Name</th>
                      <th className="text-right pb-2 font-semibold text-slate-700">Price</th>
                      <th className="text-right pb-2 font-semibold text-slate-700">Qty</th>
                      <th className="text-right pb-2 font-semibold text-slate-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product.id} className="border-b border-slate-200">
                        <td className="py-2 text-slate-800">{item.product.name}</td>
                      <td className="py-2 text-right text-slate-800">{Number(item.product.price).toFixed(2)}</td>
                      <td className="py-2 text-right text-slate-800">{item.quantity.toFixed(2)}</td>
                      <td className="py-2 text-right text-slate-800 font-semibold">{(Number(item.product.price) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Tax Amount</span>
                    <span className="font-semibold">{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold text-base">
                    <span>Grand Total</span>
                    <span>{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Paid</span>
                    <span className="font-semibold">{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold">
                    <span>Balance Due</span>
                    <span>0.00</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleNewOrder}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
