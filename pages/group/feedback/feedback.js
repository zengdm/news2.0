// pages/group/feedback/feedback.js
import { userApi } from '../../api/userApi.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnColor: true,  
    //授权弹窗（默认隐藏）
    userShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.userApi = new userApi(that);

  },

  bindinput: function (e) {
    var that = this;
    if (e.detail.value == '') {
      that.setData({
        btnColor: true
      });
    } else {
      that.setData({
        btnColor: false
      });
    }
  },


  formSubmit: function (e) {
    var that = this;
    
    that.data.opinion = e.detail.value.textarea;

    // 意见反馈

    if (e.detail.value.textarea == '') {
      wx.showToast({
        title: '不能为空',
        image: '/pages/images/warning.png'
      });
      return false;
    } else if(!that.data.sending){
      // 设置状态
      wx.showLoading({
        title: '发送中',
      })
      that.setData({ sending: true, sendName: '发送中', loginShow: false });
      that.userApi.opinion(that.data.opinion, 'cb_opinion');
    }
  },

  cb_opinion:function(res,opt){
    var that = this;
    console.log(res);
    if(res.code == 0){
      // 设置状态
      wx.hideLoading();
      wx.showToast({
        title: '提交成功',
        duration: 2000
      });
      setTimeout(function () {
        wx.switchTab({
          url: '/tabBar/user/user'
        });
      }, 2000)
    } else if (res.code == 3001){
      that.removeStoragelogin();
      that.setData({
        userShow: true
      })
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
  onShareAppMessage: function () {
  
  }
})