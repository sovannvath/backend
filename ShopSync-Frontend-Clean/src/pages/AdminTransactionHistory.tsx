import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import  api  from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Transaction {
  id: number;
  ticket_number: string;
  amount: number;
  transaction_type: "Payment" | "Refund";
  status: "Success" | "Failed" | "Pending";
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  order: {
    id: number;
    order_number: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    order_items: Array<{
      id: number;
      quantity: number;
      price: number;
      product: {
        id: number;
        name: string;
        image?: string;
      };
    }>;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface TransactionSummary {
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_amount: number;
  payment_amount: number;
  refund_amount: number;
}

const AdminTransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    username: "",
    user_email: "",
    ticket_number: "",
    transaction_type: "",
    status: "",
  });

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "15",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await api.get(`/transactions?${params}`);
      setTransactions(response.data.transactions.data);
      setCurrentPage(response.data.transactions.current_page);
      setTotalPages(response.data.transactions.last_page);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        )
      );

      const response = await api.get(`/transactions/summary?${params}`);
      setSummary(response.data.summary);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch summary",
        variant: "destructive",
      });
    }
  };

  const searchByTicket = async (ticketNumber: string) => {
    if (!ticketNumber.trim()) {
      fetchTransactions();
      return;
    }

    try {
      setSearchLoading(true);
      const response = await api.post("/transactions/search-by-ticket", {
        ticket_number: ticketNumber,
      });
      setTransactions([response.data.transaction]);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setTransactions([]);
        toast({
          title: "Not Found",
          description: "No transaction found with this ticket number",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Search failed",
          variant: "destructive",
        });
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchTransactions(1);
    fetchSummary();
  };

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      username: "",
      user_email: "",
      ticket_number: "",
      transaction_type: "",
      status: "",
    });
    setCurrentPage(1);
    fetchTransactions(1);
    fetchSummary();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Payment":
        return <Badge className="bg-blue-100 text-blue-800"><CreditCard className="w-3 h-3 mr-1" />Payment</Badge>;
      case "Refund":
        return <Badge className="bg-purple-100 text-purple-800"><RefreshCw className="w-3 h-3 mr-1" />Refund</Badge>;
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

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-gray-600">Manage and track all transactions</p>
        </div>
        <Button onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_transactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_amount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.successful_transactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending_transactions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Username</label>
              <Input
                placeholder="Search by username"
                value={filters.username}
                onChange={(e) => handleFilterChange("username", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">User Email</label>
              <Input
                placeholder="Search by email"
                value={filters.user_email}
                onChange={(e) => handleFilterChange("user_email", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ticket Number</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by ticket"
                  value={filters.ticket_number}
                  onChange={(e) => handleFilterChange("ticket_number", e.target.value)}
                />
                <Button
                  onClick={() => searchByTicket(filters.ticket_number)}
                  disabled={searchLoading}
                  size="sm"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Transaction Type</label>
              <Select value={filters.transaction_type} onValueChange={(value) => handleFilterChange("transaction_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Number</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono font-medium">
                        {transaction.ticket_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-sm text-gray-500">{transaction.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{transaction.order.order_number}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(transaction.transaction_type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Ticket Number</label>
                                    <p className="font-mono font-medium">{selectedTransaction.ticket_number}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                                    <p className="font-mono">{selectedTransaction.transaction_id || "N/A"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Amount</label>
                                    <p className="font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <p>{getTypeBadge(selectedTransaction.transaction_type)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <p>{getStatusBadge(selectedTransaction.status)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Date</label>
                                    <p>{formatDate(selectedTransaction.created_at)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Customer</label>
                                  <div className="mt-1">
                                    <p className="font-medium">{selectedTransaction.user.name}</p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.user.email}</p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-500">Order Details</label>
                                  <div className="mt-1">
                                    <p className="font-mono text-sm">{selectedTransaction.order.order_number}</p>
                                    <div className="mt-2 space-y-2">
                                      {selectedTransaction.order.order_items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                          <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                          </div>
                                          <p className="font-medium">{formatCurrency(item.price)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
                    onClick={() => fetchTransactions(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchTransactions(currentPage + 1)}
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

export default AdminTransactionHistory;

