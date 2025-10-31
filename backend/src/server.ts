import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Root - simple HTML landing page
app.get('/', (_req, res) => {
	res.type('html').send(`
		<!doctype html>
		<html lang="en">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Fixa2an Backend</title>
			<style>
				body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 2rem; color: #0f172a; }
				h1 { color: #1C3F94; margin-bottom: 0.25rem; }
				code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; }
				ul { line-height: 1.8; }
				.footer { margin-top: 2rem; color: #475569; font-size: 0.9rem; }
			</style>
		</head>
		<body>
			<h1>Fixa2an Backend</h1>
			<p>Status: <strong>ok</strong></p>
			<h2>Endpoints</h2>
			<ul>
				<li><a href="/health">/health</a></li>
				<li><code>/api/*</code></li>
			</ul>
			<div class="footer">Frontend runs at <a href="http://localhost:3000">http://localhost:3000</a></div>
		</body>
		</html>
	`)
})

// Health check
app.get('/health', (_req, res) => {
	res.json({ status: 'ok' })
})

// Routes
import authRouter from './routes/auth'
app.use('/api/auth', authRouter)
import vehiclesRouter from './routes/vehicles'
app.use('/api/vehicles', vehiclesRouter)
import uploadRouter from './routes/upload'
app.use('/api/upload', uploadRouter)
import inspectionReportsRouter from './routes/inspection-reports'
app.use('/api/inspection-reports', inspectionReportsRouter)
import requestsRouter from './routes/requests'
app.use('/api/requests', requestsRouter)
import offersRouter from './routes/offers'
app.use('/api/offers', offersRouter)
import bookingsRouter from './routes/bookings'
app.use('/api/bookings', bookingsRouter)

const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {
	console.log(`Backend listening on http://localhost:${port}`)
})
