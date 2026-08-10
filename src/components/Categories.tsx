import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import type { Category } from "../types";

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/category/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      setCategories(response.data.categories || []);
    } catch (error: unknown) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      if (editCategory) {
        const response = await axios.put(
          `${API_URL}/api/category/${editCategory}`,
          {
            categoryName,
            categoryDescription,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "pos-token"
              )}`,
            },
          }
        );

        if (response.data.success) {
          setEditCategory(null);
          setCategoryName("");
          setCategoryDescription("");

          alert("Category updated successfully");
          fetchCategories();
        } else {
          console.error("Error updating category");
          alert("Error updating category. Please try again");
        }
      } else {
        const response = await axios.post(
          `${API_URL}/api/category/add`,
          {
            categoryName,
            categoryDescription,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "pos-token"
              )}`,
            },
          }
        );

        if (response.data.success) {
          setCategoryName("");
          setCategoryDescription("");

          alert("Category added successfully");
          fetchCategories();
        } else {
          console.error("Error adding category");
          alert("Error adding category. Please try again");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Something went wrong. Please try again"
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Something went wrong. Please try again");
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category._id);
    setCategoryName(category.categoryName);

    // Category interface may not contain description
    setCategoryDescription("");
  };

  const handleCancel = () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      if (response.data.success) {
        alert("Category deleted successfully");
        fetchCategories();
      } else {
        console.error(
          "Error deleting category",
          response.data
        );
        alert("Error deleting category");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Error deleting category. Please try again"
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error deleting category. Please try again");
      }
    }
  };

  if (loading) {
    return <div>Loading....</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8">
        Category Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Form */}
        <div className="lg:w-1/3">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-center text-xl font-bold mb-4">
              {editCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div>
                <input
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  type="text"
                  placeholder="Category Name"
                  className="border w-full p-2 rounded-md"
                />
              </div>

              <div>
                <input
                  value={categoryDescription}
                  onChange={(e) =>
                    setCategoryDescription(e.target.value)
                  }
                  type="text"
                  placeholder="Category Description"
                  className="border w-full p-2 rounded-md"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="w-full mt-2 rounded-md bg-green-500 text-white p-3 cursor-pointer hover:bg-green-600"
                >
                  {editCategory
                    ? "Update Category"
                    : "Add Category"}
                </button>

                {editCategory && (
                  <button
                    type="button"
                    className="w-full mt-2 rounded-md bg-red-500 text-white p-3 cursor-pointer hover:bg-red-600"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Category List */}
        <div className="lg:w-2/3">
          <div className="bg-white shadow-md rounded-lg p-4">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2">
                    SL. No
                  </th>

                  <th className="border border-gray-200 p-2">
                    Category Name
                  </th>

                  <th className="border border-gray-200 p-2">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category, index) => (
                  <tr key={category._id}>
                    <td className="border border-gray-200 p-2">
                      {index + 1}
                    </td>

                    <td className="border border-gray-200 p-2">
                      {category.categoryName}
                    </td>

                    <td className="border border-gray-200 p-2">
                      <button
                        onClick={() =>
                          handleEdit(category)
                        }
                        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mr-2"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(category._id)
                        }
                        className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;