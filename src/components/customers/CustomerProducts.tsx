import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config/api";


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

const CustomerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>([]);

  const [openModal, setOpenModal] = useState(false);

  const [orderData, setOrderData] = useState<OrderData>({
    productId: "",
    quantity: 1,
    total: 0,
    stock: 0,
    price: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("");

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      if (response.data.success) {
        const productData = response.data.products || [];
        const categoryData =
          response.data.categories || [];

        setProducts(productData);
        setCategories(categoryData);
        setFilteredProducts(productData);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching products:",
          error.response?.data || error.message
        );
      } else {
        console.error(
          "Error fetching products:",
          error
        );
      }
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
        (product) =>
          product.categoryId?._id === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(e.target.value);
  };

  const handleOrderChange = (product: Product) => {
    if (product.stock <= 0) {
      alert("This product is out of stock");
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

  const increaseQuantity = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const quantity = Number(e.target.value);

    if (quantity > orderData.stock) {
      alert("Not enough stock");

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

  const handleOrderSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (orderData.quantity > orderData.stock) {
      alert("Not enough stock");
      return;
    }

    if (orderData.quantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }

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
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      if (response.data.success) {
        alert("Order added successfully");

        closeModal();

        await fetchProducts();
      } else {
        alert(
          response.data.message ||
            "Error adding order. Please try again."
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Error adding order. Please try again."
        );

        console.error(
          "Error adding order:",
          error.response?.data || error.message
        );
      } else {
        console.error(
          "Error adding order:",
          error
        );

        alert(
          "Error adding order. Please try again."
        );
      }
    }
  };

  return (
    <div>
      <div className="py-4 px-6">
        <h2 className="font-bold text-xl">
          Products
        </h2>
      </div>

      {/* Filters */}
      <div className="py-4 px-6 flex justify-between items-center gap-4">
        <div>
          <select
            name="category"
            className="border p-2 bg-white rounded"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search"
            className="border p-1 bg-white rounded px-4"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Product table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">
                SL
              </th>

              <th className="border border-gray-300 p-2">
                Product Name
              </th>

              <th className="border border-gray-300 p-2">
                Category Name
              </th>

              <th className="border border-gray-300 p-2">
                Price
              </th>

              <th className="border border-gray-300 p-2">
                Stock
              </th>

              <th className="border border-gray-300 p-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(
              (product, index) => (
                <tr key={product._id}>
                  <td className="border border-gray-300 p-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    {product.name}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    {product.categoryId?.categoryName ||
                      "N/A"}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    {product.price}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    {product.stock === 0 ? (
                      <span className="bg-red-100 text-red-500 px-2 py-1 rounded">
                        {product.stock}
                      </span>
                    ) : product.stock < 5 ? (
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                        {product.stock}
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-500 px-2 py-1 rounded">
                        {product.stock}
                      </span>
                    )}
                  </td>

                  <td className="border border-gray-200 p-2">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        disabled={product.stock === 0}
                        className={`text-white px-2 py-1 rounded-md mr-2 ${
                          product.stock === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-700 cursor-pointer"
                        }`}
                        onClick={() =>
                          handleOrderChange(product)
                        }
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : "Order"}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="p-4 text-center">
            No Records
          </div>
        )}
      </div>

      {/* Order Modal */}
      {openModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-md w-1/3 relative">
            <h1 className="text-xl font-bold">
              Place Order
            </h1>

            <button
              type="button"
              className="absolute top-4 right-4 font-bold text-lg cursor-pointer"
              onClick={closeModal}
            >
              X
            </button>

            <form
              onSubmit={handleOrderSubmit}
              className="flex flex-col gap-4 mt-4"
            >
              <input
                className="border p-1 bg-white rounded px-4"
                name="quantity"
                value={orderData.quantity}
                onChange={increaseQuantity}
                min={1}
                max={orderData.stock}
                type="number"
                placeholder="Quantity"
                required
              />

              <p>
                <strong>Price:</strong>{" "}
                {orderData.price}
              </p>

              <p>
                <strong>Available Stock:</strong>{" "}
                {orderData.stock}
              </p>

              <p>
                <strong>Total:</strong>{" "}
                {orderData.total}
              </p>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="w-full mt-2 p-3 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                >
                  Place Order
                </button>

                <button
                  type="button"
                  className="w-full mt-2 rounded-md bg-red-500 text-white p-3 cursor-pointer hover:bg-red-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;