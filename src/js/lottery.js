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

    $(function()
    {
        var $btn = $('.lottery-btn');
        var $priseList = $('.qc-lottery-list > li:not(".lottery-btn")');

        Lottery.init({
            $priseList: $priseList,
            $btn: $btn,
            btnImgStart:'img/lottery/lottery_btn_start.png',
            btnImgWait:'img/lottery/lottery_btn_wait.png'
        });

        $btn.on('start',function()
        {
            Lottery.start();
        });
        $btn.on('stop',function(e,target)
        {

            Lottery.stop(target);
        });

        $btn.tap(function(e)
        {
            var $this = $(this);
            $this.trigger('start');
            setTimeout(function()
            {
                $btn.trigger('stop',[6]);
            },3000);

            /*if(!$this.data("active"))
             {
             $this.trigger('start');
             $this.data("active", true);
             }
             else
             {
             $this.trigger('stop');
             $this.data("active", false);
             }*/

            e.preventDefault();
        });


        /*弹出窗*/
        var $chooseAreaDialog = $.dialog({
            dialogClass:'qc-dialog qc-dialog-no-button',
            showTitle:true,
            titleText:'请选择您所在的区域',
            contentHtml:'<ul class="qc-dialog-area-list">' +
            '<li data-area="0">出发区</li>' +
            '<li data-area="1">到达区</li>' +
            '</ul>'
        });

        $(document).on('tap','.qc-dialog-area-list > li',function(e)
        {
            $chooseAreaDialog.dialog.close();
            e.preventDefault();
        });

        var priseDialog;

        $(document).on('tap', '.qc-lottery-list > li:not(".lottery-btn")' ,function(e)
        {
            var index = $(this).data('index');

            priseDialog = showPriseDialog(index);
            e.preventDefault();
        });

        $(document).on('tap', '.qc-dialog .btn-close',function(e)
        {
            if(priseDialog)
            {
                priseDialog.dialog.close();
            }

            e.preventDefault();
        });

        function showPriseDialog(index)
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
                '</div>'

            });

            return $priseDialog;

        }

    });

});

