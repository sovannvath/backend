import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import api  from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface DashboardStats {
  total_income: number;
  orders_by_status: Array<{ order_status: string; count: number }>;
  orders_by_approval_status: Array<{ approval_status: string; count: number }>;
  income_by_payment_method: Array<{
    payment_method_id: number;
    payment_method_name: string;
    total_income: number;
    order_count: number;
  }>;
  recent_orders: Array<any>;
  low_stock_products: Array<any>;
  top_selling_products: Array<{
    id: number;
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  user_stats: {
    total_customers: number;
    new_customers: number;
    total_staff: number;
  };
  staff_performance: Array<{
    staff_id: number;
    staff_name: string;
    employee_id: string;
    total_processed: number;
    approved: number;
    rejected: number;
    approval_rate: number;
    revenue_generated: number;
  }>;
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

const AdminDashboardIncomeAnalytics: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [incomeAnalytics, setIncomeAnalytics] = useState<IncomeAnalytics | null>(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  // Filter states
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [analyticsPeriod, setAnalyticsPeriod] = useState("monthly");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        ...(paymentMethodFilter && { payment_method_id: paymentMethodFilter }),
      });

      const response = await api.get(`/dashboard/admin?${params}`);
      setDashboardStats(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch dashboard stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const params = new URLSearchParams({
        period: analyticsPeriod,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });

      const response = await api.get(`/dashboard/income-analytics?${params}`);
      setIncomeAnalytics(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch income analytics",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCategoryAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });

      const response = await api.get(`/dashboard/category-analytics?${params}`);
      setCategoryAnalytics(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch category analytics",
        variant: "destructive",
      });
    }
  };

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchDashboardStats();
    fetchIncomeAnalytics();
    fetchCategoryAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatChartData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      label: item.date || 
             (item.month && item.year ? `${item.year}-${String(item.month).padStart(2, '0')}` : '') ||
             (item.week ? `Week ${item.week}` : '') ||
             (item.year ? item.year.toString() : ''),
      income: parseFloat(item.income || 0),
      orders_count: parseInt(item.orders_count || 0),
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchDashboardStats();
    fetchIncomeAnalytics();
    fetchCategoryAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            Income Analytics Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive financial insights and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={applyFilters} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => handleDateRangeChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => handleDateRangeChange("end_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="analytics-period">Analytics Period</Label>
              <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardStats.total_income)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {dashboardStats.orders_by_approval_status.find(s => s.approval_status === 'approved')?.count || 0} approved orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.orders_by_status.reduce((sum, status) => sum + status.count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.orders_by_status.find(s => s.order_status === 'pending')?.count || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.user_stats.total_customers}
              </div>
              <p className="text-xs text-muted-foreground">
                +{dashboardStats.user_stats.new_customers} new this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardStats.low_stock_products.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Products need restocking
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Income Analytics Chart */}
      {incomeAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Income Trends ({analyticsPeriod})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={formatChartData(incomeAnalytics.data)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'income' ? formatCurrency(Number(value)) : value,
                      name === 'income' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders_count" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Performance */}
        {dashboardStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Revenue by Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={dashboardStats.income_by_payment_method}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payment_method_name, percent }) => 
                      `${payment_method_name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_income"
                  >
                    {dashboardStats.income_by_payment_method.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Selling Products */}
        {dashboardStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={dashboardStats.top_selling_products}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'total_revenue' ? formatCurrency(Number(value)) : value,
                      name === 'total_revenue' ? 'Revenue' : 'Quantity Sold'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="total_quantity" fill="#8884d8" name="Quantity Sold" />
                  <Bar dataKey="total_revenue" fill="#82ca9d" name="Revenue" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Performance */}
      {categoryAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Avg Revenue per Product</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryAnalytics.category_performance.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.products_count}</TableCell>
                    <TableCell>{category.total_quantity_sold}</TableCell>
                    <TableCell>{formatCurrency(category.total_revenue)}</TableCell>
                    <TableCell>
                      {formatCurrency(
                        category.products_count > 0 
                          ? category.total_revenue / category.products_count 
                          : 0
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Staff Performance */}
      {dashboardStats && dashboardStats.staff_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Staff Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Orders Processed</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead>Approval Rate</TableHead>
                  <TableHead>Revenue Generated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats.staff_performance.map((staff) => (
                  <TableRow key={staff.staff_id}>
                    <TableCell className="font-medium">{staff.staff_name}</TableCell>
                    <TableCell>{staff.employee_id}</TableCell>
                    <TableCell>{staff.total_processed}</TableCell>
                    <TableCell>
                      <Badge variant="default">{staff.approved}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{staff.rejected}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={staff.approval_rate >= 80 ? "default" : staff.approval_rate >= 60 ? "secondary" : "destructive"}
                      >
                        {staff.approval_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(staff.revenue_generated)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      {dashboardStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats.recent_orders.slice(0, 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.user?.name || 'Unknown'}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.approval_status === 'approved' ? 'default' :
                          order.approval_status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {order.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.payment_method?.name || 'Unknown'}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboardIncomeAnalytics;

