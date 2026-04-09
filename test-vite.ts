import { build } from 'vite';
build({
  root: '.',
  build: {
    lib: {
      entry: 'src/lib/cube.ts',
      name: 'CubeTest',
      formats: ['iife']
    },
    write: false
  }
}).then(res => {
  console.log("Build successful");
}).catch(e => {
  console.error(e);
});
