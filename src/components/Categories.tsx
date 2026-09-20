import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaListAlt } from "react-icons/fa";
import { API_URL } from "../config/api";
import type { Category } from "../types";
import { useToast } from "../context/ToastContext";
import Button from "./ui/Button";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/categories/get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      const categoryData = response.data.categories || [];

      setCategories(categoryData);
      setFilteredCategories(categoryData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error fetching categories.",
          "error"
        );
      } else {
        showToast("Error fetching categories.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editCategory) {
        const response = await axios.put(
          `${API_URL}/api/category/${editCategory}`,
          { categoryName, categoryDescription },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          setEditCategory(null);
          setCategoryName("");
          setCategoryDescription("");

          showToast("Category updated successfully", "success");
          fetchCategories();
        } else {
          showToast("Error updating category. Please try again", "error");
        }
      } else {
        const response = await axios.post(
          `${API_URL}/api/categories/add`,
          { categoryName, categoryDescription },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          setCategoryName("");
          setCategoryDescription("");

          showToast("Category added successfully", "success");
          fetchCategories();
        } else {
          showToast("Error adding category. Please try again", "error");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Something went wrong. Please try again",
          "error"
        );
      } else {
        showToast("Something went wrong. Please try again", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category._id);
    setCategoryName(category.categoryName);
    // Previously always reset to "" here, silently discarding an
    // existing description when opening it for editing.
    setCategoryDescription(category.categoryDescription ?? "");
  };

  const handleCancel = () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Delete "${name}"? This cannot be undone.`);

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/api/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        showToast("Category deleted successfully", "success");
        fetchCategories();
      } else {
        showToast("Error deleting category", "error");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error deleting category. Please try again",
          "error"
        );
      } else {
        showToast("Error deleting category. Please try again", "error");
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();

    setFilteredCategories(
      categories.filter((category) =>
        category.categoryName.toLowerCase().includes(searchTerm)
      )
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Category Management</h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Form */}
        <div className="lg:w-1/3">
          <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="categoryName" className="mb-1 block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  type="text"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="categoryDescription" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  type="text"
                  className={inputClass}
                />
              </div>

              {/* Add and Edit both offer the same pair of actions. */}
              <div className="flex gap-2">
                <Button type="submit" isLoading={submitting} className="w-full">
                  {editCategory ? "Update Category" : "Add Category"}
                </Button>

                {editCategory && (
                  <Button type="button" variant="secondary" className="w-full" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Category List */}
        <div className="lg:w-2/3">
          <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-md sm:p-6">
            <div className="relative w-full sm:max-w-xs">
              <label htmlFor="category-search" className="sr-only">
                Search categories by name
              </label>

              <FaSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />

              <input
                id="category-search"
                type="text"
                placeholder="Search categories..."
                className={`${inputClass} pl-9`}
                onChange={handleSearch}
              />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <caption className="sr-only">List of categories</caption>

                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">SL</th>
                      <th scope="col" className="px-4 py-3 font-medium">Category Name</th>
                      <th scope="col" className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 3 }).map((__, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 w-full rounded bg-gray-200" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      filteredCategories.map((category, index) => (
                        <tr key={category._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {category.categoryName}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="warning"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => handleEdit(category)}
                                aria-label={`Edit ${category.categoryName}`}
                              >
                                Edit
                              </Button>

                              <Button
                                variant="danger"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => handleDelete(category._id, category.categoryName)}
                                aria-label={`Delete ${category.categoryName}`}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && filteredCategories.length === 0 && (
                <div className="flex flex-col items-center gap-2 p-10 text-center text-gray-400">
                  <FaListAlt size={28} aria-hidden="true" />
                  <p className="text-sm">No categories found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;