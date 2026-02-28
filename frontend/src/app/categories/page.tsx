"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Swal from "sweetalert2";

type Category = {
  id: number;
  name: string;
  image?: string;
  active: boolean;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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

  const fetchCategories = async () => {
    if (!mounted) return;
    try {
      const res = await fetch("http://localhost:4000/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error("Categories API returned non-array data:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [mounted]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("easypos_token");

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("active", String(formData.active));
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      const url = editingCategory
        ? `http://localhost:4000/categories/${editingCategory.id}`
        : "http://localhost:4000/categories";
      
      const method = editingCategory ? "PATCH" : "POST";

      await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      setShowModal(false);
      resetForm();
      fetchCategories();
      Swal.fire({
        title: "Success!",
        text: editingCategory ? "Category updated successfully" : "Category created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to save category",
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    }
  };

  const handleEdit = (category: Category) => {
    const token = localStorage.getItem("easypos_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setEditingCategory(category);
    setFormData({
      name: category.name,
      active: category.active,
    });
    if (category.image) {
      setImagePreview(`http://localhost:4000${category.image}`);
    }
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("easypos_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:4000/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await fetchCategories();
      Swal.fire({
        title: "Deleted!",
        text: "Category has been deleted.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete category",
        icon: "error",
        confirmButtonColor: "#f97316"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", active: true });
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview("");
  };

  const openAddModal = () => {
    const token = localStorage.getItem("easypos_token");
    if (!token) {
      router.push("/login");
      return;
    }
    resetForm();
    setShowModal(true);
  };

  if (!mounted) {
    return (
      <AppLayout user={null}>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Categories</h1>
          {user && (
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              + Add Category
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(categories) && categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Category Image */}
              <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
                {category.image ? (
                  <img
                    src={`http://localhost:4000${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">📁</span>
                )}
              </div>

              {/* Category Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    {category.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Action Buttons */}
                {user && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Active
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    {editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
