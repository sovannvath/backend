import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  UserX,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  Shield,
  ShieldOff,
  History,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import  api  from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  suspension_reason?: string;
  suspension_notes?: string;
  suspended_at?: string;
  suspended_by?: number;
  role: {
    id: number;
    name: string;
  };
}

interface UserStats {
  total_orders: number;
  approved_orders: number;
  rejected_orders: number;
  pending_orders: number;
  total_spent: number;
  average_order_value: number;
  recent_orders: Array<any>;
  favorite_products: Array<{
    id: number;
    name: string;
    total_quantity: number;
    order_count: number;
  }>;
}

interface SuspensionHistory {
  id: number;
  user_id: number;
  suspended_by?: number;
  reactivated_by?: number;
  action_type: string;
  reason?: string;
  notes?: string;
  suspended_at?: string;
  reactivated_at?: string;
  suspended_by_name?: string;
  reactivated_by_name?: string;
  created_at: string;
}

interface DashboardStats {
  stats: {
    total_users: number;
    active_users: number;
    suspended_users: number;
    new_users: number;
  };
  recent_registrations: Array<User>;
  recent_suspensions: Array<User>;
  registration_trends: Array<{
    date: string;
    count: number;
  }>;
}

const AdminUserSuspension: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [suspensionHistory, setSuspensionHistory] = useState<SuspensionHistory[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { toast } = useToast();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  });

  // Suspension form states
  const [suspensionForm, setSuspensionForm] = useState({
    reason: "",
    notes: "",
  });

  const [reactivationForm, setReactivationForm] = useState({
    notes: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("is_active", statusFilter);
      if (dateRange.start_date) params.append("start_date", dateRange.start_date);
      if (dateRange.end_date) params.append("end_date", dateRange.end_date);

      const response = await api.get(`/users?${params}`);
      setUsers(response.data.users.data || response.data.users);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append("start_date", dateRange.start_date);
      if (dateRange.end_date) params.append("end_date", dateRange.end_date);

      const response = await api.get(`/users/dashboard?${params}`);
      setDashboardStats(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch dashboard stats",
        variant: "destructive",
      });
    }
  };

  const fetchUserStats = async (userId: number) => {
    try {
      const response = await api.get(`/users/${userId}`);
      setSelectedUserStats(response.data.stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch user stats",
        variant: "destructive",
      });
    }
  };

  const fetchSuspensionHistory = async (userId: number) => {
    try {
      const response = await api.get(`/users/${userId}/suspension-history`);
      setSuspensionHistory(response.data.suspension_history);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch suspension history",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (userId: number) => {
    if (!suspensionForm.reason.trim()) {
      toast({
        title: "Error",
        description: "Suspension reason is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(userId);
      await api.post(`/users/${userId}/suspend`, suspensionForm);

      toast({
        title: "Success",
        description: "User suspended successfully",
      });

      setIsSuspendDialogOpen(false);
      setSuspensionForm({ reason: "", notes: "" });
      fetchUsers();
      fetchDashboardStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to suspend user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      setActionLoading(userId);
      await api.post(`/users/${userId}/reactivate`, reactivationForm);

      toast({
        title: "Success",
        description: "User reactivated successfully",
      });

      setReactivationForm({ notes: "" });
      fetchUsers();
      fetchDashboardStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reactivate user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select users to suspend",
        variant: "destructive",
      });
      return;
    }

    if (!suspensionForm.reason.trim()) {
      toast({
        title: "Error",
        description: "Suspension reason is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(-1);
      await api.post("/users/bulk-suspend", {
        user_ids: selectedUsers,
        ...suspensionForm,
      });

      toast({
        title: "Success",
        description: `Successfully suspended ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      setSuspensionForm({ reason: "", notes: "" });
      fetchUsers();
      fetchDashboardStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to suspend users",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkReactivate = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select users to reactivate",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(-2);
      await api.post("/users/bulk-reactivate", {
        user_ids: selectedUsers,
        ...reactivationForm,
      });

      toast({
        title: "Success",
        description: `Successfully reactivated ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      setReactivationForm({ notes: "" });
      fetchUsers();
      fetchDashboardStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reactivate users",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openViewDialog = async (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
    await fetchUserStats(user.id);
  };

  const openSuspendDialog = (user: User) => {
    setSelectedUser(user);
    setIsSuspendDialogOpen(true);
  };

  const openHistoryDialog = async (user: User) => {
    setSelectedUser(user);
    setIsHistoryDialogOpen(true);
    await fetchSuspensionHistory(user.id);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || 
                         (statusFilter === "1" && user.is_active) ||
                         (statusFilter === "0" && !user.is_active);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            User Management & Suspension
          </h1>
          <p className="text-gray-600">Manage customer accounts and suspension status</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchUsers} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.stats.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.stats.active_users}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {dashboardStats.stats.suspended_users}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.stats.new_users}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Registration Trends Chart */}
      {dashboardStats && dashboardStats.registration_trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              User Registration Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardStats.registration_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="New Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedUsers.length} users selected</Badge>
              </div>
              <div className="flex space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <UserX className="w-4 h-4 mr-2" />
                      Bulk Suspend
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bulk Suspend Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to suspend {selectedUsers.length} users. Please provide a reason.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bulk-reason">Suspension Reason *</Label>
                        <Input
                          id="bulk-reason"
                          value={suspensionForm.reason}
                          onChange={(e) => setSuspensionForm(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="Enter suspension reason"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bulk-notes">Additional Notes</Label>
                        <Textarea
                          id="bulk-notes"
                          value={suspensionForm.notes}
                          onChange={(e) => setSuspensionForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Enter additional notes (optional)"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkSuspend}
                        disabled={actionLoading === -1}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {actionLoading === -1 ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Suspend Users
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" size="sm">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Bulk Reactivate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bulk Reactivate Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to reactivate {selectedUsers.length} users.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bulk-reactivation-notes">Reactivation Notes</Label>
                        <Textarea
                          id="bulk-reactivation-notes"
                          value={reactivationForm.notes}
                          onChange={(e) => setReactivationForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Enter reactivation notes (optional)"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkReactivate}
                        disabled={actionLoading === -2}
                      >
                        {actionLoading === -2 ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Reactivate Users
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Suspension Info</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "destructive"}>
                        {user.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!user.is_active && user.suspension_reason && (
                        <div className="text-sm">
                          <div className="font-medium text-red-600">{user.suspension_reason}</div>
                          {user.suspended_at && (
                            <div className="text-gray-500">
                              Suspended: {formatDate(user.suspended_at)}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openHistoryDialog(user)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        {user.is_active ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openSuspendDialog(user)}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reactivate User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reactivate "{user.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reactivation-notes">Reactivation Notes</Label>
                                  <Textarea
                                    id="reactivation-notes"
                                    value={reactivationForm.notes}
                                    onChange={(e) => setReactivationForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Enter reactivation notes (optional)"
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReactivateUser(user.id)}
                                >
                                  Reactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Suspend User Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <div className="font-medium">Suspending: {selectedUser.name}</div>
                    <div className="text-sm text-gray-600">{selectedUser.email}</div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="suspension-reason">Suspension Reason *</Label>
                <Input
                  id="suspension-reason"
                  value={suspensionForm.reason}
                  onChange={(e) => setSuspensionForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter suspension reason"
                />
              </div>

              <div>
                <Label htmlFor="suspension-notes">Additional Notes</Label>
                <Textarea
                  id="suspension-notes"
                  value={suspensionForm.notes}
                  onChange={(e) => setSuspensionForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter additional notes (optional)"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuspendDialogOpen(false);
                    setSuspensionForm({ reason: "", notes: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleSuspendUser(selectedUser.id)}
                  disabled={actionLoading === selectedUser.id}
                >
                  {actionLoading === selectedUser.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Suspend User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedUser.email}
                      </p>
                    </div>
                    {selectedUser.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedUser.phone}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Date</label>
                      <p className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge variant={selectedUser.is_active ? "default" : "destructive"}>
                        {selectedUser.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Statistics */}
                {selectedUserStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedUserStats.total_orders}
                          </div>
                          <div className="text-sm text-gray-600">Total Orders</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedUserStats.approved_orders}
                          </div>
                          <div className="text-sm text-gray-600">Approved</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {selectedUserStats.pending_orders}
                          </div>
                          <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {selectedUserStats.rejected_orders}
                          </div>
                          <div className="text-sm text-gray-600">Rejected</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(selectedUserStats.total_spent)}
                          </div>
                          <div className="text-sm text-gray-600">Total Spent</div>
                        </div>
                        <div className="text-center mt-2">
                          <div className="text-lg font-semibold">
                            {formatCurrency(selectedUserStats.average_order_value)}
                          </div>
                          <div className="text-sm text-gray-600">Average Order Value</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Suspension Information */}
              {!selectedUser.is_active && selectedUser.suspension_reason && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 flex items-center">
                      <ShieldOff className="w-5 h-5 mr-2" />
                      Suspension Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reason</label>
                      <p className="text-red-600 font-medium">{selectedUser.suspension_reason}</p>
                    </div>
                    {selectedUser.suspension_notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Notes</label>
                        <p className="text-gray-700">{selectedUser.suspension_notes}</p>
                      </div>
                    )}
                    {selectedUser.suspended_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Suspended At</label>
                        <p className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatDate(selectedUser.suspended_at)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Favorite Products */}
              {selectedUserStats && selectedUserStats.favorite_products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Favorite Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Total Quantity</TableHead>
                          <TableHead>Order Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUserStats.favorite_products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.total_quantity}</TableCell>
                            <TableCell>{product.order_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspension History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suspension History</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-gray-600">{selectedUser.email}</div>
              </div>

              {suspensionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No suspension history found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Reason/Notes</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspensionHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Badge variant={record.action_type === 'suspended' ? 'destructive' : 'default'}>
                            {record.action_type === 'suspended' ? 'Suspended' : 'Reactivated'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {record.reason && (
                              <div className="font-medium">{record.reason}</div>
                            )}
                            {record.notes && (
                              <div className="text-sm text-gray-600">{record.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.action_type === 'suspended' 
                            ? record.suspended_by_name || 'Unknown'
                            : record.reactivated_by_name || 'Unknown'
                          }
                        </TableCell>
                        <TableCell>
                          {formatDate(
                            record.action_type === 'suspended' 
                              ? record.suspended_at || record.created_at
                              : record.reactivated_at || record.created_at
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserSuspension;

