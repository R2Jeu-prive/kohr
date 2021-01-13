$( window ).on( "orientationchange", function( event ) {
    landscape()
});
function landscape(){
    if(window.innerHeight > window.innerWidth){
        $("#landscape-frame").attr("hidden",false);
    }else{
        $("#landscape-frame").attr("hidden",true);
    }
}
