$( window ).on( "orientationchange", function( event ) {
    setTimeout(setLandscape(true),50)
});
function setLandscape(inverse){
    if (window.matchMedia("(orientation: landscape)").matches) {
        // you're in LANDSCAPE mode
        $("#landscape-frame").attr("hidden",false);
    }else{
        $("#landscape-frame").attr("hidden",true);
    }/*
    if((screen.availHeight > screen.availWidth && !inverse) || (screen.availHeight < screen.availWidth && inverse)){
        $("#landscape-frame").attr("hidden",false);
    }else{
        $("#landscape-frame").attr("hidden",true);
    }*/
}
