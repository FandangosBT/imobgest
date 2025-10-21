import { http, HttpResponse } from 'msw';

// In-memory mocks
const clicksignEnvelopes: Record<string, { id: string; contratoId: string; status: 'created' | 'sent' | 'signed' }> = {};

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ ok: true, service: 'imobgest-mock' });
  }),
  http.get('/api/boletos', () => {
    return HttpResponse.json({ data: [], count: 0 });
  }),

  // Clicksign (assinatura digital) – mock
  http.post('/api/clicksign/envelopes', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { contratoId?: string };
    const id = 'env_' + Math.random().toString(36).slice(2, 10);
    clicksignEnvelopes[id] = { id, contratoId: body?.contratoId || 'unknown', status: 'created' };
    return HttpResponse.json({ envelopeId: id, status: 'created' });
  }),
  http.post('/api/clicksign/envelopes/:id/send', ({ params }) => {
    const id = params.id as string;
    if (clicksignEnvelopes[id]) clicksignEnvelopes[id].status = 'sent';
    return HttpResponse.json({ envelopeId: id, status: clicksignEnvelopes[id]?.status || 'sent' });
  }),
  http.post('/api/clicksign/envelopes/:id/sign', ({ params }) => {
    const id = params.id as string;
    if (clicksignEnvelopes[id]) clicksignEnvelopes[id].status = 'signed';
    return HttpResponse.json({ envelopeId: id, status: clicksignEnvelopes[id]?.status || 'signed' });
  }),
  http.get('/api/clicksign/envelopes/:id/status', ({ params }) => {
    const id = params.id as string;
    return HttpResponse.json({ envelopeId: id, status: clicksignEnvelopes[id]?.status || 'created' });
  }),

  // Pagamentos (Asaas/Juno) – mock
  http.post('/api/payments/emit', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { boletoId?: string };
    return HttpResponse.json({ boletoId: body?.boletoId || 'unknown', status: 'issued', barcode: '00190.00009 01234.567890 12345.678904 5 67890000012345' });
  }),
  http.post('/api/payments/webhook', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { boletoId?: string; event?: string };
    return HttpResponse.json({ ok: true, received: body || {} });
  }),

  // Push (OneSignal/Firebase) – mock
  http.post('/api/push', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { title?: string; message?: string };
    return HttpResponse.json({ ok: true, delivered: { title: body?.title || 'Notificação', message: body?.message || 'Push (mock)' } });
  }),
];
