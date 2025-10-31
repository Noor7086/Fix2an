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

		const pendingWorkshops = await prisma.workshop.findMany({
			where: { isVerified: false },
			include: {
				documents: {
					select: {
						type: true,
						fileName: true,
					},
				},
			},
			orderBy: {
				createdAt: 'asc',
			},
		})

		return NextResponse.json(pendingWorkshops)
	} catch (error) {
		console.error('Pending workshops error:', error)
		return NextResponse.json({ message: 'Failed to fetch pending workshops' }, { status: 500 })
	}
}
