import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../../config/api";
import { Order} from "../../types";



const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      console.log("API response:", response.data);

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        console.error(
          "Error fetching orders:",
          response.data.message
        );

        alert(
          response.data.message ||
            "Error fetching orders. Please try again."
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching orders:",
          error.response?.data || error.message
        );

        alert(
          error.response?.data?.message ||
            "Error fetching orders. Please try again."
        );
      } else {
        console.error("Error fetching orders:", error);

        alert(
          "Error fetching orders. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">
        Orders
      </h1>

      {/* Order list */}
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
                Quantity
              </th>

              <th className="border border-gray-300 p-2">
                Total Price
              </th>

              <th className="border border-gray-300 p-2">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id}>
                <td className="border border-gray-300 p-2 text-center">
                  {index + 1}
                </td>

                <td className="border border-gray-300 p-2 text-center">
                  {order.product?.name || "N/A"}
                </td>

                <td className="border border-gray-300 p-2 text-center">
                  {order.product?.categoryId?.categoryName ||
                    "N/A"}
                </td>

                <td className="border border-gray-300 p-2 text-center">
                  {order.quantity}
                </td>

                <td className="border border-gray-300 p-2 text-center">
                  {order.totalPrice}
                </td>

                <td className="border border-gray-300 p-2 text-center">
                  {new Date(
                    order.orderDate
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center mt-5">
            No Records
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;