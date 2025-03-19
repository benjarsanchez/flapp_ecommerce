export const validateCartRequest = (body) => {
    const errors = [];
    
    if (!body.products?.length) errors.push('Se requiere un array de productos');
    if (!body.customer_data) errors.push('Faltan datos del cliente');
  
    if (body.products) {
      body.products.forEach((product, index) => {
        if (!product.productId) errors.push(`Producto ${index + 1}: falta productId`);
        if (typeof product.price === 'undefined') errors.push(`Producto ${index + 1}: falta precio`);
        if (!product.quantity) errors.push(`Producto ${index + 1}: falta cantidad`);
        if (typeof product.discount === 'undefined') errors.push(`Producto ${index + 1}: falta descuento`);
      });
    }
  
    if (body.customer_data) {
      const { name, shipping_street, commune, phone } = body.customer_data;
      if (!name) errors.push('Nombre del cliente es requerido');
      if (!shipping_street) errors.push('Dirección de envío es requerida');
      if (!commune) errors.push('Comuna es requerida');
      if (!phone) errors.push('Teléfono es requerido');
    }
  
    return errors;
  };