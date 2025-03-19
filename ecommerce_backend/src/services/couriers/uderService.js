import { insecureAgent } from '../../config/httpsAgent.js';
import { STORE_INFO } from '../../config/constants.js';
import fetch from 'node-fetch';

export const calculateUderPrice = async (cartData, allProducts) => {
  try {
    const payload = buildUderPayload(cartData, allProducts);
    const response = await fetch(
      process.env.UDER_API_URL,
      {
        method: 'POST',
        agent: insecureAgent,
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.UDER_API_KEY
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.fee || null;
  } catch (error) {
    console.error('Error en Uder:', error);
    return null;
  }
};

const buildUderPayload = (cartData, allProducts) => ({
  pickup_address: `${STORE_INFO.addressStreet}, ${STORE_INFO.commune}`,
  pickup_name: STORE_INFO.name,
  pickup_phone_number: STORE_INFO.phone,
  dropoff_address: `${cartData.customer_data.shipping_street}, ${cartData.customer_data.commune}`,
  dropoff_name: cartData.customer_data.name,
  dropoff_phone_number: cartData.customer_data.phone,
  manifest_items: cartData.products.map(cartProduct => {
    const dbProduct = allProducts.find(p => p.id === parseInt(cartProduct.productId, 10));
    return {
      name: dbProduct.title,
      quantity: cartProduct.quantity,
      price: cartProduct.price,
      dimensions: {
        length: dbProduct.dimensions.width,
        height: dbProduct.dimensions.height,
        depth: dbProduct.dimensions.depth
      }
    };
  })
});