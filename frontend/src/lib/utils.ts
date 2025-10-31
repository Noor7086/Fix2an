import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
	return new Intl.NumberFormat('sv-SE', {
		style: 'currency',
		currency: 'SEK',
	}).format(price)
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('sv-SE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date)
}

export function formatDateTime(date: Date): string {
	return new Intl.DateTimeFormat('sv-SE', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371 // Radius of the Earth in kilometers
	const dLat = (lat2 - lat1) * (Math.PI / 180)
	const dLon = (lon2 - lon1) * (Math.PI / 180)
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distance = R * c
	return Math.round(distance * 10) / 10
}

export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9 -]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim()
}

export function validateFileType(file: File): boolean {
	const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
	return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
	const maxSizeBytes = maxSizeMB * 1024 * 1024
	return file.size <= maxSizeBytes
}

export function validateFile(file: File): { isValid: boolean; error?: string } {
	// Check file type
	const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
	if (!allowedTypes.includes(file.type)) {
		return {
			isValid: false,
			error: 'Only JPG, PNG and PDF files are allowed',
		}
	}

	// Check file size (10MB max)
	const maxSize = 10 * 1024 * 1024 // 10MB in bytes
	if (file.size > maxSize) {
		return {
			isValid: false,
			error: 'File is too large. Maximum size is 10MB',
		}
	}

	return { isValid: true }
}

export function getFileIcon(mimeType: string): string {
	if (mimeType.startsWith('image/')) {
		return '🖼️'
	} else if (mimeType === 'application/pdf') {
		return '📄'
	}
	return '📎'
}
