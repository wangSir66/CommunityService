import { API } from "../Common/Api";
import { GameEventCtrl } from "../Common/GameEventCtrl";
import { GEventKey } from "../Common/GameEventKey";
import { GameMassage } from "../Common/Message";
import { StoreIndex } from "./StoreIndex";

/**当前玩家相关数据 */
export class UserInfo extends StoreIndex {
    private _nickName: string;
    private _playerName: string;
    private _headUrl: string;
    private _gold: number;
    private _token: string;
    private _level: number;
    private _id: string;
    private _pid: string;
    private _customChips: number;

    constructor(api: API) {
        super(api);
        this.NickName = "XXX";
        this._playerName = '';
        this._headUrl = '';
        this._gold = 0;
    }

    public set Token(v: string) {
        this._token = v;
    }

    public get Token(): string {
        return this._token;
    }

    public set Gold(v: number) {
        this._gold = v;
    }

    public get Gold(): number {
        return this._gold;
    }

    public set HeadUrl(v: string) {
        this._headUrl = v;
    }

    public get HeadUrl(): string {
        return this._headUrl;
    }

    public set NickName(v: string) {
        this._nickName = v;
    }

    public get NickName() {
        return this._nickName;
    }

    public set Level(v: number) {
        this._level = v;
    }

    public get Level() {
        return this._level;
    }

    public set ID(v: string) {
        this._id = v;
    }

    public get ID(): string {
        return this._id;
    }

    public set PID(v: string) {
        this._pid = v;
    }

    public get PID(): string {
        return this._pid;
    }

    public set CustomChips(v: number) {
        this._customChips = v || 0;
    }

    public get CustomChips(): number {
        return this._customChips;
    }

    public set PlayerName(v: string) {
        this._playerName = v;
    }

    public get PlayerName() {
        return this._playerName;
    }


    async userLogin(pra: any) {
        const res = await this._api.UserLogin(pra);
        if (!res) return false;
        const msg = res.data ;
        this.Gold = msg.balance;
        this.HeadUrl = msg.avatar;
        this.Token = msg.token;
        this.Level = msg.userLevel;
        return true;
    }

    async userDetails() {
        const res = await this._api.UserDetails();
        if (!res) return;
        const msg = res.data  ;
        this.NickName = msg.nickName;
        this.PlayerName = msg.playerName;
        this.Gold = msg.balance;
        this.HeadUrl = msg.avatar;
        this.Level = msg.userLevel;
        this.ID = msg.userId;
        this.CustomChips = msg.customChips || 0;
    }
}