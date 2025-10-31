import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
		const body = await request.json()

		// Add customerId from session
		const requestBody = {
			...body,
			customerId: session.user.id,
		}

		const response = await fetch(`${backendUrl}/api/bookings`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy booking creation error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

		const response = await fetch(`${backendUrl}/api/bookings/customer/${session.user.id}`, {
			method: 'GET',
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy fetch bookings error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}


