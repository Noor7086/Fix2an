import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

		const response = await fetch(`${backendUrl}/api/offers/${params.id}`, {
			method: 'GET',
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy fetch offer error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}


