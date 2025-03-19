'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Checkout />
    </Suspense>
  );
}

export function Checkout() {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteResult, setQuoteResult] = useState(null); // Estado para el resultado de la cotización
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  // Obtén el carrito desde la URL
  useEffect(() => {
    const cartParam = searchParams.get('cart');
    if (cartParam) {
      const parsedCart = JSON.parse(decodeURIComponent(cartParam));
      setCart(parsedCart);
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClearCart = () => {
    setCart(null); // Limpia el carrito
    router.push('/'); // Redirige a la vista inicial
  };

  const handleQuoteDelivery = async () => {
    if (!cart || !formData.name || !formData.address || !formData.phone) {
      alert('Por favor, completa todos los campos del formulario.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        products: cart.products.map((item) => ({
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
          discount: item.discountPercentage || 0, // Usa discountPercentage si está disponible
        })),
        customer_data: {
          name: formData.name,
          shipping_street: formData.address,
          commune: 'Vitacura', // Puedes ajustar esto según tus necesidades
          phone: formData.phone,
        },
      };

      const response = await fetch('http://localhost:8000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al cotizar el despacho');

      const data = await response.json();
      setQuoteResult(data.data); // Guarda el resultado de la cotización
      console.log('Cotización exitosa:', data);
    } catch (error) {
      console.error('Error:', error);
      setQuoteResult({ error: 'No hay envíos disponibles :(' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Redirige a Home con el carrito actual como parámetro en la URL
    router.push(`/?cart=${encodeURIComponent(JSON.stringify(cart))}`);
  };

  // Muestra un loading mientras se carga el carrito
  if (isLoading) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Cargando carrito...</p>
      </div>
    );
  }

  // Si no hay carrito, muestra un mensaje
  if (!cart) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">No se encontró el carrito.</p>
      </div>
    );
  }

  // Calcula el total si no está presente en el carrito
  const totalAmount = cart.products.reduce((acc, item) => acc + parseInt(item.quantity * item.price), 0);

  return (
    <div className="bg-white h-screen flex flex-col items-center justify-start p-6 space-y-8 mb-16">
      <h2 className="text-3xl font-semibold text-gray-800">Resumen de Carrito</h2>
      
      {/* Carrito de Compras */}
      <div className="w-full max-w-xl bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Productos en tu carrito</h3>
        <ul className="space-y-4">
          {cart.products.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>{item.title} x {item.quantity}</span>
              <span>${parseInt(item.quantity * item.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-right">
          <span className="font-semibold text-lg">Total: ${totalAmount}</span>
        </div>
      </div>
      
      {/* Formulario de Datos de Envío */}
      <div className="w-full max-w-xl bg-gray-100 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Datos de Envío</h3>
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            name="address"
            placeholder="Dirección (Calle y Comuna)"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Resultado de la cotización */}
      {quoteResult && (
        <div className="w-full max-w-xl bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Resultado de la cotización</h3>
          {quoteResult.error ? (
            <p className="text-red-600">{quoteResult.error}</p>
          ) : (
            <p className="text-green-600">
              Envío Flapp con {quoteResult.courier} ⚡ - ${quoteResult.price}
            </p>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="w-full max-w-xl flex justify-between mt-6">
        <button 
          onClick={handleQuoteDelivery} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Cotizar despacho
        </button>
        <button 
          onClick={handleClearCart} 
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
        >
          Limpiar carrito
        </button>
        <button 
          onClick={handleBack} 
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
        >
          Volver
        </button>
      </div>
    </div>
  );
}