define(function(require)
{
    var $ = require('jquery');
    var common = require('common');
    var cookie = require('cookie');
    var tap = require('tap');
    var dialog = require('dialog');
    require('nano');

    var userId = common.getQueryString('user_id') || '';
    var tokenId = common.getQueryString('t') || '';
    var clientId = common.getQueryString('client') || '';

    var server = common.isTestServer() ? common.hostName.test : common.hostName.public;
    var appGuessUrl = "htttp://"+ server + ":8080" + "/event.htm?request_type=2&guess_id=";
    var appTopicUrl = "htttp://"+ server + ":8080" + "/event.htm?request_type=3&topic_id=";

    var userAgent='';

    var pageUrl = window.location.href.split('?')[0];
    var shareLink = pageUrl+"?user_id="+cookie.get('user_id');
    var shareImg = pageUrl.substring(0, pageUrl.lastIndexOf("/")+1) + 'img/appshare.png';
    var shareTitle = "我马上就要获得奥运奖品了，请助我一臂之力！";
    var shareDesc = "请点进来助我一油之力点燃奥运奇迹！";


    /*替换地址栏链接*/
    //window.history.replaceState(null,"",shareLink);

    /*第三方显示猜题*/
    if(clientId == '0')
    {
        $('#guessQuestions').hide();
    }
    else
    {
        $('#guessQuestions').show();
    }

    /*参与过奥运题目,不显示题目，显示下载*/
    var joinNum = cookie.get('olympic_join');
    if(joinNum && !isNaN(joinNum) && parseInt(joinNum) >1 )
    {
        $('body').addClass('done');
    }

    /*猜题详情参与后返回的地址*/
    if(window.location.href.lastIndexOf('#guessQuestions') !=-1)
    {
        cookie.set('activity_from', window.location.href);
    }
    else
    {
        cookie.set('activity_from', window.location.href + "#guessQuestions");
    }

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
                        "-webkit-animation-duration":size*1.5 +'s',
                        "animation-duration":size*1.5+'s'
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
            data: "{'size':'100'}",
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

                var _list = $(elementId).find('li');

                if(_list.length >= 4)
                {

                    var h1 = _list.eq(0).outerHeight(true);
                    var h2 = _list.eq(3).outerHeight(true);

                    var height = h1 + h2*7;

                    $('#rankListWp').css({
                        //'max-height':height
                    });

                }


            },
            error:function()
            {
                common.showInfo('无法获取排行榜数据!', null, 1500);
            }
        });
    };

    var getTopicList = function(elementId,moreId,topicId, orderBy, orderNum)
    {

        if(moreId)
        {
            var moreTarget = clientId=="0" ? appTopicUrl+topicId : '../../guessList.htm?topic_id='+topicId;
            $(moreId).attr('href', moreTarget);
        }

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
                            '<p class="content">'+content+'</p>' +
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
                            '<p class="content">'+content+'</p>' +
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
                            '<span class="img-wp video">' +
                            '<img src="'+guessImg+'">' +
                            '</span>' +
                            '</div>' +
                            '<div class="item-info">' +
                            '<div class="info-box">' +
                            '<p class="content">'+content+'</p>' +
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

    var getActivityTopic = function(elementId,activityId, orderBy, orderNum)
    {

        var params = '{"activity_id":'+activityId+',"order_by":"'+orderBy+'","order_num":"'+orderNum+'","size":"4"}';

        $.ajax({
            url: "/activity/activity_quizzes_list.html?t="+tokenId,
            type: "post",
            dataType: "json",
            data: params,
            success:function(response)
            {
                if (response.result_code != 0)
                {
                    //common.showErrorCodeInfo(response.result_code);
                    $('body').addClass('done');
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
                    var target = clientId=="0" ? appGuessUrl+quizId : '../../guess.htm?quiz_id='+quizId + '&activity_id='+activityId+'&guess_from=olympic';

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
                            '<p class="content">'+content+'</p>' +
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
                            '<p class="content">'+content+'</p>' +
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
                            '<span class="img-wp video">' +
                            '<img src="'+guessImg+'">' +
                            '</span>' +
                            '</div>' +
                            '<div class="item-info">' +
                            '<div class="info-box">' +
                            '<p class="content">'+content+'</p>' +
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
        var myScore=2000;
        var leftScore = myScore;

        $.ajax({
            url: "/user/get_asset.html?t=" + tokenId,
            type:"post",
            dataType:"json",
            async: false,
            success: function (response)
            {
                /*成功*/
                if(response.result_code==0)
                {
                    var score = response.body.score_balance;

                    $('#my_score').text(score);

                    $(inputId).attr('placeholder','为中国队加油吧!你能加'+score+'桶油');

                    myScore = parseInt(score);
                    leftScore = myScore;
                }

            }
        });

        $(inputId).on('keyup',function()
        {
            var $this = $(this);
            var value = $this.val().replace(/\D/gi,'');

            if(value && parseInt(value) > myScore)
            {
                value = myScore;
            }

            $this.val(value);

            leftScore = myScore - parseInt(value);

            if(value>0)
            {
                $(elementId).addClass('active');
            }
            else
            {
                $(elementId).removeClass('active');
            }

        });

        $('.form-btns >.form-btn').on('tap',function(e)
        {
            var oldValue = parseInt($(inputId).val()) || 0;
            var plusValue = parseInt($(this).data('value')) || 0;

            var newValue = oldValue + plusValue;
            if(newValue > myScore)
            {
                newValue = myScore;
            }

            $(inputId).val(newValue);

            leftScore = myScore - newValue;

            if(newValue>0)
            {
                $(elementId).addClass('active');
            }
            else
            {
                $(elementId).removeClass('active');
            }

            e.preventDefault();
        });


        $(elementId).on('tap',function(e)
        {
            e.preventDefault();

            if(myScore == 0)
            {
                $('#showDownload').show();

                return;
            }

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
                async: false,
                success: function (response)
                {
                    if (response.result_code == 0)
                    {

                        /*微信端成功调用喊朋友来加油*/
                        if(userAgent == "MicroMessenger")
                        {
                            $('#shareTimeLine').data('cheer', true);

                            $('#btnShare').trigger('tap');

                        }
                        else
                        {
                             common.showInfo('加油成功！','success');
                             setTimeout(function()
                             {
                                window.location.reload();

                             },2000);
                        }

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

            /*client 0 app, 1:wechat 2:weibo*/
            if(clientId=="0")
            {
                window.location.href="htttp://"+ server + ":8080" + "/event.htm?request_type=5";
                return;
            }
            /*微信客户端，弹出层引导点击菜单分享*/
            if(userAgent == "MicroMessenger")
            {
                $(maskId).show();
            }
            else if(userAgent == "Weibo")
            {
                common.showInfo("暂时不支持微博客户端分享!",null, 1500);
            }
            else
            {
                //$(maskId).show();

                common.showInfo("请使用app客户端或微信客户端分享!",null, 1500);
            }

        });

        $(maskId).on('tap',function(e)
        {
            e.preventDefault();

            /*如果是加油成功后调用显示分享，刷新是刷新页面*/
            if($(this).data('cheer'))
            {
                window.location.reload();
            }
            else
            {
                $(maskId).hide();

            }
        });

    };

    /*奥运奖牌榜*/
    var showMedals = function ()
    {
        var params = '{"page_url":"http://match.2016.sina.com.cn/medals/"}';

        $.ajax({
            url: "/common/get_page_source.html",
            type:"post",
            data:params,
            dataType:"json",
            headers: {
                "Content-Type":"application/json"
            },
            success: function (response)
            {
                if(response.result_code==0)
                {
                    var pageSource = response.body.page_source;

                    var data = setMedalsData(pageSource);

                    var body = data.body;

                    if(body && body.length)
                    {

                        var li = '<li>' +
                            '<span class="list-item rank">{rank}</span>' +
                            '<span class="list-item country">' +
                            '<img src="{flag}">{country}</span>' +
                            '<span class="list-item gold">{gold}</span>' +
                            '<span class="list-item silver">{silver}</span>' +
                            '<span class="list-item copper">{copper}</span>' +
                            '<span class="list-item count">{total}</span></li>';

                        var html='';

                        for(var i=0; i<body.length; i++)
                        {
                            var d = body[i];
                            html += nano(li, d);

                        }

                        var updateTime = $('#updateTime');
                        var medalsList = $('#medalsList');

                        updateTime.text(data.update);
                        medalsList.find('ol').html(html);
                        medalsList.addClass('no-tip');

                    }
                }
                else
                {

                }
            },
            error:function()
            {

            }
        });

    };

    var setMedalsData = function (page)
    {
        var data = {
            update:'',
            body:[]
        };

        var tbody = $(page).find('.part_03 table > tbody:not(".sub_show")');
        var time = $(page).find('.part_03 .tit_no b');

        data.update=time.text();

        var size = tbody.length -1;
        size = size<10? size:10;

        for(var i=0; i<size; i++)
        {
            var _this = $(tbody[i]).find('tr.sub');
            var rank = i+1 || _this.find('.w01').text();
            var country = _this.find('.w02 > a').text();
            var flag = _this.find('.w02 > img').attr('src');
            var gold = _this.find('.w03 > a').text();
            var silver = _this.find('.w04 > a').text();
            var copper = _this.find('.w05 > a').text();
            var total = _this.find('.w06 > a').text();

            data.body.push({
                rank:rank,
                country:country,
                flag:flag,
                gold:gold,
                silver:silver,
                copper:copper,
                total:total
            });
        }

        return data;
    };

    var firstTime = function(elementId)
    {
        var is_new_user = cookie.get('is_new_user');
        if(is_new_user=="1")
        {
            $(elementId).show();
        }

        $(elementId).on('tap','a',function(e)
        {
            $(elementId).hide();
            e.preventDefault();
        });

    };

    $('#showDownload').on('tap',function(e)
    {
        if(!$(e.target).is('img'))
        {
            $('#showDownload').hide();
        }
    });

    return {
        anchorAppend:anchorAppend,
        getCheerState:getCheerState,
        getTopicList:getTopicList,
        getActivityTopic:getActivityTopic,
        getFriendCheerList:getFriendCheerList,
        getRankList:getRankList,
        handleCheer:handleCheer,
        initShareEvent:initShareEvent,
        showMedals:showMedals,
        firstTime:firstTime,

    }

});