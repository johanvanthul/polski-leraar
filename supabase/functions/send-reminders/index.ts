// Polski Leraar — Supabase Edge Function: send-reminders
// Wordt elk uur aangeroepen via pg_cron.
// Stuurt Web Push naar gebruikers die:
//   - reminder_enabled = true hebben
//   - een push_subscription hebben opgeslagen
//   - hun dagelijks doel nog niet hebben gehaald
//   - het ingestelde reminder-tijdstip nu is (±5 minuten)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webPush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

webPush.setVapidDetails(
  'mailto:johanvanthul@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Haal alle gebruikers op met reminder ingeschakeld en een subscription
  const { data: settingsList, error } = await supabase
    .from('user_settings')
    .select('user_id, reminder_time, daily_goal, push_subscription')
    .eq('reminder_enabled', true)
    .not('push_subscription', 'is', null);

  if (error) return new Response('DB error: ' + error.message, { status: 500 });

  const now = new Date();
  const results: string[] = [];

  for (const s of settingsList ?? []) {
    if (!s.reminder_time || !s.push_subscription) continue;

    // Check of het nu het reminder-tijdstip is (±5 minuten tolerantie)
    const [rh, rm] = s.reminder_time.split(':').map(Number);
    const diffMin = (now.getHours() - rh) * 60 + (now.getMinutes() - rm);
    if (diffMin < 0 || diffMin > 5) continue;

    // Check of dagelijks doel al gehaald is
    const { data: stats } = await supabase
      .from('user_stats')
      .select('today_reviews, today_date')
      .eq('user_id', s.user_id)
      .maybeSingle();

    const today = new Date().toLocaleDateString('sv-SE');
    const done = (stats?.today_date === today ? stats.today_reviews : 0) ?? 0;
    const goal = s.daily_goal ?? 20;

    if (done >= goal) {
      results.push(`${s.user_id}: doel gehaald (${done}/${goal}), geen notificatie`);
      continue;
    }

    // Stuur push
    try {
      const subscription = JSON.parse(s.push_subscription);
      await webPush.sendNotification(
        subscription,
        JSON.stringify({
          title: '🇵🇱 Pools oefenen!',
          body:  `Je hebt nog ${goal - done} woorden te gaan vandaag.`,
        }),
      );
      results.push(`${s.user_id}: notificatie verstuurd`);
    } catch (e) {
      results.push(`${s.user_id}: push mislukt — ${e.message}`);
    }
  }

  return new Response(results.join('\n') || 'Geen reminders verzonden', { status: 200 });
});
