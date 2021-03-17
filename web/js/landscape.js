$( window ).on( "orientationchange", function( event ) {
    setLandscape(true)
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
