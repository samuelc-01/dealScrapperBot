import cron from 'node-cron';
import { env } from '../config/env';
import { runDealPipeline } from './pipeline';

function buildCronExpression(everyMinutes: number): string {
  return `*/${everyMinutes} * * * *`;
}

export function startScheduler(): void {
  const expression = buildCronExpression(env.pollIntervalMinutes);
  cron.schedule(expression, async () => {
    try {
      const summary = await runDealPipeline();
      console.log('[scheduler] cycle finished', summary);
    } catch (error) {
      console.error('[scheduler] cycle failed', error);
    }
  });

  console.log(`[scheduler] running with ${expression}`);
}
