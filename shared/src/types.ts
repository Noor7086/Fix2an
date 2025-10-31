// Common types shared by frontend and backend

export type UserRole = 'CUSTOMER' | 'WORKSHOP' | 'ADMIN'

export interface RegisterRequest {
	name: string
	email: string
	password: string
	phone?: string
	address?: string
	city?: string
	postalCode?: string
	role?: UserRole
}

export interface ApiResponse<T = unknown> {
	message: string
	data?: T
}
