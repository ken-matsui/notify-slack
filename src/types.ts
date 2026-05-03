export type Config = {
	users: User[];
};

export type User = {
	github: string;
	slack: string;
};

export type Extends<T, U extends T> = U;

export type WebhookPayload = typeof import("@actions/github").context.payload;
