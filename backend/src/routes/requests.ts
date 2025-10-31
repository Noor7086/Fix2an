import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

// Create a new request
router.post('/', async (req, res) => {
	try {
		const { vehicleId, reportId, description, latitude, longitude, address, city, postalCode, customerId } = req.body

		if (!vehicleId || !reportId || !latitude || !longitude || !address || !city || !customerId) {
			return res.status(400).json({ message: 'Missing required fields' })
		}

		// Set expiry to 48 hours from now (offers expire after 48h)
		const expiresAt = new Date()
		expiresAt.setHours(expiresAt.getHours() + 48)

		const request = await prisma.request.create({
			data: {
				customerId,
				vehicleId,
				reportId,
				description,
				latitude,
				longitude,
				address,
				city,
				postalCode: postalCode || '',
				status: 'IN_BIDDING', // Start in bidding state
				expiresAt,
			},
			include: {
				vehicle: true,
				report: true,
				customer: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		})

		// Trigger matching logic (notify workshops within radius)
		// TODO: Implement workshop matching and notification

		return res.status(201).json(request)
	} catch (error) {
		console.error('Request creation error:', error)
		return res.status(500).json({ message: 'Failed to create request' })
	}
})

// Get all requests for a customer
router.get('/customer/:customerId', async (req, res) => {
	try {
		const { customerId } = req.params

		const requests = await prisma.request.findMany({
			where: { customerId },
			include: {
				vehicle: true,
				report: true,
				offers: {
					include: {
						workshop: {
							select: {
								id: true,
								companyName: true,
								rating: true,
								reviewCount: true,
								isVerified: true,
							},
						},
					},
				},
				bookings: {
					include: {
						offer: true,
						workshop: {
							select: {
								id: true,
								companyName: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return res.json(requests)
	} catch (error) {
		console.error('Fetch requests error:', error)
		return res.status(500).json({ message: 'Failed to fetch requests' })
	}
})

// Get a single request by ID
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params

		const request = await prisma.request.findUnique({
			where: { id },
			include: {
				vehicle: true,
				report: true,
				offers: {
					include: {
						workshop: {
							select: {
								id: true,
								companyName: true,
								rating: true,
								reviewCount: true,
								isVerified: true,
								address: true,
								city: true,
								latitude: true,
								longitude: true,
							},
						},
					},
					orderBy: [
						{ price: 'asc' }, // Sort by price first
						{ createdAt: 'asc' },
					],
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

		if (!request) {
			return res.status(404).json({ message: 'Request not found' })
		}

		// Calculate distance for each offer (mock for now - needs geolocation service)
		const offersWithDistance = request.offers.map((offer: any) => ({
			...offer,
			distance: calculateDistance(request.latitude, request.longitude, offer.workshop.latitude, offer.workshop.longitude),
		}))

		return res.json({
			...request,
			offers: offersWithDistance.sort((a: any, b: any) => {
				// Sort by price, then distance, then rating
				if (a.price !== b.price) return a.price - b.price
				if (a.distance !== b.distance) return a.distance - b.distance
				return b.workshop.rating - a.workshop.rating
			}),
		})
	} catch (error) {
		console.error('Fetch request error:', error)
		return res.status(500).json({ message: 'Failed to fetch request' })
	}
})

// Helper function to calculate distance (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371 // Radius of the Earth in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180
	const dLon = ((lon2 - lon1) * Math.PI) / 180
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c // Distance in km
}

export default router

