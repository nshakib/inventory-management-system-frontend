import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  

  useEffect(() => {
    const performLogout = async () => {
      await logout(); // Clear tokens/user data
      navigate('/login', { replace: true }); // Redirect to login
    };
    
    performLogout();
  }, [logout, navigate]);

  return <div>Logging out...</div>; // Loading state
  
};

export default Logout;
