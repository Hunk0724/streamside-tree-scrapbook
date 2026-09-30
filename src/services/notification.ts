const NOTIFICATION_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwCSo7sMGuQimiRs4UN72A1l8KzeAKI2JxRprxV_93LZRxm2hxwc-SBfCxcol_nUTQ/exec";

export interface NotificationPayload {
  applicantName: string;
  applicantEmail: string;
  applyTime: string;
}

export async function notifyAdminNewApplicant(payload: NotificationPayload): Promise<void> {
  if (!NOTIFICATION_WEBHOOK_URL) return;
  try {
    await fetch(NOTIFICATION_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('管理員 Email 通知發送失敗:', err);
  }
}
