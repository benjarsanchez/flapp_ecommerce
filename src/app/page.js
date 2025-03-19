'use client';
import Button from './../components/button.js';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}

export function Home() {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cartParam = searchParams.get('cart');
    if (cartParam) {
      const parsedCart = JSON.parse(decodeURIComponent(cartParam));
      setCart(parsedCart);
      console.log('Carrito obtenido desde la URL:', parsedCart);
    }
  }, [searchParams]);

  const fetchRandomCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/cart/random');
      if (!response.ok) throw new Error('Error al obtener el carrito');
      
      const data = await response.json();
      setCart(data);
      console.log('Carrito obtenido:', data);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCheckout = () => {
    router.push(`/checkout?cart=${encodeURIComponent(JSON.stringify(cart))}`);
  }

  const handleLoadCartClick = (e) => {
    e.preventDefault();
    fetchRandomCart();
  };

  const handleEndPurchase = (e) => {
    e.preventDefault(); 
    redirectToCheckout();
  };

  return (
    <div className="bg-white h-screen flex items-center justify-center">
      <div className="text-center">
        {isLoading ? (
          <p className="text-xl font-semibold mb-4">Cargando carrito...</p>
        ) : (
          <>
            <Button 
              label={cart ? 'Cargar nuevo carrito' : 'Generar carrito'}
              onClick={handleLoadCartClick}
              disabled={isLoading}
            />
            <Button 
              label="Finalizar compra" 
              onClick={handleEndPurchase}
              disabled={!cart} // Deshabilita el botón si no hay carrito
              className={!cart ? 'opacity-50 cursor-not-allowed' : ''} // Cambia el estilo si está deshabilitado
            />
          </>
        )}
      </div>
    </div>
  );
}