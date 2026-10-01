import { Resend } from 'resend';
import type { ContactRequest } from '../schemas/contact.js';

export interface ContactDelivery {
    send(message: ContactRequest): Promise<void>;
}

export interface ResendDeliveryConfig {
    apiKey: string;
    to: string;
    from: string;
}

/** Resend-backed delivery adapter (D-005). Kept thin so tests can inject a fake. */
export function createResendDelivery(config: ResendDeliveryConfig): ContactDelivery {
    const resend = new Resend(config.apiKey);

    return {
        async send(message: ContactRequest): Promise<void> {
            const subject =
                message.subject.trim().length > 0
                    ? message.subject
                    : `Portfolio contact from ${message.name}`;

            const { error } = await resend.emails.send({
                from: config.from,
                to: config.to,
                subject,
                replyTo: message.email,
                text: `${message.message}\n\n— ${message.name} <${message.email}>`,
            });

            if (error) {
                throw new Error(`Resend rejected the message: ${error.message}`);
            }
        },
    };
}
