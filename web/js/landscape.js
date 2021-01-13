$( window ).on( "orientationchange", function( event ) {
    setLandscape()
});
function setLandscape(){
    if(window.innerHeight > window.innerWidth){
        $("#landscape-frame").attr("hidden",false);
    }else{
        $("#landscape-frame").attr("hidden",true);
    }
}
