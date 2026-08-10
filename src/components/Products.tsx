import React, { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import type { Product, Category, Supplier } from "../types";

// interface Product {
// 	id: string;
// 	name: string;
// 	description: string;
// 	price: number;
// 	stock: number;
// 	categoryId: string;
// 	supplierId: string;
// }
const Products = () => {
	const [openModal, setOpenModal] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [editProduct, setEditProduct] = useState<Product | null>(null);
	const [filteredProducts, setFilteredProducts] = useState<string | Product[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price:"",
		stock:"",
		categoryId: "",
		supplierId: "",
	});


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
				setSuppliers(response.data.suppliers);
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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async(e: FormEvent) => {
		e.preventDefault();

		if(editProduct){
			try {
			const response = await axios.put(
				`http://localhost:5002/api/products/${editProduct}`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
					},
					withCredentials: true,
				}
			)

			if(response.data.success){
				alert("Product updated successfully");
				setOpenModal(false);
				setEditProduct(null);
				fetchProducts();
				// Reset form
				setFormData({
					name: "",
					description: "",
					price: "",
					stock: "",
					categoryId: "",
					supplierId: "",
				});
			}else{
				console.error("Error updated product", response.data);
				alert("Error updating product. Please try again!");
			}
			} catch (error) {
				console.error("Error updating product", error);
				alert("Error updating product. Please try again!");
			}
		}else{
			
			try {
			const response = await axios.post(
				"http://localhost:5002/api/products/add",
				formData,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
					},
					withCredentials: true,
				}
			)

			if(response.data.success){
				alert("Product added successfully");
				setOpenModal(false);
				fetchProducts();
				// Reset form
				setFormData({
					name: "",
					description: "",
					price: "",
					stock: "",
					categoryId: "",
					supplierId: "",
				});
			}else{
				console.error("Error adding product", response.data);
				alert("Error adding product. Please try again!");
			}
			} catch (error) {
				console.error("Error adding product", error);
				alert("Error adding product. Please try again!");
			}
		}
	}

	const handleEdit = async (product:Product) => {
		setOpenModal(true);
		setEditProduct(product._id);

		setFormData({
			name: product.name,
			description: product.description,
			price: product.price,
			stock: product.stock,
			categoryId: product.categoryId._id,
			supplierId: product.supplierId._id,
		});
	};

	const handleCancel = async () => {
		setOpenModal(false);
		setEditProduct(null);
		setFormData({
			name: "",
			description: "",
			price: "",
			stock: "",
			categoryId: "",
			supplierId: "",
		});
	};

	const handleDelete = async(id) =>{
		const confirmDelete = window.confirm(
			"Are you sure want to delete this product"
		);
		if (confirmDelete) {
			try {
				const response = await axios.delete(
					`http://localhost:5002/api/products/${id}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"pos-token"
							)}`,
						},
					}
				);
				if (response.data.success) {
					alert("Product Delete successfully");
					fetchProducts();
				} else {
					console.error("Error deleting product", response.data);
					alert("Error deleting product");
				}
			} catch (error) {
				console.error("Error fecthing product", error);
				alert("Error deleting product. Please try again");
			}
		}
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchTerm = e.target.value.toLowerCase();
			setFilteredProducts(
				products.filter((product)=>
				product.name.toLowerCase().includes(searchTerm)
				)
			)
		};
	return (
		<div className="w-full h-full flex flex-col gap-4 p-4">
			<h1 className="text-2xl font-bold">Product Management</h1>
			<div className="flex justify-between items-center">
				<input
					type="text"
					placeholder="Search"
					className="border p-1 bg-white rounded px-4"
					onChange={handleSearch}
				/>
				<div className="flex space-x-2"></div>
				<button
					className="px-4 py-1.5 bg-blue-500 text-white rounded cursor-pointer"
					onClick={() => setOpenModal(true)}>
					Add Product
				</button>
			</div>

			{/* product list */}
			<div>
				<table className="w-full border-collapse border border-gray-300 mt-4">
					<thead>
						<tr className="bg-gray-200">
							<th className="border border-gray-300 p-2">SL</th>
							<th className="border border-gray-300 p-2">
								Product Name
							</th>
							<th className="border border-gray-300 p-2">Category Name</th>
							<th className="border border-gray-300 p-2">Supplier Name</th>
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
									{product.supplierId.name}
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
										onClick={() => handleEdit(product)}
										className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 mr-2 cursor-pointer">
										Edit
									</button>
									<button
										onClick={() => handleDelete(product._id)}
										className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 cursor-pointer">
										Delete
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
						<h1 className="text-xl font-bold">{ editProduct ? "Update Product" : "Add products"}</h1>
						<button
							className="absolute top-4 right-4 font-bold text-lg cursor-pointer"
							onClick={() => setOpenModal(false)}>
							X
						</button>
						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-4 mt-4">
							<input
								className="border p-1 bg-white rounded px-4"
								name="name"
								value={formData.name}
								onChange={handleChange}
								type="text"
								placeholder="Product Name"
								required
							/>
							<input
								className="border p-1 bg-white rounded px-4"
								name="description"
								value={formData.description}
								onChange={handleChange}
								type="text"
								placeholder="Description"
								required
							/>
							<input
								className="border p-1 bg-white rounded px-4"
								name="price"
								value={formData.price}
								onChange={handleChange}
								type="number"
								placeholder="Enter Price"
								required
							/>
							<input
								className="border p-1 bg-white rounded px-4"
								name="stock"
								min={0}
								value={formData.stock}
								onChange={handleChange}
								type="number"
								placeholder="Enter Stock"
								required
							/>

							<div className="w-full border p-1 px-4 rounded bg-white">
								<select
									name="categoryId"
									value={formData.categoryId}
									className="w-full outline-none bg-white"
									onChange={handleChange}
									required>
									<option value="">Select Category</option>
									{categories &&
										categories?.map((category) => (
											<option
												key={category._id}
												value={category._id}>
												{category.categoryName}
											</option>
										))}
								</select>
							</div>
							<div className="w-full border p-1 px-4 rounded bg-white">
								<select
									name="supplierId"
									value={formData.supplierId}
									className="w-full outline-none bg-white"
									onChange={handleChange}
									required>
									<option value="">Select Supplier</option>
									{suppliers &&
										suppliers.map((supplier) => (
											<option
												key={supplier._id}
												value={supplier._id}>
												{supplier.name}
											</option>
										))}
								</select>
							</div>
							<div className="flex space-x-2">
								<button className="w-full mt-2 p-3 bg-blue-500 text-white rounded cursor-pointer">
									{editProduct ? "Update Product": "Add Product"}
								</button>
								{editProduct && (
									<button
										type="button"
										className="w-full mt-2 rounded-md bg-red-500 text-white p-3
														cursor-pointer hover:bg-red-600"
										onClick={handleCancel}
										>
										Cancel
									</button>
								)}
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Products;
