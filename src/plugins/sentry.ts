import { App } from 'vue';
import { captureException, init, setTag } from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import { version } from '../../package.json';
import { Network, networkId } from '@/composables/useNetwork';

// Using Sentry's vanila JS package (@sentry/browser) here instead of
// the official vue package (@sentry/vue) because it doesn't support vue 3 yet.
// https://github.com/getsentry/sentry-javascript/issues/2925

const ENV = process.env.VUE_APP_ENV || 'development';
const networkMap = {
  [Network.MAINNET]: 'mainnet',
  [Network.KOVAN]: 'kovan',
  [Network.POLYGON]: 'polygon',
  [Network.ARBITRUM]: 'arbitrum-one',
  [Network.GNOSIS]: 'gnosis',
  [Network.CELO]: 'celo'
};
const environment = `${ENV}-${networkMap[networkId.value]}`;
const release = `frontend-v2@${version}`;

export default function initSentry(app: App) {
  if (['production', 'staging'].includes(ENV)) {
    app.config.errorHandler = (error, _, info) => {
      try {
        setTag('info', info);
        captureException(error, {
          extra: {
            error: error
          }
        });
      } catch (error) {
        console.error('Failed to send error to Sentry', error);
      }
    };

    init({
      dsn:
        'https://83a8ae1e00b841e8a46ba0a61c2f19f8@o1174197.ingest.sentry.io/6270006',
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      environment,
      release
    });
  }
}
