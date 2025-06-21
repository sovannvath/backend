import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Show success toast
      console.log("Added to cart:", product.name);
    }, 1000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(className)}
    >
      <Card className="group overflow-hidden bg-white border-metallic-200 hover:border-metallic-400 hover:shadow-xl transition-all duration-300">
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <div className="aspect-square bg-metallic-100 relative overflow-hidden">
          <img
  src={product?.images?.[0]?.url || "/placeholder.svg"}
  alt={product?.images?.[0]?.alt_text || product?.name || "Product image"}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
/>

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-metallic-900"
                asChild
              >
                <Link to={`/products/${product.id}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isLoading || product.stock === 0}
                className="bg-metallic-700 hover:bg-metallic-900 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                {isLoading ? "Adding..." : "Add"}
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col space-y-1">
              {product.is_featured && (
                <Badge
                  variant="default"
                  className="bg-metallic-700 hover:bg-metallic-900 text-white text-xs"
                >
                  Featured
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white text-xs"
                >
                  -{discountPercentage}%
                </Badge>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs"
                >
                  Low Stock
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge
                  variant="destructive"
                  className="bg-gray-500 text-white text-xs"
                >
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white text-metallic-700 rounded-full"
              onClick={handleWishlistToggle}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-metallic-600",
                )}
              />
            </Button>
          </div>

          <CardContent className="p-4">
            {/* Category and Brand */}
            <div className="flex items-center justify-between text-xs text-metallic-600 mb-2">
              <span className="bg-metallic-100 px-2 py-1 rounded-full">
                {product.category.name}
              </span>
              <span>{product.brand.name}</span>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-metallic-900 mb-2 line-clamp-2 group-hover:text-metallic-700 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < Math.floor(product.average_rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-metallic-300",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-metallic-600">
                ({product.review_count})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {product.sale_price ? (
                  <>
                    <span className="font-bold text-lg text-metallic-900">
                      ${product.sale_price.toFixed(2)}
                    </span>
                    <span className="text-sm text-metallic-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-lg text-metallic-900">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock indicator */}
              <div className="text-xs text-metallic-600">
                {product.stock > 5 ? (
                  <span className="text-green-600">In Stock</span>
                ) : product.stock > 0 ? (
                  <span className="text-yellow-600">
                    Only {product.stock} left
                  </span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
