'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useTranslations, useLocale } from 'next-intl'
import { useRedirectIfAuthenticated } from '@/hooks/use-auth-redirect'
import { Navbar } from '@/components/navbar'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
		address: '',
		city: '',
		postalCode: '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const router = useRouter()
	const { toast } = useToast()
	const t = useTranslations('auth.signup')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const tSuccess = useTranslations('success')
	const locale = useLocale()

	// Redirect if already authenticated
	const { isLoading: isAuthLoading } = useRedirectIfAuthenticated()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		if (formData.password !== formData.confirmPassword) {
			toast({
				title: tCommon('error'),
				description: tErrors('password_mismatch'),
				variant: 'destructive',
			})
			setIsLoading(false)
			return
		}

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					password: formData.password,
					phone: formData.phone,
					address: formData.address,
					city: formData.city,
					postalCode: formData.postalCode,
					role: 'CUSTOMER',
				}),
			})

			if (response.ok) {
				toast({ title: tSuccess('account_created'), description: tSuccess('account_created_message') })
				router.push(`/${locale}/auth/signin`)
			} else {
				const error = await response.json()
				toast({
					title: tCommon('error'),
					description: error.message || tErrors('registration_failed'),
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Registration error:', error)
			toast({ title: tCommon('error'), description: tErrors('generic_error'), variant: 'destructive' })
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	// Show loading while checking auth
	if (isAuthLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				{tCommon('loading')}
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div className="text-center">
						<Link href={`/${locale}`} className="text-3xl font-bold text-primary">
							Fixa2an
						</Link>
						<h2 className="mt-6 text-3xl font-bold text-gray-900">{t('title')}</h2>
						<p className="mt-2 text-sm text-gray-600">
							{t('subtitle')}{' '}
							<Link href={`/${locale}/auth/signin`} className="font-medium text-primary hover:text-primary/80">
								{t('signin_link', { default: 'Sign in' })}
							</Link>
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>{t('title')}</CardTitle>
							<CardDescription>{t('subtitle')}</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label htmlFor="name">{t('name')}</Label>
									<Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder={t('name')} />
								</div>
								<div>
									<Label htmlFor="email">{t('email')}</Label>
									<Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder={t('email')} />
								</div>
								<div>
									<Label htmlFor="phone">{t('phone')}</Label>
									<Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder={t('phone')} />
								</div>
								<div>
									<Label htmlFor="address">{t('address')}</Label>
									<Input id="address" name="address" type="text" value={formData.address} onChange={handleChange} placeholder={t('address')} />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="city">{t('city')}</Label>
										<Input id="city" name="city" type="text" value={formData.city} onChange={handleChange} placeholder={t('city')} />
									</div>
									<div>
										<Label htmlFor="postalCode">{t('postal_code')}</Label>
										<Input id="postalCode" name="postalCode" type="text" value={formData.postalCode} onChange={handleChange} placeholder={t('postal_code')} />
									</div>
								</div>
								<div>
									<Label htmlFor="password">{t('password')}</Label>
									<div className="relative">
										<Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required placeholder={t('password')} className="pr-10" />
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
										>
											{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</div>
								<div>
									<Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
									<div className="relative">
										<Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} required placeholder={t('confirm_password')} className="pr-10" />
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
										>
											{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? t('submitting') : t('submit')}
								</Button>
							</form>

							<div className="mt-6 text-center">
								<p className="text-xs text-gray-500">
									{t('terms')}
								</p>
							</div>
						</CardContent>
					</Card>

					<div className="text-center">
						<p className="text-sm text-gray-600">
							{t('workshop_signup')}{' '}
							<Link href={`/${locale}/workshop/signup`} className="font-medium text-primary hover:text-primary/80">
								{t('workshop_signup')}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
