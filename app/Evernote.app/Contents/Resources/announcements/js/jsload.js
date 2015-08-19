/* Dynamically attaches a script file based on whether we're running in a browser or a client.
 */
jsload = function(dir) {
    var filepath = "";
    if (dir == null) {dir = "";}
//    if (typeof Evernote !== "undefined") {
//        filepath = "compiledJS/clientLib.js";
//    } else {
//        filepath = "compiledJS/browserLib.js";
//    }
    if (typeof Evernote !== "undefined") {
        filepath = "js/evClient.js";
        if(navigator.platform.indexOf("Mac") < 0) {
            document.write('<link rel="stylesheet" href="css/win-override.css">');
        }

    } else {

//        document.write('<script src="'+dir+'js/vendor/jsonrpc.js"></script>');
        document.write('<link rel="stylesheet" href="css/web.css">');

        filepath = "js/evBrowser.js";
    }
    if (dir != null) {
        filepath = dir+filepath;
    }
    document.write('<script src="' + filepath + '"></script>');
};
