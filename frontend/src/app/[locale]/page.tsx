'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Shield, Clock, Star } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function HomePage() {
	const t = useTranslations()
	const locale = useLocale()
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-primary">Fixa2an</h1>
						</div>
						<nav className="hidden md:flex space-x-8 items-center">
							<Link href={`/${locale}/auth/signin`} className="text-gray-600 hover:text-primary">
								{t('navigation.login')}
							</Link>
							<Link href={`/${locale}/auth/signup`} className="text-gray-600 hover:text-primary">
								{t('navigation.register')}
							</Link>
							<LanguageSwitcher />
						</nav>
						<div className="md:hidden">
							<Button variant="outline" size="sm">
								Meny
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
						{t('homepage.title')}
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t('homepage.subtitle')}</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href={`/${locale}/upload`}>
							<Button size="lg" className="w-full sm:w-auto">
								{t('homepage.cta_primary')}
							</Button>
						</Link>
						<Link href={`/${locale}/how-it-works`}>
							<Button variant="outline" size="lg" className="w-full sm:w-auto">
								{t('homepage.cta_secondary')}
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							{t('homepage.how_it_works.title')}
						</h2>
						<p className="text-lg text-gray-600">{t('homepage.how_it_works.subtitle')}</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<Card className="text-center">
							<CardHeader>
								<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl font-bold text-white">1</span>
								</div>
								<CardTitle>{t('homepage.how_it_works.step1.title')}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>{t('homepage.how_it_works.step1.description')}</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<div className="w-16 h-16 bg-primary rounded-full flex itemscenter justify-center mx-auto mb-4">
									<span className="text-2xl font-bold text-white">2</span>
								</div>
								<CardTitle>{t('homepage.how_it_works.step2.title')}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>{t('homepage.how_it_works.step2.description')}</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl font-bold text-white">3</span>
								</div>
								<CardTitle>{t('homepage.how_it_works.step3.title')}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>{t('homepage.how_it_works.step3.description')}</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							{t('homepage.features.title')}
						</h2>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="text-center">
							<div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
								<Shield className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-lg font-semibold mb-2">
								{t('homepage.features.verified.title')}
							</h3>
							<p className="text-gray-600">{t('homepage.features.verified.description')}</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
								<Clock className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-lg font-semibold mb-2">{t('homepage.features.fast.title')}</h3>
							<p className="text-gray-600">{t('homepage.features.fast.description')}</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
								<Star className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-lg font-semibold mb-2">
								{t('homepage.features.transparent.title')}
							</h3>
							<p className="text-gray-600">{t('homepage.features.transparent.description')}</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-lg font-semibold mb-2">{t('homepage.features.secure.title')}</h3>
							<p className="text-gray-600">{t('homepage.features.secure.description')}</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-primary">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold text-white mb-4">{t('homepage.cta.title')}</h2>
					<p className="text-xl text-blue-100 mb-8">{t('homepage.cta.subtitle')}</p>
					<Link href={`/${locale}/upload`}>
						<Button size="lg" variant="secondary">
							{t('homepage.cta.button')}
						</Button>
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-4 gap-8">
						<div>
							<h3 className="text-lg font-semibold mb-4">Fixa2an</h3>
							<p className="text-gray-400">{t('footer.brand_tagline')}</p>
						</div>
						<div>
							<h4 className="font-semibold mb-4">{t('footer.for_customers')}</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href={`/${locale}/how-it-works`}>{t('footer.how_it_works')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/faq`}>{t('footer.faq')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/contact`}>{t('footer.contact')}</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">{t('footer.for_workshops')}</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href={`/${locale}/workshop/signup`}>{t('footer.register_workshop')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/workshop/benefits`}>{t('footer.benefits')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/workshop/contact`}>{t('footer.contact')}</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href={`/${locale}/terms`}>{t('footer.terms')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/privacy`}>{t('footer.privacy')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/cookies`}>{t('footer.cookies')}</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
						<p>{t('footer.copyright')}</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
