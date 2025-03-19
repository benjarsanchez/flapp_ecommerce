import fetch from 'node-fetch';
import { PAGINATION_CONFIG } from '../config/constants.js';

export const fetchAllProducts = async () => {
  try {
    let allProducts = [];
    let skip = PAGINATION_CONFIG.initialSkip;
    let total = null;

    do {
      const response = await fetch(
        `${process.env.CART_API_URL}/products?limit=${PAGINATION_CONFIG.limit}&skip=${skip}`
      );
      
      if (!response.ok) throw new Error('Error fetching products');
      
      const data = await response.json();
      total ??= data.total;
      allProducts = allProducts.concat(data.products);
      skip += PAGINATION_CONFIG.limit;
    } while (skip < total);

    return allProducts;
  } catch (error) {
    console.error('Error in fetchAllProducts:', error);
    throw error;
  }
};

export const validateCartProducts = (cartProducts, allProducts) => {
  const productErrors = [];
  const cartLog = cartProducts.map(cartProduct => {
    const productId = parseInt(cartProduct.productId, 10);
    const dbProduct = allProducts.find(p => p.id === productId);
    
    const logEntry = createLogEntry(cartProduct, productId, dbProduct);
    
    if (!dbProduct) {
      productErrors.push(`Producto no encontrado: ${productId}`);
      return logEntry;
    }

    const stockValidation = validateProductStock(cartProduct, dbProduct, productId);
    productErrors.push(...stockValidation.errors);
    
    return { ...logEntry, ...stockValidation.logData };
  });

  return { productErrors, cartLog };
};

const createLogEntry = (cartProduct, productId, dbProduct) => ({
  id: productId,
  nombre: dbProduct?.title || 'No encontrado',
  precioPorUnidad: cartProduct.price,
  descuentoTotal: cartProduct.discount,
  cantidadSolicitada: cartProduct.quantity,
  stockObtenido: dbProduct?.stock ?? 'N/A',
  rating: dbProduct?.rating ?? 'N/A',
  stockReal: calculateRealStock(dbProduct)
});

const calculateRealStock = (dbProduct) => {
  if (!dbProduct) return 'N/A';
  return dbProduct.rating === 0 ? 0 : Math.floor(dbProduct.stock / dbProduct.rating);
};

const validateProductStock = (cartProduct, dbProduct, productId) => {
  const result = { errors: [], logData: {} };
  const realStock = calculateRealStock(dbProduct);

  if (cartProduct.quantity > realStock) {
    result.errors.push(
      `Stock insuficiente para producto ${productId}: ` +
      `Solicitado: ${cartProduct.quantity}, Disponible: ${realStock}`
    );
  }

  result.logData = {
    nombre: dbProduct.title,
    stockObtenido: dbProduct.stock,
    rating: dbProduct.rating,
    stockReal: realStock
  };

  return result;
};

export const calculateProductVolume = (product) => 
    product.dimensions.height * 
    product.dimensions.width * 
    product.dimensions.depth;