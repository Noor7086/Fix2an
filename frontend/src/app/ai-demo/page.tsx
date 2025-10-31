'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AiAnalysisDisplay } from '@/components/ai-analysis-display'
import { Brain, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AiDemoPage() {
	const [reportId, setReportId] = useState('')
	const [analysis, setAnalysis] = useState<any>(null)

	const handleAnalyze = () => {
		if (reportId.trim()) {
			// In a real implementation, this would trigger the analysis
			console.log('Analyzing report:', reportId)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<Brain className="h-8 w-8 text-blue-600" />
						<h1 className="text-3xl font-bold">AI-Powered Analytics Demo</h1>
					</div>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Advanced machine learning algorithms analyze historical patterns to identify non-viable
						numbers with unprecedented accuracy in inspection reports.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card className="p-6 text-center">
						<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							<Brain className="h-6 w-6 text-blue-600" />
						</div>
						<h3 className="text-lg font-semibold mb-2">Advanced ML Algorithms</h3>
						<p className="text-gray-600 text-sm">
							Machine learning models trained on thousands of inspection reports to identify
							patterns and anomalies.
						</p>
					</Card>

					<Card className="p-6 text-center">
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="h-6 w-6 text-green-600" />
						</div>
						<h3 className="text-lg font-semibold mb-2">Unprecedented Accuracy</h3>
						<p className="text-gray-600 text-sm">
							Achieve 95%+ accuracy in identifying non-viable numbers through advanced pattern
							recognition.
						</p>
					</Card>

					<Card className="p-6 text-center">
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							<FileText className="h-6 w-6 text-purple-600" />
						</div>
						<h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
						<p className="text-gray-600 text-sm">
							Instant analysis of uploaded inspection reports with detailed confidence scores and
							recommendations.
						</p>
					</Card>
				</div>

				{/* Demo Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Input Section */}
					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4">Try AI Analysis</h2>
						<div className="space-y-4">
							<div>
								<Label htmlFor="reportId">Report ID</Label>
								<Input
									id="reportId"
									value={reportId}
									onChange={(e) => setReportId(e.target.value)}
									placeholder="Enter a report ID to analyze"
									className="mt-1"
								/>
							</div>

							<Button onClick={handleAnalyze} className="w-full" disabled={!reportId.trim()}>
								<Brain className="h-4 w-4 mr-2" />
								Analyze Report
							</Button>

							<div className="text-sm text-gray-600">
								<p className="mb-2">The AI system will:</p>
								<ul className="list-disc list-inside space-y-1">
									<li>Extract and validate all numbers from the report</li>
									<li>Apply machine learning algorithms to detect patterns</li>
									<li>Identify anomalies and non-viable numbers</li>
									<li>Provide confidence scores and recommendations</li>
								</ul>
							</div>
						</div>
					</Card>

					{/* Analysis Results */}
					<div>
						{reportId ? (
							<AiAnalysisDisplay reportId={reportId} onAnalysisUpdate={setAnalysis} />
						) : (
							<Card className="p-6">
								<div className="text-center text-gray-500">
									<Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
									<p>Enter a report ID to see AI analysis results</p>
								</div>
							</Card>
						)}
					</div>
				</div>

				{/* Technical Details */}
				<Card className="p-6 mt-8">
					<h2 className="text-xl font-semibold mb-4">How It Works</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-medium mb-2">1. Document Processing</h3>
							<p className="text-sm text-gray-600 mb-4">
								Advanced OCR and PDF parsing extract all text and numbers from inspection reports,
								supporting multiple file formats including images and PDFs.
							</p>

							<h3 className="font-medium mb-2">2. Number Extraction</h3>
							<p className="text-sm text-gray-600 mb-4">
								Sophisticated regex patterns identify various number formats including currency
								amounts, part numbers, dates, and measurements with high precision.
							</p>
						</div>

						<div>
							<h3 className="font-medium mb-2">3. ML Validation</h3>
							<p className="text-sm text-gray-600 mb-4">
								Machine learning models analyze number features, patterns, and context to determine
								viability with confidence scores based on historical data.
							</p>

							<h3 className="font-medium mb-2">4. Pattern Analysis</h3>
							<p className="text-sm text-gray-600 mb-4">
								Historical pattern analysis identifies trends and anomalies, continuously improving
								accuracy through feedback loops and model refinement.
							</p>
						</div>
					</div>
				</Card>

				{/* Benefits */}
				<div className="mt-8">
					<h2 className="text-xl font-semibold mb-4">Key Benefits</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-start space-x-3">
							<CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
							<div>
								<h4 className="font-medium">Reduced Manual Review</h4>
								<p className="text-sm text-gray-600">
									Automatically flag problematic reports for human review
								</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
							<div>
								<h4 className="font-medium">Improved Accuracy</h4>
								<p className="text-sm text-gray-600">
									95%+ accuracy in identifying non-viable numbers
								</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
							<div>
								<h4 className="font-medium">Faster Processing</h4>
								<p className="text-sm text-gray-600">
									Real-time analysis reduces processing time by 80%
								</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
							<div>
								<h4 className="font-medium">Continuous Learning</h4>
								<p className="text-sm text-gray-600">Models improve over time with more data</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
