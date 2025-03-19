import express from 'express';
import 'dotenv/config';
import cartRoutes from './routes/cartRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: process.env.LOCAL_FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cartRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});