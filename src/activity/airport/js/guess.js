/*
* 猜
* */
define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var common = require('common');
    var cookie = require('cookie');
    var Swiper = require('swiper');
    var dialog = require('dialog');
    var user = require('user');
    var RSACoder = require('RSACoder');
    var publicKey = common.getPublicKey();

    var quizId;
    var authorId;
    var answerType;
    var quizType;
    var answer, answerId, scoreNum;

    var isFinished = false; /*是否已经结束*/
    var isJoin = false;     /*当前用户是否已经参与过*/
    var userAnswer;

    var hasPhone;

    /*分享参数*/
    var pageUrl = window.location.href.split('?')[0];
    var shareTitle;
    var shareDesc;
    var shareLink;
    var shareImg = pageUrl.substring(0, pageUrl.lastIndexOf("/")+1) + 'img/uguess_logo.png';


    function getGuessDetail(quiz_id)
    {
        var queryType = cookie.get('token_id')? 5: 7;
        var data = '{"quiz_id":"'+quiz_id+'","query_type":"'+queryType+'"}';

        $.ajax({
            url: "/quiz/get_detail-1_1.html?t="+cookie.get('token_id'),
            type: "post",
            dataType: "json",
            data: data,
            success: function (response)
            {
                if(response.result_code ==0)
                {
                    authorId = response.body.user_id;
                    setGuessDetail(response.body);

                    if(window.navigator.userAgent.indexOf('MicroMessenger') !=-1)
                    {
                        var wxsdk = require('wxsdk');
                        shareLink = pageUrl+"?quiz_id=" + quizId;
                        wxsdk.share(shareTitle,shareDesc, shareLink , shareImg);
                    }

                }
                else
                {
                    common.showErrorCodeInfo(response.result_code);
                }

            },
            error:function()
            {
               // common.showInfo('无法连接服务器!');
            }
        });

    }

    function setGuessDetail(body)
    {

        if(!body)
        {
            return;
        }

        var authorName = body.nickname;
        $('#authorName').text(authorName);

        var authorAvatar = body.portrait_url;
        $('#authorAvatar').attr('src',authorAvatar);

        var authorGender = body.gender;
        $('#authorGender').addClass(authorGender==0?'female':(authorGender==1?'male':''));

        var authorGrade = body.grade;
        if(authorGrade && parseInt(authorGrade) > 1)
        {
            var gradeClass = (authorGrade==2)?'sign-vip-user':'sign-vip-company';
            $('#authorGrade').addClass(gradeClass);
        }

        var participantNum = body.participant_num || 0;
        $('#participantNum').text(participantNum);

        var publishTime = body.publish_time;
        $('#publishTime').text(publishTime);

        var guessContent = body.content;
        $('#guessContent').text(guessContent);

        shareTitle = guessContent;
        shareDesc = guessContent;

        var deadline="";
        if (body.is_finished == 1 || body.is_confirmed == 1)
        {
            isFinished = true;
            deadline = "已经结束";
        }
        else
        {
            deadline = common.getTimeInterval(body.deadline);
        }
        $('#deadline').text(deadline);

        setGuessPrizeType(body);
        setGuessResType(body);
        setGuessAnswer(body);
        setSwipers();
    }


    /*设置猜题资源内容*/
    function setGuessResType(body)
    {
        var resType = parseInt(body.type);
        var files = body.files || [];

        switch(resType)
        {
            /*图文*/
            case 0:
            {
                var size = files.length;

                if(!size || size<=0)
                {
                    var html =
                        '<li class="nothing">' +
                            '<div class="res-box">' +
                            '</div>' +
                        '</li>';

                    $('#resList').html(html);

                    break;
                }
                else
                {
                    var listClass = '';
                    var clipSize=Math.floor($(window).width());

                    if(size > 1)
                    {
                        if(size == 2 || size == 4)
                        {
                            listClass = 'list-2';
                            clipSize = Math.floor(clipSize/2);
                        }
                        else
                        {
                            listClass = 'list-3';
                            clipSize = Math.floor(clipSize/3);
                        }
                    }

                    var clip = "?imageView2/1/w/" + clipSize + "/h/" + clipSize + "/interlace/1/q/95";
                    var html = '';
                    for(var i=0; i<size;i++)
                    {
                        html+=
                            '<li class="img">' +
                            '<div class="res-box">' +
                            '<img data-index="'+i+'" src="'+common.getSourceImageUrl(files[i].file_url) + clip +'">' +
                            '</div>' +
                            '</li>';
                    }

                    $('#resList').addClass(listClass).html(html);

                    shareImg = common.getSourceImageUrl(files[0].file_url) + "?imageView2/1/w/100/h/100/interlace/1/q/95";

                    /*设置放大原始图片*/
                    var picHtml =
                        '<div class="swiper-wrapper">';

                    for(var i=0; i<size;i++)
                    {
                        picHtml+='<div class="swiper-slide">' +
                            '<img data-src="'+files[i].file_url+'" class="swiper-lazy">' +
                            '<div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>' +
                            '</div>';
                    }

                    picHtml+= '</div>' +
                        '<div class="swiper-pagination swiper-pagination-white"></div>';

                    $('#swiperPic').html(picHtml);

                }

                break;
            }
            /*视频*/
            case 1:
            {
                var html =
                    '<li class="video">' +
                        '<div class="res-box">' +
                            '<video poster="'+files[0].thumbnail_url+'" controls>' +
                            '<source src="'+files[0].file_url+'" />' +
                            '</video>' +
                        '</div>' +
                    '</li>';

                $('#resList').html(html);

                shareImg = common.getSourceImageUrl(files[0].thumbnail_url) + "?imageView2/1/w/100/h/100/interlace/1/q/95";

                break;
            }
            /*音频*/
            case 2:
            {
                var html =
                    '<li class="audio">' +
                        '<div class="res-box">' +
                            '<audio controls>' +
                            '<source src="'+files[0].file_url+'" />' +
                            '</audio>' +
                        '</div>' +
                    '</li>';

                $('#resList').html(html);

                break;
            }
            /*游戏*/
            case 3:
            {
                var html =
                    '<li class="game">' +
                        '<div class="res-box">' +
                            '<a><img src="img/game_download.png"></a>' +
                        '</div>' +
                    '</li>';

                $('#resList').html(html);

                break;
            }
            default:
            {
                var html =
                    '<li class="nothing">' +
                    '<div class="res-box">' +
                    '</div>' +
                    '</li>';

                $('#resList').html(html);

                break;
            }
        }

    }

    /*设置奖励类型*/
    function setGuessPrizeType(body)
    {
        var prizeType = parseInt(body.prize_type);

        /*0猜豆*/
        if(prizeType == 0)
        {
            var prizeValue = body.prize_value;

            var quizType = body.quiz_type;
            if(quizType == 2)/*赔率猜*/
            {
                var html =
                    '<div class="type-0">' +
                    '<span>奖池已累积<strong>'+prizeValue+'</strong>豆</span>' +
                    '</div>';

                $('#prizeType').html(html);
            }
            else if(quizType == 3)/*pk猜*/
            {
                var html =
                    '<div class="type-0">' +
                    '<span>还剩<strong>'+prizeValue+'</strong>豆可赢</span>' +
                    '</div>';

                $('#prizeType').html(html);
            }
            else
            {
                var html =
                    '<div class="type-0">' +
                    '<span>奖励<strong>'+prizeValue+'</strong>豆</span>' +
                    '</div>';

                $('#prizeType').html(html);
            }

        }
        /*红包*/
        else if(prizeType==1)
        {
            var prizeNum = body.prize_num;

            var html =
                '<div class="type-1">' +
                '<span>随机红包<strong>'+prizeNum+'</strong>个</span>' +
                '</div>';

            $('#prizeType').html(html);

        }
        /*2福利 4奖品*/
        else if(prizeType == 2 || prizeType==4)
        {
            var prizes = body.prizes;
            var prizeName = body.prize_name || prizes[0].benefit_name;

            var html =
                '<div class="type-2">' +
                '<span>奖励: <strong>'+prizeName+'</strong></span>' +
                '</div>';

            $('#prizeType').html(html);
        }
        /*自定义*/
        else if(prizeType == 3)
        {
            var reward = body.reward || body.prize_desc || "暂无";
            var punishment = body.punishment || "暂无";

            var html = '<div class="type-3">' +
                    '<section class="win">' +
                        '<div class="content">' +
                            '<span>奖励: '+reward+'</span>' +
                        '</div>' +
                    '</section>' +
                    '<section class="lose">' +
                        '<div class="content">' +
                            '<span>惩罚: '+punishment+'</span>' +
                        '</div>' +
                    '</section>' +
                '</div>';

            $('#prizeType').html(html);

        }

    }

    /*设置答案*/
    function  setGuessAnswer(body)
    {
        isJoin = body.is_join;
        userAnswer = body.user_answer;

        answerType = body.quiz_answer_type;

        /*填空题*/
        if(answerType == 0)
        {
            var html = '<div class="answer-type-0">' +
                '<div class="answer-input-area">' +
                    '<textarea placeholder="输入答案..."></textarea>' +
                '</div>' +
                '</div>';

            $('#answerType').html(html);

        }
        /*选择题*/
        else if(answerType == 1)
        {
            var answers = body.answers || [];

            var html='<div class="answer-type-1"><ol>';

            quizType = body.quiz_type;

            if(quizType == 2 || quizType == 3)/*2赔率猜, 3pk猜*/
            {
                for(var i=0; i< answers.length; i++)
                {
                    html+=
                        '<li data-answerid="'+answers[i].answer_id+'" data-bean="true">' +
                            '<div class="main">' +
                                '<span class="code">'+String.fromCharCode(i+65)+ '</span>' +
                                '<span class="answer">'+answers[i].answer+'</span>' +
                            '</div>' +
                            '<div class="aside">' +
                                '<aside>投豆</aside>' +
                            '</div>' +
                        '</li>'
                }

                $('#answerOKWP').hide();
            }
            else/*0普通猜 1即开猜*/
            {
                for(var i=0; i< answers.length; i++)
                {
                    html+=
                        '<li data-answerid="'+answers[i].answer_id+'">' +
                            '<div class="main">' +
                                '<span class="code">'+String.fromCharCode(i+65)+ '</span>' +
                                '<span class="answer">'+answers[i].answer+'</span>' +
                            '</div>' +
                            '<div class="aside">' +
                                '<i class="fa fa-check-circle-o"></i>' +
                            '</div>' +
                        '</li>'
                }
            }

            html+='</ol></div>';
            $('#answerType').html(html);

            if(isJoin && userAnswer)
            {
                $('#answerType').find('li').filter('[data-answerid='+userAnswer+']').addClass('choose');
            }

        }


        /*绑定填空题事件*/
        $(document).on('change','.qc-answer textarea', function(e)
        {
            answer = $(this).val();
            e.preventDefault();
        });

        /*绑定选择题事件*/
        $(document).on('tap','.qc-answer li', function(e)
        {
            if(isFinished)
            {
                common.showInfo('已经结束!');
                return;
            }

            if(isJoin)
            {
                common.showInfo('您已参与过!');
                return;
            }

            var $this = $(this);
            answerId = $this.data('answerid');
            $this.addClass('active').siblings('li').removeClass('active');

            if($this.data('bean'))
            {
                var d = $.dialog({
                    dialogClass:'qc-dialog qc-info-content qc-dialog-header-bg',
                    showTitle:true,
                    type:'confirm',
                    titleText:'请投注(最多5000豆)',
                    contentHtml:'<div class="qc-bean-input-wp">' +
                    '<input type="text" value="" placeholder="请输入数值">' +
                    '<div class="qc-bean-plus">' +
                    '<span class="bean-btn" data-value="50"><i class="qc-icon icon-bean"></i>+50豆</span>' +
                    '<span class="bean-btn" data-value="100"><i class="qc-icon icon-bean"></i>+100豆</span>' +
                    '<span class="bean-btn" data-value="500"><i class="qc-icon icon-bean"></i>+500豆</span>' +
                    '</div>' +
                    '</div>',
                    onShow:function()
                    {
                        var $btns = $(d.find('.bean-btn'));
                        $btns.on('tap',function(e)
                        {
                            var $input = $(d.find('input'));
                            var oldValue = $input.val() || 0;
                            var plusValue = $(this).data('value');
                            var newValue = parseInt(oldValue) + parseInt(plusValue);
                            $input.val(newValue);

                            e.preventDefault();
                        });

                    },
                    onClickOk:function()
                    {
                        scoreNum = $(d.find('input')).val();
                        $('#answerOK').trigger('tap');
                    },
                    onClickCancel:function()
                    {

                    }

                });
            }

            e.preventDefault();
        });


        /*提交答案*/
        $(document).on('tap','#answerOK',function(e)
        {
            if(isFinished)
            {
                common.showInfo('已经结束!');
                return;
            }

            if(isJoin)
            {
                common.showInfo('您已参与过!');
                return;
            }

            if(!checkUser())
            {
                return;
            }

            submitAnswer();

            e.preventDefault();
        });

    }


    /*设置翻页效果*/
    function setSwipers()
    {
        /*绑定猜题与答案交互翻页*/
        var swiperGuess = new Swiper ('#swiperGuess',
            {
                autoHeight: true,
                loop: false,
                effect:'flip'
            }
        );

        var $swiperBtns = $('.guess-btn');
        $swiperBtns.on('tap', function(e)
        {
            var $btn = $(this);
            var index = $btn.data('index');
            swiperGuess.slideTo(index);

            e.preventDefault();
        });

        swiperGuess.on('transitionEnd', function (e)
        {
            var index = (e.activeIndex)%2;
            $swiperBtns.filter('[data-index='+index+']').addClass('hide').siblings('.guess-btn').removeClass('hide');

        });

        /*绑定图片放大切换*/
        var picSwiper = new Swiper('#swiperPic',
            {
                pagination: '.swiper-pagination',
                paginationClickable: true,
                preloadImages: false,
                lazyLoading: true
            });

        $(document).on('tap', '#resList li.img img', function(e)
        {
            var index = $(this).data('index');
            $('#swiperPicWp').show();
            picSwiper.update();
            picSwiper.slideTo(parseInt(index), 0);
            e.preventDefault();
        });

        $(document).on('tap', '#swiperPic .swiper-slide', function(e)
        {
            $('#swiperPicWp').hide();
            picSwiper.update();
            e.preventDefault();
        });
    }

    /*检查用户*/
    function checkUser()
    {
        var userId = cookie.get('user_id');
        if(!authorId || !userId)
        {
            common.showDialog('出错了','未能获取用户信息,请授权后重试!');
            return false;
        }

        if(authorId == userId)
        {
            common.showDialog('系统提示','不能参与自己发起的竞猜!');
            return false;
        }

        return true;

    }

    /*获取用户答案*/
    function getUserAnswer()
    {
        /*填空题*/
        if(answerType==0)
        {
            if(!answer || answer.trim()=="")
            {
                common.showDialog('系统提示','还没输入答案哦!');
                return null;
            }

           return '{"quiz_id":"'+quizId+'", "answer":"'+answer+'"}';
        }
        /*选择题*/
        else if(answerType==1)
        {
            if(!answerId)
            {
                common.showDialog('系统提示','还没选择答案哦!');
                return null;
            }


            if(quizType == 2 || quizType == 3)/*2赔率猜, 3pk猜*/
            {

                if(!scoreNum || isNaN(scoreNum) || scoreNum<=0 || scoreNum >5000)
                {
                    common.showDialog('系统提示','投注数据无效,请重新投注!');
                    return null;
                }

                return '{"quiz_id":"'+quizId+'", "answer_id":"'+answerId+'", "score_num":"'+scoreNum+'"}';

            }
            else
            {
                return '{"quiz_id":"'+quizId+'", "answer_id":"'+answerId+'"}';
            }

        }

    }

    function submitAnswer()
    {
        var answer = getUserAnswer();
        if(!answer)
        {
            return;
        }

        $.ajax({
            url: "/quiz/web_join.html?t=" + cookie.get('token_id'),
            type: "post",
            dataType: "json",
            data: answer,
            success: function (response)
            {
                if(response.result_code==0)
                {
                    common.showInfo('竞猜成功!','success',1500);
                    isJoin = true;

                    setTimeout(function()
                    {
                        if(!hasPhone)
                        {
                            setPhone();
                        }
                    },2000);
                }
                else
                {
                    common.showErrorCodeInfo(response.result_code);
                }
            },
            error:function()
            {
                common.showInfo('无法连接服务器!');
            }
        });
    }


    var setPhone = function()
    {
        var p = $.dialog({
            dialogClass:'qc-dialog qc-info-content qc-dialog-header-bg',
            showTitle:true,
            type:'alert',
            titleText:'留下手机号便于领奖',
            buttonClass:{ok : 'no-close'},
            contentHtml: '<div class="dialog-phone-form">' +
            '<div class="form-control">' +
                '<div class="error-info"></div>' +
                '<label>手机号</label>' +
                '<input type="text" value="" placeholder="请输入手机号" id="phone" />' +
            '</div>' +
            '<div class="form-control">' +
                '<div class="error-info">*手机号不正确</div>' +
                '<label>验证码</label>' +
                '<input class="input-code" type="text" placeholder="验证码" id="code"/>' +
                '<span class="btn-code" id="btnCode">获 取</span>' +
            '</div>' +
            '</div>',

            onShow:function()
            {
                var $phone = $(p.find('#phone'));
                var $btnCode = $(p.find('#btnCode'));
                var t;
                var time=30;

                $btnCode.on('tap',function(e)
                {
                    if($btnCode.data('run'))
                    {
                        return;
                    }

                    var phoneVal = $phone.val();

                    if(!phoneVal || isNaN(phoneVal) || phoneVal.trim().length!=11)
                    {
                        alert('手机号格式不正确!');

                        return;
                    }

                    var data = {action_type:"3", cell_num:phoneVal.toString()};

                    var encryptStr = RSACoder.encryptByPublicKey(JSON.stringify(data), publicKey.exponent, publicKey.modulus);
                    user.getVerifyCode(encryptStr);


                    $btnCode.addClass('disabled').text(time + '秒后重新发送').data('run',true);

                    t = setInterval(function(){
                        if(time-- <=0)
                        {
                            clearInterval(t);
                            $btnCode.text('获 取').removeClass('disabled').data('run',false);
                            time = 30;
                        }
                        else
                        {
                            $btnCode.text(time + '秒后重新发送');
                        }
                    },1000);
                    e.preventDefault();
                });

            },

            onClickOk:function()
            {

                var phoneVal = $(p.find('#phone')).val();
                var code = $(p.find('#code')).val();

                if(!phoneVal || isNaN(phoneVal) || phoneVal.trim().length!=11)
                {
                    alert('手机号格式不正确!');
                    return;
                }

                if(!code || isNaN(code))
                {
                    alert('请填写验证码!');
                    return;
                }

                var data = {cell_num:phoneVal.toString(), verify_code:code.toString()};
                var encryptStr = RSACoder.encryptByPublicKey(JSON.stringify(data), publicKey.exponent, publicKey.modulus);

                $.ajax({
                    url: "/user/bind_phone-w.html?t=" + cookie.get('token_id'),
                    type: "post",
                    dataType: "json",
                    data: encryptStr,
                    async: false,
                    success: function (response)
                    {
                        if (response.result_code == 0)
                        {
                            alert("操作成功!感谢您的参与!");
                            cookie.set('cell_num',phoneVal);
                            hasPhone = true;
                            p.dialog.close();

                        }
                        else if(response.result_code == 1)
                        {
                            alert("请填写正确的手机号及验证码!");
                        }
                        else if(response.result_code == 7)
                        {
                            alert("该手机号已被绑定，请更换手机号!");
                        }
                        else if(response.result_code == 8)
                        {
                            alert("该手机号不存在，请更换手机号!");
                        }
                        else if(response.result_code == 9)
                        {
                            alert("验证码错误，请重新输入!");
                        }
                        else if(response.result_code == 10)
                        {
                            alert("验证码过期，请重新获取!");
                        }
                    },
                    error:function()
                    {
                        alert("连接服务器失败，请稍后重试!");
                    }
                });

            }

        });
    };


    $(function()
    {
        var cellPhone = cookie.get('cell_num');
        hasPhone = cellPhone && !isNaN(cellPhone) && cellPhone.length == 11;

        quizId = common.getQueryString("quiz_id");
        getGuessDetail(quizId);

    });

});
