import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
    price: number;
    image?: string;
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

interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
}

interface OrderData {
  payment_method_id: number;
  notes?: string;
  billing_address: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

// Mock API service
const checkoutAPI = {
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
              price: 249.99,
              image: "/placeholder.svg",
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
              price: 199.99,
              image: "/placeholder.svg",
            },
          },
        ],
      },
      total_amount: 699.97,
    };
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: 1,
        name: "Credit Card",
        description: "Pay with Visa, MasterCard, or American Express",
        type: "card",
        is_active: true,
      },
      {
        id: 2,
        name: "PayPal",
        description: "Pay securely with your PayPal account",
        type: "paypal",
        is_active: true,
      },
      {
        id: 3,
        name: "Bank Transfer",
        description: "Direct bank transfer",
        type: "bank_transfer",
        is_active: true,
      },
      {
        id: 4,
        name: "Digital Wallet",
        description: "Apple Pay, Google Pay, Samsung Pay",
        type: "digital_wallet",
        is_active: true,
      },
    ];
  },

  createOrder: async (orderData: OrderData) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      order: {
        id: 1,
        order_number: "ORD-ABC123DEF",
        total_amount: 699.97,
        payment_status: "Pending",
        order_status: "Pending",
      },
      transaction: {
        id: 1,
        transaction_id: "TXN-XYZ789ABC",
        payment_url: "https://payment-gateway.example.com/pay/TXN-XYZ789ABC",
        gateway_reference: "GW-REF123",
      },
    };
  },

  processPayment: async (transactionId: string, success: boolean = true) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      success,
      message: success ? "Payment completed successfully" : "Payment failed",
      order_status: success ? "Processing" : "Payment Failed",
    };
  },
};

const Checkout = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Form data
  const [billingAddress, setBillingAddress] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const [shippingAddress, setShippingAddress] = useState({
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);
      const [cartResponse, paymentMethodsResponse] = await Promise.all([
        checkoutAPI.getCart(),
        checkoutAPI.getPaymentMethods(),
      ]);
      
      setCartData(cartResponse);
      setPaymentMethods(paymentMethodsResponse);
      
      if (paymentMethodsResponse.length > 0) {
        setSelectedPaymentMethod(paymentMethodsResponse[0].id);
      }
    } catch (error) {
      console.error("Failed to load checkout data:", error);
      toast.error("Failed to load checkout data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cartData) return 0;
    return cartData.total_amount;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 50 ? 0 : 9.99; // Free shipping over $50
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          billingAddress.first_name &&
          billingAddress.last_name &&
          billingAddress.email &&
          billingAddress.phone &&
          billingAddress.address_line_1 &&
          billingAddress.city &&
          billingAddress.state &&
          billingAddress.postal_code
        );
      case 2:
        return selectedPaymentMethod !== null;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !cartData) return;

    setIsProcessing(true);
    try {
      const orderData: OrderData = {
        payment_method_id: selectedPaymentMethod,
        notes: orderNotes,
        billing_address: billingAddress,
        shipping_address: sameAsShipping ? undefined : shippingAddress,
      };

      const orderResponse = await checkoutAPI.createOrder(orderData);
      
      // Simulate payment processing
      toast.success("Order created! Processing payment...");
      
      const paymentResponse = await checkoutAPI.processPayment(
        orderResponse.transaction.transaction_id,
        true // Mock successful payment
      );

      if (paymentResponse.success) {
        toast.success("Payment completed successfully!");
        navigate(`/order-confirmation/${orderResponse.order.order_number}`);
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error("Failed to place order");
    } finally {
      setIsProcessing(false);
    }
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
            <div className="text-center py-16">
              <AlertCircle className="w-24 h-24 mx-auto text-metallic-400 mb-6" />
              <h2 className="text-3xl font-bold text-metallic-900 dark:text-white mb-4">
                Your cart is empty
              </h2>
              <p className="text-metallic-600 dark:text-slate-400 mb-8">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Button
                asChild
                className="bg-metallic-700 hover:bg-metallic-900"
              >
                <a href="/products">Continue Shopping</a>
              </Button>
            </div>
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
              <Button variant="ghost" onClick={() => navigate("/cart")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-metallic-900 dark:text-white">
                  Checkout
                </h1>
                <p className="text-metallic-600 dark:text-slate-400">
                  Complete your purchase
                </p>
              </div>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 1, title: "Shipping", icon: MapPin },
                { step: 2, title: "Payment", icon: CreditCard },
                { step: 3, title: "Review", icon: CheckCircle },
              ].map(({ step, title, icon: Icon }) => (
                <div
                  key={step}
                  className={`flex items-center space-x-2 ${
                    currentStep >= step
                      ? "text-metallic-700"
                      : "text-metallic-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step
                        ? "bg-metallic-700 text-white"
                        : "bg-metallic-200 text-metallic-400"
                    }`}
                  >
                    {currentStep > step ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-medium">{title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name *</Label>
                          <Input
                            id="first_name"
                            value={billingAddress.first_name}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                first_name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name *</Label>
                          <Input
                            id="last_name"
                            value={billingAddress.last_name}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                last_name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={billingAddress.email}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={billingAddress.phone}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                phone: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address_line_1">Address Line 1 *</Label>
                        <Input
                          id="address_line_1"
                          value={billingAddress.address_line_1}
                          onChange={(e) =>
                            setBillingAddress({
                              ...billingAddress,
                              address_line_1: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="address_line_2">Address Line 2</Label>
                        <Input
                          id="address_line_2"
                          value={billingAddress.address_line_2}
                          onChange={(e) =>
                            setBillingAddress({
                              ...billingAddress,
                              address_line_2: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={billingAddress.city}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                city: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={billingAddress.state}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                state: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postal_code">Postal Code *</Label>
                          <Input
                            id="postal_code"
                            value={billingAddress.postal_code}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                postal_code: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="same_as_shipping"
                          checked={sameAsShipping}
                          onCheckedChange={(checked) =>
                            setSameAsShipping(checked as boolean)
                          }
                        />
                        <Label htmlFor="same_as_shipping">
                          Billing address is the same as shipping address
                        </Label>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleNextStep}
                          disabled={!validateStep(1)}
                          className="bg-metallic-700 hover:bg-metallic-900"
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup
                        value={selectedPaymentMethod?.toString()}
                        onValueChange={(value) =>
                          setSelectedPaymentMethod(parseInt(value))
                        }
                      >
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className="flex items-center space-x-2 p-4 border rounded-lg"
                          >
                            <RadioGroupItem
                              value={method.id.toString()}
                              id={`payment-${method.id}`}
                            />
                            <Label
                              htmlFor={`payment-${method.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">{method.name}</div>
                                <div className="text-sm text-metallic-600 dark:text-slate-400">
                                  {method.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      <div>
                        <Label htmlFor="order_notes">Order Notes (Optional)</Label>
                        <textarea
                          id="order_notes"
                          className="w-full p-3 border rounded-lg resize-none"
                          rows={3}
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Any special instructions for your order..."
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={handlePreviousStep}>
                          Back to Shipping
                        </Button>
                        <Button
                          onClick={handleNextStep}
                          disabled={!validateStep(2)}
                          className="bg-metallic-700 hover:bg-metallic-900"
                        >
                          Review Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Review Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold mb-4">Order Items</h3>
                        <div className="space-y-3">
                          {cartData.cart.cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-metallic-50 dark:bg-slate-800 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.product.image || "/placeholder.svg"}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <div className="font-medium">
                                    {item.product.name}
                                  </div>
                                  <div className="text-sm text-metallic-600 dark:text-slate-400">
                                    Quantity: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="font-semibold">
                                {formatCurrency(item.product.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                        <div className="p-3 bg-metallic-50 dark:bg-slate-800 rounded-lg">
                          <p>
                            {billingAddress.first_name} {billingAddress.last_name}
                          </p>
                          <p>{billingAddress.address_line_1}</p>
                          {billingAddress.address_line_2 && (
                            <p>{billingAddress.address_line_2}</p>
                          )}
                          <p>
                            {billingAddress.city}, {billingAddress.state}{" "}
                            {billingAddress.postal_code}
                          </p>
                          <p>{billingAddress.phone}</p>
                          <p>{billingAddress.email}</p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h3 className="font-semibold mb-2">Payment Method</h3>
                        <div className="p-3 bg-metallic-50 dark:bg-slate-800 rounded-lg">
                          <p>
                            {
                              paymentMethods.find(
                                (m) => m.id === selectedPaymentMethod
                              )?.name
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={handlePreviousStep}>
                          Back to Payment
                        </Button>
                        <Button
                          onClick={handlePlaceOrder}
                          disabled={isProcessing}
                          className="bg-metallic-700 hover:bg-metallic-900"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Place Order
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {cartData.cart.cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span>
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          {calculateShipping() === 0
                            ? "Free"
                            : formatCurrency(calculateShipping())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(calculateTax())}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
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

export default Checkout;

