import axios from 'axios';

/**
 * Dispatch SMS or WhatsApp notifications via Twilio REST API
 * Supports both standard SMS and WhatsApp channels.
 */
export const sendExternalNotification = async (
  toPhone: string,
  message: string,
  channel: 'SMS' | 'WHATSAPP' = 'SMS'
) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!accountSid || !authToken) {
    // Graceful fallback when credentials are not yet configured in .env
    console.log(`📱 [SMS/WhatsApp Gateway] Credentials pending. Simulated dispatch to ${toPhone}: "${message.slice(0, 80)}..."`);
    return { success: false, reason: 'Twilio credentials not fully set in .env' };
  }

  try {
    const isWhatsApp = channel === 'WHATSAPP';
    const from = isWhatsApp ? fromWhatsApp : fromNumber;
    const to = isWhatsApp
      ? (toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`)
      : toPhone;

    if (!from) {
      console.log(`📱 [SMS/WhatsApp Gateway] Missing ${isWhatsApp ? 'TWILIO_WHATSAPP_NUMBER' : 'TWILIO_PHONE_NUMBER'} in .env`);
      return { success: false, reason: 'Sender number not set' };
    }

    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('From', from);
    params.append('To', to);
    params.append('Body', message);

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    console.log(`✅ [SMS/WhatsApp Gateway] Dispatched successfully to ${to}! Message SID: ${response.data.sid}`);
    return { success: true, sid: response.data.sid };
  } catch (error: any) {
    console.error(`❌ [SMS/WhatsApp Gateway] Twilio error:`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

