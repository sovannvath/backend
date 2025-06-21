import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  Loader2,
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
  };
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  order_items: OrderItem[];
  payment_method: {
    id: number;
    name: string;
  };
}

interface Transaction {
  id: number;
  ticket_number: string;
  amount: number;
  transaction_type: string;
  status: string;
  created_at: string;
  created_at_cambodia: string;
  order: Order;
}

interface TransactionSummary {
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_spent: number;
  total_refunded: number;
}

const UserTransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    ticket_number: "",
    transaction_type: "",
    status: "",
  });

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await api.get(`/user/transactions?${params}`);
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

      const response = await api.get(`/user/transactions/summary?${params}`);
      setSummary(response.data.summary);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch summary",
        variant: "destructive",
      });
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
      ticket_number: "",
      transaction_type: "",
      status: "",
    });
    setCurrentPage(1);
    fetchTransactions(1);
    fetchSummary();
  };

  const searchByTicket = async () => {
    if (!filters.ticket_number.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket number",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post("/user/transactions/search-by-ticket", {
        ticket_number: filters.ticket_number,
      });
      
      setTransactions([response.data.transaction]);
      setCurrentPage(1);
      setTotalPages(1);
      
      toast({
        title: "Success",
        description: "Transaction found",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Transaction not found",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "Payment":
        return <Badge className="bg-blue-100 text-blue-800">Payment</Badge>;
      case "Refund":
        return <Badge className="bg-purple-100 text-purple-800">Refund</Badge>;
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
      timeZone: "Asia/Phnom_Penh",
    });
  };

  const formatCambodiaDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("km-KH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Phnom_Penh",
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
          <h1 className="text-3xl font-bold flex items-center">
            <Receipt className="w-8 h-8 mr-3 text-blue-600" />
            My Transaction History
          </h1>
          <p className="text-gray-600">View and manage your purchase transactions</p>
        </div>
        <Button onClick={() => { fetchTransactions(currentPage); fetchSummary(); }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_transactions}</div>
              <div className="text-xs text-muted-foreground">
                {summary.successful_transactions} successful
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_spent)}</div>
              <div className="text-xs text-muted-foreground">
                Successful payments
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.total_refunded)}</div>
              <div className="text-xs text-muted-foreground">
                Refund transactions
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
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div>
              <Label htmlFor="ticket_number">Ticket Number</Label>
              <Input
                id="ticket_number"
                placeholder="Enter ticket number..."
                value={filters.ticket_number}
                onChange={(e) => handleFilterChange("ticket_number", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transaction_type">Transaction Type</Label>
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
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button onClick={searchByTicket} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search by Ticket
            </Button>
            <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Number</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date (Cambodia)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="font-mono font-medium text-blue-600">
                          {transaction.ticket_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.order.order_number}</div>
                          <div className="text-sm text-gray-500">
                            {transaction.order.order_items.length} item(s)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTransactionTypeBadge(transaction.transaction_type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatCambodiaDate(transaction.created_at_cambodia)}
                        </div>
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
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-6">
                                {/* Transaction Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Transaction Information</h3>
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Ticket Number</label>
                                      <p className="font-mono font-medium text-blue-600">{selectedTransaction.ticket_number}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Amount</label>
                                      <p className="font-bold text-lg">{formatCurrency(selectedTransaction.amount)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Type</label>
                                      <p>{getTransactionTypeBadge(selectedTransaction.transaction_type)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Status</label>
                                      <p>{getStatusBadge(selectedTransaction.status)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Date (Cambodia)</label>
                                      <p>{formatCambodiaDate(selectedTransaction.created_at_cambodia)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                                      <p>{selectedTransaction.order.payment_method.name}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Order Number</label>
                                        <p className="font-medium">{selectedTransaction.order.order_number}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Order Status</label>
                                        <p>{selectedTransaction.order.order_status}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium text-gray-500 mb-2 block">Order Items</label>
                                      <div className="space-y-2">
                                        {selectedTransaction.order.order_items.map((item) => (
                                          <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                                            <div>
                                              <p className="font-medium">{item.product.name}</p>
                                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">{formatCurrency(item.price)}</p>
                                          </div>
                                        ))}
                                      </div>
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

export default UserTransactionHistory;

