var a = require("../../api.js"), t = getApp();

Page({
    data: {
        backgrop: [ "navbar-item-active" ],
        navbarArray: [],
        navbarShowIndexArray: 0,
        navigation: !1,
        windowWidth: 375,
        scrollNavbarLeft: 0,
        currentChannelIndex: 0,
        articlesHide: !1
    },
    onLoad: function(a) {
        this.systemInfo = wx.getSystemInfoSync(), t.pageOnLoad(this), this.loadTopicList({
            page: 1,
            reload: !0
        });
        var e = this;
        wx.getSystemInfo({
            success: function(a) {
                e.setData({
                    windowWidth: a.windowWidth
                });
            }
        });
        this.data.navbarArray, this.data.navbarShowIndexArray;
    },
    loadTopicList: function(e) {
        var i = this;
        i.data.is_loading || e.loadmore && !i.data.is_more || (i.setData({
            is_loading: !0
        }), t.request({
            url: a.default.topic_type,
            data: {},
            success: function(a) {
                0 == a.code && i.setData({
                    navbarArray: a.data.list,
                    navbarShowIndexArray: Array.from(Array(a.data.list.length).keys()),
                    navigation: "" != a.data.list
                });
            }
        }), t.request({
            url: a.default.topic_list,
            data: {
                page: e.page
            },
            success: function(a) {
                0 == a.code && (e.reload && i.setData({
                    list: a.data.list,
                    page: e.page,
                    is_more: a.data.list.length > 0
                }), e.loadmore && i.setData({
                    list: i.data.list.concat(a.data.list),
                    page: e.page,
                    is_more: a.data.list.length > 0
                }));
            },
            complete: function() {
                i.setData({
                    is_loading: !1
                });
            }
        }));
    },
    onShow: function() {
        t.pageOnShow(this);
    },
    onPullDownRefresh: function() {
        var a = this.data.currentChannelIndex;
        this.switchChannel(parseInt(a)), this.sortTopic({
            page: 1,
            type: parseInt(a),
            reload: !0
        }), wx.stopPullDownRefresh();
    },
    onReachBottom: function() {
        var a = this.data.currentChannelIndex, t = this;
        this.switchChannel(parseInt(a)), console.log(t.data.page), this.sortTopic({
            page: t.data.page + 1,
            type: parseInt(a),
            loadmore: !0
        });
    },
    onTapNavbar: function(a) {
        var t = a.currentTarget.offsetLeft, e = this.data.scrollNavbarLeft;
        e = t - 85, this.setData({
            scrollNavbarLeft: e
        }), wx.showLoading({
            title: "正在加载",
            mask: !0
        }), this.switchChannel(parseInt(a.currentTarget.id)), this.sortTopic({
            page: 1,
            type: a.currentTarget.id,
            reload: !0
        });
    },
    sortTopic: function(e) {
        var i = this;
        t.request({
            url: a.default.topic_list,
            data: e,
            success: function(a) {
                0 == a.code && (e.reload && i.setData({
                    list: a.data.list,
                    page: e.page,
                    is_more: a.data.list.length > 0
                }), e.loadmore && i.setData({
                    list: i.data.list.concat(a.data.list),
                    page: e.page,
                    is_more: a.data.list.length > 0
                }), wx.hideLoading());
            }
        });
    },
    switchChannel: function(a) {
        var t = this.data.navbarArray, e = new Array();
        -1 == a ? e[1] = "navbar-item-active" : 0 == a && (e[0] = "navbar-item-active"), 
        t.forEach(function(t, e, i) {
            t.type = "", t.id == a && (t.type = "navbar-item-active");
        }), this.setData({
            navbarArray: t,
            currentChannelIndex: a,
            backgrop: e
        });
    }
});