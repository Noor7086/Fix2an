import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const searchParams = request.nextUrl.searchParams
		const params = new URLSearchParams()
		searchParams.forEach((value, key) => {
			params.append(key, value)
		})

		const response = await fetch(`${BACKEND_URL}/api/admin/payouts?${params.toString()}`)
		const data = await response.json()

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status })
		}

		return NextResponse.json(data)
	} catch (error) {
		console.error('Admin payouts API error:', error)
		return NextResponse.json({ message: 'Failed to fetch payout reports' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()

		const response = await fetch(`${BACKEND_URL}/api/admin/payouts/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})

		const data = await response.json()

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status })
		}

		return NextResponse.json(data)
	} catch (error) {
		console.error('Admin generate payouts API error:', error)
		return NextResponse.json({ message: 'Failed to generate payout reports' }, { status: 500 })
	}
}

