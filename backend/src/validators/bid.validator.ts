import { z } from 'zod';

export const placeBidSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(1, 'Bid amount must be at least 1')
  })
});
