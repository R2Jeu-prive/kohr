$( window ).on( "orientationchange", function( event ) {
    setLandscape(true)
});
function setLandscape(inverse){
    if ((window.matchMedia("(orientation: landscape)").matches && !inverse) || (!window.matchMedia("(orientation: landscape)").matches && inverse)) {
        // you're in LANDSCAPE mode
        console.log("land")
        $("#landscape-frame").attr("hidden",true);
    }else{
        console.log("qsdqsdqsdqsd")
        $("#landscape-frame").attr("hidden",false);
    }
}
