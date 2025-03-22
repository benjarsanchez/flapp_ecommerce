'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  // Estados para el formulario de acortamiento
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [clicks, setClicks] = useState(0);
  const [lastSentClicks, setLastSentClicks] = useState(0);
  const [code, setCode] = useState(null);

  // Estados para el formulario de obtención de URL original
  const [shortCodeInput, setShortCodeInput] = useState('');
  const [originalUrlResult, setOriginalUrlResult] = useState(null);
  const [expirationResult, setExpirationResult] = useState(null);
  const [createdAtResult, setCreatedAtResult] = useState(null);
  const [fetechedClicks, setFetechedClicks] = useState(0);
  const [error, setError] = useState('');

  // Extraer código de la URL corta
  useEffect(() => {
    if (shortUrl) {
      const parts = shortUrl.split('/');
      const extractedCode = parts[parts.length - 1];
      setCode(extractedCode);
    } else {
      setCode(null);
    }
  }, [shortUrl]);

  // Enviar clics cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (code && clicks > lastSentClicks) {
        actualizarClicsBackend();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [code, clicks, lastSentClicks]);

  // Enviar clics cada 5 clics
  useEffect(() => {
    if (code && clicks > 0 && clicks % 5 === 0 && clicks !== lastSentClicks) {
      actualizarClicsBackend();
    }
  }, [clicks, code, lastSentClicks]);

  const actualizarClicsBackend = async () => {
    try {
      setError(''); // Limpiar errores al iniciar la solicitud
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shortCode: code, 
          totalClicks: clicks 
        }),
      });

      console.log("code", code);
      console.log("clicks", clicks);
  
      // Manejar respuestas no JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          const textResponse = await response.text();
          errorMessage = textResponse || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
  
      // Procesar respuesta exitosa
      const data = await response.json();
      
      if (data.success) {
        setLastSentClicks(clicks);
      } else {
        throw new Error('La actualización no fue exitosa según el servidor');
      }
  
    } catch (err) {
      console.error('Error en actualizarClicsBackend:', err);
      
      // Manejar errores de conexión
      const errorMessage = err.message.includes('Failed to fetch')
        ? 'Error de conexión con el servidor'
        : err.message;
  
      setError(errorMessage);
      
      // Revertir el contador si hay error persistente
      if (code && clicks !== lastSentClicks) {
        setClicks(lastSentClicks);
      }
    }
  };

  // Manejar acortamiento de URL
  const handleShorten = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      setError('Por favor ingresa una URL');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setExpiresAt(data.expiresAt);
      setClicks(0);
      setLastSentClicks(0);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar clic en URL corta
  const handleShortUrlClick = (e) => {
    e.preventDefault();
    setClicks(prev => prev + 1);
  };

  // Manejar obtención de URL original
  const handleRetrieve = async (e) => {
    e.preventDefault();
    if (!shortCodeInput) {
      setError('Por favor ingresa una URL acortada');
      return;
    }

    let extractedCode = shortCodeInput;
    try {
      const url = new URL(shortCodeInput);
      const pathParts = url.pathname.split('/');
      extractedCode = pathParts[pathParts.length - 1];
    } catch (err) {
      // No es una URL válida, usar el valor directamente
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${extractedCode}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      console.log(data);
      setOriginalUrlResult(data.originalUrl);
      setExpirationResult(data.expiresAt);
      setFetechedClicks(data.clicks);
      setCreatedAtResult(data.createdAt);
      setError('');
    } catch (err) {
      setError(err.message);
      setOriginalUrlResult(null);
      setExpirationResult(null);
      setFetechedClicks(null);
      setCreatedAtResult(null);
    }
  };

  const getLatestClickNumber = (fetchedNumber) => {
    // Si fetchedNumber es mayor a clicks, actualizar el contador y retornar fetchedNumber .caso contrario, retornar clicks
    return fetchedNumber > clicks ? fetchedNumber : clicks;
  }

  return (
    <div className="min-h-screen bg-background text-foreground max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Acortador de URL
        </h1>
        <p className="text-gray-500">Simplifica tus enlaces al instante</p>
      </div>

      {/* Formulario de acortamiento */}
      <form onSubmit={handleShorten} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Ingresar URL completa"
            className="flex-1 px-6 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Acortar URL
          </button>
        </div>
      </form>

      {shortUrl && (
        <div className="bg-gray-100 p-6 rounded-xl space-y-4">
          <div className="space-y-2">
            <p className="text-gray-600">URL Acortada:</p>
            <a
              href={shortUrl}
              onClick={handleShortUrlClick}
              className="text-blue-600 hover:text-blue-800 break-all font-mono hover:underline"
            >
              {shortUrl}
            </a>
          </div>
          <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600">
            <p>Clics registrados: <span className="font-medium">{clicks}</span></p>
            <p>Expira: <span className="font-medium">{new Date(expiresAt).toLocaleDateString()}</span></p>
          </div>
        </div>
      )}

      {/* Formulario de obtención de URL original */}
      <form onSubmit={handleRetrieve} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={shortCodeInput}
            onChange={(e) => setShortCodeInput(e.target.value)}
            placeholder="Pega tu URL acortada aquí"
            className="flex-1 px-6 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Mostrar Original
          </button>
        </div>
      </form>

      {originalUrlResult && (
        <div className="bg-gray-100 p-6 rounded-xl space-y-2">
          <p className="text-gray-600">URL Original:</p>
          <p className="text-blue-600 break-all">{originalUrlResult}</p>
          <p className="text-sm text-gray-600">Clics registrados: {getLatestClickNumber(fetechedClicks)}</p>
          <p className="text-sm text-gray-600">
            Expira: {new Date(expirationResult).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Creado: {new Date(createdAtResult).toLocaleDateString()}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}