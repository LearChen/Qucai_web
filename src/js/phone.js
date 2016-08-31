define(function(require) {
    var $ = require('jquery');
    var cookie = require('cookie');
    var tap = require('tap');
    var common = require('common');
    var dialog = require('dialog');
    var RSACoder = require('RSACoder');
    var publicKey = common.getPublicKey();

    var cellPhone = cookie.get('cell_num') || '';

    var setPhone = function()
    {
        /*获取验证码*/
        var $phone = $('#phone_num');
        var $btnCode = $('#get_code');
        var t;
        var time=60;

        $btnCode.on('tap',function(e)
        {
            if($btnCode.hasClass('disabled') || $btnCode.data('run'))
            {
                return;
            }

            var phoneVal = $phone.val();

            if(!phoneVal || isNaN(phoneVal) || phoneVal.trim().length!=11)
            {
                alert('请输入11位手机号码!');
                $('#phone_num').focus();
                return;
            }

            if(!publicKey)
            {
                common.showInfo('连接服务器失败，请稍后重试!');
                return;
            }

            var data = {action_type:"3", cell_num:phoneVal.toString()};

            var encryptStr = RSACoder.encryptByPublicKey(JSON.stringify(data), publicKey.exponent, publicKey.modulus);

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
                        alert("请检查填写的手机号并稍后重试");
                    }
                },
                error:function()
                {
                    common.showInfo('连接服务器失败，请稍后重试!');
                }
            });

            $btnCode.addClass('disabled').data('run',true).find('span').text(time + '秒后重新发送');

            t = setInterval(function(){
                if(time-- <=0)
                {
                    clearInterval(t);
                    $btnCode.removeClass('disabled').data('run',false).find('span').text('');
                    time = 60;
                }
                else
                {
                    $btnCode.find('span').text(time + '秒后重新发送');
                }
            },1000);
            e.preventDefault();
        });

        /*提交*/
        $('#bind_submit').on('tap',function(e)
        {
            e.preventDefault();

            var phoneVal = $('#phone_num').val();
            var code = $('#phone_code').val();

            if(!phoneVal || isNaN(phoneVal) || phoneVal.trim().length!=11)
            {
                alert('请输入11位手机号码!');
                $('#phone_num').focus();
                return;
            }

            if(!code || isNaN(code))
            {
                alert('请填写正确的验证码!');
                return;
            }

            if(!publicKey)
            {
                common.showInfo('连接服务器失败，请稍后重试!');
                return;
            }

            var data = {cell_num:phoneVal.toString(), verify_code:code.toString()};
            var encryptStr = RSACoder.encryptByPublicKey(JSON.stringify(data), publicKey.exponent, publicKey.modulus);

            $.ajax({
                url: "/user/bind_phone-w.html?t=" + cookie.get('token_id'),
                type: "post",
                dataType: "json",
                data: encryptStr,
                async: false,
                success: function (response)
                {
                    if (response.result_code == 0)
                    {
                        alert("操作成功!感谢您的参与!");
                        cookie.set('cell_num',phoneVal);

                    }
                    else if(response.result_code == 1)
                    {
                        alert("请填写正确的手机号及验证码!");
                    }
                    else if(response.result_code == 7)
                    {
                        alert("该手机号已被绑定，请更换手机号!");
                    }
                    else if(response.result_code == 8)
                    {
                        alert("该手机号不存在，请更换手机号!");
                    }
                    else if(response.result_code == 9)
                    {
                        alert("验证码错误，请重新输入!");
                    }
                    else if(response.result_code == 10)
                    {
                        alert("验证码过期，请重新获取!");
                    }
                },
                error:function()
                {
                    common.showInfo('连接服务器失败，请稍后重试!');
                }
            });


        });

    };

    $(function()
    {
        setPhone();

    });

});