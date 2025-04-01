const axios = require('axios');

async function testWebhook() {
  const webhookUrl =
    'https://bca1-190-122-100-19.ngrok-free.app/api/sentry-webhook'; // Ajusta la URL según tu entorno
  const mockSentryEvent = {
    event: {
      id: Date.now(),
      message: '🔥 Wao que error BUUUM!',
      level: 'ERROR',
      timestamp: Date.now(),
    },
  };

  try {
    const response = await axios.post(webhookUrl, mockSentryEvent, {
      headers: {
        'x-sentry-hook-resource': 'error', // 👈 Simula el header de Sentry
      },
    });
    console.log('✅ Webhook response:', response.data);
  } catch (error) {
    console.error(
      '❌ Error al probar el webhook:',
      error.response?.data || error.message,
    );
  }
}

testWebhook();
