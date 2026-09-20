import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaShoppingBag, FaBoxOpen } from "react-icons/fa";
import { API_URL } from "../../config/api";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface Category {
  _id: string;
  categoryName: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: {
    _id: string;
    categoryName: string;
  };
  supplierId?: {
    _id: string;
    name: string;
  };
}

interface OrderData {
  productId: string;
  quantity: number;
  total: number;
  stock: number;
  price: number;
}

// Same base field styling as the admin-side forms (Products/Suppliers/Users).
const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

// Stock severity shown with color + text, matching the admin Products page,
// instead of color alone.
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

const CustomerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const { showToast } = useToast();

  const [orderData, setOrderData] = useState<OrderData>({
    productId: "",
    quantity: 1,
    total: 0,
    stock: 0,
    price: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/products/get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        const productData = response.data.products || [];
        const categoryData = response.data.categories || [];

        setProducts(productData);
        setCategories(categoryData);
        setFilteredProducts(productData);
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

  /*
   * Search + Category filter
   */
  useEffect(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categoryId?._id === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleOrderChange = (product: Product) => {
    if (product.stock <= 0) {
      showToast("This product is out of stock", "error");
      return;
    }

    setOrderData({
      productId: product._id,
      quantity: 1,
      total: product.price,
      stock: product.stock,
      price: product.price,
    });

    setOpenModal(true);
  };

  const increaseQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Number(e.target.value);

    if (quantity > orderData.stock) {
      showToast("Not enough stock", "error");
      return;
    }

    if (quantity < 1) {
      return;
    }

    setOrderData((prev) => ({
      ...prev,
      quantity,
      total: quantity * prev.price,
    }));
  };

  const closeModal = () => {
    setOpenModal(false);

    setOrderData({
      productId: "",
      quantity: 1,
      total: 0,
      stock: 0,
      price: 0,
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (orderData.quantity > orderData.stock) {
      showToast("Not enough stock", "error");
      return;
    }

    if (orderData.quantity < 1) {
      showToast("Quantity must be at least 1", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/orders/add`,
        {
          productId: orderData.productId,
          quantity: orderData.quantity,
          total: orderData.total,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        showToast("Order placed successfully", "success");
        closeModal();
        await fetchProducts();
      } else {
        showToast(
          response.data.message || "Error adding order. Please try again.",
          "error"
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error adding order. Please try again.",
          "error"
        );
      } else {
        showToast("Error adding order. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          {loading
            ? "Loading products..."
            : `${filteredProducts.length} of ${products.length} products`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-56">
          <label htmlFor="category-filter" className="sr-only">
            Filter by category
          </label>

          <select
            id="category-filter"
            name="category"
            className={inputClass}
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

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
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">List of products available to order</caption>

            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">SL</th>
                <th scope="col" className="px-4 py-3 font-medium">Product Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
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
                    <td className="px-4 py-3 text-gray-600">
                      {product.categoryId?.categoryName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">${product.price}</td>
                    <td className="px-4 py-3">{stockBadge(product.stock)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant={product.stock === 0 ? "secondary" : "primary"}
                        disabled={product.stock === 0}
                        className="px-3 py-1.5 text-xs"
                        onClick={() => handleOrderChange(product)}
                        aria-label={
                          product.stock === 0
                            ? `${product.name} is out of stock`
                            : `Order ${product.name}`
                        }
                      >
                        <FaShoppingBag size={11} aria-hidden="true" />
                        {product.stock === 0 ? "Out of Stock" : "Order"}
                      </Button>
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

      {/* Order Modal */}
      <Modal isOpen={openModal} onClose={closeModal} title="Place Order">
        <form onSubmit={handleOrderSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="quantity"
              className={inputClass}
              name="quantity"
              value={orderData.quantity}
              onChange={increaseQuantity}
              min={1}
              max={orderData.stock}
              type="number"
              required
            />
          </div>

          <dl className="space-y-1.5 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Price</dt>
              <dd>${orderData.price}</dd>
            </div>

            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Available Stock</dt>
              <dd>{orderData.stock}</dd>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-1.5 font-semibold text-gray-900">
              <dt>Total</dt>
              <dd>${orderData.total}</dd>
            </div>
          </dl>

          <div className="flex gap-2">
            <Button type="submit" isLoading={submitting} className="w-full">
              Place Order
            </Button>

            <Button type="button" variant="secondary" className="w-full" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerProducts;