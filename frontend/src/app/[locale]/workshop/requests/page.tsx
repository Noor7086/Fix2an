'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate } from '@/lib/utils'
import {
	Car,
	MapPin,
	Clock,
	Star,
	Eye,
	Calendar,
	AlertCircle,
	User,
	Send,
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Navbar } from '@/components/navbar'

interface Request {
	id: string
	status: string
	description?: string
	createdAt: string
	expiresAt: string
	latitude: number
	longitude: number
	address: string
	city: string
	vehicle: {
		make: string
		model: string
		year: number
	}
	customer: {
		name: string
		email: string
	}
	offers: Array<{
		id: string
		price: number
		status: string
	}>
}

export default function WorkshopRequestsPage() {
	const { status } = useSession()
	const router = useRouter()
	const { toast } = useToast()
	const [requests, setRequests] = useState<Request[]>([])
	const [loading, setLoading] = useState(true)
	const t = useTranslations('workshop')
	const tCommon = useTranslations('common')
	const locale = useLocale()

	useEffect(() => {
		if (status === 'authenticated') {
			fetchRequests()
		}
	}, [status])

	const fetchRequests = async () => {
		try {
			const response = await fetch('/api/requests/available')
			if (response.ok) {
				const data = await response.json()
				setRequests(data)
			} else {
				if (response.status === 401) {
					router.push(`/${locale}/auth/signin`)
					return
				}
				toast({
					title: tCommon('error'),
					description: 'Failed to fetch requests',
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Failed to fetch requests:', error)
			toast({
				title: tCommon('error'),
				description: 'Failed to fetch requests',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	if (status === 'loading' || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
					<p>{tCommon('loading')}</p>
				</div>
			</div>
		)
	}

	if (status === 'unauthenticated') {
		router.push(`/${locale}/auth/signin`)
		return null
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<Navbar />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
							Available Requests
						</h1>
						<p className="text-gray-600">View and apply to customer requests</p>
					</div>
					<Link href={`/${locale}/workshop/dashboard`}>
						<Button variant="outline">Dashboard</Button>
					</Link>
				</div>

				{requests.length === 0 ? (
					<Card className="border-2 border-dashed border-gray-300">
						<CardContent className="text-center py-16">
							<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
								<Car className="w-10 h-10 text-primary" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">No Available Requests</h3>
							<p className="text-gray-600 mb-8 max-w-md mx-auto">
								There are no requests available at the moment. Check back later for new opportunities.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{requests.map((request) => {
							const hasOffer = request.offers.length > 0
							const offer = hasOffer ? request.offers[0] : null

							return (
								<Card
									key={request.id}
									className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 overflow-hidden"
								>
									<CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4">
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-2">
													<div className="p-2 rounded-lg bg-primary/10 text-primary">
														<Car className="w-5 h-5" />
													</div>
													<div>
														<CardTitle className="text-xl font-bold text-gray-900">
															{request.vehicle.make} {request.vehicle.model} {request.vehicle.year}
														</CardTitle>
														<CardDescription className="flex items-center gap-2 mt-1">
															<User className="w-3 h-3" />
															{request.customer.name}
															<span className="mx-2">•</span>
															<Calendar className="w-3 h-3" />
															{formatDate(new Date(request.createdAt))}
														</CardDescription>
													</div>
												</div>
											</div>
											<div className="flex gap-2 items-center">
												{hasOffer && offer && (
													<Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
														Offer Sent: {formatPrice(offer.price)}
													</Badge>
												)}
												<Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
													{request.status}
												</Badge>
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-6">
										<div className="grid md:grid-cols-2 gap-6">
											{/* Vehicle & Customer Info */}
											<div className="space-y-4">
												<div>
													<h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
														<Car className="w-4 h-4 text-primary" />
														Vehicle Information
													</h4>
													<div className="pl-6 space-y-1 text-sm text-gray-600">
														<p>
															<span className="font-medium">Make/Model:</span> {request.vehicle.make}{' '}
															{request.vehicle.model}
														</p>
														<p>
															<span className="font-medium">Year:</span> {request.vehicle.year}
														</p>
														{request.description && (
															<div className="pt-2 border-t border-gray-200">
																<p className="font-medium mb-1">Description:</p>
																<p className="italic">{request.description}</p>
															</div>
														)}
													</div>
												</div>

												<div>
													<h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
														<MapPin className="w-4 h-4 text-primary" />
														Location
													</h4>
													<div className="pl-6 space-y-1 text-sm text-gray-600">
														<p>{request.address}</p>
														<p>{request.city}</p>
													</div>
												</div>
											</div>

											{/* Actions */}
											<div className="space-y-4">
												<div>
													<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
														<Clock className="w-4 h-4 text-primary" />
														Actions
													</h4>
													<div className="space-y-2">
														{hasOffer && offer ? (
															<div className="p-3 bg-green-50 rounded-lg border border-green-200">
																<p className="text-sm font-medium text-green-900 mb-1">
																	Offer Already Submitted
																</p>
																<p className="text-sm text-green-700">
																	Price: <span className="font-bold">{formatPrice(offer.price)}</span>
																</p>
																<p className="text-xs text-green-600 mt-1">
																	Status: {offer.status}
																</p>
															</div>
														) : (
															<Link href={`/${locale}/workshop/requests/${request.id}/offer`} className="block">
																<Button className="w-full shadow-sm hover:shadow-md transition-all">
																	<Send className="w-4 h-4 mr-2" />
																	Create Offer
																</Button>
															</Link>
														)}
														<Link
															href={`/${locale}/offers?requestId=${request.id}`}
															className="block"
														>
															<Button variant="outline" className="w-full">
																<Eye className="w-4 h-4 mr-2" />
																View Details
															</Button>
														</Link>
													</div>
												</div>

												<div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
													<p className="text-xs text-yellow-800 flex items-center gap-2">
														<AlertCircle className="w-4 h-4" />
														Expires: {formatDate(new Date(request.expiresAt))}
													</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}

