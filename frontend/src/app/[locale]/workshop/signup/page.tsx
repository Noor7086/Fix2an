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
import { Upload, File, X, Building2, Clock, Eye, EyeOff } from 'lucide-react'
import { validateFile, getFileIcon } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { Navbar } from '@/components/navbar'

export default function WorkshopSignupPage() {
	const router = useRouter()
	const { toast } = useToast()
	const t = useTranslations('workshop.signup')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const tSuccess = useTranslations('success')
	const locale = useLocale()

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
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
					title: tCommon('error'),
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
				title: tCommon('error'),
				description: tErrors('password_mismatch'),
				variant: 'destructive',
			})
			setIsSubmitting(false)
			return
		}

		if (documents.length === 0) {
			toast({
				title: tCommon('error'),
				description: tErrors('documents_required'),
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
					title: t('registration_sent'),
					description: t('registration_sent_message'),
				})
				router.push(`/${locale}/auth/signin`)
			} else {
				const error = await response.json()
				toast({
					title: tCommon('error'),
					description: error.message || tErrors('generic_error'),
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Registration error:', error)
			toast({
				title: tCommon('error'),
				description: tErrors('registration_failed'),
				variant: 'destructive',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<Navbar />
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
					<p className="text-lg text-gray-600">{t('subtitle')}</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardTitle>{t('personal_info.title')}</CardTitle>
							<CardDescription>{t('personal_info.description')}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="name">{t('personal_info.name')}</Label>
									<Input
										id="name"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										placeholder={t('personal_info.name_placeholder')}
									/>
								</div>
								<div>
									<Label htmlFor="email">{t('personal_info.email')}</Label>
									<Input
										id="email"
										name="email"
										type="email"
										value={formData.email}
										onChange={handleInputChange}
										required
										placeholder={t('personal_info.email_placeholder')}
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="phone">{t('personal_info.phone')}</Label>
									<Input
										id="phone"
										name="phone"
										type="tel"
										value={formData.phone}
										onChange={handleInputChange}
										required
										placeholder={t('personal_info.phone_placeholder')}
									/>
								</div>
								<div>
									<Label htmlFor="website">{t('personal_info.website')}</Label>
									<Input
										id="website"
										name="website"
										type="url"
										value={formData.website}
										onChange={handleInputChange}
										placeholder={t('personal_info.website_placeholder')}
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="password">{t('personal_info.password')}</Label>
									<div className="relative">
										<Input
											id="password"
											name="password"
											type={showPassword ? 'text' : 'password'}
											value={formData.password}
											onChange={handleInputChange}
											required
											placeholder={t('personal_info.password_placeholder')}
											className="pr-10"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
										>
											{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</div>
								<div>
									<Label htmlFor="confirmPassword">{t('personal_info.confirm_password')}</Label>
									<div className="relative">
										<Input
											id="confirmPassword"
											name="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={formData.confirmPassword}
											onChange={handleInputChange}
											required
											placeholder={t('personal_info.confirm_password_placeholder')}
											className="pr-10"
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
										>
											{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Company Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Building2 className="w-5 h-5" />
								{t('company_info.title')}
							</CardTitle>
							<CardDescription>{t('company_info.description')}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="companyName">{t('company_info.company_name')}</Label>
									<Input
										id="companyName"
										name="companyName"
										value={formData.companyName}
										onChange={handleInputChange}
										required
										placeholder={t('company_info.company_name_placeholder')}
									/>
								</div>
								<div>
									<Label htmlFor="organizationNumber">{t('company_info.organization_number')}</Label>
									<Input
										id="organizationNumber"
										name="organizationNumber"
										value={formData.organizationNumber}
										onChange={handleInputChange}
										required
										placeholder={t('company_info.organization_number_placeholder')}
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="address">{t('company_info.address')}</Label>
								<Input
									id="address"
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									required
									placeholder={t('company_info.address_placeholder')}
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="city">{t('company_info.city')}</Label>
									<Input
										id="city"
										name="city"
										value={formData.city}
										onChange={handleInputChange}
										required
										placeholder={t('company_info.city_placeholder')}
									/>
								</div>
								<div>
									<Label htmlFor="postalCode">{t('company_info.postal_code')}</Label>
									<Input
										id="postalCode"
										name="postalCode"
										value={formData.postalCode}
										onChange={handleInputChange}
										required
										placeholder={t('company_info.postal_code_placeholder')}
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="description">{t('company_info.description')}</Label>
								<Textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									placeholder={t('company_info.description_placeholder')}
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
								{t('opening_hours.title')}
							</CardTitle>
							<CardDescription>{t('opening_hours.description')}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
									(day) => (
										<div key={day} className="space-y-2">
											<Label className="capitalize">
												{t(`opening_hours.days.${day}`)}
											</Label>
											<div className="flex gap-2">
												<Input
													type="time"
													value={formData[`${day}Open` as keyof typeof formData] as string}
													onChange={(e) =>
														setFormData((prev) => ({ ...prev, [`${day}Open`]: e.target.value }))
													}
													placeholder={t('opening_hours.open')}
												/>
												<Input
													type="time"
													value={formData[`${day}Close` as keyof typeof formData] as string}
													onChange={(e) =>
														setFormData((prev) => ({ ...prev, [`${day}Close`]: e.target.value }))
													}
													placeholder={t('opening_hours.close')}
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
							<CardTitle>{t('brands.title')}</CardTitle>
							<CardDescription>{t('brands.description')}</CardDescription>
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
							<CardTitle>{t('documents.title')}</CardTitle>
							<CardDescription>{t('documents.description')}</CardDescription>
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
									<p className="text-lg text-primary">{t('documents.drop_here')}</p>
								) : (
									<div>
										<p className="text-lg text-gray-600 mb-2">
											{t('documents.drag_drop')}
										</p>
										<p className="text-sm text-gray-500">{t('documents.file_types')}</p>
									</div>
								)}
							</div>

							{documents.length > 0 && (
								<div className="mt-6 space-y-2">
									<h4 className="font-medium">{t('documents.uploaded_documents')}</h4>
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
							{isSubmitting ? t('submitting') : t('submit')}
						</Button>
					</div>
				</form>

				<div className="text-center mt-8">
					<p className="text-sm text-gray-600">
						{t('already_account')}{' '}
						<Link href={`/${locale}/auth/signin`} className="font-medium text-primary hover:text-primary/80">
							{t('sign_in_here')}
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
