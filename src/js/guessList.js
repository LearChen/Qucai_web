/*
* 猜题列表
* */
define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var common = require('common');
    var cookie = require('cookie');


    var topicId = common.getQueryString('topic_id');
    var m_orderNum=0;

    function getTopicList (topicId, orderBy, orderNum)
    {
        var params = '{"topic_id":'+topicId+',"order_by":"'+orderBy+'","order_num":"'+orderNum+'"}';
        var tokenId = cookie.get('tokenId');

        $.ajax({
            url: "/square/topic_quiz_list.html?t="+tokenId,
            type: "post",
            dataType: "json",
            data: params,
            async: false,
            success:function(response)
            {
                if (response.result_code == 15)
                {
                    noMoreData();
                    return;
                }

                var showInformation = "";
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
                    var guessContent = body[i].content;
                    var quizsId = body[i].quiz_id;
                    if (body[i].type == 0)
                    {
                        showInformation+='<div class="guess-item">' +
                            '<a href="./guess.htm?quiz_id='+quizsId+'">' +
                                '<div class="guess-item-pic">' +
                                    '<div class="pic-wp">' +
                                        '<img src="'+guessImg+'">' +
                                    '</div>' +
                                '</div>' +
                                '<div class="guess-item-content">' +
                                    '<span>'+guessContent+'</span>' +
                                '</div>' +
                            '</a>' +
                            '</div>';

                    }
                    else if (body[i].type == 1)/*视频*/
                    {
                        showInformation+='<div class="guess-item">' +
                            '<a href="./guess.htm?quiz_id='+quizsId+'">' +
                                '<div class="guess-item-pic">' +
                                    '<div class="pic-wp video">' +
                                        '<img src="'+guessImg+'">' +
                                    '</div>' +
                                '</div>' +
                                '<div class="guess-item-content">' +
                                    '<span>'+guessContent+'</span>' +
                                '</div>' +
                            '</a>' +
                            '</div>';
                    }
                    else if (body[i].type == 2)
                    {
                        showInformation+='<div class="guess-item">' +
                            '<a href="./guess.htm?quiz_id='+quizsId+'">' +
                                '<div class="guess-item-content">' +
                                    '<span>'+guessContent+'</span>' +
                                '</div>' +
                                '<div class="guess-item-voice">' +
                                    '<span class="voice-button"></span>' +
                                    '<span></span>' +
                                '</div>' +
                            '</a>' +
                            '</div>';
                    }
                }

                $('#guessList').append(showInformation);
                m_orderNum = body[body.length-1].order_num;

                if (body.length <10)
                {
                    noMoreData();
                }

            }
        });
    }

    function noMoreData()
    {
        $('#guessListCtx').addClass('no-more').removeClass('no-tip');
    }

    /*首次载入获取*/
    $(function()
    {
        getTopicList(topicId, "0");

        $('.more-btn').on('tap',function(e)
        {
            getTopicList(topicId, "1", m_orderNum);
            e.preventDefault();
        });

    });


});
