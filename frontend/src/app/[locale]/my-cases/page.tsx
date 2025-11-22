'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import {
	Car,
	MapPin,
	Clock,
	Star,
	Eye,
	MessageSquare,
	Calendar,
	CheckCircle,
	XCircle,
	AlertCircle,
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useRequireAuth } from '@/hooks/use-auth-redirect'
import { Navbar } from '@/components/navbar'

interface Request {
	id: string
	status: string
	description?: string
	createdAt: string
	expiresAt: string
	vehicle: {
		make: string
		model: string
		year: number
	}
	offers: Array<{
		id: string
		price: number
		note?: string
		status: string
		workshop: {
			companyName: string
			rating: number
			reviewCount: number
		}
	}>
	bookings: Array<{
		id: string
		status: string
		scheduledAt: string
		totalAmount: number
	}>
}

export default function MyCasesPage() {
	const { status } = useSession()
	const router = useRouter()
	const { toast } = useToast()
	const [requests, setRequests] = useState<Request[]>([])
	const [loading, setLoading] = useState(true)
	const t = useTranslations('my_cases')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const locale = useLocale()

	// Require authentication
	const { session, isLoading: isAuthLoading } = useRequireAuth()

	const fetchRequests = async () => {
		try {
			const response = await fetch('/api/requests')
			if (response.ok) {
				const data = await response.json()
				setRequests(data)
			}
		} catch (error) {
			console.error('Failed to fetch requests:', error)
			toast({
				title: tCommon('error'),
				description: t('fetch_error'),
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (session) {
			fetchRequests()
		}
	}, [session])

	// Show loading state while checking auth
	if (isAuthLoading || status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center">
				{tCommon('loading')}
			</div>
		)
	}

	// If not authenticated, useRequireAuth will handle redirect
	if (!session) {
		return null
	}

	const getStatusBadge = (status: string) => {
		const statusMap = {
			NEW: { label: t('status.new'), variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
			IN_BIDDING: { label: t('status.in_bidding'), variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
			BIDDING_CLOSED: { label: t('status.bidding_closed'), variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
			BOOKED: { label: t('status.booked'), variant: 'default' as const, className: 'bg-purple-100 text-purple-800 border-purple-200' },
			COMPLETED: { label: t('status.completed'), variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
			CANCELLED: { label: t('status.cancelled'), variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' },
		}

		const statusInfo = statusMap[status as keyof typeof statusMap] || {
			label: status,
			variant: 'default' as const,
			className: 'bg-gray-100 text-gray-800 border-gray-200',
		}

		return (
			<Badge variant={statusInfo.variant} className={statusInfo.className}>
				{statusInfo.label}
			</Badge>
		)
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'NEW':
			case 'IN_BIDDING':
				return <Clock className="w-4 h-4" />
			case 'BIDDING_CLOSED':
				return <AlertCircle className="w-4 h-4" />
			case 'BOOKED':
				return <Calendar className="w-4 h-4" />
			case 'COMPLETED':
				return <CheckCircle className="w-4 h-4" />
			case 'CANCELLED':
				return <XCircle className="w-4 h-4" />
			default:
				return <Clock className="w-4 h-4" />
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="relative">
						<div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
						<Car className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
					</div>
					<p className="text-gray-600 font-medium">{t('loading_cases')}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<Navbar />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
					<div>
						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
						<p className="text-gray-600">{t('subtitle')}</p>
					</div>
					<Link href={`/${locale}/upload`}>
						<Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
							<Car className="w-4 h-4 mr-2" />
							{t('new_request')}
						</Button>
					</Link>
				</div>

				{requests.length === 0 ? (
					<Card className="border-2 border-dashed border-gray-300">
						<CardContent className="text-center py-16">
							<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
								<Car className="w-10 h-10 text-primary" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">{t('no_cases.title')}</h3>
							<p className="text-gray-600 mb-8 max-w-md mx-auto">{t('no_cases.description')}</p>
							<Link href={`/${locale}/upload`}>
								<Button size="lg" className="shadow-md hover:shadow-lg transition-all">
									<Car className="w-4 h-4 mr-2" />
									{t('no_cases.button')}
								</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{requests.map((request) => (
							<Card 
								key={request.id} 
								className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 overflow-hidden"
							>
								<CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4">
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<div className="p-2 rounded-lg bg-primary/10 text-primary">
													{getStatusIcon(request.status)}
												</div>
												<div>
													<CardTitle className="text-xl font-bold text-gray-900">
														{request.vehicle.make} {request.vehicle.model} {request.vehicle.year}
													</CardTitle>
													<CardDescription className="flex items-center gap-2 mt-1">
														<Calendar className="w-3 h-3" />
														{t('created')} {formatDate(new Date(request.createdAt))}
													</CardDescription>
												</div>
											</div>
										</div>
										<div className="flex-shrink-0">
											{getStatusBadge(request.status)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-6">
									<div className="grid md:grid-cols-3 gap-6">
										{/* Vehicle Info */}
										<div className="space-y-3">
											<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
												<Car className="w-5 h-5 text-primary" />
												{t('vehicle_info')}
											</h4>
											<div className="space-y-2 pl-7">
												<div className="flex items-baseline gap-2">
													<span className="text-sm font-medium text-gray-700">
														{request.vehicle.make} {request.vehicle.model}
													</span>
												</div>
												<div className="text-sm text-gray-600">
													<span className="font-medium">{t('year')}:</span> {request.vehicle.year}
												</div>
												{request.description && (
													<div className="pt-2 border-t border-gray-200">
														<p className="text-sm text-gray-600 italic">{request.description}</p>
													</div>
												)}
											</div>
										</div>

										{/* Offers */}
										<div className="space-y-3">
											<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
												<Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
												{t('offers')} 
												<span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
													{request.offers.length}
												</span>
											</h4>
											{request.offers.length === 0 ? (
												<div className="pl-7">
													<p className="text-sm text-gray-500 italic">{t('no_offers')}</p>
												</div>
											) : (
												<div className="space-y-2 pl-7">
													{request.offers.slice(0, 2).map((offer) => (
														<div
															key={offer.id}
															className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
														>
															<div className="flex-1 min-w-0">
																<p className="font-semibold text-sm text-gray-900 truncate">
																	{offer.workshop.companyName}
																</p>
																<div className="flex items-center gap-1.5 mt-1">
																	<Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
																	<span className="text-xs font-medium text-gray-700">
																		{offer.workshop.rating.toFixed(1)}
																	</span>
																	<span className="text-xs text-gray-500">
																		({offer.workshop.reviewCount})
																	</span>
																</div>
															</div>
															<div className="ml-4 flex-shrink-0">
																<span className="font-bold text-base text-primary">
																	{formatPrice(offer.price)}
																</span>
															</div>
														</div>
													))}
													{request.offers.length > 2 && (
														<div className="pt-1">
															<p className="text-xs font-medium text-gray-500 text-center">
																+{request.offers.length - 2} {t('more_offers')}
															</p>
														</div>
													)}
												</div>
											)}
										</div>

										{/* Actions */}
										<div className="space-y-3">
											<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
												<Clock className="w-5 h-5 text-primary" />
												{t('actions')}
											</h4>
											<div className="space-y-2 pl-7">
												{(request.status === 'IN_BIDDING' || request.status === 'BIDDING_CLOSED') && (
													<Link href={`/${locale}/offers?requestId=${request.id}`} className="block">
														<Button 
															size="sm" 
															className="w-full shadow-sm hover:shadow-md transition-all" 
															variant={request.status === 'BIDDING_CLOSED' ? 'default' : 'outline'}
														>
															<Eye className="w-4 h-4 mr-2" />
															{request.status === 'BIDDING_CLOSED' ? t('choose_offer') : t('see_details')}
														</Button>
													</Link>
												)}
												{request.status === 'IN_BIDDING' && (
													<div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
														<Clock className="w-4 h-4 text-yellow-600" />
														<p>{t('status.in_bidding')}</p>
													</div>
												)}

												{request.status === 'BOOKED' && request.bookings.length > 0 && (
													<div className="space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
														<p className="font-semibold text-sm text-purple-900">{t('booked_for')}:</p>
														<div className="flex items-center gap-2 text-sm text-purple-700">
															<Calendar className="w-4 h-4" />
															<span>{formatDateTime(new Date(request.bookings[0].scheduledAt))}</span>
														</div>
														<div className="flex items-center gap-2 text-sm font-bold text-purple-900">
															<span>{formatPrice(request.bookings[0].totalAmount)}</span>
														</div>
													</div>
												)}

												{request.status === 'COMPLETED' && (
													<Button variant="outline" size="sm" className="w-full shadow-sm hover:shadow-md transition-all">
														<MessageSquare className="w-4 h-4 mr-2" />
														{t('leave_review')}
													</Button>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
