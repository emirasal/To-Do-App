import { Router } from 'express';
import { getAll, add, deleteById, editById, downloadFile, search, getTagsByUser, getByTag, uploads } from '../controllers/todo.js';
import { verifyToken } from '../middleware/jwt.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/getAll', verifyToken, getAll);
router.post('/add', verifyToken, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]), add);
router.delete('/deleteById/:id', verifyToken, deleteById);
router.put('/editById/:id', verifyToken, editById);
router.get('/downloadFile/:fileName', downloadFile);
router.get('/search/:key', verifyToken, search);
router.get('/getTags', verifyToken, getTagsByUser);
router.get('/getByTag/:tag', verifyToken, getByTag);
router.get('/uploads/:img', uploads);


export default router;
