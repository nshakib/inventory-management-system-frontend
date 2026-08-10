import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router";

import Root from "./utils/Root";
import Login from "./pages/Login";
import ProtectedRoutes from "./utils/ProtectedRoutes";

import Dashboard from "./pages/Dashboard";
import Categories from "./components/Categories";
import Suppliers from "./components/Suppliers";
import Products from "./components/Products";
import Logout from "./components/Logout";
import Users from "./components/Users";

import CustomerProducts from "./components/customers/CustomerProducts";
import Orders from "./components/customers/Orders";

import Profile from "./components/Profile";
import Summary from "./components/Summary";

function App() {
  return (
    <Router>
      <Routes>

        {/* Root */}
        <Route path="/" element={<Root />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoutes requireRole={["admin"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Summary />} />

          <Route
            path="categories"
            element={<Categories />}
          />

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="suppliers"
            element={<Suppliers />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="users"
            element={<Users />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="logout"
            element={<Logout />}
          />
        </Route>

        {/* ================= CUSTOMER ================= */}

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoutes requireRole={["customer"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route
            index
            element={<CustomerProducts />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="logout"
            element={<Logout />}
          />
        </Route>

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <p className="font-bold text-3xl mt-20 ml-20">
              Unauthorized
            </p>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;