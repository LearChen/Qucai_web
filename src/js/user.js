define(function(require) {
    var $ = require('jquery');
    var cookie = require('cookie');

    var baseElements = {
        nick:'#nickName',
        avatar:'#portraitUrl'
    };

    var assetElements = {
        bean:'#scoreBalance',
        playtime:'#playTime'
    };

    var setBaseInfo = function(elements)
    {
        $(function()
        {
            elements = $.extend({}, baseElements, elements||{});

            var nickName = cookie.get('nick_name');
            $(elements.nick).text(nickName);

            var portraitUrl = cookie.get('portrait_url');
            $(elements.avatar).attr("src",portraitUrl);
        });

    };

    var setAsset = function(elements)
    {
        $(function()
        {
            elements = $.extend({}, assetElements, elements||{});

            $.ajax({
                url: "/user/get_asset.html?t=" + cookie.get('token_id'),
                type:"post",
                dataType:"json",
                success: function (response)
                {
                    /*成功*/
                    if(response.result_code==0)
                    {
                        var body = response.body;
                        $(elements.bean).text(body.score_balance);

                        /*抽几次*/
                        var time = Math.ceil(parseInt(body.score_balance)/2000);
                        $(elements.playtime).text(time);
                    }

                }
            })
        });

    };

    var getVerifyCode = function(encryptStr)
    {
        $.ajax({
            url: "/user/verify_code_get-w.html",
            type: "post",
            dataType: "json",
            data: encryptStr,
            success: function (response)
            {
                if (response.result_code == 0)
                {
                    alert("发送成功,请填写收到的验证码!");
                }
                else
                {
                    alert("请填写正确的手机号！");
                }
            }
        });
    };

    return{
        setBaseInfo:setBaseInfo,
        setAsset:setAsset,
        getVerifyCode:getVerifyCode
    }

});