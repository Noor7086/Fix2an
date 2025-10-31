'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, RefreshCw, Brain, TrendingUp, AlertTriangle } from 'lucide-react'

interface AiAnalysis {
	id: string
	analysisType: string
	confidence: number
	isViable: boolean
	detectedNumbers: string[]
	anomalies: string[]
	recommendations?: string
	processedAt: string
}

interface AiAnalysisDisplayProps {
	reportId: string
	onAnalysisUpdate?: (analysis: AiAnalysis) => void
}

export function AiAnalysisDisplay({ reportId, onAnalysisUpdate }: AiAnalysisDisplayProps) {
	const [analysis, setAnalysis] = useState<AiAnalysis | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchAnalysis = async (forceReanalysis = false) => {
		setLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/ai-analytics/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					reportId,
					forceReanalysis,
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to fetch analysis')
			}

			const data = await response.json()
			setAnalysis(data.analysis)

			if (onAnalysisUpdate) {
				onAnalysisUpdate(data.analysis)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAnalysis()
	}, [reportId])

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.8) return 'bg-green-100 text-green-800'
		if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
		if (confidence >= 0.4) return 'bg-orange-100 text-orange-800'
		return 'bg-red-100 text-red-800'
	}

	const getConfidenceLabel = (confidence: number) => {
		if (confidence >= 0.8) return 'Very High'
		if (confidence >= 0.6) return 'High'
		if (confidence >= 0.4) return 'Medium'
		if (confidence >= 0.2) return 'Low'
		return 'Very Low'
	}

	if (loading && !analysis) {
		return (
			<Card className="p-6">
				<div className="flex items-center space-x-2">
					<RefreshCw className="h-4 w-4 animate-spin" />
					<span>Analyzing inspection report...</span>
				</div>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className="p-6 border-red-200">
				<div className="flex items-center space-x-2 text-red-600">
					<AlertCircle className="h-4 w-4" />
					<span>Error: {error}</span>
				</div>
				<Button onClick={() => fetchAnalysis()} variant="outline" size="sm" className="mt-2">
					Retry Analysis
				</Button>
			</Card>
		)
	}

	if (!analysis) {
		return (
			<Card className="p-6">
				<div className="text-center text-gray-500">No AI analysis available for this report.</div>
				<Button onClick={() => fetchAnalysis()} variant="outline" size="sm" className="mt-2">
					Run Analysis
				</Button>
			</Card>
		)
	}

	return (
		<div className="space-y-4">
			{/* Analysis Summary */}
			<Card className="p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-2">
						<Brain className="h-5 w-5 text-blue-600" />
						<h3 className="text-lg font-semibold">AI-Powered Analysis</h3>
					</div>
					<div className="flex items-center space-x-2">
						<Badge className={`${getConfidenceColor(analysis.confidence)} border-0`}>
							{getConfidenceLabel(analysis.confidence)} Confidence
						</Badge>
						<Button
							onClick={() => fetchAnalysis(true)}
							variant="outline"
							size="sm"
							disabled={loading}
						>
							{loading ? (
								<RefreshCw className="h-4 w-4 animate-spin" />
							) : (
								<RefreshCw className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				{/* Viability Status */}
				<div className="flex items-center space-x-2 mb-4">
					{analysis.isViable ? (
						<>
							<CheckCircle className="h-5 w-5 text-green-600" />
							<span className="text-green-600 font-medium">Report appears viable</span>
						</>
					) : (
						<>
							<AlertTriangle className="h-5 w-5 text-red-600" />
							<span className="text-red-600 font-medium">Report may have issues</span>
						</>
					)}
				</div>

				{/* Confidence Score */}
				<div className="mb-4">
					<div className="flex justify-between text-sm text-gray-600 mb-1">
						<span>Confidence Score</span>
						<span>{Math.round(analysis.confidence * 100)}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className={`h-2 rounded-full ${
								analysis.confidence >= 0.8
									? 'bg-green-500'
									: analysis.confidence >= 0.6
										? 'bg-yellow-500'
										: analysis.confidence >= 0.4
											? 'bg-orange-500'
											: 'bg-red-500'
							}`}
							style={{ width: `${analysis.confidence * 100}%` }}
						/>
					</div>
				</div>

				{/* Detected Numbers */}
				{analysis.detectedNumbers.length > 0 && (
					<div className="mb-4">
						<h4 className="font-medium mb-2">
							Detected Numbers ({analysis.detectedNumbers.length})
						</h4>
						<div className="flex flex-wrap gap-2">
							{analysis.detectedNumbers.slice(0, 10).map((number, index) => (
								<Badge key={index} variant="secondary" className="text-xs">
									{number}
								</Badge>
							))}
							{analysis.detectedNumbers.length > 10 && (
								<Badge variant="outline" className="text-xs">
									+{analysis.detectedNumbers.length - 10} more
								</Badge>
							)}
						</div>
					</div>
				)}

				{/* Anomalies */}
				{analysis.anomalies.length > 0 && (
					<div className="mb-4">
						<h4 className="font-medium mb-2 text-red-600">Detected Anomalies</h4>
						<div className="space-y-1">
							{analysis.anomalies.map((anomaly, index) => (
								<div key={index} className="flex items-start space-x-2 text-sm text-red-600">
									<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span>{anomaly}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Recommendations */}
				{analysis.recommendations && (
					<div className="mb-4">
						<h4 className="font-medium mb-2 text-blue-600">AI Recommendations</h4>
						<div className="flex items-start space-x-2 text-sm text-blue-600">
							<TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
							<span>{analysis.recommendations}</span>
						</div>
					</div>
				)}

				{/* Analysis Metadata */}
				<div className="text-xs text-gray-500 border-t pt-2">
					Analysis completed: {new Date(analysis.processedAt).toLocaleString()}
				</div>
			</Card>

			{/* Advanced Analytics */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">
							{analysis.detectedNumbers.length}
						</div>
						<div className="text-sm text-gray-600">Numbers Detected</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600">{analysis.anomalies.length}</div>
						<div className="text-sm text-gray-600">Anomalies Found</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">
							{Math.round(analysis.confidence * 100)}%
						</div>
						<div className="text-sm text-gray-600">Confidence Score</div>
					</div>
				</div>
			</Card>
		</div>
	)
}
