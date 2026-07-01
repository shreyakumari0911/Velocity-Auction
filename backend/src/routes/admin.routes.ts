import { Router, Request, Response, NextFunction } from 'express';
import { adminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createAuctionSchema, updateAuctionSchema } from '../validators/auction.validator';
import { upload } from '../middleware/upload';
import multer from 'multer';

const router = Router();

// Apply auth and admin role requirements to all routes in this file
router.use(authenticate as any);
router.use(authorize(['admin']) as any);

router.get('/dashboard', adminController.getDashboard);
router.post('/auctions', validateRequest(createAuctionSchema), adminController.createAuction);
router.put('/auctions/:id', validateRequest(updateAuctionSchema), adminController.updateAuction);
router.delete('/auctions/:id', adminController.deleteAuction);

// File uploads (limit of 5 images) — with Multer-specific error handler to suppress stack traces
router.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('images', 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  adminController.uploadImages
);

export default router;

