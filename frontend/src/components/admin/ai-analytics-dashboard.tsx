'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart3, RefreshCw } from 'lucide-react'

interface PatternAnalysis {
	confidence: number
	patterns: string[]
	recommendations: string
}

interface AnalyticsStats {
	totalAnalyses: number
	viableReports: number
	nonViableReports: number
	averageConfidence: number
	successRate: number
	commonAnomalies: Array<{
		anomaly: string
		count: number
		percentage: number
	}>
	confidenceDistribution: Array<{
		range: string
		count: number
		percentage: number
	}>
}

interface AiAnalyticsDashboardProps {
	className?: string
}

export function AiAnalyticsDashboard({ className }: AiAnalyticsDashboardProps) {
	const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null)
	const [stats, setStats] = useState<AnalyticsStats | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchAnalytics = async () => {
		setLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/ai-analytics/patterns')

			if (!response.ok) {
				throw new Error('Failed to fetch analytics data')
			}

			const data = await response.json()
			setPatternAnalysis(data.patternAnalysis)
			setStats(data.statistics)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAnalytics()
	}, [])

	if (loading && !stats) {
		return (
			<Card className={`p-6 ${className}`}>
				<div className="flex items-center space-x-2">
					<RefreshCw className="h-4 w-4 animate-spin" />
					<span>Loading AI analytics...</span>
				</div>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className={`p-6 border-red-200 ${className}`}>
				<div className="flex items-center space-x-2 text-red-600">
					<AlertTriangle className="h-4 w-4" />
					<span>Error: {error}</span>
				</div>
				<Button onClick={fetchAnalytics} variant="outline" size="sm" className="mt-2">
					Retry
				</Button>
			</Card>
		)
	}

	if (!stats) {
		return (
			<Card className={`p-6 ${className}`}>
				<div className="text-center text-gray-500">No analytics data available.</div>
			</Card>
		)
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Brain className="h-6 w-6 text-blue-600" />
					<h2 className="text-2xl font-bold">AI Analytics Dashboard</h2>
				</div>
				<Button onClick={fetchAnalytics} variant="outline" disabled={loading}>
					{loading ? (
						<RefreshCw className="h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4" />
					)}
					Refresh
				</Button>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<BarChart3 className="h-5 w-5 text-blue-600" />
						<div>
							<div className="text-2xl font-bold">{stats.totalAnalyses}</div>
							<div className="text-sm text-gray-600">Total Analyses</div>
						</div>
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<CheckCircle className="h-5 w-5 text-green-600" />
						<div>
							<div className="text-2xl font-bold">{stats.viableReports}</div>
							<div className="text-sm text-gray-600">Viable Reports</div>
						</div>
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<AlertTriangle className="h-5 w-5 text-red-600" />
						<div>
							<div className="text-2xl font-bold">{stats.nonViableReports}</div>
							<div className="text-sm text-gray-600">Non-Viable Reports</div>
						</div>
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<TrendingUp className="h-5 w-5 text-purple-600" />
						<div>
							<div className="text-2xl font-bold">{Math.round(stats.averageConfidence * 100)}%</div>
							<div className="text-sm text-gray-600">Avg Confidence</div>
						</div>
					</div>
				</Card>
			</div>

			{/* Pattern Analysis */}
			{patternAnalysis && (
				<Card className="p-6">
					<h3 className="text-lg font-semibold mb-4">Pattern Analysis</h3>

					<div className="mb-4">
						<div className="flex justify-between text-sm text-gray-600 mb-1">
							<span>Pattern Confidence</span>
							<span>{Math.round(patternAnalysis.confidence * 100)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full ${
									patternAnalysis.confidence >= 0.8
										? 'bg-green-500'
										: patternAnalysis.confidence >= 0.6
											? 'bg-yellow-500'
											: patternAnalysis.confidence >= 0.4
												? 'bg-orange-500'
												: 'bg-red-500'
								}`}
								style={{ width: `${patternAnalysis.confidence * 100}%` }}
							/>
						</div>
					</div>

					{patternAnalysis.patterns.length > 0 && (
						<div className="mb-4">
							<h4 className="font-medium mb-2">Identified Patterns</h4>
							<div className="space-y-1">
								{patternAnalysis.patterns.map((pattern, index) => (
									<div key={index} className="flex items-center space-x-2 text-sm">
										<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
										<span>{pattern}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{patternAnalysis.recommendations && (
						<div>
							<h4 className="font-medium mb-2">Recommendations</h4>
							<div className="flex items-start space-x-2 text-sm text-blue-600">
								<TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
								<span>{patternAnalysis.recommendations}</span>
							</div>
						</div>
					)}
				</Card>
			)}

			{/* Common Anomalies */}
			{stats.commonAnomalies.length > 0 && (
				<Card className="p-6">
					<h3 className="text-lg font-semibold mb-4">Most Common Anomalies</h3>
					<div className="space-y-3">
						{stats.commonAnomalies.slice(0, 5).map((anomaly, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Badge variant="outline" className="text-xs">
										{anomaly.count}
									</Badge>
									<span className="text-sm">{anomaly.anomaly}</span>
								</div>
								<div className="text-sm text-gray-600">{anomaly.percentage.toFixed(1)}%</div>
							</div>
						))}
					</div>
				</Card>
			)}

			{/* Confidence Distribution */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">Confidence Distribution</h3>
				<div className="space-y-3">
					{stats.confidenceDistribution.map((dist, index) => (
						<div key={index} className="flex items-center justify-between">
							<span className="text-sm">{dist.range}</span>
							<div className="flex items-center space-x-2">
								<div className="w-32 bg-gray-200 rounded-full h-2">
									<div
										className="bg-blue-500 h-2 rounded-full"
										style={{ width: `${dist.percentage}%` }}
									/>
								</div>
								<span className="text-sm text-gray-600 w-12 text-right">
									{dist.count} ({dist.percentage.toFixed(1)}%)
								</span>
							</div>
						</div>
					))}
				</div>
			</Card>

			{/* Success Rate */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">Success Rate Analysis</h3>
				<div className="flex items-center space-x-4">
					<div className="text-3xl font-bold text-green-600">
						{Math.round(stats.successRate * 100)}%
					</div>
					<div>
						<div className="text-sm text-gray-600">Overall Success Rate</div>
						<div className="text-xs text-gray-500">Based on {stats.totalAnalyses} analyses</div>
					</div>
				</div>

				<div className="mt-4">
					<div className="flex justify-between text-sm text-gray-600 mb-1">
						<span>Success Rate</span>
						<span>{Math.round(stats.successRate * 100)}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className={`h-2 rounded-full ${
								stats.successRate >= 0.8
									? 'bg-green-500'
									: stats.successRate >= 0.6
										? 'bg-yellow-500'
										: stats.successRate >= 0.4
											? 'bg-orange-500'
											: 'bg-red-500'
							}`}
							style={{ width: `${stats.successRate * 100}%` }}
						/>
					</div>
				</div>
			</Card>
		</div>
	)
}
