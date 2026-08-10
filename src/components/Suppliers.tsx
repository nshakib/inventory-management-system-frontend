import { useEffect, useState } from "react";
import axios from "axios";
import type { Supplier } from "../types";
import { API_URL } from "../config/api";

const Suppliers = () => {
  const [addEditModal, setAddEditModal] = useState<
    boolean
  >(false);

  const [loading, setLoading] = useState(true);

  const [suppliers, setSuppliers] = useState<Supplier[]>(
    []
  );

  const [editSupplier, setEditSupplier] =
    useState<Supplier | null>(null);

  const [filteredSupplier, setFilteredSupplier] =
    useState<Supplier[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const fetchSuppliers = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/supplier/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      const supplierData = response.data.suppliers || [];

      setSuppliers(supplierData);
      setFilteredSupplier(supplierData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching suppliers:",
          error.response?.data || error.message
        );
      } else {
        console.error(
          "Error fetching suppliers:",
          error
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      if (editSupplier) {
        const response = await axios.put(
          `${API_URL}/api/supplier/${editSupplier._id}`,
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
          alert("Supplier updated successfully");

          setEditSupplier(null);
          setAddEditModal(false);
          resetForm();

          fetchSuppliers();
        } else {
          console.error(
            "Error updating supplier",
            response.data
          );

          alert(
            "Error updating supplier. Please try again"
          );
        }
      } else {
        const response = await axios.post(
          `${API_URL}/api/supplier/add`,
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

          setAddEditModal(false);
          resetForm();

          fetchSuppliers();
        } else {
          console.error(
            "Error adding supplier",
            response.data
          );

          alert(
            "Error adding supplier. Please try again!"
          );
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Something went wrong. Please try again!"
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Something went wrong. Please try again!"
        );
      }
    }
  };

  const handleCancel = () => {
    setAddEditModal(false);
    setEditSupplier(null);
    resetForm();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);

    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });

    setAddEditModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/supplier/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      if (response.data.success) {
        alert("Supplier deleted successfully");
        fetchSuppliers();
      } else {
        console.error(
          "Error deleting supplier",
          response.data
        );

        alert("Error deleting supplier");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Error deleting supplier. Please try again."
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Error deleting supplier. Please try again."
        );
      }
    }
  };

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      <h1 className="text-2xl font-bold">
        Supplier Management
      </h1>

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search"
          className="border p-1 bg-white rounded px-4"
          onChange={handleSearch}
        />

        <button
          type="button"
          className="px-4 py-1.5 bg-blue-500 text-white rounded cursor-pointer"
          onClick={() => {
            setEditSupplier(null);
            resetForm();
            setAddEditModal(true);
          }}
        >
          Add Supplier
        </button>
      </div>

      {loading ? (
        <div>Loading....</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300 mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">
                  SL
                </th>

                <th className="border border-gray-300 p-2">
                  Supplier Name
                </th>

                <th className="border border-gray-300 p-2">
                  Email
                </th>

                <th className="border border-gray-300 p-2">
                  Phone Number
                </th>

                <th className="border border-gray-300 p-2">
                  Address
                </th>

                <th className="border border-gray-300 p-2">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSupplier.map(
                (supplier, index) => (
                  <tr key={supplier._id}>
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

                    <td className="border border-gray-200 p-2">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(supplier)
                          }
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 mr-2"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(supplier._id)
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filteredSupplier.length === 0 && (
            <div className="p-4 text-center">
              No Records
            </div>
          )}
        </div>
      )}

      {addEditModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-md w-1/3 relative">
            <h1 className="text-xl font-bold">
              {editSupplier
                ? "Edit Supplier"
                : "Add Supplier"}
            </h1>

            <button
              type="button"
              className="absolute top-4 right-4 font-bold text-lg cursor-pointer"
              onClick={handleCancel}
            >
              X
            </button>

            <form
              className="flex flex-col gap-4 mt-4"
              onSubmit={handleSubmit}
            >
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
                type="tel"
                placeholder="Supplier Phone Number"
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

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="w-full mt-2 p-3 bg-blue-500 text-white rounded cursor-pointer"
                >
                  {editSupplier
                    ? "Update Supplier"
                    : "Add Supplier"}
                </button>

                {editSupplier && (
                  <button
                    type="button"
                    className="w-full mt-2 rounded-md bg-red-500 text-white p-3 cursor-pointer hover:bg-red-600"
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

export default Suppliers;