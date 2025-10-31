'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
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

export default function SignInPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()
	const { toast } = useToast()
	const t = useTranslations()
	const locale = useLocale()

	// Redirect if already authenticated
	const { isLoading: isAuthLoading } = useRedirectIfAuthenticated()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				toast({ title: t('common.error'), description: t('errors.invalid_credentials'), variant: 'destructive' })
			} else {
				const session = await getSession()
				if (session?.user?.role === 'ADMIN') {
					router.push(`/${locale}/admin`)
				} else if (session?.user?.role === 'WORKSHOP') {
					router.push(`/${locale}/workshop/dashboard`)
				} else {
					router.push(`/${locale}/my-cases`)
				}
			}
		} catch (error) {
			toast({ title: t('common.error'), description: t('errors.generic_error'), variant: 'destructive' })
		} finally {
			setIsLoading(false)
		}
	}

	const handleMagicLink = async () => {
		if (!email) {
			toast({ title: t('common.error'), description: t('errors.email_required'), variant: 'destructive' })
			return
		}

		setIsLoading(true)
		try {
			await signIn('email', { email, redirect: false })
			toast({ title: t('success.email_sent'), description: t('success.email_sent') })
		} catch (error) {
			toast({ title: t('common.error'), description: t('errors.generic_error'), variant: 'destructive' })
		} finally {
			setIsLoading(false)
		}
	}

	// Show loading while checking auth
	if (isAuthLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				{t('common.loading')}
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
						<h2 className="mt-6 text-3xl font-bold text-gray-900">{t('auth.signin.title')}</h2>
						<p className="mt-2 text-sm text-gray-600">
							{t('auth.signin.subtitle')}{' '}
							<Link href={`/${locale}/auth/signup`} className="font-medium text-primary hover:text-primary/80">
								{t('navigation.register')}
							</Link>
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>{t('navigation.login')}</CardTitle>
							<CardDescription>{t('auth.signin.title')}</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label htmlFor="email">{t('auth.signin.email')}</Label>
								<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.signin.email')} />
							</div>
							<div>
								<Label htmlFor="password">{t('auth.signin.password')}</Label>
								<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('auth.signin.password')} />
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? t('common.loading') : t('auth.signin.submit')}
							</Button>
						</form>

						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">{t('common.or', { default: 'Or' })}</span>
								</div>
							</div>

							<div className="mt-6">
								<Button type="button" variant="outline" className="w-full" onClick={handleMagicLink} disabled={isLoading}>
									{isLoading ? t('common.loading') : t('auth.signin.magic_link')}
								</Button>
							</div>
						</div>

						<div className="mt-6 text-center">
							<Link href={`/${locale}/auth/forgot-password`} className="text-sm text-primary hover:text-primary/80">
								{t('auth.signin.forgot_password')}
							</Link>
						</div>
					</CardContent>
					</Card>

					<div className="text-center">
						<p className="text-sm text-gray-600">
							{t('auth.signin.workshop_signup')}{' '}
							<Link href={`/${locale}/workshop/signup`} className="font-medium text-primary hover:text-primary/80">
								{t('navigation.register')}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
