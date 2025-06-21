import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Download,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const OrderSuccess = () => {
  useEffect(() => {
    // Clear cart on successful order
    // This would typically call an API to clear the user's cart
  }, []);

  // Mock order data
  const orderData = {
    id: "SS2024003",
    trackingNumber: "SS2024003",
    total: 692.97,
    paymentMethod: "ACELEDA Bank",
    estimatedDelivery: "3-5 business days",
    items: [
      {
        name: "Premium Wireless Headphones",
        quantity: 2,
        price: 249.99,
      },
      {
        name: "Smart Fitness Watch",
        quantity: 1,
        price: 199.99,
      },
    ],
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-metallic-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-metallic-600 mb-2">
              Thank you for your purchase
            </p>
            <p className="text-metallic-500">
              Your order number is{" "}
              <span className="font-semibold text-metallic-900">
                #{orderData.id}
              </span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {orderData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-metallic-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-metallic-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-metallic-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-metallic-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-metallic-600">Payment Method</span>
                      <span className="font-medium">
                        {orderData.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metallic-600">Tracking Number</span>
                      <span className="font-medium">
                        {orderData.trackingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total Paid</span>
                      <span>${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    What's Next?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-metallic-900">
                          Order Confirmed
                        </p>
                        <p className="text-sm text-metallic-600">
                          Your order has been received and confirmed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-metallic-900">
                          Processing
                        </p>
                        <p className="text-sm text-metallic-600">
                          We're preparing your items for shipment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-metallic-200 rounded-full flex items-center justify-center">
                        <Truck className="w-4 h-4 text-metallic-600" />
                      </div>
                      <div>
                        <p className="font-medium text-metallic-900">Shipped</p>
                        <p className="text-sm text-metallic-600">
                          Estimated delivery: {orderData.estimatedDelivery}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Important Info */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 mb-1">
                          Confirmation Email Sent
                        </p>
                        <p className="text-sm text-blue-800">
                          We've sent a confirmation email with your order
                          details and tracking information.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link to={`/orders/${orderData.id}`}>
                <Package className="w-4 h-4 mr-2" />
                Track Your Order
              </Link>
            </Button>

            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>

            <Button
              className="w-full sm:w-auto bg-metallic-700 hover:bg-metallic-900"
              asChild
            >
              <Link to="/">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Review Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-metallic-50 to-metallic-100 border-metallic-200">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-metallic-900 mb-2">
                  How was your shopping experience?
                </h3>
                <p className="text-metallic-600 mb-4">
                  Help other customers by sharing your experience with ShopSync
                </p>
                <Button
                  variant="outline"
                  className="border-metallic-700 text-metallic-700 hover:bg-metallic-700 hover:text-white"
                >
                  Leave a Review
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
