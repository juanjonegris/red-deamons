import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { productVariantId, quantity = 1 } = body;

        console.log('Received request:', { productVariantId, quantity });

        if (!productVariantId || !Number.isInteger(productVariantId)) {
            return new Response(
                JSON.stringify({ error: 'Invalid product variant ID' }),
                { status: 400 }
            );
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return new Response(
                JSON.stringify({ error: 'Invalid quantity' }),
                { status: 400 }
            );
        }

        // Return success - cart operations will be handled client-side
        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'Item ready to add to cart',
                productVariantId,
                quantity
            }),
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error adding to cart:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: error.message }),
            { status: 500 }
        );
    }
};
