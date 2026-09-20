import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaTruckLoading } from "react-icons/fa";
import type { Supplier } from "../types";
import { API_URL } from "../config/api";
import { useToast } from "../context/ToastContext";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

// Shared classes so this form matches Products/Users elsewhere in the app.
const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const Suppliers = () => {
  const [addEditModal, setAddEditModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [filteredSupplier, setFilteredSupplier] = useState<Supplier[]>([]);
  const { showToast } = useToast();

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
      const response = await axios.get(`${API_URL}/api/supplier/get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      const supplierData = response.data.suppliers || [];

      setSuppliers(supplierData);
      setFilteredSupplier(supplierData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error fetching suppliers.",
          "error"
        );
      } else {
        showToast("Error fetching suppliers.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editSupplier) {
        const response = await axios.put(
          `${API_URL}/api/supplier/${editSupplier._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          showToast("Supplier updated successfully", "success");
          setEditSupplier(null);
          setAddEditModal(false);
          resetForm();
          fetchSuppliers();
        } else {
          showToast("Error updating supplier. Please try again", "error");
        }
      } else {
        const response = await axios.post(`${API_URL}/api/supplier/add`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });

        if (response.data.success) {
          showToast("Supplier added successfully", "success");
          setAddEditModal(false);
          resetForm();
          fetchSuppliers();
        } else {
          showToast("Error adding supplier. Please try again!", "error");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Something went wrong. Please try again!",
          "error"
        );
      } else {
        showToast("Something went wrong. Please try again!", "error");
      }
    } finally {
      setSubmitting(false);
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

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Delete "${name}"? This cannot be undone.`);

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/api/supplier/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        showToast("Supplier deleted successfully", "success");
        fetchSuppliers();
      } else {
        showToast("Error deleting supplier", "error");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error deleting supplier. Please try again.",
          "error"
        );
      } else {
        showToast("Error deleting supplier. Please try again.", "error");
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();

    if (!searchValue) {
      setFilteredSupplier(suppliers);
      return;
    }

    setFilteredSupplier(
      suppliers.filter((supplier) => supplier.name.toLowerCase().includes(searchValue))
    );
  };

  const handleOpenAddModal = () => {
  setEditSupplier(null);
  resetForm(); // Ensure clean state before opening
  setAddEditModal(true);
};

const handleOpenEditModal = (supplier: Supplier) => {
  setEditSupplier(supplier);
  setFormData({
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
  });
  setAddEditModal(true);
};

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
        <p className="text-sm text-gray-500">
          {loading
            ? "Loading suppliers..."
            : `${filteredSupplier.length} of ${suppliers.length} suppliers`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="supplier-search" className="sr-only">
            Search suppliers by name
          </label>

          <FaSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />

          <input
            id="supplier-search"
            type="text"
            placeholder="Search suppliers..."
            className={`${inputClass} pl-9`}
            onChange={handleSearch}
          />
        </div>

        <Button
          onClick={() => {
            handleOpenAddModal();
            setEditSupplier(null);
            resetForm();
            setAddEditModal(true);
          }}
          className="w-full sm:w-auto"
        >
          <FaPlus size={12} aria-hidden="true" />
          Add Supplier
        </Button>
      </div>

      {/* Supplier list. overflow-x-auto keeps it usable on narrow screens. */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">List of suppliers with email, phone, and address</caption>

            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">SL</th>
                <th scope="col" className="px-4 py-3 font-medium">Supplier Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Phone Number</th>
                <th scope="col" className="px-4 py-3 font-medium">Address</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Action</th>
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
                filteredSupplier.map((supplier, index) => (
                  <tr key={supplier._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{supplier.name}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.email}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="warning"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => handleEdit(supplier)}
                          aria-label={`Edit ${supplier.name}`}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => handleDelete(supplier._id, supplier.name)}
                          aria-label={`Delete ${supplier.name}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredSupplier.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-gray-400">
            <FaTruckLoading size={28} aria-hidden="true" />
            <p className="text-sm">No suppliers found</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={addEditModal}
        onClose={handleCancel}
        title={editSupplier ? "Edit Supplier" : "Add Supplier"}
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="supplier-name" className="mb-1 block text-sm font-medium text-gray-700">
              Supplier Name
            </label>
            <input
              id="supplier-name"
              className={inputClass}
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text"
              required
            />
          </div>

          <div>
            <label htmlFor="supplier-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="supplier-email"
              className={inputClass}
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
            />
          </div>

          <div>
            <label htmlFor="supplier-phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="supplier-phone"
              className={inputClass}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              required
            />
          </div>

          <div>
            <label htmlFor="supplier-address" className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="supplier-address"
              className={inputClass}
              name="address"
              value={formData.address}
              onChange={handleChange}
              type="text"
              required
            />
          </div>

          {/* Same action pair for both Add and Edit flows. */}
          <div className="mt-2 flex gap-2">
            <Button type="submit" isLoading={submitting} className="w-full">
              {editSupplier ? "Update Supplier" : "Add Supplier"}
            </Button>

            <Button type="button" variant="secondary" className="w-full" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;