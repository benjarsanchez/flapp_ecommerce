import { asyncHandler, CustomError } from '../utils/errorHandler.js';
import { validateCartRequest } from '../middlewares/requestValidation.js';
import { fetchAllProducts, validateCartProducts } from '../services/productService.js';
import { getShippingPrices, determineCheapestCourier } from '../services/courierService.js';
import { logCart, logShippingPrices } from '../utils/logger.js';
import { successResponse } from '../utils/responseHandler.js';
import { getRandomCart } from '../services/cartService.js';

export const postCart = asyncHandler(async (req, res) => {
  const validationErrors = validateCartRequest(req.body);
  if (validationErrors.length > 0) {
    throw new CustomError(validationErrors.join(' | '), 400);
  }

  const allProducts = await fetchAllProducts();
  const { productErrors, cartLog } = validateCartProducts(req.body.products, allProducts);
  
  logCart(cartLog);

  if (productErrors.length > 0) {
    throw new CustomError(productErrors.join(' | '), 400);
  }

  const shippingPrices = await getShippingPrices(req.body, allProducts);
  logShippingPrices(shippingPrices);
  
  const cheapestOption = determineCheapestCourier(shippingPrices);
  if (!cheapestOption) {
    throw new CustomError('No hay tarifas disponibles', 400);
  }

  successResponse(res, {
    courier: cheapestOption.courier,
    price: cheapestOption.price
  });
});

export const getCart = asyncHandler(async (req, res) => {
  try {
    const randomCart = await getRandomCart();
    res.json(randomCart);
  } catch (error) {
    console.error('Error en getRandomCart:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

