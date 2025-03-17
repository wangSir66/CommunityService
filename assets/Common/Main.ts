import { Font, Game, Label, find, game } from "cc";
import { Network } from "../Utils/Network";
import { Audiomanager } from "./SoundManager";
import { Store } from "./Store";
import { Config } from "./Config";
import { Utils } from "../Utils/Utils";
import { MsgBoxStyle } from "../Views/Common/MsgBox";

export class Main {
    readonly GameNetwork: Network;
    readonly SoundMgr: Audiomanager;
    readonly Store: Store;
    public static Self: Main;
    constructor() {
        this.GameNetwork = new Network(`Game WSS`);
        this.GameNetwork.LinkEvent.addListener(this.onWebSocketLink, this);
        this.GameNetwork.MessageEvent.addListener(this.onSocketMsg, this);
        this.GameNetwork.CloseEvent.addListener(this.onWebSocketClose, this);
        this.SoundMgr = new Audiomanager();
        this.Store = new Store();
        this.GameNetwork.IsHeartHave = true;
        Main.Self = this;
        game.on(Game.EVENT_HIDE, () => {
            this.OnStartView(false);
        });
        game.on(Game.EVENT_SHOW, () => {
            this.OnStartView(true);
        });
        Utils.loadRes('Font/Font', Font).then((res) => {
            console.log(res)
            if (res.res) {
                Label.prototype['OnLoadClone'] = Label.prototype.onLoad;
                Label.prototype.onLoad = function (...pra) {
                    this.OnLoadClone(...pra);
                    if (!this.useSystemFont) return;
                    this.useSystemFont = true;
                    this.font = res.res;
                }
            }
        })
    }
    /**判断 入口 */
    OnStartView(show: boolean = true) {
        if (!this.Store.SwitchScene) return;
        if (show) {
            this.GameNetwork.connected || this.GameNetwork.connect(Config.WssUrl());
            this.initData(null);
        } else {
            this.GameNetwork.close();
        }
    }
    /**请求场景数据 */
    private initData(logMsg: any) {
        Utils.ShowOrHideLoading(true);
        setTimeout(async () => {
           
            Utils.ShowOrHideLoading(false);
        }, 0);
    }

    /**socket 消息分发 */
    protected onSocketMsg(cmd: string, data: any) {
        if (!this.Store.api.Http.Token) {
            console.log('wss get http not get');
            return;
        }
        try {
            this.Store.onMessageEvt(cmd, data);
        } catch (error) {
            console.log('err--->onSocketMsg', error);
        }
    }
    /**
     * 游戏网络断开事件
     * @param code 掩码
     * @param reason 原因
     */
    protected onWebSocketClose(code: number, reason: string) {
        console.log('游戏网络已断开', code, reason);
        this.Store.IsOnLineSend = false;
        //正常断网
        if (code === 1000) {

        }
        //异常断网
        else {
            this.onNetworkDisconnected();
        }
    }

    private onNetworkDisconnected() {
        setTimeout(() => {
            this.GameNetwork.reconnect();
        }, 2000);
    }

    private onWebSocketLink(success: boolean) {
        console.log('socket 链接', success);
        if (success) {
            this.WsLogin();
        } else {
            this.onNetworkDisconnected();
        }
    }

    protected WsLogin() {
        const userInfo = this.Store.userInfo;
        if (userInfo && userInfo.ID && !this.Store.IsOnLineSend && this.GameNetwork.connected) {
            this.Store.IsOnLineSend = true;
            this.GameNetwork.sendData('login', { userId: userInfo.ID });
        }
    }
}