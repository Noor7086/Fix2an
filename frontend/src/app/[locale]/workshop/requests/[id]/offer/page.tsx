'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate } from '@/lib/utils'
import { Car, ArrowLeft, Send, Clock, DollarSign, FileText, Shield, Calendar, User, MessageSquare } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Navbar } from '@/components/navbar'

interface Request {
	id: string
	status: string
	description?: string
	createdAt: string
	vehicle: {
		make: string
		model: string
		year: number
	}
	customer: {
		name: string
		email: string
	}
}

export default function CreateOfferPage() {
	const { status } = useSession()
	const router = useRouter()
	const params = useParams()
	const { toast } = useToast()
	const locale = useLocale()
	const tCommon = useTranslations('common')

	const requestId = params?.id as string

	const [request, setRequest] = useState<Request | null>(null)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)

	const [formData, setFormData] = useState({
		price: '',
		estimatedDuration: '',
		warranty: '',
		note: '',
		availableDates: [''] as string[],
	})

	useEffect(() => {
		if (requestId && status === 'authenticated') {
			fetchRequest()
		}
	}, [requestId, status])

	const fetchRequest = async () => {
		try {
			// First fetch all available requests
			const response = await fetch('/api/requests/available')
			if (response.ok) {
				const requests = await response.json()
				const foundRequest = requests.find((r: Request) => r.id === requestId)
				if (foundRequest) {
					setRequest(foundRequest)
				} else {
					// Try to fetch from regular requests endpoint
					const singleResponse = await fetch(`/api/requests?requestId=${requestId}`)
					if (singleResponse.ok) {
						const requestData = await singleResponse.json()
						if (requestData && requestData.id === requestId) {
							setRequest(requestData)
							return
						}
					}
					toast({
						title: tCommon('error'),
						description: 'Request not found or not available',
						variant: 'destructive',
					})
					router.push(`/${locale}/workshop/requests`)
				}
			}
		} catch (error) {
			console.error('Failed to fetch request:', error)
			toast({
				title: tCommon('error'),
				description: 'Failed to fetch request',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.price || !formData.estimatedDuration) {
			toast({
				title: tCommon('error'),
				description: 'Please fill in all required fields',
				variant: 'destructive',
			})
			return
		}

		// Filter out empty dates and validate
		const validDates = formData.availableDates.filter(date => date && date.trim() !== '')
		if (validDates.length === 0) {
			toast({
				title: tCommon('error'),
				description: 'Please add at least one available time slot',
				variant: 'destructive',
			})
			return
		}

		setSubmitting(true)

		try {
			const response = await fetch('/api/offers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					requestId,
					price: parseFloat(formData.price),
					estimatedDuration: parseInt(formData.estimatedDuration),
					warranty: formData.warranty || '',
					note: formData.note || '',
					availableDates: validDates,
				}),
			})

			if (response.ok) {
				toast({
					title: 'Success',
					description: 'Offer created successfully!',
				})
				router.push(`/${locale}/workshop/requests`)
			} else {
				const errorData = await response.json()
				toast({
					title: tCommon('error'),
					description: errorData.message || 'Failed to create offer',
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Failed to create offer:', error)
			toast({
				title: tCommon('error'),
				description: 'Failed to create offer',
				variant: 'destructive',
			})
		} finally {
			setSubmitting(false)
		}
	}

	if (status === 'loading' || loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
				<Navbar />
				<div className="text-center space-y-4">
					<div className="relative">
						<div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
						<Send className="w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
					</div>
					<p className="text-gray-600 font-medium text-lg">{tCommon('loading')}</p>
				</div>
			</div>
		)
	}

	if (!request) {
		return null
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
			<Navbar />
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link href={`/${locale}/workshop/requests`}>
						<Button variant="ghost" size="sm" className="mb-6 hover:bg-gray-100">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Requests
						</Button>
					</Link>
					<div className="flex items-center gap-3 mb-2">
						<div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
							<Send className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
								Create Offer
							</h1>
							<p className="text-gray-600 mt-1">Submit your competitive offer for this request</p>
						</div>
					</div>
				</div>

				{/* Request Info */}
				<Card className="mb-6 shadow-lg border border-gray-200 bg-white">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-xl text-gray-900">
							<div className="p-2.5 bg-blue-500 rounded-lg shadow-sm">
								<Car className="w-5 h-5 text-white" />
							</div>
							Request Details
						</CardTitle>
						<CardDescription className="text-gray-600 mt-2">
							Review the customer's request before submitting your offer
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="grid md:grid-cols-2 gap-8">
							<div>
								<div className="flex items-start gap-4">
									<div className="p-2.5 bg-blue-50 rounded-lg">
										<Car className="w-5 h-5 text-blue-600" />
									</div>
									<div>
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
											Vehicle
										</p>
										<p className="text-xl font-bold text-gray-900 mb-1">
											{request.vehicle.make} {request.vehicle.model}
										</p>
										<p className="text-sm text-gray-600">Year: {request.vehicle.year}</p>
									</div>
								</div>
							</div>

							<div>
								<div className="flex items-start gap-4">
									<div className="p-2.5 bg-green-50 rounded-lg">
										<User className="w-5 h-5 text-green-600" />
									</div>
									<div>
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
											Customer
										</p>
										<p className="text-lg font-semibold text-gray-900 mb-1">{request.customer.name}</p>
										<p className="text-sm text-gray-600">{request.customer.email}</p>
									</div>
								</div>
							</div>
						</div>

						{request.description && (
							<div className="mt-8 pt-6 border-t border-gray-100">
								<div className="flex items-start gap-4">
									<div className="p-2.5 bg-purple-50 rounded-lg">
										<MessageSquare className="w-5 h-5 text-purple-600" />
									</div>
									<div className="flex-1">
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
											Customer's Description
										</p>
										<p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
											{request.description}
										</p>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Offer Form */}
				<Card className="shadow-lg border border-gray-200 bg-white">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-xl text-gray-900">
							<div className="p-2.5 bg-green-500 rounded-lg shadow-sm">
								<DollarSign className="w-5 h-5 text-white" />
							</div>
							Your Offer Details
						</CardTitle>
						<CardDescription className="text-gray-600 mt-2">
							Fill in all the details to make your offer competitive
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<form onSubmit={handleSubmit} className="space-y-6">
									{/* Price and Duration Grid */}
									<div className="grid md:grid-cols-2 gap-6">
										{/* Price */}
										<div className="space-y-3">
											<Label htmlFor="price" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
												<div className="p-1.5 bg-green-50 rounded-md">
													<DollarSign className="w-4 h-4 text-green-600" />
												</div>
												Price (SEK) <span className="text-red-500">*</span>
											</Label>
											<div className="relative">
												<Input
													id="price"
													type="number"
													min="0"
													step="0.01"
													value={formData.price}
													onChange={(e) => setFormData({ ...formData, price: e.target.value })}
													placeholder="0.00"
													required
													className="pl-12 h-12 text-base font-semibold"
												/>
												<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">kr</div>
											</div>
											<p className="text-xs text-gray-500 ml-7">
												Including VAT
											</p>
										</div>

										{/* Estimated Duration */}
										<div className="space-y-3">
											<Label htmlFor="estimatedDuration" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
												<div className="p-1.5 bg-blue-50 rounded-md">
													<Clock className="w-4 h-4 text-blue-600" />
												</div>
												Estimated Duration (minutes) <span className="text-red-500">*</span>
											</Label>
											<Input
												id="estimatedDuration"
												type="number"
												min="1"
												value={formData.estimatedDuration}
												onChange={(e) =>
													setFormData({ ...formData, estimatedDuration: e.target.value })
												}
												placeholder="60"
												required
												className="h-12 text-base font-semibold"
											/>
											<p className="text-xs text-gray-500 ml-7">
												Duration in minutes
											</p>
										</div>
									</div>

									{/* Warranty */}
									<div className="space-y-3">
										<Label htmlFor="warranty" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
											<div className="p-1.5 bg-amber-50 rounded-md">
												<Shield className="w-4 h-4 text-amber-600" />
											</div>
											Warranty Period
										</Label>
										<Input
											id="warranty"
											type="text"
											value={formData.warranty}
											onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
											placeholder="e.g., 1 year, 12 months, 2 years"
											className="h-12"
										/>
										<p className="text-xs text-gray-500 ml-7">
											Optional: Add warranty information to make your offer more attractive
										</p>
									</div>

									{/* Available Dates */}
									<div className="space-y-3">
										<Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
											<div className="p-1.5 bg-indigo-50 rounded-md">
												<Calendar className="w-4 h-4 text-indigo-600" />
											</div>
											Available Times <span className="text-red-500">*</span>
										</Label>
										<div className="space-y-3">
											{formData.availableDates.map((date, index) => {
												// Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
												const getLocalDateTime = (isoString: string) => {
													if (!isoString) return ''
													try {
														const date = new Date(isoString)
														// Get local date/time in YYYY-MM-DDTHH:mm format
														const year = date.getFullYear()
														const month = String(date.getMonth() + 1).padStart(2, '0')
														const day = String(date.getDate()).padStart(2, '0')
														const hours = String(date.getHours()).padStart(2, '0')
														const minutes = String(date.getMinutes()).padStart(2, '0')
														return `${year}-${month}-${day}T${hours}:${minutes}`
													} catch {
														return ''
													}
												}
												
												return (
													<div key={index} className="flex items-center gap-2">
														<Input
															type="datetime-local"
															value={getLocalDateTime(date)}
															onChange={(e) => {
																const newDates = [...formData.availableDates]
																// Convert datetime-local value to ISO string
																newDates[index] = e.target.value ? new Date(e.target.value).toISOString() : ''
																setFormData({ ...formData, availableDates: newDates })
															}}
															className="h-12"
															required
														/>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => {
																const newDates = formData.availableDates.filter((_, i) => i !== index)
																setFormData({ ...formData, availableDates: newDates })
															}}
															className="px-4"
														>
															Remove
														</Button>
													</div>
												)
											})}
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													setFormData({ ...formData, availableDates: [...formData.availableDates, ''] })
												}}
												className="w-full"
											>
												+ Add Available Time
											</Button>
										</div>
										<p className="text-xs text-gray-500 ml-7">
											Add at least one available time slot for the customer to choose from
										</p>
									</div>

									{/* Note */}
									<div className="space-y-3">
										<Label htmlFor="note" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
											<div className="p-1.5 bg-purple-50 rounded-md">
												<FileText className="w-4 h-4 text-purple-600" />
											</div>
											Additional Notes
										</Label>
										<Textarea
											id="note"
											value={formData.note}
											onChange={(e) => setFormData({ ...formData, note: e.target.value })}
											placeholder="Add any additional information that might help your offer stand out. For example: 'We specialize in this type of repair' or 'Free pickup and delivery available'..."
											rows={5}
											className="resize-none"
										/>
										<p className="text-xs text-gray-500 ml-7">
											Optional: Share additional details about your services or approach
										</p>
									</div>

									{/* Submit Buttons */}
									<div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
										<Link href={`/${locale}/workshop/requests`}>
											<Button type="button" variant="outline" size="lg" className="px-8">
												Cancel
											</Button>
										</Link>
										<Button
											type="submit"
											disabled={submitting}
											size="lg"
											className="px-8 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
										>
											{submitting ? (
												<>
													<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
													Submitting...
												</>
											) : (
												<>
													<Send className="w-5 h-5 mr-2" />
													Submit Offer
												</>
											)}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
			</div>
		</div>
	)
}

