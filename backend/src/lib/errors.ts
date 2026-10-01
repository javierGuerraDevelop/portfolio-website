/** Error with an HTTP status that the app error handler turns into the error envelope. */
export class ApiError extends Error {
    readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}
