import { calculateTraeloYaPrice } from './couriers/traeloYaService.js';
import { calculateUderPrice } from './couriers/uderService.js';

export const getShippingPrices = async (cartData, allProducts) => {
  const [traeloYaPrice, uderPrice] = await Promise.all([
    calculateTraeloYaPrice(cartData, allProducts),
    calculateUderPrice(cartData, allProducts)
  ]);

  return {
    traeloYa: traeloYaPrice !== null ? parseFloat(traeloYaPrice.toFixed(2)) : null,
    uder: uderPrice !== null ? parseFloat(uderPrice.toFixed(2)) : null
  };
};

export const determineCheapestCourier = (prices) => {
  const validPrices = Object.entries(prices)
    .filter(([_, price]) => price !== null)
    .map(([courier, price]) => ({ courier, price }));

  if (validPrices.length === 0) return null;
  return validPrices.reduce((cheapest, current) => 
    current.price < cheapest.price ? current : cheapest
  );
};