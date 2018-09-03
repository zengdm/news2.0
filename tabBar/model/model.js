import drawer from '../../pages/inc/drawer/drawer'
import xapi from "../../utils/xapi"
import util from "../../utils/util"
import { wxapi } from "../../plugins/wxapi";
import { share } from '../../plugins/share';
var app = getApp();
Page({
    data: {
        brandData: {},
        toView: '',
        winHeight: '',
        winWidth: '',
        latitude: 0,
        longitude: 0,
        pixelRatio: '',
        brandList: [],
        bannerTab: 1,
        hidden: true,
        fromcache: false,
        city: getApp().city,

        cityIdData: '',
        cityIdName: '',
        // 字母表显示状态
        wordline: false,


        shareclientYstart: '',
        shareclientYmove: '',

        //背景内容滚动  false不可滚动 true可滚动
        scrollBoolean: true,
        showmask: false,

    },
    tapName: function (event) {
        //console.log(event)
    },
    onLoad: function (options) {
        var that = this;
        var res = wx.getSystemInfoSync();
        that.setData({
            winHeight: res.windowHeight,
            winWidth: res.windowWidth,
            pixelRatio: res.pixelRatio,
            scrollYFlag: true,
            city: that.data.city,
        });

        //抽屉组件
        that.dw = new drawer(that);
        that.ul = new util(that);
        that.wxapi = new wxapi(that);

        //分享
        that.shareObj = new share(that);

        // 设置分享内容
        that.shareObj.setShare('电动邦，带您一起了解新能源汽车、用好新能源车、玩好新能源汽车！', '/pages/tabBar/model/model');
        // 获取热门车型列表
        that.wxapi.getURLData('hotCar', [], 'cb_hotcar');
        // 设置加载状态(2秒过期)
        wx.showLoading({
            title: '加载中',
        });
        setTimeout(function () { wx.hideLoading(); }, 1000);
    },
    onReady: function () {
        var that = this;
        //品牌列表
        that.wxapi.getURLData('brandList', [], 'cb_brandlist');

        // 登录授权
        // that.wxapi.wxlogin();
    },
    searchTag: function () {
      wx.navigateTo({
        url: '/pages/model/bigSearch/searchWindow/searchWindow'
      })
    },
    /**
     * 热门车型数据回调
     */
    cb_hotcar: function (res, opt) {
        var that = this;
        // 隐藏加载状态
        wx.hideLoading();
        if (res.code == 0) {
            that.setData({
                brandData: res.data
            });
        } else {
            console.log('hot car api error:' + res.message);
        }
    },
    mo: function (event) {
        console.log(event);
        event.preventDefault;
    },
    cb_brandlist: function (res, opt) {
        var that = this;
        var myList = res.data;
        that.data.brandList = that.reCombine(myList);
        that.setData({//逻辑层到视图层
            // brandData: that.data.brandData,
            brandList: that.data.brandList,
            num: 1 + parseInt(Math.random() * 5)
        });
    },
    reCombine: function (arr) {
        var res = [], obj = {}, index = 0;
        arr.forEach(function (item) {
            if (obj.hasOwnProperty(item.letter)) {
                res[obj[item.letter]].items.push(item);
            } else {
                obj[item.letter] = index++;//记录索引 0 1 2
                res.push(
                    {
                        flag: item.letter,
                        items: [item]
                    }
                );
            }
        });
        return res;
    },
    // clickLetter: function (event) {
    //     var that = this;
    //     console.log(event)
    //     var letter = event.target.dataset.letter;
    //     var that = this;
    //     if (that.data.currentLetter === event.target.dataset.current) {
    //         return false;
    //     }else {
    //         that.setData({
    //             currentLetter: event.target.dataset.current,
    //                  toView: letter,
    //                  letterbg:true,
    //         })
    //     }
    //     setTimeout(function () {
    //         that.setData({
    //             letterbg: false,
    //         })
    //     }, 200);
    // },
    handlerAlphaTap(e) {
        var that = this;
        // console.log(e)
        var letter = e.target.dataset.letter;
        var that = this;
        if (that.data.currentLetter === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentLetter: e.target.dataset.current,
                toView: letter,
                letterbg: true,
            })
        }
        var list = that.data.brandList;
        var query = wx.createSelectorQuery();
        query.select('.letterone').boundingClientRect()
        query.exec(function (res) {
            // console.log(res)
            that.offsetTop = res[0].bottom;        // .A节点的下边界坐标
            that.offsetHeight = res[0].height;  // .A节点的高度
        })
        // that.offsetTop = (that.data.winHeight - list.length * 20-13*2)/2+13;
        setTimeout(function () {
            that.setData({
                letterbg: false,
            })
        }, 1000);
    },
    handlerMove(e) {
        var that = this;
        // console.log(e.target.dataset.letter)
        var list = that.data.brandList;
        var moveY = e.touches[0].clientY;
        var rY = moveY - that.offsetTop;
        if (rY >= 0) {
            // console.log("rY--------" + rY)
            if (rY <= that.offsetHeight/2) {
                // #A
                that.setData({
                    toView: list[0].flag,
                    currentLetter: 0,
                    letterbg: true,
                });
            } else {
                // #B-Z
                var index = Math.ceil(rY / that.offsetHeight);
                if (0 <= index && index < list.length) {
                    // console.log('moveY  ----' + moveY)
                    // console.log('that.offsetTop ----' + that.offsetTop)
                    // console.log('rY  ----' + rY)
                    // console.log('that.offsetHeight  ----' + that.offsetHeight)
                    console.log('index  ----' + index)
                    console.log('list[index].flag   ----' + list[index].flag)
                    that.setData({
                        toView: list[index].flag,
                        currentLetter: index,
                        letterbg: true,
                    });
                }
            }



        }
    },
    handlerEnd(e) {
        var that = this;
        // that.setData({
        //     scoTTTTp: e.currentTarget.dataset.scrollTop
        // });
        setTimeout(function () {
            that.setData({
                currentLetter: -1,
                letterbg: false,
            })
        }, 1000);
    },
    getsubsidy: function () {
        wx.navigateTo({
            url: '/pages/model/rank/subsidy/subsidy'
        })
    },
    getendurance: function () {
        wx.navigateTo({
            url: '/pages/model/rank/mileage/mileage'
        })
    },
    getnew_car: function () {
        wx.navigateTo({
            url: '/pages/model/rank/early/early'
        })
    },
    getcoming_soon: function () {
        wx.navigateTo({
            url: '/pages/model/rank/none/none'
        })
    },
    getchoose: function () {
        wx.navigateTo({
            url: '/pages/model/search/condition/condition'
        })
    },
    scroll: function (e) {
        var that = this;
        var scrollTop = e.detail.scrollTop;
        //     if (e.detail.deltaY < 0) {
        //       //向上滑动
        //       console.log("向上")
        //       that.shareObj.showShare();

        //     } else {
        //       //向下滑动
        //       console.log("向下")
        //       that.shareObj.hideShare();
        //     }
        that.setData({
            scrollTop: scrollTop
        })
    },
    // 页面停止，静止3秒
    //   handletouchend: function () {
    //     var that = this;
    //     that.shareObj.handletouchend();
    //   },
    onShareAppMessage: function (options) {
        var that = this;
        if (options.from === 'button') {
            console.log('按钮转发');
        } else {
            console.log('右上角转发');
        }
        return that.shareObj.getShare();
    },
    //   backdraw: function (res) {
    // 隐藏loading弹层
    // if (wx.hideLoading) {
    //     wx.hideLoading();
    // }
    // 设置模板数据
    //     this.setData({
    //       drawerSeriesData: res.list || res.data.list,
    //     });
    //   },
    showDrawer: function (e) {
        var that = this;

        var ppid = e.currentTarget.dataset.id;
        // 2. 请求数据，同时将页面绘制方法作为参数
        var data = { 'ppid': e.currentTarget.dataset.id };
        that.wxapi.serieByBrandId(data.ppid, 'cb_serie');
        that.dw.requestdata({
            "pbid": ppid,
        }, !1);
        // var path = '/app/xcx/chexi/';
        // that.getCacheData(path, 'backdraw', data);
    },
    cb_serie: function (res) {
      console.log(res);
        this.setData({
          // drawerSeriesData: res.list || res.data.list,
            drawerSeriesData: res || res.data,
            showDrawerFlag: true,
        });
    },
    gotoSeries: function (e) {
        var that = this;
        setTimeout(function () {
            that.hideDrawer();
        }, 1000)
        var data = {
            pserid: e.currentTarget.dataset.pserid,
            cityId: that.data.city.cityId,
            cityIdName: that.data.city.cityName
        }
        console.log(that.data)
        // console.log(datas)
        // console.log(that.data.cityIdData)
        // console.log(that.data.cityIdName)
        //跳转到新页面，可返回
        wx.navigateTo({
            url: '/pages/model/serie/serie?pserid=' + data.pserid + '&cityId=' + data.cityId + '&cityIdName=' + data.cityIdName
        })
    },
});
