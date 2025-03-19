import { insecureAgent } from '../../config/httpsAgent.js';
import { STORE_INFO } from '../../config/constants.js';
import { calculateProductVolume } from "../productService.js";
import fetch from 'node-fetch';

export const calculateTraeloYaPrice = async (cartData, allProducts) => {
  try {
    const payload = buildTraeloYaPayload(cartData, allProducts);
    const response = await fetch(
      process.env.TRAELOYA_API_URL,
      {
        method: 'POST',
        agent: insecureAgent,
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.TRAELOYA_API_KEY
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    console.log("traeloya", data);
    console.log("traeloya payload", payload);
    return data.deliveryOffers?.pricing.total || null;
  } catch (error) {
    console.error('Error en TraeloYa:', error);
    return null;
  }
};

const buildTraeloYaPayload = (cartData, allProducts) => ({
  items: cartData.products.map(cartProduct => {
    const dbProduct = allProducts.find(p => p.id === parseInt(cartProduct.productId, 10));
    return {
      quantity: cartProduct.quantity,
      value: cartProduct.price,
      volume: calculateProductVolume(dbProduct)
    };
  }),
  waypoints: [
    createWaypoint('PICK_UP', STORE_INFO),
    createWaypoint('DROP_OFF', formatCustomerData(cartData.customer_data))
  ]
});

const createWaypoint = (type, data) => ({
  type,
  addressStreet: data.addressStreet,
  city: data.commune,
  phone: data.phone,
  name: data.name
});

const formatCustomerData = (customerData) => ({
    ...customerData,
    addressStreet: customerData.shipping_street,
  });