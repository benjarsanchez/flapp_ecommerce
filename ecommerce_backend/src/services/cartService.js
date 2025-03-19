import fetch from 'node-fetch';

const PAGINATION_CONFIG = {
    limit: 10,
    initialSkip: 0
  };

  export const fetchAllCarts = async () => {
    try {
      let allCarts = [];
      let skip = PAGINATION_CONFIG.initialSkip;
      let total = null;
  
      do {
        const response = await fetch(
          `${process.env.CART_API_URL}/carts?limit=${PAGINATION_CONFIG.limit}&skip=${skip}`
        );
        
        if (!response.ok) throw new Error('Error fetching carts');
        
        const data = await response.json();
        total ??= data.total;
        allCarts = allCarts.concat(data.carts);
        skip += PAGINATION_CONFIG.limit;
      } while (skip < total);
  
      return allCarts;
    } catch (error) {
      console.error('Error in fetchAllCarts:', error);
      throw error;
    }
  };
  
  export const getRandomCart = async () => {
    try {
      const allCarts = await fetchAllCarts();
      
      if (!allCarts || allCarts.length === 0) {
        throw new Error('No se encontraron carritos');
      }
  
      const randomIndex = Math.floor(Math.random() * allCarts.length);
      const randomCart = allCarts[randomIndex];
  
      const productsWithDetails = await Promise.all(
        randomCart.products.map(async (product) => {
          const productResponse = await fetch(`${process.env.CART_API_URL}/products/${product.id}`);
          return productResponse.json();
        })
      );
  
      return {
        id: randomCart.id,
        userId: randomCart.userId,
        products: productsWithDetails.map(p => ({
          productId: p.id,
          title: p.title,
          price: p.price,
          quantity: p.quantity || 1,
          discount: p.discountPercentage || 0,
          total: p.price * (p.quantity || 1)
        })),
        total: randomCart.total,
        discountedTotal: randomCart.discountedTotal
      };
    } catch (error) {
      console.error('Error in getRandomCart:', error);
      throw error;
    }
  };