import axios from 'axios';
import React, { useEffect, useState } from 'react'

interface Product {
  name: string;
  categoryId: {
    categoryName: string;
  };
}

interface Order {
  _id: string;
  product: Product;
  quantity: number;
  totalPrice: number;
  orderDate: string;
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = async() =>{
		try {
            // console.log("Token being sent:", localStorage.getItem("pos-token"));
			const response = await axios.get("http://localhost:5002/api/orders",
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                        
					},
					withCredentials: true,
				}
			);
			 console.log("API response:", response.data); // <--- Add this line

			if(response.data.success){
                setOrders(response.data.orders);
			}else{
                console.error("Error fetching orders", response.data.message);
                alert("Error fetching orders, Please try again");
            }
			
		} catch (error) {
			console.error("Error fetching orders", error);
			alert("Error fetching orders, Please try again");
		}
	}
	useEffect(()=>{
		fetchOrders();
	},[]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
			<h1 className="text-2xl font-bold">Orders</h1>

			{/* order list */}
			<div>
				<table className="w-full border-collapse border border-gray-300 mt-4">
					<thead>
						<tr className="bg-gray-200">
							<th className="border border-gray-300 p-2">SL</th>
							<th className="border border-gray-300 p-2">Product Name</th>
							<th className="border border-gray-300 p-2">Category Name</th>
							<th className="border border-gray-300 p-2">Quantity</th>
                            <th className="border border-gray-300 p-2">Total Price</th>
							<th className="border border-gray-300 p-2">Date</th>
						</tr>
					</thead>
					<tbody>
						{orders && orders.map((order, index) => (
							<tr key={order._id}>
								<td className="border border-gray-300 p-2 text-center">
									{index + 1}
								</td>
								<td className="border border-gray-300 p-2 text-center">
									{order.product.name}
								</td>
								<td className="border border-gray-300 p-2 text-center">
									{order.product.categoryId?.categoryName}
								</td>
								<td className="border border-gray-300 p-2 text-center">
									{order.quantity}
								</td>
								<td className="border border-gray-300 p-2 text-center">
									{order.totalPrice}
								</td>
								<td className="border border-gray-300 p-2 text-center">
									{new Date(order.orderDate).toDateString()}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{orders.length === 0 && <div className='text-center mt-5'>No Records</div>}
			</div>
    </div>
  )
}

export default Orders