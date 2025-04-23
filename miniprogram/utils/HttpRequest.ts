//HTTP请求
function RequestMan(method: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT', url: string, token: string, data: any = {}) {
    return new Promise((r, c) => {
        let urlMsg: WechatMiniprogram.RequestOption = {
            url,
            method,
            data,
            header: {
                'Content-Type': 'application/json',
                'TOKEN': token
            },
            success(res: WechatMiniprogram.RequestSuccessCallbackResult) {
                r(res);
            },
            fail(err: WechatMiniprogram.GeneralCallbackResult) {
                c(err);
            }
        }
        if (method == 'GET') delete urlMsg.data;
        try {
            wx.request(urlMsg);
        } catch (err) {
            c(err);
        }
    })
}

//HTTP 请求接口封装
export class HttpRequest {
    private baseUrl: string = '';
    private _UserToken = '';

    //设置请求地址
    set BaseUrl(url: string) {
        if (url.endsWith('/')) {
            this.baseUrl = url;
        }
        else {
            this.baseUrl = url + '/';
        }
    }

    //请求地址
    get BaseUrl(): string {
        return this.baseUrl;
    }

    //链接地址
    private makeUrl(path: string) {
        if (path.startsWith('/')) {
            path = path.slice(1)
        }

        return `${this.baseUrl}${path}`;
    }

    //token
    get Token(): string {
        return this._UserToken;
    }

    //Token
    set Token(v: string) {
        this._UserToken = v;
    }

    //GET请求
    Get(path: string, data: any = {}) {
        let pth = `${this.makeUrl(path)}?`;
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const msg = data[key];
                    pth += `${key}=${msg}`;
                }
            }
        }
        return RequestMan('GET', pth, this.Token, data);
    }

    //POST请求
    Post(path: string, data: any = {}) {
        return RequestMan('POST', this.makeUrl(path), this.Token, data);
    }
}