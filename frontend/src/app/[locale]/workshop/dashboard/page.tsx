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
import { useLocale, useTranslations } from 'next-intl'
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
	TrendingUp,
	Users,
	DollarSign,
} from 'lucide-react'
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
	customer: {
		name: string
		email: string
		phone?: string
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
}

interface WorkshopStats {
	totalRequests: number
	activeOffers: number
	completedJobs: number
	totalRevenue: number
}

export default function WorkshopDashboardPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { toast } = useToast()
	const locale = useLocale()
	const t = useTranslations('workshop.dashboard')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const [requests, setRequests] = useState<Request[]>([])
	const [stats, setStats] = useState<WorkshopStats>({
		totalRequests: 0,
		activeOffers: 0,
		completedJobs: 0,
		totalRevenue: 0,
	})
	const [loading, setLoading] = useState(true)

	const fetchData = async () => {
		try {
			const [requestsResponse, statsResponse] = await Promise.all([
				fetch('/api/requests/available'), // Fetch available requests for workshops
				fetch('/api/workshop/stats'),
			])

			if (requestsResponse.ok) {
				const requestsData = await requestsResponse.json()
				setRequests(requestsData)
			}

			if (statsResponse.ok) {
				const statsData = await statsResponse.json()
				setStats(statsData)
			}
		} catch (error) {
			console.error('Failed to fetch data:', error)
			toast({
				title: tCommon('error'),
				description: tErrors('fetch_failed'),
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	// Fetch data only if authenticated and workshop
	useEffect(() => {
		if (status === 'authenticated' && session?.user?.role === 'WORKSHOP') {
			fetchData()
		} else if (status === 'unauthenticated') {
			router.push(`/${locale}/auth/signin`)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, session?.user?.role, locale])

	// Redirect if not authenticated or not a workshop
	if (status === 'loading') {
		return <div className="min-h-screen flex items-center justify-center">{tCommon('loading')}</div>
	}

	if (!session || session.user.role !== 'WORKSHOP') {
		return null
	}

	const getStatusBadge = (status: string) => {
		const statusMap = {
			NEW: {
				label: t('status.new'),
				className: 'bg-blue-100 text-blue-800 border-blue-200 border',
			},
			IN_BIDDING: {
				label: t('status.in_bidding'),
				className: 'bg-yellow-100 text-yellow-800 border-yellow-200 border',
			},
			BIDDING_CLOSED: {
				label: t('status.bidding_closed'),
				className: 'bg-green-100 text-green-800 border-green-200 border',
			},
			BOOKED: {
				label: t('status.booked'),
				className: 'bg-purple-100 text-purple-800 border-purple-200 border',
			},
			COMPLETED: {
				label: t('status.completed'),
				className: 'bg-emerald-100 text-emerald-800 border-emerald-200 border',
			},
			CANCELLED: {
				label: t('status.cancelled'),
				className: 'bg-red-100 text-red-800 border-red-200 border',
			},
		}

		const statusInfo = statusMap[status as keyof typeof statusMap] || {
			label: status,
			className: 'bg-gray-100 text-gray-800 border-gray-200 border',
		}

		return (
			<Badge className={`${statusInfo.className} font-semibold px-3 py-1`}>
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
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
				<Navbar />
				<div className="text-center space-y-4">
					<div className="relative">
						<div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
						<Car className="w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
					</div>
					<p className="text-gray-600 font-medium text-lg">{t('loading')}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
			<Navbar />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
								{t('title')}
							</h1>
							<p className="text-gray-600 mt-2 text-lg">{t('subtitle')}</p>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-semibold text-blue-900">{t('stats.total_requests')}</CardTitle>
							<div className="p-2 bg-blue-500 rounded-lg">
								<Users className="h-5 w-5 text-white" />
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="text-3xl font-bold text-blue-900 mb-1">{stats.totalRequests}</div>
							<p className="text-xs text-blue-700 font-medium">{t('stats.total_requests_desc')}</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
						<div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-50"></div>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-semibold text-green-900">{t('stats.active_offers')}</CardTitle>
							<div className="p-2 bg-green-500 rounded-lg">
								<TrendingUp className="h-5 w-5 text-white" />
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="text-3xl font-bold text-green-900 mb-1">{stats.activeOffers}</div>
							<p className="text-xs text-green-700 font-medium">{t('stats.active_offers_desc')}</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
						<div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-semibold text-purple-900">{t('stats.completed_jobs')}</CardTitle>
							<div className="p-2 bg-purple-500 rounded-lg">
								<CheckCircle className="h-5 w-5 text-white" />
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="text-3xl font-bold text-purple-900 mb-1">{stats.completedJobs}</div>
							<p className="text-xs text-purple-700 font-medium">{t('stats.completed_jobs_desc')}</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100">
						<div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-50"></div>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle className="text-sm font-semibold text-amber-900">{t('stats.total_revenue')}</CardTitle>
							<div className="p-2 bg-amber-500 rounded-lg">
								<DollarSign className="h-5 w-5 text-white" />
							</div>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="text-3xl font-bold text-amber-900 mb-1">{formatPrice(stats.totalRevenue)}</div>
							<p className="text-xs text-amber-700 font-medium">{t('stats.total_revenue_desc')}</p>
						</CardContent>
					</Card>
				</div>

				{/* Requests */}
				<Card className="shadow-xl border-0">
					<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
						<div className="flex justify-between items-center">
							<div>
								<CardTitle className="text-2xl font-bold text-gray-900">{t('requests.title')}</CardTitle>
								<CardDescription className="text-gray-600 mt-1">{t('requests.subtitle')}</CardDescription>
							</div>
							<Link href={`/${locale}/workshop/requests`}>
								<Button variant="outline" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
									<Eye className="w-4 h-4 mr-2" />
									{t('requests.view_all')}
								</Button>
							</Link>
						</div>
					</CardHeader>
					<CardContent className="p-6">
						{requests.length === 0 ? (
							<div className="text-center py-16">
								<div className="relative inline-block">
									<div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-30"></div>
									<Car className="w-20 h-20 mx-auto mb-6 text-gray-400 relative z-10" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-gray-900">{t('requests.no_requests.title')}</h3>
								<p className="text-gray-600 max-w-md mx-auto">
									{t('requests.no_requests.description')}
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{requests.map((request) => (
									<div
										key={request.id}
										className="border-2 rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-300 hover:border-primary/50"
									>
										<div className="flex justify-between items-start mb-6">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-2">
													<div className="p-2 bg-blue-100 rounded-lg">
														{getStatusIcon(request.status)}
													</div>
													<h3 className="text-xl font-bold text-gray-900">
														{request.vehicle.make} {request.vehicle.model} {request.vehicle.year}
													</h3>
												</div>
												<div className="flex items-center gap-2 text-sm text-gray-600 ml-12">
													<Users className="w-4 h-4" />
													<span>{t('requests.from')} {request.customer.name}</span>
													<span>•</span>
													<Clock className="w-4 h-4" />
													<span>{formatDate(new Date(request.createdAt))}</span>
												</div>
											</div>
											<div className="ml-4">
												{getStatusBadge(request.status)}
											</div>
										</div>

										<div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
											<div className="space-y-2">
												<div className="flex items-center gap-2 mb-2">
													<Car className="w-4 h-4 text-blue-600" />
													<h4 className="font-semibold text-sm text-gray-900">{t('requests.vehicle_info')}</h4>
												</div>
												<p className="text-sm font-medium text-gray-900">
													{request.vehicle.make} {request.vehicle.model}
												</p>
												<p className="text-sm text-gray-600">
													{t('requests.year')}: {request.vehicle.year}
												</p>
												{request.description && (
													<p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-md">
														{request.description}
													</p>
												)}
											</div>

											<div className="space-y-2">
												<div className="flex items-center gap-2 mb-2">
													<Users className="w-4 h-4 text-green-600" />
													<h4 className="font-semibold text-sm text-gray-900">{t('requests.customer_info')}</h4>
												</div>
												<p className="text-sm font-medium text-gray-900">{request.customer.name}</p>
												<p className="text-sm text-gray-600">{request.customer.email}</p>
												{request.customer.phone && (
													<p className="text-sm text-gray-600">{request.customer.phone}</p>
												)}
											</div>

											<div className="space-y-3">
												<h4 className="font-semibold text-sm text-gray-900 mb-2">{t('requests.actions')}</h4>
												<div className="space-y-2">
													{request.status === 'IN_BIDDING' && !request.offers.length && (
														<Link href={`/${locale}/workshop/requests/${request.id}/offer`} className="block">
															<Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
																<MessageSquare className="w-4 h-4 mr-2" />
																{t('requests.send_offer')}
															</Button>
														</Link>
													)}
													{request.status === 'IN_BIDDING' && request.offers.length > 0 && (
														<Link href={`/${locale}/workshop/requests`} className="block">
															<Button variant="outline" size="sm" className="w-full">
																<Eye className="w-4 h-4 mr-2" />
																{t('requests.view_my_offer')}
															</Button>
														</Link>
													)}

													{request.offers.length > 0 && (
														<div className="p-3 bg-green-50 rounded-lg border border-green-200">
															<p className="text-xs font-semibold text-green-900 mb-1">{t('requests.your_offer')}</p>
															<p className="text-lg font-bold text-green-700 mb-2">
																{formatPrice(request.offers[0].price)}
															</p>
															<Badge
																className={
																	request.offers[0].status === 'ACCEPTED'
																		? 'bg-green-600 text-white'
																		: 'bg-yellow-100 text-yellow-800 border-yellow-300'
																}
															>
																{request.offers[0].status === 'ACCEPTED' ? t('requests.offer_accepted') : t('requests.offer_pending')}
															</Badge>
														</div>
													)}

													{request.status === 'IN_BIDDING' && request.offers.length === 0 && (
														<Button variant="outline" size="sm" className="w-full">
															<Eye className="w-4 h-4 mr-2" />
															{t('requests.view_details')}
														</Button>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
