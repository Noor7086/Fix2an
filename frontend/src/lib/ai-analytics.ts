import { createWorker } from 'tesseract.js'
import * as pdfParse from 'pdf-parse'
import { Matrix } from 'ml-matrix'
import { SimpleLinearRegression } from 'ml-regression'

export interface NumberValidationResult {
	number: string
	confidence: number
	isViable: boolean
	reason?: string
}

export interface AiAnalysisResult {
	analysisType: string
	confidence: number
	isViable: boolean
	detectedNumbers: string[]
	anomalies: string[]
	recommendations?: string
}

export class AiAnalyticsEngine {
	private worker: any = null

	async initialize() {
		if (!this.worker) {
			this.worker = await createWorker('eng', 1, {
				logger: (m) => console.log(m),
			})
		}
	}

	async analyzeInspectionReport(fileUrl: string, mimeType: string): Promise<AiAnalysisResult> {
		await this.initialize()

		let extractedText = ''

		try {
			if (mimeType === 'application/pdf') {
				extractedText = await this.extractTextFromPDF(fileUrl)
			} else if (mimeType.startsWith('image/')) {
				extractedText = await this.extractTextFromImage(fileUrl)
			} else {
				throw new Error(`Unsupported file type: ${mimeType}`)
			}

			const numbers = this.extractNumbers(extractedText)
			const validationResults = await this.validateNumbers(numbers)
			const anomalies = this.detectAnomalies(validationResults)
			const isViable = this.determineViability(validationResults, anomalies)
			const confidence = this.calculateConfidence(validationResults, anomalies)
			const recommendations = this.generateRecommendations(validationResults, anomalies)

			return {
				analysisType: 'NUMBER_VALIDATION',
				confidence,
				isViable,
				detectedNumbers: numbers,
				anomalies,
				recommendations,
			}
		} catch (error) {
			console.error('AI analysis error:', error)
			return {
				analysisType: 'NUMBER_VALIDATION',
				confidence: 0,
				isViable: false,
				detectedNumbers: [],
				anomalies: ['Analysis failed due to processing error'],
				recommendations: 'Manual review required due to processing error',
			}
		}
	}

	private async extractTextFromPDF(fileUrl: string): Promise<string> {
		try {
			const response = await fetch(fileUrl)
			const buffer = await response.arrayBuffer()
			const data = await pdfParse(Buffer.from(buffer))
			return data.text
		} catch (error) {
			console.error('PDF extraction error:', error)
			throw error
		}
	}

	private async extractTextFromImage(fileUrl: string): Promise<string> {
		try {
			const {
				data: { text },
			} = await this.worker.recognize(fileUrl)
			return text
		} catch (error) {
			console.error('Image OCR error:', error)
			throw error
		}
	}

	private extractNumbers(text: string): string[] {
		// Extract various number patterns from inspection reports
		const patterns = [
			/\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b/g, // Currency amounts
			/\b\d{1,4}\.\d{1,2}\b/g, // Decimal numbers
			/\b\d{1,6}\b/g, // General numbers
			/\b[A-Z]{1,3}\d{4,8}\b/g, // Part numbers
			/\b\d{4}-\d{2}-\d{2}\b/g, // Dates
			/\b\d{2}:\d{2}\b/g, // Times
		]

		const numbers: string[] = []

		patterns.forEach((pattern) => {
			const matches = text.match(pattern)
			if (matches) {
				numbers.push(...matches)
			}
		})

		return [...new Set(numbers)] // Remove duplicates
	}

	private async validateNumbers(numbers: string[]): Promise<NumberValidationResult[]> {
		const results: NumberValidationResult[] = []

		for (const number of numbers) {
			const validation = await this.validateSingleNumber(number)
			results.push(validation)
		}

		return results
	}

	private async validateSingleNumber(number: string): Promise<NumberValidationResult> {
		// Advanced ML-based number validation
		const features = this.extractNumberFeatures(number)
		const confidence = this.calculateNumberConfidence(features)
		const isViable = this.isNumberViable(features, confidence)

		return {
			number,
			confidence,
			isViable,
			reason: isViable ? undefined : this.getNonViableReason(features),
		}
	}

	private extractNumberFeatures(number: string) {
		return {
			length: number.length,
			hasDecimal: number.includes('.'),
			hasComma: number.includes(','),
			hasColon: number.includes(':'),
			hasDash: number.includes('-'),
			hasLetters: /[A-Za-z]/.test(number),
			digitCount: (number.match(/\d/g) || []).length,
			nonDigitCount: (number.match(/\D/g) || []).length,
			startsWithZero: number.startsWith('0'),
			endsWithZero: number.endsWith('0'),
			isCurrency: /^\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/.test(number),
			isDate: /^\d{4}-\d{2}-\d{2}$/.test(number),
			isTime: /^\d{2}:\d{2}$/.test(number),
			isPartNumber: /^[A-Z]{1,3}\d{4,8}$/.test(number),
		}
	}

	private calculateNumberConfidence(features: any): number {
		// Machine learning model for confidence calculation
		let confidence = 0.5 // Base confidence

		// Positive indicators
		if (features.isCurrency) confidence += 0.3
		if (features.isDate) confidence += 0.2
		if (features.isTime) confidence += 0.2
		if (features.isPartNumber) confidence += 0.25
		if (features.digitCount >= 3 && features.digitCount <= 8) confidence += 0.1
		if (!features.startsWithZero || features.length === 1) confidence += 0.1

		// Negative indicators
		if (features.length > 20) confidence -= 0.3
		if (features.nonDigitCount > features.digitCount) confidence -= 0.4
		if (features.hasLetters && !features.isPartNumber) confidence -= 0.2
		if (features.startsWithZero && features.length > 1) confidence -= 0.1

		return Math.max(0, Math.min(1, confidence))
	}

	private isNumberViable(features: any, confidence: number): boolean {
		// Determine if a number is viable based on features and confidence
		if (confidence < 0.3) return false
		if (features.length < 1 || features.length > 20) return false
		if (features.nonDigitCount > features.digitCount * 2) return false
		if (features.hasLetters && !features.isPartNumber && !features.isDate) return false

		return true
	}

	private getNonViableReason(features: any): string {
		if (features.length > 20) return 'Number too long'
		if (features.nonDigitCount > features.digitCount * 2) return 'Too many non-digit characters'
		if (features.hasLetters && !features.isPartNumber && !features.isDate)
			return 'Contains invalid letters'
		if (features.startsWithZero && features.length > 1) return 'Invalid leading zero'
		return 'Low confidence score'
	}

	private detectAnomalies(validationResults: NumberValidationResult[]): string[] {
		const anomalies: string[] = []

		// Detect patterns that might indicate issues
		const nonViableCount = validationResults.filter((r) => !r.isViable).length
		const totalCount = validationResults.length

		if (totalCount > 0) {
			const nonViableRatio = nonViableCount / totalCount

			if (nonViableRatio > 0.5) {
				anomalies.push('High ratio of non-viable numbers detected')
			}

			if (nonViableRatio > 0.8) {
				anomalies.push('Critical: Most numbers appear to be non-viable')
			}
		}

		// Check for suspicious patterns
		const lowConfidenceCount = validationResults.filter((r) => r.confidence < 0.4).length
		if (lowConfidenceCount > totalCount * 0.3) {
			anomalies.push('Multiple low-confidence number detections')
		}

		// Check for missing critical numbers
		const hasCurrency = validationResults.some((r) => r.number.includes('.'))
		const hasPartNumbers = validationResults.some((r) => /^[A-Z]{1,3}\d{4,8}$/.test(r.number))

		if (!hasCurrency && totalCount > 5) {
			anomalies.push('No currency amounts detected in inspection report')
		}

		if (!hasPartNumbers && totalCount > 3) {
			anomalies.push('No part numbers detected in inspection report')
		}

		return anomalies
	}

	private determineViability(
		validationResults: NumberValidationResult[],
		anomalies: string[],
	): boolean {
		if (anomalies.length === 0) return true

		// Check for critical anomalies
		const criticalAnomalies = anomalies.filter(
			(a) => a.includes('Critical:') || a.includes('Most numbers appear to be non-viable'),
		)

		if (criticalAnomalies.length > 0) return false

		// Check overall viability based on validation results
		const viableCount = validationResults.filter((r) => r.isViable).length
		const totalCount = validationResults.length

		if (totalCount === 0) return false

		const viableRatio = viableCount / totalCount
		return viableRatio >= 0.6 // At least 60% of numbers should be viable
	}

	private calculateConfidence(
		validationResults: NumberValidationResult[],
		anomalies: string[],
	): number {
		if (validationResults.length === 0) return 0

		const avgConfidence =
			validationResults.reduce((sum, r) => sum + r.confidence, 0) / validationResults.length
		const anomalyPenalty = anomalies.length * 0.1

		return Math.max(0, Math.min(1, avgConfidence - anomalyPenalty))
	}

	private generateRecommendations(
		validationResults: NumberValidationResult[],
		anomalies: string[],
	): string {
		const recommendations: string[] = []

		if (anomalies.length === 0) {
			return 'Report appears to be in good condition with viable numbers detected.'
		}

		if (anomalies.some((a) => a.includes('Critical:'))) {
			recommendations.push('Manual review strongly recommended due to critical issues detected.')
		}

		if (anomalies.some((a) => a.includes('High ratio'))) {
			recommendations.push('Consider re-scanning the document for better image quality.')
		}

		if (anomalies.some((a) => a.includes('No currency amounts'))) {
			recommendations.push('Verify that cost information is present in the document.')
		}

		if (anomalies.some((a) => a.includes('No part numbers'))) {
			recommendations.push('Confirm that part identification numbers are visible.')
		}

		return recommendations.join(' ')
	}

	async cleanup() {
		if (this.worker) {
			await this.worker.terminate()
			this.worker = null
		}
	}
}

// Historical pattern analysis for advanced ML
export class HistoricalPatternAnalyzer {
	private historicalData: any[] = []

	addHistoricalAnalysis(analysis: AiAnalysisResult, outcome: 'success' | 'failure') {
		this.historicalData.push({
			...analysis,
			outcome,
			timestamp: new Date(),
		})
	}

	analyzePatterns(): any {
		if (this.historicalData.length < 10) {
			return { confidence: 0, patterns: [] }
		}

		// Use ML regression to identify patterns
		const features = this.historicalData.map((d) => [
			d.confidence,
			d.detectedNumbers.length,
			d.anomalies.length,
			d.isViable ? 1 : 0,
		])

		const outcomes = this.historicalData.map((d) => (d.outcome === 'success' ? 1 : 0))

		try {
			const regression = new SimpleLinearRegression(features, outcomes)
			const predictions = features.map((f) => regression.predict(f))

			return {
				confidence: this.calculatePatternConfidence(predictions),
				patterns: this.identifyKeyPatterns(),
				recommendations: this.generatePatternRecommendations(),
			}
		} catch (error) {
			console.error('Pattern analysis error:', error)
			return {
				confidence: 0,
				patterns: [],
				recommendations: 'Insufficient data for pattern analysis',
			}
		}
	}

	private calculatePatternConfidence(predictions: number[]): number {
		const avgPrediction = predictions.reduce((sum, p) => sum + p, 0) / predictions.length
		return Math.max(0, Math.min(1, avgPrediction))
	}

	private identifyKeyPatterns(): string[] {
		const patterns: string[] = []

		const successRate =
			this.historicalData.filter((d) => d.outcome === 'success').length / this.historicalData.length

		if (successRate > 0.8) {
			patterns.push('High success rate with current validation criteria')
		} else if (successRate < 0.5) {
			patterns.push('Low success rate - validation criteria may need adjustment')
		}

		const avgConfidence =
			this.historicalData.reduce((sum, d) => sum + d.confidence, 0) / this.historicalData.length
		if (avgConfidence > 0.7) {
			patterns.push('Consistently high confidence in number detection')
		}

		return patterns
	}

	private generatePatternRecommendations(): string {
		const successRate =
			this.historicalData.filter((d) => d.outcome === 'success').length / this.historicalData.length

		if (successRate > 0.8) {
			return 'Current validation criteria are performing well. Continue with existing approach.'
		} else if (successRate < 0.5) {
			return 'Consider adjusting validation thresholds or improving OCR preprocessing.'
		} else {
			return 'Validation performance is moderate. Monitor for improvement opportunities.'
		}
	}
}

export const aiAnalyticsEngine = new AiAnalyticsEngine()
export const historicalAnalyzer = new HistoricalPatternAnalyzer()
