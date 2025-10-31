import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
		const formData = await request.formData()

		const response = await fetch(`${backendUrl}/api/upload`, {
			method: 'POST',
			body: formData,
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy upload error:', error)
		return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 500 })
	}
}
