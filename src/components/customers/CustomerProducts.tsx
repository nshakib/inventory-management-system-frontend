import React, { useEffect, useState } from 'react'
import axios from "axios";

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	stock: number;
	categoryId: string;
	supplierId: string;
}
const CustomerProducts = () => {
  	const [products, setProducts] = useState<Product[]>([]);
  	const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState<string | Product[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [orderData, setOrderData] = useState({
		productId: "",
		quantity: 0,
		total: 0,
		stock: 0,
		price: 0

	})
  
    const fetchProducts = async() =>{
        try {
          const response = await axios.get(
            "http://localhost:5002/api/products/get",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
              },
              withCredentials: true,
            }
          );
    
          if(response.data.success){
            setCategories(response.data.categories);
            setProducts(response.data.products);
            setFilteredProducts(response.data.products);
          }
          
        } catch (error) {
          console.error("Error fetching suppliers", error);
        }
      }
      useEffect(()=>{
        fetchProducts();
      },[]);
  
      const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
			const searchTerm = e.target.value.toLowerCase();
			setFilteredProducts(
				products.filter((product) =>
					product.name.toLowerCase().includes(searchTerm)
				)
			);
		};

		const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
			setFilteredProducts(
				products.filter((product) => product.categoryId._id === e.target.value)
			);
		}

		const handleOrderChange = (product) => {
			setOrderData({
				productId: product._id,
				quantity: 1,
				total: product.price,
				stock: product.stock,
				price: product.price
			})
			setOpenModal(true);
		}
	
	const increaseQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
		if(e.target.value > orderData.stock){
			alert("Not enough stock")
		}else{
			setOrderData((prev) => ({
				...prev,
				quantity: parseInt(e.target.value),
				total: parseInt(e.target.value) * (orderData.price)
			}));
		}
	};

	const closeModal = () => {
		setOpenModal(false);
	}

	const handleOrderSubmit = async(e: React.ChangeEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = await axios.post("http://localhost:5002/api/orders/add",orderData,{
				headers:{
					Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
				},
			})
			if(response.data.success){
				setOpenModal(false);
				setOrderData({
					productId: "",
					quantity: 1,
					total: 0,
					stock: 0,
					price: 0
				})
				alert("Order added successfully");
				fetchProducts();
			}
		} catch (error) {
			console.error("Error adding order", error);
			alert("Error adding order. Please try again"+ error.message);
		}
	}
    return (
    <div>
      <div className='py-4 px-6'>
        <h2 className='font-bold text-xl'>Products</h2>
      </div>
      <div className='py-4 px-6 flex justify-between items-center'>
        <div>
          <select name='category' id='' className='border p-2 bg-white rounded'
		  onChange={handleCategoryChange}>
			<option value="">Select Category</option>
			{categories?.map((category) => (
			  <option key={category._id} value={category._id}>
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
                onChange={handleSearch}
            />
        </div>
      </div>
      <div>
		<table className="w-full border-collapse border border-gray-300 mt-4">
			<thead>
				<tr className="bg-gray-200">
					<th className="border border-gray-300 p-2">SL</th>
					<th className="border border-gray-300 p-2">
						Product Name
					</th>
					<th className="border border-gray-300 p-2">Category Name</th>
					<th className="border border-gray-300 p-2">
						Price
					</th>
					<th className="border border-gray-300 p-2">Stock</th>
					<th className="border border-gray-300 p-2">Action</th>
				</tr>
			</thead>
				<tbody>
					{filteredProducts?.map((product, index) => (
						<tr key={product._id}>
							<td className="border border-gray-300 p-2 text-center">
								{index + 1}
							</td>
							<td className="border border-gray-300 p-2 text-center">
								{product.name}
							</td>
							<td className="border border-gray-300 p-2 text-center">
								{product.categoryId.categoryName}
							</td>
							
							<td className="border border-gray-300 p-2 text-center">
								{product.price}
							</td>
							<td className="border border-gray-300 p-2 text-center">
								<span>
									{product.stock === 0 
										? <span className="bg-red-100 text-red-500">{product.stock}</span>
										: product.stock < 5 
										? <span className="bg-yellow-100 text-yellow-600">{product.stock}</span>
										: <span className="bg-green-100 text-green-500">{product.stock}</span>
									}
								</span>
							</td>
							<td className="border border-gray-200 p-2 flex items-center justify-center">
								<button
									className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded-md mr-2 cursor-pointer"
									onClick={() => handleOrderChange(product)}>
									Order
								</button>
							</td>
						</tr>
					))}
				</tbody>
		</table>
			{filteredProducts.length === 0 && <div>No Records</div>}
		</div>

		{openModal && (
				<div
					className="fixed top-0 left-0 w-full h-full bg-black/50
									  flex justify-center items-center">
					<div className="bg-white p-4 rounded shadow-md w-1/3 relative">
						<h1 className="text-xl font-bold">Place Order</h1>
						<button
							className="absolute top-4 right-4 font-bold text-lg cursor-pointer"
							onClick={closeModal}>
							X
						</button>
						<form
							onSubmit={handleOrderSubmit}
							className="flex flex-col gap-4 mt-4">
							<input
								className="border p-1 bg-white rounded px-4"
								name="quantity"
								value={orderData.quantity}
								onChange={increaseQuantity}
								min={1}
								type="number"
								placeholder="Increment Quantity"
								required
							/>
							<p>{orderData.quantity * orderData.price}</p>
							
							<div className="flex space-x-2">
								<button className="w-full mt-2 p-3 bg-blue-500 text-white rounded cursor-pointer">
									Save Change
								</button>
								<button
									type="button"
									className="w-full mt-2 rounded-md bg-red-500 text-white p-3
													cursor-pointer hover:bg-red-600"
									onClick={closeModal}>
									Cancel
								</button>
								
							</div>
						</form>
					</div>
				</div>
			)}
    </div>
  )
}

export default CustomerProducts