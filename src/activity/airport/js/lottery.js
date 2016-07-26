define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var common = require('common');
    var cookie = require('cookie');
    var dialog = require('dialog');


    var Lottery =
    {
        defaults:
        {
            $priseList:null,
            $btn:null,
            btnImgStart:"",
            btnImgWait:"",
            running:false,
            index:0,
            initSpeed:500,
            speed:500,
            maxSpeed:50,
            upStep:50,
            minSpeed:500,
            downStep:50
        },

        init:function(options)
        {
            this.options = $.extend({}, this.defaults, options);
        },

        start:function()
        {
            if(this.options.running || !this.options.$priseList)
            {
                return;
            }

            this.options.running = true;

            clearTimeout(this.fnRoll);
            this.roll(false);

            this.options.$btn.find('img').attr('src', this.options.btnImgWait);

        },

        roll:function(stop, target)
        {

            if(this.options.index>=this.options.$priseList.length)
            {
                this.options.index = 0;
            }

            this.options.$priseList.removeClass('active').filter('[data-index="'+(this.options.index++)+'"]').addClass('active');

            this.fnRoll = setTimeout(function()
            {
                Lottery.roll(stop, target);
                if(stop)
                {
                    Lottery.speedDown();
                }
                else
                {
                    Lottery.speedUp();
                }

            }, this.options.speed);

            if(stop && this.options.speed>=this.options.minSpeed)
            {
                if(this.options.index == target+1)
                {
                    clearTimeout(this.fnRoll);
                    this.options.running = false;
                    this.options.speed=this.options.initSpeed;
                    this.options.$btn.find('img').attr('src', this.options.btnImgStart);
                }

            }

        },

        speedUp:function()
        {
            if(this.options.speed >= this.options.maxSpeed)
            {
                this.options.speed-=this.options.upStep;
            }

            if(this.options.speed <= this.options.maxSpeed)
            {
                this.options.speed = this.options.maxSpeed;
            }
        },

        speedDown:function()
        {
            if(this.options.speed <= this.options.minSpeed)
            {
                this.options.speed += this.options.downStep;
            }
            if(this.options.speed >= this.options.minSpeed)
            {
                this.options.speed = this.options.minSpeed;
            }
        },

        stop:function(target)
        {
            if(!this.options.running)
            {
                return;
            }

            clearTimeout(this.fnRoll);
            this.roll(true, target);
        }

    };


    /*设置抽奖信息*/
    var getLotteryDetail = function(area, id, $priseList)
    {
        var para = {id:id};

        $.ajax({
            url: "/activity/get_activity_detail.html",
            type:"post",
            dataType:"json",
            data:JSON.stringify(para),
            async:false,
            success: function (response)
            {
                if(response.result_code == 0)
                {
                    var body = response.body;
                    var neededScore = body.needed_score_num || 0;
                    $('#beanConsume').text(neededScore);
                    Lottery.needScore = neededScore;

                    var lotteryOptions = body.lottery_options || [];

                    for(var i=0; i<lotteryOptions.length; i++)
                    {
                        var l = lotteryOptions[i];

                        var $prise = $priseList.filter('[data-index='+ i+']');
                        $prise.attr('data-id', l.option_id);
                        $prise.find('img.lottery-img').attr('src', l.option_image_url);
                    }

                }
                else
                {
                    common.showErrorCodeInfo(response.result_code);
                }

            },
            error:function()
            {
                common.showInfo('暂时无法抽奖!')
            }
        });
    };

    var runLottery = function(id, $priseList)
    {
        var para = {id:id};

        $.ajax({
            url: "/activity/lucky_lottery.html?t=" + cookie.get('token_id'),
            type: "post",
            dataType: "json",
            data:JSON.stringify(para),
            async: false,
            success:function(response)
            {
                if(response.result_code == 0)
                {
                    var score = $('#scoreBalance').text();
                    $('#scoreBalance').text(parseInt(score)-Lottery.needScore);

                    Lottery.start();
                    var body = response.body;

                    var isWinned = body.is_winned;
                    var optionId = body.option_id;

                    var $target = $priseList.filter('[data-id='+ optionId +']');

                    setTimeout(function()
                    {
                        Lottery.stop($target.data('index'));

                        if(isWinned)
                        {
                            common.showDialog('系统提示','恭喜您中奖了！');


                        }
                        else
                        {
                           common.showDialog('系统提示','差一点就抽中了！');
                        }

                    },14000);

                }
                else if (response.result_code == 20)
                {
                    alert("猜豆余额不足!");
                }

            },
            error:function()
            {
                common.showInfo('暂时无法抽奖!')
            }
        })
    };

    var init =function(area, id)
    {
        var $btn = $('.lottery-btn');
        var $priseList = $('.qc-lottery-list > li:not(".lottery-btn")');

        getLotteryDetail(area, id, $priseList);

        Lottery.init({
            $priseList: $priseList,
            $btn: $btn,
            btnImgStart:'img/lottery/lottery_btn_start.png',
            btnImgWait:'img/lottery/lottery_btn_wait.png'
        });


        $btn.tap(function(e)
        {
            if(Lottery.options.running)
            {
                return;
            }

            runLottery(id,$priseList);

            e.preventDefault();
        });

    };


    var showPriseDialog = function(index)
    {
        var $priseDialog = $.dialog({
            dialogClass:'qc-dialog qc-dialog-no-button qc-dialog-header-bg',
            showTitle:true,
            titleText:'奖品<span class="fa fa-close btn-close"></span>',

            contentHtml:'<div class="qc-dialog-prise-detail">' +
            '<div class="qc-dialog-prise-img">'+
            '<img src="img/demo/prise_detail_01.jpg">' +
            '</div>' +
            '<div class="qc-dialog-prise-info">' +
            '<h4 class="prise-info-name">优衣库大礼包</h4>' +
            '<div class="prise-info-detail">' +
            '详情介绍详情介绍详情介绍详情介绍详情介绍详情介绍详情介绍详情介绍详情介绍详情绍详情介商品 ' +
            '<a>商品外链 <i class="fa fa-angle-right"></i></a>' +
            '</div>' +
            '</div>' +
            '</div>',
            onShow:function()
            {
                var $btnClose = $($priseDialog.find('.qc-dialog .btn-close'));
                $btnClose.on('tap',function(e)
                {
                    $priseDialog.dialog.close();
                    e.preventDefault();

                });

            }

        });

        return $priseDialog;

    };

    var showAreaDialog = function()
    {
        var chooseAreaDialog = $.dialog({
            dialogClass:'qc-dialog qc-dialog-no-button',
            showTitle:true,
            titleText:'请选择您所在的区域',
            contentHtml:'<ul class="qc-dialog-area-list">' +
            '<li data-area="0">出发区</li>' +
            '<li data-area="1">到达区</li>' +
            '</ul>',
            onShow:function()
            {
                var $areaList = $(chooseAreaDialog.find('.qc-dialog-area-list > li'));
                $areaList.on('tap',function(e)
                {
                    var area = $(this).data('area');
                    chooseAreaDialog.dialog.close();
                    e.preventDefault();
                });

            }
        });
    };

    var showPrizeDialog = function()
    {
        $(document).on('tap', '.qc-lottery-list > li:not(".lottery-btn")' ,function(e)
        {
            var index = $(this).data('index');

            showPriseDialog(index);
            e.preventDefault();
        });
    };

    $(function()
    {
        /*弹出窗*/
        //showAreaDialog();
        //showPrizeDialog();

        //init(0);
        common.showInfo('暂时无法抽奖!');

    });

});

