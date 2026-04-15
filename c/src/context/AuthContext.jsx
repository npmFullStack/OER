// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import authService from "@/services/auth.service";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await checkUser();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success("Login successful!");
        return { success: true, user: response.user };
      } else {
        toast.error(response.error || "Login failed");
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.user) {
        toast.success("User registered successfully!");
        return { success: true, user: response.user };
      } else {
        toast.error(response.error || "Registration failed");
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("An error occurred during registration");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(data);
      if (response.user) {
        setUser(response.user);
        toast.success("Profile updated successfully");
        return { success: true, user: response.user };
      } else {
        toast.error(response.error || "Update failed");
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred during update");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    hasRole: (roles) => {
      if (!user) return false;
      if (typeof roles === "string") return user.role === roles;
      return roles.includes(user.role);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
