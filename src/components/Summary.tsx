import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

interface OutOfStockProduct {
  name: string;
  category: {
    name: string;
  };
}

interface HighestSaleProduct {
  name?: string;
  categoryName?: string;
  totalQuantity?: number;
  message?: string;
}

interface LowStockProduct {
  name: string;
  stock: number;
  categoryId: {
    categoryName: string;
  };
}

interface DashboardData {
  totalProducts: number;
  totalStock: number;
  ordersToday: number;
  revenue: number;
  outOfStock: OutOfStockProduct[];
  highestSaleProduct: HighestSaleProduct | null;
  lowStock: LowStockProduct[];
}

const Summary = () => {
  const [dashboardData, setDashboardData] =
    useState<DashboardData>({
      totalProducts: 0,
      totalStock: 0,
      ordersToday: 0,
      revenue: 0,
      outOfStock: [],
      highestSaleProduct: null,
      lowStock: [],
    });

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      console.log(response.data.dashboardData);

      setDashboardData(response.data.dashboardData);
    } catch (error: unknown) {
      console.error(
        "Error fetching dashboard data:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Error fetching dashboard data. Please try again."
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Error fetching dashboard data. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-lg font-semibold">
            Total Products
          </p>

          <p className="text-2xl font-bold">
            {dashboardData.totalProducts}
          </p>
        </div>

        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-lg font-semibold">
            Total Stocks
          </p>

          <p className="text-2xl font-bold">
            {dashboardData.totalStock}
          </p>
        </div>

        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-lg font-semibold">
            Orders Today
          </p>

          <p className="text-2xl font-bold">
            {dashboardData.ordersToday}
          </p>
        </div>

        <div className="bg-purple-500 text-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-lg font-semibold">
            Revenue
          </p>

          <p className="text-2xl font-bold">
            ${dashboardData.revenue}
          </p>
        </div>
      </div>

      {/* Dashboard Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Out of Stock */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Out of Stock Products
          </h3>

          {dashboardData.outOfStock.length > 0 ? (
            <ul className="space-y-2">
              {dashboardData.outOfStock.map(
                (product, index) => (
                  <li
                    key={index}
                    className="text-gray-600"
                  >
                    {product.name}{" "}
                    <span>
                      {product.category?.name || "N/A"}
                    </span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-gray-600">
              No products out of stock
            </p>
          )}
        </div>

        {/* Highest Selling Product */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Highest Sale Product
          </h3>

          {dashboardData.highestSaleProduct?.name ? (
            <div>
              <p>
                <strong>Name: </strong>
                {dashboardData.highestSaleProduct.name}
              </p>

              <p>
                <strong>Category: </strong>
                {dashboardData.highestSaleProduct
                  .categoryName || "N/A"}
              </p>

              <p>
                <strong>Total Units Sold: </strong>
                {dashboardData.highestSaleProduct
                  .totalQuantity ?? 0}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              {dashboardData.highestSaleProduct?.message ||
                "No sales data available"}
            </p>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Low Stock Products
          </h3>

          {dashboardData.lowStock.length > 0 ? (
            <ul className="space-y-2">
              {dashboardData.lowStock.map(
                (product, index) => (
                  <li
                    key={index}
                    className="text-gray-600"
                  >
                    <strong>{product.name}</strong> -{" "}
                    {product.stock} left{" "}
                    <span className="text-gray-400">
                      {product.categoryId?.categoryName ||
                        "N/A"}
                    </span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-gray-600">
              No products with low stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;