import { IWebSocketEventListener, JsonWebSocket } from "./WebSocketWrapper"

class CustomEvent<F extends Function> {
    private listeners: Array<{ selector: F, target: any }>;

    constructor() {
        this.listeners = [];
    }

    addListener(selector: F, target: any) {
        for (let listener of this.listeners) {
            if (listener.selector === selector && listener.target === target) {
                return;
            }
        }

        this.listeners.push({ selector, target })
    }

    removeListener(selector: F, target: any) {
        for (let listener of this.listeners) {
            if (listener.selector === selector && listener.target === target) {
                this.listeners.splice(this.listeners.indexOf(listener), 1)
                break;
            }
        }
    }

    reset() {
        this.listeners = [];
    }

    invoke(...args: any[]) {
        if (this.listeners && this.listeners.length) {
            this.listeners.forEach((listener) => {
                listener.selector.call(listener.target, ...args);
            })
        }
    }
}

class EventListener implements IWebSocketEventListener {
    network: Network;

    constructor(network: Network) {
        this.network = network;
    }

    onWebSocketLink(success: boolean) {
        this.network.LinkEvent.invoke(success);
    }

    onWebSocketShut(code: number, reason: string) {
        this.network.CloseEvent.invoke(code, reason);
    }

    onWebSocketRead(cmd: string, data: any) {
        //@ts-ignore
        let cb = this.network._messageHandler.get(`${cmd}`)
        if (cb !== void 0) {
            //@ts-ignore
            this.network._messageHandler.delete(`${cmd}`);
            if (cb(data) === true) return
        }

        //通知层更新
        this.network.MessageEvent.invoke(cmd, data);
    }
}

export class Network {
    readonly CloseEvent = new CustomEvent<(code: number, reason: string) => void>();
    readonly LinkEvent = new CustomEvent<(success: boolean) => void>();
    readonly MessageEvent = new CustomEvent<(cmd: string, data?: any) => void>();

    private readonly _socket: JsonWebSocket = null;
    private readonly _listener: EventListener = null;

    private _messageHandler = new Map<string, (data: any) => void | true>();

    private _host: string;
    private _port: number;

    constructor(name: string) {
        this._socket = new JsonWebSocket(name);
        this._listener = new EventListener(this);
        this._socket.addListener(this._listener);
    }

    get Host(): string {
        return this._host;
    }

    get Port(): number {
        return this._port;
    }

    get SName(){
        return this._socket.name
    }

    set IsHeartHave(v:boolean){
        this._socket.needHeart = v;
    }

    connect(host: string, port: number = 0): boolean {
        this._host = host;
        this._port = port;
        return this._socket.connect(host, port);
    }

    /**
    * 是否连接服务器
    */
    get connected() {
        return this._socket.Connected;
    }

    reconnect() {
        console.log('%s 开始重连', this._socket.name, this._socket.Connected, this._host, this._port);
        if (this._socket.Connected) return;
        if (!!!this._host) return;
        this.connect(this._host, this._port);
    }

    close(code = 1000, Reason?: string) {
        return this._socket.close(code, Reason)
    }

    sendData(cmd: string, data?: any, cb?: (data: any) => void) {
        if (cb !== undefined) {
            this._messageHandler.set(`$cmd}`, cb)
        }

        this._socket.sendData(cmd, data)
    }

    ping(): number {
        return this._socket.Ping;
    }
}
