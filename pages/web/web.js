// pages/web/web.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'电动邦上海车展',
    mobile_url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var url = options.v_url
    //console.log(url)
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var web_src = decodeURIComponent(currentPage.options.return_url  ||
      encodeURIComponent(url))
    that.setData({
      mobile_url: web_src
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    var that = this;
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    var return_url = options.webViewUrl
    var path = '/pages/web/web?return_url=' + encodeURIComponent(return_url)
    console.log(path)
    return {
      title: that.data.title,
      path: path,
      success: function (res) {
        // 转发成功
        // wx.showToast({
        //   title: "转发成功",
        //   icon: 'success',
        //   duration: 2000
        // })

      },
      fail: function (res) {
        // 转发失败
      }
   }
  }
})