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

export default function UploadPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { toast } = useToast()

	const [files, setFiles] = useState<File[]>([])
	const [vehicleData, setVehicleData] = useState({
		make: '',
		model: '',
		year: new Date().getFullYear(),
	})
	const [description, setDescription] = useState('')
	const [isUploading, setIsUploading] = useState(false)

	// Redirect if not authenticated
	if (status === 'loading') {
		return <div className="min-h-screen flex items-center justify-center">Laddar...</div>
	}

	if (!session) {
		router.push('/auth/signin')
		return null
	}

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
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
				setFiles((prev) => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
			}
		},
		[toast],
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

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (files.length === 0) {
			toast({
				title: 'Fel',
				description: 'Du måste ladda upp minst en fil',
				variant: 'destructive',
			})
			return
		}

		if (!vehicleData.make || !vehicleData.model) {
			toast({
				title: 'Fel',
				description: 'Fyll i bilens märke och modell',
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
					throw new Error('File upload failed')
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
				throw new Error('Vehicle creation failed')
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
				throw new Error('Report creation failed')
			}

			const report = await reportResponse.json()

			// Create request
			const requestResponse = await fetch('/api/requests', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					vehicleId: vehicle.id,
					reportId: report.id,
					description,
					latitude: session.user.latitude || 59.3293, // Default to Stockholm
					longitude: session.user.longitude || 18.0686,
					address: session.user.address || '',
					city: session.user.city || '',
					postalCode: session.user.postalCode || '',
				}),
			})

			if (!requestResponse.ok) {
				throw new Error('Request creation failed')
			}

			const request = await requestResponse.json()

			toast({
				title: 'Framgång!',
				description: 'Din förfrågan har skickats. Du kommer att få erbjudanden inom 24 timmar.',
			})

			router.push('/my-cases')
		} catch (error) {
			console.error('Upload error:', error)
			toast({
				title: 'Fel',
				description: 'Något gick fel vid uppladdningen. Försök igen.',
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
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Ladda upp din inspektionsrapport
					</h1>
					<p className="text-lg text-gray-600">
						Steg 1 av 3 - Ladda upp din rapport och berätta om din bil
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* File Upload */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="w-5 h-5" />
								Ladda upp filer
							</CardTitle>
							<CardDescription>
								Ladda upp din inspektionsrapport (JPG, PNG eller PDF). Max 5 filer, 10MB per fil.
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
											Dra och släpp filer här, eller klicka för att välja
										</p>
										<p className="text-sm text-gray-500">JPG, PNG, PDF upp till 10MB</p>
									</div>
								)}
							</div>

							{files.length > 0 && (
								<div className="mt-6 space-y-2">
									<h4 className="font-medium">Uppladdade filer:</h4>
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
								Bilinformation
							</CardTitle>
							<CardDescription>
								Berätta om din bil så att verkstäderna kan ge dig bättre erbjudanden
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label htmlFor="make">Bilmärke</Label>
									<Select
										value={vehicleData.make}
										onValueChange={(value) => setVehicleData((prev) => ({ ...prev, make: value }))}
									>
										<SelectTrigger>
											<SelectValue placeholder="Välj märke" />
										</SelectTrigger>
										<SelectContent>
											{carMakes.map((make) => (
												<SelectItem key={make} value={make}>
													{make}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="model">Modell</Label>
									<Input
										id="model"
										value={vehicleData.model}
										onChange={(e) => setVehicleData((prev) => ({ ...prev, model: e.target.value }))}
										placeholder="t.ex. V70, Golf, X3"
									/>
								</div>
								<div>
									<Label htmlFor="year">Årsmodell</Label>
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
							<CardTitle>Beskrivning</CardTitle>
							<CardDescription>
								Beskriv vad som behöver fixas eller om du har några speciella önskemål
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Beskriv vad som behöver fixas på din bil..."
								rows={4}
							/>
						</CardContent>
					</Card>

					{/* Submit */}
					<div className="flex justify-end">
						<Button type="submit" size="lg" disabled={isUploading || files.length === 0}>
							{isUploading ? 'Skickar förfrågan...' : 'Skicka förfrågan'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
