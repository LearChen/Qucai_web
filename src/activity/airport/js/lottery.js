define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var common = require('common');
    var cookie = require('cookie');
    var dialog = require('dialog');
    require('nano');

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

    /*转动转盘抽奖*/
    var initGame =function(id)
    {
        var $btn = $('.lottery-btn');
        var $priseList = $('.qc-lottery-list > li:not(".lottery-btn")');

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

    /*设置抽奖信息*/
    var initLottery = function(id)
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

                    var $priseList = $('.qc-lottery-list > li:not(".lottery-btn")');

                    for(var i=0; i<lotteryOptions.length; i++)
                    {
                        var l = lotteryOptions[i];

                        var $prise = $priseList.filter('[data-index='+ i+']');
                        $prise.attr('data-id', l.option_id);
                        $prise.attr('data-imageurl', l.option_image_url);
                        $prise.attr('data-name', l.option_name);
                        $prise.attr('data-prize', l.prize_id);
                        $prise.find('img.lottery-img').attr('src', l.option_image_url);
                    }

                    /*绑定奖品详细弹窗*/
                    showPrizeDialog($priseList);

                    /*初始化转盘*/
                    initGame(id);

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

    /*执行抽奖结果*/
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

                    var joinId = body.join_id;

                    setTimeout(function()
                    {
                        Lottery.stop($target.data('index'));

                        if(isWinned)
                        {
                            setTimeout(function()
                            {

                                setTimeout(function()
                                {
                                    var $winDialog = $.dialog({
                                        dialogClass: 'qc-dialog qc-info-content qc-dialog-header-bg',
                                        type : 'alert',
                                        showTitle: true,
                                        titleText: '系统提示',
                                        contentHtml: '<div>恭喜您中奖了！<p>'+$target.data('name')+'</p></div>',
                                        onClickOk:function()
                                        {
                                            $winDialog.dialog.close();

                                            showAddress(joinId, id);

                                        }
                                    });

                                },300);


                            },5000);
                        }
                        else
                        {
                            setTimeout(function()
                            {
                                common.showDialog('系统提示','差一点就抽中了！');

                            },5000);
                        }

                    },8000);

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
        })
    };

    var showAddress = function(joinId, activityId)
    {
        $.ajax({
            url: "/user/address_list.html?t=" + cookie.get('token_id'),
            type: "post",
            dataType: "json",
            async: false,
            success: function (response)
            {
                var body = response.body;

                /*缓存提交参数*/
                $('#address-window-new, #address-window-exist').data({
                    joinId:joinId,
                    activityId:activityId
                });

                //TODO 目前没有提交确认地址接口，所以都弹出新地址
                body=null;


                /*没有地址*/
                if(!body)
                {
                    $('#address-window-new').show();
                }
                else
                {
                    var temp = '<div class="form-block">' +
                        '<input class="radio" id="{addId}" type="radio" name="add-exist" value="{addId}" {isChecked} />' +
                        '<label class="add-radio" for="{addId}">' +
                        '<span class="name">{name}</span>' +
                        '<span class="phone">{phone}</span>' +
                        '<div class="address">{address}</div>' +
                        '</label></div>';

                    $('#addressList').empty();

                    for(var i=0; i<body.length;i++)
                    {
                        var address = body[i] || {};

                        var data={
                            addId: address.id || addressId+''+i,
                            name: address.receiver || '',
                            phone: address.cell_num || '',
                            address:address.detail_address || '',
                            isChecked: address.is_default?'checked':''
                        };
                        $('#addressList').append(nano(temp,data));
                    }

                    $('#address-window-exist').show();
                }

            }
        })
    };

    var showPriseDialog = function(id, $priseList)
    {
        var $target = $priseList.filter('[data-id='+ id +']');

        var $priseDialog = $.dialog({
            dialogClass:'qc-dialog qc-dialog-no-button qc-dialog-header-bg',
            showTitle:true,
            titleText:'奖品<span class="fa fa-close btn-close"></span>',

            contentHtml:'<div class="qc-dialog-prise-detail">' +
            '<div class="qc-dialog-prise-img">'+
            '<img src="'+$target.data('imageurl')+'">' +
            '</div>' +
            '<div class="qc-dialog-prise-info">' +
            '<h4 class="prise-info-name">奖品名称：'+$target.data('name')+'</h4>' +
            '<div class="prise-info-detail">' +
            ' ' +
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

    var showAreaDialog = function(type)
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

                    //TODO id

                    var id = '57bd69f90cf2a72740307cb0';

                    /*出发区*/
                    if(area == '0')
                    {
                        if(type=='t1')
                        {
                            id = '57bd69f90cf2a72740307cb0'; /*服务类*/
                        }
                        else if(type=='t2')
                        {
                            id = '57bd69f90cf2a72740307cb0'; /*购物类*/
                        }
                        else if(type=='t3')
                        {
                            id = '57bd69f90cf2a72740307cb0'; /*美食类*/
                        }
                    }
                    else /*到达区*/
                    {
                        if(type=='t1')
                        {
                            id = '57bd69f90cf2a72740307cb0'; /*服务类*/
                        }
                        else if(type=='t2')
                        {
                            id = '57bd69f90cf2a72740307cb0'; /*购物类*/
                        }
                        else if(type=='t3')
                        {
                            id = '57bd69f90cf2a72740307cb0'; /*美食类*/
                        }
                    }

                    //TODO ceshi
                    //id = '57563a200cf2ef16f1b7cca5';

                    initLottery(id);

                    chooseAreaDialog.dialog.close();

                    e.preventDefault();
                });

            }
        });
    };

    var showPrizeDialog = function($priseList)
    {
        $(document).on('tap', '.qc-lottery-list > li:not(".lottery-btn")' ,function(e)
        {
            var id = $(this).data('id');

            showPriseDialog(id, $priseList);
            e.preventDefault();
        });
    };

    /*新收货地址确认*/
    $('#address-window-new .btn-submit').on('tap',function(e)
    {
        e.preventDefault();

        var $form = $('#address-window-new');

        var name = $form.find('input[name="name"]').val().trim();
        var phone = $form.find('input[name="phone"]').val().trim();
        var address = $form.find('textarea[name="address"]').val().trim();

        var joinId = $form.data('joinId');
        var activityId = $form.data('activityId');

        if(!name || !phone || isNaN(phone) || !address)
        {
            alert("请填写正确信息再提交！");
            return null;
        }

        var params = {join_id:joinId, activity_id:activityId, receiver:name, cell_num: phone, detail_address: address};
        $.ajax({
            url: "/activity/add_winner_address.html?t=" + cookie.get('token_id'),
            type:"post",
            dataType:"json",
            data: JSON.stringify(params),
            async:false,
            success:function(response)
            {
                if(response.result_code== 0)
                {
                    common.showDialog("系统消息","用户信息提交成功,等待接收奖品!");

                }
                else
                {
                    common.showErrorCodeInfo(response.result_code);
                }

                $('#address-window-new').hide();

            },
            error:function()
            {
                common.showInfo('暂时无法提交数据!')
            }
        });

    });

    /*已有地址确认*/
    $('#address-window-exist .btn-submit').on('tap',function(e)
    {
        e.preventDefault();

        var $form = $('#address-window-exist');
        var choose = $form.find('input[type="radio"]:checked');

        if(!choose.length)
        {
            alert("请选择地址");
            return null;
        }
        else
        {
            var $address = choose.closest('.form-block');

            var name = $address.find('.name').text().trim();
            var phone = $address.find('.phone').text().trim();
            var address = $address.find('.address').text().trim();

            var joinId = $form.data('joinId');
            var activityId = $form.data('activityId');

            var params = {join_id:joinId, activity_id:activityId, receiver:name, cell_num: phone, detail_address: address};

            $.ajax({
                url: "/user/address_list.html?t=" + cookie.get('token_id'),
                type:"post",
                dataType:"json",
                data: JSON.stringify(params),
                async:false,
                success:function(response)
                {
                    if(response.result_code== 0)
                    {
                        common.showDialog("系统消息","用户信息提交成功,等待接收奖品!");
                    }
                    else
                    {
                        common.showErrorCodeInfo(response.result_code);
                    }

                    $('#address-window-exist').hide();

                },
                error:function()
                {
                    common.showInfo('暂时无法提交数据!')
                }
            });

        }

    });


    /*打开新收货地址*/
    $('#address-window-exist #address-new').on('tap',function(e)
    {
        e.preventDefault();

        $('#address-window-exist').hide();

        $('#address-window-new').show();

    });



    $(function()
    {
        /*
        * 1.弹出窗选择区域
        * 2.初始化奖品信息，绑定奖品详情弹窗
        * 3.初始化转盘，可以抽奖
        *
        * */

        var type = common.getQueryString('type');
        showAreaDialog(type);

    });

});

