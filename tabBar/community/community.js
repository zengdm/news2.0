// pages/forum/index/index.js
//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例

var args = 'JnBsYXRpZD0xMA'
var path = '社区'
/**
 * 社区首页
 * 
 */

// import { wxapi } from '../../../plugins/wxapi.js';
import { forumApi } from '../../pages/api/forumApi.js';
import { userApi } from "../../pages/api/userApi";
import { tongjiApi } from "../../pages/api/tongjiApi";


Page({

  /**
   * 页面的初始数据
   */
  // tlist.list
  data: {
    forumList: {},
    navList: [],
    hotTags: [],
    // 默认导航
    defaultNav: { navid: 0, path: '', args: '' },
    // feed流接口请求状态
    floading: true,
    swiperCurrent: 0,
    navCurrent: 0,
    sourceid: '',
    platid: '',
    title: '',
    // 页面统计传值
    points: [],
    loginInfo: '',
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.userApi = new userApi(that);
    that.forumApi = new forumApi(that);
    that.tongjiApi = new tongjiApi(that);
    // 加载首页导航和热门标签(callback) 
    that.forumApi.navList('cb_navlist');
    that.data.defaultNav.args = args;
    that.data.defaultNav.path = path;
    // 获取帖子列表
    that.data.nextPage = 1;
    that.setData({
      nextPage: that.data.nextPage
    })
    that.forumList(that.data.nextPage);


  },

  onShow: function () {
    var that = this;
    // that.forumList('last');
    // 获取当前用户登录信息
    if (!that.data.loginInfo) {
      that.data.loginInfo = that.userApi.getLoginInfo();
    }

    // 获取页面统计传参
    var points = that.tongjiApi.getGlobalPoint();
 
  },

  /**
  * 统一设置模板全局变量
  */
  setGlobalData: function () {
    var that = this;
    // 统一设置页面模板(直接使用that.data变量报错-待解决)
    that.setData(that.data);
  },
  /*********  接口调用(start)  **********/


  /**
   * 分页获取feed流列表数据
   */
  forumList: function (scroll) {
    var that = this, args, nav;
    // 分页参数
    nav = that.data.defaultNav;
    // 判断是否已加载到最后
    if (typeof (that.data.forumList[nav.path]) != 'undefined' && typeof (that.data.forumList[nav.path]['isEnd']) != 'undefined' && that.data.forumList[nav.path]['isEnd']) {
      return false;
    }

    // 加载状态开始
    that.data.floading = true;
    that.setData({ floading: true });

    if (scroll > 1) {
      wx.showLoading({
        title: '努力加载中',
      });
    } else {
      //在标题栏中显示加载
      wx.showNavigationBarLoading()
    }
    args = that.data.defaultNav.args;
    that.forumApi.esFeed(scroll, args, '', 'cb_esFeed');
  },
  cb_esFeed: function (res, opt) {
    var that = this;
    if (res.code == 0) {
      var nextPage = res.data.args.nextPage

      var path = that.data.defaultNav.path;
      var len = res.data.list.length
      if (len > 0) {
        // 列表赋值
        if (!that.data.forumList[path]) {
          that.data.forumList[path] = {};
        }
        if (!that.data.forumList[path]['list']) {
          that.data.forumList[path]['list'] = [];
        }
        for (var i = 0; i < len; i++) {
          that.data.forumList[path]['list'].push(res.data['list'][i]);
        }
        // 记录分页数据
        if (!that.data.forumList[path]['pageRecord']) {
          that.data.forumList[path]['pageRecord'] = 1;
        }
        that.data.forumList[path]['pageRecord'] = nextPage;

        that.data.forumList[path]['isEnd'] = false;
        that.setData({
          forumList: that.data.forumList
        })
      } else {
        that.data.forumList[path]['isEnd'] = true;
      }
    }

    //  设置模板变量
    that.data.floading = false;
    console.log(that.data.forumList);
    that.setData({
      defaultNav: that.data.defaultNav,
      forumList: that.data.forumList,
      floading: false
    });

    // 加载状态结束
    setTimeout(function () {
      if (opt.page == 1) {
        wx.hideNavigationBarLoading();
      } else {
        wx.hideLoading()
      }
    }, 150);
  },
  /*
   * 导航+标签回调获取
   */
  cb_navlist: function (res, opt) {
    var that = this;
    that.setGlobalData();
  },

  onPullDownRefresh: function () {
    var that = this, path, page;
    path = that.data.defaultNav.path;
    page = that.data.forumList[path]['pageRecord'];
    if (page == 2) {
      that.forumList(1);
    }
  },
  onReachBottom: function () {
    var that = this, path, page;
    path = that.data.defaultNav.path;
    page = that.data.forumList[path]['pageRecord'];
    // console.log(page);
    // console.log(that.data.forumList);
    that.forumList(page);
  },

  onShareAppMessage: function (options) {
    var that = this;

    return {
      title: options.target.dataset.title,
      path: '/pages/forum/detail/detail?sourceid=' + options.target.dataset.sourceid + '&platid=' + options.target.dataset.platid + '&ctype=' + options.target.dataset.ctype,
      imageUrl: options.target.dataset.img,
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },

})