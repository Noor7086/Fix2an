import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'WORKSHOP') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		// Get workshop
		const workshop = await prisma.workshop.findUnique({
			where: { userId: session.user.id },
		})

		if (!workshop) {
			return NextResponse.json({ message: 'Workshop not found' }, { status: 404 })
		}

		// Get current month start and end
		const now = new Date()
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

		// Get stats
		const [totalRequests, activeOffers, completedJobs, totalRevenue] = await Promise.all([
			// Total requests this month
			prisma.request.count({
				where: {
					createdAt: {
						gte: startOfMonth,
						lte: endOfMonth,
					},
				},
			}),

			// Active offers (sent but not accepted/declined)
			prisma.offer.count({
				where: {
					workshopId: workshop.id,
					status: 'SENT',
				},
			}),

			// Completed jobs this month
			prisma.booking.count({
				where: {
					workshopId: workshop.id,
					status: 'DONE',
					createdAt: {
						gte: startOfMonth,
						lte: endOfMonth,
					},
				},
			}),

			// Total revenue this month
			prisma.booking.aggregate({
				where: {
					workshopId: workshop.id,
					status: 'DONE',
					createdAt: {
						gte: startOfMonth,
						lte: endOfMonth,
					},
				},
				_sum: {
					workshopAmount: true,
				},
			}),
		])

		return NextResponse.json({
			totalRequests,
			activeOffers,
			completedJobs,
			totalRevenue: totalRevenue._sum.workshopAmount || 0,
		})
	} catch (error) {
		console.error('Workshop stats error:', error)
		return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 })
	}
}
