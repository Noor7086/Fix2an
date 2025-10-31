import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/db'
import { sendEmail, emailTemplates } from '../lib/email'
import type { RegisterRequest } from '@fix2an/shared'

const router = Router()

router.post('/register', async (req, res) => {
	try {
		const {
			name,
			email,
			password,
			phone,
			address,
			city,
			postalCode,
			role = 'CUSTOMER',
		} = req.body as RegisterRequest

		if (!email || !password) {
			return res.status(400).json({ message: 'Email och lösenord krävs' })
		}

		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) {
			return res.status(400).json({ message: 'En användare med denna e-postadress finns redan' })
		}

		const hashedPassword = await bcrypt.hash(password, 12)

		const user = await prisma.user.create({
			data: { name, email, password: hashedPassword, phone, address, city, postalCode, role },
		})

		if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER) {
			try {
				await sendEmail(
					email,
					emailTemplates.accountVerification(
						`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${user.id}`,
					),
				)
			} catch (emailError) {
				console.error('Failed to send welcome email:', emailError)
			}
		}

		return res.status(201).json({ message: 'Konto skapat framgångsrikt', userId: user.id })
	} catch (error) {
		console.error('Registration error:', error)
		return res.status(500).json({ message: 'Något gick fel vid registreringen' })
	}
})

export default router
