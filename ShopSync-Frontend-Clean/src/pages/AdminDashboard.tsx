import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// API interfaces
interface DashboardStats {
  total_income: number;
  orders_by_status: Array<{ order_status: string; count: number }>;
  recent_orders: Array<{
    id: number;
    user: { name: string; email: string };
    total_amount: number;
    order_status: string;
    created_at: string;
    orderItems: Array<{ product: { name: string }; quantity: number }>;
  }>;
  low_stock_products: Array<{
    id: number;
    name: string;
    quantity: number;
    low_stock_threshold: number;
  }>;
  top_selling_products: Array<{
    id: number;
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  user_stats: {
    total_customers: number;
    new_customers: number;
  };
}

interface IncomeAnalytics {
  period: string;
  data: Array<{
    date?: string;
    week?: string;
    month?: number;
    year?: number;
    income: number;
    orders_count: number;
  }>;
  total_income: number;
  total_orders: number;
}

interface CategoryAnalytics {
  category_performance: Array<{
    id: number;
    name: string;
    products_count: number;
    total_quantity_sold: number;
    total_revenue: number;
  }>;
}

interface DashboardSummary {
  current_stats: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
  };
  previous_stats: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
  };
  changes: {
    revenue_change: number;
    orders_change: number;
    customers_change: number;
  };
}

// Mock API service
const adminAPI = {
  getDashboardData: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      total_income: 125420.5,
      orders_by_status: [
        { order_status: "Pending", count: 15 },
        { order_status: "Processing", count: 8 },
        { order_status: "Shipped", count: 12 },
        { order_status: "Delivered", count: 45 },
      ],
      recent_orders: [
        {
          id: 1,
          user: { name: "Alice Johnson", email: "alice@example.com" },
          total_amount: 299.99,
          order_status: "Processing",
          created_at: "2024-01-20T10:30:00Z",
          orderItems: [
            { product: { name: "Wireless Headphones" }, quantity: 1 },
            { product: { name: "Phone Case" }, quantity: 2 },
          ],
        },
        {
          id: 2,
          user: { name: "Bob Wilson", email: "bob@example.com" },
          total_amount: 159.5,
          order_status: "Shipped",
          created_at: "2024-01-20T09:15:00Z",
          orderItems: [
            { product: { name: "USB Cable" }, quantity: 3 },
          ],
        },
      ],
      low_stock_products: [
        { id: 1, name: "Wireless Mouse", quantity: 3, low_stock_threshold: 10 },
        { id: 2, name: "Keyboard Cover", quantity: 1, low_stock_threshold: 15 },
      ],
      top_selling_products: [
        { id: 1, name: "Wireless Headphones", total_quantity: 324, total_revenue: 81000 },
        { id: 2, name: "Smart Watch", total_quantity: 289, total_revenue: 67500 },
      ],
      user_stats: {
        total_customers: 1250,
        new_customers: 45,
      },
    };
  },

  getIncomeAnalytics: async (period: string = "monthly"): Promise<IncomeAnalytics> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const monthlyData = [
      { month: 1, year: 2024, income: 12000, orders_count: 145 },
      { month: 2, year: 2024, income: 19000, orders_count: 221 },
      { month: 3, year: 2024, income: 15000, orders_count: 167 },
      { month: 4, year: 2024, income: 25000, orders_count: 289 },
      { month: 5, year: 2024, income: 22000, orders_count: 256 },
      { month: 6, year: 2024, income: 30000, orders_count: 342 },
    ];
    return {
      period,
      data: monthlyData,
      total_income: monthlyData.reduce((sum, item) => sum + item.income, 0),
      total_orders: monthlyData.reduce((sum, item) => sum + item.orders_count, 0),
    };
  },

  getCategoryAnalytics: async (): Promise<CategoryAnalytics> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      category_performance: [
        { id: 1, name: "Electronics", products_count: 45, total_quantity_sold: 1250, total_revenue: 125000 },
        { id: 2, name: "Accessories", products_count: 32, total_quantity_sold: 890, total_revenue: 45000 },
        { id: 3, name: "Mobile", products_count: 28, total_quantity_sold: 567, total_revenue: 78000 },
      ],
    };
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      current_stats: {
        total_revenue: 125420.5,
        total_orders: 1234,
        total_customers: 1250,
        total_products: 156,
      },
      previous_stats: {
        total_revenue: 112000,
        total_orders: 1100,
        total_customers: 1180,
      },
      changes: {
        revenue_change: 12.0,
        orders_change: 12.2,
        customers_change: 5.9,
      },
    };
  },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeAnalytics | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryAnalytics | null>(null);
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "analytics") {
      loadIncomeAnalytics();
    }
  }, [activeTab, period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, summary, categories] = await Promise.all([
        adminAPI.getDashboardData(),
        adminAPI.getDashboardSummary(),
        adminAPI.getCategoryAnalytics(),
      ]);
      setDashboardData(dashboard);
      setSummaryData(summary);
      setCategoryData(categories);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadIncomeAnalytics = async () => {
    try {
      const analytics = await adminAPI.getIncomeAnalytics(period);
      setIncomeData(analytics);
    } catch (error) {
      console.error("Failed to load income analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (activeTab === "analytics") {
      await loadIncomeAnalytics();
    }
    setRefreshing(false);
    toast.success("Dashboard data refreshed");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Processing: "bg-blue-100 text-blue-800 border-blue-300",
      Shipped: "bg-purple-100 text-purple-800 border-purple-300",
      Delivered: "bg-green-100 text-green-800 border-green-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return variants[status as keyof typeof variants] || variants.Pending;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const formatChartData = (data: IncomeAnalytics["data"]) => {
    return data.map((item) => ({
      name: item.month ? `${item.year}-${String(item.month).padStart(2, "0")}` : item.date || item.week,
      income: item.income,
      orders: item.orders_count,
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-metallic-700" />
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
            <div>
              <h1 className="text-3xl font-bold text-metallic-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-metallic-600 dark:text-slate-400">
                Monitor your business performance and manage operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button className="bg-metallic-700 hover:bg-metallic-900">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              {summaryData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(summaryData.current_stats.total_revenue)}
                        </div>
                        <div className={`text-xs flex items-center ${getChangeColor(summaryData.changes.revenue_change)}`}>
                          {getChangeIcon(summaryData.changes.revenue_change)}
                          <span className="ml-1">
                            {Math.abs(summaryData.changes.revenue_change).toFixed(1)}% from last period
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {summaryData.current_stats.total_orders.toLocaleString()}
                        </div>
                        <div className={`text-xs flex items-center ${getChangeColor(summaryData.changes.orders_change)}`}>
                          {getChangeIcon(summaryData.changes.orders_change)}
                          <span className="ml-1">
                            {Math.abs(summaryData.changes.orders_change).toFixed(1)}% from last period
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {summaryData.current_stats.total_customers.toLocaleString()}
                        </div>
                        <div className={`text-xs flex items-center ${getChangeColor(summaryData.changes.customers_change)}`}>
                          {getChangeIcon(summaryData.changes.customers_change)}
                          <span className="ml-1">
                            {Math.abs(summaryData.changes.customers_change).toFixed(1)}% from last period
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData?.low_stock_products.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Items need restocking
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              )}

              {/* Charts and Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                {dashboardData && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {dashboardData.top_selling_products.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-metallic-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">{index + 1}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.total_quantity} sold
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(product.total_revenue)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Recent Orders */}
                {dashboardData && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {dashboardData.recent_orders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{order.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.created_at)} • {order.orderItems.length} items
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                                <Badge className={getStatusBadge(order.order_status)}>
                                  {order.order_status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Low Stock Alert */}
              {dashboardData && dashboardData.low_stock_products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <CardHeader>
                      <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Low Stock Alert
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardData.low_stock_products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.quantity} left (min: {product.low_stock_threshold})
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Reorder
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Revenue Analytics</h2>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {incomeData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={formatChartData(incomeData.data)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "income" ? formatCurrency(Number(value)) : value,
                              name === "income" ? "Revenue" : "Orders"
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Orders Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Orders Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={formatChartData(incomeData.data)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="orders" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Category Performance */}
              {categoryData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Units Sold</TableHead>
                          <TableHead>Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryData.category_performance.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.products_count}</TableCell>
                            <TableCell>{category.total_quantity_sold.toLocaleString()}</TableCell>
                            <TableCell>{formatCurrency(category.total_revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <Button className="bg-metallic-700 hover:bg-metallic-900">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Product management interface will be implemented here.
                    <br />
                    This will include CRUD operations for products with category relationships.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Order Management</h2>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search orders..."
                    className="w-64"
                  />
                  <Button variant="outline">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {dashboardData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.recent_orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>{order.user.name}</TableCell>
                            <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(order.order_status)}>
                                {order.order_status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                                  <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

