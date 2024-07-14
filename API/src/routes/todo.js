import { Router } from 'express';
import { getAllByUser, add, deleteById, editById, downloadFile, search, getAllTags, getByTag, uploads } from '../controllers/todo.js';
import { verifyToken } from '../middleware/jwt.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/getAllByUser/:userId/:accessToken', verifyToken, getAllByUser);
router.post('/add', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]), add);
router.delete('/deleteById/:accessToken', verifyToken, deleteById);
router.put('/editById', editById);
router.get('/downloadFile/:fileName', downloadFile);
router.get('/search/:key/:userId', search);
router.get('/getAllTags', getAllTags);
router.get('/getByTag/:tag/:userId', getByTag);
router.get('/uploads/:img', uploads);

export default router;
