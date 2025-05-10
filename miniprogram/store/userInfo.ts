import { HTTPMessage } from "../common/Message";

/**当前玩家相关数据 */
export class UserInfo {
    private _nickName: string;
    private _headUrl: string;
    private _gold: number;
    private _id: number;
    private _token: string;
    constructor() {
        this._token = '';
        this._nickName = "";
        this._headUrl = '';
        this._gold = 0;
        this._id = 0;
    }

    public get NickName(): string {
        return this._nickName;
    }

    public get AvterUrl(): string {
        return this._headUrl;
    }

    public get Token(): string {
        return this._token;
    }

    public loginGuest(msg: HTTPMessage.GuestLogin) {
        this._token = msg.token;
        this._nickName = msg.name;
    }

}