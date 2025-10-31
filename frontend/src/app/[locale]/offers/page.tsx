'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTranslations, useLocale } from 'next-intl'
import { Navbar } from '@/components/navbar'
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Offer {
	id: string
	price: number
	note?: string
	availableDates: string[]
	estimatedDuration: number
	warranty?: string
	distance: number
	workshop: {
		id: string
		companyName: string
		rating: number
		reviewCount: number
		isVerified: boolean
		address: string
		city: string
	}
}

export default function OffersPage() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const { toast } = useToast()
	const t = useTranslations('offers_page')
	const tCommon = useTranslations('common')
	const locale = useLocale()

	const requestId = searchParams.get('requestId')
	const [offers, setOffers] = useState<Offer[]>([])
	const [loading, setLoading] = useState(true)
	const [sortBy, setSortBy] = useState('price')
	const [filterPrice, setFilterPrice] = useState('')
	const [filterDistance, setFilterDistance] = useState('')
	const [filterRating, setFilterRating] = useState('')

	useEffect(() => {
		if (requestId) {
			fetchOffers()
		}
	}, [requestId, sortBy, filterPrice, filterDistance, filterRating])

	const fetchOffers = async () => {
		if (!requestId) return

		setLoading(true)
		try {
			const params = new URLSearchParams()
			params.append('sortBy', sortBy)
			if (filterPrice) params.append('filterPrice', filterPrice)
			if (filterDistance) params.append('filterDistance', filterDistance)
			if (filterRating) params.append('filterRating', filterRating)

			const response = await fetch(`/api/offers?requestId=${requestId}&${params.toString()}`)
			if (response.ok) {
				const data = await response.json()
				setOffers(data)
			} else {
				toast({
					title: tCommon('error'),
					description: t('fetch_error'),
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Failed to fetch offers:', error)
			toast({
				title: tCommon('error'),
				description: t('fetch_error'),
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	if (!requestId) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Card>
						<CardContent className="text-center py-12">
							<p className="text-gray-600">{t('no_request_id')}</p>
							<Link href={`/${locale}/my-cases`}>
								<Button className="mt-4">{t('back_to_cases')}</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
					<p className="text-gray-600">{t('subtitle')}</p>
				</div>

				{/* Filters */}
				<Card className="mb-6">
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<label className="text-sm font-medium mb-2 block">{t('sort_by')}</label>
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="price">{t('sort.price')}</SelectItem>
										<SelectItem value="distance">{t('sort.distance')}</SelectItem>
										<SelectItem value="rating">{t('sort.rating')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">{t('filter.price')}</label>
								<Select value={filterPrice} onValueChange={setFilterPrice}>
									<SelectTrigger>
										<SelectValue placeholder={t('filter.all')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">{t('filter.all')}</SelectItem>
										<SelectItem value="0-5000">0 - 5,000 SEK</SelectItem>
										<SelectItem value="5000-10000">5,000 - 10,000 SEK</SelectItem>
										<SelectItem value="10000-20000">10,000 - 20,000 SEK</SelectItem>
										<SelectItem value="20000-">20,000+ SEK</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">{t('filter.distance')}</label>
								<Select value={filterDistance} onValueChange={setFilterDistance}>
									<SelectTrigger>
										<SelectValue placeholder={t('filter.all')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">{t('filter.all')}</SelectItem>
										<SelectItem value="10">≤ 10 km</SelectItem>
										<SelectItem value="20">≤ 20 km</SelectItem>
										<SelectItem value="30">≤ 30 km</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">{t('filter.rating')}</label>
								<Select value={filterRating} onValueChange={setFilterRating}>
									<SelectTrigger>
										<SelectValue placeholder={t('filter.all')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">{t('filter.all')}</SelectItem>
										<SelectItem value="4">4+ stars</SelectItem>
										<SelectItem value="3">3+ stars</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Offers List */}
				{loading ? (
					<div className="text-center py-12">
						<p>{tCommon('loading')}</p>
					</div>
				) : offers.length === 0 ? (
					<Card>
						<CardContent className="text-center py-12">
							<p className="text-gray-600">{t('no_offers')}</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{offers.map((offer) => (
							<Card key={offer.id} className="hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<CardTitle>{offer.workshop.companyName}</CardTitle>
												{offer.workshop.isVerified && (
													<Badge variant="default" className="bg-green-600">
														<CheckCircle className="w-3 h-3 mr-1" />
														{t('verified')}
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-4 text-sm text-gray-600">
												<div className="flex items-center gap-1">
													<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
													<span>
														{offer.workshop.rating.toFixed(1)} ({offer.workshop.reviewCount})
													</span>
												</div>
												<div className="flex items-center gap-1">
													<MapPin className="w-4 h-4" />
													<span>{offer.distance.toFixed(1)} km</span>
												</div>
												<div className="flex items-center gap-1">
													<Clock className="w-4 h-4" />
													<span>{offer.estimatedDuration} min</span>
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="text-2xl font-bold text-primary">{formatPrice(offer.price)}</div>
											<div className="text-sm text-gray-500">{t('incl_vat')}</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									{offer.note && (
										<p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.note}</p>
									)}
									{offer.warranty && (
										<Badge variant="outline" className="mb-4">
											{t('warranty')}: {offer.warranty}
										</Badge>
									)}
									<div className="flex justify-end">
										<Link href={`/${locale}/offers/${offer.id}?requestId=${requestId}`}>
											<Button>{t('view_details')}</Button>
										</Link>
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

