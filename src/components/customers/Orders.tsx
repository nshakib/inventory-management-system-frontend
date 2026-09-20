import axios from "axios";
import { useEffect, useState } from "react";
import { FaReceipt } from "react-icons/fa";
import { API_URL } from "../../config/api";
import { Order } from "../../types";
import { useToast } from "../../context/ToastContext";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/orders/get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        showToast(
          response.data.message || "Error fetching orders. Please try again.",
          "error"
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error fetching orders. Please try again.",
          "error"
        );
      } else {
        showToast("Error fetching orders. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">
          {loading ? "Loading orders..." : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Order list. overflow-x-auto keeps it usable on narrow screens. */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">List of your past orders</caption>

            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">SL</th>
                <th scope="col" className="px-4 py-3 font-medium">Product Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Quantity</th>
                <th scope="col" className="px-4 py-3 font-medium">Total Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
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
                orders.map((order, index) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.product?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.product?.categoryId?.categoryName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.quantity}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${order.totalPrice}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-gray-400">
            <FaReceipt size={28} aria-hidden="true" />
            <p className="text-sm">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;