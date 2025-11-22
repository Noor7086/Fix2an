import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

// Get offers for a specific request
router.get('/request/:requestId', async (req, res) => {
	try {
		const { requestId } = req.params
		const { sortBy = 'price', filterPrice, filterDistance, filterRating } = req.query

		const request = await prisma.request.findUnique({
			where: { id: requestId },
		})

		if (!request) {
			return res.status(404).json({ message: 'Request not found' })
		}

		let offers = await prisma.offer.findMany({
			where: {
				requestId,
				status: {
					in: ['SENT', 'ACCEPTED'],
				},
			},
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
		})

		// Calculate distance for each offer
		const offersWithDistance = offers.map((offer) => {
			const distance = calculateDistance(request.latitude, request.longitude, offer.workshop.latitude, offer.workshop.longitude)
			return {
				...offer,
				distance,
			}
		})

		// Apply filters
		let filteredOffers = offersWithDistance
		if (filterPrice) {
			const [min, max] = (filterPrice as string).split('-').map(Number)
			filteredOffers = filteredOffers.filter((o) => o.price >= min && (!max || o.price <= max))
		}
		if (filterDistance) {
			const maxDistance = Number(filterDistance)
			filteredOffers = filteredOffers.filter((o) => o.distance <= maxDistance)
		}
		if (filterRating) {
			const minRating = Number(filterRating)
			filteredOffers = filteredOffers.filter((o) => o.workshop.rating >= minRating)
		}

		// Sort offers
		filteredOffers.sort((a, b) => {
			switch (sortBy) {
				case 'price':
					if (a.price !== b.price) return a.price - b.price
					if (a.distance !== b.distance) return a.distance - b.distance
					return b.workshop.rating - a.workshop.rating
				case 'distance':
					if (a.distance !== b.distance) return a.distance - b.distance
					if (a.price !== b.price) return a.price - b.price
					return b.workshop.rating - a.workshop.rating
				case 'rating':
					if (b.workshop.rating !== a.workshop.rating) return b.workshop.rating - a.workshop.rating
					if (a.price !== b.price) return a.price - b.price
					return a.distance - b.distance
				default:
					return 0
			}
		})

		// Limit to top 12 offers
		filteredOffers = filteredOffers.slice(0, 12)

		return res.json(filteredOffers)
	} catch (error) {
		console.error('Fetch offers error:', error)
		return res.status(500).json({ message: 'Failed to fetch offers' })
	}
})

// Get a single offer by ID
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params

		const offer = await prisma.offer.findUnique({
			where: { id },
			include: {
				request: {
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
				},
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
						phone: true,
						email: true,
						description: true,
					},
				},
			},
		})

		if (!offer) {
			return res.status(404).json({ message: 'Offer not found' })
		}

		// Calculate distance
		const distance = calculateDistance(offer.request.latitude, offer.request.longitude, offer.workshop.latitude, offer.workshop.longitude)

		// Parse available dates
		let availableDates = []
		try {
			if (offer.availableDates && offer.availableDates.trim() !== '') {
				const parsed = JSON.parse(offer.availableDates)
				availableDates = Array.isArray(parsed) ? parsed : []
			}
		} catch (error) {
			console.error('Failed to parse availableDates:', error)
			availableDates = []
		}

		return res.json({
			...offer,
			distance,
			availableDates,
		})
	} catch (error) {
		console.error('Fetch offer error:', error)
		return res.status(500).json({ message: 'Failed to fetch offer' })
	}
})

// Create a new offer
router.post('/', async (req, res) => {
	try {
		const { requestId, workshopId, userId, price, note, estimatedDuration, warranty, availableDates } = req.body

		// Resolve workshopId - if userId is provided, find the workshop by userId
		let actualWorkshopId = workshopId

		// If userId is provided (either as separate field or workshopId might be userId), find the workshop
		const userIdentifier = userId || workshopId
		
		if (userIdentifier) {
			// First check if it's already a workshop ID by trying to find the workshop directly
			const workshopById = await prisma.workshop.findUnique({
				where: { id: userIdentifier },
			})

			if (workshopById) {
				actualWorkshopId = workshopById.id
			} else {
				// If not found as workshop ID, try to find by userId
				const workshopByUserId = await prisma.workshop.findFirst({
					where: { userId: userIdentifier },
				})

				if (workshopByUserId) {
					actualWorkshopId = workshopByUserId.id
				} else {
					return res.status(404).json({ message: 'Workshop not found for this user' })
				}
			}
		}

		if (!requestId || !actualWorkshopId || !price || !estimatedDuration) {
			return res.status(400).json({ message: 'Missing required fields: requestId, workshopId (or userId), price, estimatedDuration' })
		}

		// Verify workshop exists
		const workshop = await prisma.workshop.findUnique({
			where: { id: actualWorkshopId },
		})

		if (!workshop) {
			return res.status(404).json({ message: 'Workshop not found' })
		}

		// Check if request exists and is in bidding
		const request = await prisma.request.findUnique({
			where: { id: requestId },
		})

		if (!request) {
			return res.status(404).json({ message: 'Request not found' })
		}

		if (request.status !== 'IN_BIDDING') {
			return res.status(400).json({ message: 'Request is not accepting offers' })
		}

		// Check if workshop already has an offer for this request
		const existingOffer = await prisma.offer.findFirst({
			where: {
				requestId,
				workshopId: actualWorkshopId,
			},
		})

		if (existingOffer) {
			return res.status(400).json({ message: 'You have already submitted an offer for this request' })
		}

		// Create offer
		const offer = await prisma.offer.create({
			data: {
				requestId,
				workshopId: actualWorkshopId,
				price: parseFloat(String(price)),
				note: note || '',
				estimatedDuration: parseInt(String(estimatedDuration)),
				warranty: warranty || '',
				availableDates: availableDates ? JSON.stringify(availableDates) : '[]',
				status: 'SENT',
			},
			include: {
				request: {
					include: {
						vehicle: true,
					},
				},
				workshop: {
					select: {
						id: true,
						companyName: true,
						rating: true,
						reviewCount: true,
					},
				},
			},
		})

		return res.status(201).json(offer)
	} catch (error) {
		console.error('Offer creation error:', error)
		return res.status(500).json({ message: 'Failed to create offer' })
	}
})

// Get all available requests for workshops (requests in IN_BIDDING status)
router.get('/requests/available', async (req, res) => {
	try {
		const { workshopId, latitude, longitude, radius = 30 } = req.query

		// Get all requests in bidding
		let requests = await prisma.request.findMany({
			where: {
				status: 'IN_BIDDING',
				expiresAt: {
					gt: new Date(), // Not expired
				},
			},
			include: {
				vehicle: true,
				customer: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				offers: {
					where: workshopId ? { workshopId: workshopId as string } : undefined,
					select: {
						id: true,
						price: true,
						status: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		// Filter by distance if coordinates provided
		if (latitude && longitude && requests.length > 0) {
			const lat = parseFloat(String(latitude))
			const lon = parseFloat(String(longitude))
			const maxRadius = parseFloat(String(radius))

			requests = requests.filter((request) => {
				const distance = calculateDistance(lat, lon, request.latitude, request.longitude)
				return distance <= maxRadius
			})
		}

		return res.json(requests)
	} catch (error) {
		console.error('Fetch available requests error:', error)
		return res.status(500).json({ message: 'Failed to fetch available requests' })
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


