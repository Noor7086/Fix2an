import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

// Middleware to check admin role (you'll need to implement auth middleware)
// For now, we'll rely on frontend auth checks

// ========== USERS (CUSTOMERS) ==========
router.get('/users', async (req, res) => {
	try {
		const { role, search, page = '1', limit = '50' } = req.query
		const skip = (Number(page) - 1) * Number(limit)

		const where: any = {}
		if (role) where.role = role
		if (search) {
			where.OR = [
				{ name: { contains: search as string, mode: 'insensitive' } },
				{ email: { contains: search as string, mode: 'insensitive' } },
			]
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				skip,
				take: Number(limit),
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					phone: true,
					city: true,
					isActive: true,
					createdAt: true,
					_count: {
						select: {
							requests: true,
							bookings: true,
						},
					},
				},
			}),
			prisma.user.count({ where }),
		])

		return res.json({ users, total, page: Number(page), limit: Number(limit) })
	} catch (error) {
		console.error('Admin users error:', error)
		return res.status(500).json({ message: 'Failed to fetch users' })
	}
})

router.patch('/users/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { isActive, role } = req.body

		const updateData: any = {}
		if (isActive !== undefined) updateData.isActive = isActive
		if (role) updateData.role = role

		const user = await prisma.user.update({
			where: { id },
			data: updateData,
		})

		return res.json(user)
	} catch (error) {
		console.error('Admin update user error:', error)
		return res.status(500).json({ message: 'Failed to update user' })
	}
})

// ========== WORKSHOPS ==========
router.get('/workshops', async (req, res) => {
	try {
		const { verified, active, search, page = '1', limit = '50' } = req.query
		const skip = (Number(page) - 1) * Number(limit)

		const where: any = {}
		if (verified !== undefined) where.isVerified = verified === 'true'
		if (active !== undefined) where.isActive = active === 'true'
		if (search) {
			where.OR = [
				{ companyName: { contains: search as string, mode: 'insensitive' } },
				{ email: { contains: search as string, mode: 'insensitive' } },
				{ organizationNumber: { contains: search as string, mode: 'insensitive' } },
			]
		}

		const [workshops, total] = await Promise.all([
			prisma.workshop.findMany({
				where,
				skip,
				take: Number(limit),
				orderBy: { createdAt: 'desc' },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							phone: true,
						},
					},
					_count: {
						select: {
							offers: true,
							bookings: true,
							reviews: true,
						},
					},
				},
			}),
			prisma.workshop.count({ where }),
		])

		return res.json({ workshops, total, page: Number(page), limit: Number(limit) })
	} catch (error) {
		console.error('Admin workshops error:', error)
		return res.status(500).json({ message: 'Failed to fetch workshops' })
	}
})

router.get('/workshops/:id', async (req, res) => {
	try {
		const { id } = req.params

		const workshop = await prisma.workshop.findUnique({
			where: { id },
			include: {
				user: true,
				documents: true,
				_count: {
					select: {
						offers: true,
						bookings: true,
						reviews: true,
					},
				},
			},
		})

		if (!workshop) {
			return res.status(404).json({ message: 'Workshop not found' })
		}

		return res.json(workshop)
	} catch (error) {
		console.error('Admin workshop detail error:', error)
		return res.status(500).json({ message: 'Failed to fetch workshop' })
	}
})

router.patch('/workshops/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { isVerified, isActive } = req.body

		const updateData: any = {}
		if (isVerified !== undefined) updateData.isVerified = isVerified
		if (isActive !== undefined) updateData.isActive = isActive

		const workshop = await prisma.workshop.update({
			where: { id },
			data: updateData,
		})

		return res.json(workshop)
	} catch (error) {
		console.error('Admin update workshop error:', error)
		return res.status(500).json({ message: 'Failed to update workshop' })
	}
})

// ========== REQUESTS ==========
router.get('/requests', async (req, res) => {
	try {
		const { status, search, page = '1', limit = '50' } = req.query
		const skip = (Number(page) - 1) * Number(limit)

		const where: any = {}
		if (status) where.status = status
		if (search) {
			where.OR = [
				{ description: { contains: search as string, mode: 'insensitive' } },
				{ address: { contains: search as string, mode: 'insensitive' } },
				{ city: { contains: search as string, mode: 'insensitive' } },
			]
		}

		const [requests, total] = await Promise.all([
			prisma.request.findMany({
				where,
				skip,
				take: Number(limit),
				orderBy: { createdAt: 'desc' },
				include: {
					customer: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					vehicle: true,
					_count: {
						select: {
							offers: true,
							bookings: true,
						},
					},
				},
			}),
			prisma.request.count({ where }),
		])

		return res.json({ requests, total, page: Number(page), limit: Number(limit) })
	} catch (error) {
		console.error('Admin requests error:', error)
		return res.status(500).json({ message: 'Failed to fetch requests' })
	}
})

router.patch('/requests/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { status } = req.body

		if (!status) {
			return res.status(400).json({ message: 'Status is required' })
		}

		const request = await prisma.request.update({
			where: { id },
			data: { status },
		})

		return res.json(request)
	} catch (error) {
		console.error('Admin update request error:', error)
		return res.status(500).json({ message: 'Failed to update request' })
	}
})

// ========== OFFERS ==========
router.get('/offers', async (req, res) => {
	try {
		const { status, requestId, workshopId, page = '1', limit = '50' } = req.query
		const skip = (Number(page) - 1) * Number(limit)

		const where: any = {}
		if (status) where.status = status
		if (requestId) where.requestId = requestId
		if (workshopId) where.workshopId = workshopId

		const [offers, total] = await Promise.all([
			prisma.offer.findMany({
				where,
				skip,
				take: Number(limit),
				orderBy: { createdAt: 'desc' },
				include: {
					request: {
						include: {
							customer: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
							vehicle: true,
						},
					},
					workshop: {
						select: {
							id: true,
							companyName: true,
							email: true,
						},
					},
				},
			}),
			prisma.offer.count({ where }),
		])

		return res.json({ offers, total, page: Number(page), limit: Number(limit) })
	} catch (error) {
		console.error('Admin offers error:', error)
		return res.status(500).json({ message: 'Failed to fetch offers' })
	}
})

// ========== BOOKINGS ==========
router.get('/bookings', async (req, res) => {
	try {
		const { status, customerId, workshopId, page = '1', limit = '50' } = req.query
		const skip = (Number(page) - 1) * Number(limit)

		const where: any = {}
		if (status) where.status = status
		if (customerId) where.customerId = customerId
		if (workshopId) where.workshopId = workshopId

		const [bookings, total] = await Promise.all([
			prisma.booking.findMany({
				where,
				skip,
				take: Number(limit),
				orderBy: { createdAt: 'desc' },
				include: {
					customer: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					workshop: {
						select: {
							id: true,
							companyName: true,
							email: true,
						},
					},
					request: {
						include: {
							vehicle: true,
						},
					},
					offer: true,
				},
			}),
			prisma.booking.count({ where }),
		])

		return res.json({ bookings, total, page: Number(page), limit: Number(limit) })
	} catch (error) {
		console.error('Admin bookings error:', error)
		return res.status(500).json({ message: 'Failed to fetch bookings' })
	}
})

router.patch('/bookings/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { status, scheduledAt, notes } = req.body

		const updateData: any = {}
		if (status) updateData.status = status
		if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)
		if (notes !== undefined) updateData.notes = notes

		const booking = await prisma.booking.update({
			where: { id },
			data: updateData,
		})

		return res.json(booking)
	} catch (error) {
		console.error('Admin update booking error:', error)
		return res.status(500).json({ message: 'Failed to update booking' })
	}
})

// ========== PAYOUT REPORTS ==========
router.get('/payouts', async (req, res) => {
	try {
		const { workshopId, month, year, isPaid, page = '1', limit = '50' } = req.query
		const skip = (Number(page) - 1) * Number(limit)

		const where: any = {}
		if (workshopId) where.workshopId = workshopId
		if (month) where.month = Number(month)
		if (year) where.year = Number(year)
		if (isPaid !== undefined) where.isPaid = isPaid === 'true'

		const [reports, total] = await Promise.all([
			prisma.payoutReport.findMany({
				where,
				skip,
				take: Number(limit),
				orderBy: [{ year: 'desc' }, { month: 'desc' }],
				include: {
					workshop: {
						select: {
							id: true,
							companyName: true,
							email: true,
							organizationNumber: true,
						},
					},
				},
			}),
			prisma.payoutReport.count({ where }),
		])

		return res.json({ reports, total, page: Number(page), limit: Number(limit) })
	} catch (error) {
		console.error('Admin payouts error:', error)
		return res.status(500).json({ message: 'Failed to fetch payout reports' })
	}
})

router.post('/payouts/generate', async (req, res) => {
	try {
		const { month, year } = req.body

		if (!month || !year) {
			return res.status(400).json({ message: 'Month and year are required' })
		}

		const commissionRate = Number(process.env.COMMISSION_RATE || 0.1)

		// Get all workshops
		const workshops = await prisma.workshop.findMany({
			where: { isVerified: true, isActive: true },
		})

		const startDate = new Date(year, month - 1, 1)
		const endDate = new Date(year, month, 0, 23, 59, 59)

		const reports = []

		for (const workshop of workshops) {
			// Get bookings for this workshop in the specified month
			const bookings = await prisma.booking.findMany({
				where: {
					workshopId: workshop.id,
					status: 'DONE',
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				},
			})

			if (bookings.length === 0) {
				continue // Skip workshops with no bookings
			}

			const totalAmount = bookings.reduce((sum, b) => sum + b.totalAmount, 0)
			const commission = totalAmount * commissionRate
			const workshopAmount = totalAmount - commission

			// Check if report already exists
			const existing = await prisma.payoutReport.findUnique({
				where: {
					workshopId_month_year: {
						workshopId: workshop.id,
						month: Number(month),
						year: Number(year),
					},
				},
			})

			if (existing) {
				// Update existing report
				const updated = await prisma.payoutReport.update({
					where: { id: existing.id },
					data: {
						totalJobs: bookings.length,
						totalAmount,
						commission,
						workshopAmount,
					},
				})
				reports.push(updated)
			} else {
				// Create new report
				const created = await prisma.payoutReport.create({
					data: {
						workshopId: workshop.id,
						month: Number(month),
						year: Number(year),
						totalJobs: bookings.length,
						totalAmount,
						commission,
						workshopAmount,
					},
				})
				reports.push(created)
			}
		}

		return res.json({ message: 'Payout reports generated', reports, count: reports.length })
	} catch (error) {
		console.error('Admin generate payouts error:', error)
		return res.status(500).json({ message: 'Failed to generate payout reports' })
	}
})

router.patch('/payouts/:id/mark-paid', async (req, res) => {
	try {
		const { id } = req.params

		const report = await prisma.payoutReport.update({
			where: { id },
			data: {
				isPaid: true,
				paidAt: new Date(),
			},
		})

		return res.json(report)
	} catch (error) {
		console.error('Admin mark payout paid error:', error)
		return res.status(500).json({ message: 'Failed to mark payout as paid' })
	}
})

export default router

