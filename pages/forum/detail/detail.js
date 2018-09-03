// pages/forum/detail/detail.js
var app = getApp();//获取应用实例
var wxParse = require('../../../wxParse/wxParse.js');
import { forumApi } from '../../api/forumApi.js';
import { userApi } from '../../api/userApi.js';
import { tongjiApi } from '../../api/tongjiApi.js';

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 接收页面参数/页面全局参数
        args: {
            sourceid: 0,
            platid: 0,
            // 文章类型标识（article/long/dynamic)
            ctype: '',
        },
        showReply:true,
        argsContent: {
            sourceid: 0,
            platid: 0,
            content: '',
            pid: 0,
            puid: 0
        },
        replyindex: -1,
        // 加载中
        loading: true,
        // 评论列表
        inputComment: '',
        imgArr: [],
        isPraise: false,
        isfollow: '',
        isdigest: '',
        userPraise: 0,
        onfavorite: false,
        commentShow: true,
        showCollet: false,
        btnColor: true,
        replyList: [],
        // pid:'undefined',
        puid: 0,
        cardPage: true,
        // 登录弾层（默认隐藏）
        loginShow: false,
        // 用户权限
        userPowers: '',
        page: 1,
        dotBg: false,
        nickName: '',
        loadShow: true,
        //授权弹窗（默认隐藏）
        userShow: false,
        //微信授权信息
        wxUser: false,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.showLoading({ title: '努力加载中...' })
        // 接收页面传参
        that.data.args = options;
        // that.data.args = {
        //     sourceid: 58555,
        //     platid: 5,
        //     ctype: "article",
        // },
        // console.log(that.data.args);
        that.forumApi = new forumApi(that);
        that.userApi = new userApi(that);
        that.data.userInfo = that.userApi.getLoginInfo();
        // console.log(that.data.userInfo.mobile)
        that.forumApi.info(that.data.args, 'cb_info');
        //是否收藏
        that.userApi.hasFavorites('article', that.data.args.sourceid + '_' + that.data.args.platid, 'cb_isFavorite');
        //是否点赞
        that.userApi.hasFavorites('praise', that.data.args.sourceid + '_' + that.data.args.platid, 'cb_praise');
        //是否用户点赞
        // that.userApi.hasFavorites('praise', that.data.args.sourceid + '_' + that.data.args.platid, 'cb_isCacheFavorite');
        //默认加载第1页评论
        that.replyList(that.data.page);
        that.setPageVars();
        //登录状态更新
        that.userApi.ckPromission();
        //微信授权状态更新
        that.data.wxUser = that.userApi.getAccredit();
        //取消关注（功能砍掉）
        // that.userApi.removeDigest(that.data.args.sourceid, that.data.args.platid, 'cb_removedigest');
        // that.setData({
        //     cardPage: true
        // })

    },
    cb_isCacheFavorite:function(res,opt){
        console.log("驶入电大啊的")
        console.log(res)

    },
    onShow: function () {
        // console.log('args', that.data.args);
        var that = this;
        // console.log(that.data.loginInfo);
        // //授权状态检测判断更新
        // that.data.wxUser = that.userApi.getAccredit();
        // if (!that.data.wxUser) {
        //     console.log('不存在授权信息')
        //     that.userTips(1);
        // }
        // that.userApi.wxlogin();
        // // 检测授权状态
        // that.userApi.ckPromission();

        // // that.forumList('last');
        // console.log('-------------', that.data.loginInfo);
    },
    cb_info: function (res, opt) {
      // console.log(res,'detail')
        var that = this;
        if (typeof (res.data.content) == 'undefined' || !res.data.content) {
            wx.showToast({
                title: '文章已下架',
                image: '/pages/images/warning.png',
                success: function () {
                    setTimeout(function () {
                        wx.navigateBack();
                    }, 1000);
                }
            })
            return false;
        };
        that.data.detailData = res.data;
        var articleData = that.data.detailData.nativeContent;
        // console.log(articleData);
        wxParse.wxParse('articleData', 'html', articleData, that, 0);
        if (res.data.digest == 1) {
            //已经是精华了
            that.setData({
                isdigest: 1
            })
        } else {
            //不是精华帖
            that.setData({
                isdigest: 0
            })
        }
        // that.userApi.hasFollows(that.data.detailData.authorid, 'cb_follow');
        for (var i = 0; i < res.data.content.length; i++) {
            if (res.data.content[i].type == 'img') {
                that.data.imgArr.push(res.data.content[i].decode.src);
            }
        }
        // 设置页面标题
        var title = res.data.title ? res.data.title : res.data.intro;
        if (title) {
            title = title.substring(0, 30);
            title += ' - ';
        }
        if (res.data.author) {
            title += res.data.author + '的' + (res.data.ctype == 'dynamic' ? '动态' : '文章');
        }
        // wx.setNavigationBarTitle({
        //   title: title,
        // });

        var pageVars = {
            detailData: that.data.detailData,
            imgArr: that.data.imgArr,
        }
        // 页面定位
        if (typeof (that.data.args.scrollView) != 'undefined' && that.data.args.scrollView) {
            pageVars['scrollY'] = true;
            pageVars['scrollView'] = that.data.args.scrollView;
        }
        that.setData(pageVars);
        // 隐藏加载
        setTimeout(function () {
            wx.hideLoading();
            that.setData({
                loadShow: false
            })
        }, 200);
    },
    //点击进入个人主页
    _personal: function (e) {
        //跳转个人主页
        var that = this;
        var pages = getCurrentPages()    //获取加载的页面
        var currentPage = pages[pages.length - 1]    //获取当前页面的对象
        var url = currentPage.route    //当前页面url

        //如果当前页面为个人主页 则不继续跳转 避免进入死循环
        if (url == 'pages/user/personal/personal') {
            return false
        }
        var authorid = e.currentTarget.dataset.id;
        var author = e.currentTarget.dataset.author;
        var avatar = e.currentTarget.dataset.avatar;
        // 页面跳转
        if (authorid > 0) {
            wx.navigateTo({
                url: '/pages/user/personal/personal?authorid=' + authorid + '&author=' + author + '&avatar=' + avatar
            })
        }

    },
    //显示授权弹窗
    userTips: function (isshow) {
        var that = this;
        that.data.userShow = isshow;
        that.setData({ userShow: that.data.userShow });
    },
    //用户是否获得点赞
    userAgree: function (e) {
        var that = this;
        // console.log(that.data.replyList.list);
        console.log(e.currentTarget.dataset.replyid);
        console.log(e.currentTarget.dataset.index);
        var loginInfo = wx.getStorageSync('user_info');
        var argsAgree = {
            sourceid: that.data.args.sourceid,
            platid: that.data.args.platid,
            replyid: e.currentTarget.dataset.replyid,
            authorid: e.currentTarget.dataset.puid,
        };
        that.data.Agreeindex = e.currentTarget.dataset.index;

        var list = that.data.replyList;
        for (var i in list) {
            if (i == that.data.Agreeindex) {
                list[i].showAgree = !list[i].showAgree;
                list[i].supports = Number(list[i].supports) + 1;
                that.setData({
                    replyList: list
                })
                break;
            }
        }

        // console.log(argsAgree);
        var praise = that.userApi.userPraise(argsAgree, 'cb_userPraise');
        if (praise && typeof (praise.code) != 'undefined' && praise.code == 200 && typeof (praise.message) != 'undefined') {
            wx.showToast({
                title: praise.message,
                image: '/pages/images/warning.png',
            })
        }
    },
    cb_userPraise: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            wx.showToast({
                title: '点赞成功',
                image: '/pages/images/success.png',
                duration: 1000
            })
        } else if (res.code == 3001) {
            console.log("res code 3001")
            that.removeStoragelogin()
            that.userTips(1);
        }
    },
    //是否收藏
    cb_isFavorite: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            that.setData({
                onfavorite: res.data[opt.ids]
            })
        } else if (res.code == 3001) {
            console.log("res code 3001")
            that.removeStoragelogin()
            that.userTips(1);
        }
    },
    //是否点赞
    cb_praise: function (res, opt) {
        var that = this;
        // console.log('cb_praise-----')
        // console.log(res);
        // 
        if (res.code == 0 && typeof (res['data'][opt.ids]) != 'undefined') {
            that.setData({
                ispraise: res.data[opt.ids]
            })
        }
    },
    // 回帖列表
    replyList: function (page) {
        var that = this;
        // 分页参数
        console.log("that.data.args.sourceidthat.data.args.sourceid")
        console.log(that.data.page)
        var page = typeof (page) != 'undefined' ? page : 1;
        var dataArgs = {
            sourceid: that.data.args.sourceid,
            platid: that.data.args.platid,
            page: page
        }
        console.log(dataArgs)
        that.forumApi.replyListcomment(dataArgs, 'cb_replyList');
    },
    // 回帖列表回调函数
    cb_replyList: function (res, opt) {
        var that = this;
        // 1. 接口请求结束
        that.data.floading = false;
        // 2. 判断返回数据
        console.log(res)
        // 结果赋值
        if (res.code == 0) {
            var len = res.data.reply.length;
            that.data.replyArray = [];
            //     console.log(len)
            //     // 全局变量赋值
            if (len > 0) {
                // 分页参数赋值
                if (that.data.replyList.length) {
                    that.data.replyList = that.data.replyList.concat(res.data.reply);
                } else {
                    that.data.replyList = res.data.reply;
                }
                that.data.replyList.forEach(function (ele, i) {
                    if (!that.data.replyList[i].reply) {
                        return;
                    };
                    that.data.replyList[i].replyTotal = ele.reply
                    if (that.data.replyList[i].showReply) {
                        that.data.replyList[i].reply = that.data.replyList[i].replyTotal;
                        return;
                    }
                    ele.showReply = true;
                    if (ele.reply.length > 4) {
                        that.data.replyList[i].showReply = false;
                    }
                    console.log(that.data.replyList[i])
                    that.data.replyList[i].replyTotal = ele.reply
                    that.data.replyList[i].reply = that.data.replyList[i].replyTotal.slice(0, 4);
                    that.data.replyList[i].replyOther = that.data.replyList[i].replyTotal.slice(4);
                })
            } 
            if (len < 10) {
                that.data.replyList = res.data.reply;
                // console.log("55555")
                that.data.nomorelist = 0
                if (that.data.page != 1) {
                    that.setData({
                        nomorelist: that.data.nomorelist,
                    })
                }
            }
            that.data.total = res.data.total
            // 3. 设置模板变量
            that.setData({
                total: that.data.total,
                replyList: that.data.replyList,
                loading: that.data.floading,
                replyArray: that.data.replyArray
            })
        }
    },
    // 查看全部回复
    replycount: function (e) {
        var that = this;
        that.data.replyindex = e.currentTarget.dataset.replyindex;
        var list = that.data.replyList;
        for (var i in list) {
            if (i == that.data.replyindex) {
                if (list[i]['replyOther']){
                    list[i]['reply'] = list[i]['reply'].concat(list[i]['replyOther']);
                }
                list[i].showReply = !list[i].showReply;
                console.log(list)
                that.setData({
                    replyList: list
                })
                break;
            }
        }

        // that.data.replyList[6].reply = that.data.replyList[6].reply
    },
    //上拉触底
    onReachBottom: function () {
        var that = this;
        console.log("到底了");
        if (that.data.nomorelist != 0) {
            that.data.page++
            that.replyList(that.data.page)
        }

    },
    //点击到回复页
    textBind: function (e) {
        var that = this;
        console.log("5555555")
        // 授权信息检测
        that.data.wxUser = that.userApi.getAccredit();
        if (!that.data.wxUser) {
            that.userTips(1);
            return false
        }
        // 登录信息检测
        var loginStatus = that.userApi.checkLogin();
        console.log(loginStatus)
        if (!loginStatus.status) {
            console.log('pppp')
            that.userApi.wxlogin();
            // 已授权显示登录弹窗
            if (loginStatus.promission) {
                that.loginTips(1);
            }
            return false;
        }
        that.data.pid = e.currentTarget.dataset.replyid;
        that.data.puid = e.currentTarget.dataset.puid;
        that.data.author = e.currentTarget.dataset.author;
        that.data.replyindex = e.currentTarget.dataset.replyindex;

        console.log(that.data.userInfo);

        console.log(that.data.pid);
        console.log(that.data.puid);
        console.log(that.data.author);
        console.log("  8888console.log(that.data.replyindex);"+that.data.replyindex);
        // var loginInfo = getApp().globalData.userInfo;
        // 改成从缓存中取
        var loginInfo = wx.getStorageSync('user_info');

        console.log(loginInfo.id);
        // (that.data.puid != loginInfo.id)
        if (loginInfo.id) {
            if (that.data.author == undefined) {
                that.setData({
                    showCollet: true,
                    commentShow: false,
                    replyAuthor: ''
                })
            } else {
                that.setData({
                    showCollet: true,
                    commentShow: false,
                    replyAuthor: that.data.author
                })
            }
        }
    },
    // 显示登录弾层
    loginTips: function (isshow) {
        var that = this;
        that.data.loginShow = isshow;
        that.setData({ loginShow: that.data.loginShow });
    },
    //从回复页到详情页
    infoMain: function () {
        var that = this;
        that.setData({
            showCollet: false,
            commentShow: true,
        })
    },
    bindinput: function (e) {
        var that = this;
        if (e.detail.value == '' || e.detail.value.trim().length == 0) {
            that.setData({
                btnColor: true
            });
        } else {
            that.setData({
                btnColor: false
            });
        }
    },
    //点击发送
    formSubmit: function (e) {
        var that = this;
        // console.log(e.detail.value.input.length);
        that.data.inputComment = e.detail.value.input;
        console.log("  8888console.log(that.data.replyindex);" + that.data.replyindex);
        if (e.detail.value.input == '' || e.detail.value.input.trim().length == 0) {
            wx.showToast({
                title: '不能为空',
                image: '/pages/images/warning.png'
            });
            return false;
        } else if (e.detail.value.input.length > 5000) {
            wx.showToast({
                title: '不多于5000字',
                image: '/pages/images/warning.png'
            });
            return false;
        }
        if (that.data.pid == undefined) {
            that.data.argsContent = {
                sourceid: that.data.args.sourceid,
                platid: that.data.args.platid,
                content: that.data.inputComment,
                // authorid: that.data.userInfo.id,
                authorid:'',
                author: that.data.userInfo.name,
                avatar: that.data.userInfo.img,
            };
        } else {
            that.data.argsContent = {
                sourceid: that.data.args.sourceid,
                platid: that.data.args.platid,
                content: that.data.inputComment,
                // authorid: that.data.userInfo.id,
                authorid: '',
                author: that.data.userInfo.name,
                avatar: that.data.userInfo.img,
                replyid: that.data.pid
            };
        }
        // 按钮发送状态
        that.setData({ sending: true, sendName: '发送中', loginShow: false });
        that.forumApi.addreplyComment(that.data.argsContent, 'cb_addComment');
    },
    //新增评论
    cb_addComment: function (res, opt) {
        var that = this;
        console.log(res)
        console.log("  8888console.log(that.data.replyindex);" + that.data.replyindex);
        if (res.code == 0) {
            // that.data.replyList = { list: [], pageArgs: {}, isEnd: false },
            // that.replyList(1);
            if (that.data.pid != undefined) {
                console.log("回复一级and二级")
                if (that.data.author != that.data.userInfo.name) {
                    var arrshift = {
                        sourceid: that.data.args.sourceid,
                        platid: that.data.args.platid,
                        content: that.data.inputComment,
                        authorid: that.data.userInfo.id,
                        author: that.data.userInfo.name,
                        avatar: that.data.userInfo.img,
                        replyid: res.data.replyid,
                        supports: 0,
                        showTime: res.data.showTime,
                        reply_author: that.data.author,
                    }
                } else {
                    var arrshift = {
                        sourceid: that.data.args.sourceid,
                        platid: that.data.args.platid,
                        content: that.data.inputComment,
                        authorid: that.data.userInfo.id,
                        author: that.data.userInfo.name,
                        avatar: that.data.userInfo.img,
                        replyid: res.data.replyid,
                        supports: 0,
                        showTime: res.data.showTime,

                    }
                }
                console.log(arrshift)
                console.log(that.data.replyindex)
                // that.data.replyindex = e.currentTarget.dataset.replyindex;
                var list = that.data.replyList;
                for (var i in list) {
                    if (i == that.data.replyindex) {
                        if (!list[i].reply) {
                            list[i].reply = [];
                            list[i].showReply = true;
                        }
                        list[i]['reply'] = list[i]['reply'].concat(arrshift);
                        that.setData({
                            replyList: list
                        })
                    }
                }
            } else {
                console.log("我是评论评论我是评论评论")
                var arrshift = [{
                    sourceid: that.data.args.sourceid,
                    platid: that.data.args.platid,
                    content: that.data.inputComment,
                    authorid: that.data.userInfo.id,
                    author: that.data.userInfo.name,
                    avatar: that.data.userInfo.img,
                    replyid: res.data.replyid,
                    supports: 0,
                    showTime: res.data.showTime,
                }]
                that.data.replyList = arrshift.concat(that.data.replyList);
                console.log("55555555555555555555555555555555555555555555555555")
                console.log(that.data.replyList)
                console.log("55555555555555555555555555555555555555555555555555")
            }
            // 新增回复数统计
            // that.tongjiApi.addReplies(opt.sourceid, opt.platid);
            wx.showToast({
                title: '发送成功',
                image: '/pages/images/success.png'
            });

            that.setData({
                commentShow: true,
                showCollet: false,
            })
            that.setData({
                loginShow: that.data.loginShow,
                name: '',
                commentShow: true,
                showCollet: false,
                sending: false,
                sendName: '',
                replyList: that.data.replyList,
            });
            that.data.pid = 'undefined';
        }else if (res.code == 3001) {
            console.log("res code 3001")
            that.removeStoragelogin()
            wx.showToast({
                title: '请先登录~',
                image: '/pages/images/warning.png'
            });

            that.setData({
                commentShow: true,
                showCollet: false,
            })
            that.setData({
                loginShow: that.data.loginShow,
                name: '',
                commentShow: true,
                showCollet: false,
                sending: false,
                sendName: '',
                replyList: that.data.replyList,
            });
            that.data.pid = 'undefined';
            that.userTips(1);
        }
    },
    //  文章点赞功能
    onPraise: function () {
        //点赞
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
        var loginInfo = wx.getStorageSync('user_info');
        // that.userApi.addFavorite('praise', that.data.args.sourceid, that.data.args.platid,'cb_onPraise');

        that.userApi.addonPraise('praise', that.data.args.sourceid, that.data.args.platid, loginInfo.id, 'cb_onPraise');
    },
    cb_onPraise: function (res, opt) {
        var that = this;
        // console.log(that.data.isPraise)
        // console.log(res)
        if (res.code == 0) {
            that.data.detailData.points.agree = Number(that.data.detailData.points.agree) + 1
            wx.showToast({
                title: '点赞成功',
                image: '/pages/images/success.png',
                duration: 1000
            })
            that.setData({
                detailData: that.data.detailData,
                ispraise: true
            });
            // 统计点赞数
            // that.tongjiApi.addAgree(that.data.args.sourceid, that.data.args.platid);
        } else if (res.code == 3001) {
            console.log("res code 3001")
            that.removeStoragelogin()
            that.userTips(1);
        }
    },
    //添加收藏
    favorite: function () {
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

        // 添加收藏
        that.userApi.addFavorite('article', that.data.args.sourceid, that.data.args.platid, 'cb_favorite');
    },
    cb_favorite: function (res, opt) {
        var that = this;
        // console.log(that.data.onfavorite)
        // console.log(res)
        if (res.code == 0) {
            wx.showToast({
                title: '收藏成功',
                image: '/pages/images/success.png',
                duration: 1000
            })
            that.setData({
                onfavorite: true,
                cardPage: true
            })
        }else if (res.code == 3001) {
            console.log("res code 3001")
            that.removeStoragelogin()
            that.userTips(1);
        }
    },
    // 取消收藏
    removeFavorite: function () {
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

        that.userApi.removeFavorite('article', that.data.args.sourceid, that.data.args.platid, 'cb_removefavorite');
        that.setData({
            cardPage: true
        })
    },
    cb_removefavorite: function (res, opt) {
        var that = this;
        // console.log(that.data.onfavorite)
        // console.log(res);
        if (res.code == 0) {
            wx.showToast({
                title: '已取消',
                image: '/pages/images/success.png',
                duration: 1000
            })
            that.setData({
                onfavorite: false
            })
        }else if (res.code == 3001) {
            console.log("res code 3001")
            that.removeStoragelogin()
            that.userTips(1);
        }
    },
    //图片预览
    previewImage: function (e) {
        var that = this;
        var current = e.target.dataset.src;
        // console.log(that.data.imgArr);
        wx.previewImage({
            current: current, // 当前显示图片的http链接  
            urls: that.data.imgArr // 需要预览的图片http链接列表  
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        var that = this;
        if (that.data.args.ctype == 'dynamic') {
            var dynamicIntro = that.data.detailData.intro;
            // console.log(dynamicIntro);
            if (dynamicIntro.length > 22) {
                dynamicIntro = dynamicIntro.slice(0, 22) + '...';
            }
            if (that.data.detailData.imgs.length > 0) {
                return {
                    title: dynamicIntro,
                    path: '/pages/forum/detail/detail?sourceid=' + that.data.args.sourceid + '&platid=' + that.data.args.platid + '&ctype=' + that.data.args.ctype,
                    imageUrl: that.data.detailData.imgs[0].imgurl,
                    success: function (res) {
                        // 新增分享统计
                        // that.tongjiApi.addShares(that.data.args.sourceid, that.data.args.platid);
                        that.forumApi.shareStongji(that.data.args.sourceid, that.data.args.platid);
                        // console.log('分享成功');
                    },
                    fail: function (res) {
                        // console.log('分享失败');
                    }
                }
            } else {
                return {
                    title: dynamicIntro,
                    path: '/pages/forum/detail/detail?sourceid=' + that.data.args.sourceid + '&platid=' + that.data.args.platid + '&ctype=' + that.data.args.ctype,
                    success: function (res) {
                        // 新增分享统计
                        // that.tongjiApi.addShares(that.data.args.sourceid, that.data.args.platid);
                        that.forumApi.shareStongji(that.data.args.sourceid, that.data.args.platid);
                        // console.log('分享成功');
                    },
                    fail: function (res) {
                        // console.log('分享失败');
                    }
                }
            }
        } else {
            var longTitle = that.data.detailData.title;
            // console.log(longTitle);
            if (longTitle.length > 22) {
                longTitle = longTitle.slice(0, 22) + '...';
            }
            return {
                title: longTitle,
                path: '/pages/forum/detail/detail?sourceid=' + that.data.args.sourceid + '&platid=' + that.data.args.platid + '&ctype=' + that.data.args.ctype,
                imageUrl: that.data.detailData.cover,
                success: function (res) {
                    // 新增分享统计
                    // that.tongjiApi.addShares(that.data.args.sourceid, that.data.args.platid);
                    that.forumApi.shareStongji(that.data.args.sourceid, that.data.args.platid);

                    // console.log('分享成功');
                },
                fail: function (res) {
                    // console.log('分享失败');
                }
            }
        }
    },
    removeStoragelogin: function () {
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
    setPageVars: function () {
        var that = this;
        // console.log(that.data);
        that.setData(that.data);
    },
    // card: function (e) {
    //     var that = this;
    //     if (that.data.cardPage == true) {
    //         that.setData({
    //             cardPage: false,
    //         })
    //     } else {
    //         that.setData({
    //             dotBg: false,
    //         })
    //     }
    // },
    // cb_relogin: function (res, opt) {
    //     that.data.userInfo = res;
    // },
    // onReady: function () {
    //     var that = this;
    //     // console.log("onReady");
    // },

    // //回到首页
    // goIndex: function () {
    //     wx.switchTab({
    //         url: '/tabBar/forum/forum'
    //     })
    // },
    // cb_removedigest: function (res, opt) {
    //     console.log(res)
    //     console.log(opt)
    //     var that = this;
    //     if (res.code == 0) {
    //         wx.showToast({
    //             title: '取消成功',
    //             image: '/pages/images/success.png',
    //             duration: 1000
    //         })
    //         that.setData({
    //             isdigest: 0,
    //         })
    //     }
    // },
    // //是否关注
    // cb_follow: function (res, opt) {
    //     var that = this;
    //     if (res.code == 0) {
    //         // console.log(res.data[opt.followids])
    //         that.setData({
    //             isfollow: res.data[opt.followids]
    //         })
    //     }
    // },
    // addfollow: function (e) {
    //     //关注人
    //     var that = this;
    //     // 授权信息检测
    //     that.data.wxUser = that.userApi.getAccredit();
    //     if (!that.data.wxUser) {
    //         that.userTips(1);
    //         return false
    //     }
    //     // 登录信息检测
    //     var loginStatus = that.userApi.checkLogin();
    //     if (!loginStatus.status) {
    //         that.userApi.wxlogin();
    //         // 已授权显示登录弹窗
    //         if (loginStatus.promission) {
    //             that.loginTips(1);
    //         }
    //         return false;
    //     }

    //     that.userApi.addFollow(e.currentTarget.dataset.followid, 'cb_addfollow');

    // },
    // cb_addfollow: function (res, opt) {
    //     var that = this
    //     if (res.code == 0) {
    //         wx.showToast({
    //             title: '关注成功',
    //             image: '/pages/images/success.png',
    //             duration: 1000
    //         })
    //         that.setData({
    //             isfollow: 1,
    //         })
    //     }
    // },
    // removefollow: function (e) {
    //     //取消关注人
    //     var that = this;
    //     // 授权信息检测
    //     that.data.wxUser = that.userApi.getAccredit();
    //     if (!that.data.wxUser) {
    //         that.userTips(1);
    //         return false
    //     }
    //     // 登录信息检测
    //     var loginStatus = that.userApi.checkLogin();
    //     if (!loginStatus.status) {
    //         that.userApi.wxlogin();
    //         // 已授权显示登录弹窗
    //         if (loginStatus.promission) {
    //             that.loginTips(1);
    //         }
    //         return false;
    //     }
    //     wx.showModal({
    //         content: '确定不再关注此人？',
    //         success: function (res) {
    //             if (res.confirm) {
    //                 // console.log('用户点击确定')
    //                 // 
    //                 that.userApi.removeFollow(e.currentTarget.dataset.followid, 'cb_removefollow');
    //             } else if (res.cancel) {
    //                 // console.log('用户点击取消')
    //             }
    //         }
    //     })

    // },
    // cb_removefollow: function (res, opt) {
    //     var that = this;
    //     if (res.code == 0) {
    //         wx.showToast({
    //             title: '取消成功',
    //             image: '/pages/images/success.png',
    //             duration: 1000
    //         })
    //         that.setData({
    //             isfollow: 0,
    //         })
    //     }
    // },
    // //添加精华
    // adddigest: function (e) {
    //     var that = this;
    //     // 授权信息检测
    //     that.data.wxUser = that.userApi.getAccredit();
    //     if (!that.data.wxUser) {
    //         that.userTips(1);
    //         return false
    //     }
    //     // 登录信息检测
    //     var loginStatus = that.userApi.checkLogin();
    //     if (!loginStatus.status) {
    //         that.userApi.wxlogin();
    //         // 已授权显示登录弹窗
    //         if (loginStatus.promission) {
    //             that.loginTips(1);
    //         }
    //         return false;
    //     }

    //     that.userApi.addDigest(that.data.args.sourceid, that.data.args.platid, 'cb_adddigest');
    //     that.setData({
    //         cardPage: true
    //     })
    // },
    // cb_adddigest: function (res, opt) {
    //     // console.log(res)
    //     // console.log(opt)
    //     var that = this
    //     if (res.code == 0) {
    //         wx.showToast({
    //             title: '推荐成功',
    //             image: '/pages/images/success.png',
    //             duration: 1000
    //         })
    //         that.setData({
    //             isdigest: 1,
    //         })
    //     }
    // },
    // removebackground: function () {
    //     var that = this;
    //     that.setData({
    //         cardPage: true
    //     })
    // },
    // //取消精华
    // removedigest: function () {
    //     var that = this
    //     // 授权信息检测
    //     that.data.wxUser = that.userApi.getAccredit();
    //     if (!that.data.wxUser) {
    //         that.userTips(1);
    //         return false
    //     }
    //     // 登录信息检测
    //     var loginStatus = that.userApi.checkLogin();
    //     if (!loginStatus.status) {
    //         that.userApi.wxlogin();
    //         // 已授权显示登录弹窗
    //         if (loginStatus.promission) {
    //             that.loginTips(1);
    //         }
    //         return false;
    //     }

    //     that.userApi.removeDigest(that.data.args.sourceid, that.data.args.platid, 'cb_removedigest');
    //     that.setData({
    //         cardPage: true
    //     })
    // },
    // cb_removedigest: function (res, opt) {
    //     // console.log(res)
    //     // console.log(opt)
    //     var that = this;
    //     if (res.code == 0) {
    //         wx.showToast({
    //             title: '取消成功',
    //             image: '/pages/images/success.png',
    //             duration: 1000
    //         })
    //         that.setData({
    //             isdigest: 0,
    //         })
    //     }
    // },
})