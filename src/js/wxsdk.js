/*微信jssdk
* https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN
* */
define(function(require){
    var wx = require('http://res.wx.qq.com/open/js/jweixin-1.0.0.js');
    var $ = require('jquery');
    var common = require('common');
    var cookie = require('cookie');
    var tokenId = cookie.get('token_id');

    var _title, _desc, _link, _imgUrl;

    var getSign = function (url, title, desc, link, imgUrl)
    {
        $.ajax({
            url: "/user/get_weixin_web_js_sdk_sign.html?t=" + tokenId,
            type: "post",
            data: '{"url":"'+url+'"}',
            dataType: "json",
            success: function (response)
            {
                if(response.result_code == 0)
                {
                    _title = title;
                    _desc = desc;
                    _link = link;
                    _imgUrl = imgUrl;
                    configSdk(response.body);
                }
                else
                {
                   // common.showErrorCodeInfo(response.result_code);
                }

            },
            error:function()
            {
                //common.showInfo('获取签名失败');
            }
        });
    };

    var configSdk = function(signBundle)
    {
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: signBundle.app_id, // 必填，公众号的唯一标识
            timestamp: signBundle.timestamp, // 必填，生成签名的时间戳
            nonceStr: signBundle.noncestr, // 必填，生成签名的随机串
            signature: signBundle.sign, // 必填，签名，见附录1
            jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

    };

    wx.ready(function()
    {
        /*分享到朋友圈*/
        wx.onMenuShareTimeline({
            title: _title || '', // 分享标题
            desc: _desc || '', // 分享描述
            link: _link || '', // 分享链接
            imgUrl: _imgUrl || '', // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

        /*分享给朋友*/
        wx.onMenuShareAppMessage({
            title: _title || '', // 分享标题
            desc: _desc || '', // 分享描述
            link: _link || '', // 分享链接
            imgUrl: _imgUrl || '', // 分享图标
            type: 'link', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });


    var share = function(title, desc, link, imgUrl)
    {
        getSign(window.location.href, title, desc, link, imgUrl);

    };

    return{
        share:share
    };

});