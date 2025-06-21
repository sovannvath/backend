import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Package, Heart } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      setProduct(response.data.product || response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await axios.post(`${API_BASE_URL}/cart/add`, {
        product_id: product.id,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Show success message or update cart count
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/wishlist/${product.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      alert('Product added to wishlist successfully!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add product to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <Button onClick={() => navigate('/products')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Button 
        onClick={() => navigate('/products')} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-xl text-green-600 font-semibold mt-2">
              ${product.price}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
              {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Badge>
            <span className="text-sm text-gray-500">
              {product.stock_quantity} available
            </span>
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <Badge variant="destructive">Low Stock</Badge>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {product.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">SKU:</span>
                <span>{product.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <span>{product.category?.name || 'Uncategorized'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Brand:</span>
                <span>{product.brand?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Weight:</span>
                <span>{product.weight ? `${product.weight}g` : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || addingToCart}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            
            <Button 
              onClick={handleAddToWishlist}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Add to Wishlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

