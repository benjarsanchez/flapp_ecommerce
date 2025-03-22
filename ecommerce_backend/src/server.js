import express from 'express';
import db from './config/db.js';
import router from './routes/shortUrlRoutes.js';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

// Configuración para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: process.env.LOCAL_FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Conexión a la base de datos
try {
  await db.authenticate();
  await db.sync();
  console.log('Conexión a PostgreSQL establecida');
} catch (error) {
  console.error('Error de conexión:', error);
}

// Rutas
app.use('/api', router);

// Frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});