// index.ts

import { Config } from "../../common/Config"
import { GMain } from "../../common/GameMain"
import { generateMixed } from "../../utils/util"

// 获取应用实例
// const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: '社交服务软件',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    radioChecked: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
  },
  methods: {
    radioChange() {
      const radioChecked = !this.data.radioChecked;
      this.setData({
        radioChecked
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })

    },
    /**微信登录 */
    async wxLogin() {
      // 登录
      wx.login({
        success: async (res) => {
          console.log(res.code)
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          let response = await GMain.Instance.Store.onHttpSend(Config.HttpApi.login, res.code, 1);
          console.log('response:', response)
        },
      })
    },
    /**游客登录 */
    async ykLogin() {
      // 游客登录
      const params = {
        guestName: generateMixed(Math.floor(Math.random() * 8 + 3))
      }
      let response = await GMain.Instance.Store.onHttpSend(Config.HttpApi.loginGuest, params, 1);
      console.log('response:', response)
      wx.reLaunch({
        url: '/pages/index/index'
      })
      // TODO: 设置token
    },
  },
})
