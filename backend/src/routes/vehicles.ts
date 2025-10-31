import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

router.post('/', async (req, res) => {
	try {
		const { make, model, year } = req.body as {
			make?: string
			model?: string
			year?: number | string
		}
		if (!make || !model || !year) {
			return res.status(400).json({ message: 'Make, model, and year are required' })
		}
		const vehicle = await prisma.vehicle.create({
			data: { make, model, year: parseInt(String(year)) },
		})
		return res.json(vehicle)
	} catch (error) {
		console.error('Vehicle creation error:', error)
		return res.status(500).json({ message: 'Failed to create vehicle' })
	}
})

export default router
