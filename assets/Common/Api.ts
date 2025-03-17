import { HttpRequest } from "../Utils/HttpRequest";
import { Utils } from "../Utils/Utils";
import { Config } from "./Config";

const ApiUrl = {
    //用户相关
    login: 'user/login',//用户登录
    userDetails: 'user/details',//用户信息
}

export class API {
    readonly Http: HttpRequest;
    constructor() {
        this.Http = new HttpRequest();
        this.Http.BaseUrl = Config.HttpUrl();
    }
    /**玩家登录 */
    async UserLogin(param = {}): Promise<any> {
        try {
            return await this.Http.Post(ApiUrl.login, param);
        } catch (err: any) {
            this.ErrTips(err);
        }
    }
    /**玩家信息 */
    async UserDetails(param = {}): Promise<any> {
        try {
            return await this.Http.Post(ApiUrl.userDetails, param);
        } catch (err: any) {
            this.ErrTips(err);
        }
    }
    
    ErrTips(err: Error) {
        if (err?.message == '0005') {
            this.Http.Token = null;
        }
        Utils.ShowMesgTip(!err ? 'Error' : (typeof err == "string" ? err : (err.message ? err.message : `${err}`)));
    }
}