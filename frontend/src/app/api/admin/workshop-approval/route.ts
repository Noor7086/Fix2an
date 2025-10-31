import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { workshopId, approved } = body

		if (typeof approved !== 'boolean') {
			return NextResponse.json({ message: 'Approved must be a boolean' }, { status: 400 })
		}

		// Update workshop status
		const workshop = await prisma.workshop.update({
			where: { id: workshopId },
			data: { isVerified: approved },
			include: {
				user: {
					select: {
						email: true,
						name: true,
					},
				},
			},
		})

		// Send email notification
		try {
			if (approved) {
				await sendEmail(workshop.user.email, emailTemplates.workshopWelcome())
			} else {
				// Send rejection email (you might want to create a specific template for this)
				await sendEmail(workshop.user.email, {
					subject: 'Din ansökan om verkstadskonto',
					html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1C3F94;">Ansökan avvisad</h1>
                <p>Tyvärr kunde vi inte godkänna din ansökan om verkstadskonto just nu.</p>
                <p>Kontakta oss om du har frågor.</p>
              </div>
            `,
					text: 'Din ansökan om verkstadskonto har avvisats. Kontakta oss om du har frågor.',
				})
			}
		} catch (emailError) {
			console.error('Failed to send workshop approval email:', emailError)
			// Don't fail the request if email fails
		}

		return NextResponse.json({
			message: approved ? 'Workshop approved' : 'Workshop rejected',
			workshop,
		})
	} catch (error) {
		console.error('Workshop approval error:', error)
		return NextResponse.json({ message: 'Failed to update workshop' }, { status: 500 })
	}
}
