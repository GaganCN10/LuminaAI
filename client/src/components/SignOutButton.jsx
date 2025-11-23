import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";
export default function SignOutButton() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
        );

    } catch (err) {
      console.log("Logout request failed, but clearing session anyway.", err);
    }

    // Always clear session locally
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <button 
      onClick={handleSignOut}
      style={{
        color: "white",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        backgroundColor: "green",
        width: "100px",
        borderRadius: "10px",
        marginRight: "20px",
        height: '40px',
        padding: "0"
      }}
    >
      Sign Out
    </button>
  );
}
