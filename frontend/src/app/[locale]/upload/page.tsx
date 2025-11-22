'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
import { Upload, File, X, Car } from 'lucide-react'
import { validateFile, getFileIcon } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { useRequireAuth } from '@/hooks/use-auth-redirect'
import { Navbar } from '@/components/navbar'

export default function UploadPage() {
	const { status } = useSession()
	const router = useRouter()
	const { toast } = useToast()
	const t = useTranslations('upload')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const tSuccess = useTranslations('success')
	const locale = useLocale()

	// Require authentication
	const { session, isLoading: isAuthLoading } = useRequireAuth()

	const [files, setFiles] = useState<File[]>([])
	const [vehicleData, setVehicleData] = useState<{
		make: string
		model: string
		year: number
	}>({
		make: '',
		model: '',
		year: new Date().getFullYear(),
	})
	const [description, setDescription] = useState('')
	const [isUploading, setIsUploading] = useState(false)

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			console.log('Files dropped:', acceptedFiles.length, acceptedFiles)
			const validFiles: File[] = []

			acceptedFiles.forEach((file) => {
				console.log('Validating file:', file.name, file.type, file.size)
				const validation = validateFile(file)
				console.log('Validation result:', validation)
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

			console.log('Valid files:', validFiles.length)
			if (validFiles.length > 0) {
				setFiles((prev) => {
					const newFiles = [...prev, ...validFiles].slice(0, 5) // Max 5 files
					console.log('Setting files:', newFiles.length)
					return newFiles
				})
			}
		},
		[toast, tCommon],
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.jpg', '.jpeg', '.png'],
			'application/pdf': ['.pdf'],
		},
		maxFiles: 5,
		maxSize: 10 * 1024 * 1024, // 10MB
	})

	// Show loading state while checking auth
	if (isAuthLoading || status === 'loading') {
		return <div className="min-h-screen flex items-center justify-center">{tCommon('loading')}</div>
	}

	// If not authenticated, useRequireAuth will handle redirect
	if (!session) {
		return null
	}

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		console.log('Submit clicked, files:', files.length, files)

		if (files.length === 0) {
			console.log('No files, showing error')
			toast({
				title: tCommon('error'),
				description: tErrors('file_required'),
				variant: 'destructive',
			})
			return
		}

		if (!vehicleData.make || !vehicleData.model) {
			toast({
				title: tCommon('error'),
				description: tErrors('vehicle_info_required'),
				variant: 'destructive',
			})
			return
		}

		setIsUploading(true)

		try {
			// Upload files
			const uploadedFiles = []
			for (const file of files) {
				const formData = new FormData()
				formData.append('file', file)

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
				})

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: 'File upload failed' }))
					throw new Error(errorData.message || 'File upload failed')
				}

				const result = await response.json()
				uploadedFiles.push(result)
			}

			// Create vehicle
			const vehicleResponse = await fetch('/api/vehicles', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(vehicleData),
			})

			if (!vehicleResponse.ok) {
				const errorData = await vehicleResponse.json().catch(() => ({ message: 'Vehicle creation failed' }))
				throw new Error(errorData.message || 'Vehicle creation failed')
			}

			const vehicle = await vehicleResponse.json()

			// Create inspection report
			const reportResponse = await fetch('/api/inspection-reports', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					files: uploadedFiles,
				}),
			})

			if (!reportResponse.ok) {
				const errorData = await reportResponse.json().catch(() => ({ message: 'Report creation failed' }))
				throw new Error(errorData.message || 'Report creation failed')
			}

			const report = await reportResponse.json()

			// Create request with default values if not provided
			const requestBody = {
				vehicleId: vehicle.id,
				reportId: report.id,
				description,
				latitude: session?.user?.latitude || 59.3293, // Default to Stockholm
				longitude: session?.user?.longitude || 18.0686,
				address: session?.user?.address || 'Stockholm', // Default address
				city: session?.user?.city || 'Stockholm', // Default city
				postalCode: session?.user?.postalCode || '111 22', // Default postal code
			}

			const requestResponse = await fetch('/api/requests', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			})

			if (!requestResponse.ok) {
				const errorData = await requestResponse.json().catch(() => ({ message: 'Request creation failed' }))
				throw new Error(errorData.message || 'Request creation failed')
			}

			const request = await requestResponse.json()

			toast({
				title: tSuccess('request_sent'),
				description: tSuccess('request_sent'),
			})

			router.push(`/${locale}/my-cases`)
		} catch (error: any) {
			console.error('Upload error:', error)
			const errorMessage = error?.message || tErrors('upload_failed')
			toast({
				title: tCommon('error'),
				description: errorMessage,
				variant: 'destructive',
			})
		} finally {
			setIsUploading(false)
		}
	}

	const carMakes = [
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

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
					<p className="text-lg text-gray-600">{t('subtitle')}</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* File Upload */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="w-5 h-5" />
								{t('file_upload.title')}
							</CardTitle>
							<CardDescription>{t('file_upload.description')}</CardDescription>
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
									<p className="text-lg text-primary">{t('file_upload.drop_here')}</p>
								) : (
									<div>
										<p className="text-lg text-gray-600 mb-2">{t('file_upload.drag_drop')}</p>
										<p className="text-sm text-gray-500">{t('file_upload.file_types')}</p>
									</div>
								)}
							</div>

							{files.length > 0 && (
								<div className="mt-6 space-y-2">
									<h4 className="font-medium">{t('file_upload.uploaded_files')}</h4>
									{files.map((file, index) => (
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
												onClick={() => removeFile(index)}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Vehicle Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Car className="w-5 h-5" />
								{t('vehicle_info.title')}
							</CardTitle>
							<CardDescription>{t('vehicle_info.description')}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label htmlFor="make">{t('vehicle_info.make')}</Label>
									<Select
										value={vehicleData.make || undefined}
										onValueChange={(value) => setVehicleData((prev) => ({ ...prev, make: value }))}
									>
										<SelectTrigger>
											<SelectValue placeholder={t('vehicle_info.make_placeholder')} />
										</SelectTrigger>
										<SelectContent>
											{carMakes
												.filter((make) => make.trim() !== '')
												.map((make) => (
													<SelectItem key={make} value={make}>
														{make}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="model">{t('vehicle_info.model')}</Label>
									<Input
										id="model"
										value={vehicleData.model}
										onChange={(e) => setVehicleData((prev) => ({ ...prev, model: e.target.value }))}
										placeholder={t('vehicle_info.model_placeholder')}
									/>
								</div>
								<div>
									<Label htmlFor="year">{t('vehicle_info.year_label')}</Label>
									<Input
										id="year"
										type="number"
										min="1990"
										max={new Date().getFullYear() + 1}
										value={vehicleData.year}
										onChange={(e) =>
											setVehicleData((prev) => ({ ...prev, year: parseInt(e.target.value) }))
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Description */}
					<Card>
						<CardHeader>
							<CardTitle>{t('description.title')}</CardTitle>
							<CardDescription>{t('description.description')}</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t('description.placeholder')}
								rows={4}
							/>
						</CardContent>
					</Card>

					{/* Submit */}
					<div className="flex justify-end">
						<Button type="submit" size="lg" disabled={isUploading || files.length === 0}>
							{isUploading ? t('submitting') : t('submit')}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
