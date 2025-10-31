'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export function useRequireAuth(redirectTo?: string) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const locale = useLocale()

	useEffect(() => {
		if (status === 'loading') return

		if (!session) {
			router.push(redirectTo || `/${locale}/auth/signin`)
		}
	}, [session, status, router, locale, redirectTo])

	return { session, isLoading: status === 'loading', isAuthenticated: !!session }
}
export function useRedirectIfAuthenticated(redirectTo?: string) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const locale = useLocale()

	useEffect(() => {
		if (status === 'loading') return

		if (session) {
			// Redirect based on user role
			const role = session.user?.role
			if (role === 'ADMIN') {
				router.push(redirectTo || `/${locale}/admin`)
			} else if (role === 'WORKSHOP') {
				router.push(redirectTo || `/${locale}/workshop/dashboard`)
			} else {
				router.push(redirectTo || `/${locale}/my-cases`)
			}
		}
	}, [session, status, router, locale, redirectTo])

	return { session, isLoading: status === 'loading', isAuthenticated: !!session }
}

