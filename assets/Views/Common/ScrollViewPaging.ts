import { _decorator, Component, instantiate, isValid, Layout, Node, Prefab, ScrollView, UITransform } from 'cc';
import { ScrollViewPageItem } from './ScrollViewPageItem';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ScrollViewPaging')
export class ScrollViewPaging extends Component {
    @property({ tooltip: '每帧加载数量' })
    private PreFrameNum: number = 1;

    private tipNode: Node = null;
    private _ItemPreb: any = null;
    private _list: any[] = [];
    private _currIndx: number;
    private _content: Node;
    private _call: Function;
    private _itemArr: ScrollViewPageItem[];
    private _loadEnd: boolean = false;
    private _isLoading: boolean;

    start() {
        this._content = this.getComponent(ScrollView).content;
        this.node.on(ScrollView.EventType.SCROLLING, this.onScrollIng, this);
        this.node.on(ScrollView.EventType.BOUNCE_BOTTOM, this.onScrollBOTTOM, this);
        this.node.on(ScrollView.EventType.BOUNCE_TOP, this.onScrollTop, this);
        Utils.loadRes('Prefabs/ScrollTip', Prefab).then((pre) => {
            this.tipNode = instantiate(pre.res);
        });
        this.clearAndCreat();
    }

    initData(pre: Prefab | Node, call: Function) {
        this._ItemPreb = pre;
        this._call = call;
    }

    protected onDisable(): void {
        this.resetData();
    }

    resetData(): void {
        this.unscheduleAllCallbacks();
        this.getComponent(ScrollView).elastic = true;
        if (this._itemArr)
            for (let _i = 0; _i < this._itemArr.length; _i++) {
                const item = this._itemArr[_i];
                item.destroy();
            }
        this._content.removeAllChildren();
        this._currIndx = 0;
        this._itemArr = [];
        this._list = [];
        this._loadEnd = false;
        this.tipNode && this.tipNode.removeFromParent();
        this._isLoading = false;
    }

    private clearAndCreat() {
        this._content.removeAllChildren();
        this.tipNode && this.tipNode.removeFromParent();
        this._currIndx = 0;
        this._list = [];
        this._itemArr = [];
        this._isLoading = false;
        if (this._call)
            this._call(CallType.Update, 1);
    }

    private ToTheEnd(v: boolean) {
        if (!this.tipNode) return;
        if (this._isLoading) {
            this.scheduleOnce(() => {
                this.ToTheEnd(v);
            }, 0.5)
            return;
        }
        const lc = this.getComponent(ScrollView);
        if (!this.tipNode.parent) {
            this._content.addChild(this.tipNode);
            this._content.getComponent(Layout).updateLayout();
            // lc.scrollToBottom(0.1);
        }
        lc.elastic = !v;
    }

    updateList(list: any[], total: number = 0, isTop: 0 | 1 | 2 = 2) {
        const fg = list.length == (total ? total : 99999), scn = this.getComponent(ScrollView);
        if (isTop == 1)
            scn.scrollToTop(0.1);
        else if (isTop == 2)
            scn.scrollToBottom(0.1);
        this._list = [].concat(list);
        if (this._currIndx < this._list.length) {
            this.loadByFrame();
        } else {
            const len = Math.max(this._list.length, this._itemArr.length);
            for (let _i = 0; _i < len; _i++) {
                const msg = this._list[_i],
                    item = this._itemArr[_i];
                if (item && msg) {
                    item.initView(msg, _i);
                } else if (msg) {
                    continue;
                } else {
                    item.restView();
                }
            }
        }
        if (fg) {
            this.ToTheEnd(true);
            this._loadEnd = true;
        }
    }

    private loadByFrame() {
        const total = this._list.length,
            load = () => {
                if (!isValid(this.node)) return;
                const cunt = Math.min(total - this._currIndx, this.PreFrameNum);
                for (let _i = 0; _i < cunt; _i++) {
                    this.createItem(this._currIndx);
                    this._currIndx++;
                }
                if (this._currIndx < total)
                    this.scheduleOnce(() => { load() }, 0.1);
                else
                    this._isLoading = false;
            };

        this._isLoading = true;
        load();
    }

    private createItem(indx: number) {
        const nD = instantiate(this._ItemPreb),
            ctr: ScrollViewPageItem = nD.getComponent(ScrollViewPageItem);
        ctr.initView(this._list[indx], indx);
        this._content.addChild(nD);
        this._itemArr.push(ctr);
    }

    /**列表滑动事件 */
    private onScrollIng(ctx: ScrollView) {
        if (this._loadEnd) {
            const sch = this.node.getComponent(UITransform).height / 2,
                ch = this._content.getComponent(UITransform).height,
                cntY = this._content.getPosition().y,
                fg = cntY <= (ch - sch - 50);
            ctx.elastic = fg;
        }
        if (this._call)
            this._call(CallType.Scrolling, ctx);
    }
    /**顶部回弹 */
    private onScrollTop(ctx: ScrollView) {
        // ctx.stopAutoScroll();
        // if (this._call)
        //     this._call(CallType.Update, (list: any) => {
        //         this.updateList(list, true);
        //     });
    }
    /**底部回弹 */
    private onScrollBOTTOM(ctx: ScrollView) {
        if (this._loadEnd || this._isLoading) return;
        ctx.stopAutoScroll();
        if (this._call)
            this._call(CallType.More);
    }

    /**回到顶部 */
    onBackToTop(val: number = 0.1) {
        this.getComponent(ScrollView).scrollToTop(val);
    }
}



export enum CallType {
    /**更新 */
    Update,
    /**向下请求数据 */
    More,
    /**滑动中 */
    Scrolling
}


