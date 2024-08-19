import { Router } from 'express';
import { getAllAttractions, saveAttraction, getAttractionById } from '../controllers/attractionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getAllAttractions);
router.get('/:id', getAttractionById);
router.post('/', authenticateToken, saveAttraction);
// Ajoutez d'autres routes pour getAttractionById, createAttraction, etc.

export default router;
