import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Package,
  Truck,
  Shield,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PurchaseFlowHelper } from "@/components/PurchaseFlowHelper";
import { authAPI } from "@/services/api";
import { Product, Category, Brand } from "@/lib/types";
import { motion } from "framer-motion";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const productsResponse = await authAPI.getProducts();
        setProducts(Array.isArray(productsResponse) ? productsResponse : []);
        const categoriesResponse = await authAPI.getCategories();
        setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
        const brandsResponse = await authAPI.getBrands();
        setBrands(Array.isArray(brandsResponse) ? brandsResponse : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsAndCategories();
  }, []);

  const filteredProducts = Array.isArray(products) ? products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || (product.category && product.category.slug === selectedCategory);
    const matchesBrand = !selectedBrand || (product.brand && product.brand.slug === selectedBrand);
    return matchesSearch && matchesCategory && matchesBrand;
  }) : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.sale_price || a.price) - (b.sale_price || b.price);
      case "price-high":
        return (b.sale_price || b.price) - (a.sale_price || a.price);
      case "rating":
        return (b.average_rating || 0) - (a.average_rating || 0);
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-metallic-700 font-medium">Loading products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-metallic-900 via-metallic-700 to-metallic-500 text-white py-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay opacity-30"
            style={{
              backgroundImage:
                'url("https://images.pexels.com/photos/7621136/pexels-photo-7621136.jpeg")',
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Discover Premium
                <span className="block text-metallic-100">Products</span>
              </h1>
              <p className="text-xl md:text-2xl text-metallic-100 mb-8 max-w-3xl mx-auto">
                Experience the finest selection of quality products with our
                metallic chic collection
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  className="bg-white text-metallic-900 hover:bg-metallic-100 px-8 py-3 text-lg"
                  asChild
                >
                  <Link to="/products">
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-metallic-900 px-8 py-3 text-lg"
                  asChild
                >
                  <Link to="/categories">Browse Categories</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="text-center p-6 rounded-lg bg-metallic-50 dark:bg-slate-800 hover:bg-metallic-100 dark:hover:bg-slate-700 transition-colors">
                <div className="w-16 h-16 bg-metallic-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-metallic-900 dark:text-white mb-2 transition-colors">
                  Free Shipping
                </h3>
                <p className="text-metallic-600">
                  Free shipping on orders over $99. Fast and reliable delivery.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-metallic-50 hover:bg-metallic-100 transition-colors">
                <div className="w-16 h-16 bg-metallic-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-metallic-900 mb-2">
                  Secure Payment
                </h3>
                <p className="text-metallic-600">
                  Your payment information is always secure and protected.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-metallic-50 hover:bg-metallic-100 transition-colors">
                <div className="w-16 h-16 bg-metallic-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-metallic-900 mb-2">
                  Quality Guarantee
                </h3>
                <p className="text-metallic-600">
                  Premium quality products with satisfaction guarantee.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-metallic-50 dark:bg-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Purchase Flow Helper */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <PurchaseFlowHelper />
            </motion.div>
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-metallic-900 dark:text-white mb-2 transition-colors">
                  Featured Products
                </h2>
                <p className="text-metallic-600">
                  Discover our handpicked selection of premium products
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-metallic-700 text-white hover:bg-metallic-900"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Hot Deals
              </Badge>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4 mb-8 p-6 bg-white rounded-lg shadow-sm"
            >
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-500 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-metallic-300 focus:border-metallic-700"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Select
                  value={selectedCategory || "all-categories"}
                  onValueChange={(value) =>
                    setSelectedCategory(value === "all-categories" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-40 border-metallic-300">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">
                      All Categories
                    </SelectItem>
                    {Array.isArray(categories) && categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedBrand || "all-brands"}
                  onValueChange={(value) =>
                    setSelectedBrand(value === "all-brands" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-32 border-metallic-300">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-brands">All Brands</SelectItem>
                    {Array.isArray(brands) && brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.slug}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-metallic-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-metallic-300 rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "bg-metallic-700 hover:bg-metallic-900"
                        : ""
                    }
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "bg-metallic-700 hover:bg-metallic-900"
                        : ""
                    }
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {Array.isArray(sortedProducts) && sortedProducts.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {sortedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-metallic-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-metallic-600 mb-2">
                    No products found
                  </h3>
                  <p className="text-metallic-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </motion.div>

            {/* Load More Button */}
            {Array.isArray(sortedProducts) && sortedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="text-center mt-8"
              >
                <Button
                  variant="outline"
                  className="border-metallic-300 text-metallic-700 hover:bg-metallic-100"
                >
                  Load More
                  <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;


