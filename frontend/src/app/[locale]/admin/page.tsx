'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
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
	Search,
	Download,
	Eye,
	Ban,
	Unlock,
	Shield,
	Calendar,
	Package,
	CreditCard,
	Filter,
	RefreshCw,
	LogOut,
	ChevronDown,
} from 'lucide-react'

type TabType = 'dashboard' | 'customers' | 'workshops' | 'requests' | 'offers' | 'bookings' | 'payouts'

interface AdminStats {
	totalCustomers: number
	totalWorkshops: number
	pendingWorkshops: number
	totalRequests: number
	totalBookings: number
	totalRevenue: number
	monthlyRevenue: number
}

export default function AdminPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const locale = useLocale()
	const t = useTranslations('admin')
	const { toast } = useToast()
	const [activeTab, setActiveTab] = useState<TabType>('dashboard')
	const [loading, setLoading] = useState(true)
	const [listLoading, setListLoading] = useState(false)
	const [stats, setStats] = useState<AdminStats>({
		totalCustomers: 0,
		totalWorkshops: 0,
		pendingWorkshops: 0,
		totalRequests: 0,
		totalBookings: 0,
		totalRevenue: 0,
		monthlyRevenue: 0,
	})

	// Data states
	const [customers, setCustomers] = useState<any[]>([])
	const [workshops, setWorkshops] = useState<any[]>([])
	const [requests, setRequests] = useState<any[]>([])
	const [offers, setOffers] = useState<any[]>([])
	const [bookings, setBookings] = useState<any[]>([])
	const [payouts, setPayouts] = useState<any[]>([])

	// Filter states
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

	// Payout generation
	const [payoutMonth, setPayoutMonth] = useState(new Date().getMonth() + 1)
	const [payoutYear, setPayoutYear] = useState(new Date().getFullYear())
	const [generating, setGenerating] = useState(false)
	const [adminMenuOpen, setAdminMenuOpen] = useState(false)
	const adminMenuRef = useRef<HTMLDivElement>(null)

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
				setAdminMenuOpen(false)
			}
		}

		if (adminMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [adminMenuOpen])

	// Redirect if not authenticated or not admin
	useEffect(() => {
		if (status === 'loading') return
		if (!session || (session.user as any)?.role !== 'ADMIN') {
			router.push(`/${locale}/auth/signin`)
		}
	}, [session, status, router, locale])

	useEffect(() => {
		if (session && (session.user as any)?.role === 'ADMIN') {
			fetchStats()
			if (activeTab === 'dashboard') {
				fetchPendingWorkshops()
			}
		}
	}, [session, activeTab])

	// Update data when filters change
	useEffect(() => {
		if (session && (session.user as any)?.role === 'ADMIN') {
			// For customers tab, add a small debounce to avoid too many API calls while typing
			if (activeTab === 'customers') {
				const timeoutId = setTimeout(() => {
					fetchTabData()
				}, 200)
				return () => clearTimeout(timeoutId)
			} else {
				// For other tabs, fetch immediately
				fetchTabData()
			}
		}
	}, [activeTab, searchQuery, statusFilter, pagination.page])

	const fetchStats = async () => {
		try {
			const response = await fetch('/api/admin/stats')
			if (response.ok) {
				const data = await response.json()
				setStats(data)
			}
		} catch (error) {
			console.error('Failed to fetch stats:', error)
		} finally {
			setLoading(false)
		}
	}

	const fetchPendingWorkshops = async () => {
		try {
			const response = await fetch('/api/admin/pending-workshops')
			if (response.ok) {
				const data = await response.json()
				setWorkshops(data)
			}
		} catch (error) {
			console.error('Failed to fetch pending workshops:', error)
		}
	}

	const fetchTabData = async () => {
		setListLoading(true)
		try {
			const params = new URLSearchParams()
			if (searchQuery) params.append('search', searchQuery)
			if (statusFilter !== 'all') params.append('status', statusFilter)
			params.append('page', pagination.page.toString())
			params.append('limit', pagination.limit.toString())

			let endpoint = ''
			switch (activeTab) {
				case 'customers':
					endpoint = '/api/admin/users'
					break
				case 'workshops':
					endpoint = '/api/admin/workshops'
					if (statusFilter === 'pending') {
						params.append('verified', 'false')
					}
					break
				case 'requests':
					endpoint = '/api/admin/requests'
					break
				case 'offers':
					endpoint = '/api/admin/offers'
					break
				case 'bookings':
					endpoint = '/api/admin/bookings'
					break
				case 'payouts':
					endpoint = '/api/admin/payouts'
					break
			}

			if (endpoint) {
				const response = await fetch(`${endpoint}?${params.toString()}`)
				if (response.ok) {
					const data = await response.json()
					switch (activeTab) {
						case 'customers':
							setCustomers(data.users || [])
							setPagination((p) => ({ ...p, total: data.total || 0 }))
							break
						case 'workshops':
							setWorkshops(data.workshops || [])
							setPagination((p) => ({ ...p, total: data.total || 0 }))
							break
						case 'requests':
							setRequests(data.requests || [])
							setPagination((p) => ({ ...p, total: data.total || 0 }))
							break
						case 'offers':
							setOffers(data.offers || [])
							setPagination((p) => ({ ...p, total: data.total || 0 }))
							break
						case 'bookings':
							setBookings(data.bookings || [])
							setPagination((p) => ({ ...p, total: data.total || 0 }))
							break
						case 'payouts':
							setPayouts(data.reports || [])
							setPagination((p) => ({ ...p, total: data.total || 0 }))
							break
					}
				}
			}
		} catch (error) {
			console.error('Failed to fetch data:', error)
			toast({
				title: t('common.error'),
				description: t('common.could_not_fetch'),
				variant: 'destructive',
			})
		} finally {
			setListLoading(false)
		}
	}

	const handleWorkshopAction = async (workshopId: string, action: 'approve' | 'reject' | 'block' | 'unblock') => {
		try {
			let updateData: any = {}
			if (action === 'approve') updateData.isVerified = true
			if (action === 'reject') updateData.isVerified = false
			if (action === 'block') updateData.isActive = false
			if (action === 'unblock') updateData.isActive = true

			const response = await fetch('/api/admin/workshops', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: workshopId, ...updateData }),
			})

			if (response.ok) {
				const actionKey = action === 'approve' ? 'workshop_approved' : action === 'reject' ? 'workshop_rejected' : action === 'block' ? 'workshop_blocked' : 'workshop_unblocked'
				toast({
					title: t('common.success'),
					description: t(`common.${actionKey}`),
				})
				
				// Immediately remove from pending workshops list if approve/reject
				if (action === 'approve' || action === 'reject') {
					setWorkshops((prev) => prev.filter((w) => w.id !== workshopId))
				}
				
				// Update stats and tab data
				fetchStats()
				if (activeTab !== 'dashboard') {
					fetchTabData()
				} else {
					// Refresh pending workshops for dashboard
					fetchPendingWorkshops()
				}
			}
		} catch (error) {
			toast({
				title: t('common.error'),
				description: t('common.failed_update_workshop'),
				variant: 'destructive',
			})
		}
	}

	const handleGeneratePayouts = async () => {
		setGenerating(true)
		try {
			const response = await fetch('/api/admin/payouts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ month: payoutMonth, year: payoutYear }),
			})

			if (response.ok) {
				const data = await response.json()
				const count = data.count || 0
				toast({
					title: t('common.success'),
					description: count === 1 
						? t('common.generated_reports_one')
						: t('common.generated_reports_other').replace('{count}', count.toString()),
				})
				fetchTabData()
			}
		} catch (error) {
			toast({
				title: t('common.error'),
				description: t('common.failed_generate_reports'),
				variant: 'destructive',
			})
		} finally {
			setGenerating(false)
		}
	}

	const handleMarkPayoutPaid = async (payoutId: string) => {
		try {
			const response = await fetch(`/api/admin/payouts/${payoutId}/mark-paid`, {
				method: 'PATCH',
			})

			if (response.ok) {
				toast({
					title: t('common.success'),
					description: t('common.payout_marked_paid'),
				})
				fetchTabData()
			}
		} catch (error) {
			toast({
				title: t('common.error'),
				description: t('common.failed_mark_paid'),
				variant: 'destructive',
			})
		}
	}

	const handleLogout = async () => {
		await signOut({ redirect: false })
		router.push(`/${locale}`)
		setAdminMenuOpen(false)
	}

	const exportToCSV = (data: any[], filename: string) => {
		if (data.length === 0) return

		const headers = Object.keys(data[0])
		const csv = [
			headers.join(','),
			...data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')),
		].join('\n')

		const blob = new Blob([csv], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		a.click()
		window.URL.revokeObjectURL(url)
	}

		if (status === 'loading' || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#1C3F94' }} />
					<p className="text-gray-600">{t('common.loading')}</p>
				</div>
			</div>
		)
	}

	if (!session || (session.user as any)?.role !== 'ADMIN') {
		return null
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
			{/* Header with gradient */}
			<div className="relative overflow-hidden" style={{ backgroundColor: '#1C3F94' }}>
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ backgroundColor: '#34C759', filter: 'blur(100px)' }}></div>
					<div className="absolute bottom-0 left-0 w-96 h-96 rounded-full" style={{ backgroundColor: '#FFFFFF', filter: 'blur(100px)' }}></div>
				</div>
				<div className="relative px-4 sm:px-6 py-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white">
								{t('title')}
							</h1>
							<p className="text-white/90 text-lg">{t('subtitle')}</p>
						</div>
						<div className="hidden md:flex items-center gap-4">
							<div className="[&_*]:text-white [&_button]:bg-white/10 [&_button]:backdrop-blur-sm [&_button]:border-white/20 [&_button:hover]:bg-white/20">
								<LanguageSwitcher />
							</div>
							<div className="relative" ref={adminMenuRef}>
								<button
									onClick={() => setAdminMenuOpen(!adminMenuOpen)}
									className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
								>
									<Shield className="w-5 h-5 text-white" />
									<span className="text-white font-semibold">{t('common.admin')}</span>
									<ChevronDown className={`w-4 h-4 text-white transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
								</button>
								{adminMenuOpen && (
									<div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
										<button
											onClick={handleLogout}
											className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-red-50 hover:text-red-600 transition-colors"
										>
											<LogOut className="w-4 h-4" />
											<span className="font-medium">{t('common.logout')}</span>
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 sm:px-6 -mt-6">
				{/* Tabs */}
				<Card className="mb-6 shadow-lg border-0 mt-8">
					<div className="flex space-x-1 overflow-x-auto p-4">
						{(['dashboard', 'customers', 'workshops', 'requests', 'offers', 'bookings', 'payouts'] as TabType[]).map(
							(tab) => (
								<button
									key={tab}
									onClick={() => {
										setActiveTab(tab)
										setSearchQuery('')
										setStatusFilter('all')
										setPagination({ ...pagination, page: 1 })
									}}
									className={`px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
										activeTab === tab
											? 'shadow-md'
											: 'hover:bg-gray-100'
									}`}
									style={
										activeTab === tab
											? {
													backgroundColor: '#1C3F94',
													color: '#FFFFFF',
											  }
											: {
													color: '#666666',
											  }
									}
								>
									{t(`tabs.${tab}`)}
								</button>
							),
						)}
					</div>
				</Card>

				{/* Dashboard Tab */}
				{activeTab === 'dashboard' && (
					<div className="space-y-6">
				{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden group">
								<div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#1C3F94', transform: 'translate(30%, -30%)' }}></div>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
									<CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('stats.customers')}</CardTitle>
									<div className="p-2 rounded-lg" style={{ backgroundColor: '#1C3F94', color: '#FFFFFF' }}>
										<Users className="h-5 w-5" />
									</div>
						</CardHeader>
								<CardContent className="relative z-10">
									<div className="text-4xl font-extrabold mb-1" style={{ color: '#1C3F94' }}>
										{stats.totalCustomers}
									</div>
									<p className="text-xs text-gray-500">{t('common.total_registered')}</p>
						</CardContent>
					</Card>

							<Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden group">
								<div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#1C3F94', transform: 'translate(30%, -30%)' }}></div>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
									<CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('stats.workshops')}</CardTitle>
									<div className="p-2 rounded-lg" style={{ backgroundColor: '#1C3F94', color: '#FFFFFF' }}>
										<Building2 className="h-5 w-5" />
									</div>
						</CardHeader>
								<CardContent className="relative z-10">
									<div className="text-4xl font-extrabold mb-1" style={{ color: '#1C3F94' }}>
										{stats.totalWorkshops}
									</div>
									<p className="text-xs text-gray-500">
										{stats.pendingWorkshops} {t('stats.pending_workshops')}
							</p>
						</CardContent>
					</Card>

							<Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden group">
								<div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#34C759', transform: 'translate(30%, -30%)' }}></div>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
									<CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('stats.requests')}</CardTitle>
									<div className="p-2 rounded-lg" style={{ backgroundColor: '#34C759', color: '#FFFFFF' }}>
										<FileText className="h-5 w-5" />
									</div>
						</CardHeader>
								<CardContent className="relative z-10">
									<div className="text-4xl font-extrabold mb-1" style={{ color: '#34C759' }}>
										{stats.totalRequests}
									</div>
									<p className="text-xs text-gray-500">{t('common.active_requests')}</p>
						</CardContent>
					</Card>

							<Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden group">
								<div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#34C759', transform: 'translate(30%, -30%)' }}></div>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
									<CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t('stats.monthly_revenue')}</CardTitle>
									<div className="p-2 rounded-lg" style={{ backgroundColor: '#34C759', color: '#FFFFFF' }}>
										<DollarSign className="h-5 w-5" />
									</div>
						</CardHeader>
								<CardContent className="relative z-10">
									<div className="text-4xl font-extrabold mb-1" style={{ color: '#34C759' }}>
										{formatPrice(stats.monthlyRevenue)}
									</div>
									<p className="text-xs text-gray-500">{t('common.this_month')}</p>
						</CardContent>
					</Card>
				</div>

				{/* Pending Workshops */}
						<Card className="border-0 shadow-lg">
							<CardHeader className="pb-4" style={{ borderBottom: '2px solid #F0F0F0' }}>
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg" style={{ backgroundColor: '#1C3F94', color: '#FFFFFF' }}>
							<AlertTriangle className="w-5 h-5" />
									</div>
									<div>
										<CardTitle className="text-xl font-bold" style={{ color: '#1C3F94' }}>
											{t('workshops.pending_workshops')}
						</CardTitle>
										<CardDescription className="mt-1">{t('common.review_approve')}</CardDescription>
									</div>
								</div>
					</CardHeader>
							<CardContent className="pt-6">
								{workshops.filter((w) => !w.isVerified).length === 0 ? (
									<div className="text-center py-12">
										<div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#34C759', color: '#FFFFFF' }}>
											<CheckCircle className="w-10 h-10" />
										</div>
										<h3 className="text-xl font-bold mb-2" style={{ color: '#333333' }}>{t('workshops.no_pending')}</h3>
										<p className="text-gray-500">{t('common.all_approved')}</p>
							</div>
						) : (
							<div className="space-y-4">
										{workshops
											.filter((w) => !w.isVerified)
											.map((workshop) => (
												<div key={workshop.id} className="border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300" style={{ borderColor: '#E5E7EB' }}>
										<div className="flex justify-between items-start mb-4">
														<div className="flex-1">
															<div className="flex items-center gap-3 mb-2">
																<h3 className="font-bold text-xl" style={{ color: '#1C3F94' }}>{workshop.companyName}</h3>
																<Badge className="px-3 py-1" style={{ backgroundColor: '#FFF3CD', color: '#856404', border: 'none' }}>{t('common.pending')}</Badge>
															</div>
															<div className="space-y-1">
																<p className="text-sm text-gray-600 flex items-center gap-2">
																	<span className="font-medium">{t('customers.email')}:</span> {workshop.email}
																</p>
																<p className="text-sm text-gray-500 flex items-center gap-2">
																	<Clock className="w-4 h-4" />
																	{t('common.registered')} {formatDate(new Date(workshop.createdAt))}
												</p>
											</div>
														</div>
														<div className="flex gap-2 ml-4">
											<Button
												size="sm"
															onClick={() => handleWorkshopAction(workshop.id, 'approve')}
															className="font-medium shadow-sm hover:shadow-md transition-all duration-200 rounded-md px-5 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 hover:text-green-800"
											>
												<CheckCircle className="w-4 h-4 mr-1.5" />
															{t('workshops.approve')}
											</Button>
											<Button
												size="sm"
															onClick={() => handleWorkshopAction(workshop.id, 'reject')}
															className="font-medium shadow-sm hover:shadow-md transition-all duration-200 rounded-md px-5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800"
											>
												<XCircle className="w-4 h-4 mr-1.5" />
															{t('workshops.reject')}
											</Button>
										</div>
												</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
					</div>
				)}

				{/* Customers Tab */}
				{activeTab === 'customers' && (
					<div className="space-y-6">
						<Card className="border-0 shadow-lg">
							<CardHeader className="pb-4" style={{ borderBottom: '2px solid #F0F0F0' }}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-lg" style={{ backgroundColor: '#1C3F94', color: '#FFFFFF' }}>
											<Users className="w-5 h-5" />
										</div>
										<div>
											<CardTitle className="text-xl font-bold" style={{ color: '#1C3F94' }}>{t('customers.title')}</CardTitle>
										</div>
									</div>
									<div className="flex-1 max-w-md relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
										<Input
											placeholder={t('customers.search')}
											value={searchQuery}
											onChange={(e) => {
												setSearchQuery(e.target.value)
												setPagination({ ...pagination, page: 1 })
											}}
											className="pl-10 h-11 border-2 focus:border-blue-500"
										/>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-6">
								{listLoading ? (
									<div className="text-center py-12">
										<RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: '#1C3F94' }} />
										<p className="text-gray-600">{t('common.loading_customers')}</p>
									</div>
								) : customers.length === 0 ? (
									<div className="text-center py-12">
										<div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#F0F0F0' }}>
											<Users className="w-10 h-10 text-gray-400" />
										</div>
										<h3 className="text-xl font-bold mb-2" style={{ color: '#333333' }}>{t('customers.no_customers')}</h3>
										<p className="text-gray-500">{t('common.no_customers_search')}</p>
									</div>
								) : (
									<div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
										<table className="w-full">
											<thead>
												<tr style={{ backgroundColor: '#F9FAFB' }}>
													<th className="text-left p-4 font-bold text-sm uppercase tracking-wide" style={{ color: '#1C3F94' }}>{t('customers.name')}</th>
													<th className="text-left p-4 font-bold text-sm uppercase tracking-wide" style={{ color: '#1C3F94' }}>{t('customers.email')}</th>
													<th className="text-left p-4 font-bold text-sm uppercase tracking-wide" style={{ color: '#1C3F94' }}>{t('customers.phone')}</th>
													<th className="text-left p-4 font-bold text-sm uppercase tracking-wide" style={{ color: '#1C3F94' }}>{t('customers.city')}</th>
													<th className="text-left p-4 font-bold text-sm uppercase tracking-wide" style={{ color: '#1C3F94' }}>{t('customers.requests')}</th>
													<th className="text-left p-4 font-bold text-sm uppercase tracking-wide" style={{ color: '#1C3F94' }}>{t('customers.bookings')}</th>
													<th className="text-left p-4 font-bold text-sm uppercase tracking-wide" style={{ color: '#1C3F94' }}>{t('customers.status')}</th>
												</tr>
											</thead>
											<tbody>
												{customers.map((customer, index) => (
													<tr key={customer.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} style={{ borderColor: '#E5E7EB' }}>
														<td className="p-4 font-medium">{customer.name || '-'}</td>
														<td className="p-4 text-gray-700">{customer.email}</td>
														<td className="p-4 text-gray-600">{customer.phone || '-'}</td>
														<td className="p-4 text-gray-600">{customer.city || '-'}</td>
														<td className="p-4">
															<span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#E3F2FD', color: '#1C3F94' }}>
																{customer._count?.requests || 0}
															</span>
														</td>
														<td className="p-4">
															<span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#E8F5E9', color: '#34C759' }}>
																{customer._count?.bookings || 0}
															</span>
														</td>
														<td className="p-4">
															<Badge className="px-3 py-1 font-semibold" variant={customer.isActive ? 'default' : 'secondary'} style={customer.isActive ? { backgroundColor: '#34C759', color: '#FFFFFF' } : {}}>
																{customer.isActive ? t('customers.active') : t('customers.inactive')}
															</Badge>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Workshops Tab */}
				{activeTab === 'workshops' && (
					<div className="space-y-6">
					<Card>
						<CardHeader>
								<CardTitle>{t('workshops.title')}</CardTitle>
								<div className="flex gap-4 mt-4">
									<div className="flex-1 relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											placeholder={t('workshops.search')}
											value={searchQuery}
											onChange={(e) => {
												setSearchQuery(e.target.value)
												setPagination({ ...pagination, page: 1 })
											}}
											className="pl-10"
										/>
									</div>
									<Select
										value={statusFilter}
										onValueChange={(value) => {
											setStatusFilter(value)
											setPagination({ ...pagination, page: 1 })
										}}
									>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">{t('filters.all')}</SelectItem>
											<SelectItem value="verified">{t('workshops.verified')}</SelectItem>
											<SelectItem value="pending">{t('common.pending')}</SelectItem>
											<SelectItem value="active">{t('workshops.active')}</SelectItem>
											<SelectItem value="blocked">{t('workshops.blocked')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
						</CardHeader>
						<CardContent>
								{listLoading ? (
									<div className="text-center py-8">
										<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#1C3F94' }} />
										<p className="text-gray-600">{t('common.loading')}</p>
									</div>
								) : workshops.length === 0 ? (
									<div className="text-center py-8">
										<Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
										<p className="text-gray-600">{t('workshops.no_workshops')}</p>
									</div>
								) : (
									<div className="space-y-4">
										{workshops.map((workshop) => (
											<div key={workshop.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
												<div className="flex justify-between items-start mb-4">
													<div className="flex-1">
														<h3 className="font-semibold text-lg">{workshop.companyName}</h3>
														<p className="text-sm text-gray-600">{workshop.email}</p>
														<p className="text-sm text-gray-500">{workshop.organizationNumber}</p>
														<div className="flex gap-4 mt-2">
															<span className="text-sm">
																{t('workshops.offers')}: {workshop._count?.offers || 0}
															</span>
															<span className="text-sm">
																{t('workshops.bookings')}: {workshop._count?.bookings || 0}
															</span>
															<span className="text-sm">
																{t('workshops.reviews')}: {workshop._count?.reviews || 0}
															</span>
														</div>
													</div>
													<div className="flex gap-2">
														{workshop.isVerified ? (
															<Badge style={{ backgroundColor: '#34C759', color: '#FFFFFF' }}>
																{t('workshops.verified')}
															</Badge>
														) : (
															<Badge variant="secondary">{t('workshops.not_verified')}</Badge>
														)}
														{workshop.isActive ? (
															<Badge variant="default">{t('workshops.active')}</Badge>
														) : (
															<Badge variant="destructive">{t('workshops.blocked')}</Badge>
														)}
													</div>
												</div>
												<div className="flex gap-2">
													{!workshop.isVerified && (
														<Button
															size="sm"
															onClick={() => handleWorkshopAction(workshop.id, 'approve')}
															className="font-medium shadow-sm hover:shadow-md transition-all duration-200 rounded-md px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 hover:text-green-800"
														>
															<CheckCircle className="w-4 h-4 mr-1.5" />
															{t('workshops.approve')}
														</Button>
													)}
													{workshop.isActive ? (
														<Button
															size="sm"
															onClick={() => handleWorkshopAction(workshop.id, 'block')}
															className="font-medium shadow-sm hover:shadow-md transition-all duration-200 rounded-md px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800"
														>
															<Ban className="w-4 h-4 mr-1.5" />
															{t('workshops.block')}
														</Button>
													) : (
														<Button
															size="sm"
															onClick={() => handleWorkshopAction(workshop.id, 'unblock')}
															className="font-medium shadow-sm hover:shadow-md transition-all duration-200 rounded-md px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 hover:text-green-800"
														>
															<Unlock className="w-4 h-4 mr-1.5" />
															{t('workshops.unblock')}
							</Button>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Requests Tab */}
				{activeTab === 'requests' && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>{t('requests.title')}</CardTitle>
								<div className="flex gap-4 mt-4">
									<div className="flex-1 relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											placeholder={t('requests.search')}
											value={searchQuery}
											onChange={(e) => {
												setSearchQuery(e.target.value)
												setPagination({ ...pagination, page: 1 })
											}}
											className="pl-10"
										/>
									</div>
									<Select
										value={statusFilter}
										onValueChange={(value) => {
											setStatusFilter(value)
											setPagination({ ...pagination, page: 1 })
										}}
									>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">{t('filters.all')}</SelectItem>
											<SelectItem value="NEW">{t('requests.new')}</SelectItem>
											<SelectItem value="IN_BIDDING">{t('requests.in_bidding')}</SelectItem>
											<SelectItem value="BOOKED">{t('requests.booked')}</SelectItem>
											<SelectItem value="COMPLETED">{t('requests.completed')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardHeader>
							<CardContent>
								{listLoading ? (
									<div className="text-center py-8">
										<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#1C3F94' }} />
										<p className="text-gray-600">{t('common.loading')}</p>
									</div>
								) : requests.length === 0 ? (
									<div className="text-center py-8">
										<FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
										<p className="text-gray-600">{t('requests.no_requests')}</p>
									</div>
								) : (
									<div className="space-y-4">
										{requests.map((request) => (
											<div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
												<div className="flex justify-between items-start">
													<div>
														<h3 className="font-semibold">
															{request.vehicle?.make} {request.vehicle?.model} ({request.vehicle?.year})
														</h3>
														<p className="text-sm text-gray-600">{request.customer?.name || request.customer?.email}</p>
														<p className="text-sm text-gray-500">
															{request.city}, {request.address}
														</p>
														<p className="text-sm text-gray-500">
															{t('requests.created')}: {formatDate(new Date(request.createdAt))}
														</p>
													</div>
													<div className="flex flex-col items-end gap-2">
														<Badge
															variant={
																request.status === 'COMPLETED'
																	? 'default'
																	: request.status === 'BOOKED'
																	? 'default'
																	: 'secondary'
															}
														>
															{request.status === 'NEW' ? t('requests.new') : request.status === 'IN_BIDDING' ? t('requests.in_bidding') : request.status === 'BIDDING_CLOSED' ? t('requests.bidding_closed') : request.status === 'BOOKED' ? t('requests.booked') : request.status === 'COMPLETED' ? t('requests.completed') : request.status === 'CANCELLED' ? t('requests.cancelled') : request.status}
														</Badge>
														<span className="text-sm text-gray-600">
															{t('requests.offers')}: {request._count?.offers || 0}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Offers Tab */}
				{activeTab === 'offers' && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>{t('offers.title')}</CardTitle>
							</CardHeader>
							<CardContent>
								{listLoading ? (
									<div className="text-center py-8">
										<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#1C3F94' }} />
										<p className="text-gray-600">{t('common.loading')}</p>
									</div>
								) : offers.length === 0 ? (
									<div className="text-center py-8">
										<Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
										<p className="text-gray-600">{t('offers.no_offers')}</p>
									</div>
								) : (
									<div className="space-y-4">
										{offers.map((offer) => (
											<div key={offer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
												<div className="flex justify-between items-start">
													<div>
														<h3 className="font-semibold">{offer.workshop?.companyName}</h3>
														<p className="text-sm text-gray-600">
															{offer.request?.vehicle?.make} {offer.request?.vehicle?.model}
														</p>
														<p className="text-sm font-semibold mt-2" style={{ color: '#1C3F94' }}>
															{formatPrice(offer.price)}
														</p>
													</div>
													<div className="flex flex-col items-end gap-2">
														<Badge variant={offer.status === 'ACCEPTED' ? 'default' : 'secondary'}>
															{offer.status === 'SENT' ? t('offers.sent') : offer.status === 'ACCEPTED' ? t('offers.accepted') : offer.status === 'DECLINED' ? t('offers.declined') : offer.status === 'EXPIRED' ? t('offers.expired') : offer.status}
														</Badge>
														<span className="text-sm text-gray-500">
															{formatDate(new Date(offer.createdAt))}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
						</CardContent>
					</Card>
					</div>
				)}

				{/* Bookings Tab */}
				{activeTab === 'bookings' && (
					<div className="space-y-6">
					<Card>
						<CardHeader>
								<CardTitle>{t('bookings.title')}</CardTitle>
								<div className="flex gap-4 mt-4">
									<Select
										value={statusFilter}
										onValueChange={(value) => {
											setStatusFilter(value)
											setPagination({ ...pagination, page: 1 })
										}}
									>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">{t('filters.all')}</SelectItem>
											<SelectItem value="CONFIRMED">{t('bookings.confirmed')}</SelectItem>
											<SelectItem value="DONE">{t('bookings.done')}</SelectItem>
											<SelectItem value="CANCELLED">{t('bookings.cancelled')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
						</CardHeader>
						<CardContent>
								{listLoading ? (
									<div className="text-center py-8">
										<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#1C3F94' }} />
										<p className="text-gray-600">{t('common.loading')}</p>
									</div>
								) : bookings.length === 0 ? (
									<div className="text-center py-8">
										<Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
										<p className="text-gray-600">{t('bookings.no_bookings')}</p>
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead>
												<tr className="border-b">
													<th className="text-left p-3 font-semibold">{t('bookings.customer')}</th>
													<th className="text-left p-3 font-semibold">{t('bookings.workshop')}</th>
													<th className="text-left p-3 font-semibold">{t('bookings.scheduled')}</th>
													<th className="text-left p-3 font-semibold">{t('bookings.amount')}</th>
													<th className="text-left p-3 font-semibold">{t('bookings.commission')}</th>
													<th className="text-left p-3 font-semibold">{t('bookings.status')}</th>
												</tr>
											</thead>
											<tbody>
												{bookings.map((booking) => (
													<tr key={booking.id} className="border-b hover:bg-gray-50">
														<td className="p-3">{booking.customer?.name || booking.customer?.email}</td>
														<td className="p-3">{booking.workshop?.companyName}</td>
														<td className="p-3">{formatDateTime(new Date(booking.scheduledAt))}</td>
														<td className="p-3 font-semibold">{formatPrice(booking.totalAmount)}</td>
														<td className="p-3" style={{ color: '#34C759' }}>
															{formatPrice(booking.commission)}
														</td>
														<td className="p-3">
															<Badge
																variant={
																	booking.status === 'DONE'
																		? 'default'
																		: booking.status === 'CANCELLED'
																		? 'destructive'
																		: 'secondary'
																}
															>
																{booking.status === 'CONFIRMED' ? t('bookings.confirmed') : booking.status === 'RESCHEDULED' ? t('bookings.rescheduled') : booking.status === 'CANCELLED' ? t('bookings.cancelled') : booking.status === 'DONE' ? t('bookings.done') : booking.status === 'NO_SHOW' ? t('bookings.no_show') : booking.status}
															</Badge>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
						</CardContent>
					</Card>
					</div>
				)}

				{/* Payouts Tab */}
				{activeTab === 'payouts' && (
					<div className="space-y-6">
					<Card>
						<CardHeader>
								<CardTitle>{t('payouts.title')}</CardTitle>
								<CardDescription>{t('payouts.subtitle')}</CardDescription>
								<div className="flex gap-4 mt-4">
									<Input
										type="number"
										placeholder={t('payouts.month')}
										value={payoutMonth}
										onChange={(e) => setPayoutMonth(Number(e.target.value))}
										min={1}
										max={12}
										className="w-32"
									/>
									<Input
										type="number"
										placeholder={t('payouts.year')}
										value={payoutYear}
										onChange={(e) => setPayoutYear(Number(e.target.value))}
										min={2020}
										max={2100}
										className="w-32"
									/>
									<Button
										onClick={handleGeneratePayouts}
										disabled={generating}
										style={{ backgroundColor: '#1C3F94', color: '#FFFFFF' }}
									>
										{generating ? (
											<>
												<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
												{t('payouts.generating')}
											</>
										) : (
											<>
												<TrendingUp className="w-4 h-4 mr-2" />
												{t('payouts.generate')}
											</>
										)}
									</Button>
									{payouts.length > 0 && (
										<Button
											variant="outline"
											onClick={() => exportToCSV(payouts, `payouts-${payoutYear}-${payoutMonth}.csv`)}
										>
											<Download className="w-4 h-4 mr-2" />
											{t('payouts.export_csv')}
										</Button>
									)}
								</div>
						</CardHeader>
						<CardContent>
								{loading ? (
									<div className="text-center py-8">
										<RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#1C3F94' }} />
										<p className="text-gray-600">{t('common.loading')}</p>
									</div>
								) : payouts.length === 0 ? (
									<div className="text-center py-8">
										<CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
										<p className="text-gray-600">{t('payouts.no_reports')}</p>
										<p className="text-sm text-gray-500 mt-2">{t('payouts.select_month_year')}</p>
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead>
												<tr className="border-b">
													<th className="text-left p-3 font-semibold">{t('payouts.workshop')}</th>
													<th className="text-left p-3 font-semibold">{t('payouts.month')}</th>
													<th className="text-left p-3 font-semibold">{t('payouts.year')}</th>
													<th className="text-left p-3 font-semibold">{t('payouts.total_jobs')}</th>
													<th className="text-left p-3 font-semibold">{t('payouts.total_amount')}</th>
													<th className="text-left p-3 font-semibold">{t('payouts.commission')}</th>
													<th className="text-left p-3 font-semibold">{t('payouts.workshop_amount')}</th>
													<th className="text-left p-3 font-semibold">{t('payouts.status')}</th>
													<th className="text-left p-3 font-semibold">{t('common.actions')}</th>
												</tr>
											</thead>
											<tbody>
												{payouts.map((payout) => (
													<tr key={payout.id} className="border-b hover:bg-gray-50">
														<td className="p-3">{payout.workshop?.companyName}</td>
														<td className="p-3">{payout.month}</td>
														<td className="p-3">{payout.year}</td>
														<td className="p-3">{payout.totalJobs}</td>
														<td className="p-3 font-semibold">{formatPrice(payout.totalAmount)}</td>
														<td className="p-3" style={{ color: '#34C759' }}>
															{formatPrice(payout.commission)}
														</td>
														<td className="p-3 font-semibold">{formatPrice(payout.workshopAmount)}</td>
														<td className="p-3">
															<Badge variant={payout.isPaid ? 'default' : 'secondary'}>
																{payout.isPaid ? t('payouts.paid') : t('payouts.unpaid')}
															</Badge>
														</td>
														<td className="p-3">
															{!payout.isPaid && (
																<Button
																	size="sm"
																	onClick={() => handleMarkPayoutPaid(payout.id)}
																	style={{ backgroundColor: '#34C759', color: '#FFFFFF' }}
																>
																	<CheckCircle className="w-4 h-4 mr-2" />
																	{t('payouts.mark_paid')}
							</Button>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
						</CardContent>
					</Card>
				</div>
				)}
			</div>
		</div>
	)
}
