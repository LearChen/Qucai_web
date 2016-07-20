+(function()
{
    var js = document.scripts;
    var base = js[js.length-1].src.substring(0,js[js.length-1].src.lastIndexOf("/")+1);

    require.config({
        baseUrl: base,
        paths: {
            'jquery': 'lib/jquery/jquery-3.0.0.min',
            'tap'   : 'plugin/tap/jquery.tap',
            'cookie': 'plugin/js.cookie/js.cookie',
            'dialog': 'plugin/dialog.js/js/dialog',
            'swiper': 'plugin/swiper/js/swiper.jquery.umd.min',
            'wxsdk' : 'wxsdk' /*微信sdk*/
        },
        map: {
           '*':{
               'css': 'lib/requirejs/require.css.min'
           }
        },
        shim: {
             tap : ['jquery'],
             dialog : ['jquery','css!plugin/dialog.js/css/dialog'],
             swiper : ['jquery','css!plugin/swiper/css/swiper.min']
        }
    });
})();
