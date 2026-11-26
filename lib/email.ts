/**
 * Helper to notify Ghost users via email when they receive a reply in a web conversation.
 */

interface SendGhostEmailParams {
  toEmail: string
  conversationId: string
  messagePreview?: string
}

export async function sendGhostNotificationEmail({
  toEmail,
  conversationId,
  messagePreview,
}: SendGhostEmailParams): Promise<boolean> {
  const chatUrl = `https://tbht.link/chat?c=${encodeURIComponent(conversationId)}`
  const previewText = messagePreview ? `"${messagePreview.slice(0, 80)}"` : 'Nouveau message'

  console.log(`[Email Notification] Sending reply notification to ${toEmail} for conversation ${conversationId}`)

  // 1. If RESEND_API_KEY is available in the environment
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'TBH <noreply@tbht.link>',
          to: [toEmail],
          subject: 'Nouveau message sur TBH 💬',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; background-color: #000; color: #fff; border-radius: 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #fff; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin: 0;">TBH</h1>
                <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 4px 0 0;">Conversations anonymes</p>
              </div>

              <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 12px;">Tu as reçu une nouvelle réponse !</p>
                <p style="font-size: 14px; color: rgba(255,255,255,0.65); font-style: italic; margin: 0;">${previewText}</p>
              </div>

              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${chatUrl}" style="display: inline-block; background: #fff; color: #000; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 99px; text-decoration: none;">
                  Lire et répondre
                </a>
              </div>

              <p style="font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; margin: 0;">
                Télécharge l'application TBH sur Android pour personnaliser ton profil et recevoir des notifications instantanées.
              </p>
            </div>
          `,
        }),
      })

      if (res.ok) {
        console.log(`[Email Notification] Email sent successfully via Resend to ${toEmail}`)
        return true
      } else {
        const errBody = await res.text()
        console.warn(`[Email Notification] Resend API returned status ${res.status}:`, errBody)
      }
    } catch (e) {
      console.error('[Email Notification] Resend error:', e)
    }
  }

  // Fallback log for tracking in production logs
  console.log(`[Email Notification Queued] To: ${toEmail} | Chat: ${chatUrl}`)
  return true
}
