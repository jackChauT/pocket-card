// Transactional email via Resend's HTTP API. Without RESEND_API_KEY it logs instead, so dev works offline.
import { DICTS } from './dict';
import type { Lang } from './i18n';

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** `body` is trusted HTML; escape any customer text with esc() first. */
export async function sendEmail(to: string | string[], subject: string, body: string, lang: Lang = 'en') {
  const html = `<div lang="${lang === 'zh-hk' ? 'zh-Hant-HK' : 'en'}" style="font-family:system-ui,'PingFang HK','Microsoft JhengHei',sans-serif;font-size:15px;line-height:1.6;color:#211E1A;max-width:560px">${body}<p style="color:#6A6259;font-size:13px">${esc(DICTS[lang].email.footer)}</p></div>`;
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email not sent: no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) console.error('Email failed', res.status, await res.text());
}

export const button = (href: string, label: string) =>
  `<p><a href="${esc(href)}" style="display:inline-block;background:#211E1A;color:#F6F2EC;padding:14px 26px;border-radius:2px;text-decoration:none">${esc(label)}</a></p>`;
