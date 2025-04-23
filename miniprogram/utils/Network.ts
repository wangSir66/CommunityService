export class Network {
    private _socket!: WechatMiniprogram.SocketTask;
    private _connected!: WSSType;
    private _socketMsgQueue!: any;
    private _host: string = '';
    private _port: number = 0;
    private _onCloseCall!: AnyFunction;
    private _onErrorCall!: AnyFunction;
    private _onMessageCall!: AnyFunction;
    private _onOpenCall!: AnyFunction;

    constructor() {
        this._connected = WSSType.Normal;
        this._socketMsgQueue = [];
    }

    get Host(): string {
        return this._host;
    }

    get Port(): number {
        return this._port;
    }

    /**
    * 是否连接服务器
    */
    get IsConnected(): boolean {
        return this._connected == WSSType.Connectting;
    }

    /**关闭的回调 */
    set OnCloseCall(call: AnyFunction) {
        this._onCloseCall = call;
    }

    /**报错的回调 */
    set OnErrorCall(call: AnyFunction) {
        this._onErrorCall = call;
    }

    /**回执消息的回调 */
    set OnMessageCall(call: AnyFunction) {
        this._onMessageCall = call;
    }

    /**连接成功的回调 */
    set OnOpenCall(call: AnyFunction) {
        this._onOpenCall = call;
    }

    /**
     * socket 连接
     * @param host 地址
     * @param port 端口
     * @returns 
     */
    connect(host: string, port: number = 0) {
        if (this._connected == WSSType.ReadyConnect || this._connected == WSSType.Connectting) return;
        this._host = host;
        this._port = port;
        this._connected = WSSType.ReadyConnect;
        this._socket = wx.connectSocket({ url: `${host}:${port}` });
        this._socket.onOpen((...res: any) => {
            this._onOpenCall && this._onOpenCall(...res);
            this._connected = WSSType.Connectting;
            for (let i = 0; i < this._socketMsgQueue.length; i++) {
                this.sendMessage(this._socketMsgQueue[i]);
            }
            this._socketMsgQueue = [];
        });
        this._socket.onClose((...res: any) => {
            this._onCloseCall && this._onCloseCall(...res);
        });
        this._socket.onError((...res: any) => {
            this._onErrorCall && this._onErrorCall(...res);
        });
        this._socket.onMessage((...res: any) => {
            this._onMessageCall && this._onMessageCall(...res);
        });
    }

    /**发送消息 */
    sendMessage(msg: WechatMiniprogram.SocketTaskSendOption) {
        if (this._connected == WSSType.Connectting) {
            this._socket.send(msg);
        } else {
            this._socketMsgQueue.push(msg);
        }
    }

    /**重连 */
    reconnect() {
        console.log('准备重连');
        if (this._connected == WSSType.ReadyConnect || this._connected == WSSType.Connectting || !this._host) return;
        console.log('%s 开始重连', this._connected, this._host, this._port);
        this.connect(this._host, this._port);
    }

    /**主动关闭链接 */
    close(code = 1000, reason?: string) {
        return this._socket.close({ code, reason });
    }

}
enum WSSType {
    Normal,
    ReadyConnect,
    Connectting,
    Closeing,
    Closed,
    ClosedBySelf
}