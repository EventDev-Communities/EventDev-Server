import { createHmac } from 'node:crypto'
import { config } from '@dotenvx/dotenvx'

// Carrega variáveis de ambiente do arquivo .env
config()

const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
const port = process.env.NODE_PORT || 5122
const baseUrl = `http://localhost:${port}`

const paymentId = process.argv[2]

if (!paymentId) {
  console.error('\n❌ Erro: ID do pagamento não fornecido.')
  console.error('Uso: pnpm simulate:webhook <payment_id>\n')
  process.exit(1)
}

if (!secret) {
  console.error('\n❌ Erro: MERCADO_PAGO_WEBHOOK_SECRET não encontrado no .env')
  process.exit(1)
}

async function simulateWebhook() {
  if (!secret) {
    throw new Error('MERCADO_PAGO_WEBHOOK_SECRET is not defined')
  }

  const requestId = `req-${Date.now()}`
  const ts = Date.now().toString()

  // Formato exato esperado pelo OrderService.validateWebhookSignature
  // manifest = `id:${id};request-id:${requestId};ts:${ts};`
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`

  const hmac = createHmac('sha256', secret)
  hmac.update(manifest)
  const signatureHash = hmac.digest('hex')

  const signatureHeader = `ts=${ts},v1=${signatureHash}`

  const webhookUrl = `${baseUrl}/api/v1/webhooks/mercadopago`

  console.warn(`\n🚀 Simulando Webhook do Mercado Pago`)
  console.warn(`📍 URL: ${webhookUrl}`)
  console.warn(`🆔 Payment ID: ${paymentId}`)
  console.warn(`🔑 Request ID: ${requestId}`)
  console.warn(`📝 Signature: ${signatureHeader}`)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'x-signature': signatureHeader
      },
      body: JSON.stringify({
        action: 'payment.created',
        api_version: 'v1',
        data: {
          id: paymentId
        },
        date_created: new Date().toISOString(),
        id: Number(paymentId),
        live_mode: false,
        type: 'payment',
        user_id: '123456789'
      })
    })

    if (response.ok) {
      console.warn('\n✅ Webhook enviado com sucesso!')
      console.warn(`Status: ${response.status} ${response.statusText}`)
      const data = await response.json().catch(() => ({})) as unknown
      console.warn('Response:', data)
    } else {
      console.error('\n❌ Falha ao enviar webhook')
      console.error(`Status: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error('Response:', text)
    }
  } catch (error) {
    console.error('\n❌ Erro de conexão:', error instanceof Error ? error.message : String(error))
  }
}

simulateWebhook().catch((err) => console.error(err))
