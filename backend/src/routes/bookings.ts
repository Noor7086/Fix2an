import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

// Create a new booking
router.post('/', async (req, res) => {
	try {
		const { requestId, offerId, customerId, scheduledAt, klarnaOrderId, totalAmount } = req.body

		if (!requestId || !offerId || !customerId || !scheduledAt) {
			return res.status(400).json({ message: 'Missing required fields' })
		}

		// Get the offer to calculate commission
		const offer = await prisma.offer.findUnique({
			where: { id: offerId },
		})

		if (!offer) {
			return res.status(404).json({ message: 'Offer not found' })
		}

		// Get commission rate from env (default 10%)
		const commissionRate = Number(process.env.COMMISSION_RATE || 0.1)
		const commission = totalAmount ? totalAmount * commissionRate : offer.price * commissionRate
		const workshopAmount = totalAmount ? totalAmount - commission : offer.price - commission

		// Create booking
		const booking = await prisma.booking.create({
			data: {
				requestId,
				offerId,
				customerId,
				workshopId: offer.workshopId,
				scheduledAt: new Date(scheduledAt),
				status: 'CONFIRMED',
				klarnaOrderId: klarnaOrderId || null,
				totalAmount: totalAmount || offer.price,
				commission,
				workshopAmount,
			},
			include: {
				request: {
					include: {
						vehicle: true,
					},
				},
				offer: {
					include: {
						workshop: {
							select: {
								id: true,
								companyName: true,
								phone: true,
								email: true,
								address: true,
								city: true,
							},
						},
					},
				},
				customer: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		})

		// Update request status
		await prisma.request.update({
			where: { id: requestId },
			data: { status: 'BOOKED' },
		})

		// Update offer status
		await prisma.offer.update({
			where: { id: offerId },
			data: { status: 'ACCEPTED' },
		})

		// TODO: Send email confirmations to both parties

		return res.status(201).json(booking)
	} catch (error) {
		console.error('Booking creation error:', error)
		return res.status(500).json({ message: 'Failed to create booking' })
	}
})

// Get bookings for a customer
router.get('/customer/:customerId', async (req, res) => {
	try {
		const { customerId } = req.params

		const bookings = await prisma.booking.findMany({
			where: { customerId },
			include: {
				request: {
					include: {
						vehicle: true,
					},
				},
				offer: {
					include: {
						workshop: {
							select: {
								id: true,
								companyName: true,
								rating: true,
								reviewCount: true,
							},
						},
					},
				},
			},
			orderBy: { scheduledAt: 'desc' },
		})

		return res.json(bookings)
	} catch (error) {
		console.error('Fetch bookings error:', error)
		return res.status(500).json({ message: 'Failed to fetch bookings' })
	}
})

// Update booking (for reschedule/cancel)
router.patch('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { status, scheduledAt, notes } = req.body

		const updateData: any = {}
		if (status) updateData.status = status
		if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)
		if (notes) updateData.notes = notes

		const booking = await prisma.booking.update({
			where: { id },
			data: updateData,
			include: {
				request: true,
				offer: {
					include: {
						workshop: true,
					},
				},
			},
		})

		return res.json(booking)
	} catch (error) {
		console.error('Update booking error:', error)
		return res.status(500).json({ message: 'Failed to update booking' })
	}
})

export default router


