import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Seeding test data...')

	// Create test customer
	const hashedPassword = await bcrypt.hash('password123', 12)
	const customer = await prisma.user.upsert({
		where: { email: 'customer@test.com' },
		update: {},
		create: {
			email: 'customer@test.com',
			name: 'Test Customer',
			password: hashedPassword,
			role: 'CUSTOMER',
			phone: '+46 70 123 4567',
			address: 'Testgatan 1',
			city: 'Stockholm',
			postalCode: '111 22',
			latitude: 59.3293,
			longitude: 18.0686,
			isActive: true,
		},
	})
	console.log('✅ Created customer:', customer.email)

	// Create test workshop
	const workshopUser = await prisma.user.upsert({
		where: { email: 'workshop@test.com' },
		update: {},
		create: {
			email: 'workshop@test.com',
			name: 'Test Workshop Owner',
			password: hashedPassword,
			role: 'WORKSHOP',
			phone: '+46 70 987 6543',
			address: 'Verkstadsgatan 5',
			city: 'Stockholm',
			postalCode: '113 45',
			latitude: 59.3346,
			longitude: 18.0632,
			isActive: true,
		},
	})
	console.log('✅ Created workshop user:', workshopUser.email)

	const workshop = await prisma.workshop.upsert({
		where: { userId: workshopUser.id },
		update: {},
		create: {
			userId: workshopUser.id,
			companyName: 'Testverkstad AB',
			organizationNumber: '123456-7890',
			address: 'Verkstadsgatan 5',
			city: 'Stockholm',
			postalCode: '113 45',
			country: 'SE',
			latitude: 59.3346,
			longitude: 18.0632,
			phone: '+46 70 987 6543',
			email: 'workshop@test.com',
			openingHours: JSON.stringify({
				monday: '08:00-17:00',
				tuesday: '08:00-17:00',
				wednesday: '08:00-17:00',
				thursday: '08:00-17:00',
				friday: '08:00-17:00',
				saturday: '10:00-14:00',
				sunday: 'closed',
			}),
			brandsHandled: 'Volvo,BMW,Mercedes-Benz,Audi',
			isVerified: true,
			isActive: true,
			rating: 4.5,
			reviewCount: 42,
		},
	})
	console.log('✅ Created workshop:', workshop.companyName)

	// Create another workshop for more offers
	const workshopUser2 = await prisma.user.upsert({
		where: { email: 'workshop2@test.com' },
		update: {},
		create: {
			email: 'workshop2@test.com',
			name: 'Another Workshop Owner',
			password: hashedPassword,
			role: 'WORKSHOP',
			phone: '+46 70 111 2222',
			address: 'Bilgatan 10',
			city: 'Stockholm',
			postalCode: '115 30',
			latitude: 59.3214,
			longitude: 18.0749,
			isActive: true,
		},
	})

	const workshop2 = await prisma.workshop.upsert({
		where: { userId: workshopUser2.id },
		update: {},
		create: {
			userId: workshopUser2.id,
			companyName: 'Bästa Verkstaden',
			organizationNumber: '987654-3210',
			address: 'Bilgatan 10',
			city: 'Stockholm',
			postalCode: '115 30',
			country: 'SE',
			latitude: 59.3214,
			longitude: 18.0749,
			phone: '+46 70 111 2222',
			email: 'workshop2@test.com',
			openingHours: JSON.stringify({
				monday: '07:00-18:00',
				tuesday: '07:00-18:00',
				wednesday: '07:00-18:00',
				thursday: '07:00-18:00',
				friday: '07:00-18:00',
				saturday: '09:00-15:00',
				sunday: 'closed',
			}),
			brandsHandled: 'Toyota,Honda,Nissan,Volvo',
			isVerified: true,
			isActive: true,
			rating: 4.8,
			reviewCount: 128,
		},
	})
	console.log('✅ Created workshop 2:', workshop2.companyName)

	// Create test vehicle
	const vehicle = await prisma.vehicle.create({
		data: {
			make: 'Volvo',
			model: 'XC60',
			year: 2020,
		},
	})
	console.log('✅ Created vehicle:', `${vehicle.make} ${vehicle.model} ${vehicle.year}`)

	// Create test inspection report
	const report = await prisma.inspectionReport.create({
		data: {
			fileName: 'inspection-report.pdf',
			fileUrl: 'http://localhost:4000/uploads/test-report.pdf',
			fileSize: 1024000,
			mimeType: 'application/pdf',
		},
	})
	console.log('✅ Created inspection report')

	// Create test request
	const expiresAt = new Date()
	expiresAt.setHours(expiresAt.getHours() + 48)

	const request = await prisma.request.create({
		data: {
			customerId: customer.id,
			vehicleId: vehicle.id,
			reportId: report.id,
			description: 'Need to fix brakes and replace front tires',
			status: 'IN_BIDDING',
			latitude: 59.3293,
			longitude: 18.0686,
			address: 'Testgatan 1',
			city: 'Stockholm',
			postalCode: '111 22',
			country: 'SE',
			expiresAt,
		},
	})
	console.log('✅ Created request:', request.id)

	// Create test offers
	const now = new Date()
	const tomorrow = new Date(now)
	tomorrow.setDate(tomorrow.getDate() + 1)
	tomorrow.setHours(10, 0, 0, 0)

	const dayAfter = new Date(now)
	dayAfter.setDate(dayAfter.getDate() + 2)
	dayAfter.setHours(14, 0, 0, 0)

	const offer1 = await prisma.offer.create({
		data: {
			requestId: request.id,
			workshopId: workshop.id,
			price: 8500,
			note: 'Professional service with 2-year warranty on parts',
			availableDates: JSON.stringify([
				tomorrow.toISOString(),
				dayAfter.toISOString(),
			]),
			estimatedDuration: 120,
			warranty: '2 years on parts',
			status: 'SENT',
		},
	})
	console.log('✅ Created offer 1:', offer1.id, `(${offer1.price} SEK)`)

	const offer2 = await prisma.offer.create({
		data: {
			requestId: request.id,
			workshopId: workshop2.id,
			price: 9200,
			note: 'Quick service available, all original parts',
			availableDates: JSON.stringify([
				tomorrow.toISOString(),
				dayAfter.toISOString(),
			]),
			estimatedDuration: 90,
			warranty: '1 year on parts and labor',
			status: 'SENT',
		},
	})
	console.log('✅ Created offer 2:', offer2.id, `(${offer2.price} SEK)`)

	// Create another request in BIDDING_CLOSED status
	const request2 = await prisma.request.create({
		data: {
			customerId: customer.id,
			vehicleId: vehicle.id,
			reportId: report.id,
			description: 'Engine service required',
			status: 'BIDDING_CLOSED',
			latitude: 59.3293,
			longitude: 18.0686,
			address: 'Testgatan 1',
			city: 'Stockholm',
			postalCode: '111 22',
			country: 'SE',
			expiresAt,
		},
	})

	const offer3 = await prisma.offer.create({
		data: {
			requestId: request2.id,
			workshopId: workshop.id,
			price: 12000,
			note: 'Complete engine service',
			availableDates: JSON.stringify([
				tomorrow.toISOString(),
				dayAfter.toISOString(),
			]),
			estimatedDuration: 180,
			warranty: '2 years',
			status: 'SENT',
		},
	})
	console.log('✅ Created offer 3 for closed request:', offer3.id)

	console.log('\n✨ Test data seeding complete!')
	console.log('\n📝 Test Credentials:')
	console.log('Customer: customer@test.com / password123')
	console.log('Workshop: workshop@test.com / password123')
	console.log('Workshop 2: workshop2@test.com / password123')
	console.log('\n🎯 Test Request ID:', request.id)
	console.log('🎯 Test Request 2 ID (with offers):', request2.id)
}

main()
	.catch((e) => {
		console.error('❌ Seeding failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})


