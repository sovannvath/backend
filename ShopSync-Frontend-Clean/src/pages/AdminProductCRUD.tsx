import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  Tag,
  BarChart3,
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
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  image?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  low_stock_threshold: string;
  image?: string;
  status: boolean;
  categories: number[];
}

const AdminProductCRUD: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const { toast } = useToast();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    quantity: "",
    low_stock_threshold: "10",
    image: "",
    status: true,
    categories: [],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch products with pagination and filters
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        q: searchTerm,
        category_id: categoryFilter,
        status:
          statusFilter === "active"
            ? 1
            : statusFilter === "inactive"
              ? 0
              : undefined,
      };

      const response = await api.get("/products", { params });
      setProducts(response.data.data || response.data.products);
      setPagination({
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
        per_page: response.data.per_page || 10,
        total: response.data.total || response.data.products?.length || 0,
      });
    } catch (error: any) {
      showError("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || response.data.data);
    } catch (error: any) {
      showError("Failed to fetch categories", error);
    }
  };

  const showError = (message: string, error: any) => {
    toast({
      title: "Error",
      description: error.response?.data?.message || message,
      variant: "destructive",
    });
  };

  const showSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      quantity: "",
      low_stock_threshold: "10",
      image: "",
      status: true,
      categories: [],
    });
    setFormErrors({});
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Product description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "Valid price is required";
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      errors.quantity = "Valid quantity is required";
    }

    if (
      !formData.low_stock_threshold ||
      parseInt(formData.low_stock_threshold) <= 0
    ) {
      errors.low_stock_threshold = "Valid low stock threshold is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(-1);
      const response = await api.post("/products", {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        categories: formData.categories,
      });

      showSuccess("Product created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        showError("Failed to create product", error);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !validateForm()) return;

    try {
      setActionLoading(selectedProduct.id);
      const response = await api.put(`/products/${selectedProduct.id}`, {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        categories: formData.categories,
      });

      showSuccess("Product updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
      fetchProducts(pagination.current_page);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        showError("Failed to update product", error);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      setActionLoading(productId);
      await api.delete(`/products/${productId}`);
      showSuccess("Product deleted successfully");
      fetchProducts(pagination.current_page);
    } catch (error: any) {
      showError("Failed to delete product", error);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      image: product.image || "",
      status: product.status,
      categories: product.categories.map((cat) => cat.id),
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, categoryFilter, statusFilter]);

  // ... (keep all the helper functions like formatCurrency, formatDate, getStockStatus)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header and Statistics Cards remain the same */}

      {/* Filters Section */}
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
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <>
              <Table>{/* Table header and body remain the same */}</Table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {products.length} of {pagination.total} products
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={pagination.current_page === 1}
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create, Edit, and View Dialogs remain the same */}
    </div>
  );
};

export default AdminProductCRUD;
