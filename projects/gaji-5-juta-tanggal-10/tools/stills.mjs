import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: './src/index.tsx'});
const comp = await selectComposition({serveUrl, id: 'Gaji', browserExecutable: '/usr/bin/google-chrome'});
for (const s of times) {
  await renderStill({serveUrl, composition: comp, frame: Math.round(s*30), output: `out/t${s}.png`, browserExecutable: '/usr/bin/google-chrome', scale: 0.5});
}
console.log('done');
