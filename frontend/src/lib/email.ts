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

	uploadReceived: (): EmailTemplate => ({
		subject: 'Din förfrågan har mottagits',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Tack för din förfrågan!</h1>
        <p>Vi har mottagit din inspektionsrapport och skickar nu ut förfrågan till verifierade verkstäder i ditt område.</p>
        <p>Du kommer att få erbjudanden inom 24 timmar.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-cases" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se mina ärenden</a>
      </div>
    `,
		text: 'Tack för din förfrågan! Vi har mottagit din inspektionsrapport och skickar nu ut förfrågan till verifierade verkstäder i ditt område.',
	}),

	newOffer: (workshopName: string, price: number): EmailTemplate => ({
		subject: `Nytt erbjudande från ${workshopName}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Nytt erbjudande!</h1>
        <p>Du har fått ett nytt erbjudande från <strong>${workshopName}</strong> för ${price} SEK.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-cases" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se alla erbjudanden</a>
      </div>
    `,
		text: `Du har fått ett nytt erbjudande från ${workshopName} för ${price} SEK.`,
	}),

	bookingConfirmed: (workshopName: string, date: string, time: string): EmailTemplate => ({
		subject: 'Bokning bekräftad',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #34C759;">Bokning bekräftad!</h1>
        <p>Din bokning hos <strong>${workshopName}</strong> är bekräftad.</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Tid:</strong> ${time}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-cases" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se bokning</a>
      </div>
    `,
		text: `Din bokning hos ${workshopName} är bekräftad för ${date} kl ${time}.`,
	}),

	paymentConfirmed: (amount: number): EmailTemplate => ({
		subject: 'Betalning bekräftad',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #34C759;">Betalning bekräftad!</h1>
        <p>Din betalning på ${amount} SEK har bekräftats.</p>
        <p>Du kommer att få en kvitto via e-post från Klarna.</p>
      </div>
    `,
		text: `Din betalning på ${amount} SEK har bekräftats.`,
	}),

	reminder24h: (workshopName: string, date: string, time: string): EmailTemplate => ({
		subject: 'Påminnelse: Din bokning imorgon',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Påminnelse</h1>
        <p>Detta är en påminnelse om din bokning imorgon hos <strong>${workshopName}</strong>.</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Tid:</strong> ${time}</p>
        <p>Om du behöver ändra tiden, kontakta verkstaden direkt.</p>
      </div>
    `,
		text: `Påminnelse: Din bokning imorgon hos ${workshopName} kl ${time}.`,
	}),

	jobComplete: (workshopName: string): EmailTemplate => ({
		subject: 'Jobbet är klart!',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #34C759;">Jobbet är klart!</h1>
        <p>Ditt jobb hos <strong>${workshopName}</strong> är nu klart.</p>
        <p>Du kan hämta din bil och betala på plats.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-cases" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se detaljer</a>
      </div>
    `,
		text: `Ditt jobb hos ${workshopName} är nu klart.`,
	}),

	reviewRequest: (workshopName: string): EmailTemplate => ({
		subject: 'Lämna en recension',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Hur var din upplevelse?</h1>
        <p>Tack för att du använde Fixa2an! Vi hoppas att du är nöjd med servicen från <strong>${workshopName}</strong>.</p>
        <p>Hjälp andra kunder genom att lämna en recension:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-cases" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Lämna recension</a>
      </div>
    `,
		text: `Tack för att du använde Fixa2an! Lämna en recension för ${workshopName}.`,
	}),

	workshopWelcome: (): EmailTemplate => ({
		subject: 'Välkommen till Fixa2an som verkstad!',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Välkommen till Fixa2an!</h1>
        <p>Tack för att du registrerade dig som verkstad. Vi granskar din ansökan och kommer att kontakta dig snart.</p>
        <p>När du är godkänd kan du börja ta emot förfrågningar från kunder i ditt område.</p>
      </div>
    `,
		text: 'Välkommen till Fixa2an som verkstad! Vi granskar din ansökan och kommer att kontakta dig snart.',
	}),

	newRequest: (customerName: string, vehicleInfo: string): EmailTemplate => ({
		subject: 'Ny förfrågan från kund',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Ny förfrågan!</h1>
        <p>Du har fått en ny förfrågan från <strong>${customerName}</strong> för ${vehicleInfo}.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/workshop/dashboard" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se förfrågan</a>
      </div>
    `,
		text: `Du har fått en ny förfrågan från ${customerName} för ${vehicleInfo}.`,
	}),

	offerWon: (customerName: string, vehicleInfo: string): EmailTemplate => ({
		subject: 'Du vann erbjudandet!',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #34C759;">Grattis!</h1>
        <p>Du vann erbjudandet för <strong>${customerName}</strong>s ${vehicleInfo}!</p>
        <p>Kunden kommer att kontakta dig för att boka en tid.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/workshop/dashboard" style="background-color: #1C3F94; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se bokning</a>
      </div>
    `,
		text: `Du vann erbjudandet för ${customerName}s ${vehicleInfo}!`,
	}),

	offerLost: (customerName: string, vehicleInfo: string): EmailTemplate => ({
		subject: 'Erbjudandet gick till annan verkstad',
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Erbjudandet gick till annan verkstad</h1>
        <p>Tyvärr valde kunden <strong>${customerName}</strong> en annan verkstad för ${vehicleInfo}.</p>
        <p>Fortsätt att skicka konkurrenskraftiga erbjudanden för att vinna fler jobb!</p>
      </div>
    `,
		text: `Tyvärr valde kunden ${customerName} en annan verkstad för ${vehicleInfo}.`,
	}),

	monthlyInvoice: (month: string, totalCommission: number): EmailTemplate => ({
		subject: `Månadsfaktura ${month}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1C3F94;">Månadsfaktura ${month}</h1>
        <p>Här är din månadsfaktura för ${month}.</p>
        <p><strong>Total provision:</strong> ${totalCommission} SEK</p>
        <p>Betalning sker via banköverföring inom 30 dagar.</p>
      </div>
    `,
		text: `Månadsfaktura ${month}: Total provision ${totalCommission} SEK`,
	}),
}

export async function sendEmail(to: string, template: EmailTemplate) {
	try {
		await transporter.sendMail({
			from: process.env.EMAIL_FROM,
			to,
			subject: template.subject,
			html: template.html,
			text: template.text,
		})
	} catch (error) {
		console.error('Failed to send email:', error)
		throw error
	}
}
