import { buildApp } from './app.js';
import { loadEnv, type AppEnv } from './lib/env.js';

async function start(): Promise<void> {
    let env: AppEnv;
    try {
        env = loadEnv();
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Invalid environment configuration');
        process.exit(1);
    }

    const app = await buildApp({ env, logger: true });

    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
        process.once(signal, () => {
            app.log.info({ signal }, 'shutting down');
            app.close()
                .then(() => process.exit(0))
                .catch((error: unknown) => {
                    app.log.error({ err: error }, 'shutdown failed');
                    process.exit(1);
                });
        });
    }

    try {
        await app.listen({ port: env.port, host: '0.0.0.0' });
    } catch (error) {
        app.log.error({ err: error }, 'failed to start');
        process.exit(1);
    }
}

void start();
