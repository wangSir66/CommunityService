import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScrollViewPageItem')
export class ScrollViewPageItem extends Component {
    /**实例化 view */
    initView(val: any, indx: number = 0) {
        this.node.active = true;
    };
    /**重置界面 */
    restView() {
        this.node.active = false;
    }
}