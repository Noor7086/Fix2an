'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Upload, File, X, Building2, Clock } from 'lucide-react'
import { validateFile, getFileIcon } from '@/lib/utils'

export default function WorkshopSignupPage() {
	const router = useRouter()
	const { toast } = useToast()

	const [formData, setFormData] = useState({
		// User info
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',

		// Workshop info
		companyName: '',
		organizationNumber: '',
		address: '',
		city: '',
		postalCode: '',
		website: '',
		description: '',

		// Opening hours
		mondayOpen: '08:00',
		mondayClose: '17:00',
		tuesdayOpen: '08:00',
		tuesdayClose: '17:00',
		wednesdayOpen: '08:00',
		wednesdayClose: '17:00',
		thursdayOpen: '08:00',
		thursdayClose: '17:00',
		fridayOpen: '08:00',
		fridayClose: '17:00',
		saturdayOpen: '09:00',
		saturdayClose: '15:00',
		sundayOpen: '',
		sundayClose: '',

		// Brands
		brands: [] as string[],
	})

	const [documents, setDocuments] = useState<File[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)

	const carBrands = [
		'Volvo',
		'Saab',
		'BMW',
		'Mercedes-Benz',
		'Audi',
		'Volkswagen',
		'Toyota',
		'Honda',
		'Ford',
		'Opel',
		'Peugeot',
		'Renault',
		'Citroën',
		'Fiat',
		'Nissan',
		'Mazda',
		'Hyundai',
		'Kia',
		'Skoda',
		'Seat',
		'Alfa Romeo',
		'Jaguar',
		'Land Rover',
		'Mini',
		'Smart',
		'Subaru',
		'Suzuki',
		'Mitsubishi',
		'Lexus',
		'Infiniti',
		'Andra',
	]

	const onDrop = (acceptedFiles: File[]) => {
		const validFiles: File[] = []

		acceptedFiles.forEach((file) => {
			const validation = validateFile(file)
			if (validation.isValid) {
				validFiles.push(file)
			} else {
				toast({
					title: 'Ogiltig fil',
					description: validation.error,
					variant: 'destructive',
				})
			}
		})

		if (validFiles.length > 0) {
			setDocuments((prev) => [...prev, ...validFiles])
		}
	}

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.jpg', '.jpeg', '.png'],
			'application/pdf': ['.pdf'],
		},
		maxFiles: 10,
		maxSize: 10 * 1024 * 1024, // 10MB
	})

	const removeDocument = (index: number) => {
		setDocuments((prev) => prev.filter((_, i) => i !== index))
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleBrandToggle = (brand: string) => {
		setFormData((prev) => ({
			...prev,
			brands: prev.brands.includes(brand)
				? prev.brands.filter((b) => b !== brand)
				: [...prev.brands, brand],
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		if (formData.password !== formData.confirmPassword) {
			toast({
				title: 'Fel',
				description: 'Lösenorden matchar inte',
				variant: 'destructive',
			})
			setIsSubmitting(false)
			return
		}

		if (documents.length === 0) {
			toast({
				title: 'Fel',
				description: 'Du måste ladda upp minst ett dokument (F-skattsedel eller ansvarsförsäkring)',
				variant: 'destructive',
			})
			setIsSubmitting(false)
			return
		}

		try {
			// Upload documents
			const uploadedDocuments = []
			for (const file of documents) {
				const docFormData = new FormData()
				docFormData.append('file', file)

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: docFormData,
				})

				if (!response.ok) {
					throw new Error('Document upload failed')
				}

				const result = await response.json()
				uploadedDocuments.push({
					fileName: result.fileName,
					fileUrl: result.fileUrl,
					mimeType: result.mimeType,
				})
			}

			// Create workshop registration
			const response = await fetch('/api/workshop/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...formData,
					documents: uploadedDocuments,
				}),
			})

			if (response.ok) {
				toast({
					title: 'Registrering skickad',
					description:
						'Din ansökan har skickats. Vi kommer att granska den och kontakta dig snart.',
				})
				router.push('/auth/signin')
			} else {
				const error = await response.json()
				toast({
					title: 'Fel',
					description: error.message || 'Något gick fel',
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Registration error:', error)
			toast({
				title: 'Fel',
				description: 'Något gick fel vid registreringen. Försök igen.',
				variant: 'destructive',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8">
					<Link href="/" className="text-3xl font-bold text-primary">
						Fixa2an
					</Link>
					<h1 className="text-3xl font-bold text-gray-900 mt-4">Registrera din verkstad</h1>
					<p className="text-lg text-gray-600 mt-2">
						Bli en del av vårt nätverk av verifierade verkstäder
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardTitle>Personlig information</CardTitle>
							<CardDescription>Din kontaktinformation som verkstadsansvarig</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="name">Namn</Label>
									<Input
										id="name"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										placeholder="Ditt fullständiga namn"
									/>
								</div>
								<div>
									<Label htmlFor="email">E-postadress</Label>
									<Input
										id="email"
										name="email"
										type="email"
										value={formData.email}
										onChange={handleInputChange}
										required
										placeholder="din@epost.se"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="phone">Telefonnummer</Label>
									<Input
										id="phone"
										name="phone"
										type="tel"
										value={formData.phone}
										onChange={handleInputChange}
										required
										placeholder="070-123 45 67"
									/>
								</div>
								<div>
									<Label htmlFor="website">Webbplats (valfritt)</Label>
									<Input
										id="website"
										name="website"
										type="url"
										value={formData.website}
										onChange={handleInputChange}
										placeholder="https://www.dinverkstad.se"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="password">Lösenord</Label>
									<Input
										id="password"
										name="password"
										type="password"
										value={formData.password}
										onChange={handleInputChange}
										required
										placeholder="Minst 8 tecken"
									/>
								</div>
								<div>
									<Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										value={formData.confirmPassword}
										onChange={handleInputChange}
										required
										placeholder="Bekräfta ditt lösenord"
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Company Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Building2 className="w-5 h-5" />
								Företagsinformation
							</CardTitle>
							<CardDescription>Information om din verkstad</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="companyName">Företagsnamn</Label>
									<Input
										id="companyName"
										name="companyName"
										value={formData.companyName}
										onChange={handleInputChange}
										required
										placeholder="Din Verkstad AB"
									/>
								</div>
								<div>
									<Label htmlFor="organizationNumber">Organisationsnummer</Label>
									<Input
										id="organizationNumber"
										name="organizationNumber"
										value={formData.organizationNumber}
										onChange={handleInputChange}
										required
										placeholder="123456-7890"
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="address">Adress</Label>
								<Input
									id="address"
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									required
									placeholder="Gatunamn 123"
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="city">Stad</Label>
									<Input
										id="city"
										name="city"
										value={formData.city}
										onChange={handleInputChange}
										required
										placeholder="Stockholm"
									/>
								</div>
								<div>
									<Label htmlFor="postalCode">Postnummer</Label>
									<Input
										id="postalCode"
										name="postalCode"
										value={formData.postalCode}
										onChange={handleInputChange}
										required
										placeholder="123 45"
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="description">Beskrivning av verkstaden</Label>
								<Textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									placeholder="Beskriv din verkstad, specialiteter, erfarenhet..."
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Opening Hours */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="w-5 h-5" />
								Öppettider
							</CardTitle>
							<CardDescription>Ange dina öppettider</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
									(day) => (
										<div key={day} className="space-y-2">
											<Label className="capitalize">
												{day === 'monday'
													? 'Måndag'
													: day === 'tuesday'
														? 'Tisdag'
														: day === 'wednesday'
															? 'Onsdag'
															: day === 'thursday'
																? 'Torsdag'
																: day === 'friday'
																	? 'Fredag'
																	: day === 'saturday'
																		? 'Lördag'
																		: 'Söndag'}
											</Label>
											<div className="flex gap-2">
												<Input
													type="time"
													value={formData[`${day}Open` as keyof typeof formData] as string}
													onChange={(e) =>
														setFormData((prev) => ({ ...prev, [`${day}Open`]: e.target.value }))
													}
													placeholder="Öppet"
												/>
												<Input
													type="time"
													value={formData[`${day}Close` as keyof typeof formData] as string}
													onChange={(e) =>
														setFormData((prev) => ({ ...prev, [`${day}Close`]: e.target.value }))
													}
													placeholder="Stängt"
												/>
											</div>
										</div>
									),
								)}
							</div>
						</CardContent>
					</Card>

					{/* Brands */}
					<Card>
						<CardHeader>
							<CardTitle>Bilmärken</CardTitle>
							<CardDescription>Välj vilka bilmärken du arbetar med</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
								{carBrands.map((brand) => (
									<label key={brand} className="flex items-center space-x-2 cursor-pointer">
										<input
											type="checkbox"
											checked={formData.brands.includes(brand)}
											onChange={() => handleBrandToggle(brand)}
											className="rounded"
										/>
										<span className="text-sm">{brand}</span>
									</label>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Documents */}
					<Card>
						<CardHeader>
							<CardTitle>Dokument</CardTitle>
							<CardDescription>
								Ladda upp F-skattsedel, ansvarsförsäkring och andra relevanta dokument
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div
								{...getRootProps()}
								className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
									isDragActive
										? 'border-primary bg-primary/5'
										: 'border-gray-300 hover:border-primary hover:bg-gray-50'
								}`}
							>
								<input {...getInputProps()} />
								<Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
								{isDragActive ? (
									<p className="text-lg text-primary">Släpp filerna här...</p>
								) : (
									<div>
										<p className="text-lg text-gray-600 mb-2">
											Dra och släpp dokument här, eller klicka för att välja
										</p>
										<p className="text-sm text-gray-500">JPG, PNG, PDF upp till 10MB</p>
									</div>
								)}
							</div>

							{documents.length > 0 && (
								<div className="mt-6 space-y-2">
									<h4 className="font-medium">Uppladdade dokument:</h4>
									{documents.map((file, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
										>
											<div className="flex items-center gap-3">
												<span className="text-2xl">{getFileIcon(file.type)}</span>
												<div>
													<p className="font-medium">{file.name}</p>
													<p className="text-sm text-gray-500">
														{(file.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</div>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeDocument(index)}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Submit */}
					<div className="flex justify-end">
						<Button type="submit" size="lg" disabled={isSubmitting}>
							{isSubmitting ? 'Skickar ansökan...' : 'Skicka ansökan'}
						</Button>
					</div>
				</form>

				<div className="text-center mt-8">
					<p className="text-sm text-gray-600">
						Har du redan ett konto?{' '}
						<Link href="/auth/signin" className="font-medium text-primary hover:text-primary/80">
							Logga in här
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
