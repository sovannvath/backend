export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    preferences?: {
      email_notifications: boolean;
      sms_notifications: boolean;
      marketing_emails: boolean;
    };
    role: {
      id: number;
      name: string;
    };
    created_at: string;
    updated_at: string;
  }
  
  export interface UpdateProfileData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
  }
  
  export interface UpdatePreferencesData {
    email_notifications: boolean;
    sms_notifications: boolean;
    marketing_emails: boolean;
  }
  
  export interface DashboardStats {
    total_income: number;
    orders_by_status: Array<{ order_status: string; count: number }>;
    recent_orders: Array<{
      id: number;
      user: { name: string; email: string };
      total_amount: number;
      order_status: string;
      created_at: string;
      orderItems: Array<{ product: { name: string }; quantity: number }>;
    }>;
    low_stock_products: Array<{
      id: number;
      name: string;
      quantity: number;
      low_stock_threshold: number;
    }>;
    top_selling_products: Array<{
      id: number;
      name: string;
      total_quantity: number;
      total_revenue: number;
    }>;
    user_stats: {
      total_customers: number;
      new_customers: number;
    };
  }
  
  export interface IncomeAnalytics {
    period: string;
    data: Array<{
      date?: string;
      week?: string;
      month?: number;
      year?: number;
      income: number;
      orders_count: number;
    }>;
    total_income: number;
    total_orders: number;
  }
  
  export interface CategoryAnalytics {
    category_performance: Array<{
      id: number;
      name: string;
      products_count: number;
      total_quantity_sold: number;
      total_revenue: number;
    }>;
  }
  
  export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    products_count?: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    created_at: string;
    updated_at: string;
  }

  export interface ProductPreview {
    id: number;
    name: string;
    price: number;
    sale_price?: number;
    stock: number;
    status: boolean;
    images: Array<{
      id: number;
      product_id: number;
      url: string;
      alt_text: string;
      is_primary: boolean;
    }>;
  }
  
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity?: number; // <-- Add this
    low_stock_threshold?: number; // <-- And this
    image?: string; // Single image (legacy)
    images?: Array<{ // Multiple images (new)
      url: string;
      alt_text?: string;
    }>;
    status: boolean;
    created_at: string;
    updated_at: string;
    category: Category;
    brand: Brand;
    sale_price?: number;
    average_rating?: number;
    review_count?: number; // Added this missing property
    is_featured?: boolean;
    stock?: number; // Added this as it's used in the component
  }

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

