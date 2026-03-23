import { runDealPipeline } from './services/pipeline';

async function test() {
  const summary = await runDealPipeline();
  console.log('Pipeline summary:', summary);
}

test();
