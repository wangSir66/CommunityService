import { Component, Layout, RichText, UITransform, _decorator, tween, v3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export class MsgTip extends Component {

    @property(RichText)
    private txt: RichText = null;

    show(str: string, icon: 1 | 2 = 2) {
        this.txt.string = `<img src='o_icon${icon}' offset=-5/> <color=#FFE294>${str}</color>`;
        this.node.setPosition(v3(0, -200));
        this.scheduleOnce(()=>{
            this.getComponent(UITransform).height = this.txt.node.getComponent(UITransform).height + 50
        },0)
        tween(this.node)
            .to(0.25, { position: v3(0, 100) })
            .delay(2)
            .call(() => {
                this.node.removeFromParent();
                this.node.destroy();
            })
            .start();
    }
}