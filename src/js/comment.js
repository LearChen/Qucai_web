/**
* 评论
* */
define(function(require)
{
    var $ = require('jquery');
    var tap = require('tap');
    var cookie = require('cookie');
    var common = require('common');
    require('nano');

    var token = cookie.get('token_id');
    var quizId = common.getQueryString("quiz_id");

    var replayComment = null;

    var initComment = function()
    {
        var $commentWrap = $('#qc-comment');
        var $commentIcon = $('#comment-icon');
        var $commentInput = $('#comment-input');

        $commentIcon.show();
        $commentWrap.show();
        $commentInput.show();

        getComments();

        setupForm();

    };


    /*获取评论列表*/
    var getComments = function()
    {
        var api = '/quiz/comment_list.html?t='+token;
        var data = {
            "order_by": 1,
            "size": 100,
            "quiz_id": quizId
        };

        $.ajax({
            url: api,
            data: JSON.stringify(data),
            type:"post",
            dataType:"json",
            async: false,
            success: function (response)
            {
                if(response.result_code==0)
                {
                    setComments(response.body);
                }
                else
                {

                }

            },
            error:function()
            {
                common.showInfo('无法获取评论数据!');

            }
        });
    };

    /*评论模板*/
    var commentTemp = function(replay){
        return '<li data-id="{comment_id}" data-name="{nickname}">' +
            '<div class="comment-avatar">' +
            '<div class="qc-avatar"><div class="avatar-box"><img src="{portrait_url}"></div></div></div>' +
            '<div class="comment-content">' +
            '<div class="comment-user">{nickname}' +
            (replay?"<span> 回复 </span>{parent_nickname}":"") +
            '</div>' +
            '<div class="comment-comment">{comment}</div></div></li>';
    };

    /*填充评论*/
    var setComments = function(comments)
    {
        if(!comments)
        {
            return;
        }

        var size = comments.length || 0;

        if(!size)
        {
            return;
        }


        $('#comment-icon .comment-num').text(size);

        var html = '<ul class="comment-list">';

        for(var i=0;i<size;i++)
        {
            var comment = comments[i];
            var replay = comment.parent_id || false;
            html += nano(commentTemp(replay),comment);

        }

        html+='</ul>';

        $('#qc-comment').html(html);
    };


    /*添加本地回复*/
    var addCommentLocal = function(comment_data)
    {
        var replay = comment_data.parent_id || false;
        var li = nano(commentTemp(replay),comment_data);

        var $commentList = $('#qc-comment .comment-list');
        if($commentList.length==0)
        {
            var html = '<ul class="comment-list">' + li + '</ul>';
            $('#qc-comment').html(html);
        }
        else
        {
            $commentList.append(li);
        }

        /*数据+1*/
        var $sizeDiv = $('#comment-icon .comment-num');
        var size = $sizeDiv.text();
        $sizeDiv.text(parseInt(size)+1);
    };


    /*表单事件*/
    var setupForm = function()
    {
        var $InputForm = $('#comment-input');

        $InputForm.on('click','.comment-submit',function(e)
        {
            addComment();

            e.preventDefault();
        });

        $('.guess-box-comment').on('click','.comment-list li',function(e)
        {
            var $comment = $(this);
            replayComment = $comment;
            $('#comment-input input').val("").attr("placeholder","回复"+$comment.data('name')).focus();
            $('#comment-input .input').addClass('replay');

            e.preventDefault();
        });

        $('#comment-input .input i').on('click',function(e)
        {
            replayComment = null;
            $('#comment-input input').val("").attr("placeholder","评论一下");
            $('#comment-input .input').removeClass('replay');

            e.preventDefault();
        });

    };

    /*添加评论*/
    var addComment = function()
    {
        var $btn = $('#comment-input .comment-submit');
        if($btn.hasClass('active')){
            return;
        }

        var $input = $('#comment-input input');
        var content = $input.val().trim();

        if(!content)
        {
            //common.showInfo('请输入评论信息');
            $input.focus();
            return;
        }

        var data = {
            "quiz_id": quizId,
            "comment": content
        };

        /*回复*/
        if(replayComment)
        {
            var parent_id = replayComment.data('id');
            var parent_name = replayComment.data('name');

            data = {
                "quiz_id": quizId,
                "comment": content,
                "parent_id": parent_id,
                "nickname": parent_name
            };
        }


        $btn.addClass('active');

        $.ajax({
            url: "/quiz/add_comment.html?t=" + token,
            data: JSON.stringify(data),
            type:"post",
            dataType:"json",
            async: false,
            success: function (response)
            {
                if(response.result_code==0)
                {
                    var comment_id = response.body.comment_id;

                    var comment_data = {
                        "nickname": cookie.get('nick_name'),
                        "portrait_url": cookie.get('portrait_url'),
                        "comment_id": comment_id,
                        "comment": content,
                        "create_time": Math.round(new Date().getTime())
                    };

                    if(replayComment)
                    {
                        comment_data.parent_id=replayComment.data('id');
                        comment_data.parent_nickname=replayComment.data('name')
                    }

                    addCommentLocal(comment_data);
                    $input.val("");
                }
                else
                {

                }

            },
            error:function()
            {
                common.showInfo('无法获取评论数据!');

            },
            complete:function()
            {
                setTimeout(function()
                {
                    $btn.removeClass('active');

                },1000);
            }
        });


    };

    return{

        initComment:initComment
    }

});