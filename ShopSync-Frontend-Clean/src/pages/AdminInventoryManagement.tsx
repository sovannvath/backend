import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  Bell,
  Settings,
  Edit,
  Loader2,
  Search,
  Filter,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api  from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  quantity: number;
  low_stock_threshold: number;
  reorder_quantity: number;
  auto_reorder: boolean;
  reorder_cost?: number;
  price: number;
  category?: {
    name: string;
  };
  brand?: {
    name: string;
  };
}

interface InventoryAlert {
  id: number;
  alert_type: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
  product: Product;
}

interface ReorderRequest {
  id: number;
  quantity_requested: number;
  estimated_cost: number;
  status: string;
  notes?: string;
  created_at: string;
  approved_at?: string;
  completed_at?: string;
  product: Product;
  admin: {
    id: number;
    name: string;
    email: string;
  };
}

interface InventoryStats {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  reorder_needed_count: number;
  unresolved_alerts_count: number;
  pending_reorders_count: number;
  total_inventory_value: number;
}

const AdminInventoryManagement: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [reorderRequests, setReorderRequests] = useState<ReorderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toast } = useToast();

  // Dialog states
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [showStockAdjustDialog, setShowStockAdjustDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [reorderForm, setReorderForm] = useState({
    quantity_requested: "",
    estimated_cost: "",
    notes: "",
  });

  const [stockAdjustForm, setStockAdjustForm] = useState({
    adjustment_type: "increase",
    quantity: "",
    reason: "",
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/inventory/dashboard");
      const data = response.data;
      
      setStats(data.stats);
      setLowStockProducts(data.low_stock_products);
      setOutOfStockProducts(data.out_of_stock_products);
      setAlerts(data.unresolved_alerts);
      setReorderRequests(data.pending_reorders);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: number) => {
    try {
      setActionLoading(alertId);
      await api.put(`/inventory/alerts/${alertId}/resolve`);
      
      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });
      
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to resolve alert",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const createReorderRequest = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(selectedProduct.id);
      await api.post("/inventory/reorder-requests", {
        product_id: selectedProduct.id,
        ...reorderForm,
      });
      
      toast({
        title: "Success",
        description: "Reorder request created successfully",
      });
      
      setShowReorderDialog(false);
      setReorderForm({ quantity_requested: "", estimated_cost: "", notes: "" });
      setSelectedProduct(null);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create reorder request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const adjustStock = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(selectedProduct.id);
      await api.put(`/inventory/products/${selectedProduct.id}/adjust-stock`, stockAdjustForm);
      
      toast({
        title: "Success",
        description: "Stock adjusted successfully",
      });
      
      setShowStockAdjustDialog(false);
      setStockAdjustForm({ adjustment_type: "increase", quantity: "", reason: "" });
      setSelectedProduct(null);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to adjust stock",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const approveReorderRequest = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      await api.put(`/inventory/reorder-requests/${requestId}/approve`);
      
      toast({
        title: "Success",
        description: "Reorder request approved successfully",
      });
      
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve reorder request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const completeReorderRequest = async (requestId: number) => {
    try {
      setActionLoading(requestId);
      await api.put(`/inventory/reorder-requests/${requestId}/complete`);
      
      toast({
        title: "Success",
        description: "Reorder request completed and inventory updated",
      });
      
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to complete reorder request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const sendLowStockNotifications = async () => {
    try {
      await api.post("/inventory/send-low-stock-notifications");
      
      toast({
        title: "Success",
        description: "Low stock notifications sent to all admins",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send notifications",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800"><Package className="w-3 h-3 mr-1" />Out of Stock</Badge>;
      case "reorder_needed":
        return <Badge className="bg-blue-100 text-blue-800"><ShoppingCart className="w-3 h-3 mr-1" />Reorder Needed</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
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

  const openReorderDialog = (product: Product) => {
    setSelectedProduct(product);
    setReorderForm({
      quantity_requested: product.reorder_quantity.toString(),
      estimated_cost: product.reorder_cost?.toString() || "",
      notes: "",
    });
    setShowReorderDialog(true);
  };

  const openStockAdjustDialog = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustForm({
      adjustment_type: "increase",
      quantity: "",
      reason: "",
    });
    setShowStockAdjustDialog(true);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600">Monitor stock levels, manage reorders, and track inventory alerts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendLowStockNotifications} variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Send Alerts
          </Button>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_products}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.low_stock_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_inventory_value)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock ({lowStockProducts.length})</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock ({outOfStockProducts.length})</TabsTrigger>
          <TabsTrigger value="reorders">Reorder Requests ({reorderRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-gray-500">No unresolved alerts</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Alert Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{alert.product.name}</div>
                            <div className="text-sm text-gray-500">
                              Stock: {alert.product.quantity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getAlertTypeBadge(alert.alert_type)}
                        </TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>{formatDate(alert.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => resolveAlert(alert.id)}
                            disabled={actionLoading === alert.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === alert.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-gray-500">No low stock products</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-yellow-600">
                            {product.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.low_stock_threshold}</TableCell>
                        <TableCell>{product.category?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openReorderDialog(product)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => openStockAdjustDialog(product)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="out-of-stock">
          <Card>
            <CardHeader>
              <CardTitle>Out of Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              {outOfStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-gray-500">No out of stock products</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outOfStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                        </TableCell>
                        <TableCell>{product.category?.name || "N/A"}</TableCell>
                        <TableCell>{product.brand?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openReorderDialog(product)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Reorder
                            </Button>
                            <Button
                              onClick={() => openStockAdjustDialog(product)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorders">
          <Card>
            <CardHeader>
              <CardTitle>Reorder Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {reorderRequests.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No pending reorder requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reorderRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.product.name}</div>
                        </TableCell>
                        <TableCell>{request.quantity_requested}</TableCell>
                        <TableCell>{formatCurrency(request.estimated_cost)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.admin.name}</div>
                            <div className="text-sm text-gray-500">{request.admin.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {request.status === "pending" && (
                              <Button
                                onClick={() => approveReorderRequest(request.id)}
                                disabled={actionLoading === request.id}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {actionLoading === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            {request.status === "approved" && (
                              <Button
                                onClick={() => completeReorderRequest(request.id)}
                                disabled={actionLoading === request.id}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {actionLoading === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Complete"
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reorder Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reorder Request</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Product:</strong> {selectedProduct.name}</p>
                <p><strong>Current Stock:</strong> {selectedProduct.quantity}</p>
                <p><strong>Suggested Quantity:</strong> {selectedProduct.reorder_quantity}</p>
              </div>
              
              <div>
                <Label htmlFor="quantity_requested">Quantity to Order</Label>
                <Input
                  id="quantity_requested"
                  type="number"
                  value={reorderForm.quantity_requested}
                  onChange={(e) => setReorderForm(prev => ({ ...prev, quantity_requested: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="estimated_cost">Estimated Cost</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  value={reorderForm.estimated_cost}
                  onChange={(e) => setReorderForm(prev => ({ ...prev, estimated_cost: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={reorderForm.notes}
                  onChange={(e) => setReorderForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReorderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createReorderRequest}>
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockAdjustDialog} onOpenChange={setShowStockAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Product:</strong> {selectedProduct.name}</p>
                <p><strong>Current Stock:</strong> {selectedProduct.quantity}</p>
              </div>
              
              <div>
                <Label htmlFor="adjustment_type">Adjustment Type</Label>
                <Select value={stockAdjustForm.adjustment_type} onValueChange={(value) => setStockAdjustForm(prev => ({ ...prev, adjustment_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase Stock</SelectItem>
                    <SelectItem value="decrease">Decrease Stock</SelectItem>
                    <SelectItem value="set">Set Stock Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={stockAdjustForm.quantity}
                  onChange={(e) => setStockAdjustForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={stockAdjustForm.reason}
                  onChange={(e) => setStockAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for stock adjustment..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockAdjustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={adjustStock}>
              Adjust Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInventoryManagement;

