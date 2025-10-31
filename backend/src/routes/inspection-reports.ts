import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

router.post('/', async (req, res) => {
	try {
		const { files } = req.body

		if (!files || !Array.isArray(files) || files.length === 0) {
			return res.status(400).json({ message: 'Files are required' })
		}

		// Create inspection reports for each file
		const reports = await Promise.all(
			files.map((file: any) =>
				prisma.inspectionReport.create({
					data: {
						fileName: file.fileName,
						fileUrl: file.fileUrl.startsWith('http') ? file.fileUrl : `${process.env.BACKEND_URL || 'http://localhost:4000'}${file.fileUrl}`,
						fileSize: file.fileSize,
						mimeType: file.mimeType,
					},
				})
			)
		)

		// Return the first report as primary (for backward compatibility)
		// Frontend can use all reports if needed
		return res.status(201).json(reports.length > 0 ? reports[0] : null)
	} catch (error) {
		console.error('Inspection report creation error:', error)
		return res.status(500).json({ message: 'Failed to create inspection report' })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params

		const report = await prisma.inspectionReport.findUnique({
			where: { id },
		})

		if (!report) {
			return res.status(404).json({ message: 'Report not found' })
		}

		return res.json(report)
	} catch (error) {
		console.error('Fetch report error:', error)
		return res.status(500).json({ message: 'Failed to fetch report' })
	}
})

export default router

