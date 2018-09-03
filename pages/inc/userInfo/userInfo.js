// pages/inc/userInfo/userInfo.js
var app = getApp();//获取应用实例

import { userApi } from "../../api/userApi.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.userApi = new userApi(that);
  
  },

  sheTwo: function (e) {
    var that = this;
    console.log(e.detail.userInfo);
    that.userApi.wxlogin();
    if (e.detail.userInfo){
      console.log(e.detail.userInfo);
      wx.navigateBack();
      // setTimeout(function(){
      //   wx.navigateTo({
      //     url: '/pages/user/profile/profile'
      //   })
      // },2000)
     
    }else{
      console.log('用户点击了拒绝授权');
    }
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