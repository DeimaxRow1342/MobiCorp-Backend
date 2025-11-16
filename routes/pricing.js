import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { previewPricing, confirmFinalPrice } from '../controllers/pricingController.js'

const router = express.Router()
router.use(authMiddleware)

router.post('/preview', previewPricing)
router.post('/confirm', confirmFinalPrice)

export default router
