import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  DollarSign,
  Package,
  Calendar,
  CreditCard,
  MessageSquare,
  Loader2,
  RefreshCw,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api  from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image?: string;
    category?: {
      name: string;
    };
  };
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
}

interface Transaction {
  id: number;
  ticket_number: string;
  amount: number;
  status: string;
}

interface PendingOrder {
  id: number;
  order_number: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  approval_status: string;
  created_at: string;
  notes?: string;
  staff_notes?: string;
  approved_at?: string;
  rejected_at?: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  payment_method: PaymentMethod;
  order_items: OrderItem[];
  transactions: Transaction[];
  staff?: {
    id: number;
    name: string;
    email: string;
  };
}

const AdminPurchaseManagement: React.FC = () => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    payment_method_id: "",
    start_date: "",
    end_date: "",
    approval_status: "",
  });

  // Action states
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [showActionDialog, setShowActionDialog] = useState(false);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      // Use the same endpoint as staff but for admin
      const response = await api.get(`/staff/orders/pending?${params}`);
      setOrders(response.data.orders.data);
      setPaymentMethods(response.data.payment_methods);
      setCurrentPage(response.data.orders.current_page);
      setTotalPages(response.data.orders.last_page);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchOrders(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      payment_method_id: "",
      start_date: "",
      end_date: "",
      approval_status: "",
    });
    setCurrentPage(1);
    fetchOrders(1);
  };

  const handleOrderAction = async (orderId: number, action: "approve" | "reject", notes?: string) => {
    try {
      setActionLoading(orderId);
      
      const endpoint = action === "approve" 
        ? `/staff/orders/${orderId}/approve`
        : `/staff/orders/${orderId}/reject`;
      
      const payload = action === "reject" ? { notes } : { notes };
      
      await api.post(endpoint, payload);
      
      toast({
        title: "Success",
        description: `Order ${action}d successfully`,
        variant: "default",
      });
      
      // Refresh orders list
      fetchOrders(currentPage);
      setShowActionDialog(false);
      setActionNotes("");
      setSelectedOrder(null);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${action} order`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openActionDialog = (order: PendingOrder, action: "approve" | "reject") => {
    setSelectedOrder(order);
    setActionType(action);
    setActionNotes("");
    setShowActionDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Admin Purchase Management
          </h1>
          <p className="text-gray-600">Review and manage all customer orders with admin privileges</p>
        </div>
        <Button onClick={() => fetchOrders(currentPage)} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search Orders</Label>
              <Input
                id="search"
                placeholder="Order number, customer name, email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="approval_status">Approval Status</Label>
              <Select value={filters.approval_status} onValueChange={(value) => handleFilterChange("approval_status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={filters.payment_method_id} onValueChange={(value) => handleFilterChange("payment_method_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All payment methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All payment methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Details</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-mono font-medium">{order.order_number}</div>
                          <div className="text-sm text-gray-500">
                            {order.order_items.length} item(s)
                          </div>
                          {order.transactions.length > 0 && (
                            <div className="text-xs text-blue-600 font-mono">
                              Ticket: {order.transactions[0].ticket_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {order.user.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {order.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            {order.payment_method.name}
                          </div>
                          <div className="text-sm">
                            {getPaymentStatusBadge(order.payment_status)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.approval_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(order.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.staff ? (
                          <div className="text-sm">
                            <div className="font-medium">{order.staff.name}</div>
                            <div className="text-gray-500">{order.staff.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Customer Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Name</label>
                                      <p className="font-medium">{order.user.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Email</label>
                                      <p>{order.user.email}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                                  <div className="space-y-3">
                                    {order.order_items.map((item) => (
                                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                          {item.product.image && (
                                            <img
                                              src={item.product.image}
                                              alt={item.product.name}
                                              className="w-16 h-16 object-cover rounded"
                                            />
                                          )}
                                          <div>
                                            <h4 className="font-medium">{item.product.name}</h4>
                                            {item.product.category && (
                                              <p className="text-sm text-gray-500">{item.product.category.name}</p>
                                            )}
                                            <p className="text-sm">Quantity: {item.quantity}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium">{formatCurrency(item.price)}</p>
                                          <p className="text-sm text-gray-500">each</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Payment Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                                      <p className="font-medium">{order.payment_method.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Payment Status</label>
                                      <p>{getPaymentStatusBadge(order.payment_status)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Total Amount</label>
                                      <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                                    </div>
                                    {order.transactions.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Ticket Number</label>
                                        <p className="font-mono">{order.transactions[0].ticket_number}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Staff Notes */}
                                {order.staff_notes && (
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">Staff Notes</h3>
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                      <p>{order.staff_notes}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Order Notes */}
                                {order.notes && (
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">Order Notes</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                      <p>{order.notes}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {order.approval_status === "pending" && (
                            <>
                              <Button
                                onClick={() => openActionDialog(order, "approve")}
                                disabled={actionLoading === order.id}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {actionLoading === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => openActionDialog(order, "reject")}
                                disabled={actionLoading === order.id}
                                size="sm"
                                variant="destructive"
                              >
                                {actionLoading === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchOrders(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchOrders(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Order" : "Reject Order"}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Order:</strong> {selectedOrder.order_number}</p>
                <p><strong>Customer:</strong> {selectedOrder.user.name}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedOrder.total_amount)}</p>
              </div>
              
              <div>
                <Label htmlFor="action-notes">
                  {actionType === "reject" ? "Rejection Reason (Required)" : "Notes (Optional)"}
                </Label>
                <Textarea
                  id="action-notes"
                  placeholder={actionType === "reject" 
                    ? "Please provide a reason for rejection..." 
                    : "Add any notes for this approval..."
                  }
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              {actionType === "reject" && !actionNotes.trim() && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Rejection reason is required
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && handleOrderAction(selectedOrder.id, actionType!, actionNotes)}
              disabled={actionType === "reject" && !actionNotes.trim()}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {actionType === "approve" ? "Approve Order" : "Reject Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPurchaseManagement;

