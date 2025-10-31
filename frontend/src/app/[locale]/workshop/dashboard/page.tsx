'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
	TrendingUp,
	Users,
	DollarSign,
} from 'lucide-react'

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
	const [requests, setRequests] = useState<Request[]>([])
	const [stats, setStats] = useState<WorkshopStats>({
		totalRequests: 0,
		activeOffers: 0,
		completedJobs: 0,
		totalRevenue: 0,
	})
	const [loading, setLoading] = useState(true)

	// Redirect if not authenticated or not a workshop
	if (status === 'loading') {
		return <div className="min-h-screen flex items-center justify-center">Laddar...</div>
	}

	if (!session || session.user.role !== 'WORKSHOP') {
		router.push('/auth/signin')
		return null
	}

	useEffect(() => {
		fetchData()
	}, [])

	const fetchData = async () => {
		try {
			const [requestsResponse, statsResponse] = await Promise.all([
				fetch('/api/requests'),
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
				title: 'Fel',
				description: 'Kunde inte hämta data',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const getStatusBadge = (status: string) => {
		const statusMap = {
			NEW: { label: 'Ny', variant: 'default' as const },
			IN_BIDDING: { label: 'Öppen för bud', variant: 'secondary' as const },
			BIDDING_CLOSED: { label: 'Stängd', variant: 'outline' as const },
			BOOKED: { label: 'Bokad', variant: 'default' as const },
			COMPLETED: { label: 'Klar', variant: 'default' as const },
			CANCELLED: { label: 'Avbruten', variant: 'destructive' as const },
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
					<p>Laddar dashboard...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Verkstadsdashboard</h1>
					<p className="text-gray-600 mt-2">Hantera dina förfrågningar och erbjudanden</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Totala förfrågningar</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalRequests}</div>
							<p className="text-xs text-muted-foreground">+12% från förra månaden</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Aktiva erbjudanden</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.activeOffers}</div>
							<p className="text-xs text-muted-foreground">Väntar på svar</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Genomförda jobb</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.completedJobs}</div>
							<p className="text-xs text-muted-foreground">Denna månad</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total omsättning</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
							<p className="text-xs text-muted-foreground">Denna månad</p>
						</CardContent>
					</Card>
				</div>

				{/* Requests */}
				<Card>
					<CardHeader>
						<CardTitle>Förfrågningar</CardTitle>
						<CardDescription>Nya förfrågningar som du kan skicka erbjudanden på</CardDescription>
					</CardHeader>
					<CardContent>
						{requests.length === 0 ? (
							<div className="text-center py-8">
								<Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
								<h3 className="text-lg font-semibold mb-2">Inga förfrågningar</h3>
								<p className="text-gray-600">
									Det finns inga nya förfrågningar just nu. Kom tillbaka senare.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{requests.map((request) => (
									<div key={request.id} className="border rounded-lg p-4">
										<div className="flex justify-between items-start mb-4">
											<div>
												<h3 className="font-semibold flex items-center gap-2">
													{getStatusIcon(request.status)}
													{request.vehicle.make} {request.vehicle.model} {request.vehicle.year}
												</h3>
												<p className="text-sm text-gray-600">
													Från {request.customer.name} • {formatDate(new Date(request.createdAt))}
												</p>
											</div>
											{getStatusBadge(request.status)}
										</div>

										<div className="grid md:grid-cols-3 gap-4">
											<div>
												<h4 className="font-medium text-sm mb-1">Bilinformation</h4>
												<p className="text-sm text-gray-600">
													{request.vehicle.make} {request.vehicle.model} {request.vehicle.year}
												</p>
												{request.description && (
													<p className="text-sm text-gray-600 mt-1">{request.description}</p>
												)}
											</div>

											<div>
												<h4 className="font-medium text-sm mb-1">Kundinformation</h4>
												<p className="text-sm text-gray-600">{request.customer.name}</p>
												<p className="text-sm text-gray-600">{request.customer.email}</p>
												{request.customer.phone && (
													<p className="text-sm text-gray-600">{request.customer.phone}</p>
												)}
											</div>

											<div>
												<h4 className="font-medium text-sm mb-1">Åtgärder</h4>
												<div className="space-y-2">
													<Button variant="outline" size="sm" className="w-full">
														<Eye className="w-4 h-4 mr-2" />
														Se detaljer
													</Button>

													{request.status === 'IN_BIDDING' && (
														<Button size="sm" className="w-full">
															Skicka erbjudande
														</Button>
													)}

													{request.offers.length > 0 && (
														<div className="text-sm">
															<p className="font-medium">Ditt erbjudande:</p>
															<p className="text-gray-600">
																{formatPrice(request.offers[0].price)}
															</p>
															<Badge
																variant={
																	request.offers[0].status === 'ACCEPTED' ? 'default' : 'secondary'
																}
															>
																{request.offers[0].status === 'ACCEPTED' ? 'Accepterat' : 'Väntar'}
															</Badge>
														</div>
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
