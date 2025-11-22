import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const response = await fetch(`${BACKEND_URL}/api/admin/payouts/${params.id}/mark-paid`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		const data = await response.json()

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status })
		}

		return NextResponse.json(data)
	} catch (error) {
		console.error('Admin mark payout paid API error:', error)
		return NextResponse.json({ message: 'Failed to mark payout as paid' }, { status: 500 })
	}
}

