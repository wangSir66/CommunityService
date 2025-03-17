import { _decorator, Component, director, Label, Node, ProgressBar, SceneAsset } from 'cc';
import { Config } from '../../../Common/Config';
import { Main } from '../../../Common/Main';
const { ccclass, property } = _decorator;

@ccclass('LoadPage')
export class LoadPage extends Component {

    @property({ type: Node })
    private bg: Node = null;
    @property({ type: ProgressBar })
    private bar: ProgressBar = null;
    @property({ type: Label })
    private barLb: Label = null;

    private _currLoadIndx: number;
    private readonly firstRate: number = 0.2;

    protected onLoad(): void {
        const m = new Main();
        Object.freeze(m);
        Main.Self.Store.SwitchScene = 0;
        this.bar.progress = 0;
    }

    protected start(): void {
        this._currLoadIndx = 0;
        director.preloadScene('LogIn', this.onProGress.bind(this), this.onLoaded.bind(this));
    }

    private onProGress(completedCount: number, totalCount: number, item: any) {
        const rate = completedCount / totalCount * (this._currLoadIndx == 0 ? this.firstRate : 1 - this.firstRate) + (this._currLoadIndx == 0 ? 0 : this.firstRate);
        this.bar.progress = rate;
        this.barLb.string = `${(rate * 100).toFixed(0)}%`;
    }

    private onLoaded(error: null | Error, sceneAsset?: SceneAsset) {
        if (!error) {
            if (this._currLoadIndx == 0) {
                this._currLoadIndx = 1;
                director.preloadScene('Game', this.onProGress.bind(this), this.onLoaded.bind(this));
            } else director.loadScene('LogIn');
        }
    }
}
