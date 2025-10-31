import AWS from 'aws-sdk'
import sharp from 'sharp'

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
})

export async function uploadFile(
	file: Buffer,
	fileName: string,
	mimeType: string,
	folder: string = 'uploads',
): Promise<string> {
	try {
		// For development, return a mock URL if AWS is not configured
		if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
			console.log('AWS not configured, using mock upload')
			return `https://mock-s3-bucket.s3.amazonaws.com/${folder}/${Date.now()}-${fileName}`
		}

		let processedFile = file
		let processedMimeType = mimeType

		// Compress images
		if (mimeType.startsWith('image/')) {
			processedFile = await sharp(file).jpeg({ quality: 85 }).png({ quality: 85 }).toBuffer()
			processedMimeType = 'image/jpeg'
		}

		const key = `${folder}/${Date.now()}-${fileName}`

		const uploadParams = {
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: key,
			Body: processedFile,
			ContentType: processedMimeType,
			ACL: 'private', // Files are private by default
		}

		const result = await s3.upload(uploadParams).promise()
		return result.Location
	} catch (error) {
		console.error('File upload failed:', error)
		throw error
	}
}

export async function getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
	try {
		const key = fileUrl.split('/').pop()?.split('?')[0]
		if (!key) throw new Error('Invalid file URL')

		const params = {
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: key,
			Expires: expiresIn,
		}

		return s3.getSignedUrl('getObject', params)
	} catch (error) {
		console.error('Failed to generate signed URL:', error)
		throw error
	}
}

export async function deleteFile(fileUrl: string): Promise<void> {
	try {
		const key = fileUrl.split('/').pop()?.split('?')[0]
		if (!key) throw new Error('Invalid file URL')

		const params = {
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: key,
		}

		await s3.deleteObject(params).promise()
	} catch (error) {
		console.error('Failed to delete file:', error)
		throw error
	}
}
