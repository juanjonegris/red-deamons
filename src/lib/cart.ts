import type { LocalCart, LocalCartItem, Cart, CartItem, CartWithItems, ProductVariant, Product } from './types';
import { supabase } from './supabase';

// Local Storage Keys
const LOCAL_CART_KEY = 'red-demons-cart';

// Generate unique session ID for guest users
function generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get or create session ID
function getSessionId(): string {
    let sessionId = localStorage.getItem('guest-session-id');
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('guest-session-id', sessionId);
    }
    return sessionId;
}

// Local Storage Cart Functions
export function getLocalCart(): LocalCart {
    try {
        const cartData = localStorage.getItem(LOCAL_CART_KEY);
        if (!cartData) {
            return {
                items: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }
        return JSON.parse(cartData);
    } catch (error) {
        console.error('Error getting local cart:', error);
        return {
            items: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
}

export function saveLocalCart(cart: LocalCart): void {
    try {
        cart.updated_at = new Date().toISOString();
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving local cart:', error);
    }
}

export function addToLocalCart(productVariantId: number, quantity: number = 1): LocalCart {
    const cart = getLocalCart();
    const existingItem = cart.items.find(item => item.product_variant_id === productVariantId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            id: generateSessionId(),
            product_variant_id: productVariantId,
            quantity,
            added_at: new Date().toISOString()
        });
    }
    
    saveLocalCart(cart);
    return cart;
}

export function updateLocalCartItem(productVariantId: number, quantity: number): LocalCart {
    const cart = getLocalCart();
    const item = cart.items.find(item => item.product_variant_id === productVariantId);
    
    if (item) {
        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.product_variant_id !== productVariantId);
        } else {
            item.quantity = quantity;
        }
    }
    
    saveLocalCart(cart);
    return cart;
}

export function removeFromLocalCart(productVariantId: number): LocalCart {
    const cart = getLocalCart();
    cart.items = cart.items.filter(item => item.product_variant_id !== productVariantId);
    saveLocalCart(cart);
    return cart;
}

export function clearLocalCart(): void {
    localStorage.removeItem(LOCAL_CART_KEY);
}

export function getLocalCartItemCount(): number {
    const cart = getLocalCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
}

// Database Cart Functions (for logged-in users)
export async function getOrCreateCart(userId?: string): Promise<Cart> {
    try {
        if (!userId) {
            // Guest cart - use session ID
            const sessionId = getSessionId();
            let { data: cart, error } = await supabase
                .from('carts')
                .select('*')
                .eq('session_id', sessionId)
                .single();
            
            if (error && error.code === 'PGRST116') {
                // Cart doesn't exist, create it
                const { data: newCart, error: createError } = await supabase
                    .from('carts')
                    .insert({ session_id: sessionId })
                    .select()
                    .single();
                
                if (createError) throw createError;
                return newCart;
            }
            
            if (error) throw error;
            return cart;
        } else {
            // Logged-in user cart
            let { data: cart, error } = await supabase
                .from('carts')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error && error.code === 'PGRST116') {
                // Cart doesn't exist, create it
                const { data: newCart, error: createError } = await supabase
                    .from('carts')
                    .insert({ user_id: userId })
                    .select()
                    .single();
                
                if (createError) throw createError;
                return newCart;
            }
            
            if (error) throw error;
            return cart;
        }
    } catch (error) {
        console.error('Error getting/creating cart:', error);
        throw error;
    }
}

export async function getCartWithItems(cartId: number): Promise<CartWithItems | null> {
    try {
        const { data, error } = await supabase
            .from('carts')
            .select(`
                *,
                cart_items (
                    *,
                    product_variant (
                        *,
                        product:products (*)
                    )
                )
            `)
            .eq('id', cartId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting cart with items:', error);
        return null;
    }
}

export async function addCartItem(cartId: number, productVariantId: number, quantity: number): Promise<void> {
    try {
        // Check if item already exists
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cartId)
            .eq('product_variant_id', productVariantId)
            .single();
        
        if (existingItem) {
            // Update quantity
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + quantity })
                .eq('id', existingItem.id);
            
            if (error) throw error;
        } else {
            // Insert new item
            const { error } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: cartId,
                    product_variant_id: productVariantId,
                    quantity
                });
            
            if (error) throw error;
        }
    } catch (error) {
        console.error('Error adding cart item:', error);
        throw error;
    }
}

export async function updateCartItem(cartId: number, productVariantId: number, quantity: number): Promise<void> {
    try {
        if (quantity <= 0) {
            // Remove item
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cartId)
                .eq('product_variant_id', productVariantId);
            
            if (error) throw error;
        } else {
            // Update quantity
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('cart_id', cartId)
                .eq('product_variant_id', productVariantId);
            
            if (error) throw error;
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
}

export async function removeCartItem(cartId: number, productVariantId: number): Promise<void> {
    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId)
            .eq('product_variant_id', productVariantId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Error removing cart item:', error);
        throw error;
    }
}

export async function clearCart(cartId: number): Promise<void> {
    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
}

// Stock validation
export async function validateStock(productVariantId: number, quantity: number): Promise<boolean> {
    try {
        const { data: variant, error } = await supabase
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', productVariantId)
            .single();
        
        if (error) throw error;
        return variant.stock_quantity >= quantity;
    } catch (error) {
        console.error('Error validating stock:', error);
        return false;
    }
}

// Utility functions
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(price);
}

export function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RD-${year}${month}${day}-${random}`;
}
