// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext"; // Changed to useAuth
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import heroBg from "@/assets/images/heroBg.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    const loadingToast = toast.loading("Signing in...");

    try {
      // Use the context login function
      const result = await login(formData.email, formData.password);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Successfully logged in!", {
          icon: (
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          duration: 3000,
        });

        // Navigate directly to dashboard - no timeout needed
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#0A1A2F]">
      {/* Hero Background */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 25, 47, 0.85), rgba(8, 20, 38, 0.9)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content - With proper z-index */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center py-14">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left column - Welcome message */}
              <div className="space-y-8 text-white">
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-bold">
                    Welcome Back
                  </h3>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Sign in to access your digital library, manage eBooks, and
                    organize course materials.
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-400">
                    By signing in, you agree to our Terms of Service and Privacy
                    Policy.
                  </p>
                </div>
              </div>

              {/* Right column - Login Form */}
              <div className="bg-transparent p-8">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Sign In
                  </h3>
                  <p className="text-gray-300">
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="font-medium text-gray-200 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-white" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white
                            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                            transition-all duration-200 text-gray-900 placeholder-gray-600"
                          placeholder="Enter your email"
                          required
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label className="font-medium text-gray-200 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-white" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 rounded-lg bg-white
                            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                            transition-all duration-200 text-gray-900 placeholder-gray-600"
                          placeholder="Enter your password"
                          required
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 
                            text-gray-600 hover:text-primary focus:outline-none transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remember Me Only - No Forgot Password */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded bg-white/10 border-white/30 text-blue-500 
                          focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-300">Remember me</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 
                      text-white font-medium rounded-lg transition-all duration-200 
                      inline-flex items-center justify-center gap-2 text-lg 
                      shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                      focus:ring-offset-transparent"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Login;
