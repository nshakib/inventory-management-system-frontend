import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

interface UserProfile {
  name: string;
  email: string;
  address: string;
  password?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [edit, setEdit] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      if (response.data.success) {
        setUser({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          address: response.data.user.address || "",
          password: "",
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching user:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error fetching user:", error);
      }

      alert(
        "Error fetching user profile. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        user,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pos-token"
            )}`,
          },
        }
      );

      if (response.data.success) {
        alert("Profile updated successfully");

        setEdit(false);

        // Clear password after successful update
        setUser((prev) => ({
          ...prev,
          password: "",
        }));
      } else {
        console.error(
          "Error updating profile",
          response.data.message
        );

        alert(
          "Error updating profile. Please try again."
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Error updating profile. Please try again."
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Error updating profile. Please try again."
        );
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold">
        User Profile
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 mt-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="name"
          >
            Name:
          </label>

          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={user.name}
            onChange={(e) =>
              setUser({
                ...user,
                name: e.target.value,
              })
            }
            disabled={!edit}
            type="text"
            id="name"
            name="name"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="email"
          >
            Email:
          </label>

          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={user.email}
            onChange={(e) =>
              setUser({
                ...user,
                email: e.target.value,
              })
            }
            disabled={!edit}
            type="email"
            id="email"
            name="email"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="address"
          >
            Address:
          </label>

          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={user.address}
            onChange={(e) =>
              setUser({
                ...user,
                address: e.target.value,
              })
            }
            disabled={!edit}
            type="text"
            id="address"
            name="address"
          />
        </div>

        {edit && (
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Password:
            </label>

            <input
              placeholder="Leave blank if you don't want to change password"
              onChange={(e) =>
                setUser({
                  ...user,
                  password: e.target.value,
                })
              }
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={user.password || ""}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {!edit ? (
          <button
            type="button"
            onClick={() => setEdit(true)}
            className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Update Profile
            </button>

            <button
              type="button"
              onClick={() => {
                fetchUser();
                setEdit(false);
              }}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;