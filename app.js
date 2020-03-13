var t, e = require("./utils/utils.js");

App({
  is_on_launch: !0,
  onLaunch: function () {
    this.setApi(), t = this.api, this.getNavigationBarColor(), console.log(wx.getSystemInfoSync()),
      this.getStoreData(), this.getCatList();
  },
  getStoreData: function () {
    var e = this;
    this.request({
      url: t.default.store,
      success: function (t) {
        0 == t.code && (wx.setStorageSync("store", t.data.store), wx.setStorageSync("store_name", t.data.store_name),
          wx.setStorageSync("show_customer_service", t.data.show_customer_service), wx.setStorageSync("contact_tel", t.data.contact_tel),
          wx.setStorageSync("share_setting", t.data.share_setting));
      },
      complete: function () {
        e.login();
      }
    });
  },
  getCatList: function () {
    this.request({
      url: t.default.cat_list,
      success: function (t) {
        if (0 == t.code) {
          var e = t.data.list || [];
          wx.setStorageSync("cat_list", e);
        }
      }
    });
  },
  login: function () {
    var a = getCurrentPages(), o = a[a.length - 1];
    wx.showLoading({
      title: "正在登录",
      mask: !0
    }), wx.login({
      success: function (a) {
        if (a.code) {
          var n = a.code;
          wx.getUserInfo({
            success: function (a) {
              getApp().request({
                url: t.passport.login,
                method: "post",
                data: {
                  code: n,
                  user_info: a.rawData,
                  encrypted_data: a.encryptedData,
                  iv: a.iv,
                  signature: a.signature
                },
                success: function (t) {
                  if (wx.hideLoading(), 0 == t.code) {
                    wx.setStorageSync("access_token", t.data.access_token), wx.setStorageSync("user_info", t.data);
                    var a = getCurrentPages(), n = 0;
                    if (void 0 != a[0].options.user_id) n = a[0].options.user_id; else if (void 0 != a[0].options.scene) n = a[0].options.scene;
                    if (getApp().bindParent({
                      parent_id: n || 0
                    }), void 0 == o) return;
                    var s = getApp().loginNoRefreshPage;
                    for (var i in s) if (s[i] === o.route) return;
                    wx.redirectTo({
                      url: "/" + o.route + "?" + e.objectToUrlParams(o.options),
                      fail: function () {
                        wx.switchTab({
                          url: "/" + o.route
                        });
                      }
                    });
                  } else wx.showToast({
                    title: t.msg
                  });
                }
              });
            },
            fail: function (t) {
              wx.hideLoading(), getApp().getauth({
                content: "需要获取您的用户信息授权，请到小程序设置中打开授权",
                cancel: !0,
                success: function (t) {
                  t && getApp().login();
                }
              });
            }
          });
        }
      }
    });
  },
  request: function (t) {
    t.data || (t.data = {});
    var e = wx.getStorageSync("access_token");
    e && (t.data.access_token = e), t.data._uniacid = this.siteInfo.uniacid, t.data._acid = this.siteInfo.acid,
      wx.request({
        url: t.url,
        header: t.header || {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: t.data || {},
        method: t.method || "GET",
        dataType: t.dataType || "json",
        success: function (e) {
          -1 == e.data.code ? getApp().login() : t.success && t.success(e.data);
        },
        fail: function (e) {
          console.warn("--- request fail >>>"), console.warn(e), console.warn("<<< request fail ---");
          var a = getApp();
          a.is_on_launch ? (a.is_on_launch = !1, wx.showModal({
            title: "网络请求出错",
            content: e.errMsg,
            showCancel: !1,
            success: function (e) {
              e.confirm && t.fail && t.fail(e);
            }
          })) : (wx.showToast({
            title: e.errMsg,
            image: "/images/icon-warning.png"
          }), t.fail && t.fail(e));
        },
        complete: function (e) {
          200 != e.statusCode && (console.log("--- request http error >>>"), console.log(e.statusCode),
            console.log(e.data), console.log("<<< request http error ---")), t.complete && t.complete(e);
        }
      });
  },
  saveFormId: function (e) {
    this.request({
      url: t.user.save_form_id,
      data: {
        form_id: e
      }
    });
  },
  loginBindParent: function (t) {
    if ("" == wx.getStorageSync("access_token")) return !0;
    getApp().bindParent(t);
  },
  bindParent: function (e) {
    if ("undefined" != e.parent_id && 0 != e.parent_id) {
      console.log("Try To Bind Parent With User Id:" + e.parent_id);
      var a = wx.getStorageSync("user_info");
      wx.getStorageSync("share_setting").level > 0 && 0 != e.parent_id && getApp().request({
        url: t.share.bind_parent,
        data: {
          parent_id: e.parent_id
        },
        success: function (t) {
          0 == t.code && (a.parent = t.data, wx.setStorageSync("user_info", a));
        }
      });
    }
  },
  shareSendCoupon: function (e) {
    wx.showLoading({
      mask: !0
    }), e.hideGetCoupon || (e.hideGetCoupon = function (t) {
      var a = t.currentTarget.dataset.url || !1;
      e.setData({
        get_coupon_list: null
      }), a && wx.navigateTo({
        url: a
      });
    }), this.request({
      url: t.coupon.share_send,
      success: function (t) {
        0 == t.code && e.setData({
          get_coupon_list: t.data.list
        });
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  getauth: function (t) {
    // wx.showModal({
    //     title: "是否打开设置页面重新授权",
    //     content: t.content,
    //     confirmText: "去设置",
    //     success: function(e) {
    //         e.confirm ? wx.openSetting({
    //             success: function(e) {
    //                 t.success && t.success(e);
    //             },
    //             fail: function(e) {
    //                 t.fail && t.fail(e);
    //             },
    //             complete: function(e) {
    //                 t.complete && t.complete(e);
    //             }
    //         }) : t.cancel && getApp().getauth(t);
    //     }
    // });
  },
  api: require("api.js"),
  setApi: function () {
    function t(a) {
      for (var o in a) "string" == typeof a[o] ? a[o] = a[o].replace("{$_api_root}", e) : a[o] = t(a[o]);
      return a;
    }
    var e = this.siteInfo.siteroot;
    e = e.replace("app/index.php", ""), e += "addons/zjhj_mall/core/web/index.php?store_id=-1&r=api/",
      this.api = t(this.api);
    var a = this.api.default.index, o = a.substr(0, a.indexOf("/index.php"));
    this.webRoot = o;
  },
  webRoot: null,
  siteInfo: require("siteinfo.js"),
  currentPage: null,
  pageOnLoad: function (t) {
    this.currentPage = t, console.log("--------pageOnLoad----------"), void 0 === t.openWxapp && (t.openWxapp = this.openWxapp),
      void 0 === t.showToast && (t.showToast = this.pageShowToast), this.setNavigationBarColor(),
      this.setPageNavbar(t);
    var e = this;
    this.currentPage.naveClick = function (t) {
      var a = this;
      e.navigatorClick(t, a);
    };
  },
  pageOnReady: function (t) {
    console.log("--------pageOnReady----------");
  },
  pageOnShow: function (t) {
    console.log("--------pageOnShow----------");
  },
  pageOnHide: function (t) {
    console.log("--------pageOnHide----------");
  },
  pageOnUnload: function (t) {
    console.log("--------pageOnUnload----------");
  },
  setPageNavbar: function (e) {
    function a(t) {
      var a = !1, o = e.route || e.__route__ || null;
      for (var n in t.navs) t.navs[n].url === "/" + o ? (t.navs[n].active = !0, a = !0) : t.navs[n].active = !1;
      a && e.setData({
        _navbar: t
      });
    }
    console.log("----setPageNavbar----"), console.log(e);
    var o = wx.getStorageSync("_navbar");
    o && a(o), this.request({
      url: t.default.navbar,
      success: function (t) {
        0 == t.code && (a(t.data), wx.setStorageSync("_navbar", t.data));
      }
    });
  },
  getNavigationBarColor: function () {
    var e = this;
    e.request({
      url: t.default.navigation_bar_color,
      success: function (t) {
        0 == t.code && (wx.setStorageSync("_navigation_bar_color", t.data), e.setNavigationBarColor());
      }
    });
  },
  setNavigationBarColor: function () {
    var t = wx.getStorageSync("_navigation_bar_color");
    t && wx.setNavigationBarColor(t);
  },
  loginNoRefreshPage: ["pages/index/index"],
  openWxapp: function (t) {
    if (console.log("--openWxapp---"), t.currentTarget.dataset.url) {
      var e = t.currentTarget.dataset.url;
      (e = function (t) {
        var e = /([^&=]+)=([\w\W]*?)(&|$|#)/g, a = /^[^\?]+\?([\w\W]+)$/.exec(t), o = {};
        if (a && a[1]) for (var n, s = a[1]; null != (n = e.exec(s));) o[n[1]] = n[2];
        return o;
      }(e)).path = e.path ? decodeURIComponent(e.path) : "", console.log("Open New App"),
        console.log(e), wx.navigateToMiniProgram({
          appId: e.appId,
          path: e.path,
          complete: function (t) {
            console.log(t);
          }
        });
    }
  },
  pageShowToast: function (t) {
    console.log("--- pageToast ---");
    var e = this.currentPage, a = t.duration || 2500, o = t.title || "", n = (t.success,
      t.fail, t.complete || null);
    e._toast_timer && clearTimeout(e._toast_timer), e.setData({
      _toast: {
        title: o
      }
    }), e._toast_timer = setTimeout(function () {
      var t = e.data._toast;
      t.hide = !0, e.setData({
        _toast: t
      }), "function" == typeof n && n();
    }, a);
  },
  navigatorClick: function (t, e) {
    var a = t.currentTarget.dataset.open_type;
    if ("redirect" == a) return !0;
    if ("wxapp" == a) {
      var o = t.currentTarget.dataset.path;
      "/" != o.substr(0, 1) && (o = "/" + o), wx.navigateToMiniProgram({
        appId: t.currentTarget.dataset.appid,
        path: o,
        complete: function (t) {
          console.log(t);
        }
      });
    }
    if ("tel" == a) {
      var n = t.currentTarget.dataset.tel;
      wx.makePhoneCall({
        phoneNumber: n
      });
    }
    return !1;
  }
});