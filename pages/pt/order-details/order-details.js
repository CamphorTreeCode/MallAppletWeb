var t = require("../../../api.js"), e = getApp();

Page({
    data: {
        hide: 1,
        qrcode: ""
    },
    onLoad: function(t) {
        e.pageOnLoad(this);
    },
    onReady: function() {},
    onShow: function() {
        e.pageOnShow(this), this.loadOrderDetails();
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {
        var t = this, e = "/pages/pt/group/details?oid=" + t.data.order_info.order_id;
        return {
            title: t.data.order_info.goods_list[0].name,
            path: e,
            imageUrl: t.data.order_info.goods_list[0].goods_pic,
            success: function(t) {
                console.log(e), console.log(t);
            }
        };
    },
    loadOrderDetails: function() {
        var o = this;
        wx.showLoading({
            title: "正在加载",
            mask: !0
        }), e.request({
            url: t.group.order.detail,
            data: {
                order_id: o.options.id
            },
            success: function(t) {
                0 == t.code ? (3 != t.data.status && o.countDownRun(t.data.limit_time_ms), o.setData({
                    order_info: t.data,
                    limit_time: t.data.limit_time
                })) : wx.showModal({
                    title: "提示",
                    content: t.msg,
                    showCancel: !1,
                    success: function(t) {
                        t.confirm && wx.redirectTo({
                            url: "/pages/pt/order/order"
                        });
                    }
                });
            },
            complete: function() {
                wx.hideLoading();
            }
        });
    },
    copyText: function(t) {
        var e = t.currentTarget.dataset.text;
        wx.setClipboardData({
            data: e,
            success: function() {
                wx.showToast({
                    title: "已复制"
                });
            }
        });
    },
    countDownRun: function(t) {
        var e = this;
        setInterval(function() {
            var o = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]) - new Date(), i = parseInt(o / 1e3 / 60 / 60 % 24, 10), n = parseInt(o / 1e3 / 60 % 60, 10), a = parseInt(o / 1e3 % 60, 10);
            i = e.checkTime(i), n = e.checkTime(n), a = e.checkTime(a), e.setData({
                limit_time: {
                    hours: i > 0 ? i : 0,
                    mins: n > 0 ? n : 0,
                    secs: a > 0 ? a : 0
                }
            });
        }, 1e3);
    },
    checkTime: function(t) {
        return t < 10 && (t = "0" + t), t;
    },
    toConfirm: function(o) {
        var i = this;
        wx.showLoading({
            title: "正在加载",
            mask: !0
        }), e.request({
            url: t.group.order.confirm,
            data: {
                order_id: i.data.order_info.order_id
            },
            success: function(t) {
                t.code, wx.showModal({
                    title: "提示",
                    content: t.msg,
                    showCancel: !1,
                    success: function(t) {
                        t.confirm && wx.redirectTo({
                            url: "/pages/pt/order-details/order-details?id=" + i.data.order_info.order_id
                        });
                    }
                });
            },
            complete: function() {
                wx.hideLoading();
            }
        });
    },
    goToGroup: function(t) {
        wx.redirectTo({
            url: "/pages/pt/group/details?oid=" + this.data.order_info.order_id,
            success: function(t) {},
            fail: function(t) {},
            complete: function(t) {}
        });
    },
    location: function() {
        var t = this.data.order_info.shop;
        wx.openLocation({
            latitude: parseFloat(t.latitude),
            longitude: parseFloat(t.longitude),
            address: t.address,
            name: t.name
        });
    },
    getOfflineQrcode: function(o) {
        var i = this;
        wx.showLoading({
            title: "正在加载",
            mask: !0
        }), e.request({
            url: t.group.order.get_qrcode,
            data: {
                order_no: o.currentTarget.dataset.id
            },
            success: function(t) {
                0 == t.code ? i.setData({
                    hide: 0,
                    qrcode: t.data.url
                }) : wx.showModal({
                    title: "提示",
                    content: t.msg
                });
            },
            complete: function() {
                wx.hideLoading();
            }
        });
    },
    hide: function(t) {
        this.setData({
            hide: 1
        });
    }
});