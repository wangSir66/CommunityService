import { ImageAsset, Prefab, SpriteFrame, Texture2D, assetManager, find, instantiate, js, resources, screen } from "cc";
import { MsgBox, MsgBoxStyle } from "../Views/Common/MsgBox";
import { MsgTip } from "../Views/Common/MessageTip";

export namespace Utils {
    export function loadRes(url: string, type: any): Promise<{ url: string, res: any }> {
        return new Promise<{ url: string, res: any }>(async (resolve, reject) => {
            resources.load(url, type, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const obj = { url, res };
                    resolve(obj);
                }
            });
        });
    }

    export function loadAvatar(url: string): Promise<{ url: string, spriteFrame: SpriteFrame, imageAsset: ImageAsset }> {
        return new Promise<{ url: string, spriteFrame: SpriteFrame, imageAsset: ImageAsset }>(async (resolve, reject) => {
            setTimeout(() => {
                if (url.startsWith('http')) {
                    assetManager.loadRemote<ImageAsset>(url, (_err, imageAsset) => {
                        if (_err) {
                            reject();
                            return;
                        }
                        const spriteFrame = new SpriteFrame();
                        const texture = new Texture2D();
                        texture.image = imageAsset;
                        spriteFrame.texture = texture;
                        const obj = { url, spriteFrame, imageAsset };
                        resolve(obj);
                    });
                } else {
                    this.loadRes('ComComponents/defaulthead/SpriteFrame', SpriteFrame).then((res: any) => {
                        resolve(res);
                    }).catch((err: any) => {
                        reject(err);
                    })
                }
            }, 0)
        });
    }

    //随机数生成
    export function randomInt(min: number, max: number): number {
        if (max < min) return randomInt(max, min);
        else {
            return (min + Math.floor(Math.random() * (max - min + 1)));
        }
    }

    /**
     * 字符串截取函数（汉字按照2~3个ASCII编码计算）
     * @param source 原字符串
     * @param len    截取的长度
     * @param ch     省略字符
     */
    export function clampString(source: string, len: number, ch?: string): string {
        if (source === '' || !source) return;
        let totalLength = 0;
        let dest = '';

        if (ch === undefined) ch = '…';

        let name = Array.from(source);

        /* 计算Unicode编码情况下的字符串长度 */
        for (let i = 0, length = name.length, code; i < length; i++) {

            code = source.charCodeAt(i);
            if (code <= 0x7F) {
                totalLength += 1;
            } else {
                totalLength += 2;
            }

            dest += name[i];
            if (totalLength >= len) break;
        }
        if (dest !== source) return `${dest}${ch}`;
        else return dest;
    }

    /**
    *全面屏
    */
    export function isFullScreen() {
        let viewSize = screen.windowSize;
        let viewWHP = viewSize.width / viewSize.height;
        return viewWHP > 1.8;
    }
    /**像素比 */
    export function getDevicePixelRatio() {
        return screen.devicePixelRatio;
    }

    /**例：15000.00 转成 15,000.00 */
    export function ConvertNumToString(str: number, min: number = 0) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: min,
            maximumFractionDigits: 2,
        });
        return formatter.format(str);
    }

    export function getPFlagStr(val: number | string, showZheng: boolean = true, min: number = 0) {
        if (val == null || val == undefined) return '0.0';
        if (typeof val == 'string') val = Number(val);
        let str: string = this.ConvertNumToString(val, min);
        if (val < 0) str = `${str.slice(0, 1)} ₱${str.slice(1)}`;
        else if (showZheng) str = `+ ₱${str}`;
        else str = `₱${str}`;
        return str;
    }

    /**
     * 弹窗提示
     * @param style 内容
     */
    export async function OpenMsgBox(style: MsgBoxStyle, isOnlyName?: string) {
        const panel = await Utils.loadRes('Prefabs/MsgBox', Prefab),
            pN = instantiate(panel.res), cvs = find('/Canvas');
        if (cvs) {
            if (isOnlyName && cvs.getChildByName(isOnlyName)) return;
            isOnlyName && (pN.name = isOnlyName);
            cvs.addChild(pN);
            const ctr = pN.getComponent(MsgBox);
            ctr.show(style);
        }
    }
    /**
     * 飘窗提示
     * @param str 显示的字符串
     * @returns 
     */
    export async function ShowMesgTip(str: string, icon: 1 | 2 = 2): Promise<MsgTip | null> {
        return new Promise<MsgTip | null>(async (resolve, reject) => {
            try {
                let prefab = await Utils.loadRes(`Prefabs/MsgTipPre`, Prefab);
                let msgboxNode = instantiate(prefab.res);
                const canvas = find('/Canvas');
                if (canvas) {
                    canvas.addChild(msgboxNode);
                    let msgBox = msgboxNode.getComponent(MsgTip);
                    msgBox.show(str, icon);
                    resolve(msgBox);
                }
                resolve(null);
            } catch (error) {
                resolve(null);
            }
        });
    }
    /**加载 loading */
    export async function ShowOrHideLoading(show: boolean) {
        let loadView = find('/Canvas/AsyncLoadding');
        const p = find('/Canvas');
        if (!loadView) {
            if (!show) return;
            const res = await Utils.loadRes('Prefabs/AsyncLoadding', Prefab);
            loadView = instantiate(res.res);
        }
        if (show) {
            if (loadView.parent) return;
            const p = find('/Canvas');
            p.addChild(loadView);
        } else {
            loadView.destroy();
        }
    }
    /**
     * 固定格式时间 
     * @param n 毫秒
     * @param isEnd 一天的结束时间
     * @returns 
     */
    export function getDatToTime(n: number | string, txt = '%s/%s/%s %s:%s:%s') {
        const dT = new Date(n),
            y = dT.getFullYear(),
            m = dT.getMonth() + 1,
            d = dT.getDate(),
            s = dT.getHours(),
            f = dT.getMinutes(),
            ms = dT.getSeconds();
        return js.formatStr(txt, y, m < 10 ? '0' + m : m, d < 10 ? '0' + d : d, s < 10 ? '0' + s : s, f < 10 ? '0' + f : f, ms < 10 ? '0' + ms : ms);
    }

    export function getKTxt(v: number, point = 0) {
        if (v >= 1000) {
            let n1 = v % 1000, num = `${~~(v / 1000)}`;
            if (n1 != 0) {
                num += `.${~~(n1 / 100)}`;
                n1 = n1 % 100;
                if (n1 != 0) {
                    num += `${~~(n1 / 10)}`;
                    n1 = Utils.calculateWithPrecision(n1 % 10, 0);
                    if (n1 != 0) {
                        num += `${n1}`.replace('.', '');
                    }
                }
            }
            if (point) {
                let arr = Number(num).toFixed(point).split('.');
                num = `${arr[0]}`;
                let a1 = arr[1].split('');
                if (a1[a1.length - 1] != '0') num += `.${arr[1]}`;
                else {
                    let ap = [];
                    for (let _i = a1.length - 2; _i >= 0; _i--) {
                        if (a1[_i] != '0' || ap.length > 0) {
                            ap.push(a1[_i]);
                        }
                    }
                    ap.length > 0 && (num += `.${ap.reverse().join('')}`);
                }
            }
            return `${num}K`;
        }
        else return `${v}`;
    }
    
    //精度计算
    export function calculateWithPrecision(num1: number, num2: number, precision: number = 10) {
        // 将小数转换为整数
        const factor = Math.pow(10, precision);
        num1 = Math.round(num1 * factor);
        num2 = Math.round(num2 * factor);

        // 执行计算
        const result = num1 + num2;

        // 将结果转换回原来的小数形式
        return result / factor;
    }

    export function getBetNumbers(numStr: string): string[] {
        let str: string[] = ['', '', ''], arr = numStr.split(',');
        let len = 0;
        for (let _i = 0; _i < arr.length; _i++) {
            const keyAndNum = arr[_i].split(':');
            if (_i % 3 == 0) len = 0;
            const kk = str[len], s = keyAndNum.length == 1 ? keyAndNum[0] : `${keyAndNum[0]}: ${Utils.getKTxt(Number(keyAndNum[1] || 0))}`;
            str[len] += (kk ? '\n' : '') + s;
            len++;
        }
        return str;
    }

    export async function getOpenNumberSps(openNumber: string) {
        let bgs = [];
        if (openNumber) {
            const strArr = openNumber.split(',');
            for (let _i = 0; _i < strArr.length; _i++) {
                const res = await Utils.loadRes(`Texture/card_${strArr[_i]}/spriteFrame`, SpriteFrame);
                bgs[_i] = res.res;
            }
        } else {
            for (let _i = 0; _i < 3; _i++) {
                const res = await Utils.loadRes(`Texture/card_bg/spriteFrame`, SpriteFrame)
                bgs[_i] = res.res;
            }
        }
        return bgs;
    }

    export function preLoadCardImgs() {
        const arr = ['9', '10', 'J', 'Q', 'K', 'A', 'bg'];
        for (let _i = 0; _i < arr.length; _i++) {
            Utils.loadRes(`Texture/card_${arr[_i]}/spriteFrame`, SpriteFrame);
        }
    }

    /**是否是最顶层窗口 */
    export function isInIframe() {
        try {
            return window.self !== window.top
        } catch (e) {
            return true
        }
    }

    export function generateMixed(n) {
        var str = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var res = "";
        for (var i = 0; i < n; i++) {
            var id = Math.ceil(Math.random() * 35);
            res += str[id];
        }
        return res;
    }
}
