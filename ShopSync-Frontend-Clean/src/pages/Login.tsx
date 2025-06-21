import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { AceledaBankLogo, ABaBankLogo } from "@/components/BankLogos";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/";

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await login({
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        // Navigate to intended destination or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ ...formData, email, password });
    setIsLoading(true);

    try {
      const success = await login({ email, password });
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error(' login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 bg-gradient-to-br from-metallic-100 via-white to-metallic-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="w-12 h-12 bg-metallic-700 rounded-lg flex items-center justify-center mr-3">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-metallic-900 dark:text-white">
                    ShopSync
                  </h1>
                </div>
                <h2 className="text-4xl font-bold text-metallic-900 dark:text-white mb-6">
                  Welcome Back
                </h2>
                <p className="text-xl text-metallic-600 dark:text-slate-400 mb-8">
                  Sign in to continue your seamless shopping experience with
                  exclusive deals and fast checkout.
                </p>

                {/* Trust Indicators */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-metallic-900 dark:text-white mb-4">
                      Trusted Payment Methods
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm border">
                        <AceledaBankLogo className="w-12 h-6" />
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm border">
                        <ABaBankLogo className="w-12 h-6" />
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm border px-3 py-2">
                        <span className="text-xs font-semibold text-metallic-700">
                          VISA • MC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-metallic-700 dark:text-slate-300">
                        Secure SSL encryption
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-metallic-700 dark:text-slate-300">
                        24/7 customer support
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-metallic-700 dark:text-slate-300">
                        Fast and reliable delivery
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="w-full max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-metallic-200 dark:border-slate-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-metallic-900 dark:text-white">
                    Sign In
                  </CardTitle>
                  <p className="text-metallic-600 dark:text-slate-400">
                    Welcome back! Please sign in to your account
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-500 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-500 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                          autoComplete="current-password"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          handleInputChange("rememberMe", !!checked)
                        }
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm cursor-pointer"
                      >
                        Remember me for 30 days
                      </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-metallic-700 hover:bg-metallic-900 h-12"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Signing In...
                        </div>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <div className="relative">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-2 text-sm text-metallic-600 dark:text-slate-400">
                        New to ShopSync?
                      </span>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                      <Link
                        to="/register"
                        className="text-metallic-700 hover:text-metallic-900 font-medium"
                      >
                        Create your account
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;

