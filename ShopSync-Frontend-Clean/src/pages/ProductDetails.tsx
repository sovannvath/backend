import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  ChevronLeft,
  Check,
  AlertCircle,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

// API interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock: number;
  category_id: number;
  brand_id: number;
  images: Array<{
    id: number;
    product_id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  category: { id: number; name: string; slug: string };
  brand: { id: number; name: string; slug: string };
  reviews: Array<{
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }>;
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Mock API service
const productAPI = {
  getProduct: async (id: string): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: parseInt(id),
      name: "Premium Wireless Headphones",
      description: "Experience superior sound quality with our premium wireless headphones featuring advanced noise cancellation technology, comfortable over-ear design, and up to 30 hours of battery life. Perfect for music lovers, professionals, and anyone who demands the best audio experience.",
      price: 299.99,
      sale_price: 249.99,
      sku: "WH-001",
      stock: 50,
      category_id: 1,
      brand_id: 1,
      images: [
        {
          id: 1,
          product_id: parseInt(id),
          url: "/placeholder.svg",
          alt_text: "Wireless Headphones - Front View",
          is_primary: true,
        },
        {
          id: 2,
          product_id: parseInt(id),
          url: "/placeholder.svg",
          alt_text: "Wireless Headphones - Side View",
          is_primary: false,
        },
      ],
      category: { id: 1, name: "Electronics", slug: "electronics" },
      brand: { id: 1, name: "AudioTech", slug: "audiotech" },
      reviews: [
        {
          id: 1,
          user_name: "John D.",
          rating: 5,
          comment: "Amazing sound quality and comfort!",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          user_name: "Sarah M.",
          rating: 4,
          comment: "Great headphones, battery life is excellent.",
          created_at: "2024-01-10T14:20:00Z",
        },
      ],
      average_rating: 4.5,
      review_count: 128,
      is_featured: true,
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
  },

  getRelatedProducts: async (categoryId: number, excludeId: number): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: 2,
        name: "Smart Fitness Watch",
        description: "Advanced fitness tracking watch",
        price: 199.99,
        sku: "FW-002",
        stock: 75,
        category_id: categoryId,
        brand_id: 2,
        images: [
          {
            id: 3,
            product_id: 2,
            url: "/placeholder.svg",
            alt_text: "Fitness Watch",
            is_primary: true,
          },
        ],
        category: { id: categoryId, name: "Electronics", slug: "electronics" },
        brand: { id: 2, name: "FitPro", slug: "fitpro" },
        reviews: [],
        average_rating: 4.2,
        review_count: 89,
        is_featured: true,
        status: "active" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
  },
};

const cartAPI = {
  addItem: async (productId: number, quantity: number) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Product added to cart" };
  },
};

const wishlistAPI = {
  addItem: async (productId: number) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: "Product added to wishlist" };
  },

  removeItem: async (productId: number) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: "Product removed from wishlist" };
  },

  checkItem: async (productId: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return false; // Mock: not in wishlist initially
  },
};

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    if (!id) return;

    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await productAPI.getProduct(id!);
      setProduct(productData);
      
      // Load related products
      const relatedData = await productAPI.getRelatedProducts(productData.category_id, productData.id);
      setRelatedProducts(relatedData);
      
      // Check if product is in wishlist
      const wishlistStatus = await wishlistAPI.checkItem(productData.id);
      setIsWishlisted(wishlistStatus);
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if product is out of stock
    if (product.stock === 0) {
      toast.error("This product is currently out of stock and cannot be added to cart");
      return;
    }

    // Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartAPI.addItem(product.id, quantity);
      toast.success(`Added ${quantity} ${product.name}(s) to cart`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await wishlistAPI.removeItem(product.id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await wishlistAPI.addItem(product.id);
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Check if product is out of stock
    if (product.stock === 0) {
      toast.error("This product is currently out of stock and cannot be purchased");
      return;
    }

    // Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartAPI.addItem(product.id, quantity);
      navigate("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-metallic-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-metallic-900 dark:text-white mb-2">
              Product Not Found
            </h2>
            <p className="text-metallic-600 dark:text-slate-400 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="bg-metallic-700 hover:bg-metallic-900">
              <Link to="/">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const currentPrice = product.sale_price || product.price;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-metallic-600 dark:text-slate-400 mb-6"
          >
            <Link to="/" className="hover:text-metallic-900 dark:hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link
              to={`/categories/${product.category.slug}`}
              className="hover:text-metallic-900 dark:hover:text-white"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-metallic-900 dark:text-white">{product.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="aspect-square bg-white rounded-lg overflow-hidden border">
                <img
                  src={product.images[selectedImageIndex]?.url || "/placeholder.svg"}
                  alt={product.images[selectedImageIndex]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        selectedImageIndex === index
                          ? "border-metallic-700"
                          : "border-transparent hover:border-metallic-300"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.alt_text}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">{product.brand.name}</Badge>
                  {product.is_featured && (
                    <Badge className="bg-metallic-700">Featured</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-metallic-900 dark:text-white mb-4">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < Math.floor(product.average_rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-metallic-600 dark:text-slate-400">
                    {product.average_rating} ({product.review_count} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-metallic-900 dark:text-white">
                    {formatCurrency(currentPrice)}
                  </span>
                  {product.sale_price && (
                    <>
                      <span className="text-xl text-metallic-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge variant="destructive">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-metallic-600 dark:text-slate-400">
                  SKU: {product.sku}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      In Stock ({product.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Out of Stock Warning */}
              {product.stock === 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      This product is currently out of stock
                    </span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    Please check back later or contact us for availability updates.
                  </p>
                </div>
              )}

              {/* Low Stock Warning */}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">
                      Only {product.stock} left in stock!
                    </span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    Order soon to avoid missing out.
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-metallic-900 dark:text-white mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="h-10 w-10 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="px-4 py-2 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock}
                          className="h-10 w-10 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <span className="text-sm text-metallic-600 dark:text-slate-400">
                        {formatCurrency(currentPrice * quantity)} total
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || product.stock === 0}
                      className="flex-1 bg-metallic-700 hover:bg-metallic-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      )}
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    
                    <Button
                      onClick={handleBuyNow}
                      disabled={isAddingToCart || product.stock === 0}
                      variant="outline"
                      className="flex-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      {product.stock === 0 ? "Unavailable" : "Buy Now"}
                    </Button>
                    
                    <Button
                      onClick={handleToggleWishlist}
                      disabled={isTogglingWishlist}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "transition-colors",
                        isWishlisted
                          ? "text-red-600 hover:text-red-700"
                          : "text-metallic-600 hover:text-metallic-900"
                      )}
                    >
                      {isTogglingWishlist ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart
                          className={cn(
                            "w-4 h-4",
                            isWishlisted && "fill-current"
                          )}
                        />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-metallic-600 dark:text-slate-400">
                    Secure Payment
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-metallic-600 dark:text-slate-400">
                    Free Shipping
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-metallic-600 dark:text-slate-400">
                    30-Day Returns
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-metallic-700 dark:text-slate-300 leading-relaxed">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-metallic-900 dark:text-white mb-2">
                          General
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-metallic-600 dark:text-slate-400">Brand:</span>
                            <span className="text-metallic-900 dark:text-white">{product.brand.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-metallic-600 dark:text-slate-400">Category:</span>
                            <span className="text-metallic-900 dark:text-white">{product.category.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-metallic-600 dark:text-slate-400">SKU:</span>
                            <span className="text-metallic-900 dark:text-white">{product.sku}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-metallic-900 dark:text-white">
                              {review.user_name}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-4 h-4",
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-metallic-600 dark:text-slate-400">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-metallic-700 dark:text-slate-300">
                          {review.comment}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-metallic-900 dark:text-white mb-6">
                Related Products
              </h2>
            
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
