import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { historicalAnalyzer } from '@/lib/ai-analytics'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		// Get historical analysis data
		const historicalData = await prisma.aiAnalysis.findMany({
			include: {
				report: {
					include: {
						requests: {
							include: {
								bookings: true,
							},
						},
					},
				},
			},
			orderBy: { processedAt: 'desc' },
			take: 1000, // Limit to recent 1000 analyses
		})

		// Add outcomes based on booking success
		const enrichedData = historicalData.map((analysis) => {
			const hasSuccessfulBooking = analysis.report.requests.some((request) =>
				request.bookings.some((booking) => booking.status === 'DONE'),
			)

			return {
				...analysis,
				outcome: hasSuccessfulBooking ? 'success' : 'failure',
			}
		})

		// Add to historical analyzer
		enrichedData.forEach((data) => {
			historicalAnalyzer.addHistoricalAnalysis(
				{
					analysisType: data.analysisType,
					confidence: data.confidence,
					isViable: data.isViable,
					detectedNumbers: JSON.parse(data.detectedNumbers),
					anomalies: JSON.parse(data.anomalies),
					recommendations: data.recommendations,
				},
				data.outcome,
			)
		})

		// Get pattern analysis
		const patternAnalysis = historicalAnalyzer.analyzePatterns()

		// Get additional statistics
		const stats = {
			totalAnalyses: historicalData.length,
			viableReports: historicalData.filter((a) => a.isViable).length,
			nonViableReports: historicalData.filter((a) => !a.isViable).length,
			averageConfidence:
				historicalData.reduce((sum, a) => sum + a.confidence, 0) / historicalData.length,
			successRate: enrichedData.filter((d) => d.outcome === 'success').length / enrichedData.length,
			commonAnomalies: getCommonAnomalies(historicalData),
			confidenceDistribution: getConfidenceDistribution(historicalData),
		}

		return NextResponse.json({
			patternAnalysis,
			statistics: stats,
			message: 'Pattern analysis completed successfully',
		})
	} catch (error) {
		console.error('Pattern analysis error:', error)
		return NextResponse.json({ message: 'Failed to analyze patterns' }, { status: 500 })
	}
}

function getCommonAnomalies(
	analyses: any[],
): { anomaly: string; count: number; percentage: number }[] {
	const anomalyCounts: { [key: string]: number } = {}

	analyses.forEach((analysis) => {
		const anomalies = JSON.parse(analysis.anomalies)
		anomalies.forEach((anomaly: string) => {
			anomalyCounts[anomaly] = (anomalyCounts[anomaly] || 0) + 1
		})
	})

	const total = analyses.length
	return Object.entries(anomalyCounts)
		.map(([anomaly, count]) => ({
			anomaly,
			count,
			percentage: (count / total) * 100,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10) // Top 10 most common anomalies
}

function getConfidenceDistribution(
	analyses: any[],
): { range: string; count: number; percentage: number }[] {
	const ranges = [
		{ min: 0, max: 0.2, label: 'Very Low (0-0.2)' },
		{ min: 0.2, max: 0.4, label: 'Low (0.2-0.4)' },
		{ min: 0.4, max: 0.6, label: 'Medium (0.4-0.6)' },
		{ min: 0.6, max: 0.8, label: 'High (0.6-0.8)' },
		{ min: 0.8, max: 1.0, label: 'Very High (0.8-1.0)' },
	]

	const distribution = ranges.map((range) => {
		const count = analyses.filter(
			(a) => a.confidence >= range.min && a.confidence < range.max,
		).length
		return {
			range: range.label,
			count,
			percentage: (count / analyses.length) * 100,
		}
	})

	return distribution
}
