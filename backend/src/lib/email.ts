import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SERVER_HOST,
	port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
	secure: false,
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PASSWORD,
	},
})

export interface EmailTemplate {
	subject: string
	html: string
	text: string
}

export const emailTemplates = {
	accountVerification: (verificationUrl: string): EmailTemplate => ({
		subject: 'Verifiera ditt Fixa2an-konto',
		html: `
	      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
	        <h1 style="color: #1C3F94;">Välkommen till Fixa2an!</h1>
	        <p>Klicka på länken nedan för att verifiera ditt konto:</p>
	        <a href="${verificationUrl}" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verifiera konto</a>
	        <p>Om länken inte fungerar, kopiera och klistra in denna URL i din webbläsare:</p>
	        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
	      </div>
	    `,
		text: `Välkommen till Fixa2an! Verifiera ditt konto genom att besöka: ${verificationUrl}`,
	}),
}

export async function sendEmail(to: string, template: EmailTemplate) {
	await transporter.sendMail({
		from: process.env.EMAIL_FROM,
		to,
		subject: template.subject,
		html: template.html,
		text: template.text,
	})
}
