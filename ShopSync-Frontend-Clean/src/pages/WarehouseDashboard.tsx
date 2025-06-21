import React, { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  Filter,
  Search,
  Eye,
  FileText,
  Calendar,
  TrendingUp,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Mock data
const warehouseStats = {
  pendingRequests: 12,
  approvedToday: 8,
  rejectedToday: 2,
  totalProcessed: 156,
};

const stockRequests = [
  {
    id: 1,
    product: "Wireless Mouse",
    requestedBy: "Admin",
    requestedQuantity: 50,
    currentStock: 3,
    suggestedStock: 100,
    priority: "high",
    status: "pending",
    date: "2024-01-20",
    adminApproval: "approved",
    estimatedCost: 1250.0,
    supplier: "TechSupply Co.",
  },
  {
    id: 2,
    product: "USB Cable",
    requestedBy: "Admin",
    requestedQuantity: 100,
    currentStock: 15,
    suggestedStock: 200,
    priority: "medium",
    status: "pending",
    date: "2024-01-19",
    adminApproval: "approved",
    estimatedCost: 800.0,
    supplier: "Cable Direct",
  },
  {
    id: 3,
    product: "Phone Charger",
    requestedBy: "Admin",
    requestedQuantity: 75,
    currentStock: 8,
    suggestedStock: 150,
    priority: "low",
    status: "completed",
    date: "2024-01-18",
    adminApproval: "approved",
    estimatedCost: 1875.0,
    supplier: "PowerTech Ltd",
  },
];

const inventoryUpdates = [
  {
    id: 1,
    product: "Laptop Stand",
    action: "Stock In",
    quantity: 50,
    newStock: 125,
    date: "2024-01-20",
    operator: "John Smith",
  },
  {
    id: 2,
    product: "Keyboard",
    action: "Stock Out",
    quantity: 25,
    newStock: 75,
    date: "2024-01-20",
    operator: "Sarah Johnson",
  },
  {
    id: 3,
    product: "Monitor",
    action: "Stock In",
    quantity: 20,
    newStock: 45,
    date: "2024-01-19",
    operator: "Mike Wilson",
  },
];

const WarehouseDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const handleApproveRequest = (id: number) => {
    toast.success("Stock request approved successfully");
    // Update request status logic here
  };

  const handleRejectRequest = (id: number) => {
    toast.error("Stock request rejected");
    // Update request status logic here
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-500 text-white",
      medium: "bg-yellow-500 text-white",
      low: "bg-green-500 text-white",
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const filteredRequests = stockRequests.filter((request) => {
    const matchesSearch = request.product
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                Warehouse Dashboard
              </h1>
              <p className="text-metallic-600 dark:text-slate-400">
                Manage inventory and stock requests
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button className="bg-metallic-700 hover:bg-metallic-900">
                <Package className="w-4 h-4 mr-2" />
                Update Inventory
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Pending Requests</p>
                    <p className="text-2xl font-bold">
                      {warehouseStats.pendingRequests}
                    </p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">Awaiting review</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Approved Today</p>
                    <p className="text-2xl font-bold">
                      {warehouseStats.approvedToday}
                    </p>
                    <div className="flex items-center mt-2">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Processing</span>
                    </div>
                  </div>
                  <Package className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Rejected Today</p>
                    <p className="text-2xl font-bold">
                      {warehouseStats.rejectedToday}
                    </p>
                    <div className="flex items-center mt-2">
                      <XCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Need review</span>
                    </div>
                  </div>
                  <XCircle className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Processed</p>
                    <p className="text-2xl font-bold">
                      {warehouseStats.totalProcessed}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">This month</span>
                    </div>
                  </div>
                  <Truck className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
              <TabsTrigger value="requests">Stock Requests</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Stock Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Stock Requests Management</CardTitle>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-500 w-4 h-4" />
                        <Input
                          placeholder="Search requests..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 border border-metallic-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Product Info */}
                          <div>
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="font-semibold text-lg">
                                {request.product}
                              </h3>
                              <Badge
                                className={getPriorityBadge(request.priority)}
                              >
                                {request.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={getStatusBadge(request.status)}
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-metallic-600 dark:text-slate-400">
                              <p>Requested by: {request.requestedBy}</p>
                              <p>Date: {request.date}</p>
                              <p>Supplier: {request.supplier}</p>
                            </div>
                          </div>

                          {/* Stock Info */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Stock Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Current Stock:</span>
                                <span className="font-medium text-red-600">
                                  {request.currentStock}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Requested:</span>
                                <span className="font-medium">
                                  {request.requestedQuantity}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Suggested Total:</span>
                                <span className="font-medium text-green-600">
                                  {request.suggestedStock}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Estimated Cost:</span>
                                <span className="font-bold">
                                  ${request.estimatedCost.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col justify-center space-y-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Stock Request Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Review the complete information for this
                                    stock request.
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedRequest && (
                                  <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="space-y-2">
                                      <p>
                                        <strong>Product:</strong>{" "}
                                        {selectedRequest.product}
                                      </p>
                                      <p>
                                        <strong>Current Stock:</strong>{" "}
                                        {selectedRequest.currentStock}
                                      </p>
                                      <p>
                                        <strong>Requested:</strong>{" "}
                                        {selectedRequest.requestedQuantity}
                                      </p>
                                      <p>
                                        <strong>Priority:</strong>{" "}
                                        {selectedRequest.priority}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <p>
                                        <strong>Supplier:</strong>{" "}
                                        {selectedRequest.supplier}
                                      </p>
                                      <p>
                                        <strong>Estimated Cost:</strong> $
                                        {selectedRequest.estimatedCost}
                                      </p>
                                      <p>
                                        <strong>Admin Approval:</strong>{" "}
                                        {selectedRequest.adminApproval}
                                      </p>
                                      <p>
                                        <strong>Date:</strong>{" "}
                                        {selectedRequest.date}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline">Close</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {request.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRejectRequest(request.id)
                                  }
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApproveRequest(request.id)
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Inventory Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>New Stock</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Operator</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryUpdates.map((update) => (
                        <TableRow key={update.id}>
                          <TableCell className="font-medium">
                            {update.product}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                update.action === "Stock In"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {update.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{update.quantity}</TableCell>
                          <TableCell className="font-bold">
                            {update.newStock}
                          </TableCell>
                          <TableCell>{update.date}</TableCell>
                          <TableCell>{update.operator}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Requests Processed:</span>
                        <span className="font-bold text-2xl">156</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Approval Rate:</span>
                        <span className="font-bold text-2xl text-green-600">
                          87%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Processing Time:</span>
                        <span className="font-bold text-2xl">2.4 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cost Savings:</span>
                        <span className="font-bold text-2xl text-blue-600">
                          $12,450
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Download Monthly Report
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Inventory Check
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Package className="w-4 h-4 mr-2" />
                        Export Stock Levels
                      </Button>
                      <Button className="w-full bg-metallic-700 hover:bg-metallic-900">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Generate Low Stock Alert
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default WarehouseDashboard;
