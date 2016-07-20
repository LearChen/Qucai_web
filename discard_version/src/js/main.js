function isEmpty(str) {
    if (str == undefined || str == null || str == "") {
        return true;
    }
    return false;
}

function isNotEmpty(str) {
    return isEmpty(str) ? false : true;
}