import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
		const { searchParams } = new URL(request.url)
		const requestId = searchParams.get('requestId')

		if (!requestId) {
			return NextResponse.json({ message: 'requestId is required' }, { status: 400 })
		}

		const url = new URL(`${backendUrl}/api/offers/request/${requestId}`)
		searchParams.forEach((value, key) => {
			if (key !== 'requestId') {
				url.searchParams.append(key, value)
			}
		})

		const response = await fetch(url.toString(), {
			method: 'GET',
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy fetch offers error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'WORKSHOP') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
		const body = await request.json()

		// Add userId from session (backend will resolve to workshopId)
		const requestBody = {
			...body,
			userId: session.user.id, // Send userId, backend will find the workshop
		}

		const response = await fetch(`${backendUrl}/api/offers`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy create offer error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}


