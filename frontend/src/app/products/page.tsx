"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import AppLayout from "@/components/AppLayout";

type Category = {
  id: number;
  name: string;
  image?: string;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  price: number;
  active: boolean;
  image?: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const loadCategories = useCallback(() => {
    const token = localStorage.getItem("easypos_token");
    fetch("http://localhost:4000/categories/active", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Categories API returned unexpected data:", data);
          setCategories([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      });
  }, []);

  const loadProducts = useCallback(() => {
    const token = localStorage.getItem("easypos_token");
    console.log("Loading products with token:", token ? "Present" : "Missing");
    
    setLoading(true);
    fetch("http://localhost:4000/products?limit=1000", {
      headers: { Authorization: `Bearer ${token}` },
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
        if (Array.isArray(data.items)) {
          console.log(`Setting ${data.items.length} products from paginated response (total: ${data.total})`);
          setProducts(data.items);
        } else if (Array.isArray(data)) {
          console.log(`Setting ${data.length} products from array response`);
          setProducts(data);
        } else {
          console.error("Products API returned unexpected data:", data);
          setProducts([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const token = localStorage.getItem("easypos_token");
    console.log("ProductsPage useEffect - Token:", token ? "Present" : "Missing");
    console.log("ProductsPage useEffect - User:", user);
    
    if (!token) {
      console.log("No token, redirecting to login");
      router.push("/login");
      return;
    }

    if (user && user.role !== "admin") {
      console.log("Non-admin user, redirecting to dashboard");
      router.push("/dashboard");
      return;
    }

    // Only load data if we have a user (admin check passed) or if user is still loading (null)
    if (!user || user.role === "admin") {
      console.log("Loading categories and products");
      loadCategories();
      loadProducts();
    }
  }, [mounted, router, loadCategories, loadProducts, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("easypos_token");
    
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("categoryId", formData.categoryId);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("active", String(formData.active));
    
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      if (editingId) {
        await fetch(`http://localhost:4000/products/${editingId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      } else {
        await fetch("http://localhost:4000/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", categoryId: "", price: "", active: true });
      setImageFile(null);
      setImagePreview(null);
      loadProducts();
      Swal.fire({
        title: "Success!",
        text: editingId ? "Product updated successfully" : "Product created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to save product",
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      categoryId: product.categoryId?.toString() || "",
      price: product.price.toString(),
      active: product.active,
    });
    setImageFile(null);
    setImagePreview(product.image ? `http://localhost:4000${product.image}` : null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;
    
    const token = localStorage.getItem("easypos_token");
    try {
      const response = await fetch(`http://localhost:4000/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await loadProducts();
      Swal.fire({
        title: "Deleted!",
        text: "Product has been deleted.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete product",
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    }
  };

  const handleDeleteProductsWithoutImages = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete all products without images? This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;
    
    const token = localStorage.getItem("easypos_token");
    try {
      const response = await fetch("http://localhost:4000/products/cleanup/no-images", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const deleteResult = await response.json();
      await loadProducts();
      Swal.fire({
        title: "Deleted!",
        text: `Deleted ${deleteResult.deleted} products without images`,
        icon: "success",
        confirmButtonColor: "#f97316"
      });
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete products",
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    }
  };

  // Filter products based on search query, category, and status
  const filteredProducts = products.filter((product) => {
    // Search filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      product.name.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query) ||
      product.price.toString().includes(query);
    
    // Category filter
    const matchesCategory = categoryFilter === "All" || 
      product.categoryId?.toString() === categoryFilter;
    
    // Status filter
    const matchesStatus = statusFilter === "All" ||
      (statusFilter === "Active" && product.active) ||
      (statusFilter === "Inactive" && !product.active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setTimeout(() => setCurrentPage(1), 0);
  }, [searchQuery, categoryFilter, statusFilter]);

  if (!mounted) {
    return (
      <AppLayout user={user}>
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
    <AppLayout user={user}>
      {/* Main Content */}
      <main className="p-6 h-[82vh] overflow-y-auto bg-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Products Management</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteProductsWithoutImages}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              🗑️ Delete Products Without Images
            </button>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ name: "", categoryId: "", price: "", active: true });
                setImageFile(null);
                setImagePreview(null);
              }}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="Search by name, category, price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter("All")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === "All"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("Active")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === "Active"
                    ? "bg-green-600 text-white"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("Inactive")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === "Inactive"
                    ? "bg-red-600 text-white"
                    : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                Inactive
              </button>
            </div>

            {/* Results Count */}
            <div className="ml-auto text-sm text-slate-600">
              Showing <span className="font-semibold">{paginatedProducts.length}</span> of <span className="font-semibold">{filteredProducts.length}</span> products
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.isArray(paginatedProducts) && paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    {product.image ? (
                      <img
                        src={`http://localhost:4000${product.image}`}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                        🍕
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        product.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                      Loading products...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No products found. Click &quot;Add Product&quot; to create one.
                  </td>
                </tr>
              )}
              {!loading && products.length > 0 && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === 1
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-orange-500 text-white"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === totalPages
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-3xl bg-white px-8 py-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-800">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="flex-1 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Product Name
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      formData.active ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        formData.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-semibold ${formData.active ? 'text-green-600' : 'text-slate-500'}`}>
                    {formData.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", categoryId: "", price: "", active: true });
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
