import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { toast } from "sonner";

// API interfaces
interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
    quantity: number;
  };
}

interface Cart {
  id: number;
  user_id: number;
  cartItems: CartItem[];
}

interface CartResponse {
  cart: Cart;
  total_amount: number;
}

// Mock API service
const cartAPI = {
  getCart: async (): Promise<CartResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      cart: {
        id: 1,
        user_id: 1,
        cartItems: [
          {
            id: 1,
            cart_id: 1,
            product_id: 1,
            quantity: 2,
            product: {
              id: 1,
              name: "Premium Wireless Headphones",
              description: "High-quality wireless headphones with noise cancellation",
              price: 249.99,
              image: "/placeholder.svg",
              quantity: 50,
            },
          },
          {
            id: 2,
            cart_id: 1,
            product_id: 2,
            quantity: 1,
            product: {
              id: 2,
              name: "Smart Fitness Watch",
              description: "Advanced fitness tracking watch with heart rate monitoring",
              price: 199.99,
              image: "/placeholder.svg",
              quantity: 75,
            },
          },
        ],
      },
      total_amount: 699.97,
    };
  },

  addItem: async (productId: number, quantity: number): Promise<CartResponse> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Mock response - in real implementation, this would add the item
    return cartAPI.getCart();
  },

  updateItem: async (itemId: number, quantity: number): Promise<CartResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock response - in real implementation, this would update the quantity
    return cartAPI.getCart();
  },

  removeItem: async (itemId: number): Promise<CartResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock response - in real implementation, this would remove the item
    return cartAPI.getCart();
  },

  clearCart: async (): Promise<CartResponse> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      cart: {
        id: 1,
        user_id: 1,
        cartItems: [],
      },
      total_amount: 0,
    };
  },
};

const Cart = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      setCartData(response);
    } catch (error) {
      console.error("Failed to load cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (!cartData || newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const response = await cartAPI.updateItem(itemId, newQuantity);
      setCartData(response);
      toast.success("Cart updated");
    } catch (error) {
      console.error("Failed to update cart:", error);
      toast.error("Failed to update cart");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: number) => {
    if (!cartData) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const response = await cartAPI.removeItem(itemId);
      setCartData(response);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (!cartData) return;

    try {
      const response = await cartAPI.clearCart();
      setCartData(response);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;

    // Mock coupon validation
    const validCoupons = ["SAVE10", "WELCOME20", "STUDENT15"];
    if (validCoupons.includes(couponCode.toUpperCase())) {
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponCode("");
      toast.success(`Coupon ${couponCode.toUpperCase()} applied!`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const calculateDiscount = () => {
    if (!appliedCoupon || !cartData) return 0;
    
    const discountRates: { [key: string]: number } = {
      "SAVE10": 0.1,
      "WELCOME20": 0.2,
      "STUDENT15": 0.15,
    };
    
    return cartData.total_amount * (discountRates[appliedCoupon] || 0);
  };

  const calculateTax = () => {
    if (!cartData) return 0;
    const subtotal = cartData.total_amount - calculateDiscount();
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    if (!cartData) return 0;
    return cartData.total_amount - calculateDiscount() + calculateTax();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cartData || cartData.cart.cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <ShoppingCart className="w-24 h-24 mx-auto text-metallic-400 mb-6" />
              <h2 className="text-3xl font-bold text-metallic-900 dark:text-white mb-4">
                Your cart is empty
              </h2>
              <p className="text-metallic-600 dark:text-slate-400 mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button
                asChild
                className="bg-metallic-700 hover:bg-metallic-900"
              >
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/products">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-metallic-900 dark:text-white">
                  Shopping Cart
                </h1>
                <p className="text-metallic-600 dark:text-slate-400">
                  {cartData.cart.cartItems.length} item(s) in your cart
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartData.cart.cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-metallic-100 rounded-lg flex items-center justify-center">
                          <img
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-metallic-900 dark:text-white">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-metallic-600 dark:text-slate-400 mt-1">
                            {item.product.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="font-bold text-metallic-900 dark:text-white">
                              {formatCurrency(item.product.price)}
                            </span>
                            <Badge variant="secondary">
                              In Stock: {item.product.quantity}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="px-3 py-1 min-w-[3rem] text-center">
                              {updatingItems.has(item.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={
                                item.quantity >= item.product.quantity ||
                                updatingItems.has(item.id)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={updatingItems.has(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Coupon Code */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Coupon Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            {appliedCoupon}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeCoupon}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && applyCoupon()}
                        />
                        <Button onClick={applyCoupon} disabled={!couponCode.trim()}>
                          Apply
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartData.total_amount)}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedCoupon})</span>
                        <span>-{formatCurrency(calculateDiscount())}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency(calculateTax())}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                    
                    <Button
                      className="w-full bg-metallic-700 hover:bg-metallic-900"
                      onClick={() => navigate("/checkout")}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-metallic-600 dark:text-slate-400">
                      <Shield className="w-4 h-4 mr-2 text-green-600" />
                      Secure checkout
                    </div>
                    <div className="flex items-center text-sm text-metallic-600 dark:text-slate-400">
                      <Truck className="w-4 h-4 mr-2 text-blue-600" />
                      Free shipping on orders over $50
                    </div>
                    <div className="flex items-center text-sm text-metallic-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      30-day return policy
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;

