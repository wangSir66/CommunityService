export namespace Config {
    /*版本号*/
    export const VERSION: string = 'V1.0.0.1';

    export function WssUrl(): string {
        return `wss://wss.hilogame.net/ws/user`;
    }

    export function HttpUrl(): string {
        return `https://api.hilogame.net/api`;
    }
}