import express from 'express';
import { postCart, getCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/api/cart', postCart);
router.get('/api/cart/random', getCart);

export default router;