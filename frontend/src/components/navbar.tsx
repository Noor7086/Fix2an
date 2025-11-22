'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { User, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
	const { data: session } = useSession()
	const router = useRouter()
	const pathname = usePathname()
	const t = useTranslations('navigation')
	const tCommon = useTranslations('common')
	const locale = useLocale()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	// Helper function to check if a path is active
	const isActive = (path: string) => {
		return pathname === path || pathname?.startsWith(path + '/')
	}

	const handleLogout = async () => {
		await signOut({ redirect: false })
		router.push(`/${locale}`)
	}

	return (
		<header className="bg-white shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center gap-3">
						<Link href={`/${locale}`} className="text-2xl font-bold text-primary">
							Fixa2an
						</Link>
						{(session?.user as any)?.role === 'ADMIN' && (
							<span className="text-sm text-gray-500 font-medium hidden sm:block">
								{tCommon('admin_tagline') || 'Manage & Monitor'}
							</span>
						)}
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex space-x-8 items-center">
						{session ? (
							<>
								{/* Only show My Cases and Upload for CUSTOMER role */}
								{session.user?.role !== 'WORKSHOP' && (
									<>
										<Link 
											href={`/${locale}/my-cases`} 
											className={`relative transition-colors ${
												isActive(`/${locale}/my-cases`) 
													? 'text-primary font-semibold' 
													: 'text-gray-600 hover:text-primary'
											}`}
										>
											{t('my_cases')}
											{isActive(`/${locale}/my-cases`) && (
												<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
											)}
										</Link>
										<Link 
											href={`/${locale}/upload`} 
											className={`relative transition-colors ${
												isActive(`/${locale}/upload`) 
													? 'text-primary font-semibold' 
													: 'text-gray-600 hover:text-primary'
											}`}
										>
											{t('upload')}
											{isActive(`/${locale}/upload`) && (
												<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
											)}
										</Link>
									</>
								)}
								{/* Show Workshop Dashboard link for WORKSHOP role */}
								{session.user?.role === 'WORKSHOP' && (
									<Link 
										href={`/${locale}/workshop/dashboard`} 
										className={`relative transition-colors ${
											isActive(`/${locale}/workshop/dashboard`) 
												? 'text-primary font-semibold' 
												: 'text-gray-600 hover:text-primary'
										}`}
									>
										{t('dashboard')}
										{isActive(`/${locale}/workshop/dashboard`) && (
											<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
										)}
									</Link>
								)}
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 text-gray-600">
										<User className="w-4 h-4" />
										<span className="text-sm">{session.user?.name || session.user?.email}</span>
									</div>
									<Button variant="outline" size="sm" onClick={handleLogout}>
										<LogOut className="w-4 h-4 mr-2" />
										{t('logout')}
									</Button>
								</div>
							</>
						) : (
							<>
								<Link 
									href={`/${locale}/auth/signin`} 
									className={`relative transition-colors ${
										isActive(`/${locale}/auth/signin`) 
											? 'text-primary font-semibold' 
											: 'text-gray-600 hover:text-primary'
									}`}
								>
									{t('login')}
									{isActive(`/${locale}/auth/signin`) && (
										<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
									)}
								</Link>
								<Link 
									href={`/${locale}/auth/signup`} 
									className={`relative transition-colors ${
										isActive(`/${locale}/auth/signup`) 
											? 'text-primary font-semibold' 
											: 'text-gray-600 hover:text-primary'
									}`}
								>
									{t('register')}
									{isActive(`/${locale}/auth/signup`) && (
										<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
									)}
								</Link>
							</>
						)}
						<LanguageSwitcher />
					</nav>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center gap-2">
						<LanguageSwitcher />
						<Button
							variant="outline"
							size="sm"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							<Menu className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden pb-4 space-y-3 border-t mt-4 pt-4">
						{session ? (
							<>
								{/* Only show My Cases and Upload for CUSTOMER role */}
								{session.user?.role !== 'WORKSHOP' && (
									<>
										<Link
											href={`/${locale}/my-cases`}
											className={`block py-2 transition-colors ${
												isActive(`/${locale}/my-cases`) 
													? 'text-primary font-semibold border-l-2 border-primary pl-3' 
													: 'text-gray-600 hover:text-primary'
											}`}
											onClick={() => setMobileMenuOpen(false)}
										>
											{t('my_cases')}
										</Link>
										<Link
											href={`/${locale}/upload`}
											className={`block py-2 transition-colors ${
												isActive(`/${locale}/upload`) 
													? 'text-primary font-semibold border-l-2 border-primary pl-3' 
													: 'text-gray-600 hover:text-primary'
											}`}
											onClick={() => setMobileMenuOpen(false)}
										>
											{t('upload')}
										</Link>
									</>
								)}
								{/* Show Workshop Dashboard link for WORKSHOP role */}
								{session.user?.role === 'WORKSHOP' && (
									<Link
										href={`/${locale}/workshop/dashboard`}
										className={`block py-2 transition-colors ${
											isActive(`/${locale}/workshop/dashboard`) 
												? 'text-primary font-semibold border-l-2 border-primary pl-3' 
												: 'text-gray-600 hover:text-primary'
										}`}
										onClick={() => setMobileMenuOpen(false)}
									>
										{t('dashboard')}
									</Link>
								)}
								<div className="flex items-center gap-2 text-gray-600 py-2">
									<User className="w-4 h-4" />
									<span className="text-sm">{session.user?.name || session.user?.email}</span>
								</div>
								<Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
									<LogOut className="w-4 h-4 mr-2" />
									{t('logout')}
								</Button>
							</>
						) : (
							<>
								<Link
									href={`/${locale}/auth/signin`}
									className={`block py-2 transition-colors ${
										isActive(`/${locale}/auth/signin`) 
											? 'text-primary font-semibold border-l-2 border-primary pl-3' 
											: 'text-gray-600 hover:text-primary'
									}`}
									onClick={() => setMobileMenuOpen(false)}
								>
									{t('login')}
								</Link>
								<Link
									href={`/${locale}/auth/signup`}
									className={`block py-2 transition-colors ${
										isActive(`/${locale}/auth/signup`) 
											? 'text-primary font-semibold border-l-2 border-primary pl-3' 
											: 'text-gray-600 hover:text-primary'
									}`}
									onClick={() => setMobileMenuOpen(false)}
								>
									{t('register')}
								</Link>
							</>
						)}
					</div>
				)}
			</div>
		</header>
	)
}


