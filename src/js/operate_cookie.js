//写cookie函数
//参数: name cookie的名称
//参数: value cookie的值
//过期天数是默认一天
//域路径是默认"/"
function setCookie(name, value){
	//过期天数
	var expiresDays = 1;
	setCookie(name, value, expiresDays);
}

//写cookie函数
//参数: name cookie的名称
//参数: value cookie的值
//参数: expiresDays cookie的过期天数
//域路径是默认"/"
function setCookie(name, value, expiresDays){
	//域路径
	var path = "/";
    var exp  = new Date();
    //存取三十天
    exp.setTime(exp.getTime() + expiresDays*24*60*60*1000*30);
    document.cookie = name + "="+ escape(value) + ";expires=" + exp.toGMTString() + ";path=" + path;
}

//读取cookie函数
function getCookie(name){
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) return unescape(arr[2]);
    return null;
}

//删除cookie函数
function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

