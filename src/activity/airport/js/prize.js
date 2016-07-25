/*
* 奖品详情
* */
define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var common = require('common');
    var cookie = require('cookie');
    require('nano');

    var tokenId = cookie.get('token_id');

    var getPrize = function()
    {
        var data = {join_id:common.getQueryString('join_id'),activity_id:common.getQueryString('activity_id')};

        $.ajax({
            url: "/activity/get_won_prize_detail.html?t=" + tokenId,
            type: "post",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (response)
            {
                if (response.result_code == 0)
                {
                    appendData(response.body);
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

    var appendData = function(body)
    {

        if(!body)
        {
            return;
        }

        var temp =
            '<div class="prize-detail-img-wp">' +
                '<div class="prize-detail-img">' +
                    '<img src="{image_url}" />' +
                '</div>' +
            '</div>' +
            '<div class="prize-detail-title">{prize_name}</div>' +
                '<div class="prize-detail-info">' +
                    '<div class="info-item">' +
                        '<span class="info-item-key">优惠内容</span>' +
                        '<span class="info-item-value">{value}</span>' +
                    '</div>' +
                '<div class="info-item">' +
                    '<span class="info-item-key">使用截止日期</span>' +
                    '<span class="info-item-value">{expire_time}</span>' +
                '</div>' +
                '<div class="info-item">' +
                    '<span class="info-item-key">状态</span>' +
                    '<span class="info-item-value">未使用</span>' +
                '</div>' +
            '</div>' +
            '<div class="prize-detail-info">' +
                '<div class="info-qr-wp">' +
                    '<div class="info-qr-text">{consume_code}</div>' +
                    '<div class="info-qr-pic">' +
                        '<img src="{qrcode}">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="qc-btn-wp">' +
                '<span class="qc-btn normal-btn">使 用</span>' +
            '</div>';

        $('#prize').html(nano(temp, body));

    };

    $(function()
    {
       getPrize();
    });

});
