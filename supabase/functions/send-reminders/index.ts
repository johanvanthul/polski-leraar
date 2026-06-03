// Polski Leraar — Supabase Edge Function: send-reminders
// Wordt elk uur aangeroepen via pg_cron (0 * * * *).
// Stuurt Web Push naar gebruikers waarvan het reminder-tijdstip ±10 min geleden is
// én die hun dagelijks doel nog niet gehaald hebben.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webPush from 'npm:web-push@3.6.7';

// ─── Tijdzone ──────────────────────────────────────────────────────────────
const TZ = 'Europe/Amsterdam';

function amsterdamNow(): { h: number; m: number } {
  const parts = new Intl.DateTimeFormat('nl-NL', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  return {
    h: parseInt(parts.find(p => p.type === 'hour')!.value),
    m: parseInt(parts.find(p => p.type === 'minute')!.value),
  };
}

function amsterdamDateStr(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date());
}

// ─── VAPID ─────────────────────────────────────────────────────────────────
// Publieke sleutel staat ook in frontend (veilig). Private sleutel uitsluitend hier.
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

webPush.setVapidDetails('mailto:johanvanthul@gmail.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// ─── Helper: log naar push_log tabel ──────────────────────────────────────
async function logPush(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  status: 'success' | 'failed' | 'skipped' | 'invalid_subscription',
  error?: string,
  endpoint?: string,
) {
  await supabase.from('push_log').insert({
    user_id:  userId,
    status,
    error:    error ?? null,
    endpoint: endpoint ? endpoint.slice(0, 120) : null,
  });
}

// ─── Handler ───────────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const local = amsterdamNow();
  const today = amsterdamDateStr();
  const nowUtcIso = new Date().toISOString();
  const log: string[] = [
    `Uitvoering: ${nowUtcIso} UTC`,
    `Amsterdam lokaal: ${local.h}:${String(local.m).padStart(2, '0')}, datum: ${today}`,
  ];

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: settingsList, error } = await supabase
    .from('user_settings')
    .select('user_id, reminder_time, daily_goal, push_subscription')
    .eq('reminder_enabled', true)
    .not('push_subscription', 'is', null);

  if (error) {
    log.push(`DB fout: ${error.message}`);
    return new Response(log.join('\n'), { status: 500 });
  }

  log.push(`Gebruikers met reminder + subscription: ${settingsList?.length ?? 0}`);

  for (const s of settingsList ?? []) {
    const uid = s.user_id.slice(0, 8);

    if (!s.reminder_time || !s.push_subscription) {
      log.push(`${uid}: overgeslagen (ontbrekende reminder_time of subscription)`);
      await logPush(supabase, s.user_id, 'skipped', 'Ontbrekende reminder_time of subscription');
      continue;
    }

    // ── Tijdstip check (Amsterdam lokaal) ──────────────────────────────────
    const [rh, rm] = s.reminder_time.split(':').map(Number);
    const currentMin = local.h * 60 + local.m;
    const targetMin  = rh * 60 + rm;
    const rawDiff    = Math.abs(currentMin - targetMin);
    const diffMin    = Math.min(rawDiff, 1440 - rawDiff);

    log.push(`${uid}: reminder=${s.reminder_time}, nu=${local.h}:${String(local.m).padStart(2,'0')}, verschil=${diffMin}min`);

    if (diffMin > 10) {
      log.push(`  → buiten ±10min venster, overgeslagen`);
      continue;
    }

    // ── Dagelijks doel check ───────────────────────────────────────────────
    const { data: stats } = await supabase
      .from('user_stats')
      .select('today_reviews, today_date')
      .eq('user_id', s.user_id)
      .maybeSingle();

    const done = (stats?.today_date === today ? stats.today_reviews : 0) ?? 0;
    const goal = s.daily_goal ?? 20;

    log.push(`  → voortgang: ${done}/${goal} (DB today_date: ${stats?.today_date ?? 'leeg'}, verwacht: ${today})`);

    if (done >= goal) {
      log.push(`  → doel gehaald, geen notificatie`);
      continue;
    }

    // ── Push sturen ────────────────────────────────────────────────────────
    let subscription: PushSubscription;
    try {
      subscription = JSON.parse(s.push_subscription);
    } catch {
      log.push(`  → ❌ Ongeldige subscription JSON, opgeruimd`);
      await supabase.from('user_settings').update({ push_subscription: null }).eq('user_id', s.user_id);
      await logPush(supabase, s.user_id, 'invalid_subscription', 'Ongeldige JSON in push_subscription');
      continue;
    }

    try {
      await webPush.sendNotification(
        subscription,
        JSON.stringify({
          title: '🇵🇱 Pools oefenen!',
          body:  `Je hebt nog ${goal - done} woorden te gaan vandaag.`,
        }),
      );
      log.push(`  → ✅ Notificatie verstuurd`);
      await logPush(supabase, s.user_id, 'success', undefined, (subscription as any).endpoint);
    } catch (e: any) {
      log.push(`  → ❌ Push mislukt: ${e.message}`);
      // 410 Gone of 404 = subscription verlopen/ongeldig → opruimen
      if (e.statusCode === 410 || e.statusCode === 404) {
        log.push(`  → Subscription verlopen (${e.statusCode}), opgeruimd`);
        await supabase.from('user_settings')
          .update({ push_subscription: null, reminder_enabled: false })
          .eq('user_id', s.user_id);
        await logPush(supabase, s.user_id, 'invalid_subscription', `HTTP ${e.statusCode} — verlopen`, (subscription as any).endpoint);
      } else {
        await logPush(supabase, s.user_id, 'failed', e.message, (subscription as any).endpoint);
      }
    }
  }

  return new Response(log.join('\n'), { status: 200 });
});
