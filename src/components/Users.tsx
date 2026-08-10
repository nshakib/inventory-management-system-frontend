import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  role: string;
}

const Users = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      const userData = response.data.users || [];

      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching users:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error fetching users:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/users/add`,
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
        alert("User added successfully");

        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "",
        });

        fetchUsers();
      } else {
        console.error(
          "Error adding user:",
          response.data
        );

        alert(
          "Error adding user. Please try again."
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Error adding user. Please try again."
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Error adding user. Please try again."
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      if (response.data.success) {
        alert("User deleted successfully");
        fetchUsers();
      } else {
        console.error(
          "Error deleting user:",
          response.data
        );

        alert("Error deleting user");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Error deleting user. Please try again."
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Error deleting user. Please try again."
        );
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const searchUser = e.target.value.toLowerCase();

    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(searchUser)
      )
    );
  };

  if (loading) {
    return <div>Loading....</div>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">
        Users Management
      </h1>

      {/* Add User Form */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Add User
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            className="border p-2 rounded-md"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />

          <input
            className="border p-2 rounded-md"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          <input
            className="border p-2 rounded-md"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          <input
            className="border p-2 rounded-md"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                role: e.target.value,
              }))
            }
            className="border p-2 rounded-md"
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Add User
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search user"
          className="border p-2 bg-white rounded-md px-4"
          onChange={handleSearch}
        />
      </div>

      {/* Users Table */}
      <div>
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">
                SL No
              </th>

              <th className="border border-gray-300 p-2">
                Name
              </th>

              <th className="border border-gray-300 p-2">
                Email
              </th>

              <th className="border border-gray-300 p-2">
                Address
              </th>

              <th className="border border-gray-300 p-2">
                Role
              </th>

              <th className="border border-gray-300 p-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user._id}>
                <td className="border border-gray-300 p-2 text-center">
                  {index + 1}
                </td>

                <td className="border border-gray-300 p-2">
                  {user.name}
                </td>

                <td className="border border-gray-300 p-2">
                  {user.email}
                </td>

                <td className="border border-gray-300 p-2">
                  {user.address}
                </td>

                <td className="border border-gray-300 p-2 capitalize">
                  {user.role}
                </td>

                <td className="border border-gray-300 p-2 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(user._id)
                    }
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-4 text-center">
            No user found
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;