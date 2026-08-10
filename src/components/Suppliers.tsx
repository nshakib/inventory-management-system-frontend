import axios from "axios";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface Supplier {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	// Add any other supplier properties you need
}
const Suppliers = () => {
	const [addEditModal, setAddEditModal] = useState(null);
	const [loading, setLoading] = useState(true);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [editSupplier, setEditSupplier] = useState(null);
	const [filteredSupplier, setFilteredSupplier] = useState<Supplier[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
	});

	const fetchSuppliers = async () => {
		setLoading(true);
		try {
			const response = await axios.get(
				"http://localhost:5002/api/supplier/get",
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
					},
				}
			);

			setSuppliers(response.data.suppliers);
			setFilteredSupplier(response.data.suppliers);
			setLoading(false);
		} catch (error) {
			console.error("Error fecthing suppliers", error);
			setLoading(false);
		}finally{
            setLoading(false);
        }
	};

	useEffect(() => {
		fetchSuppliers();
	}, []);

	const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (editSupplier) {
			const response = await axios.put(
				`http://localhost:5002/api/supplier/${editSupplier}`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
					},
				}
			);
			if (response.data.success) {
				setEditSupplier(null);
				alert("Supplier updated successfully");
				setAddEditModal(null);
				fetchSuppliers(); //refresh category list
			} else {
				console.error("Error updating supplier");
				alert("Error updating supplier. Please try again");
			}
		} else {
			try {
				const response = await axios.post(
					"http://localhost:5002/api/supplier/add",
					formData,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"pos-token"
							)}`,
						},
					}
				);

				if (response.data.success) {
					alert("Supplier added successfully");
					setAddEditModal(null);
					fetchSuppliers();
					// Reset form
					setFormData({
						name: "",
						email: "",
						phone: "",
						address: "",
					});
				} else {
					console.error("Error adding supplier", response.data);
					alert("Error adding supplier. Please try again!");
				}
			} catch (error) {
				console.error("Error adding supplier", error);
				alert("Error adding supplier. Please try again!");
			}
		}
	};
	const handleCancel = async () => {
		setAddEditModal(null);
		setFormData({
			name: "",
			email: "",
			phone: "",
			address: "",
		});
		setEditSupplier(null);
	};

	const handleEdit = async (supplier) => {
		setEditSupplier(supplier._id);
		setFormData({
			name: supplier.name,
			email: supplier.email,
			phone: supplier.phone,
			address: supplier.address,
		});
		setAddEditModal(supplier._id);
	};

	const handleDelete = async (id) => {
		const confirmDelete = window.confirm(
			"Are you sure want to delete this supplier"
		);
		if (confirmDelete) {
			try {
				const response = await axios.delete(
					`http://localhost:5002/api/supplier/${id}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"pos-token"
							)}`,
						},
					}
				);
				if (response.data.success) {
					alert("Supplier Delete successfully");
					fetchSuppliers();
				} else {
					console.error("Error deleting category", response.data);
					alert("Error deleting supplier");
				}
			} catch (error) {
				if(error.response.data.message){
                              alert(error.response.data.message);
                        }else{
                             alert("Error deleting supplier. Please try again");
                        }
				
			}
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value.toLowerCase();

		if (!searchValue) {
			setFilteredSupplier(suppliers);
			return;
		}

		const filtered = suppliers.filter((supplier) =>
			supplier.name.toLowerCase().includes(searchValue)
		);
		setFilteredSupplier(filtered);
	};
	return (
		<div className="w-full h-full flex flex-col gap-4 p-4">
			<h1 className="text-2xl font-bold">Supplier Management</h1>
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
					onClick={() => setAddEditModal(1)}>
					Add Supplier
				</button>
			</div>

			{loading ? (
				<div>Loading.... </div>
			) : (
				<div>
					<table className="w-full border-collapse border border-gray-300 mt-4">
						<thead>
							<tr className="bg-gray-200">
								<th className="border border-gray-300 p-2">SL</th>
								<th className="border border-gray-300 p-2">
									Supplier Name
								</th>
								<th className="border border-gray-300 p-2">Email</th>
								<th className="border border-gray-300 p-2">
									Phone Number
								</th>
								<th className="border border-gray-300 p-2">Address</th>
								<th className="border border-gray-300 p-2">Action</th>
							</tr>
						</thead>
						<tbody>
							{filteredSupplier.map((supplier, index) => (
								<tr key={index}>
									<td className="border border-gray-300 p-2">
										{index + 1}
									</td>
									<td className="border border-gray-300 p-2">
										{supplier.name}
									</td>
									<td className="border border-gray-300 p-2">
										{supplier.email}
									</td>
									<td className="border border-gray-300 p-2">
										{supplier.phone}
									</td>
									<td className="border border-gray-300 p-2">
										{supplier.address}
									</td>
									<td className="border border-gray-200 p-2 flex items-center justify-center">
										<button
											onClick={() => handleEdit(supplier)}
											className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 mr-2">
											Edit
										</button>
										<button
											onClick={() => handleDelete(supplier._id)}
											className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{filteredSupplier.length === 0 && <div>No Records</div>}
				</div>
			)}

			{addEditModal && (
				<div
					className="fixed top-0 left-0 w-full h-full bg-black/50
                                          flex justify-center items-center">
					<div className="bg-white p-4 rounded shadow-md w-1/3 relative">
						<h1 className="text-xl font-bold">
							{editSupplier ? "Edit Supplier" : "Add Supplier"}
						</h1>
						<button
							className="absolute top-4 right-4 font-bold text-lg cursor-pointer"
							onClick={() => setAddEditModal(null)}>
							X
						</button>
						<form
							className="flex flex-col gap-4 mt-4"
							onSubmit={handleSubmit}>
							<input
								className="border p-1 bg-white rounded px-4"
								name="name"
								value={formData.name}
								onChange={handleChange}
								type="text"
								placeholder="Supplier Name"
								required
							/>
							<input
								className="border p-1 bg-white rounded px-4"
								name="email"
								value={formData.email}
								onChange={handleChange}
								type="email"
								placeholder="Supplier Email"
								required
							/>
							<input
								className="border p-1 bg-white rounded px-4"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								type="number"
								placeholder="Supplier Phone Nummber"
								required
							/>
							<input
								className="border p-1 bg-white rounded px-4"
								name="address"
								value={formData.address}
								onChange={handleChange}
								type="text"
								placeholder="Supplier Address"
								required
							/>
							{/* <input
								className="border p-1 bg-white rounded px-4"
								type="text"
								placeholder="Supplier Description"
							/> */}
							<div className="flex space-x-2">
								<button className="w-full mt-2 p-3 bg-blue-500 text-white rounded cursor-pointer">
									{editSupplier ? "Update Supplier" : "Add Supplier"}
								</button>
								{editSupplier && (
									<button
										type="button"
										className="w-full mt-2 rounded-md bg-red-500 text-white p-3
                                                            cursor-pointer hover:bg-red-600"
										onClick={handleCancel}>
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

export default Suppliers;
