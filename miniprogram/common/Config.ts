export namespace Config {
    /** 版本号 */
    export const VERSION: string = 'V0.0.0.0';

    /**socket 地址 */
    export function WssUrl(): string {
        return `wss://uat-wss.dropball.net`;
    }

    /** http 地址 */
    export function HttpUrl(): string {
        return `https://uat-api.dropball.net/api`;
    }

    /**服务器端口 */
    export function Post(): number {
        return 0;
    }

    /**socket 消息字段名 */
    export const SocketCMD = {
        CHAT: 'chat', //聊天
    }

    /** http 基础URL */
    export const BaseUrl = 'http://140.143.97.54:51802'

    /** http 接口名 */
    export const HttpApi = {
        login: 'user/login',//用户登录
        loginGuest: '/client/auth/loginGuest',//游客登录
    }
}