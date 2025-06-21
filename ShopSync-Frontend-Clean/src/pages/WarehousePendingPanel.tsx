import React, { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import  api  from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  image?: string;
  quantity: number;
  category: {
    id: number;
    name: string;
  };
}

interface Admin {
  id: number;
  name: string;
  email: string;
}

interface ReorderRequest {
  id: number;
  quantity_requested: number;
  quantity_approved?: number;
  estimated_cost: number;
  status: string;
  notes?: string;
  warehouse_notes?: string;
  created_at: string;
  warehouse_approved_at?: string;
  warehouse_rejected_at?: string;
  product: Product;
  admin: Admin;
}

interface WarehouseStats {
  pending_reorders: number;
  approved_reorders: number;
  completed_reorders: number;
  rejected_reorders: number;
  total_value_pending: number;
  total_value_approved: number;
}

const WarehousePendingPanel: React.FC = () => {
  const [reorderRequests, setReorderRequests] = useState<ReorderRequest[]>([]);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ReorderRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    product_name: "",
    start_date: "",
    end_date: "",
  });

  // Action form states
  const [approvalForm, setApprovalForm] = useState({
    quantity_approved: "",
    warehouse_notes: "",
  });

  const [rejectionForm, setRejectionForm] = useState({
    warehouse_notes: "",
  });

  const fetchPendingReorders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await api.get(`/warehouse/reorders/pending?${params}`);
      setReorderRequests(response.data.reorder_requests.data);
      setCurrentPage(response.data.reorder_requests.current_page);
      setTotalPages(response.data.reorder_requests.last_page);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch reorder requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/warehouse/dashboard");
      setStats(response.data.stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch statistics",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPendingReorders(1);
  };

  const clearFilters = () => {
    setFilters({
      product_name: "",
      start_date: "",
      end_date: "",
    });
    setCurrentPage(1);
    fetchPendingReorders(1);
  };

  const handleApprove = async (requestId: number) => {
    if (!approvalForm.quantity_approved || parseInt(approvalForm.quantity_approved) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity to approve",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(requestId);
      await api.post(`/warehouse/reorders/${requestId}/approve`, {
        quantity_approved: parseInt(approvalForm.quantity_approved),
        warehouse_notes: approvalForm.warehouse_notes,
      });

      toast({
        title: "Success",
        description: "Reorder request approved successfully",
      });

      // Reset form and refresh data
      setApprovalForm({ quantity_approved: "", warehouse_notes: "" });
      setSelectedRequest(null);
      fetchPendingReorders(currentPage);
      fetchStats();
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

  const handleReject = async (requestId: number) => {
    if (!rejectionForm.warehouse_notes.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(requestId);
      await api.post(`/warehouse/reorders/${requestId}/reject`, {
        warehouse_notes: rejectionForm.warehouse_notes,
      });

      toast({
        title: "Success",
        description: "Reorder request rejected successfully",
      });

      // Reset form and refresh data
      setRejectionForm({ warehouse_notes: "" });
      setSelectedRequest(null);
      fetchPendingReorders(currentPage);
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject reorder request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
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
    fetchPendingReorders();
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Warehouse Pending Panel
          </h1>
          <p className="text-gray-600">Manage admin reorder requests</p>
        </div>
        <Button onClick={() => { fetchPendingReorders(currentPage); fetchStats(); }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_reorders}</div>
              <div className="text-xs text-muted-foreground">
                Value: {formatCurrency(stats.total_value_pending)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved_reorders}</div>
              <div className="text-xs text-muted-foreground">
                Value: {formatCurrency(stats.total_value_approved)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Requests</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed_reorders}</div>
              <div className="text-xs text-muted-foreground">
                Rejected: {stats.rejected_reorders}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                placeholder="Search by product name..."
                value={filters.product_name}
                onChange={(e) => handleFilterChange("product_name", e.target.value)}
              />
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

      {/* Pending Reorder Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reorder Requests ({reorderRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : reorderRequests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No pending reorder requests</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Requested Qty</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reorderRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {request.product.image && (
                            <img
                              src={request.product.image}
                              alt={request.product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{request.product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.product.category.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1 text-gray-500" />
                          {request.product.quantity}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.quantity_requested}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(request.estimated_cost)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.admin.name}</div>
                          <div className="text-sm text-gray-500">{request.admin.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(request.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalForm({
                                    quantity_approved: request.quantity_requested.toString(),
                                    warehouse_notes: "",
                                  });
                                  setRejectionForm({ warehouse_notes: "" });
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Reorder Request Details</DialogTitle>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-6">
                                  {/* Request Information */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">Request Information</h3>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Product</label>
                                        <p className="font-medium">{selectedRequest.product.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Category</label>
                                        <p>{selectedRequest.product.category.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Current Stock</label>
                                        <p className="font-medium">{selectedRequest.product.quantity}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Requested Quantity</label>
                                        <p className="font-bold text-lg">{selectedRequest.quantity_requested}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                                        <p className="font-bold text-lg">{formatCurrency(selectedRequest.estimated_cost)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Requested By</label>
                                        <p>{selectedRequest.admin.name}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                                        <p>{selectedRequest.notes || "No notes provided"}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Approval Section */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3 text-green-600">Approve Request</h3>
                                    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                                      <div>
                                        <Label htmlFor="quantity_approved">Quantity to Approve</Label>
                                        <Input
                                          id="quantity_approved"
                                          type="number"
                                          min="1"
                                          max={selectedRequest.quantity_requested}
                                          value={approvalForm.quantity_approved}
                                          onChange={(e) => setApprovalForm(prev => ({ ...prev, quantity_approved: e.target.value }))}
                                          placeholder="Enter quantity to approve"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="approval_notes">Warehouse Notes (Optional)</Label>
                                        <Textarea
                                          id="approval_notes"
                                          value={approvalForm.warehouse_notes}
                                          onChange={(e) => setApprovalForm(prev => ({ ...prev, warehouse_notes: e.target.value }))}
                                          placeholder="Add any notes about the approval..."
                                          rows={3}
                                        />
                                      </div>
                                      <Button
                                        onClick={() => handleApprove(selectedRequest.id)}
                                        disabled={actionLoading === selectedRequest.id}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                      >
                                        {actionLoading === selectedRequest.id ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                          <ThumbsUp className="w-4 h-4 mr-2" />
                                        )}
                                        Approve Request
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Rejection Section */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3 text-red-600">Reject Request</h3>
                                    <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                                      <div>
                                        <Label htmlFor="rejection_notes">Reason for Rejection *</Label>
                                        <Textarea
                                          id="rejection_notes"
                                          value={rejectionForm.warehouse_notes}
                                          onChange={(e) => setRejectionForm(prev => ({ ...prev, warehouse_notes: e.target.value }))}
                                          placeholder="Please provide a reason for rejection..."
                                          rows={3}
                                          required
                                        />
                                      </div>
                                      <Button
                                        onClick={() => handleReject(selectedRequest.id)}
                                        disabled={actionLoading === selectedRequest.id}
                                        variant="destructive"
                                        className="w-full"
                                      >
                                        {actionLoading === selectedRequest.id ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                          <ThumbsDown className="w-4 h-4 mr-2" />
                                        )}
                                        Reject Request
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
                    onClick={() => fetchPendingReorders(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchPendingReorders(currentPage + 1)}
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
    </div>
  );
};

export default WarehousePendingPanel;

