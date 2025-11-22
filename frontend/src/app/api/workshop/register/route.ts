import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			// User info
			name,
			email,
			password,
			phone,
			website,

			// Workshop info
			companyName,
			organizationNumber,
			address,
			city,
			postalCode,
			description,

			// Opening hours
			mondayOpen,
			mondayClose,
			tuesdayOpen,
			tuesdayClose,
			wednesdayOpen,
			wednesdayClose,
			thursdayOpen,
			thursdayClose,
			fridayOpen,
			fridayClose,
			saturdayOpen,
			saturdayClose,
			sundayOpen,
			sundayClose,

			// Brands
			brands,

			// Documents
			documents,
		} = body

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return NextResponse.json(
				{ message: 'En användare med denna e-postadress finns redan' },
				{ status: 400 },
			)
		}

		// Check if workshop already exists
		const existingWorkshop = await prisma.workshop.findFirst({
			where: { organizationNumber },
		})

		if (existingWorkshop) {
			return NextResponse.json(
				{ message: 'En verkstad med detta organisationsnummer finns redan' },
				{ status: 400 },
			)
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12)

		// Create opening hours object and convert to JSON string
		const openingHoursObj = {
			monday: { open: mondayOpen || '', close: mondayClose || '' },
			tuesday: { open: tuesdayOpen || '', close: tuesdayClose || '' },
			wednesday: { open: wednesdayOpen || '', close: wednesdayClose || '' },
			thursday: { open: thursdayOpen || '', close: thursdayClose || '' },
			friday: { open: fridayOpen || '', close: fridayClose || '' },
			saturday: { open: saturdayOpen || '', close: saturdayClose || '' },
			sunday: { open: sundayOpen || '', close: sundayClose || '' },
		}
		const openingHoursJson = JSON.stringify(openingHoursObj)

		// Convert brands array to comma-separated string
		const brandsString = Array.isArray(brands) ? brands.join(',') : ''

		// Create user and workshop in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Create user
			const user = await tx.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					phone: phone || undefined,
					role: 'WORKSHOP',
				},
			})

			// Create workshop
			const workshop = await tx.workshop.create({
				data: {
					userId: user.id,
					companyName,
					organizationNumber,
					address,
					city,
					postalCode,
					phone: phone || '',
					email,
					website: website || undefined,
					description: description || undefined,
					openingHours: openingHoursJson,
					brandsHandled: brandsString,
					latitude: 0, // Will be geocoded later
					longitude: 0, // Will be geocoded later
				},
			})

			// Create workshop documents
			if (documents && Array.isArray(documents) && documents.length > 0) {
				for (const doc of documents) {
					if (doc?.fileName && doc?.fileUrl) {
						await tx.workshopDocument.create({
							data: {
								workshopId: workshop.id,
								type: 'OTHER', // You might want to detect the type based on filename
								fileName: doc.fileName,
								fileUrl: doc.fileUrl,
							},
						})
					}
				}
			}

			return { user, workshop }
		})

		// Send welcome email
		try {
			await sendEmail(email, emailTemplates.workshopWelcome())
		} catch (emailError) {
			console.error('Failed to send welcome email:', emailError)
			// Don't fail registration if email fails
		}

		return NextResponse.json(
			{
				message: 'Verkstadsregistrering skapad framgångsrikt',
				userId: result.user.id,
				workshopId: result.workshop.id,
			},
			{ status: 201 },
		)
	} catch (error: any) {
		console.error('Workshop registration error:', error)
		
		// Provide more detailed error message
		let errorMessage = 'Något gick fel vid registreringen'
		
		if (error?.code === 'P2002') {
			errorMessage = 'E-postadress eller organisationsnummer finns redan'
		} else if (error?.message) {
			errorMessage = error.message
		}
		
		return NextResponse.json({ message: errorMessage, error: error?.code || 'UNKNOWN' }, { status: 500 })
	}
}
