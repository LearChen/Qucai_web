define(function(require)
{
    var $ = require('jquery');
    var common = require('common');
    var cookie = require('cookie');
    var tap = require('tap');
    var dialog = require('dialog');

    var userId = common.getQueryString('user_id') || '';
    var tokenId = common.getQueryString('t') || '';
    var clientId = common.getQueryString('client') || '';

    var server = common.isTestServer() ? common.hostName.test : common.hostName.public;
    var appGuessUrl = "htttp://"+ server + "/event.htm?request_type=2&guess_id=";
    var appTopicUrl = "htttp://"+ server + "/event.htm?request_type=3&topic_id=";

    var userAgent='';

    var pageUrl = window.location.href.split('?')[0];
    var shareLink = pageUrl+"?user_id="+cookie.get('user_id');
    var shareImg = pageUrl.substring(0, pageUrl.lastIndexOf("/")+1) + 'img/appshare.png';
    var shareDesc = "助我一油之力，点燃奥运奇迹，缤纷豪礼优猜邀您加油齐出力。";
    var shareTitle = "油价诚可贵，豪礼价更高，若为中华故，加油我全包！";

    /*替换地址栏链接*/
    //window.history.replaceState(null,"",shareLink);

    if((navigator.userAgent.indexOf('MicroMessenger') != -1))
    {
        tokenId = cookie.get('token_id');
        userAgent = "MicroMessenger";

        var wxsdk = require('wxsdk');
        wxsdk.share(shareTitle,shareDesc, shareLink , shareImg);

    }
    else if (navigator.userAgent.indexOf('Weibo') != -1)
    {
        tokenId = cookie.get('token_id');
        userAgent = "Weibo";

    }

    var getCheerState = function()
    {
        $.ajax({
            url: "/activity/get_olympic_cheer_stat.html?t=" + tokenId,
            type: "post",
            dataType: "json",
            success: function (response)
            {
                if(response.result_code == 0)
                {
                    var cheer_user_sum = response.body.cheer_user_sum;   /*加油用户总量*/
                    var cheer_score_sum = response.body.cheer_score_sum; /*加油猜豆总量*/
                    var cheer_score_num = response.body.cheer_score_num; /*当前用户加油猜豆数量*/

                    $('#cheer_user_sum').text(cheer_user_sum);
                    $('#cheer_score_sum').text(cheer_score_sum);
                    $('#cheer_score_num').text(cheer_score_num);
                }
                else
                {
                    //common.showErrorCodeInfo(response.result_code);
                }

            },
            error:function()
            {
                common.showInfo('无法获取加油数据', null, 1500);
            }
        });
    };

    var getFriendCheerList = function(elementId)
    {
        $.ajax({
            url: "/activity/get_friend_cheer_list.html?t=" + tokenId,
            type: "post",
            dataType: "json",
            success: function (response)
            {
                if (response.result_code != 0)
                {
                    //common.showErrorCodeInfo(response.result_code);
                    return;
                }

                var list = "";
                var size = response.body.length;

                for(var i=0; i<size; i++)
                {
                    var friend = response.body[i];

                    list+='<li>' +
                        '<div class="roll-nick">' +
                            '<span class="roll-avatar">' +
                                '<div class="qc-avatar">' +
                                    '<div class="avatar-box">' +
                                        '<img src="'+ (friend.portrait_url || "http://7xkgv7.com2.z0.glb.qiniucdn.com/avatars/default.png") +'">' +
                                    '</div>' +
                                '</div>' +
                            '</span>' +
                            '<span class="text">'+friend.nickname+'</span>' +
                        '</div>' +
                            '<div class="roll-num">'+friend.cheer_score_num+'桶</div>' +
                        '</li>';
                }

                $('#noFriendTip').hide();
                $(elementId).html(list);

                if(size > 6)
                {
                    /*每个速度为1s*/
                    $(elementId).css({
                        "-webkit-animation-duration":size+'s',
                        "animation-duration":size+'s'
                    });
                }
            },
            error:function()
            {
                common.showInfo('无法获取好友助威数据', null, 1500);
            }
        });
    };

    var getRankList = function(elementId)
    {
        $.ajax({
            url: "/activity/get_olympic_cheer_list.html?t=" + tokenId,
            type: "post",
            data: "{'size':'10'}",
            dataType: "json",
            success: function (response)
            {
                if (response.result_code != 0)
                {
                    //common.showErrorCodeInfo(response.result_code);
                    return;
                }

                var list = "";

                for(var i=0; i<response.body.length; i++)
                {
                    var user = response.body[i];

                    list+='<li>' +
                            '<div class="rank-nick">' +
                                '<span class="rank-avatar">' +
                                    '<div class="qc-avatar">' +
                                        '<div class="avatar-box">' +
                                            '<img src="'+(user.portrait_url || "http://7xkgv7.com2.z0.glb.qiniucdn.com/avatars/default.png")+'">' +
                                        '</div>' +
                                    '</div>' +
                                '</span>' +
                                '<span class="text">'+user.nickname+'</span>' +
                            '</div>' +
                            '<div class="rank-num">'+user.cheer_score_num+'桶</div>' +
                        '</li>';
                }

                $(elementId).html(list);

            },
            error:function()
            {
                common.showInfo('无法获取排行榜数据!', null, 1500);
            }
        });
    };

    var getTopicList = function(elementId,moreId,topicId, orderBy, orderNum)
    {
        var moreTarget = clientId=="0" ? appTopicUrl+topicId : '../../guessList.htm?topic_id='+topicId;

        $(moreId).attr('href', moreTarget);

        var params = '{"topic_id":'+topicId+',"order_by":"'+orderBy+'","order_num":"'+orderNum+'","size":"4"}';

        $.ajax({
            url: "/square/topic_quiz_list.html?t="+tokenId,
            type: "post",
            dataType: "json",
            data: params,
            success:function(response)
            {
                if (response.result_code != 0)
                {
                    //common.showErrorCodeInfo(response.result_code);
                    return;
                }

                var list = "";
                var screenW = $(window).width();
                var screenH = Math.floor(screenW * 0.7);
                var fileSingleStyle = "?imageMogr2/gravity/Center/crop/"+screenW+"x"+screenH;
                var body=response.body;

                for (var i=0;i<body.length;i++)
                {
                    var guessImg = body[i].thumbnail_url;
                    if (!guessImg)
                    {
                        guessImg = 'http://7xkfjx.com2.z0.glb.qiniucdn.com/uguess_default_image.jpg';
                    }
                    else
                    {
                        var index = guessImg.lastIndexOf("/");
                        guessImg = guessImg.substring(0,index);
                    }
                    guessImg += fileSingleStyle;
                    var avatar = body[i].portrait_url;
                    var nickName = body[i].nickname;
                    var content = body[i].content;
                    var quizId = body[i].quiz_id;
                    var target = clientId=="0" ? appGuessUrl+quizId : '../../guess.htm?quiz_id='+quizId;

                    if (body[i].type == 0)
                    {
                        list+=
                            '<li>' +
                            '<a class="anchor" href="'+target+'">' +
                                '<div class="item-content">' +
                                    '<span class="img-wp">' +
                                        '<img src="'+guessImg+'">' +
                                    '</span>' +
                                '</div>' +
                                '<div class="item-info">' +
                                    '<div class="info-box">' +
                                        '<aside>' +
                                            '<div class="qc-avatar">' +
                                                '<div class="avatar-box">' +
                                                    '<img src="'+avatar+'">' +
                                                '</div>' +
                                            '</div>' +
                                        '</aside>' +
                                        '<section>' +
                                            '<p class="content">'+content+'</p>' +
                                            '<p class="nick">'+nickName+'</p>' +
                                        '</section>' +
                                    '</div>' +
                                '</div>' +
                            '</a>' +
                            '</li>';

                    }
                    else if (body[i].type == 1)/*视频*/
                    {
                        list+=
                            '<li>' +
                            '<a class="anchor" href="'+target+'">' +
                            '<div class="item-content">' +
                            '<span class="img-wp video">' +
                            '<img src="'+guessImg+'">' +
                            '</span>' +
                            '</div>' +
                            '<div class="item-info">' +
                            '<div class="info-box">' +
                            '<aside>' +
                            '<div class="qc-avatar">' +
                            '<div class="avatar-box">' +
                            '<img src="'+avatar+'">' +
                            '</div>' +
                            '</div>' +
                            '</aside>' +
                            '<section>' +
                            '<p class="content">'+content+'</p>' +
                            '<p class="nick">'+nickName+'</p>' +
                            '</section>' +
                            '</div>' +
                            '</div>' +
                            '</a>' +
                            '</li>';
                    }
                    else if (body[i].type == 2)
                    {
                        list+=
                            '<li>' +
                            '<a class="anchor" href="'+target+'">' +
                            '<div class="item-content">' +
                            '<span class="img-wp">' +
                            '<img src="'+guessImg+'">' +
                            '</span>' +
                            '</div>' +
                            '<div class="item-info">' +
                            '<div class="info-box">' +
                            '<aside>' +
                            '<div class="qc-avatar">' +
                            '<div class="avatar-box">' +
                            '<img src="'+avatar+'">' +
                            '</div>' +
                            '</div>' +
                            '</aside>' +
                            '<section>' +
                            '<p class="content">'+content+'</p>' +
                            '<p class="nick">'+nickName+'</p>' +
                            '</section>' +
                            '</div>' +
                            '</div>' +
                            '</a>' +
                            '</li>';
                    }
                }

                $(elementId).append(list);
            },
            error:function()
            {
                //common.showInfo('无法获取话题数据!');
            }
        });
    };

    var handleCheer = function(elementId,inputId)
    {
        $(elementId).on('tap',function(e)
        {
            e.preventDefault();

            var num = $(inputId).val();

            if(!num || isNaN(num) || num <= 0 )
            {
                common.showInfo('请输入有效的数字', null, 1500);
                return;
            }


            var data='{"cheer_score_num":"'+num+'","user_id":"'+userId+'"}';

            $.ajax({
                url: "/activity/handle_cheer_for_olympic.html?t=" + tokenId,
                type: "post",
                data: data,
                dataType: "json",
                success: function (response)
                {
                    if (response.result_code == 0)
                    {
                        common.showInfo('加油成功！','success');
                        setTimeout(function()
                        {
                            window.location.reload();

                        },2000);
                    }
                    else
                    {
                        common.showErrorCodeInfo(response.result_code);
                    }

                },
                error:function()
                {
                    common.showInfo('无法连接服务器!', null, 1500);
                }
            });

        });
    };

    var anchorAppend = function(elementId, page)
    {
        $(elementId).attr('href', page + '?t=' + tokenId + '&user_id=' +userId + '&client=' +clientId);
    };

    var initShareEvent = function(elementId, maskId)
    {
        $(elementId).on('tap',function(e)
        {
            e.preventDefault();

            /*client 0 app, 1:wechat 2:weibo*/
            if(clientId=="0")
            {
                window.location.href="htttp://www.uguess.me:8080/event.htm?request_type=5";
                return;
            }
            /*微信客户端，弹出层引导点击菜单分享*/
            if(userAgent == "MicroMessenger")
            {
                $(maskId).show();
            }
            else if(userAgent == "Weibo")
            {
                common.showInfo("暂并不支持微博客户端分享!",null, 1500);
            }
            else
            {
                common.showInfo("请使用app客户端,微信或微博客户端分享!",null, 1500);
            }

        });
    };

    var shareTimeLine = function(elementId)
    {
        $(elementId).on('tap',function(e)
        {
            $(elementId).hide();
            e.preventDefault();
        });
    };

    /*奥运奖牌榜*/
    var showMedals = function ()
    {

    };

    return {
        anchorAppend:anchorAppend,
        getCheerState:getCheerState,
        getTopicList:getTopicList,
        getFriendCheerList:getFriendCheerList,
        getRankList:getRankList,
        handleCheer:handleCheer,
        initShareEvent:initShareEvent,
        shareTimeLine:shareTimeLine,
        showMedals:showMedals
    }

});