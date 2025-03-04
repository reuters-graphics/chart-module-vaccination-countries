import * as sapper from '@sapper/server';

import compression from 'compression';
import polka from 'polka';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

if (dev) {
  polka()
    .use(
      compression({ threshold: 0 }),
      sapper.middleware()
    )
    .listen(PORT, err => {
      if (err) console.log('error', err);
    });
} else {
  polka()
    .use(
      '/chart-module-vaccination-lollipop',
      compression({ threshold: 0 }),
      sapper.middleware()
    )
    .listen(PORT, err => {
      if (err) console.log('error', err);
    });
}
