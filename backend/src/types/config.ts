export interface AppConfig {
    mode: string;
    name: string;
    version: string;
}

export interface WebConfig {
    hostname: string;
    port: number;
    baseUrl?: string;
}

export interface Config {
    APP: AppConfig;
    WEB: WebConfig;
}

