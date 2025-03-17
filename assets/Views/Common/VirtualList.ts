import { _decorator, Component, instantiate, Prefab, ScrollView, UITransform, v3, Vec3 } from 'cc';
import { VirtualItem } from './VirtualItem';
import ComComponent from '../../Common/ComComponent';
const { ccclass, property } = _decorator;

@ccclass('VirtualList')
export class VirtualList extends ComComponent {
    @property({ tooltip: '节点间隔' })
    protected intervalNum: number = 0;
    @property({ tooltip: '上边距' })
    protected paddingTop: number = 0;
    @property({ tooltip: '下边距' })
    protected paddingBottom: number = 0;

    protected _ItemPreb: any = null;
    protected _scrollView: ScrollView;
    protected _list: any[] = [];
    protected _autoScroll: boolean;
    private _innerItems: VirtualItem[];
    private _outItems: VirtualItem[];
    private _nowPosY: number;
    private _contentUitf: UITransform;
    private _maskUitf: UITransform;
    private _itemH: number;

    protected async onLoad() {
        super.onLoad();
        this._scrollView = this.getComponent(ScrollView);
        this._contentUitf = this._scrollView.content.getComponent(UITransform);
        this._maskUitf = this._scrollView.content.parent.getComponent(UITransform);
    }

    protected start(): void {
        this.node.on(ScrollView.EventType.SCROLLING, this.onScrollIng, this);
        this.node.on(ScrollView.EventType.BOUNCE_BOTTOM, this.onScrollBounceBottom, this);
        this.node.on(ScrollView.EventType.BOUNCE_TOP, this.onScrollBounceTop, this);
        this.node.on(ScrollView.EventType.SCROLL_TO_BOTTOM, this.onScrollToBottom, this);

        this._nowPosY = null;
        this.scheduleOnce(() => {
            this.init();
        }, 0);
    }

    /**更新数据 */
    protected updateList(list: any[]) {
        this.init();
        this._list = list;
        this.loadByFrame(true);
    }

    /**重置数据 */
    protected resetData(): void {
        this._outItems && this._outItems.push(...this._innerItems);
        this._innerItems = [];
        this._scrollView.content.removeAllChildren();
        this._list = [];
        this._nowPosY = null;
    }

    /**回到顶部 */
    protected onBackToTop(val: number = 0.1) {
        this._scrollView.scrollToTop(val);
    }

    /**回到底部 */
    protected onBackToBottom(val: number = 0.1) {
        this._scrollView.scrollToBottom(val);
    }

    protected init() {
        if (this._outItems || !this._ItemPreb) return;
        this._scrollView.content.removeAllChildren();
        this._list = [];
        this._outItems = [];
        this._innerItems = [];
        this._autoScroll = true;
        let iH = 0;
        if (this._ItemPreb instanceof Prefab) iH = this._ItemPreb.data.getComponent(UITransform).height;
        else iH = this._ItemPreb.getComponent(UITransform).height;
        this._itemH = iH;
        const tH = this.getComponent(UITransform).height,
            num = Math.ceil(tH / iH) + 1;
        for (let _i = 0; _i < num; _i++) {
            const ctr = instantiate(this._ItemPreb).getComponent(VirtualItem);
            ctr && this._outItems.push(ctr);
        }
    }

    protected loadByFrame(isDown: boolean = true) {
        if (!this._ItemPreb) return;
        const load = () => {
            if (this.isValid && this.createItem(isDown)) load();
        };
        load();
    }

    /**滑到消息的最新处 */
    protected toTotalBottom() {
        this._scrollView.unscheduleAllCallbacks();
        this._scrollView.content.removeAllChildren();
        this._autoScroll = false;
        const len = this._list.length;
        this._contentUitf.height = len * this._itemH + (len - 1) * this.intervalNum + this.paddingBottom + this.paddingTop;
        this._outItems.push(...this._innerItems);
        this._innerItems = [];
        this.onBackToBottom(0.1);
        this._scrollView.scheduleOnce(() => {
            const tL = this._outItems.length + this._innerItems.length - 1;
            for (let _i = len - tL; _i < len; _i++) {
                this.createItemByIndx(_i);
            }
            this._autoScroll = true;
        }, 0.1);
    }

    public get IsBottom(): boolean {
        return this._contentUitf.height == Math.ceil(Math.abs(this._scrollView.content.position.y) + this._maskUitf.height * this._maskUitf.anchorY);
    }


    private createItemByIndx(indx: number) {
        let ctr = this._outItems[0];
        if (!ctr || indx < 0 || !this._list[indx]) return false;
        ctr = this._outItems.shift();
        this._scrollView.content.addChild(ctr.node);
        ctr.initView(this._list[indx], indx);
        const ndUiT = ctr.getComponent(UITransform);
        ctr.node.setPosition(v3(ctr.node.getPosition().x, -(this.paddingTop + (this.intervalNum + this._itemH) * indx + this._itemH * (1 - ndUiT.anchorY)), 0));
        this._innerItems.push(ctr);
        return true;
    }

    private createItem(isDown: boolean = true) {
        let ctr = this._outItems[0],
            len = this._innerItems.length,
            indx: number = len == 0 ? 0 : this._innerItems[isDown ? len - 1 : 0].Indx + (isDown ? 1 : -1);
        if (!ctr || indx >= this._list.length || indx < 0 || !this._list[indx]) return false;
        ctr = this._outItems.shift();
        this._scrollView.content.addChild(ctr.node);
        ctr.initView(this._list[indx], indx);
        const pos: Vec3 = v3(ctr.node.getPosition().x, 0, 0), ndUiT = ctr.getComponent(UITransform);
        let lastY: number = 0;
        if (len) {
            const lastN = this._innerItems[len - 1].node, lastUI = lastN.getComponent(UITransform);
            lastY = Math.abs(lastN.getPosition().y - lastUI.height * lastUI.anchorY);
        }
        if (isDown) {
            pos.y = -((lastY ? lastY + this.intervalNum : this.paddingTop) + ndUiT.height * (1 - ndUiT.anchorY));
            this._innerItems.push(ctr);
        } else {
            const firstN = this._innerItems[0].node, firstUI = firstN.getComponent(UITransform);
            pos.y = firstN.getPosition().y + (firstUI.height * (1 - firstUI.anchorY) + this.intervalNum + ndUiT.height * ndUiT.anchorY);
            this._innerItems.unshift(ctr);
        }
        this._contentUitf.height = (isDown ? Math.abs(pos.y) + ndUiT.height * ndUiT.anchorY : lastY) + this.paddingBottom;
        ctr.node.setPosition(pos);
        return true;
    }

    /**列表滑动事件 */
    private onScrollIng(ctx: ScrollView) {
        const cntY = this._scrollView.content.getPosition().y;
        if (this._nowPosY == null || !this._autoScroll) {
            this._nowPosY = cntY;
            return;
        }
        const isDown = (cntY - this._nowPosY) >= 0, tUi = this._maskUitf,
            tH = tUi.height * (1 - tUi.anchorY);
        //判断超界
        for (let _i = 0; _i < this._innerItems.length; _i++) {
            const item = this._innerItems[_i].node, itemUI = item.getComponent(UITransform);
            let isMove = false;
            if (isDown) {
                if (Math.abs(cntY) - (itemUI.height * itemUI.anchorY + Math.abs(item.position.y)) > tH) isMove = true;
            } else {
                if ((Math.abs(item.position.y) + itemUI.height * (1 - itemUI.anchorY)) - Math.abs(cntY) > tH) isMove = true;
            }
            if (isMove) {
                item.removeFromParent();
                this._outItems.push(this._innerItems.splice(_i, 1)[0]);
                _i--;
            }
        }
        this.loadByFrame(isDown);
        this._nowPosY = cntY;
    }
    /**顶部回弹 */
    private onScrollBounceTop(ctx: ScrollView) {
        // ctx.stopAutoScroll();
        // if (this._call)
        //     this._call(CallType.Update, (list: any) => {
        //         this.updateList(list, true);
        //     });
    }
    /**底部回弹 */
    private onScrollBounceBottom(ctx: ScrollView) {
        // ctx.stopAutoScroll();
    }
    /**滚动到底部边界事件 */
    private onScrollToBottom(ctx: ScrollView) {

    }
}


