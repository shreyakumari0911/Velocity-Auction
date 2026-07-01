import { Router } from 'express';
import { auctionController } from '../controllers/AuctionController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { placeBidSchema } from '../validators/bid.validator';

const router = Router();

// Watchlist endpoints (must reside before dynamic /:id to prevent route shadowing)
router.get('/watchlist', authenticate as any, auctionController.getWatchlist);
router.post('/watchlist/:auctionId', authenticate as any, auctionController.addToWatchlist);
router.delete('/watchlist/:auctionId', authenticate as any, auctionController.removeFromWatchlist);

// General auction endpoints
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);
router.get('/:id/bids', auctionController.getBidHistory);
router.post('/:id/bid', authenticate as any, validateRequest(placeBidSchema), auctionController.placeBid);

export default router;
