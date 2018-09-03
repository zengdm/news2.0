var app = getApp();
import { userApi } from '../../../api/userApi.js';
Page({
    data: {
        keyword: '',
        searcharr: [],
    },
    /**
  * 生命周期函数--监听页面加载
  */
    onLoad: function (options) {
        var that = this;
        that.userApi = new userApi(that);
    },
    onShow: function () {
        var that = this;
        wx.getStorage({
            key: "wx_search",
            success: function (res) {
                // console.log(res.data)
                that.data.getsearch = res.data;
                that.setData({
                    getsearch: that.data.getsearch
                })
            }
        })
    },

    keywordInput: function (e) {
        //  console.log(e.detail.value);
        this.setData({
            keyword: e.detail.value
        })
    },


    searchClick: function (e) {
        var that = this
        // console.log(this.data.keyword)
        if (that.data.keyword == '') {
            wx.showToast({
                title: '请输入内容哦~',
                image: '/pages/images/warning.png'
            })
            return false
        } else {
            //历史搜索
            if (that.data.getsearch) {
                var searchresult = that.data.getsearch.indexOf(that.data.keyword);
                console.log("that.data.searcharr11111111111111")
                console.log(searchresult)
                console.log("that.data.searcharr1111111111")
                if (searchresult == -1) { 
                    console.log(that.data.getsearch)
                    that.data.searcharr = that.data.getsearch;
                    console.log(that.data.searcharr)
                    console.log("that.data.searcharr5555555")
                    that.data.searcharr = that.data.searcharr.concat(that.data.keyword)
                    console.log("that.data.searcharr1133")
                    console.log(that.data.searcharr)
                    console.log("that.data.searcharr2244")
                    wx.setStorage({
                        key: "wx_search",
                        data: that.data.searcharr
                    })
                }
            } else {
                var searchresult = that.data.searcharr.indexOf(that.data.keyword);
                console.log("that.data.searcharr2222222222222222222")
                console.log(searchresult)
                console.log("that.data.searcharr2222222222222")
                if (searchresult == -1) {
                    that.data.searcharr = that.data.searcharr.concat(that.data.keyword);
                    console.log("that.data.searcharr11")
                    console.log(that.data.searcharr)
                    console.log("that.data.searcharr22")
                    wx.setStorage({
                        key: "wx_search",
                        data: that.data.searcharr
                    })

                }
            }
            wx.navigateTo({
                url: '../search/search?keyword=' + this.data.keyword
            })

        }

    },

    searchTag: function (e) {
        var that = this
        var keyword = e.currentTarget.dataset.keyword
        // console.log(keyword);
        wx.navigateTo({
            url: '../search/search?keyword=' + keyword
        })
    },



    onReady: function () {
        // var requestUrl = app.apiHost + "/app/xcx/chexi-search";
        // var that = this;
        // wx.request({
        //   url: requestUrl,
        //   data: {},
        //   method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        //   success:function(res){
        //     var rdata = res.data;
        //     // console.log(rdata.data);

        //     that.data.searchTag = rdata.data;


        //     that.setData({//逻辑层到视图层
        //       searchTag: that.data.searchTag,
        //       num: 1 + parseInt(Math.random() * 0)
        //     });
        //   }
        // })
    }
})