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
			NEW: { label: t('status.new'), variant: 'default' as const },
			IN_BIDDING: { label: t('status.in_bidding'), variant: 'secondary' as const },
			BIDDING_CLOSED: { label: t('status.bidding_closed'), variant: 'default' as const },
			BOOKED: { label: t('status.booked'), variant: 'default' as const },
			COMPLETED: { label: t('status.completed'), variant: 'default' as const },
			CANCELLED: { label: t('status.cancelled'), variant: 'destructive' as const },
		}

		const statusInfo = statusMap[status as keyof typeof statusMap] || {
			label: status,
			variant: 'default' as const,
		}

		return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="spinner mx-auto mb-4"></div>
					<p>{t('loading_cases')}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
						<p className="text-gray-600 mt-2">{t('subtitle')}</p>
					</div>
					<Link href={`/${locale}/upload`}>
						<Button>{t('new_request')}</Button>
					</Link>
				</div>

				{requests.length === 0 ? (
					<Card>
						<CardContent className="text-center py-12">
							<Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
							<h3 className="text-lg font-semibold mb-2">{t('no_cases.title')}</h3>
							<p className="text-gray-600 mb-6">{t('no_cases.description')}</p>
							<Link href={`/${locale}/upload`}>
								<Button>{t('no_cases.button')}</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{requests.map((request) => (
							<Card key={request.id}>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="flex items-center gap-2">
												{getStatusIcon(request.status)}
												{request.vehicle.make} {request.vehicle.model} {request.vehicle.year}
											</CardTitle>
											<CardDescription>
												{t('created')} {formatDate(new Date(request.createdAt))}
											</CardDescription>
										</div>
										{getStatusBadge(request.status)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid md:grid-cols-3 gap-6">
										{/* Vehicle Info */}
										<div>
											<h4 className="font-semibold mb-2 flex items-center gap-2">
												<Car className="w-4 h-4" />
												{t('vehicle_info')}
											</h4>
											<p className="text-sm text-gray-600">
												{request.vehicle.make} {request.vehicle.model}
											</p>
											<p className="text-sm text-gray-600">
												{t('year')}: {request.vehicle.year}
											</p>
											{request.description && (
												<p className="text-sm text-gray-600 mt-2">{request.description}</p>
											)}
										</div>

										{/* Offers */}
										<div>
											<h4 className="font-semibold mb-2 flex items-center gap-2">
												<Star className="w-4 h-4" />
												{t('offers')} ({request.offers.length})
											</h4>
											{request.offers.length === 0 ? (
												<p className="text-sm text-gray-500">{t('no_offers')}</p>
											) : (
												<div className="space-y-2">
													{request.offers.slice(0, 2).map((offer) => (
														<div
															key={offer.id}
															className="flex justify-between items-center p-2 bg-gray-50 rounded"
														>
															<div>
																<p className="font-medium text-sm">{offer.workshop.companyName}</p>
																<div className="flex items-center gap-1">
																	<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
																	<span className="text-xs text-gray-600">
																		{offer.workshop.rating.toFixed(1)} ({offer.workshop.reviewCount})
																	</span>
																</div>
															</div>
															<span className="font-semibold text-sm">{formatPrice(offer.price)}</span>
														</div>
													))}
													{request.offers.length > 2 && (
														<p className="text-xs text-gray-500">
															+{request.offers.length - 2} {t('more_offers')}
														</p>
													)}
												</div>
											)}
										</div>

										{/* Actions */}
										<div>
											<h4 className="font-semibold mb-2">{t('actions')}</h4>
											<div className="space-y-2">
												{(request.status === 'IN_BIDDING' || request.status === 'BIDDING_CLOSED') && (
													<Link href={`/${locale}/offers?requestId=${request.id}`}>
														<Button size="sm" className="w-full" variant={request.status === 'BIDDING_CLOSED' ? 'default' : 'outline'}>
															<Eye className="w-4 h-4 mr-2" />
															{request.status === 'BIDDING_CLOSED' ? t('choose_offer') : t('see_details')}
														</Button>
													</Link>
												)}
												{request.status === 'IN_BIDDING' && (
													<p className="text-sm text-gray-500">{t('status.in_bidding')}</p>
												)}

												{request.status === 'BOOKED' && request.bookings.length > 0 && (
													<div className="text-sm">
														<p className="font-medium">{t('booked_for')}:</p>
														<p className="text-gray-600">
															{formatDateTime(new Date(request.bookings[0].scheduledAt))}
														</p>
														<p className="text-gray-600">{formatPrice(request.bookings[0].totalAmount)}</p>
													</div>
												)}

												{request.status === 'COMPLETED' && (
													<Button variant="outline" size="sm" className="w-full">
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
