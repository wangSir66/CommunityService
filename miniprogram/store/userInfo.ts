/**当前玩家相关数据 */
export class UserInfo {
    private _nickName: string;
    private _headUrl: string;
    private _gold: number;
    private _id: number;
    constructor() {
        this._nickName = "XXX";
        this._headUrl = '';
        this._gold = 0;
        this._id = 0;
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

    public set ID(v: number) {
        this._id = v;
    }

    public get ID(): number {
        return this._id;
    }

}