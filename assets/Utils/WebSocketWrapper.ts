import { Game, game } from "cc";

//网络事件监听
export interface IWebSocketEventListener {
    onWebSocketLink(success: boolean);

    onWebSocketRead(cmd: string, data: any);

    onWebSocketShut(code: number, reason: string);
}

//心跳包定义
interface HeartBeat {
    ClientSendTime: number;
    ServerSendTime: number;
}

abstract class WebSocketWrapper {
    protected socket: WebSocket = null;
    protected status: number = WebSocket.CLOSED;
    protected isBinaryType: boolean = false;
    protected listeners: Array<IWebSocketEventListener> = [];
    protected closeCode: number;
    protected closeReason: string;

    protected heartbeatTimer: number = null;
    protected lastRecvTime: Date = null;
    protected recvPacketCount: number;
    public name: string;

    // private pingHelper = new PingHelper();
    private ping: number = 0;
    needHeart: boolean = true;
    constructor(name: string) {
        this.name = name;

        //注册后台切回事件
        game.on(Game.EVENT_SHOW, this.onShow, this);
        game.on(Game.EVENT_HIDE, this.onHide, this);
    }

    /**
     * 获取连接地址
     */
    get Url(): string {
        return this.socket ? this.socket.url : '';
    }

    /**
     * 获取连接状态
     */
    get ReadyState(): number {
        return this.socket ? this.socket.readyState : WebSocket.CLOSED;
    }

    /**
     * 是否连接服务器
     */
    get Connected(): boolean {
        return this.socket ? this.socket.readyState === WebSocket.OPEN : false;
    }

    get Ping(): number {
        return 0;
        // if (this.socket.readyState === WebSocket.OPEN) return this.ping;
        // else this.pingHelper.Ping;
    }

    /**
     * 添加连接事件监听器
     * @param listener 监听器
     */
    addListener(listener: IWebSocketEventListener) {
        //去重判断
        for (let i of this.listeners) {
            if (i === listener) {
                return
            }
        }

        //保存监听
        this.listeners.push(listener);
    }

    /**
     * 移除连接事件监听器
     * @param listener 监听器
     */
    removeListener(listener: IWebSocketEventListener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1)
    }

    /**
     * 连接服务器
     * @param host 服务器IP地址或者完整链接地址(e.g: `ws://127.0.0.1:9999`)
     * @param port 服务器端口号
     */
    connect(host: string, port: number): boolean {
        //链接地址
        let url: string;
        if (host.startsWith('ws://') || host.startsWith('wss://')) {
            url = host;
        } else {
            url = `ws://${host}:${port}/`
        }

        //设置服务器地址
        // this.pingHelper.setAddress(host, port);
        // this.pingHelper.start();

        //防止重复连接
        if (this.socket !== null) {
            //取消事件注册
            this.cancelEvent();

            //连接已建立 则关闭连接
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close();
            }

            //重置设置
            this.socket = null;
        }

        //创建连接
        console.log('创建网络连接', url);
        this.socket = new WebSocket(url);
        this.status = WebSocket.CONNECTING;
        if (this.isBinaryType) this.socket.binaryType = 'arraybuffer';
        this.closeCode = undefined;
        this.closeReason = undefined;
        this.recvPacketCount = 0;
        this.bindEvent();

        return true;
    }

    /**
     * 关闭连接
     */
    close(closeCode: number = 1000, Reason?: string) {
        if (this.socket === null) return;
        if (this.socket.readyState !== WebSocket.OPEN) return;
        this.closeCode = closeCode;
        this.closeReason = Reason || '客户端主动关闭';
        this.socket.close();
        this.status = WebSocket.CLOSING;

        //删除计时器
        if (this.heartbeatTimer !== null && this.closeCode === 1000) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 取消事件绑定
     */
    private cancelEvent() {
        if (this.socket !== null) {
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
        }
    }

    /**
     * 绑定事件
     */
    private bindEvent() {
        if (this.socket !== null) {
            this.socket.onopen = this.onWebSocketConnected.bind(this);
            this.socket.onmessage = this.onWebSocketMessage.bind(this);
            this.socket.onclose = this.onWebSocketClosed.bind(this);
            this.socket.onerror = this.onWebSocketError.bind(this);
        }
    }

    /**
     * 发送心跳数据包
     */
    private sendHeartbeatPacket() {
        this.sendData('Ping', {
            ClientSendTime: Date.now()
        });
    }

    /**
     * 后台切回前台
     */
    onShow() {
        console.log('后台切回前台', this.name, this.lastRecvTime);
        if (this.status === WebSocket.OPEN) {
            //重启心跳检测
            this.startHeartbeatTimer();

            //后台回来立马发送一个心跳包
            this.sendHeartbeatPacket();
        }
    }

    /**
     * 切到后台(停止心跳检测)
     */
    onHide() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 开启心跳
     */
    private startHeartbeatTimer() {
        //重置心跳计时器
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        if (!this.needHeart) return;

        //客户端心跳检测
        this.lastRecvTime = new Date();
        this.heartbeatTimer = setInterval(() => {
            //心跳超时判断
            if ((Date.now() - this.lastRecvTime.getTime()) > 40000) {
                console.log('心跳超时判断', this.name, this.lastRecvTime);
                this.close(4000);
                this.onWebSocketClosed({ code: 4000, reason: '' } as any);
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
            }
            else {
                this.sendHeartbeatPacket();
            }
        }, 30000);

        //立即发送一个心跳包
        this.sendHeartbeatPacket();
    }

    /**
     * 连接事件
     * @param evt 连接事件
     */
    private onWebSocketConnected(evt: Event) {
        this.status = WebSocket.OPEN;

        this.listeners.forEach(listener => {
            try {
                listener.onWebSocketLink(true)
            }
            catch (e) {
                console.error(e);
            }
        });

        this.startHeartbeatTimer();
    }

    /**
     * 消息事件
     * @param evt 消息事件
     */
    private onWebSocketMessage(evt: MessageEvent) {
        //统计收到的数据包
        this.recvPacketCount++;
        this.lastRecvTime = new Date();
        try {
            let data = this.onRecvMessage(evt.data);
            if (!data) {
                console.log('-----socket not data----');
                return;
            }
            if (data.cmd === 'Pong') {
                //心跳回应包 不管
            } else {
                this.listeners.forEach(listener => {
                    listener.onWebSocketRead(data.cmd, data.data);
                })
            }
        } catch (e) {
            console.error('%s 网络消息处理错误', this.name, true ? e.message : e);
            throw e;
        }
    }

    /**
     * 发送消息
     * @param cmd 主消息号
     * @param data 消息体
     */
    abstract sendData(cmd: string, data?: any);

    /**
     * 消息解包
     * @param evt 消息事件
     */
    protected abstract onRecvMessage(evt: MessageEvent): { cmd: string, data?: any };

    /**
     * 关闭事件
     * @param evt 关闭事件
     */
    private onWebSocketClosed(evt: CloseEvent) {
        console.log(this.name, '网络已断开', evt.code, this.closeCode);

        //取消事件
        this.cancelEvent();

        //删除计时器
        if (this.heartbeatTimer !== null && this.closeCode === 1000) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        //连接失败
        if (this.status === WebSocket.CONNECTING) {
            this.listeners.forEach(listener => {
                listener.onWebSocketLink(false)
            })
        }
        //关闭事件
        else {
            this.listeners.forEach(listener => {
                listener.onWebSocketShut(evt.code || this.closeCode, evt.reason || this.closeReason || '')
            })
        }

        this.status = WebSocket.CLOSED;
    }

    /**
     * 错误事件
     * @param evt 错误事件
     */
    private onWebSocketError(evt: Event) {
        console.log(this.name, evt);
    }

    /**
     * 发送接口
     * @param context 预发送的数据字符串或者缓存数组
     */
    protected sendDataBuffer(context: ArrayBuffer | string) {
        //初始化判断
        if (this.socket === null) {
            console.error('套接字尚未初始化');
            return;
        }

        //状态判断
        if (this.socket.readyState !== WebSocket.OPEN) {
            console.error('套接字尚未连接');
            return;
        }

        //发送接口
        this.socket.send(context);
    }
}

export class JsonWebSocket extends WebSocketWrapper {
    /**
     * 发送消息
     * @param cmd 主消息号
     * @param data 消息体
     */
    sendData(cmd: string, data?: any) {
        cmd != 'Ping' && console.log(this.name, `发送消息: ${cmd} >>> `, true ? JSON.stringify(data) : data);
        this.sendDataBuffer(this.encode({ cmd, data }));
    }

    /**
     * 消息解包
     * @param evt 消息事件
     */
    protected onRecvMessage(evt: any): { cmd: string, data?: any } {
        return this.decode(evt);
    }

    private encode(data: any): string {
        return JSON.stringify(data || {});
    }

    private decode(str: string): any {
        try {
            return JSON.parse(str);
        }
        catch(e) {
            console.error(e);
            return {};
        }
    }
}
