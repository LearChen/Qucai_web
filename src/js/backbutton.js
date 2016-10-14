define(function(require) {
    var $ = require('jquery');

    var backHtml = '<div id="air_btn_back">' +
            '<a href="javascript:history.go(-1);">返回</a>' +
        '</div>';

    $(function()
    {
        $('body').append(backHtml);
    });
});