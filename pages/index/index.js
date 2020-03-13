var t = require("../../api.js"), a = getApp(), e = 0, s = 0, o = !0, n = 1, i = "";

Page({
    data: {
        x: wx.getSystemInfoSync().windowWidth,
        y: wx.getSystemInfoSync().windowHeight,
        left: 0,
        show_notice: !1,
        animationData: {},
        play: -1,
        time: 0,
        buy_user: "",
        buy_address: "",
        buy_time: 0
    },
    onLoad: function(t) {
        a.pageOnLoad(this), this.loadData(t);
        var e = this, s = 0, o = t.user_id, n = decodeURIComponent(t.scene);
        void 0 != o ? s = o : void 0 != n && (s = n), a.loginBindParent({
            parent_id: s
        }), 1 === this.data.store.purchase_frame ? this.suspension(this.data.time) : e.setData({
            buy_user: ""
        });
    },
    suspension: function() {
        var e = this;
        s = setInterval(function() {
            a.request({
                url: t.default.buy_data,
                data: {
                    time: e.data.time
                },
                method: "POST",
                success: function(t) {
                    if (0 == t.code) {
                        var a = !1;
                        i == t.md5 && (a = !0);
                        var s = "", o = t.cha_time, n = Math.floor(o / 60 - 60 * Math.floor(o / 3600));
                        s = 0 == n ? o % 60 + "秒" : n + "分" + o % 60 + "秒", !a && t.cha_time <= 300 ? (e.setData({
                            buy_time: s,
                            buy_user: t.data.user.length >= 5 ? t.data.user.slice(0, 4) + "..." : t.data.user,
                            buy_avatar_url: t.data.avatar_url,
                            buy_address: t.data.address.length >= 8 ? t.data.address.slice(0, 7) + "..." : t.data.address
                        }), i = t.md5) : e.setData({
                            buy_user: "",
                            buy_address: "",
                            buy_avatar_url: "",
                            buy_time: ""
                        });
                    }
                }
            });
        }, 7e3);
    },
    loadData: function(e) {
        var s = this, n = wx.getStorageSync("pages_index_index");
        n && (n.act_modal_list = [], s.setData(n)), a.request({
            url: t.default.index,
            success: function(t) {
                if (0 == t.code) {
                    o ? o = !1 : t.data.act_modal_list = [], s.setData(t.data), wx.setStorageSync("store", t.data.store), 
                    wx.setStorageSync("pages_index_index", t.data);
                    var a = wx.getStorageSync("user_info");
                    a && s.setData({
                        _user_info: a
                    }), s.miaoshaTimer();
                }
            },
            complete: function() {
                wx.stopPullDownRefresh();
            }
        });
    },
    onShow: function() {
        0 == s && 1 === this.data.store.purchase_frame ? this.suspension(this.data.time) : this.setData({
            buy_user: ""
        }), a.pageOnShow(this), e = 0;
        var t = wx.getStorageSync("store");
        t && t.name && wx.setNavigationBarTitle({
            title: t.name
        }), clearInterval(1), this.notice();
    },
    onPullDownRefresh: function() {
        clearInterval(n), this.loadData();
    },
    onShareAppMessage: function(t) {
        var s = this;
        return {
            path: "/pages/index/index?user_id=" + wx.getStorageSync("user_info").id,
            success: function(t) {
                1 == ++e && a.shareSendCoupon(s);
            },
            title: s.data.store.name
        };
    },
    receive: function(e) {
        var s = this, o = e.currentTarget.dataset.index;
        wx.showLoading({
            title: "领取中",
            mask: !0
        }), s.hideGetCoupon || (s.hideGetCoupon = function(t) {
            var a = t.currentTarget.dataset.url || !1;
            s.setData({
                get_coupon_list: null
            }), a && wx.navigateTo({
                url: a
            });
        }), a.request({
            url: t.coupon.receive,
            data: {
                id: o
            },
            success: function(t) {
                wx.hideLoading(), 0 == t.code ? s.setData({
                    get_coupon_list: t.data.list,
                    coupon_list: t.data.coupon_list
                }) : (wx.showToast({
                    title: t.msg,
                    duration: 2e3
                }), s.setData({
                    coupon_list: t.data.coupon_list
                }));
            }
        });
    },
    navigatorClick: function(t) {
        var a = t.currentTarget.dataset.open_type, e = t.currentTarget.dataset.url;
        return "wxapp" != a || (e = function(t) {
            var a = /([^&=]+)=([\w\W]*?)(&|$|#)/g, e = /^[^\?]+\?([\w\W]+)$/.exec(t), s = {};
            if (e && e[1]) for (var o, n = e[1]; null != (o = a.exec(n)); ) s[o[1]] = o[2];
            return s;
        }(e), e.path = e.path ? decodeURIComponent(e.path) : "", console.log("Open New App"), 
        wx.navigateToMiniProgram({
            appId: e.appId,
            path: e.path,
            complete: function(t) {
                console.log(t);
            }
        }), !1);
    },
    closeCouponBox: function(t) {
        this.setData({
            get_coupon_list: ""
        });
    },
    notice: function() {
        var t = this.data.notice;
        if (void 0 != t) t.length;
    },
    miaoshaTimer: function() {
        var t = this;
        t.data.miaosha && t.data.miaosha.rest_time && (n = setInterval(function() {
            t.data.miaosha.rest_time > 0 ? (t.data.miaosha.rest_time = t.data.miaosha.rest_time - 1, 
            t.data.miaosha.times = t.getTimesBySecond(t.data.miaosha.rest_time), t.setData({
                miaosha: t.data.miaosha
            })) : clearInterval(n);
        }, 1e3));
    },
    onHide: function() {
        a.pageOnHide(this), this.setData({
            play: -1
        }), clearInterval(1), clearInterval(s);
    },
    onUnload: function() {
        a.pageOnUnload(this), this.setData({
            play: -1
        }), clearInterval(n), clearInterval(1), clearInterval(s);
    },
    showNotice: function() {
        this.setData({
            show_notice: !0
        });
    },
    closeNotice: function() {
        this.setData({
            show_notice: !1
        });
    },
    getTimesBySecond: function(t) {
        if (t = parseInt(t), isNaN(t)) return {
            h: "00",
            m: "00",
            s: "00"
        };
        var a = parseInt(t / 3600), e = parseInt(t % 3600 / 60), s = t % 60;
        return a >= 1 && (a -= 1), {
            h: a < 10 ? "0" + a : "" + a,
            m: e < 10 ? "0" + e : "" + e,
            s: s < 10 ? "0" + s : "" + s
        };
    },
    to_dial: function() {
        var t = this.data.store.contact_tel;
        wx.makePhoneCall({
            phoneNumber: t
        });
    },
    closeActModal: function() {
        var t, a = this, e = a.data.act_modal_list, s = !0;
        for (var o in e) {
            var n = parseInt(o);
            e[n].show && (e[n].show = !1, void 0 !== e[t = n + 1] && s && (s = !1, setTimeout(function() {
                a.data.act_modal_list[t].show = !0, a.setData({
                    act_modal_list: a.data.act_modal_list
                });
            }, 500)));
        }
        a.setData({
            act_modal_list: e
        });
    },
    naveClick: function(t) {
        var e = this;
        a.navigatorClick(t, e);
    },
    play: function(t) {
        this.setData({
            play: t.currentTarget.dataset.index
        });
    },
    onPageScroll: function(t) {
        var a = this;
        -1 != a.data.play && wx.createSelectorQuery().select(".video").fields({
            rect: !0
        }, function(t) {
            console.log(t.top);
            var e = wx.getSystemInfoSync().windowHeight;
            (t.top <= -200 || t.top >= e - 57) && a.setData({
                play: -1
            });
        }).exec();
    }
});