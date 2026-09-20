import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserPlus, FaSearch, FaUsersSlash, FaEye, FaEyeSlash } from "react-icons/fa";
import { API_URL } from "../config/api";
import { useToast } from "../context/ToastContext";
import Button from "./ui/Button";

interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  role: string;
}

// Shared input styling so this form matches Products/Categories/etc.
const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

// Role shown as a colored badge (with text, not color alone) instead of
// plain capitalized text, so it's scannable in a long list.
const roleBadge = (role: string) => {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {role}
    </span>
  );
};

const Users = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      const userData = response.data.users || [];

      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error fetching users.",
          "error"
        );
      } else {
        showToast("Error fetching users.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/api/users/add`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        showToast("User added successfully", "success");

        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "",
        });

        fetchUsers();
      } else {
        showToast("Error adding user. Please try again.", "error");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error adding user. Please try again.",
          "error"
        );
      } else {
        showToast("Error adding user. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Delete "${name}"? This cannot be undone.`);

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        showToast("User deleted successfully", "success");
        fetchUsers();
      } else {
        showToast("Error deleting user", "error");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error deleting user. Please try again.",
          "error"
        );
      } else {
        showToast("Error deleting user. Please try again.", "error");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchUser = e.target.value.toLowerCase();

    setFilteredUsers(
      users.filter((user) => user.name.toLowerCase().includes(searchUser))
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>

      {/* Add User Form */}
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Add User</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              className={inputClass}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              className={inputClass}
              type="email"
              name="email"
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                className={`${inputClass} pr-10`}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-400 hover:text-gray-600
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-r-md"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="address"
              className={inputClass}
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
              className={inputClass}
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button type="submit" isLoading={submitting} className="w-full">
              <FaUserPlus size={12} aria-hidden="true" />
              Add User
            </Button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <label htmlFor="user-search" className="sr-only">
          Search users by name
        </label>

        <FaSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />

        <input
          id="user-search"
          type="text"
          placeholder="Search users..."
          className={`${inputClass} pl-9`}
          onChange={handleSearch}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">List of users with email, address, and role</caption>

            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">SL</th>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Address</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
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
                filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.address}</td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="danger"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => handleDelete(user._id, user.name)}
                        aria-label={`Delete ${user.name}`}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-gray-400">
            <FaUsersSlash size={28} aria-hidden="true" />
            <p className="text-sm">No user found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
