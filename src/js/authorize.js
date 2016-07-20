/*
 * 登录验证, 第三方登录
 * 1.从服务器获取数据，需要tokenId
 * 2.tokenId获取方式：微信登录或微博登录
 * 3.微信登录：需要code或union_id
 *   微博登录：需要weibo_code或weibo_uid
 * 4.登录成功返回tokenId
 * */
define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var common = require('common');
    var cookie = require('cookie');

    var isTest = common.isTestServer();
    //var host = 'http://'+(isTest?common.hostName.test : common.hostName.public);

    var agent = navigator.userAgent;

    /*微信浏览器*/
    if(agent.indexOf('MicroMessenger') != -1)
    {
        var unionId = cookie.get("union_id");
        var postData;

        if(!unionId)
        {
            var weixinCode = cookie.get("weixin_code");

            /*没有code，去授权获取*/
            if(!weixinCode)
            {
                /*cookie没有获取到，从参数获取（已经授权重定向到了这里）*/
                //noinspection JSDuplicatedDeclaration
                var code = common.getQueryString('code');
                if(!code)
                {
                    var wechatKey = isTest? common.wechatKey.test:common.wechatKey.public;
                    var state = "test=" + isTest; /*state 带去服务器是哪台*/
                    cookie.set('_source',window.location.href); /*来源地址存在cookie里面,验证成功后在redirect的页面跳转到指定数据页，再从cookie里面取出跳转*/

                    var wechatOauth2Url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+wechatKey+'&redirect_uri=http%3a%2f%2fwww.qucai8.com%2foauth2%2fredirect.htm&response_type=code&scope=snsapi_userinfo&state='+state+'#wechat_redirect';
                    window.location.href = wechatOauth2Url;
                    return;
                }
                else
                {
                    cookie.set("weixin_code", code);
                    postData = '{"code":"' + code + '"}';
                }
            }
            else
            {
                postData = '{"code":"' + weixinCode + '"}';
            }
        }
        else
        {
            postData = '{"union_id":"' + unionId + '"}';
        }

        loginByWechat(postData);
    }

    /*微博浏览器*/
    else if(agent.indexOf('Weibo') != -1)
    {
        var weiboUid = cookie.get("weibo_uid");
        var postData;

        if(!weiboUid)
        {
            var weiboCode = cookie.get("weibo_code");

            /*没有code，去授权获取*/
            if(!weiboCode)
            {
                /*cookie没有获取到，从参数获取（已经授权重定向到了这里）*/
                var code = common.getQueryString('code');
                if(!code)
                {
                    var weiboKey = isTest? common.weiboKey.test:common.weiboKey.public;
                    var state = "test=" + isTest; /*state 带去服务器是哪台*/
                    cookie.set('_source',window.location.href); /*来源地址存在cookie里面,验证成功后在redirect的页面跳转到指定数据页，再从cookie里面取出跳转*/

                    var weiboOauth2Url = 'https://api.weibo.com/oauth2/authorize?client_id='+weiboKey+'&response_type=code&redirect_uri=http://www.qucai8.com/oauth2/redirect.htm&state=' + state;
                    window.location.href = weiboOauth2Url;
                    return;
                }
                else
                {
                    cookie.set("weibo_code", code);
                    postData = '{"code":"' + code + '"}';
                }
            }
            else
            {
                postData = '{"code":"' + weiboCode + '"}';
            }

        }
        else
        {
            postData = '{"weibo_uid":"' + weiboUid + '"}';
        }

        loginByWeibo(postData);

    }
    /*其他浏览器*/
    else
    {

    }

    /*微信登录*/
    function loginByWechat(data)
    {
        $.ajax({
            url: "/user/weixin_web_login.html",
            type: "post",
            dataType: "json",
            data: data,
            async: false,
            success: function (response)
            {
                var tokenId = response.body.token,
                    unionId = response.body.union_id,
                    userId  = response.body.user_id;

                cookie.set("token_id", tokenId);
                cookie.set("union_id", unionId, { expires: 365 });
                cookie.set("user_id", userId);

                setUserInfo(tokenId, response.body);

            },
            error:function()
            {
                alert('登录失败');
            }
        });
    }

    /*微博登录*/
    function  loginByWeibo(data)
    {
        $.ajax({
            url: "/user/weibo_web_login.html",
            type: "post",
            dataType: "json",
            data: data,
            async: false,
            success: function (response)
            {
                var tokenId = response.body.token,
                    weiboUid = response.body.weibo_uid,
                    userId  = response.body.user_id;

                cookie.set("token_id", tokenId);
                cookie.set("weibo_uid", weiboUid, { expires: 365 });
                cookie.set("user_id", userId);

                setUserInfo(tokenId, response.body);

            },
            error:function()
            {
                alert('登录失败');
            }
        });
    }


    /*填充用户信息*/
    function setUserInfo(tooken, body)
    {
        var nickName = body.nickname;
        $("#nickName").text(nickName);
        var portraitUrl = body.portrait_url;
        $("#portraitUrl").attr("src",portraitUrl);

        getAsset(tooken);
    }

    /*获取用户资产*/
    function getAsset(tokenId)
    {
        $.ajax({
            url: "/user/get_asset.html?t=" + tokenId,
            type:"post",
            dataType:"json",
            success: function (response)
            {
                /*成功*/
                if(response.result_code==0)
                {
                    var scoreBalance = response.body.score_balance;
                    $("#scoreBalance").text(scoreBalance);

                }

            }
        })
    }

});
