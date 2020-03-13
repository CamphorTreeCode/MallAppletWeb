var t = require("../../api.js"), a = getApp(), e = "", i = "", s = require("../../utils/utils.js");

Page({
    data: {
        total_price: 0,
        address: null,
        express_price: 0,
        content: "",
        offline: 0,
        express_price_1: 0,
        name: "",
        mobile: "",
        integral_radio: 1,
        new_total_price: 0,
        show_card: !1,
        payment: -1,
        show_payment: !1
    },
    onLoad: function(t) {
        a.pageOnLoad(this);
        var e = this, i = s.formatData(new Date());
        e.setData({
            options: t,
            store: wx.getStorageSync("store"),
            time: i
        });
    },
    bindkeyinput: function(t) {
        this.setData({
            content: t.detail.value
        });
    },
    KeyName: function(t) {
        this.setData({
            name: t.detail.value
        });
    },
    KeyMobile: function(t) {
        this.setData({
            mobile: t.detail.value
        });
    },
    getOffline: function(t) {
        var a = this, e = this.data.express_price, i = this.data.express_price_1;
        1 == t.target.dataset.index ? this.setData({
            offline: 1,
            express_price: 0,
            express_price_1: e
        }) : this.setData({
            offline: 0,
            express_price: i
        }), a.getPrice();
    },
    dingwei: function() {
        var t = this;
        wx.chooseLocation({
            success: function(a) {
                e = a.longitude, i = a.latitude, t.setData({
                    location: a.address
                });
            },
            fail: function(e) {
                a.getauth({
                    content: "需要获取您的地理位置授权，请到小程序设置中打开授权",
                    success: function(a) {
                        a && (a.authSetting["scope.userLocation"] ? t.dingwei() : wx.showToast({
                            title: "您取消了授权",
                            image: "/images/icon-warning.png"
                        }));
                    }
                });
            }
        });
    },
    orderSubmit: function(e) {
        var i = this, s = i.data.offline, o = {};
        if (0 == s) {
            if (!i.data.address || !i.data.address.id) return void wx.showToast({
                title: "请选择收货地址",
                image: "/images/icon-warning.png"
            });
            o.address_id = i.data.address.id;
        } else {
            if (o.address_name = i.data.name, o.address_mobile = i.data.mobile, !i.data.shop.id) return void wx.showModal({
                title: "警告",
                content: "请选择门店",
                showCancel: !1
            });
            if (o.shop_id = i.data.shop.id, !o.address_name || void 0 == o.address_name) return void i.showToast({
                title: "请填写收货人",
                image: "/images/icon-warning.png"
            });
            if (!o.address_mobile || void 0 == o.address_mobile) return void i.showToast({
                title: "请填写联系方式",
                image: "/images/icon-warning.png"
            });
            if (!/^1\d{10}$/.test(o.address_mobile)) return void wx.showModal({
                title: "提示",
                content: "手机号格式不正确",
                showCancel: !1
            });
        }
        o.offline = s;
        var r = i.data.form;
        if (1 == r.is_form) {
            var n = r.list;
            for (var d in n) if ("date" == n[d].type && (n[d].default = n[d].default ? n[d].default : i.data.time), 
            "time" == n[d].type && (n[d].default = n[d].default ? n[d].default : "00:00"), 1 == n[d].required) if ("radio" == n[d].type || "checkboxc" == n[d].type) {
                var c = !1;
                for (var l in n[d].default_list) 1 == n[d].default_list[l].is_selected && (c = !0);
                if (!c) return wx.showModal({
                    title: "提示",
                    content: "请填写" + r.name + "，加‘*’为必填项",
                    showCancel: !1
                }), !1;
            } else if (!n[d].default || void 0 == n[d].default) return wx.showModal({
                title: "提示",
                content: "请填写" + r.name + "，加‘*’为必填项",
                showCancel: !1
            }), !1;
        }
        o.form = JSON.stringify(r), i.data.cart_id_list && (o.cart_id_list = JSON.stringify(i.data.cart_id_list)), 
        i.data.goods_info && (o.goods_info = JSON.stringify(i.data.goods_info)), i.data.picker_coupon && (o.user_coupon_id = i.data.picker_coupon.user_coupon_id), 
        i.data.content && (o.content = i.data.content), i.data.cart_list && (o.cart_list = JSON.stringify(i.data.cart_list)), 
        wx.showLoading({
            title: "正在提交",
            mask: !0
        }), 1 == i.data.integral_radio ? o.use_integral = 1 : o.use_integral = 2, o.payment = i.data.payment, 
        a.request({
            url: t.order.submit,
            method: "post",
            data: o,
            success: function(s) {
                if (0 == s.code) {
                    setTimeout(function() {
                        wx.hideLoading();
                    }, 1e3), setTimeout(function() {
                        i.setData({
                            options: {}
                        });
                    }, 1);
                    var r = s.data.order_id;
                    0 == o.payment && a.request({
                        url: t.order.pay_data,
                        data: {
                            order_id: r,
                            pay_type: "WECHAT_PAY"
                        },
                        success: function(t) {
                            if (0 != t.code) 1 != t.code || i.showToast({
                                title: t.msg,
                                image: "/images/icon-warning.png"
                            }); else {
                                wx.requestPayment({
                                    timeStamp: t.data.timeStamp,
                                    nonceStr: t.data.nonceStr,
                                    package: t.data.package,
                                    signType: t.data.signType,
                                    paySign: t.data.paySign,
                                    success: function(t) {},
                                    fail: function(t) {},
                                    complete: function(t) {
                                        "requestPayment:fail" != t.errMsg && "requestPayment:fail cancel" != t.errMsg ? "requestPayment:ok" != t.errMsg ? wx.redirectTo({
                                            url: "/pages/order/order?status=-1"
                                        }) : i.data.goods_card_list.length > 0 ? i.setData({
                                            show_card: !0
                                        }) : wx.redirectTo({
                                            url: "/pages/order/order?status=-1"
                                        }) : wx.showModal({
                                            title: "提示",
                                            content: "订单尚未支付",
                                            showCancel: !1,
                                            confirmText: "确认",
                                            success: function(t) {
                                                t.confirm && wx.redirectTo({
                                                    url: "/pages/order/order?status=0"
                                                });
                                            }
                                        });
                                    }
                                });
                                var a = wx.getStorageSync("quick_list");
                                if (a) {
                                    for (var e = a.length, s = 0; s < e; s++) for (var o = a[s].goods, r = o.length, n = 0; n < r; n++) o[n].num = 0;
                                    wx.setStorageSync("quick_lists", a);
                                    for (var d = wx.getStorageSync("carGoods"), e = d.length, s = 0; s < e; s++) d[s].num = 0, 
                                    d[s].goods_price = 0, i.setData({
                                        carGoods: d
                                    });
                                    wx.setStorageSync("carGoods", d);
                                    var c = wx.getStorageSync("total");
                                    c && (c.total_num = 0, c.total_price = 0, wx.setStorageSync("total", c));
                                    wx.getStorageSync("check_num");
                                    0, wx.setStorageSync("check_num", 0);
                                    for (var l = wx.getStorageSync("quick_hot_goods_lists"), e = l.length, s = 0; s < e; s++) l[s].num = 0, 
                                    i.setData({
                                        quick_hot_goods_lists: l
                                    });
                                    wx.setStorageSync("quick_hot_goods_lists", l);
                                }
                            }
                        }
                    }), 2 == o.payment && a.request({
                        url: t.order.pay_data,
                        data: {
                            order_id: r,
                            pay_type: "HUODAO_PAY",
                            form_id: e.detail.formId
                        },
                        success: function(t) {
                            0 == t.code ? wx.redirectTo({
                                url: "/pages/order/order?status=-1"
                            }) : i.showToast({
                                title: t.msg,
                                image: "/images/icon-warning.png"
                            });
                        }
                    }), 3 == o.payment && a.request({
                        url: t.order.pay_data,
                        data: {
                            order_id: r,
                            pay_type: "BALANCE_PAY",
                            form_id: e.detail.formId
                        },
                        success: function(t) {
                            if (0 != t.code) return i.showToast({
                                title: t.msg,
                                image: "/images/icon-warning.png"
                            }), void setTimeout(function() {
                                wx.redirectTo({
                                    url: "/pages/order/order?status=-1"
                                });
                            }, 1e3);
                            wx.redirectTo({
                                url: "/pages/order/order?status=-1"
                            });
                        }
                    });
                }
                if (1 == s.code) return wx.hideLoading(), void i.showToast({
                    title: s.msg,
                    image: "/images/icon-warning.png"
                });
            }
        });
    },
    onReady: function() {},
    onShow: function() {
        var t = this, a = wx.getStorageSync("picker_address");
        a && (t.setData({
            address: a,
            name: a.name,
            mobile: a.mobile
        }), wx.removeStorageSync("picker_address")), t.getOrderData(t.data.options);
    },
    getOrderData: function(s) {
        var o = this, r = {}, n = "";
        if (o.data.address && o.data.address.id && (n = o.data.address.id), r.address_id = n, 
        r.longitude = e, r.latitude = i, wx.showLoading({
            title: "正在加载",
            mask: !0
        }), s.cart_list) {
            JSON.parse(s.cart_list);
            r.cart_list = s.cart_list;
        }
        if (s.cart_id_list) {
            var d = JSON.parse(s.cart_id_list);
            r.cart_id_list = d;
        }
        s.goods_info && (r.goods_info = s.goods_info), a.request({
            url: t.order.submit_preview,
            data: r,
            success: function(t) {
                if (wx.hideLoading(), 0 == t.code) {
                    var a = t.data.shop_list, e = {};
                    a && 1 == a.length && (e = a[0]), t.data.is_shop && (e = t.data.is_shop), o.setData({
                        total_price: t.data.total_price,
                        goods_list: t.data.list,
                        address: t.data.address,
                        express_price: parseFloat(t.data.express_price),
                        coupon_list: t.data.coupon_list,
                        shop_list: a,
                        shop: e,
                        name: t.data.address ? t.data.address.name : "",
                        mobile: t.data.address ? t.data.address.mobile : "",
                        send_type: t.data.send_type,
                        level: t.data.level,
                        new_total_price: t.data.total_price,
                        integral: t.data.integral,
                        goods_card_list: t.data.goods_card_list,
                        form: t.data.form,
                        is_payment: t.data.is_payment,
                        pay_type_list: t.data.pay_type_list,
                        payment: t.data.pay_type_list[0].payment
                    }), t.data.goods_info && o.setData({
                        goods_info: t.data.goods_info
                    }), t.data.cart_id_list && o.setData({
                        cart_id_list: t.data.cart_id_list
                    }), t.data.cart_list && o.setData({
                        cart_list: t.data.cart_list
                    }), 1 == t.data.send_type && o.setData({
                        offline: 0
                    }), 2 == t.data.send_type && o.setData({
                        offline: 1
                    }), o.getPrice();
                }
                1 == t.code && wx.showModal({
                    title: "提示",
                    content: t.msg,
                    showCancel: !1,
                    confirmText: "返回",
                    success: function(t) {
                        t.confirm && wx.navigateBack({
                            delta: 1
                        });
                    }
                });
            }
        });
    },
    copyText: function(t) {
        var a = t.currentTarget.dataset.text;
        a && wx.setClipboardData({
            data: a,
            success: function() {
                page.showToast({
                    title: "已复制内容"
                });
            },
            fail: function() {
                page.showToast({
                    title: "复制失败",
                    image: "/images/icon-warning.png"
                });
            }
        });
    },
    showCouponPicker: function() {
        var t = this;
        t.data.coupon_list && t.data.coupon_list.length > 0 && t.setData({
            show_coupon_picker: !0
        });
    },
    pickCoupon: function(t) {
        var a = this, e = t.currentTarget.dataset.index;
        "-1" == e || -1 == e ? a.setData({
            picker_coupon: !1,
            show_coupon_picker: !1
        }) : a.setData({
            picker_coupon: a.data.coupon_list[e],
            show_coupon_picker: !1
        }), a.getPrice();
    },
    numSub: function(t, a, e) {
        return 100;
    },
    showShop: function(t) {
        var a = this;
        a.dingwei(), a.data.shop_list && a.data.shop_list.length >= 1 && a.setData({
            show_shop: !0
        });
    },
    pickShop: function(t) {
        var a = this, e = t.currentTarget.dataset.index;
        "-1" == e || -1 == e ? a.setData({
            shop: !1,
            show_shop: !1
        }) : a.setData({
            shop: a.data.shop_list[e],
            show_shop: !1
        }), a.getPrice();
    },
    integralSwitchChange: function(t) {
        var a = this;
        0 != t.detail.value ? a.setData({
            integral_radio: 1
        }) : a.setData({
            integral_radio: 2
        }), a.getPrice();
    },
    integration: function(t) {
        var a = this.data.integral.integration;
        wx.showModal({
            title: "积分使用规则",
            content: a,
            showCancel: !1,
            confirmText: "我知道了",
            confirmColor: "#ff4544",
            success: function(t) {
                t.confirm && console.log("用户点击确定");
            }
        });
    },
    getPrice: function() {
        var t = this, a = t.data.total_price, e = t.data.express_price, i = t.data.picker_coupon, s = t.data.integral, o = t.data.integral_radio, r = t.data.level, n = t.data.offline;
        i && (a -= i.sub_price), s && 1 == o && (a -= parseFloat(s.forehead)), r && (a = a * r.discount / 10), 
        a <= .01 && (a = .01), 0 == n && (a += e), t.setData({
            new_total_price: parseFloat(a.toFixed(2))
        });
    },
    cardDel: function() {
        this.setData({
            show_card: !1
        }), wx.redirectTo({
            url: "/pages/order/order?status=1"
        });
    },
    cardTo: function() {
        this.setData({
            show_card: !1
        }), wx.redirectTo({
            url: "/pages/card/card"
        });
    },
    formInput: function(t) {
        var a = this, e = t.currentTarget.dataset.index, i = a.data.form, s = i.list;
        s[e].default = t.detail.value, i.list = s, a.setData({
            form: i
        });
    },
    selectForm: function(t) {
        var a = this, e = t.currentTarget.dataset.index, i = t.currentTarget.dataset.k, s = a.data.form, o = s.list;
        if ("radio" == o[e].type) {
            var r = o[e].default_list;
            for (var n in r) n == i ? r[i].is_selected = 1 : r[n].is_selected = 0;
            o[e].default_list = r;
        }
        "checkbox" == o[e].type && (1 == (r = o[e].default_list)[i].is_selected ? r[i].is_selected = 0 : r[i].is_selected = 1, 
        o[e].default_list = r), s.list = o, a.setData({
            form: s
        });
    },
    showPayment: function() {
        this.setData({
            show_payment: !0
        });
    },
    payPicker: function(t) {
        var a = t.currentTarget.dataset.index;
        this.setData({
            payment: a
        });
    },
    payClose: function() {
        this.setData({
            show_payment: !1
        });
    }
});