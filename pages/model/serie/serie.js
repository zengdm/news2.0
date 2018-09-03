import { favorite } from "../../../plugins/favorite";
import { login } from '../../../plugins/login';
import { wxapi } from '../../../plugins/wxapi';
import { share } from '../../../plugins/share';
import { userApi } from '../../../pages/api/userApi';

var app = getApp();

Page({
    data: {
        cxid: 0,
        pinyin: '',
        city: getApp().city,
        colortab: 2,
        detailData: {},
        cityIdData: '',
        locationData: {},
        carsData: {},
        chexingList: [],
        carList: [],
        deg: 0,
        winHeight: '',
        winWidth: '',
        winWidth: 0,
        winHeight: 0,
        min_guide_price: 0,
        max_guide_price: 0,
        min_actual_price: 0,
        max_actual_price: 0,
        // tab切换 
        currentTab: 0,
        myData: {},
        // 车型对比数量
        contrast: 0,
        isaddshop: false,
        iscontrast: false,
        countnumber: 0,
        hiddenlodding: true,

        //绑定手机号
        verifyCodeTime: '验证',
        buttonDisable: '',
        hidden: true,
        phoneBorder: false,
        codeBorder: false,
        error: false,
        // 收藏相关
        fav: {
            // 收藏的车型列表
            carList: [],
            // 收藏的车型数量
            carNum: 0,
            //对比的车型id数据,以车型id作为下标,值[0|1]确认选中状态
            carIds: {},
            // 选中的车型列表 
            selCars: [],
            // 车系是否被收藏
            serie: false,
            // 是否默认选中
            defaultSel: 0,
            // 默认选中数量
            defaultSelNum: 5,
        },
        // 定时任务
        interval: { obj: '', num: 0 },
        // selCars:[],
        // selCarNum:0,

        //对比弹层
        comparison: false,
        //对比按钮
        forbidOn: false,

        //背景内容滚动  false不可滚动 true可滚动
        scrollBoolean: true,


        //授权弹窗（默认隐藏）
        userShow: false,
        //微信授权信息
        wxUser: false

    },

    onLoad: function (options) {
        wx.showLoading({
            title: '加载中',
        })
        // 页面初始化 options为页面跳转所带来的参数
        var that = this;
        // 参数获取
        console.log(options)
        that.data.pserid = options.pserid ? options.pserid : '773';

        // 收藏对象
        that.fav = new favorite(that);
        // 统一接口类
        that.wxapi = new wxapi(that);
        that.shareObj = new share(that);
        that.userApi = new userApi(that);
        // 检测授权状态
        that.userApi.ckPromission();
        //授权状态检测判断更新
        that.data.wxUser = that.userApi.getAccredit();


        // 根据拼音获取车系信息
        // that.wxapi.serieByPinyin(that.data.pinyin, { city_id: that.data.city.cityId }, 'cb_serieInfo');

        // 根据cxid获取车系信息
        that.wxapi.seriedetailcxid(that.data.pserid, { cxid: that.data.pserid }, 'cb_serieInfo');
        // 根据cxid获取车型信息
        that.wxapi.serieBycxid(that.data.pserid, { city_id: that.data.city.cityId }, 'cb_seriedetailcxid');


        // 用户授权
        // that.wxapi.wxlogin();

        //that.fav.cars = that.fav.getFav('car');
        // that.data.fav.carNum = that.fav.cars.length;
        // that.fav.carIds = {};
        // 收藏的车系
        that.fav.serieIds = that.fav.getFav('serie');

        that.login = new login(that);

        that.setData({
            myData: options
        });

        // 设置城市定位信息
        that.setCity();

        wx.getSystemInfo({
            success: function (res) {
                that.data.winWidth = res.windowWidth;
                that.data.winHeight = res.windowHeight
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });

            }
        });
    },



    onReady: function () {
        var that = this;
        // that.setData({
        //   hiddenlodding: false
        // });
        var pinyin = that.data.myData.pinyin;
        var cityId = that.data.city.cityId;

        // that.setData({
        //   hiddenlodding: true
        // });
    },


    onShow: function () {
        var that = this;
        // 页面加载后获取地理位置
        that.wxapi.getLocation('cb_location');
        // console.log(that.data.loginInfo);

        // if (!that.data.wxUser) {
        //     console.log('不存在授权信息')
        //     that.userTips(1);
        // }
        // that.userApi.wxlogin();
     

        // // that.forumList('last');
        // console.log('-------------', that.data.loginInfo);
    },
    //显示授权弹窗
    userTips: function (isshow) {
        var that = this;
        that.data.userShow = isshow;
        that.setData({ userShow: that.data.userShow });
    },
    // 显示登录弾层
    loginTips: function (isshow) {
        var that = this;
        that.data.loginShow = isshow;
        console.log(that.data.loginShow);
        that.setData({ loginShow: that.data.loginShow });
    },

    // 设置城市定位信息
    setCity: function () {
        var that = this;
        that.setData({
            city: that.data.city
        })
    },

    /**
     * 地理位置回调
     */
    cb_location: function (res, opt) {
        var that = this;
        // 页面传值
        if (res.cityId && res.cityId != that.data.city.cityId) {
            that.data.city = res;
            that.setCity();
            that.wxapi.serieByPinyin(that.data.pinyin, { city_id: res.cityId }, 'cb_serieInfo');
        }
    },

    /**
     * 车系详情回调方法
     */
    cb_serieInfo: function (res, opt) {
        var that = this;

        // 隐藏loading弹窗
        wx.hideLoading();

        if (res.code == 0) {
            that.data.detailData = res.data;
            that.data.picpinyin = res.data.chexi_pinyin;
            that.data.cxid = res.data.cxid;

            // 设置分享标题、地址、图片
            that.shareObj.setShare(
              that.data.detailData.pp_name + that.data.detailData.cx_name + '-电动邦',
              '/pages/model/serie/serie?pserid=' + that.data.cxid,
                that.data.detailData.focus
            );

            // 车系收藏判断
            that.data.fav.serie = 0;
            if (that.fav.serieIds.length > 0) {
                var serieIds = ',' + that.fav.serieIds.join(',');
                if (serieIds.toString().indexOf(',' + that.data.cxid + '_0') >= 0) {
                    that.data.fav.serie = 1;
                }
            }

            // 车型收藏
            that.favCarList(1);

            // 车系收藏
            that.favSerieList();

            that.setData({//逻辑层到视图层
                detailData: that.data.detailData,
                // carsData: that.data.carsData,
                // carDatalen: that.data.carsData.length,
                city: that.data.city,
                picpinyin: that.data.picpinyin,
                cxid: that.data.cxid,
            });

            // 设置收藏统一变量
            that.setTipsData();

            wx.setNavigationBarTitle({
                title: that.data.detailData.pp_name + that.data.detailData.cx_name
            });
        } else {

        }
    },
    cb_seriedetailcxid: function (res, opt) {
        var that = this;
        // 隐藏loading弹窗
        wx.hideLoading();
        if (res.code == 0) {
            that.data.carsData = res.data;
            console.log(that.data.carsData.length)
            var arrprice = [];
            for (var i = 0; i < that.data.carsData.length; i++) {
                //   console.log(that.data.carsData[i])
                for (var q = 0; q < that.data.carsData[i].sales_status_cars.length; q++) {
                    //   console.log(that.data.carsData[i].sales_status_cars[q])
                    for (var w = 0; w < that.data.carsData[i].sales_status_cars[q].niankuan_cars.length; w++) {
                        var carprice = that.data.carsData[i].sales_status_cars[q].niankuan_cars[w];
                        arrprice.push(carprice)
                    }
                }
            }
            //   console.log(arrprice)
            var guideprice = [];
            var actualprice = [];
            for (var h = 0; h < arrprice.length; h++) {
                guideprice.push(arrprice[h].guide_price)
                actualprice.push(arrprice[h].actual_price)
            }
            // console.log(guideprice)
            // console.log(actualprice)
            // console.log(Math.max.apply(null, guideprice))
            // console.log(Math.min.apply(null, guideprice))
            that.data.min_guide_price = Math.min.apply(null, guideprice);
            that.data.max_guide_price = Math.max.apply(null, guideprice);
            that.data.min_actual_price = Math.min.apply(null, actualprice);
            that.data.max_actual_price = Math.max.apply(null, actualprice);
            that.setData({//逻辑层到视图层
                carsData: that.data.carsData,
                min_guide_price: that.data.min_guide_price,
                max_guide_price: that.data.max_guide_price,
                min_actual_price: that.data.min_actual_price,
                max_actual_price: that.data.max_actual_price,
            });
            // 设置收藏统一变量
            that.setTipsData();
        }
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
    scroll: function (e) {
        var that = this;
        if (e.detail.scrollTop > that.data.winWidth - 10) {
            var minscroll = that.data.winHeight * 2 - 100

            that.setData({
                scrollHeight: 0,
                scrollHeights: "height:" + minscroll + "rpx"
            })
        } else {
            that.setData({
                scrollHeight: -1,
                scrollHeights: ''
            })
        }

        //分享
        if (e.detail.deltaY < 0) {
            //向上滑动
            // console.log("向上")
            that.shareObj.showShare();

        } else {
            //向下滑动
            // console.log("向下")
            that.shareObj.hideShare();
        }



    },

    swichNav: function (e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        }
        else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    getitemtwo: function (e) {
        var that = this;
        that.setData({
            swipercurrentt: 1
        })
    },
    getitemone: function (e) {
        var that = this;
        that.setData({
            swipercurrentt: 0
        })
    },
    bindChange: function (e) {
        var that = this;
        that.setData({
            currentTab: e.detail.current
        })
    },

    /**
     * 车系收藏列表
     */
    favSerieList: function () {
        var that = this;
        if (that.data.cxid) {
            that.wxapi.favList('serie', 1, 50, 'cb_favSerieList');
        }
    },

    // 车系收藏回调方法
    cb_favSerieList: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            var len = res.data.length;
            for (var i = 0; i < len; i++) {
                if (res.data[i]['cxid'] == that.data.cxid) {
                    that.data.fav.serie = true;
                }
            }
            that.setTipsData();
        }
    },


    /**
     * 添加车系收藏
     */
    favSerie: function () {
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



        // // 手机号校验
        // var validated = that.wxapi.validatedMobile();
        // if (!validated) {
        //     return validated;
        // }

        wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
        })

        // 添加收藏
        that.data.fav.serie = that.fav.addFav('serie', that.data.cxid, 0);

        that.setTipsData();

    },


    /**
     * 删除车系收藏
     * 
     */
    remFavSerie: function () {
        // 取消收藏
        var that = this;
        // 手机号校验
        var validated = that.wxapi.validatedMobile();
        if (!validated) {
            return validated;
        }

        // 删除收藏
        that.delfav = that.fav.remFav('serie', that.data.cxid, 0);
        that.data.fav.serie = false;

        // 提醒
        wx.showToast({
            title: '取消收藏',
            icon: 'success',
            duration: 2000
        })
        // 统一设置弹窗模板变量
        that.setTipsData();
    },


    //判断手机号是否绑定-------begin
    getCode: function () {
        var that = this;
        that.login.sendCode();
    },

    mobileInputEvent: function (e) {
        var that = this;
        that.data.mobile = e.detail.value;
        that.setData({
            mobile: e.detail.value,
            error: false

        })

    },

    codeInputEvent: function (e) {
        var that = this;
        that.data.verifyCode = e.detail.value;

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

    /**
     * 车型对比相关方法
     *
     * @param that.data.fav相关参数
     *        that.data.fav:{
     *              carNum:0,     // 对比车型数量
     *              selCars:{},   // 车型选中状态
     *              selCarNum:0,  // 选中的车型数量
     *              carIds:{},    // 对比车型ID数组
     *              serie:false   // 车系是否被收藏
     *            },
     * 
     */

    // 设置弹窗统一模板变量
    setTipsData: function (defaultSel) {
        var that = this;
        // 对比车型数量
        that.data.fav.carNum = that.data.fav.carList.length;

        // 1、默认选中
        if (defaultSel && that.data.fav.defaultSelNum && !that.data.fav.selCars.length) {
            // 选中that.data.defaultSelNum个车型
            for (let k in that.data.fav.carList) {
                if (that.data.fav.selCars.length < that.data.fav.defaultSelNum) {
                    // 设置选中状态
                    var pzid = that.data.fav.carList[k]['pzid'];
                    // 选中的车系id列表
                    that.data.fav.selCars.push(pzid);
                }
            }
        }
        // 2、车型选中状态
        var selCarIds = ',' + that.data.fav.selCars.join(',') + ',';
        for (let i in that.data.fav.carList) {
            // 车型id做为下标，值[1 = 收藏, 2 = 选中]
            var pzid = that.data.fav.carList[i]['pzid'];
            that.data.fav.carIds[pzid] = selCarIds.indexOf(',' + pzid + ',') >= 0 ? 2 : 1;
        }

        // console.log(that.data.fav);

        // 设置模板统一变量
        that.setData({
            tipsData: that.data.fav,
            city: that.data.city,
        });
    },

    // 设置车型对比选中状态
    selCar: function () {
        // 选中的车系id列表
        that.data.fav.selCars.push(pzid);
        // 设置选中状态
        that.data.fav.carIds[pzid] = 2;
    },

    // 1. 添加车型对比
    addCar: function (e) {
        var that = this;
        // 当前对比车型ID
        that.duibi = {
            pzid: e.currentTarget.dataset.pzid,
        };

        // 处理过程提示
        wx.showLoading({
            title: '处理中...',
        });

        // 是否已添加对比
        var isfav = that.fav.isFav('car', that.duibi.pzid, 0);

        if (isfav) {
            // 取消对比
            that.fav.remFav('car', that.duibi.pzid, 0, 'cb_optCar');
        } else {
            // 添加对比
            that.fav.addFav('car', that.duibi.pzid, 0, 'cb_optCar');
        }
    },

    // 添加/移除车型对比 [回调方法]
    cb_optCar: function (res, opt) {
        var that = this;
        // 隐藏loading弹窗
        wx.hideLoading();

        // 消息提醒
        wx.showToast({
            title: opt == 'addFav' ? '添加成功' : '已取消',
        });

        //对比按钮变蓝
        that.setData({
            forbidOn: false
        })
        that.favCarList();
    },

    /**
     * 1.1 车型对比弹窗
     * 
     */
    carTips: function () {
        var that = this;
        // 无对比车型判断
        if (that.data.fav.carList.length == 0) {
            wx.showToast({
                title: '请选择对比车型',
                image: '../../images/warning.png',
            });


            //对比按钮变灰
            that.setData({
                forbidOn: true
            })


            return false;
        }

        console.log(that.data.fav);

        that.setData({
            scrollBoolean: false
        })


        // 请求对比车型列表
        //that.favCarList();


        // 显示弹层
        that.showTips();
        that.setTipsData();
    },

    // 显示车型对比弹层
    showTips: function () {
        var that = this;
        // 弹窗动画效果
        var detailWidth = that.data.winWidth * 0.8;

        var animationContrast = wx.createAnimation({
            duration: 300,
            timingFunction: "linear",
            delay: 0
        });
        that.animationContrast = animationContrast;
        // 332
        animationContrast.translateX(-detailWidth).step();

        that.setData({
            animationContrast: animationContrast.export(),
            comparison: true
        })
    },

    // 隐藏车型对比弹层
    hideTips: function () {
        var that = this;
        var detailWidth = that.data.winWidth * 0.8;
        var animation = wx.createAnimation({
            duration: 300,
            timingFunction: "linear",
            delay: 0
        });
        that.animation = animation;
        // 332
        animation.translateX(detailWidth).step();
        that.setData({
            animationContrast: animation.export(),
            comparison: false
        })


        that.setData({
            comparison: false
        });
    },



    /**
     * 加载收藏车型列表
     * 
     * @param boolean defaultSel   [是否默认选中]
     */
    favCarList: function (defaultSel) {
        var that = this;
        // 重置数据
        that.data.fav.carList = [];
        that.data.fav.carNum = 0;
        that.data.fav.carIds = {};
        that.data.fav.selCars = [];

        // 是否默认选中
        if (typeof (defaultSel) != undefined) {
            that.data.fav.defaultSel = defaultSel;
        }

        // 重新加载
        that.fav.favList('car', 1, 50, 'cb_carTips');
    },

    /**
     * 1.1.1 车型对比弹窗回调
     */
    cb_carTips: function (res) {
        var that = this;
        that.data.fav.carList = [];
        that.data.fav.carNum = 0;
        if (res.code == 0) {
            // 对比车型列表
            that.data.fav.carList = res.data;

            // 设置是否默认选中
            var defaultSel = typeof (that.data.fav.defaultSel) != 'undefined' ? typeof (that.data.fav.defaultSel) : 0;
            that.data.fav.defaultSel = 0;

            // 设置模板统一变量
            that.setTipsData(defaultSel);
        } else {
            that.setTipsData();
            // 接口异常提示
        }

    },

    /**
     * 2. 监听车型列表复选框
     */
    selCars: function (e) {
        var that = this;
        // 获取选中的车型id
        that.data.fav.selCars = e.detail.value;

        // 设置统一模板变量
        that.setTipsData();
    },

    // 2.1 删除车型数据
    remCars: function (e) {
        var that = this;
        var selLen = that.data.fav.selCars.length;

        if (selLen > 0) {
            wx.showModal({
                title: '友情提示',
                content: '是否删除所选对比车型',
                success: function (res) {
                    if (res.confirm) {
                        // 处理过程提示
                        wx.showLoading({
                            title: '处理中...',
                        });

                        that.data.interval.num = 0;
                        for (var i = 0; i < selLen; i++) {
                            var carId = that.data.fav.selCars[i];
                            that.fav.remFav('car', carId, 0, 'cb_remCars');
                        }

                        // 重新加载列表
                        that.data.interval.obj = setInterval(function () {
                            if (that.data.interval.num >= selLen) {
                                clearInterval(that.data.interval.obj);
                                that.data.interval.obj = '';
                                that.data.interval.num = 0;
                                // 隐藏loading弹窗
                                wx.hideLoading();

                                // 提示消息
                                wx.showToast({
                                    title: '删除成功',
                                });
                                // 全部删除隐藏弹层
                                if (that.data.fav.carList.length == selLen) {
                                    that.hideTips();
                                }

                                // 重新加载车型列表
                                that.favCarList();
                            }
                        }, 100);

                        // 超时处理
                        setTimeout(function () {
                            // 隐藏loading弹窗
                            wx.hideLoading();
                        }, 10000);
                    }

                }
            });
        }

    },

    // 2.1.1 删除车型回调方法
    cb_remCars: function (res, opt) {
        var that = this;
        that.data.interval.num++;
        // 收藏的车型数量变更
        if (that.data.fav.carNum > 0) {
            that.data.fav.carNum--;
        }
    },

    // 2.2 关闭弹窗
    cancel: function () {
        var that = this;

        that.hideTips();

        that.setData({
            scrollBoolean: true
        });
    },

    city: function (e) {
        var that = this;
        var data = that.data.myData;
        var cityId = that.data.cityIdData;
        wx.navigateTo({
            url: '../city/city?pinyin=' + data.pinyin,
        })
    },
    picShow: function (opp) {
        var that = this;
        console.log(that.data.cxid)
        if (that.data.detailData.img_count) {

            wx.navigateTo({
                url: '../photos/photos?piccxid=' + that.data.cxid,
            })
        } else {
            return false;
        }


    },

    cartypeShow: function (e) {
        var that = this;
        var data = {
            pzid: e.currentTarget.dataset.pzid,
        }
        wx.navigateTo({
            url: '../photos/photos?pzid=' + data.pzid,
        })
    },


    goParam: function (e) {
        var that = this;
        var selLen = that.data.fav.selCars.length;
        if (!selLen || selLen > 5) {
            var msg = !selLen ? '请选择对比车型' : '最多选择5辆车进行对比哦';
            wx.showToast({
                title: msg,
                image: '../../images/warning.png'
            });
            return false;
        }

        wx.navigateTo({
            url: '../parameter/parameter?pzid=' + that.data.fav.selCars.join(','),
        });

        // setTimeout(function () {
        //   that.cancel();
        // }, 1000);
    },


    parameters: function (e) {
        var that = this;
        var pzid = e.currentTarget.dataset.pzid;
        if (pzid > 0) {
            wx.navigateTo({
                url: '../parameter/parameter?pzid=' + pzid,
            })
        } else {

        }
    }
});