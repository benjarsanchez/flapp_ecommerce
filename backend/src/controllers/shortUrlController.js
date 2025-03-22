import {
  createShortUrl,
  getShortUrlByCode,
} from '../services/shortUrlService.js';
import ShortUrl from '../models/shortUrl.js';

export const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const newUrl = await createShortUrl(originalUrl);
    
    res.json({
      shortUrl: newUrl.shortCode,
      expiresAt: newUrl.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating short URL' });
  }
};

export const getOriginalUrl = async (req, res) => {
  try {
    const url = await getShortUrlByCode(req.params.code);
    
    if (!url) {
      return res.status(404).json({ error: 'URL no encontrada' });
    }
    
    if (new Date() > url.expiresAt) {
      return res.status(410).json({ 
        error: 'URL expirada',
        expiredAt: url.expiresAt
      });
    }

    res.json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      clicks: url.clicks
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const updateClicks = async (req, res) => {
  try {
    const { shortCode, totalClicks } = req.body;
    
    // Validación mejorada
    if (!shortCode || typeof totalClicks === 'undefined') {
      return res.status(400).json({ 
        message: 'Faltan parámetros requeridos: shortCode y totalClicks' 
      });
    }

    if (typeof totalClicks !== 'number' || totalClicks < 0) {
      return res.status(400).json({ 
        message: 'totalClicks debe ser un número positivo' 
      });
    }

    const url = await ShortUrl.findOne({ where: { shortCode } });
    
    if (!url) {
      return res.status(404).json({ 
        message: `No se encontró URL con código: ${shortCode}` 
      });
    }

    // Actualización segura con validación
    const [updatedCount] = await ShortUrl.update(
      { clicks: totalClicks },
      { 
        where: { shortCode },
        fields: ['clicks'] // Solo actualizar este campo
      }
    );

    if (updatedCount === 0) {
      return res.status(500).json({ 
        message: 'No se pudo actualizar el contador' 
      });
    }

    res.json({
      success: true,
      newClickCount: totalClicks
    });
    
  } catch (error) {
    console.error('Error en updateClicks:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' 
        ? `Error interno: ${error.message}`
        : 'Error interno del servidor'
    });
  }
};