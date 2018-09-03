// pages/inc/component/userInfo/userInfo.js
// pages/inc/login/login.js
import { wxapi } from "../../../../plugins/wxapi.js"
import { userApi } from '../../../api/userApi.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value:'',
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
   
  },
  attached: function () {
    var that = this;
    that.wxapi = new wxapi(that);
    that.userApi = new userApi(that);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindgetuserinfo:function(e){
      var that = this;
      console.log(e.detail.userInfo);
      that.userApi.wxlogin();
      if (e.detail.userInfo) {
        console.log(e.detail.userInfo);
        that.setData({
          show:false
        })
        // wx.navigateBack();
        // setTimeout(function(){
        //   wx.navigateTo({
        //     url: '/pages/user/profile/profile'
        //   })
        // },2000)

      } else {
        console.log('用户点击了拒绝授权');
      }
    },

    hideUser:function(e){
      var that = this;
      that.setData({
        show: false
      })
    },

    catchtouchmove:function(){

    }
    
    
 

 

 
  }
})
