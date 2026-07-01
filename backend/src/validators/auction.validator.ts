import { z } from 'zod';

export const createAuctionSchema = z.object({
  body: z
    .object({
      brand: z.string().min(1, 'Brand is required'),
      model: z.string().min(1, 'Model is required'),
      year: z.coerce.number().min(1900, 'Year must be after 1900'),
      fuel: z.enum(['Petrol', 'Electric', 'Diesel', 'CNG']),
      kmDriven: z.coerce.number().min(0, 'Kilometers driven must be positive'),
      ownership: z.enum(['First Owner', 'Second Owner', 'Third Owner or More']),
      images: z
        .array(
          z.string().refine(
            (v) => v.startsWith('/uploads/') || v.startsWith('http://') || v.startsWith('https://'),
            { message: 'Invalid image path' }
          )
        )
        .min(1, 'At least one image is required'),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      startingPrice: z.coerce.number().min(0, 'Starting price must be positive'),
      reservePrice: z.coerce.number().min(0, 'Reserve price must be positive'),
      minIncrement: z.coerce.number().min(1, 'Minimum increment must be at least 1'),
      startTime: z.string().datetime({ message: 'Invalid start time format' }),
      endTime: z.string().datetime({ message: 'Invalid end time format' })
    })
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
      message: 'End time must be after start time',
      path: ['endTime']
    })
});

export const updateAuctionSchema = z.object({
  body: z.object({
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.coerce.number().min(1900).optional(),
    fuel: z.enum(['Petrol', 'Electric', 'Diesel', 'CNG']).optional(),
    kmDriven: z.coerce.number().min(0).optional(),
    ownership: z.enum(['First Owner', 'Second Owner', 'Third Owner or More']).optional(),
    images: z
      .array(
        z.string().refine(
          (v) => v.startsWith('/uploads/') || v.startsWith('http://') || v.startsWith('https://'),
          { message: 'Invalid image path' }
        )
      )
      .optional(),
    description: z.string().min(10).optional(),
    startingPrice: z.coerce.number().min(0).optional(),
    reservePrice: z.coerce.number().min(0).optional(),
    minIncrement: z.coerce.number().min(1).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional()
  })
});
