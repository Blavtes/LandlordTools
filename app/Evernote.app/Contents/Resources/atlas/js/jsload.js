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
        if(navigator.platform.indexOf("Win") >= 0) {
          document.write('<link rel="stylesheet" type="text/css" href="css/atlas-win.css">');
        }

    } else {

        document.write('<script src="'+dir+'js/libs/jsonrpc.js"></script>');
        filepath = "js/evBrowser.js";
    }
    if (dir != null) {
        filepath = dir+filepath;
    }
    document.write('<script src="' + filepath + '"></script>');
};
