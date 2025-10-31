import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
		const body = await request.json()

		const response = await fetch(`${backendUrl}/api/inspection-reports`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy inspection report error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}
