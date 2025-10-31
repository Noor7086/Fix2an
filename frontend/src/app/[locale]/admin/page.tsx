'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate } from '@/lib/utils'
import {
	Users,
	Building2,
	FileText,
	DollarSign,
	TrendingUp,
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
} from 'lucide-react'

interface AdminStats {
	totalCustomers: number
	totalWorkshops: number
	pendingWorkshops: number
	totalRequests: number
	totalBookings: number
	totalRevenue: number
	monthlyRevenue: number
}

interface PendingWorkshop {
	id: string
	companyName: string
	email: string
	createdAt: string
	documents: Array<{
		type: string
		fileName: string
	}>
}

export default function AdminPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { toast } = useToast()
	const [stats, setStats] = useState<AdminStats>({
		totalCustomers: 0,
		totalWorkshops: 0,
		pendingWorkshops: 0,
		totalRequests: 0,
		totalBookings: 0,
		totalRevenue: 0,
		monthlyRevenue: 0,
	})
	const [pendingWorkshops, setPendingWorkshops] = useState<PendingWorkshop[]>([])
	const [loading, setLoading] = useState(true)

	// Redirect if not authenticated or not admin
	if (status === 'loading') {
		return <div className="min-h-screen flex items-center justify-center">Laddar...</div>
	}

	if (!session || session.user.role !== 'ADMIN') {
		router.push('/auth/signin')
		return null
	}

	useEffect(() => {
		fetchData()
	}, [])

	const fetchData = async () => {
		try {
			const [statsResponse, workshopsResponse] = await Promise.all([
				fetch('/api/admin/stats'),
				fetch('/api/admin/pending-workshops'),
			])

			if (statsResponse.ok) {
				const statsData = await statsResponse.json()
				setStats(statsData)
			}

			if (workshopsResponse.ok) {
				const workshopsData = await workshopsResponse.json()
				setPendingWorkshops(workshopsData)
			}
		} catch (error) {
			console.error('Failed to fetch admin data:', error)
			toast({
				title: 'Fel',
				description: 'Kunde inte hämta data',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleWorkshopApproval = async (workshopId: string, approved: boolean) => {
		try {
			const response = await fetch('/api/admin/workshop-approval', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					workshopId,
					approved,
				}),
			})

			if (response.ok) {
				toast({
					title: approved ? 'Verkstad godkänd' : 'Verkstad avvisad',
					description: approved
						? 'Verkstaden har godkänts och kan nu ta emot förfrågningar'
						: 'Verkstaden har avvisats',
				})
				fetchData() // Refresh data
			} else {
				throw new Error('Failed to update workshop')
			}
		} catch (error) {
			toast({
				title: 'Fel',
				description: 'Kunde inte uppdatera verkstaden',
				variant: 'destructive',
			})
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="spinner mx-auto mb-4"></div>
					<p>Laddar admin panel...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
					<p className="text-gray-600 mt-2">Hantera systemet och övervaka aktivitet</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Kunder</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalCustomers}</div>
							<p className="text-xs text-muted-foreground">Registrerade användare</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Verkstäder</CardTitle>
							<Building2 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalWorkshops}</div>
							<p className="text-xs text-muted-foreground">
								{stats.pendingWorkshops} väntar på godkännande
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Förfrågningar</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalRequests}</div>
							<p className="text-xs text-muted-foreground">Totalt antal förfrågningar</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Månadsomsättning</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
							<p className="text-xs text-muted-foreground">Denna månad</p>
						</CardContent>
					</Card>
				</div>

				{/* Pending Workshops */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="w-5 h-5" />
							Verkstäder som väntar på godkännande
						</CardTitle>
						<CardDescription>Granska och godkänn nya verkstäder</CardDescription>
					</CardHeader>
					<CardContent>
						{pendingWorkshops.length === 0 ? (
							<div className="text-center py-8">
								<CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
								<h3 className="text-lg font-semibold mb-2">Alla verkstäder är godkända</h3>
								<p className="text-gray-600">
									Det finns inga verkstäder som väntar på godkännande.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{pendingWorkshops.map((workshop) => (
									<div key={workshop.id} className="border rounded-lg p-4">
										<div className="flex justify-between items-start mb-4">
											<div>
												<h3 className="font-semibold">{workshop.companyName}</h3>
												<p className="text-sm text-gray-600">{workshop.email}</p>
												<p className="text-sm text-gray-500">
													Registrerad {formatDate(new Date(workshop.createdAt))}
												</p>
											</div>
											<Badge variant="secondary">Väntar på godkännande</Badge>
										</div>

										<div className="grid md:grid-cols-2 gap-4 mb-4">
											<div>
												<h4 className="font-medium text-sm mb-2">Uppladdade dokument</h4>
												<div className="space-y-1">
													{workshop.documents.map((doc, index) => (
														<div key={index} className="flex items-center gap-2 text-sm">
															<FileText className="w-4 h-4" />
															<span>{doc.fileName}</span>
															<Badge variant="outline" className="text-xs">
																{doc.type}
															</Badge>
														</div>
													))}
												</div>
											</div>
										</div>

										<div className="flex gap-2">
											<Button
												size="sm"
												onClick={() => handleWorkshopApproval(workshop.id, true)}
												className="bg-green-600 hover:bg-green-700"
											>
												<CheckCircle className="w-4 h-4 mr-2" />
												Godkänn
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => handleWorkshopApproval(workshop.id, false)}
											>
												<XCircle className="w-4 h-4 mr-2" />
												Avvisa
											</Button>
											<Button size="sm" variant="outline">
												Se detaljer
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<div className="grid md:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Hantera användare</CardTitle>
							<CardDescription>Visa och hantera kunder och verkstäder</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full">
								<Users className="w-4 h-4 mr-2" />
								Visa alla användare
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Rapporter</CardTitle>
							<CardDescription>Visa systemrapporter och statistik</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full" variant="outline">
								<TrendingUp className="w-4 h-4 mr-2" />
								Visa rapporter
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Systeminställningar</CardTitle>
							<CardDescription>Konfigurera systemparametrar</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full" variant="outline">
								<Clock className="w-4 h-4 mr-2" />
								Inställningar
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
