import { Router } from 'express';
import { shortenUrl, getOriginalUrl, updateClicks } from '../controllers/shortUrlController.js';


const router = Router();

router.post('/shorten', shortenUrl);
router.get('/:code', getOriginalUrl);
router.post('/click', updateClicks);

export default router;