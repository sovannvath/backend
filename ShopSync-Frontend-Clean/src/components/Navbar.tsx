import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Bell,
  Menu,
  X,
  Heart,
  LogOut,
  Settings,
  Package,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      roles: ["Customer", "Admin", "Warehouse Manager", "Staff"],
    },
    {
      name: "Products",
      href: "/products",
      roles: ["Customer", "Admin", "Warehouse Manager", "Staff"],
    },
    {
      name: "Categories",
      href: "/categories",
      roles: ["Customer", "Admin", "Warehouse Manager", "Staff"],
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      roles: ["Admin", "Warehouse Manager", "Staff"],
    },
    {
      name: "Orders",
      href: "/orders",
      roles: ["Customer", "Admin", "Warehouse Manager", "Staff"],
    },
  ];

  const visibleNavItems = navigationItems.filter(
    (item) => !isAuthenticated || !user || item.roles.includes(user.role?.name),
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      console.log("Searching for:", searchQuery);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user?.role?.name) return "/dashboard";
    
    switch (user.role.name) {
      case "Admin":
        return "/dashboard/admin";
      case "Warehouse Manager":
        return "/dashboard/warehouse";
      case "Staff":
        return "/dashboard/staff";
      default:
        return "/dashboard";
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-lg border-b border-metallic-300 dark:border-slate-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 text-metallic-900 dark:text-white font-bold text-xl transition-colors"
          >
            <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center p-1">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPlqFmof7iYObAZxCLgKzGUoubtC9OIq0CXw&s"
                alt="ShopSync Logo"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <span className="hidden sm:block">ShopSync</span>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-8"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-metallic-300 focus:border-metallic-700 focus:ring-metallic-700"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-500 w-4 h-4" />
            </div>
            <Button
              type="submit"
              variant="default"
              className="ml-2 bg-metallic-700 hover:bg-metallic-900"
            >
              Search
            </Button>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {visibleNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-metallic-700 dark:hover:text-metallic-300",
                  location.pathname === item.href
                    ? "text-metallic-900 dark:text-white border-b-2 border-metallic-700 dark:border-metallic-300"
                    : "text-metallic-600 dark:text-slate-300",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Mobile search */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-metallic-600 hover:text-metallic-900"
            >
              <Search className="w-5 h-5" />
            </Button>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative text-metallic-600 hover:text-metallic-900"
                    >
                      <Bell className="w-5 h-5" />
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-red-500 hover:bg-red-600"
                      >
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2">
                      <h3 className="font-semibold text-metallic-900">
                        Notifications
                      </h3>
                      <p className="text-sm text-metallic-600">
                        You have 3 unread notifications
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Order Shipped</p>
                        <p className="text-xs text-metallic-600">
                          Your order #12345 has been shipped
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wishlist (customer only) */}
                {user.role?.name === "Customer" && (
                  <Link to="/wishlist">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-metallic-600 hover:text-metallic-900"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </Link>
                )}

                {/* Cart (customer only) */}
                {user.role?.name === "Customer" && (
                  <Link to="/cart">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative text-metallic-600 hover:text-metallic-900"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-metallic-700 text-white hover:bg-metallic-900"
                      >
                        2
                      </Badge>
                    </Button>
                  </Link>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-metallic-600 hover:text-metallic-900"
                    >
                      <div className="w-8 h-8 rounded-full bg-metallic-300 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="hidden lg:block text-sm font-medium">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
                      <p className="text-sm font-medium text-metallic-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-metallic-600">
                        {user.email}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {user.role?.name}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    {user.role?.name !== "Customer" && (
                      <DropdownMenuItem asChild>
                        <Link to={getDashboardLink()} className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-metallic-600 hover:text-metallic-900"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-metallic-700 hover:bg-metallic-900"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-metallic-600 hover:text-metallic-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-metallic-300">
            <div className="space-y-4">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-metallic-300"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-metallic-700 hover:bg-metallic-900"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>

              {/* Mobile navigation */}
              <div className="space-y-2">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname === item.href
                        ? "bg-metallic-100 text-metallic-900"
                        : "text-metallic-600 hover:bg-metallic-50 hover:text-metallic-900",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile auth actions */}
              {isAuthenticated && user && (
                <div className="pt-4 border-t border-metallic-300">
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm font-medium text-metallic-600 hover:bg-metallic-50 hover:text-metallic-900 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

