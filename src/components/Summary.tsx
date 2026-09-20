import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaWarehouse,
  FaShoppingCart,
  FaDollarSign,
  FaExclamationTriangle,
  FaTrophy,
  FaExclamationCircle,
} from "react-icons/fa";
import { API_URL } from "../config/api";
import { useToast } from "../context/ToastContext";

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

// Each summary card carries an icon in addition to its color, so the
// meaning doesn't rely on color alone (helps colorblind users and
// gives sighted users a faster visual anchor while scanning).
const SUMMARY_CARDS = [
  { key: "totalProducts", label: "Total Products", icon: FaBoxOpen, bg: "bg-blue-600", isCurrency: false },
  { key: "totalStock", label: "Total Stock", icon: FaWarehouse, bg: "bg-emerald-600", isCurrency: false },
  { key: "ordersToday", label: "Orders Today", icon: FaShoppingCart, bg: "bg-amber-500", isCurrency: false },
  { key: "revenue", label: "Revenue", icon: FaDollarSign, bg: "bg-violet-600", isCurrency: true },
] as const;

const CardSkeleton = () => (
  <div className="animate-pulse rounded-lg bg-white p-4 shadow-md">
    <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
    <div className="h-7 w-16 rounded bg-gray-200" />
  </div>
);

const Summary = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProducts: 0,
    totalStock: 0,
    ordersToday: 0,
    revenue: 0,
    outOfStock: [],
    highestSaleProduct: null,
    lowStock: [],
  });

  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      setDashboardData(response.data.dashboardData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message ||
            "Error fetching dashboard data. Please try again.",
          "error"
        );
      } else {
        showToast("Error fetching dashboard data. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="w-full h-full p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : SUMMARY_CARDS.map(({ key, label, icon: Icon, bg, isCurrency }) => (
              <div
                key={key}
                className={`flex items-center gap-4 rounded-lg p-4 text-white shadow-md ${bg}`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Icon aria-hidden="true" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white/90">{label}</p>
                  <p className="text-2xl font-bold">
                    {isCurrency && "$"}
                    {dashboardData[key as keyof DashboardData] as number}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Dashboard Details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Out of Stock */}
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaExclamationCircle className="text-red-500" aria-hidden="true" />
            Out of Stock Products
          </h2>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : dashboardData.outOfStock.length > 0 ? (
            <ul className="space-y-2">
              {dashboardData.outOfStock.map((product, index) => (
                <li key={index} className="flex items-center justify-between text-sm text-gray-700">
                  <span>{product.name}</span>
                  <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">
                    {product.category?.name || "N/A"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No products out of stock</p>
          )}
        </div>

        {/* Highest Selling Product */}
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaTrophy className="text-amber-500" aria-hidden="true" />
            Highest Sale Product
          </h2>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : dashboardData.highestSaleProduct?.name ? (
            <dl className="space-y-1.5 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Name</dt>
                <dd>{dashboardData.highestSaleProduct.name}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Category</dt>
                <dd>{dashboardData.highestSaleProduct.categoryName || "N/A"}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Total Units Sold</dt>
                <dd>{dashboardData.highestSaleProduct.totalQuantity ?? 0}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">
              {dashboardData.highestSaleProduct?.message || "No sales data available"}
            </p>
          )}
        </div>

        {/* Low Stock */}
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaExclamationTriangle className="text-amber-500" aria-hidden="true" />
            Low Stock Products
          </h2>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : dashboardData.lowStock.length > 0 ? (
            <ul className="space-y-2">
              {dashboardData.lowStock.map((product, index) => (
                <li key={index} className="flex items-center justify-between text-sm text-gray-700">
                  <span>
                    <strong>{product.name}</strong>{" "}
                    <span className="text-gray-400">
                      ({product.categoryId?.categoryName || "N/A"})
                    </span>
                  </span>
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                    {product.stock} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No products with low stock</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
