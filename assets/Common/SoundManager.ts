import { AudioClip, AudioSource, Button, Node, director, resources } from "cc";
import { Utils } from "../Utils/Utils";

export const AudioUrl = {
    Click: 'Audio/Click',
    GameStart: 'Audio/gameStart',
    GameWin: 'Audio/gameWin',
    PkEnd: 'Audio/pkEnd',
    Jackpot: 'Audio/jackpot',
    CarEffect: 'Audio/Car_effect',
}

export class Audiomanager {
    private _audioSource: AudioSource;
    private _canSound: boolean;

    constructor() {
        const prt = director.getScene(), adTxt = 'AudioMgrNode';
        let adMgr = prt.getChildByName(adTxt);
        if (!adMgr) {
            adMgr = new Node('AudioMgrNode');
            prt.addChild(adMgr);
            //标记为常驻节点
            director.addPersistRootNode(adMgr);
            adMgr.addComponent(AudioSource);
        }

        this._audioSource = adMgr.getComponent(AudioSource);
        let SoundManager = this;
        /**全局注册 按钮点击事件音效 */
        Button.prototype['touchBeganClone'] = Button.prototype["_onTouchEnded"]
        Button.prototype['_onTouchEnded'] = function (...event) {
            if (this.interactable && this.enabledInHierarchy) {
                SoundManager.playEffect(AudioUrl.Click);
            }
            this.touchBeganClone(...event);
        }
        this._canSound = true;
        resources.preloadDir('Audio');
    }


    playMusic(url: string) {
        if (!this._canSound) return;
        Utils.loadRes(url, AudioClip).then(clip => {
            if (clip.url == url) {
                this._audioSource.clip = clip.res;
                this._audioSource.volume = this._canSound ? 0.8 : 0;
                this._audioSource.loop = false;
                this._audioSource.play();
            }
        }).catch(e => {
            console.error('音乐资源丢失', e, url)
        })
    }

    playEffect(url: string) {
        if (!this._canSound) return;
        Utils.loadRes(url, AudioClip).then(clip => {
            if (clip.url == url)
                this._audioSource.playOneShot(clip.res, this._canSound ? 0.8 : 0);
        }).catch(e => {
            console.error('音效资源丢失', e, url)
        })
    }

    get EnableEffect(): boolean {
        return this._canSound;
    }

    set EnableEffect(val: boolean) {
        this._canSound = val;
    }

    onDestroy() {
        //标记为常驻节点
        // director.removePersistRootNode(this._audioSource.node);
    }
    OnInit() { }
}