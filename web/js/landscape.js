$( window ).on( "orientationchange", function( event ) {
    setLandscape(true)
});
function setLandscape(inverse){
    if((window.innerHeight > window.innerWidth && !inverse) || (window.innerHeight < window.innerWidth && inverse)){
        $("#landscape-frame").attr("hidden",false);
    }else{
        $("#landscape-frame").attr("hidden",true);
    }
}
