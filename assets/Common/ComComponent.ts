import { Component, _decorator, Node, instantiate, Prefab } from "cc";
import { GameEventCtrl } from "./GameEventCtrl";
import { GEventKey } from "./GameEventKey";
import { Utils } from "../Utils/Utils";

const { ccclass, property } = _decorator;
/**弹窗 */
@ccclass
export default class ComComponent extends Component {

    protected childNodes: Node[];

    protected async onLoad(arr?: string[]) {
        GameEventCtrl.Instance.onEventHandler(GEventKey.CommonKey.InitView, this.initView, this);
        if (arr && arr.length) {
            this.childNodes = [];
            for (let _i = 0; _i < arr.length; _i++) {
                const item = await Utils.loadRes(arr[_i], Prefab);
                this.isValid && this.childNodes.push(instantiate(item.res));
            }
        }
    }
    protected initView() {

    }
    protected onDestroy(): void {
        GameEventCtrl.Instance.offEventHandler(GEventKey.CommonKey.InitView, this.initView, this);
    }
}
