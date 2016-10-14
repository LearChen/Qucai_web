/*
* 首页话题
* */
define(function(require)
{
    var $ = require('jquery');
    var Swiper = require('swiper');
    require('nano');

    function getTopicDetail (topicId,elementId)
    {
        var params = {id:topicId};

        $.ajax({
            url: "/square/get_topic_detail.html",
            type: "post",
            dataType: "json",
            data: JSON.stringify(params),
            success:function(response)
            {
                if (response.result_code == 0)
                {
                    var $element = $(elementId);

                    var body = response.body;
                    var image_url = body.image_url;
                    var content = body.content;

                    $element.find('.airport-bg > img').attr('src',image_url);
                    $element.find('.airport-text > span').text(content);

                }

            }
        });
    }

    function initBanner()
    {
        var params = {"position_code": "baiyun_airport_index"};

        $.ajax({
            url: "/common/get_banner_list.html",
            type: "post",
            dataType: "json",
            data: JSON.stringify(params),
            success:function(response)
            {
                if (response.result_code == 0)
                {
                    var banners = response.body || [];

                    var $swiperBannerContent = $('#swiperBannerContent');

                    var bannerHtml = '';
                    var bannerTemp = '<div class="swiper-slide">' +
                        '<a href="lottery.htm?type={object_id}">' +
                        '<img src="{image_url}" />' +
                        '</a>' +
                        '</div>';

                    for(var i=0;i<banners.length;i++)
                    {
                        bannerHtml += nano(bannerTemp, banners[i]);
                    }

                    $swiperBannerContent.html(bannerHtml);

                    var swiperBanner = new Swiper ('#swiperBanner',
                        {
                            centeredSlides: true,
                            autoplay: 3000,
                            autoplayDisableOnInteraction: false,
                            loop: true,
                            pagination: '.swiper-pagination',
                        }
                    );

                    swiperBanner.update();

                }

            }
        });
    }

    $(function()
    {
        initBanner();

        /*白云寻宝*/
        getTopicDetail('57d967990cf22f08c26e63e3','#by_discover');

        /*航旅百科*/
        getTopicDetail('57d966b30cf22f08c26e63e1','#by_air');
    });

});
