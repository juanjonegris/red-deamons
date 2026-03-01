import type { APIRoute } from 'astro';
import { updateLocalCartItem } from '../../../lib/cart';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { productVariantId, quantity } = body;

        if (!productVariantId || !Number.isInteger(productVariantId)) {
            return new Response(
                JSON.stringify({ error: 'Invalid product variant ID' }),
                { status: 400 }
            );
        }

        if (!Number.isInteger(quantity)) {
            return new Response(
                JSON.stringify({ error: 'Invalid quantity' }),
                { status: 400 }
            );
        }

        // Update local cart
        const cart = updateLocalCartItem(productVariantId, quantity);

        return new Response(
            JSON.stringify({ 
                success: true, 
                cart,
                itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
            }),
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error updating cart:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
};
