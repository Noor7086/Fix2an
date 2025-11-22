import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'WORKSHOP') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
		const { searchParams } = new URL(request.url)

		// Build query params
		const params = new URLSearchParams()
		params.append('workshopId', session.user.id)
		if (searchParams.get('latitude')) params.append('latitude', searchParams.get('latitude')!)
		if (searchParams.get('longitude')) params.append('longitude', searchParams.get('longitude')!)
		if (searchParams.get('radius')) params.append('radius', searchParams.get('radius')!)

		const response = await fetch(`${backendUrl}/api/offers/requests/available?${params.toString()}`, {
			method: 'GET',
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy fetch available requests error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}

