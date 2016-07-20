var leftTime = 0;
function createXmlHttpObj() {
    var xmlHttp = null;
    try {
        // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
        // Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

function showLeftTime(tid){
	if(leftTime < 0){
		document.getElementById(tid).innerText = "竞猜结束";
	} else if(Math.floor((leftTime - 1)/3600) >= 24) {
	    document.getElementById(tid).innerText = "一天以上";
	} else {
    	document.getElementById(tid).innerText = Math.floor(leftTime/3600) + ":" + ((Math.floor(leftTime%3600/60)) >= 10 ? Math.floor(leftTime%3600/60) : "0" + Math.floor(leftTime%3600/60)) + ":" + ((Math.floor(leftTime%60)) >= 10 ? Math.floor(leftTime%60) : "0" + Math.floor(leftTime%60));
   	}
}

function setLeftTime(lt){
    leftTime = lt;
}

function blockPage(){
    //document.getElementById("pageBlocker").style.width = document.body.offsetWidth;
    //document.getElementById("pageBlresetImgSizeocker").style.height = document.body.offsetHeight;
    document.getElementById("pageBlocker").style.display = "block";
}

function showImgView(tid){
    
    document.getElementById("imgView").src = document.getElementById(tid).getAttribute("realsrc");
    //alert(document.getElementById("imgView").offsetHeight);
    //imgLoadOver();
}

function imgLoadOver(){
    //alert();
    document.getElementById("imgViewDiv").style.display = "block";
    //alert(document.body.scrollTop + ":" + screen.height + ":" + document.body.clientHeight + ":" + document.getElementById("imgView").offsetHeight);
    document.getElementById("imgViewDiv").style.top = document.body.scrollTop + (document.body.clientHeight - document.getElementById("imgView").offsetHeight) / 2;
}

function showPage(){
    document.getElementById("imgView").src = "";
    document.getElementById("pageBlocker").style.display = "none";
    document.getElementById("imgViewDiv").style.display = "none";
    
}

function showSelectPersent(selnum) {
    if(!selectAnswer){
    var colors = ["#FCE6B5","#BCE9FC","#C5FEC9","#CECFFF","#FFCEC9","#FEFACB","#FFDAE7","#E5EAFE"];
    var items = rst.body.answers;
    
    var total = 0;
    for(var i = 0;i<items.length;i++) {
        
        total += items[i].chooser_num;
    }
    total++;
    
    for (var i = 0; i < items.length; i++) {
        var colorNum = selnum > i ? i : i - 1;
        var color = (selnum == i) ? "#FC8272" : colors[colorNum];
        var itemNum = ((i == selnum) ? (items[i].chooser_num + 1) : (items[i].chooser_num));
        document.getElementById("textQprogressColorDiv" + items[i].answer_id).style.backgroundColor = color;
        document.getElementById("textQprogressColorDiv" + items[i].answer_id).style.width = (itemNum / total * 100) + "%";
    }
    
    var div = document.createElement("div");
    var table = document.createElement("table");
    table.setAttribute("width", "100%");
    table.setAttribute("border", "0");
    table.setAttribute("cellpadding", "0");
    table.setAttribute("cellspacing", "0");
    var tbody = document.createElement("tbody");
    
    for (var i = 0; i < items.length; i++) {
    	//alert();
        var colorNum = selnum > i ? i : i - 1;
        var color = (selnum == i) ? "#FC8272" : colors[colorNum];
        var itemNum = ((i == selnum) ? (items[i].chooser_num + 1) : (items[i].chooser_num));
        
        //alert();
        var newTr = document.createElement("tr");
        newTr.innerHTML = "<td><div id=\"textQprogressBarDiv" + items[i].answer_id + "\" class=\"progressBar\" " + (i==0?"" : "style=\"border-top: 1px;\"") + "><div id=\"textQprogressColorDiv" + items[i].answer_id + "\" style=\"width: " + (itemNum / total * 100) + "%; background-color: " + color + ";\"><span id=\"textQspan" + items[i].answer_id + "\" style=\"width : " + tableWidth + "\">" + items[i].answer + "</span></div></div></td>"
        tbody.appendChild(newTr);
    }
    
    table.appendChild(tbody);
    div.appendChild(table);
    aHTML = div.innerHTML;
    }
    //changeQA(qaKey);
}

function resetQImgSize(i) {
    //alert();
    var img = document.getElementById("qimg" + Math.floor(i/3) + i%3);
    var imgsizediv = document.getElementById("qimgsize" + Math.floor(i / 3) + i % 3);
    //alert("qimg" + Math.floor(i/3) + i%3);
    imgsizediv.style.height = img.width;
    imgsizediv.style.width = img.width;
    if (img.height >= img.width) {
        img.style.marginTop = 0 - (img.offsetHeight - img.offsetWidth) / 2;
    } else {
        img.width = img.width / img.height * img.width;
        img.style.marginLeft = 0 - (img.width - img.height) / 2;
    }
}

function resetImgSize(i) {
    //alert(i);
    var img = document.getElementById("img" + Math.floor(i/3) + i%3);
    //alert(img.width + ":" + img.height);
    var imgsizediv = document.getElementById("imgsize" + Math.floor(i / 3) + i % 3);
    
    imgsizediv.style.height = img.width;
    imgsizediv.style.width = img.width;
    if (img.height >= img.width) {
        img.style.marginTop = 0 - (img.offsetHeight - img.offsetWidth) / 2;
    } else {
        img.width = img.width / img.height * img.width;
        img.style.marginLeft = 0 - (img.width - img.height) / 2;
    }
}

function resetHead() {
    var img = document.getElementById("headImg");
    var imgsizediv = document.getElementById("headImgSize");
    imgsizediv.style.height = img.width;
    imgsizediv.style.width = img.width;
    if (img.height >= img.width) {
        img.style.marginTop = 0 - (img.offsetHeight - img.offsetWidth) / 2;
    } else {
        img.width = img.width / img.height * img.width;
        img.style.marginLeft = 0 - (img.width - img.height) / 2;
    }
}

function showEvidence(){
    if(rst.body.evidences == undefined || rst.body.evidences.length <= 0) {
        document.getElementById("renzheng").parentElement.removeChild(document.getElementById("renzheng"));
    } else {
        document.getElementById("renzhengImg").setAttribute("realsrc", rst.body.evidences[0].file_url);
    }
}
