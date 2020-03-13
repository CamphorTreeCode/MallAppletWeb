var t = require("../../api.js"), a = getApp();

Page({
    data: {
        total_price: 0,
        cart_check_all: !1,
        cart_list: []
    },
    onLoad: function(t) {
        a.pageOnLoad(this);
    },
    onReady: function() {},
    onShow: function() {
        a.pageOnShow(this);
        var t = this;
        t.setData({
            cart_check_all: !1,
            show_cart_edit: !1
        }), t.getCartList();
    },
    getCartList: function() {
        var c = this;
        c.setData({
            show_no_data_tip: !1
        }), a.request({
            url: t.cart.list,
            success: function(t) {
                0 == t.code && c.setData({
                    cart_list: t.data.list,
                    total_price: 0,
                    cart_check_all: !1,
                    show_cart_edit: !1
                }), c.setData({
                    show_no_data_tip: 0 == c.data.cart_list.length
                });
            }
        });
    },
    cartLess: function(t) {
        var a = this, c = a.data.cart_list;
        for (var r in c) t.currentTarget.id == c[r].cart_id && (c[r].num = a.data.cart_list[r].num - 1, 
        c[r].price = a.data.cart_list[r].unitPrice * c[r].num, a.setData({
            cart_list: c
        }), a.updateTotalPrice());
    },
    cartAdd: function(t) {
        var a = this, c = a.data.cart_list;
        for (var r in c) t.currentTarget.id == c[r].cart_id && (c[r].num = a.data.cart_list[r].num + 1, 
        c[r].price = a.data.cart_list[r].unitPrice * c[r].num, a.setData({
            cart_list: c
        }), a.updateTotalPrice());
    },
    cartCheck: function(t) {
        var a = this, c = t.currentTarget.dataset.index, r = a.data.cart_list, e = 0;
        r[c].checked ? r[c].checked = !1 : r[c].checked = !0;
        for (var i in r) 1 == r[i].checked && e++;
        a.setData({
            cart_list: r
        }), e == r.length ? a.setData({
            cart_check_all: !0
        }) : a.setData({
            cart_check_all: !1
        }), a.updateTotalPrice();
    },
    cartCheckAll: function() {
        var t = this, a = t.data.cart_list, c = !1;
        c = !t.data.cart_check_all;
        for (var r in a) a[r].disabled && !t.data.show_cart_edit || (a[r].checked = c);
        t.setData({
            cart_check_all: c,
            cart_list: a
        }), t.updateTotalPrice();
    },
    updateTotalPrice: function() {
        var t = this, a = 0, c = t.data.cart_list;
        for (var r in c) c[r].checked && (a += c[r].price);
        t.setData({
            total_price: a.toFixed(2)
        });
    },
    cartSubmit: function() {
        var c = this, r = JSON.stringify(c.data.cart_list);
        r != [] && a.request({
            url: t.cart.cart_edit,
            method: "post",
            data: {
                list: r
            },
            success: function(t) {
                if (0 == t.code) {
                    var a = c.data.cart_list, r = [];
                    for (var e in a) a[e].checked && r.push(a[e].cart_id);
                    if (0 == r.length) return !0;
                    wx.navigateTo({
                        url: "/pages/order-submit/order-submit?cart_id_list=" + JSON.stringify(r)
                    });
                }
            }
        });
    },
    cartEdit: function() {
        var t = this, a = t.data.cart_list;
        for (var c in a) a[c].checked = !1;
        t.setData({
            cart_list: a,
            show_cart_edit: !0,
            cart_check_all: !1
        }), t.updateTotalPrice();
    },
    cartDone: function() {
        var t = this, a = t.data.cart_list;
        for (var c in a) a[c].checked = !1;
        t.setData({
            cart_list: a,
            show_cart_edit: !1,
            cart_check_all: !1
        }), t.updateTotalPrice();
    },
    cartDelete: function() {
        var c = this, r = c.data.cart_list, e = [];
        for (var i in r) r[i].checked && e.push(r[i].cart_id);
        if (0 == e.length) return !0;
        wx.showModal({
            title: "提示",
            content: "确认删除" + e.length + "项内容？",
            success: function(r) {
                if (r.cancel) return !0;
                wx.showLoading({
                    title: "正在删除",
                    mask: !0
                }), a.request({
                    url: t.cart.delete,
                    data: {
                        cart_id_list: JSON.stringify(e)
                    },
                    success: function(t) {
                        wx.hideLoading(), wx.showToast({
                            title: t.msg
                        }), 0 == t.code && c.getCartList(), t.code;
                    }
                });
            }
        });
    },
    onHide: function() {
        var c = this, r = JSON.stringify(c.data.cart_list);
        r != [] && a.request({
            url: t.cart.cart_edit,
            method: "post",
            data: {
                list: r
            },
            success: function(t) {
                0 == t.code && console.log(t.msg);
            }
        });
    },
    onUnload: function() {
        var c = this, r = JSON.stringify(c.data.cart_list);
        r != [] && a.request({
            url: t.cart.cart_edit,
            method: "post",
            data: {
                list: r
            },
            success: function(t) {
                0 == t.code && console.log(t.msg);
            }
        });
    }
});