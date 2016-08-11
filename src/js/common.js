/*
* 存储常量及工具方法的公共模块
* */
define(function(require) {

    var $ = require('jquery');
    var tap = require('tap');
    var dialog = require('dialog');

    /*地址栏参数查询*/
    var getQueryString = function(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    };

    /*服务器*/
    var hostName = {
        'test':'test.qucai8.com',
        'public':'www.uguess.me'
    };

    /*微信appkey*/
    var wechatKey = {
        'test':'wxc422ad1ee85b352f',
        'public':'wx4131b2357769ff54'
    };

    /*微博appKey*/
    var weiboKey = {
        'test':'1361477323',
        'public':'1361477323'
    };

    /*检测服务器是测试还是正式环境*/
    var isTestServer = function()
    {
        return (window.location.host).indexOf(hostName.test) != -1;
    };

    var getTimeInterval = function (millisecondparam)
    {
        var interval="";
        var millisecond = millisecondparam - new Date().getTime();
        var second = millisecond / 1000;
        if (second <= 0) {
            second = 0;
        }
        if (second == 0) {
            interval = "竞猜结束";
        } else if (second < 30 && second > 5) {
            interval = parseInt(second) + "秒内结束";
        } else if (second >= 30 && second < 60) {
            interval = "半分钟内结束";
        } else if (second >= 60 && second < 60 * 60) {//大于1分钟 小于1小时
            var minute = parseInt(second / 60);
            interval = minute + "分钟后结束";
        } else if (second >= 60 * 60 && second < 60 * 60 * 24) {//大于1小时 小于24小时
            var hour = parseInt(second / 60 / 60);
            interval = hour + "小时后结束";
        } else if (second >= 60 * 60 * 24) {//大于1D 小于2D
            interval = "一天以上";
        }
        return interval;
    };

    var getSourceImageUrl = function (imgUrl)
    {
        var fileUrl = imgUrl;
        var watermarkIndex = fileUrl.lastIndexOf("/");
        var pointIndex = fileUrl.lastIndexOf(".");
        if (watermarkIndex > pointIndex){
            fileUrl = fileUrl.substring(0,watermarkIndex);
        }
        return fileUrl;
    };

    /*
    * type:
    * success，则显示正确图标
    * error，则显示错误图标
    * 没有，则不显示任何图标
    * */
    var showInfo = function(msg, icon_type, time)
    {
        if(!icon_type)
        {
            $.dialog({
                dialogClass:'qc-dialog qc-dialog-info no-info-pic',
                type : 'info',
                infoText : msg || '',
                infoIcon : '',
                autoClose : time || 2000
            });
        }
        else
        {
            var iconType = (icon_type=='success')? 'icon-success':'icon-fail';

            $.dialog({
                dialogClass:'qc-dialog qc-dialog-info ' + iconType,
                type : 'info',
                infoText : msg || '',
                infoIcon : '',
                autoClose : time || 2000
            });

        }

    };

    var showDialog = function(title, content)
    {
        $.dialog({
            dialogClass: 'qc-dialog qc-info-content qc-dialog-header-bg',
            type : 'alert',
            showTitle: true,
            titleText: title ||'',
            contentHtml: content||'',
            autoClose : 0
        });
    };

    var showTips = function(text)
    {

    };

    var showErrorCodeInfo = function(code)
    {
        switch (code)
        {
            case 1:
            {
                showInfo('参与失败!','error');
                break;
            }
            case 2:
            {
                showInfo('非法调用!','error');
                break;
            }
            case 3:
            {
                showInfo('未登录!','error');
                break;
            }
            case 4:
            {
                showInfo('登录超时!','error');
                break;
            }
            case 5:
            {
                showInfo('用户名为空!','error');
                break;
            }
            case 6:
            {
                showInfo('用户密码为空!','error');
                break;
            }
            case 7:
            {
                showInfo('手机号码已存在!','error');
                break;
            }
            case 8:
            {
                showInfo('手机号码不存在!','error');
                break;
            }
            case 9:
            {
                showInfo('验证码错误!','error');
                break;
            }
            case 10:
            {
                showInfo('验证码过期!','error');
                break;
            }
            case 11:
            {
                showInfo('用户密码错误!','error');
                break;
            }
            case 12:
            {
                showInfo('用户名不存在!','error');
                break;
            }
            case 13:
            {
                showInfo('该用户已失效!','error');
                break;
            }
            case 14:
            {
                showInfo('昵称已存在!','error');
                break;
            }
            case 15:
            {
                showInfo('没有响应数据!','error');
                break;
            }
            case 16:
            {
                showInfo('没有权限!','error');
                break;
            }
            case 17:
            {
                showInfo('设备ID为空!','error');
                break;
            }
            case 18:
            {
                showInfo('没有争抢到派发福利机会!','error');
                break;
            }
            case 19:
            {
                showInfo('福利已派发完了!','error');
                break;
            }
            case 20:
            {
                showInfo('猜豆余额不足!','error');
                break;
            }
            case 21:
            {
                showInfo('红包余额不足!','error');
                break;
            }
            case 22:
            {
                showInfo('已经是好友关系!','error');
                break;
            }
            case 23:
            {
                showInfo('钻石余额不足!','error');
                break;
            }
            case 24:
            {
                showInfo('商品已售罄!','error');
                break;
            }
            case 25:
            {
                showInfo('商品不可重复购买!','error');
                break;
            }
            case 26:
            {
                showInfo('未设置支付密码!','error');
                break;
            }
            case 27:
            {
                showInfo('支付密码错误!','error');
                break;
            }
            case 28:
            {
                showInfo('参与名额已争抢完毕!','error');
                break;
            }
            case 29:
            {
                showInfo('登录加密串已经过期!','error');
                break;
            }
            case 30:
            {
                showInfo('用户充值账户余额不足!','error');
                break;
            }
            case 31:
            {
                showInfo('交易号不存在!','error');
                break;
            }
            case 32:
            {
                showInfo('用户支付中!','error');
                break;
            }
            case 33:
            {
                showInfo('用户未支付!','error');
                break;
            }
            case 34:
            {
                showInfo('用户已关闭支付!','error');
                break;
            }
            case 35:
            {
                showInfo('用户已撤销支付!','error');
                break;
            }
            case 36:
            {
                showInfo('用户支付已转入退款!','error');
                break;
            }
            case 37:
            {
                showInfo('支付平台系统异常!','error');
                break;
            }
            case 38:
            {
                showInfo('最大红包金额不能超过200元!','error');
                break;
            }
            case 39:
            {
                showInfo('您已经参与过该竞猜了!','error');
                break;
            }
            case 40:
            {
                showInfo('该福利不存在!','error');
                break;
            }
            case 41:
            {
                showInfo('该福利已经被使用了!','error');
                break;
            }
            case 42:
            {
                showInfo('该福利已经过期了!','error');
                break;
            }
            case 43:
            {
                showInfo('该福利不属于您!','error');
                break;
            }
            case 44:
            {
                showInfo('二维码不存在!','error');
                break;
            }
            case 45:
            {
                showInfo('二维码已过期!','error');
                break;
            }
            case 46:
            {
                showInfo('该用户被禁言!','error');
                break;
            }
            case 47:
            {
                showInfo('该竞猜已经截止!','error');
                break;
            }
            case 48:
            {
                showInfo('该竞猜已经结束!','error');
                break;
            }
            case 49:
            {
                showInfo('该竞猜已经被删除!','error');
                break;
            }
            case 50:
            {
                showInfo('您没有赢得当前竞猜,不能领取奖品!','error');
                break;
            }
            case 51:
            {
                showInfo('该悬赏任务未上线!','error');
                break;
            }
            case 52:
            {
                showInfo('该悬赏任务已结束!','error');
                break;
            }
            case 53:
            {
                showInfo('该悬赏任务余额不足!','error');
                break;
            }
            case 54:
            {
                showInfo('您已经申请了该悬赏任务,等待审核!','error');
                break;
            }
            case 55:
            {
                showInfo('您已经申请了该悬赏任务，但还未完成该任务!','error');
                break;
            }
            case 56:
            {
                showInfo('没有获取到微信授权,不能登录!','error');
                break;
            }
            case 57:
            {
                showInfo('没有获取到微博授权,未能登录!','error');
                break;
            }
            case 58:
            {
                showInfo('不允许参与自己发布的竞猜!','error');
                break;
            }
            case 59:
            {
                showInfo('没有获取到用户地理位置!','error');
                break;
            }
            case 60:
            {
                showInfo('竞猜答案类型不匹配!','error');
                break;
            }
            case 61:
            {
                showInfo('没有设置即开型竞猜的正确答案!','error');
                break;
            }
            case 62:
            {
                showInfo('验证码为空!','error');
                break;
            }
            case 63:
            {
                showInfo('该抽奖活动不存在!','error');
                break;
            }
            case 64:
            {
                showInfo('该抽奖活动非上线活动!','error');
                break;
            }
            case 65:
            {
                showInfo('该抽奖活动已经过期!','error');
                break;
            }
            case 66:
            {
                showInfo('您没中奖，不能领取奖品!','error');
                break;
            }
            case 67:
            {
                showInfo('您选择的众筹众包奖品数量已争抢完毕!','error');
                break;
            }
            case 68:
            {
                showInfo('用户未设置支付宝账号信息!','error');
                break;
            }
            case 69:
            {
                showInfo('用户道具资产不存在!','error');
                break;
            }
            case 70:
            {
                showInfo('用户道具资产余额不足!','error');
                break;
            }
            case 71:
            {
                showInfo('与被赠送用户不是好友关系!','error');
                break;
            }
            case 72:
            {
                showInfo('您零钱余额小于提现最小金额!','error');
                break;
            }
            case 73:
            {
                showInfo('没有先触发记录用户被监禁开始时间!','error');
                break;
            }
            case 74:
            {
                showInfo('赞赏花余额不足!','error');
                break;
            }
            case 9999:
            {
                showInfo('内部异常!','error');
                break;
            }
        }
    };

    var getPublicKey = function()
    {
        var publicKey = {};

        $.ajax({
            url: "/common/get_public_key-w.html",
            type: "post",
            dataType: "json",
            data: "",
            async: false,
            success:function(response)
            {
                if(response.result_code == 0)
                {
                    publicKey = {
                        exponent : response.body.exponent,
                        modulus : response.body.modulus
                    };

                    return publicKey;
                }

            }
        });

        return publicKey;

    };

    var replaceUrl = function(str)
    {
        var reg = /((http:\/\/)|(https:\/\/))?(((\w)+[.]){1,}(net|com|cn|org|cc|tv|[0-9]{1,3}))/g;
        return str.replace(reg,function(m)
        {
            var start = m.substring(0,4) == "http"?"":"http://";
            return '<a target="_blank" href="'+ start + m +'">'+m+'</a>';
        })
    };


    $(function()
    {
       $(document).on('tap','.nav-back',function(e)
       {
           e.preventDefault();
           history.back();
       });
    });

    return {
        hostName:hostName,
        wechatKey:wechatKey,
        weiboKey:weiboKey,
        getQueryString:getQueryString,
        isTestServer:isTestServer,
        getTimeInterval:getTimeInterval,
        getSourceImageUrl:getSourceImageUrl,
        showInfo:showInfo,
        showDialog:showDialog,
        showErrorCodeInfo:showErrorCodeInfo,
        getPublicKey:getPublicKey,
        replaceUrl:replaceUrl
    };

});