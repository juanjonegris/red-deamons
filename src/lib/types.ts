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
