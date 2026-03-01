export interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    created_at: string;
}

export interface Product {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    base_price: number;
    category_id?: number | null;
    gender?: 'hombre' | 'mujer' | 'unisex' | 'nino' | null;
    is_active: boolean;
    created_at: string;
    // Joins
    product_images?: ProductImage[];
    product_variants?: ProductVariant[];
    categories?: Category;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    alt_text?: string | null;
    is_primary: boolean;
    display_order: number;
    created_at: string;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku?: string | null;
    price?: number | null;
    stock_quantity: number;
    attributes: Record<string, any>;
    created_at: string;
}

// Cart Types
export interface Cart {
    id: number;
    user_id?: string | null;
    session_id?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CartItem {
    id: number;
    cart_id: number;
    product_variant_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    // Joined fields
    product_variant?: ProductVariant & {
        product: Product;
    };
}

export interface CartWithItems extends Cart {
    cart_items: (CartItem & {
        product_variant: ProductVariant & {
            product: Product;
        };
    })[];
}

// Order Types
export interface Order {
    id: number;
    user_id?: string | null;
    order_number: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    currency: string;
    shipping_address?: Record<string, any> | null;
    billing_address?: Record<string, any> | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_variant_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    // Joined fields
    product_variant?: ProductVariant & {
        product: Product;
    };
}

export interface OrderWithItems extends Order {
    order_items: (OrderItem & {
        product_variant: ProductVariant & {
            product: Product;
        };
    })[];
}

// Local Storage Cart Types (for guest users)
export interface LocalCartItem {
    id: string; //临时ID
    product_variant_id: number;
    quantity: number;
    added_at: string;
}

export interface LocalCart {
    items: LocalCartItem[];
    created_at: string;
    updated_at: string;
}
