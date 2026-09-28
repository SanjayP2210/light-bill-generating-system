/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_APP_API_URL;

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/auth/me`);
      setUser(res?.data?.data || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
    setUser(res?.data?.data || null);
    return res?.data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await axios.post(`${apiUrl}/auth/register`, {
      name,
      email,
      password,
      confirmPassword,
    });
    setUser(res?.data?.data || null);
    return res?.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${apiUrl}/auth/logout`);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (payload) => {
    const res = await axios.put(`${apiUrl}/auth/profile`, payload);
    setUser(res?.data?.data || null);
    return res?.data;
  };

  const updateAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await axios.put(`${apiUrl}/auth/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(res?.data?.data || null);
    return res?.data;
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const res = await axios.put(`${apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setUser(res?.data?.data || null);
    return res?.data;
  };

  const deactivateAccount = async () => {
    const res = await axios.put(`${apiUrl}/auth/deactivate`);
    setUser(null);
    return res?.data;
  };

  const forgotPassword = async (email) => {
    const res = await axios.post(`${apiUrl}/auth/forgot-password`, { email });
    return res?.data;
  };

  const resetPassword = async (token, password, confirmPassword) => {
    const res = await axios.post(`${apiUrl}/auth/reset-password/${token}`, {
      password,
      confirmPassword,
    });
    return res?.data;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    deactivateAccount,
    forgotPassword,
    resetPassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
