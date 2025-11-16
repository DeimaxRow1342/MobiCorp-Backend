import express from 'express';
import { 
  saveExtractedData, 
  getAllExtractedData, 
  getExtractedDataById,
  deleteExtractedData 
} from '../controllers/dataController.js';
import { extractAndSave } from '../controllers/extractController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', saveExtractedData);
router.post('/extract', extractAndSave);
router.get('/', getAllExtractedData);
router.get('/:id', getExtractedDataById);
router.delete('/:id', deleteExtractedData);

export default router;
