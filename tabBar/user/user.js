var app = getApp();
import { login } from '../../plugins/login';
import { wxapi } from '../../plugins/wxapi';
import { share } from '../../plugins/share';
import { userApi } from '../../pages/api/userApi'

Page({
    data: {
        winHeight: '',
        winWidth: '',
        winWidth: 0,
        winHeight: 0,
        // 当前登录信息
        userInfo: {},
        verifyCodeTime: '验证',
        buttonDisable: '',
        hidden: true,
        phoneBorder: false,
        codeBorder: false,
        error: false,
        //提现
        personalval: '',
        //分享
        shareclientYstart: '',
        shareclientYmove: '',
        // 登录弾层（默认隐藏）
        loginShow: false,
        //授权弹窗（默认隐藏）
        userShow: false,
        // 当前登录信息
        userInfo: { follow_num: 0, article_num: 0, fans_num: 0 },
        //用户授权没有手机号
        userInfoacc: {},
        //微信授权信息
        wxUser: false
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        var that = this;
        that.login = new login(that);
        that.wxapi = new wxapi(that);
        //初始化分享
        that.shareObj = new share(that);
        // 用户接口
        that.userApi = new userApi(that);
        // 设置分享内容
        that.shareObj.setShare('电动邦，带您一起了解新能源汽车、用好新能源车、玩好新能源汽车！', '/pages/tabBar/user/user');
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
        //登录状态更新
        that.userApi.ckPromission();
    },
    onShow: function () {
        var that = this;
         // 设置用户信息
        that.data.userInfo = that.userApi.getLoginInfo();
        
        if (!that.data.userInfo || !that.data.userInfo.token) {
            that.data.userInfo = that.userApi.getAccredit();
     
            that.setData({ userInfo: that.data.userInfo });

            if (!that.data.userInfo.openid){
                setTimeout(function () {
                    that.data.userInfo = that.userApi.getAccredit();
                    // console.log(that.data.userInfo);
                    // console.log(wx.getStorageSync('user_info'));
                    if (wx.getStorageSync('user_info')){
                      that.data.userInfo = wx.getStorageSync('user_info');
                    }
                    that.setData({ userInfo: that.data.userInfo });
                }, 2000);
            }else{
                
                setTimeout(function () {
                    that.data.userInfo = that.userApi.getLoginInfo();
                    that.userApi.personal(that.data.userInfo.id, 'cd_personalval');
                    
                }, 2000);
            }

        }else{
            console.log("=============");
            // that.data.userInfo = that.userApi.getLoginInfo();
            that.userApi.personal(that.data.userInfo.id, 'cd_personalval');
        }
        
        that.setData({
            'userInfo': that.data.userInfo,
            'loginShow': false,
            'userShow': false
        });
        console.log('zuihoude ', that.data.userInfo)
    },
    mycomment:function(){
        var that = this;

        //跳转到评论消息列表，可返回
        wx.navigateTo({
            url: '../../pages/user/comment/comment'
        })


    },
    //个人信息
    cd_personalval: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            // console.log(res);
            that.data.personalval = res.data
            that.setData({
                userInfo: that.data.personalval,
                loginShow: false,
            });
        }
        console.log(that.data.userInfo.token)

    },
    /**
     * 点击用户头像再次授权
     * 
     */
    redelegation: function (e) {
        var that = this;
        console.log(e)
        that.data.wxUser = that.userApi.getAccredit();
        if (!that.data.wxUser) {
            that.userTips(1);
        }
        that.userApi.wxlogin();
        // 检测授权状态
        that.userApi.ckPromission();
        // 微信授权登录,方法回调
        // that.onShow();
        that.data.userInfo = that.userApi.getLoginInfo();
        // that.userApi.wxlogin('_cb_reLogin');
        // 设置用户信息
        setTimeout(function () {
            that.data.userInfo = that.userApi.getLoginInfo();
            console.log("655656565656565")
            console.log(that.data.userInfo)
            that.userApi.personal(that.data.userInfo.id, 'cd_personalval');
        }, 700);
    },
    /**
 * 修改个人资料
 */
    goprofile: function () {
        var that = this;
        // 授权信息检测
        that.data.wxUser = that.userApi.getAccredit();
        if (!that.data.wxUser) {
            that.userTips(1);
            return false
        }
        // 登录信息检测
        var loginStatus = that.userApi.checkLogin();
        console.log(loginStatus);
        if (!loginStatus.status) {
            that.userApi.wxlogin();
            // 已授权显示登录弹窗
            if (loginStatus.promission) {
                that.loginTips(1);
            }
            return false;
        }
        that.data.userInfo = that.userApi.getLoginInfo();
        that.userApi.personal(that.data.userInfo.id, 'cd_overloginfile');
    },
    cd_overloginfile: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            //跳转到新页面，可返回
            wx.navigateTo({
                url: '../../pages/user/profile/profile'
            })
        }else if (res.code == 3001) {
            that.removeStoragelogin()
        }
    },
    /**
     * 我的收藏
     */
    myCollect: function (e) {
        var that = this;
        // 授权信息检测
        that.data.wxUser = that.userApi.getAccredit();
        if (!that.data.wxUser) {
            that.userTips(1);
            return false
        }
        // 登录信息检测
        var loginStatus = that.userApi.checkLogin();
        if (!loginStatus.status) {
            that.userApi.wxlogin();
            // 已授权显示登录弹窗
            if (loginStatus.promission) {
                that.loginTips(1);
            }
            return false;
        }
        that.data.userInfo = that.userApi.getLoginInfo();
        that.userApi.personal(that.data.userInfo.id, 'cd_overloginmyCollect');
    },
    cd_overloginmyCollect: function (res, opt) {
        if (res.code == 0) {
            //跳转到新页面，可返回
            wx.navigateTo({
                url: '/pages/user/collect/collect'
            })
        } else if (res.code == 3001) {
            that.removeStoragelogin()
        }
    },
    /**
      * 车型对比
      */
    carContrast: function (e) {
        var that = this;
        // 授权信息检测
        that.data.wxUser = that.userApi.getAccredit();
        if (!that.data.wxUser) {
            that.userTips(1);
            return false
        }
        // 登录信息检测
        var loginStatus = that.userApi.checkLogin();
        if (!loginStatus.status) {
            that.userApi.wxlogin();
            // 已授权显示登录弹窗
            if (loginStatus.promission) {
                that.loginTips(1);
            }
            return false;
        }
        that.userApi.personal(that.data.userInfo.id, 'cd_overloginContrast');
    },
    cd_overloginContrast: function (res, opt) {
        if (res.code == 0) {
            //跳转到新页面，可返回
            wx.navigateTo({
                url: '../../pages/user/contrast/index/index'
            })
        } else if (res.code == 3001) {
            that.removeStoragelogin();
        }
    },
    removeStoragelogin:function(){
        //清除个人缓存缓存
        var that = this;
        wx.removeStorage({
            key: 'user_info',
            success: function (res) {
                console.log(res.data)
            }
        })
        wx.removeStorage({
            key: 'wx_accredit',
            success: function (res) {
                console.log(res.data)
            }
        })
    },
    _cb_login: function (res, opt) {
        var that = this;
        console.log('----cb_login')
        console.log(res);
        that.setData({ 'userInfo': res });
    },
    // 显示登录弾层
    loginTips: function (isshow) {
        var that = this;
        that.data.loginShow = isshow;
        console.log(that.data.loginShow);
        that.setData({ loginShow: that.data.loginShow });
    },
    //显示授权弹窗
    userTips: function (isshow) {
        var that = this;
        that.data.userShow = isshow;
        that.setData({ userShow: that.data.userShow });
        //弹窗消失之后触发onShow中的方法
        app.ddbevent.on('callme', function (data) {
          that.onShow();
        });
    },

    // 登录信息回调
    _cb_reLogin: function (res, opt) {
        // console.log('666666666666_cb_relogin');
        console.log(res);
        this.setData({ userInfo: res });
        that.onShow();
    },
    personalvalto: function () {
        var that = this;
        //跳转到提现
        wx.navigateTo({
            url: '../../pages/user/amount/amount?amount=' + that.data.personalval.amount + '&&authorid=' + that.data.userInfo.id
        })
    },
    onShareAppMessage: function (options) {
        var that = this;
        if (options.from === 'button') {
            console.log('按钮转发');
        } else {
            console.log('右上角转发');
        }
        return that.shareObj.getShare();
    },
    getCode: function () {
        var that = this;
        that.login.sendCode();
    },

    c: function (e) {
        var that = this;
        // that.login.mobileInputEvent();
        // console.log(e.detail.value);
        that.data.mobile = e.detail.value;
        that.setData({
            mobile: e.detail.value,
            error: false
        })

    },

    codeInputEvent: function (e) {
        var that = this;
        that.data.verifyCode = e.detail.value;
        // console.log(e.detail.value);
        that.setData({
            verifyCode: e.detail.value
        })
    },

    phoneSubmit: function () {
        var that = this;
        that.login.phoneSubmit();
    },

    inPhone: function () {
        var that = this;
        that.login.inPhone();
    },

    outPhone: function () {
        var that = this;
        that.login.outPhone();
    },

    inCode: function () {
        var that = this;
        that.login.inCode();
    },

    outCode: function () {
        var that = this;
        that.login.outCode();
    },

    close: function () {
        var that = this;
        that.login.close();
    },
    _cb_setLogin: function (res, opt) {
        var that = this;
        that.data.userInfo = res;
        that.setData({ 'userInfo': that.data.userInfo });
    },



    /**
     * 微信群组
     */
    wxGroup: function (e) {
        var that = this;
        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/group/list/list'
        })
    },
    /**
     * 微信客服
     */
    wxService: function (e) {
        var that = this;

        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/group/service/service'
        })
    },
    /**
     * 意见反馈
     */
    gofeedback: function () {
        var that = this;
        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../pages/group/feedback/feedback'
        })
    },
    onPullDownRefresh: function () {
        var that = this;
        that.onShow();
        wx.stopPullDownRefresh();
    },

    //     onReady: function () {
    //     var that = this;
    //     // 获取登录信息
    //     // var userInfo = that.wxapi.getUserInfo();
    // },
    // 统一设置模板变量
    // setPageVars: function (res) {
    //     var that = this;
    //     console.log('setPageVar function data:');
    //     if (res) {
    //         // 设置全局变量用户信息
    //         that.data.userInfo = res;

    //         that.setData({
    //             userInfo: res,
    //             has_mobile: res.has_mobile
    //         });
    //     }

    // },
    // handletouchstart: function (event) {
    //     var that = this;
    //     that.data.shareclientYstart = event.touches[0].clientY;
    // },
    // handletouchmove: function (event) {
    //     var that = this;
    //     that.data.shareclientYmove = event.touches[0].clientY;
    //     if (that.data.shareclientYstart > that.data.shareclientYmove) {
    //         //向上滑动
    //         // console.log("向上")
    //         that.shareObj.showShare();
    //     } else {
    //         //向下滑动
    //         // console.log("向下")
    //         that.shareObj.hideShare();
    //     }
    // },
    // // 页面停止，静止3秒
    // handletouchend: function () {
    //     var that = this;
    //     that.shareObj.handletouchend();
    // },
    // getpersonal: function (e) {
    //   var that = this;
    //   console.log(that.data.userInfo);
    //   var headImg = that.data.userInfo.img.split(',');
    //   if (!headImg.length) {
    //     return false;
    //   }

    //   wx.previewImage({
    //     urls: [headImg[0]] // 需要预览的图片http链接列表
    //   })
    // },
    // //跳转至关注页面
    // goFollow: function (e) {
    //     var that = this;
    //     var authorid = e.currentTarget.dataset.id;
    //     //跳转到新页面，可返回
    //     if (authorid > 0) {
    //         wx.navigateTo({
    //             url: '/pages/user/follow/follow'
    //         })
    //     }
    // },
    // //跳转至粉丝页面
    // goFans: function (e) {
    //     var that = this;
    //     var authorid = e.currentTarget.dataset.id;
    //     //跳转到新页面，可返回
    //     if (authorid > 0) {
    //         wx.navigateTo({
    //             url: '/pages/user/fans/fans'
    //         })
    //     }
    // },
    //     /**
    //  * 检测登录状态
    //  */
    //     checkLogin: function () {
    //         var that = this;
    //         // 检测授权状态
    //         if (!getApp().accredit) {
    //             that.userApi.ckPromission();
    //             return false;
    //         }
    //         // 当前登录信息
    //         var loginInfo = getApp().globalData.userInfo;
    //         if (!loginInfo || !loginInfo.has_mobile || !loginInfo.id || !loginInfo.token) {
    //             that.loginTips(1);
    //             return false;
    //         }
    //         return true;
    //     },
});
