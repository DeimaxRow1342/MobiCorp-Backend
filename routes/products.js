import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upsertProduct, listProducts, getProductDetail, setFinalPrice } from '../controllers/productController.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/', upsertProduct);
router.get('/', listProducts);
router.get('/:id', getProductDetail);
router.put('/:id/final-price', setFinalPrice);

export default router;
