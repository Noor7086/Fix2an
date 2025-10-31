'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
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
import { Star, MapPin, Clock, CheckCircle, Calendar } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'

interface Offer {
	id: string
	price: number
	note?: string
	availableDates: string[]
	estimatedDuration: number
	warranty?: string
	distance: number
	request: {
		id: string
		vehicle: {
			make: string
			model: string
			year: number
		}
	}
	workshop: {
		id: string
		companyName: string
		rating: number
		reviewCount: number
		isVerified: boolean
		address: string
		city: string
		phone: string
		email: string
		description?: string
	}
}

export default function OfferDetailPage() {
	const params = useParams()
	const searchParams = useSearchParams()
	const router = useRouter()
	const { toast } = useToast()
	const t = useTranslations('offer_detail')
	const tCommon = useTranslations('common')
	const locale = useLocale()

	const offerId = params.id as string
	const requestId = searchParams.get('requestId')
	const [offer, setOffer] = useState<Offer | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedTime, setSelectedTime] = useState('')
	const [isBooking, setIsBooking] = useState(false)

	useEffect(() => {
		if (offerId) {
			fetchOffer()
		}
	}, [offerId])

	const fetchOffer = async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/offers/${offerId}`)
			if (response.ok) {
				const data = await response.json()
				setOffer(data)
				if (data.availableDates && data.availableDates.length > 0) {
					setSelectedTime(data.availableDates[0])
				}
			} else {
				toast({
					title: tCommon('error'),
					description: t('fetch_error'),
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Failed to fetch offer:', error)
			toast({
				title: tCommon('error'),
				description: t('fetch_error'),
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleBooking = async () => {
		if (!selectedTime || !offer || !requestId) {
			toast({
				title: tCommon('error'),
				description: t('booking_form.error'),
				variant: 'destructive',
			})
			return
		}

		setIsBooking(true)
		try {
			const response = await fetch('/api/bookings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					requestId,
					offerId: offer.id,
					scheduledAt: selectedTime,
					totalAmount: offer.price,
				}),
			})

			if (response.ok) {
				toast({
					title: tCommon('success'),
					description: t('booking_form.success'),
				})
				router.push(`/${locale}/my-cases`)
			} else {
				const data = await response.json()
				toast({
					title: tCommon('error'),
					description: data.message || t('booking_form.error'),
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Failed to create booking:', error)
			toast({
				title: tCommon('error'),
				description: t('booking_form.error'),
				variant: 'destructive',
			})
		} finally {
			setIsBooking(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center py-12">
						<p>{tCommon('loading')}</p>
					</div>
				</div>
			</div>
		)
	}

	if (!offer) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Card>
						<CardContent className="text-center py-12">
							<p className="text-gray-600">{t('not_found')}</p>
							{requestId && (
								<Link href={`/${locale}/offers?requestId=${requestId}`}>
									<Button className="mt-4">{t('back_to_offers')}</Button>
								</Link>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-6">
					<Link href={`/${locale}/offers?requestId=${requestId || offer.request.id}`}>
						<Button variant="outline" size="sm">
							← {t('back_to_offers')}
						</Button>
					</Link>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="md:col-span-2 space-y-6">
						{/* Offer Info */}
						<Card>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<div className="flex items-center gap-2 mb-2">
											<CardTitle>{offer.workshop.companyName}</CardTitle>
											{offer.workshop.isVerified && (
												<Badge variant="default" className="bg-green-600">
													<CheckCircle className="w-3 h-3 mr-1" />
													{t('verified')}
												</Badge>
											)}
										</div>
										<CardDescription>
											{offer.request.vehicle.make} {offer.request.vehicle.model}{' '}
											{offer.request.vehicle.year}
										</CardDescription>
									</div>
									<div className="text-right">
										<div className="text-3xl font-bold text-primary">{formatPrice(offer.price)}</div>
										<div className="text-sm text-gray-500">{t('incl_vat')}</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{offer.note && (
									<div>
										<h4 className="font-semibold mb-2">{t('note')}</h4>
										<p className="text-sm text-gray-600">{offer.note}</p>
									</div>
								)}
								{offer.warranty && (
									<div>
										<Badge variant="outline">
											{t('warranty')}: {offer.warranty}
										</Badge>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="flex items-center gap-2">
										<MapPin className="w-4 h-4 text-gray-400" />
										<span>{offer.distance.toFixed(1)} {t('km')}</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-gray-400" />
										<span>
											{offer.estimatedDuration} {t('minutes')}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										<span>
											{offer.workshop.rating.toFixed(1)} ({offer.workshop.reviewCount} {t('reviews')})
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Workshop Info */}
						<Card>
							<CardHeader>
								<CardTitle>{t('workshop_info')}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="text-sm font-medium">{t('address')}</p>
									<p className="text-sm text-gray-600">
										{offer.workshop.address}, {offer.workshop.city}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium">{t('phone')}</p>
									<p className="text-sm text-gray-600">{offer.workshop.phone}</p>
								</div>
								<div>
									<p className="text-sm font-medium">{t('email')}</p>
									<p className="text-sm text-gray-600">{offer.workshop.email}</p>
								</div>
								{offer.workshop.description && (
									<div>
										<p className="text-sm text-gray-600">{offer.workshop.description}</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Booking Sidebar */}
					<div>
						<Card className="sticky top-4">
							<CardHeader>
								<CardTitle>{t('booking_form.title')}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium mb-2 block">{t('available_times')}</label>
									<Select value={selectedTime} onValueChange={setSelectedTime}>
										<SelectTrigger>
											<SelectValue placeholder={t('select_time')} />
										</SelectTrigger>
										<SelectContent>
											{offer.availableDates.map((date) => (
												<SelectItem key={date} value={date}>
													{formatDateTime(new Date(date))}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="pt-4 border-t">
									<div className="flex justify-between mb-2">
										<span className="text-sm text-gray-600">{t('booking_form.total_price')}</span>
										<span className="font-bold">{formatPrice(offer.price)}</span>
									</div>
									<div className="text-xs text-gray-500 mb-4">{t('incl_vat')}</div>
								</div>

								<Button
									className="w-full"
									onClick={handleBooking}
									disabled={!selectedTime || isBooking}
								>
									{isBooking ? tCommon('loading') : t('booking_form.confirm')}
								</Button>

								<div className="pt-4 border-t">
									<p className="text-xs font-medium mb-2">{t('booking_form.cancellation_policy')}</p>
									<p className="text-xs text-gray-500">{t('booking_form.policy_text')}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}


