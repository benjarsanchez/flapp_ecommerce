export const logCart = (cartLog) => {
    console.log('\nCarrito recibido:');
    console.table(cartLog);
  };
  
  export const logShippingPrices = (prices) => {
    console.log('\nPrecios de envío obtenidos:');
    console.table(Object.entries(prices).map(([courier, price]) => ({
      Courier: courier,
      Precio: price !== null ? `$${price.toFixed(2)}` : 'No disponible'
    })));
  };