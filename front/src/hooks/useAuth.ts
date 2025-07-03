"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur:", error);
        logout();
      }
    }
  }, [logout]);

  return { user, logout };
}
