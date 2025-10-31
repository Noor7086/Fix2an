import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/db'

const router = Router()

// Configure multer for file storage (local for MVP, can upgrade to S3 later)
const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadDir)
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	},
})

const upload = multer({
	storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
	},
	fileFilter: (_req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|pdf/
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
		const mimetype = allowedTypes.test(file.mimetype)

		if (mimetype && extname) {
			return cb(null, true)
		} else {
			cb(new Error('Only JPEG, PNG, and PDF files are allowed'))
		}
	},
})

// Single file upload endpoint (frontend uploads one at a time)
router.post('/', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' })
		}

		const uploadedFile = {
			fileName: req.file.originalname,
			fileUrl: `/uploads/${req.file.filename}`,
			fileSize: req.file.size,
			mimeType: req.file.mimetype,
		}

		// For MVP, store files locally. In production, upload to S3/Cloud Storage
		return res.status(200).json(uploadedFile)
	} catch (error: any) {
		console.error('Upload error:', error)
		return res.status(500).json({ message: error.message || 'File upload failed' })
	}
})

export default router

