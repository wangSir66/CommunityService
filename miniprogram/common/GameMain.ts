import { Network } from "../utils/Network";
import { Store } from "./Store";

export class GMain {
    private readonly GameNetwork: Network;
    readonly Store: Store;
    private static Self: GMain;
    constructor() {
        this.GameNetwork = new Network();
        this.GameNetwork.OnOpenCall = this.onSocketLink;
        this.GameNetwork.OnMessageCall = this.onSocketMsg;
        this.GameNetwork.OnCloseCall = this.onSocketClose;
        this.GameNetwork.OnErrorCall = this.onSocketError;
        this.Store = new Store();
    }

    static get Instance() {
        if (!this.Self) this.Self = new GMain();
        return this.Self;
    }

    onInit() {
        console.log('初始化项目管理器');
     }

    /**socket 连接成功 */
    private onSocketLink(success: boolean) {
        console.log('socket 链接', success);
        if (success) {
            this.WsLogin();
        } else {
            this.onNetworkDisconnected();
        }
    }

    /**socket 消息分发 */
    private onSocketMsg(cmd: string, data: any) {
        try {
            this.Store.onMessageEvt(cmd, data);
        } catch (error) {
            console.log('err--->onSocketMsg', error);
        }
    }
    /**连接报错 */
    private onSocketError(...res: any) {
        console.log('socket连接报错', ...res);

    }
    /**
     * 游戏网络断开事件
     * @param code 掩码
     * @param reason 原因
     */
    private onSocketClose(code: number, reason: string) {
        console.log('游戏网络已断开', code, reason);
        //正常断网
        if (code === 1000) {

        } else {//异常断网
            this.onNetworkDisconnected();
        }
    }

    /**socket 重连 */
    private onNetworkDisconnected() {
        setTimeout(() => {
            this.GameNetwork.reconnect();
        }, 2000);
    }

    /**登录 socket 消息 */
    private WsLogin() {

    }
}