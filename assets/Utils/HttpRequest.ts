//HTTP请求
function RequestMan(method: string, url: string, token: string, data: any = {}): Promise<any> {
    return new Promise(async (resolve, reject) => {
        //方法检查
        if ((method !== 'POST') && (method !== 'GET')) {
            console.error('http request only support post and get method!');
            return;
        }
        let urlMsg: RequestInit = {
            method: method,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'TOKEN': token
            }
        }
        if (method == 'GET') delete urlMsg.body;
        try {
            const response = await fetch(url, urlMsg);
            //状态码 不在 200 - 299 之间的
            if (!response.ok) {
                //服务器限流
                throw new Error(response.status == 429 ? 'Error: Server throttling.' : `Failed to fetch! Code ${response.status}`);
            }
            const res = await response.json();
            if (res.code != '0000') {
                if (res.code == '0005') {
                    //无效Token
                    throw new Error(`0005`);
                }
                throw new Error(`${res.msg}`);
            }
            resolve(res);
        } catch (err) {
            reject(err)
        }
    });
}

class RequestResponse {
    Error?: {
        Message: string
    }
    [key: string]: any
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
    Get(path: string, data: any = {}): Promise<RequestResponse> {
        let pth = `${this.makeUrl(path)}?`;
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const msg = data[key];
                    pth += `${key}=${msg}`;
                }
            }
        }
        return RequestMan('GET', pth, this.Token);
    }

    //POST请求
    Post(path: string, data: any = {}): Promise<RequestResponse> {
        return RequestMan('POST', this.makeUrl(path), this.Token, data);
    }
}
