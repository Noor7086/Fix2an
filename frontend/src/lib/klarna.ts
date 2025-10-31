import { Klarna } from 'klarna-checkout'

const klarna = new Klarna({
	username: process.env.KLARNA_USERNAME!,
	password: process.env.KLARNA_PASSWORD!,
	testMode: process.env.KLARNA_TEST_MODE === 'true',
})

export interface KlarnaOrderData {
	order_amount: number
	order_tax_amount: number
	order_lines: Array<{
		name: string
		quantity: number
		unit_price: number
		tax_rate: number
		total_amount: number
		total_tax_amount: number
	}>
	billing_address: {
		given_name: string
		family_name: string
		email: string
		street_address: string
		city: string
		postal_code: string
		country: string
	}
	shipping_address: {
		given_name: string
		family_name: string
		email: string
		street_address: string
		city: string
		postal_code: string
		country: string
	}
	merchant_urls: {
		terms: string
		checkout: string
		confirmation: string
		push: string
	}
}

export async function createKlarnaOrder(orderData: KlarnaOrderData) {
	try {
		const order = await klarna.orders.create(orderData)
		return order
	} catch (error) {
		console.error('Klarna order creation failed:', error)
		throw error
	}
}

export async function getKlarnaOrder(orderId: string) {
	try {
		const order = await klarna.orders.retrieve(orderId)
		return order
	} catch (error) {
		console.error('Failed to retrieve Klarna order:', error)
		throw error
	}
}

export async function captureKlarnaOrder(orderId: string, capturedAmount?: number) {
	try {
		const capture = await klarna.orders.capture(orderId, {
			captured_amount: capturedAmount,
		})
		return capture
	} catch (error) {
		console.error('Klarna order capture failed:', error)
		throw error
	}
}

export async function refundKlarnaOrder(orderId: string, refundedAmount: number) {
	try {
		const refund = await klarna.orders.refund(orderId, {
			refunded_amount: refundedAmount,
		})
		return refund
	} catch (error) {
		console.error('Klarna order refund failed:', error)
		throw error
	}
}

export { klarna }
