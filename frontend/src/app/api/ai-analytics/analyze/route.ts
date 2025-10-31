import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { aiAnalyticsEngine, historicalAnalyzer } from '@/lib/ai-analytics'

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { reportId, forceReanalysis = false } = body

		if (!reportId) {
			return NextResponse.json({ message: 'Report ID is required' }, { status: 400 })
		}

		// Get the inspection report
		const report = await prisma.inspectionReport.findUnique({
			where: { id: reportId },
			include: { aiAnalysis: true },
		})

		if (!report) {
			return NextResponse.json({ message: 'Inspection report not found' }, { status: 404 })
		}

		// Check if analysis already exists and is recent (unless force reanalysis)
		const existingAnalysis = report.aiAnalysis.find((a) => a.analysisType === 'NUMBER_VALIDATION')

		if (existingAnalysis && !forceReanalysis) {
			const hoursSinceAnalysis =
				(Date.now() - existingAnalysis.processedAt.getTime()) / (1000 * 60 * 60)

			if (hoursSinceAnalysis < 24) {
				return NextResponse.json({
					message: 'Analysis already exists and is recent',
					analysis: existingAnalysis,
					fromCache: true,
				})
			}
		}

		// Perform AI analysis
		const analysisResult = await aiAnalyticsEngine.analyzeInspectionReport(
			report.fileUrl,
			report.mimeType,
		)

		// Store analysis in database
		const savedAnalysis = await prisma.aiAnalysis.create({
			data: {
				reportId: report.id,
				analysisType: analysisResult.analysisType,
				confidence: analysisResult.confidence,
				isViable: analysisResult.isViable,
				detectedNumbers: JSON.stringify(analysisResult.detectedNumbers),
				anomalies: JSON.stringify(analysisResult.anomalies),
				recommendations: analysisResult.recommendations,
			},
		})

		// Add to historical data for pattern analysis
		historicalAnalyzer.addHistoricalAnalysis(analysisResult, 'success') // Default to success, could be updated later

		return NextResponse.json({
			message: 'Analysis completed successfully',
			analysis: {
				...savedAnalysis,
				detectedNumbers: JSON.parse(savedAnalysis.detectedNumbers),
				anomalies: JSON.parse(savedAnalysis.anomalies),
			},
			fromCache: false,
		})
	} catch (error) {
		console.error('AI analysis error:', error)
		return NextResponse.json({ message: 'Failed to analyze inspection report' }, { status: 500 })
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)

		if (!session) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const reportId = searchParams.get('reportId')

		if (!reportId) {
			return NextResponse.json({ message: 'Report ID is required' }, { status: 400 })
		}

		// Get analysis results
		const analysis = await prisma.aiAnalysis.findMany({
			where: { reportId },
			orderBy: { processedAt: 'desc' },
		})

		if (analysis.length === 0) {
			return NextResponse.json({ message: 'No analysis found for this report' }, { status: 404 })
		}

		// Parse JSON fields
		const parsedAnalysis = analysis.map((a) => ({
			...a,
			detectedNumbers: JSON.parse(a.detectedNumbers),
			anomalies: JSON.parse(a.anomalies),
		}))

		return NextResponse.json({
			analysis: parsedAnalysis,
			latest: parsedAnalysis[0],
		})
	} catch (error) {
		console.error('Get analysis error:', error)
		return NextResponse.json({ message: 'Failed to retrieve analysis' }, { status: 500 })
	}
}
