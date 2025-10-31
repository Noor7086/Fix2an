import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		// Get current month start and end
		const now = new Date()
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

		// Get stats
		const [
			totalCustomers,
			totalWorkshops,
			pendingWorkshops,
			totalRequests,
			totalBookings,
			totalRevenue,
			monthlyRevenue,
		] = await Promise.all([
			// Total customers
			prisma.user.count({
				where: { role: 'CUSTOMER' },
			}),

			// Total workshops
			prisma.workshop.count(),

			// Pending workshops
			prisma.workshop.count({
				where: { isVerified: false },
			}),

			// Total requests
			prisma.request.count(),

			// Total bookings
			prisma.booking.count(),

			// Total revenue
			prisma.booking.aggregate({
				where: { status: 'DONE' },
				_sum: { totalAmount: true },
			}),

			// Monthly revenue
			prisma.booking.aggregate({
				where: {
					status: 'DONE',
					createdAt: {
						gte: startOfMonth,
						lte: endOfMonth,
					},
				},
				_sum: { totalAmount: true },
			}),
		])

		return NextResponse.json({
			totalCustomers,
			totalWorkshops,
			pendingWorkshops,
			totalRequests,
			totalBookings,
			totalRevenue: totalRevenue._sum.totalAmount || 0,
			monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
		})
	} catch (error) {
		console.error('Admin stats error:', error)
		return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 })
	}
}
