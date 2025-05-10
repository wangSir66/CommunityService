import { UserInfo } from "../store/userInfo";
import { HttpRequest } from "../utils/HttpRequest";
import { Config } from "./Config";

/**数据处理 */
export class Store {
    private Http: HttpRequest;
    readonly userInfo: UserInfo;
    constructor() {
        this.Http = new HttpRequest();
        this.userInfo = new UserInfo();
        this.Http.BaseUrl = Config.HttpUrl();
    }

    /** socket 消息回执 */
    async onMessageEvt(cmd: string, data: any) {
        // if (!this.userInfo.Token) return;
        console.log(data)
        switch (cmd) {
            case Config.SocketCMD.CHAT:
                break;
            default:
                break;
        }
    }
    /**http 消息队列 */
    async onHttpSend(api: Config.HttpApi, param: any = {}, type: number = 0) {
        try {
            let res: any;
            switch (type) {
                case 0:
                    res = await this.Http.Get(api, param);
                    break;
                case 1:
                    res = await this.Http.Post(api, param);
                    break;
            }
            if (res?.data?.code == 200) {
                const msg = res.data.data;
                switch (api) {
                    case Config.HttpApi.loginGuest:
                        this.userInfo.loginGuest(msg);
                        break;

                    default:
                        break;
                }
            }
            else throw new Error(`Http res fail`);

            console.log('http 消息回调', res);
            return res;
        } catch (err: any) {
            console.log('onHttpSend err', err);
        }
    }
}