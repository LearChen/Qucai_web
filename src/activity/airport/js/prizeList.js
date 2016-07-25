/*
* 我的奖品列表
* */
define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var common = require('common');
    var cookie = require('cookie');
    require('nano');

    var tokenId = cookie.get('token_id');

    var getPrizeList = function(container)
    {
        var data = {size:10};
        $.ajax({
            url: "/activity/get_won_activity_prizes.html?t=" + tokenId,
            type: "post",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (response)
            {
                if (response.result_code == 0)
                {
                    appendData(response.body, container);
                }
                else if(response.result_code ==15)
                {
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
    };

    var appendData = function(body, container)
    {

        if(!body)
        {
            return;
        }

        var temp =
            '<a href="./prize.htm?join_id={join_id}&activity_id={activity_id}">' +
                '<div class="prize-item">' +
                    '<div class="prize-pic">' +
                    '<img src="{url}">' +
                    '</div>' +
                    '<div class="prize-content">' +
                        '<h3 class="prize-title">{name}</h3>' +
                        '<p class="prize-desc">{desc}</p>' +
                    '</div>' +
                '</div>' +
            '</a>';
        var html='';

        for(var i=0; i<body.length; i++)
        {
            var prize = body[i];
            var data = {
                join_id:prize.join_id,
                activity_id:prize.activity_id,
                url:prize.icon_url,
                name:prize.prize_name,
                desc:prize.descriptions || "活动奖品"
            };

            html += nano(temp, data);

        }

        $(container).append(html);

    };

    var noData = function()
    {
        $('#prizeListCtx').addClass('no-more').removeClass('no-tip');
    };

    return{
        getPrizeList:getPrizeList
    };

});
