import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  Building,
  Badge as BadgeIcon,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import  api  from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Staff {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  employee_id: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: number;
    name: string;
  };
}

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  department: string;
  employee_id: string;
  hire_date: string;
  is_active: boolean;
}

interface StaffStats {
  total_approved: number;
  total_rejected: number;
  total_income: number;
  income_by_payment_method: Array<{
    payment_method: string;
    total_income: number;
  }>;
  recent_rejections: Array<any>;
  period: {
    start_date: string;
    end_date: string;
  };
}

const AdminStaffCRUD: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedStaffStats, setSelectedStaffStats] = useState<StaffStats | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    department: "",
    employee_id: "",
    hire_date: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (departmentFilter) params.append("department", departmentFilter);
      if (statusFilter) params.append("is_active", statusFilter);

      const response = await api.get(`/staff?${params}`);
      setStaff(response.data.staff.data || response.data.staff);
      setDepartments(response.data.departments || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch staff",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffStats = async (staffId: number) => {
    try {
      const response = await api.get(`/staff/${staffId}`);
      setSelectedStaffStats(response.data.stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch staff stats",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone: "",
      department: "",
      employee_id: "",
      hire_date: "",
      is_active: true,
    });
    setFormErrors({});
  };

  const handleInputChange = (field: keyof StaffFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (isEdit = false): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!isEdit) {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = "Passwords do not match";
      }
    } else if (formData.password && formData.password !== formData.password_confirmation) {
      errors.password_confirmation = "Passwords do not match";
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required";
    }

    if (!formData.employee_id.trim()) {
      errors.employee_id = "Employee ID is required";
    }

    if (!formData.hire_date) {
      errors.hire_date = "Hire date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStaff = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(-1); // Use -1 for create action
      const response = await api.post("/staff", formData);

      toast({
        title: "Success",
        description: "Staff member created successfully",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchStaff();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create staff member",
          variant: "destructive",
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff || !validateForm(true)) return;

    try {
      setActionLoading(selectedStaff.id);
      const updateData = { ...formData };
      
      // Remove password fields if not provided
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.password_confirmation;
      }

      const response = await api.put(`/staff/${selectedStaff.id}`, updateData);

      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      resetForm();
      fetchStaff();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update staff member",
          variant: "destructive",
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    try {
      setActionLoading(staffId);
      await api.delete(`/staff/${staffId}`);

      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });

      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete staff member",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      password: "",
      password_confirmation: "",
      phone: staffMember.phone || "",
      department: staffMember.department,
      employee_id: staffMember.employee_id,
      hire_date: staffMember.hire_date,
      is_active: staffMember.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = async (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsViewDialogOpen(true);
    await fetchStaffStats(staffMember.id);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || member.department === departmentFilter;
    
    const matchesStatus = !statusFilter || 
                         (statusFilter === "1" && member.is_active) ||
                         (statusFilter === "0" && !member.is_active);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const generateEmployeeId = () => {
    const prefix = "EMP";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Staff Management
          </h1>
          <p className="text-gray-600">Manage your staff members and their accounts</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchStaff} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {staff.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {staff.filter(s => !s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
      </div>

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
              <Label htmlFor="search">Search Staff</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No staff members found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center">
                        <BadgeIcon className="w-3 h-3 mr-1" />
                        {member.employee_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.department}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(member.hire_date)}</TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(member)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{member.name}"? This action cannot be undone.
                                If they have processed orders, they will be deactivated instead.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStaff(member.id)}
                                disabled={actionLoading === member.id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {actionLoading === member.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-name">Full Name *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter password"
                />
                {formErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                )}
              </div>
              <div>
                <Label htmlFor="create-password-confirmation">Confirm Password *</Label>
                <Input
                  id="create-password-confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                  placeholder="Confirm password"
                />
                {formErrors.password_confirmation && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.password_confirmation}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="create-department">Department *</Label>
                <Input
                  id="create-department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Enter department"
                />
                {formErrors.department && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.department}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-employee-id">Employee ID *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="create-employee-id"
                    value={formData.employee_id}
                    onChange={(e) => handleInputChange("employee_id", e.target.value)}
                    placeholder="Enter employee ID"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange("employee_id", generateEmployeeId())}
                  >
                    Generate
                  </Button>
                </div>
                {formErrors.employee_id && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.employee_id}</p>
                )}
              </div>
              <div>
                <Label htmlFor="create-hire-date">Hire Date *</Label>
                <Input
                  id="create-hire-date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange("hire_date", e.target.value)}
                />
                {formErrors.hire_date && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.hire_date}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="create-status"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="create-status">Active</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStaff}
                disabled={actionLoading === -1}
              >
                {actionLoading === -1 ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Create Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter new password"
                />
                {formErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-password-confirmation">Confirm New Password</Label>
                <Input
                  id="edit-password-confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                  placeholder="Confirm new password"
                />
                {formErrors.password_confirmation && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.password_confirmation}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department *</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Enter department"
                />
                {formErrors.department && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.department}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-employee-id">Employee ID *</Label>
                <Input
                  id="edit-employee-id"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange("employee_id", e.target.value)}
                  placeholder="Enter employee ID"
                />
                {formErrors.employee_id && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.employee_id}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-hire-date">Hire Date *</Label>
                <Input
                  id="edit-hire-date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange("hire_date", e.target.value)}
                />
                {formErrors.hire_date && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.hire_date}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="edit-status">Active</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedStaff(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditStaff}
                disabled={actionLoading === selectedStaff?.id}
              >
                {actionLoading === selectedStaff?.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Update Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Staff Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff Member Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
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
                      <p className="text-lg font-semibold">{selectedStaff.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedStaff.email}
                      </p>
                    </div>
                    {selectedStaff.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedStaff.phone}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Employee ID</label>
                      <p className="flex items-center">
                        <BadgeIcon className="w-4 h-4 mr-2" />
                        {selectedStaff.employee_id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        {selectedStaff.department}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hire Date</label>
                      <p className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(selectedStaff.hire_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge variant={selectedStaff.is_active ? "default" : "secondary"}>
                        {selectedStaff.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Statistics */}
              {selectedStaffStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Performance Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedStaffStats.total_approved}
                        </div>
                        <div className="text-sm text-gray-600">Orders Approved</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedStaffStats.total_rejected}
                        </div>
                        <div className="text-sm text-gray-600">Orders Rejected</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedStaffStats.total_income)}
                        </div>
                        <div className="text-sm text-gray-600">Revenue Generated</div>
                      </div>
                    </div>

                    {selectedStaffStats.income_by_payment_method.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Income by Payment Method</h4>
                        <div className="space-y-2">
                          {selectedStaffStats.income_by_payment_method.map((method, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{method.payment_method}</span>
                              <span className="font-medium">{formatCurrency(method.total_income)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStaffCRUD;

