$( window ).on( "orientationchange", function( event ) {
    setLandscape(true)
});
function setLandscape(inverse){
    if((screen.availHeight > screen.availWidth && !inverse) || (screen.availHeight < screen.availWidth && inverse)){
        $("#landscape-frame").attr("hidden",false);
    }else{
        $("#landscape-frame").attr("hidden",true);
    }
}
