import { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaUserEdit } from "react-icons/fa";
import { API_URL } from "../config/api";
import { useToast } from "../context/ToastContext";
import Button from "./ui/Button";

interface UserProfile {
  name: string;
  email: string;
  address: string;
  password?: string;
}

// Same base field styling as Products/Suppliers/Users, plus a distinct
// read-only look so it's visually obvious when the form isn't editable
// (previously a disabled input looked identical to an editable one).
const fieldClass = (editable: boolean) =>
  `w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
    editable
      ? "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      : "border-gray-200 bg-gray-50 text-gray-500"
  }`;

const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i}>
        <div className="mb-1 h-4 w-16 rounded bg-gray-200" />
        <div className="h-10 w-full rounded-md bg-gray-200" />
      </div>
    ))}
  </div>
);

const Profile = () => {
  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [edit, setEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchUser = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

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
        showToast(
          error.response?.data?.message || "Error fetching user profile. Please try again.",
          "error"
        );
      } else {
        showToast("Error fetching user profile. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, user, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        showToast("Profile updated successfully", "success");
        setEdit(false);
        setShowPassword(false);

        // Clear password after successful update
        setUser((prev) => ({
          ...prev,
          password: "",
        }));
      } else {
        showToast("Error updating profile. Please try again.", "error");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.message || "Error updating profile. Please try again.",
          "error"
        );
      } else {
        showToast("Error updating profile. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    fetchUser();
    setEdit(false);
    setShowPassword(false);
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            {edit ? "Update your account details below" : "View your account details"}
          </p>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                className={fieldClass(edit)}
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                disabled={!edit}
                type="text"
                id="name"
                name="name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                className={fieldClass(edit)}
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                disabled={!edit}
                type="email"
                id="email"
                name="email"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
                Address
              </label>

              <input
                className={fieldClass(edit)}
                value={user.address}
                onChange={(e) => setUser({ ...user, address: e.target.value })}
                disabled={!edit}
                type="text"
                id="address"
                name="address"
                required
              />
            </div>

            {edit && (
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    placeholder="Leave blank if you don't want to change password"
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={user.password || ""}
                    className={`${fieldClass(edit)} pr-10`}
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
            )}

            <div className="mt-2 flex gap-2">
              {!edit ? (
                <Button type="button" variant="warning" onClick={() => setEdit(true)}>
                  <FaUserEdit size={12} aria-hidden="true" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit" isLoading={submitting}>
                    Update Profile
                  </Button>

                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;