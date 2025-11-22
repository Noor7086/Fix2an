'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Shield, Clock, Star, Upload, ArrowRight, Sparkles, Users, TrendingUp, Building2, Timer, Heart, Award } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Navbar } from '@/components/navbar'

export default function HomePage() {
	const t = useTranslations()
	const locale = useLocale()
	return (
		<div className="min-h-screen bg-white">
			<Navbar />

			{/* Hero Section */}
			<section className="relative py-20 md:py-28 overflow-hidden bg-white">
				{/* Background decorative elements */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{/* Large gradient blobs */}
					<div className="absolute top-0 left-1/4 w-[600px] h-[600px]" style={{ backgroundColor: '#1C3F94', opacity: 0.08, borderRadius: '50%', filter: 'blur(100px)' }}></div>
					<div className="absolute bottom-0 right-1/4 w-[500px] h-[500px]" style={{ backgroundColor: '#34C759', opacity: 0.08, borderRadius: '50%', filter: 'blur(100px)' }}></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]" style={{ backgroundColor: '#1C3F94', opacity: 0.05, borderRadius: '50%', filter: 'blur(90px)' }}></div>
					
					{/* Subtle grid pattern */}
					<div className="absolute inset-0" style={{ 
						backgroundImage: `linear-gradient(rgba(28, 63, 148, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 63, 148, 0.03) 1px, transparent 1px)`,
						backgroundSize: '50px 50px',
						maskImage: 'radial-gradient(circle, black 20%, transparent 70%)',
						WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 70%)'
					}}></div>
					
					{/* Floating circles */}
					<div className="absolute top-20 left-10 w-32 h-32 rounded-full" style={{ backgroundColor: '#1C3F94', opacity: 0.06, filter: 'blur(40px)' }}></div>
					<div className="absolute top-40 right-20 w-40 h-40 rounded-full" style={{ backgroundColor: '#34C759', opacity: 0.06, filter: 'blur(50px)' }}></div>
					<div className="absolute bottom-32 left-1/3 w-36 h-36 rounded-full" style={{ backgroundColor: '#1C3F94', opacity: 0.05, filter: 'blur(45px)' }}></div>
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center">
						<div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-lg animate-fade-in-up" style={{ backgroundColor: '#1C3F94', color: '#FFFFFF' }}>
							<Sparkles className="w-4 h-4" />
							{t('homepage.badge') || 'Trusted by hundreds of customers'}
						</div>
						<h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight animate-fade-in-up" style={{ color: '#333333' }}>
							{t('homepage.title')}
						</h1>
						<p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ color: '#666666' }}>
							{t('homepage.subtitle')}
						</p>
						<div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-8 animate-fade-in-up">
							<Link href={`/${locale}/upload`}>
								<Button size="lg" className="w-full sm:w-auto text-lg px-10 py-7 h-auto shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold" style={{ backgroundColor: '#1C3F94', color: '#FFFFFF' }}>
									<Upload className="w-6 h-6 mr-2" />
									{t('homepage.cta_primary')}
									<ArrowRight className="w-6 h-6 ml-2" />
								</Button>
							</Link>
							<Link href={`/${locale}/how-it-works`}>
								<Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 py-7 h-auto border-2 hover:bg-gray-50 hover:scale-105 transition-all duration-300 font-semibold" style={{ borderColor: '#1C3F94', color: '#1C3F94' }}>
									{t('homepage.cta_secondary')}
								</Button>
							</Link>
						</div>

						{/* Stats */}
						<div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
							<div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 group">
								<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#1C3F94' }}>
									<Building2 className="w-8 h-8 text-white" />
								</div>
								<div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: '#1C3F94' }}>500+</div>
								<div className="text-sm font-medium" style={{ color: '#333333' }}>Verified Workshops</div>
							</div>
							<div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 group">
								<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#1C3F94' }}>
									<Timer className="w-8 h-8 text-white" />
								</div>
								<div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: '#1C3F94' }}>24h</div>
								<div className="text-sm font-medium" style={{ color: '#333333' }}>Average Response</div>
							</div>
							<div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 group">
								<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#34C759' }}>
									<Heart className="w-8 h-8 text-white" />
								</div>
								<div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: '#34C759' }}>10k+</div>
								<div className="text-sm font-medium" style={{ color: '#333333' }}>Happy Customers</div>
							</div>
							<div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 group">
								<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#34C759' }}>
									<Award className="w-8 h-8 text-white" />
								</div>
								<div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: '#34C759' }}>4.8★</div>
								<div className="text-sm font-medium" style={{ color: '#333333' }}>Average Rating</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="py-24 bg-white relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-20">
						<h2 className="text-4xl md:text-6xl font-extrabold mb-6" style={{ color: '#333333' }}>
							{t('homepage.how_it_works.title')}
						</h2>
						<p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#333333', opacity: 0.8 }}>{t('homepage.how_it_works.subtitle')}</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 lg:gap-12">
						<Card className="text-center border-0 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden bg-white group" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '20px' }}>
							<div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#1C3F94' }}></div>
							<CardHeader className="relative z-10 pb-6 pt-10">
								<div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1C3F94' }}>
									<span className="text-5xl font-extrabold text-white">1</span>
								</div>
								<CardTitle className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#333333' }}>{t('homepage.how_it_works.step1.title')}</CardTitle>
							</CardHeader>
							<CardContent className="relative z-10 pb-10 px-6">
								<CardDescription className="text-base md:text-lg leading-relaxed" style={{ color: '#666666', lineHeight: '1.8' }}>
									{t('homepage.how_it_works.step1.description')}
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center border-0 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden bg-white group" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '20px' }}>
							<div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#1C3F94' }}></div>
							<CardHeader className="relative z-10 pb-6 pt-10">
								<div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1C3F94' }}>
									<span className="text-5xl font-extrabold text-white">2</span>
								</div>
								<CardTitle className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#333333' }}>{t('homepage.how_it_works.step2.title')}</CardTitle>
							</CardHeader>
							<CardContent className="relative z-10 pb-10 px-6">
								<CardDescription className="text-base md:text-lg leading-relaxed" style={{ color: '#666666', lineHeight: '1.8' }}>
									{t('homepage.how_it_works.step2.description')}
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center border-0 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden bg-white group" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '20px' }}>
							<div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#34C759' }}></div>
							<CardHeader className="relative z-10 pb-6 pt-10">
								<div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#34C759' }}>
									<span className="text-5xl font-extrabold text-white">3</span>
								</div>
								<CardTitle className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#333333' }}>{t('homepage.how_it_works.step3.title')}</CardTitle>
							</CardHeader>
							<CardContent className="relative z-10 pb-10 px-6">
								<CardDescription className="text-base md:text-lg leading-relaxed" style={{ color: '#666666', lineHeight: '1.8' }}>
									{t('homepage.how_it_works.step3.description')}
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-28 relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute top-0 left-0 w-1/3 h-full" style={{ background: 'linear-gradient(to right, rgba(28, 63, 148, 0.02), transparent)' }}></div>
					<div className="absolute top-0 right-0 w-1/3 h-full" style={{ background: 'linear-gradient(to left, rgba(52, 199, 89, 0.02), transparent)' }}></div>
				</div>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center mb-24">
						<h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight" style={{ color: '#333333' }}>
							{t('homepage.features.title')}
						</h2>
						<p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#666666' }}>
							{t('homepage.features.subtitle')}
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
						<Card className="text-center border-0 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 bg-white group relative overflow-hidden" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '20px' }}>
							<div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: '#34C759' }}></div>
							<CardHeader className="pb-4 pt-10 relative z-10">
								<div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: '#34C759' }}>
									<Shield className="w-16 h-16 text-white" />
								</div>
								<CardTitle className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#333333' }}>
									{t('homepage.features.verified.title')}
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-10 px-6 relative z-10">
								<p className="leading-relaxed text-base md:text-lg" style={{ color: '#666666', lineHeight: '1.8' }}>{t('homepage.features.verified.description')}</p>
							</CardContent>
						</Card>

						<Card className="text-center border-0 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 bg-white group relative overflow-hidden" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '20px' }}>
							<div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: '#1C3F94' }}></div>
							<CardHeader className="pb-4 pt-10 relative z-10">
								<div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: '#1C3F94' }}>
									<Clock className="w-16 h-16 text-white" />
								</div>
								<CardTitle className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#333333' }}>{t('homepage.features.fast.title')}</CardTitle>
							</CardHeader>
							<CardContent className="pb-10 px-6 relative z-10">
								<p className="leading-relaxed text-base md:text-lg" style={{ color: '#666666', lineHeight: '1.8' }}>{t('homepage.features.fast.description')}</p>
							</CardContent>
						</Card>

						<Card className="text-center border-0 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 bg-white group relative overflow-hidden" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '20px' }}>
							<div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: '#1C3F94' }}></div>
							<CardHeader className="pb-4 pt-10 relative z-10">
								<div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: '#1C3F94' }}>
									<Star className="w-16 h-16 text-white" />
								</div>
								<CardTitle className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#333333' }}>
									{t('homepage.features.transparent.title')}
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-10 px-6 relative z-10">
								<p className="leading-relaxed text-base md:text-lg" style={{ color: '#666666', lineHeight: '1.8' }}>{t('homepage.features.transparent.description')}</p>
							</CardContent>
						</Card>

						<Card className="text-center border-0 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 bg-white group relative overflow-hidden" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '20px' }}>
							<div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: '#34C759' }}></div>
							<CardHeader className="pb-4 pt-10 relative z-10">
								<div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: '#34C759' }}>
									<CheckCircle className="w-16 h-16 text-white" />
								</div>
								<CardTitle className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#333333' }}>{t('homepage.features.secure.title')}</CardTitle>
							</CardHeader>
							<CardContent className="pb-10 px-6 relative z-10">
								<p className="leading-relaxed text-base md:text-lg" style={{ color: '#666666', lineHeight: '1.8' }}>{t('homepage.features.secure.description')}</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#1C3F94' }}>
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ backgroundColor: '#34C759', filter: 'blur(100px)' }}></div>
					<div className="absolute bottom-0 left-0 w-96 h-96 rounded-full" style={{ backgroundColor: '#FFFFFF', filter: 'blur(100px)' }}></div>
				</div>
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
					<h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">{t('homepage.cta.title')}</h2>
					<p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed">{t('homepage.cta.subtitle')}</p>
					<Link href={`/${locale}/upload`}>
						<Button size="lg" variant="secondary" className="text-lg px-10 py-7 h-auto shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-white hover:bg-gray-50 font-semibold" style={{ color: '#1C3F94' }}>
							<Upload className="w-6 h-6 mr-2" />
							{t('homepage.cta.button')}
							<ArrowRight className="w-6 h-6 ml-2" />
						</Button>
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-4 gap-12 mb-12">
						<div>
							<h3 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Fixa2an</h3>
							<p className="text-gray-400 leading-relaxed">{t('footer.brand_tagline')}</p>
						</div>
						<div>
							<h4 className="font-bold mb-6 text-lg" style={{ color: '#FFFFFF' }}>{t('footer.for_customers')}</h4>
							<ul className="space-y-3 text-gray-400">
								<li>
									<Link href={`/${locale}/how-it-works`} className="hover:text-white transition-colors">{t('footer.how_it_works')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/faq`} className="hover:text-white transition-colors">{t('footer.faq')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t('footer.contact')}</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-bold mb-6 text-lg" style={{ color: '#FFFFFF' }}>{t('footer.for_workshops')}</h4>
							<ul className="space-y-3 text-gray-400">
								<li>
									<Link href={`/${locale}/workshop/signup`} className="hover:text-white transition-colors">{t('footer.register_workshop')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/workshop/benefits`} className="hover:text-white transition-colors">{t('footer.benefits')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/workshop/contact`} className="hover:text-white transition-colors">{t('footer.contact')}</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-bold mb-6 text-lg" style={{ color: '#FFFFFF' }}>{t('footer.legal')}</h4>
							<ul className="space-y-3 text-gray-400">
								<li>
									<Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{t('footer.terms')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
								</li>
								<li>
									<Link href={`/${locale}/cookies`} className="hover:text-white transition-colors">{t('footer.cookies')}</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-gray-800 pt-8 text-center text-gray-400">
						<p className="text-sm">{t('footer.copyright')}</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
