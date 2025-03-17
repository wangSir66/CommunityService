import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VirtualItem')
export class VirtualItem extends Component {

    private _indx:number;

    initView(msg: any, indx: number) {
        this._indx = indx;
    }

    get Indx(){
        return this._indx;
    }
}