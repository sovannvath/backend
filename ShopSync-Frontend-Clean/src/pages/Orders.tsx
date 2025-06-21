import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Star,
  Eye,
  Download,
  MessageCircle,
  RotateCcw,
  Filter,
  Calendar,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Order } from "@/lib/types";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authAPI } from "@/services/api";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [dateFilter, setDateFilter] = useState("all-time");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authAPI.getOrders();
        setOrders(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusConfig = (
    status: Order["status"],
    approvalStatus?: string
  ): { color: string; icon: React.ReactNode; label: string } => {
    if (approvalStatus === 'pending') {
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="w-3 h-3" />,
        label: "Pending Approval",
      };
    }
    
    if (approvalStatus === 'rejected') {
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <RotateCcw className="w-3 h-3" />,
        label: "Rejected",
      };
    }

    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="w-3 h-3" />,
          label: "Pending",
        };
      case "confirmed":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <CheckCircle className="w-3 h-3" />,
          label: "Confirmed",
        };
      case "processing":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <Package className="w-3 h-3" />,
          label: "Processing",
        };
      case "shipped":
        return {
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
          icon: <Truck className="w-3 h-3" />,
          label: "Shipped",
        };
      case "delivered":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-3 h-3" />,
          label: "Delivered",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <RotateCcw className="w-3 h-3" />,
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Package className="w-3 h-3" />,
          label: "Unknown",
        };
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.tracking_number?.includes(searchQuery) ||
      (Array.isArray(order.items) && order.items.some((item) =>
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ));

    const matchesStatus =
      statusFilter === "all-statuses" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  const currentOrders = Array.isArray(filteredOrders) ? filteredOrders.filter((order) =>
    ["pending", "confirmed", "processing", "shipped"].includes(order.status),
  ) : [];

  const pastOrders = Array.isArray(filteredOrders) ? filteredOrders.filter((order) =>
    ["delivered", "cancelled"].includes(order.status),
  ) : [];

  const handleReorder = (orderId: number) => {
    toast.success("Items added to cart!");
  };

  const handleTrackOrder = (trackingNumber: string) => {
    toast.info(`Tracking order: ${trackingNumber}`);
  };

  const handleDownloadInvoice = (orderId: number) => {
    toast.success("Invoice downloaded!");
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const statusConfig = getStatusConfig(order.status);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold text-metallic-900">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-metallic-600">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${statusConfig.color} border flex items-center space-x-1`}
              >
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {Array.isArray(order.items) && order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 bg-metallic-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-metallic-200 rounded-lg overflow-hidden">
                    <img
                      src={item.product.images[0]?.url || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-metallic-900 text-sm">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-metallic-600">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-metallic-900">
                      ${item.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-metallic-200">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-metallic-600">Total</p>
                  <p className="font-bold text-metallic-900">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
                {order.tracking_number && (
                  <div>
                    <p className="text-sm text-metallic-600">Tracking</p>
                    <p className="font-medium text-metallic-900">
                      {order.tracking_number}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${order.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>

                {order.status === "delivered" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reorder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {["processing", "shipped"].includes(order.status) &&
                  order.tracking_number && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrackOrder(order.tracking_number!)}
                    >
                      <Truck className="w-4 h-4 mr-1" />
                      Track
                    </Button>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-metallic-700 font-medium">
              Loading your orders...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-metallic-900 mb-2">
              My Orders
            </h1>
            <p className="text-metallic-600">
              Track and manage your orders from ShopSync
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4 mb-8 p-6 bg-white rounded-lg shadow-sm"
          >
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-500 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-metallic-300 focus:border-metallic-700"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-metallic-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40 border-metallic-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="last-30">Last 30 Days</SelectItem>
                  <SelectItem value="last-90">Last 90 Days</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Orders Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:w-1/2">
                <TabsTrigger value="current">
                  Current Orders ({currentOrders.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  Order History ({pastOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="mt-6">
                {Array.isArray(currentOrders) && currentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {currentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <OrderCard order={order} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-metallic-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-metallic-600 mb-2">
                      No current orders
                    </h3>
                    <p className="text-metallic-500 mb-6">
                      You don't have any active orders at the moment
                    </p>
                    <Button
                      asChild
                      className="bg-metallic-700 hover:bg-metallic-900"
                    >
                      <Link to="/">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                {Array.isArray(pastOrders) && pastOrders.length > 0 ? (
                  <div className="space-y-4">
                    {pastOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <OrderCard order={order} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Clock className="w-16 h-16 text-metallic-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-metallic-600 mb-2">
                      No order history
                    </h3>
                    <p className="text-metallic-500">
                      Your completed orders will appear here
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;


