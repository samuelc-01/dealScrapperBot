import { startScheduler } from './services/scheduler';
import { runDealPipeline } from './services/pipeline';

async function main() {
  console.log('[bootstrap] AliExpress affiliate pipeline starting');
  const firstRun = await runDealPipeline();
  console.log('[bootstrap] first cycle result', firstRun);
  startScheduler();
}

main().catch((error) => {
  console.error('[bootstrap] fatal error', error);
  process.exit(1);
});
