//search.js
import { userApi } from '../../../api/userApi.js';
//获取应用实例
var app = getApp()
Page({
    data: {
        winHeight: '',
        city: getApp().city,
        keyWord: '',
        page: 1,
        searcharr: [],
        dataList: { 'list': [] },
        typeid: 'all',
        searchids: 0,


    },
    clear: function () {
        var that = this;
        that.setData({
            keyWord: ''
        });
    },
    onShow: function () {
        var that = this;
        wx.getStorage({
            key: "wx_search",
            success: function (res) {
                console.log(res.data)
                that.data.getsearch = res.data;
            }
        })
    },

    formSubmit: function (e) {
        var that = this;
        console.log(e.detail.value.getValue);
        // wx.showLoading();
        that.data.keyWord = e.detail.value.getValue
        this.setData({
            getValue: that.data.keyWord
        })
        if (that.data.keyWord == '') {
            wx.showToast({
                title: '请输入内容哦~',
                image: '/pages/images/warning.png'
            })
            return false
        } else {
            //历史搜索
            wx.getStorage({
                key: "wx_search",
                success: function (res) {
                    that.data.getsearch = res.data;
                    if (that.data.getsearch) {
                        var searchresult = that.data.getsearch.indexOf(that.data.keyWord);
                        if (searchresult == -1) {
                            that.data.searcharr = that.data.getsearch;
                            that.data.searcharr = that.data.searcharr.concat(that.data.keyWord)
                            console.log("that.data.searcharr1133")
                            console.log(that.data.searcharr)
                            console.log("that.data.searcharr2244")
                            wx.setStorage({
                                key: "wx_search",
                                data: that.data.searcharr
                            })

                        }
                        that.cd_search(1, 'all')
                    }
                }
            })
        }
    },
    onLoad: function (options) {
        var that = this
        console.log(options.keyword);
        wx.showLoading();
        var res = wx.getSystemInfoSync();
        console.log(that.data.city)
        that.setData({
            winHeight: res.windowHeight,
            winWidth: res.windowWidth,
            pixelRatio: res.pixelRatio,
            scrollYFlag: true,
            city: that.data.city,
        });
        that.userApi = new userApi(that);
        that.data.keyWord = options.keyword
        // 加载收藏文章列表 
        // that.userApi.myFavorite('article', '1', 'cb_myFavorite');
        //   http://item.dd-img.com/search/index?keyword=%E7%A7%A6&page=1
        // var requestUrl = app.apiHost + "/app/xcx/chexi-search/?keyword=" + options.keyword;
        that.cd_search(1, 'all')
    },
    cd_search: function (page, stype) {
        var that = this;
        var requestUrl = "http://item.diandong.com/search/index?keyword=" + that.data.keyWord + "&page=" + page + "&type=" + stype + "&city_id=" + that.data.city.cityId;
        var that = this;
        wx.request({
            url: requestUrl,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: function (res) {
                wx.hideLoading()
                that.data.searchdetail = res.data.data;
                that.data.cardetail = res.data.data.car;
                // that.data.articledetail = res.data.data.article;
                console.log(that.data.searchdetail);
                console.log(that.data.cardetail);
                // that.data.dataList['list'] = [];
                for (var i = 0; i < res.data.data.article.length; i++) {
                    that.data.dataList['list'].push(res.data.data.article[i]);
                }
                if (res.data.data.article.length < 10) {
                    that.data.nomorelist = 0
                }
                if (page == 1) {
                    console.log("1111111111111111111")
                    console.log(that.data.cardetail)
                    console.log("1111111111111111111")
                    that.setData({//逻辑层到视图层
                        cardetail: that.data.cardetail,
                    });
                }
                console.log("222222222222222222222222")
                console.log(that.data.searchdetail)
                console.log(that.data.cardetail)
                console.log(that.data.dataList)
                console.log("22222222222222222")
                that.setData({
                    // searchdetail: that.data.searchdetail,
                    tlist: that.data.dataList,
                    keyWord: that.data.keyWord,
                });
            }
        })

    },
    //上拉触底
    onReachBottom: function () {
        var that = this;
        console.log("到底了");
        if (that.data.nomorelist != 0) {
            that.data.page++
            that.cd_search(that.data.page, that.data.typeid)
        }

    },
    switchNav: function (e) {
        var that = this;
        var current = e.target.dataset.current;
        var typeid = e.target.dataset.typeid;
        if (that.data.searchids != current) {
            // that.cd_search(1, that.data.typeid)
        // } else {
            that.data.searchids = current;
            that.data.typeid = typeid;
            that.setData({
                searchids: that.data.searchids
            })
            that.cd_search(1, that.data.typeid)
        }
    },
    //   //我收藏的文章回调
    //   cb_myFavorite: function (res, opt) {
    //     var that = this;

    //     //  接口请求结束
    //     // that.data.floading = false;
    //     console.log(res);
    //     if (res.code == 0) {
    //       var dataList = {};
    //       dataList['list'] = [];
    //       for (var i = 0; i < res.data.length; i++) {
    //         dataList['list'].push(res.data[i]);
    //       }
    //       console.log("4444444444444444444444444")
    //       console.log(dataList);
    //       console.log("4444444444444444444444444")
    //     } else if (res.code == 3001) {
    //       that.removeStoragelogin();
    //       that.setData({
    //         userShow: true
    //       })
    //     }

    //     that.setData({
    //       tlist: dataList
    //     })
    //   },


    carDetails: function (e) {

        var data = {
            pinyin: e.currentTarget.dataset.pinyin,
            cxid: e.currentTarget.dataset.cxid,
            cityId: 475
        }

        // console.log(data);
        //跳转到新页面，可返回
        wx.navigateTo({
            url: '../../serie/serie?pserid=' + data.cxid
        })
    }






})
