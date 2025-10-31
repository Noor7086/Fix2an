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
			availableDates = JSON.parse(offer.availableDates)
		} catch {
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


