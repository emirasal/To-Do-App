import { Router } from 'express';
import { getAllByEmail, add, deleteById, editById, downloadFile } from '../controllers/todo.js';
import { verifyToken } from '../middleware/jwt.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/getAllByEmail/:email', getAllByEmail);
router.post('/add', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]), add);
router.delete('/deleteById', deleteById);
router.put('/editById', editById);
router.get('/downloadFile/:fileName', downloadFile);

export default router;
