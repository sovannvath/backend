import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  ShoppingCart,
  Eye,
  Filter,
  Calendar,
  CreditCard,
  Package,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layout } from '../components/Layout';

interface StaffStats {
  total_approved: number;
  total_rejected: number;
  total_income: number;
  income_by_payment_method: Array<{
    payment_method_name: string;
    total_income: number;
  }>;
  recent_rejections: Array<{
    id: number;
    order_number: string;
    user: {
      name: string;
      email: string;
    };
    payment_method: {
      name: string;
    };
    total_amount: number;
    staff_notes: string;
    rejected_at: string;
  }>;
  period: {
    start_date: string;
    end_date: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  payment_status: string;
  approval_status: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  payment_method: {
    id: number;
    name: string;
  };
  order_items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      image_url?: string;
    };
  }>;
  transactions: Array<{
    id: number;
    transaction_id: string;
    amount: number;
    status: string;
  }>;
}

interface PaymentMethod {
  id: number;
  name: string;
  is_active: boolean;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [ordersToReview, setOrdersToReview] = useState<Order[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchOrdersToReview();
  }, [dateRange, selectedPaymentMethod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        ...(selectedPaymentMethod && { payment_method_id: selectedPaymentMethod })
      });

      const response = await fetch(`/api/staff/dashboard?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentOrders(data.recent_orders || []);
        setPendingOrders(data.pending_orders || []);
        setPaymentMethods(data.payment_methods || []);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersToReview = async () => {
    try {
      const response = await fetch('/api/staff/orders/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrdersToReview(data.orders.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders to review:', error);
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/staff/orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: actionNotes }),
      });

      if (response.ok) {
        toast.success('Order approved successfully');
        setIsOrderModalOpen(false);
        setActionNotes('');
        fetchDashboardData();
        fetchOrdersToReview();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to approve order');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Error approving order');
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    if (!actionNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`/api/staff/orders/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: actionNotes }),
      });

      if (response.ok) {
        toast.success('Order rejected successfully');
        setIsOrderModalOpen(false);
        setActionNotes('');
        fetchDashboardData();
        fetchOrdersToReview();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Error rejecting order');
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setActionNotes('');
    setIsOrderModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage order approvals and track your performance</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Payment Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Payment Methods</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.total_approved}</div>
                <p className="text-xs text-muted-foreground">
                  Orders approved in selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.total_rejected}</div>
                <p className="text-xs text-muted-foreground">
                  Orders rejected in selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income Generated</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_income)}</div>
                <p className="text-xs text-muted-foreground">
                  From approved orders only
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders to Review</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rejections">Recent Rejections</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders ({ordersToReview.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersToReview.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending orders</h3>
                    <p className="text-gray-600">All orders have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersToReview.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Order #{order.order_number}</h3>
                              {getStatusBadge(order.approval_status)}
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {order.user.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {order.user.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  {order.payment_method.name}
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Ordered: {formatDateTime(order.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="text-lg font-semibold text-blue-600">
                              {formatCurrency(order.total_amount)}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOrderModal(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {stats && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Income by Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.income_by_payment_method.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={stats.income_by_payment_method}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ payment_method_name, total_income }) => 
                              `${payment_method_name}: ${formatCurrency(total_income)}`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="total_income"
                          >
                            {stats.income_by_payment_method.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No income data available for the selected period
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.income_by_payment_method.map((method, index) => (
                          <div key={method.payment_method_name} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="text-sm">{method.payment_method_name}</span>
                            </div>
                            <span className="font-semibold">{formatCurrency(method.total_income)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Approval Rate:</span>
                          <span className="font-semibold">
                            {stats.total_approved + stats.total_rejected > 0 
                              ? Math.round((stats.total_approved / (stats.total_approved + stats.total_rejected)) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Processed:</span>
                          <span className="font-semibold">{stats.total_approved + stats.total_rejected}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Period:</span>
                          <span className="font-semibold text-sm">
                            {formatDate(stats.period.start_date)} - {formatDate(stats.period.end_date)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="rejections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rejections</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.recent_rejections.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent rejections</h3>
                    <p className="text-gray-600">Great job! No orders have been rejected recently.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats?.recent_rejections.map((rejection) => (
                      <div key={rejection.id} className="border rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Order #{rejection.order_number}</h3>
                              <Badge variant="destructive">Rejected</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {rejection.user.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  {rejection.payment_method.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDateTime(rejection.rejected_at)}
                                </span>
                              </div>
                            </div>
                            <div className="text-lg font-semibold text-red-600">
                              {formatCurrency(rejection.total_amount)}
                            </div>
                            {rejection.staff_notes && (
                              <div className="bg-white p-2 rounded border">
                                <p className="text-sm"><strong>Rejection Reason:</strong> {rejection.staff_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Review Modal */}
        <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Order #{selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedOrder.user.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.user.email}</p>
                      {selectedOrder.user.phone && (
                        <p><strong>Phone:</strong> {selectedOrder.user.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payment Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Method:</strong> {selectedOrder.payment_method.name}</p>
                      <p><strong>Amount:</strong> {formatCurrency(selectedOrder.total_amount)}</p>
                      <p><strong>Status:</strong> {selectedOrder.payment_status}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction Information */}
                {selectedOrder.transactions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Transaction Details</h3>
                    <div className="space-y-2">
                      {selectedOrder.transactions.map((transaction) => (
                        <div key={transaction.id} className="p-2 bg-gray-50 rounded">
                          <p className="text-sm"><strong>Transaction ID:</strong> {transaction.transaction_id}</p>
                          <p className="text-sm"><strong>Amount:</strong> {formatCurrency(transaction.amount)}</p>
                          <p className="text-sm"><strong>Status:</strong> {transaction.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Notes */}
                <div>
                  <Label htmlFor="action_notes">Notes (required for rejection)</Label>
                  <Textarea
                    id="action_notes"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApproveOrder(selectedOrder.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve Order
                  </Button>
                  <Button
                    onClick={() => handleRejectOrder(selectedOrder.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject Order
                  </Button>
                  <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default StaffDashboard;

