import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaBoxOpen } from "react-icons/fa";
import type { Product, Category, Supplier } from "../types";
import { API_URL } from "../config/api";
import { useToast } from "../context/ToastContext";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

// Shared classes so every field in this form (and future forms) looks
// and behaves the same: consistent padding, border, and focus ring.
const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const Products = () => {
  const [openModal, setOpenModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    supplierId: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      supplierId: "",
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/products/get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setSuppliers(response.data.suppliers || []);
        setCategories(response.data.categories || []);
        setProducts(response.data.products || []);
        setFilteredProducts(response.data.products || []);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error fetching products.",
          "error"
        );
      } else {
        showToast("Error fetching products.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      if (editProduct) {
        const response = await axios.put(
          `${API_URL}/api/products/${editProduct._id}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          showToast("Product updated successfully", "success");
          setOpenModal(false);
          setEditProduct(null);
          resetForm();
          fetchProducts();
        } else {
          showToast("Error updating product. Please try again!", "error");
        }
      } else {
        const response = await axios.post(
          `${API_URL}/api/products/add`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          showToast("Product added successfully", "success");
          setOpenModal(false);
          resetForm();
          fetchProducts();
        } else {
          showToast("Error adding product. Please try again!", "error");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Something went wrong. Please try again!",
          "error"
        );
      } else {
        showToast("Something went wrong. Please try again!", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);

    setFormData({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId._id,
      supplierId: product.supplierId._id,
    });

    setOpenModal(true);
  };

  const handleCancel = () => {
    setOpenModal(false);
    setEditProduct(null);
    resetForm();
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Delete "${name}"? This cannot be undone.`);

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        showToast("Product deleted successfully", "success");
        fetchProducts();
      } else {
        showToast("Error deleting product", "error");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error deleting product. Please try again",
          "error"
        );
      } else {
        showToast("Error deleting product. Please try again", "error");
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();

    setFilteredProducts(
      products.filter((product) => product.name.toLowerCase().includes(searchTerm))
    );
  };

  // Stock severity is conveyed with both color AND a text label/icon so
  // it doesn't rely on color perception alone.
  const stockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
          Out · {stock}
        </span>
      );
    }

    if (stock < 5) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
          Low · {stock}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
        In stock · {stock}
      </span>
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <p className="text-sm text-gray-500">
          {loading ? "Loading products..." : `${filteredProducts.length} of ${products.length} products`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="product-search" className="sr-only">
            Search products by name
          </label>

          <FaSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />

          <input
            id="product-search"
            type="text"
            placeholder="Search products..."
            className={`${inputClass} pl-9`}
            onChange={handleSearch}
          />
        </div>

        <Button
          onClick={() => {
            setEditProduct(null);
            resetForm();
            setOpenModal(true);
          }}
          className="w-full sm:w-auto"
        >
          <FaPlus size={12} aria-hidden="true" />
          Add Product
        </Button>
      </div>

      {/* Product list. overflow-x-auto keeps the table usable on
          narrow/mobile screens instead of squeezing or breaking layout. */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">List of products with category, supplier, price and stock</caption>

            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">SL</th>
                <th scope="col" className="px-4 py-3 font-medium">Product Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Supplier</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.categoryId.categoryName}</td>
                    <td className="px-4 py-3 text-gray-600">{product.supplierId.name}</td>
                    <td className="px-4 py-3 text-gray-600">${product.price}</td>
                    <td className="px-4 py-3">{stockBadge(product.stock)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="warning"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => handleEdit(product)}
                          aria-label={`Edit ${product.name}`}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => handleDelete(product._id, product.name)}
                          aria-label={`Delete ${product.name}`}
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

        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-gray-400">
            <FaBoxOpen size={28} aria-hidden="true" />
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={openModal}
        onClose={handleCancel}
        title={editProduct ? "Update Product" : "Add Product"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              id="name"
              className={inputClass}
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              id="description"
              className={inputClass}
              name="description"
              value={formData.description}
              onChange={handleChange}
              type="text"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                id="price"
                className={inputClass}
                name="price"
                min={0}
                value={formData.price}
                onChange={handleChange}
                type="number"
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="mb-1 block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                id="stock"
                className={inputClass}
                name="stock"
                min={0}
                value={formData.stock}
                onChange={handleChange}
                type="number"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              className={inputClass}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="supplierId" className="mb-1 block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <select
              id="supplierId"
              name="supplierId"
              value={formData.supplierId}
              className={inputClass}
              onChange={handleChange}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Both flows (add + edit) now offer the same pair of actions,
              so users don't have to learn two different ways to back out. */}
          <div className="mt-2 flex gap-2">
            <Button type="submit" isLoading={submitting} className="w-full">
              {editProduct ? "Update Product" : "Add Product"}
            </Button>

            <Button type="button" variant="secondary" className="w-full" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
