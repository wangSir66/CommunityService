import { UserInfo } from "../Store/UserInfo";
import { GameEventCtrl } from "./GameEventCtrl";
import { GEventKey } from "./GameEventKey";
import { API } from "./Api";

export class Store {
    /**wss 消息定义 */
    protected CMD = {
    };
    readonly userInfo: UserInfo;
    readonly api: API;
    private _isOnLineSend: boolean;
    private _currIndex: number;
    constructor() {
        this.api = new API();
        //数据
        this.userInfo = new UserInfo(this.api);
    }

    async onMessageEvt(cmd: string, data: any) {
        console.log(cmd, data)
        if (!this.userInfo.Token) return;
        switch (cmd) {
            default:
                break;
        }
    }

    public get IsOnLineSend(): boolean {
        return this._isOnLineSend;
    }

    public set IsOnLineSend(v: boolean) {
        this._isOnLineSend = v;
    }

    /**更新余额 */
    public updateSelfBalance(v: number) {
        this.userInfo.Gold = v;
        GameEventCtrl.Instance.EmitEventHandler(GEventKey.UserInfoKey.UpdateBlance);
    }

    /** 当前场景 0--loading 1--Hall 2--Game */
    public set SwitchScene(_indx: number) {
        this._currIndex = _indx;
    }

    public get SwitchScene(): number {
        return this._currIndex;
    }
}