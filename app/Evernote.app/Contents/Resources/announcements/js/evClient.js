(function(document, window, undefined) {
    var EV = window.EV || {};

    var defaultResultSpec = {includeTitle:true, includeAttributes:true, includeCreated:true,
        includeUpdated:true, includeTagGuids:true, includeLargestResourceMime:true,
        includeContentLength:true, includeNotebookGuid:true, includeLargestResourceSize:true,
        includeSnippetFile:true, includeCardThumbnailFile:true};
    EV.isClient = true;
    EV.isWinClient = navigator.platform.indexOf("Mac") === -1;
    EV.ready = function() {
        var readyDfd = $.Deferred();
        $(document).ready(function() {
            readyDfd.resolve();
        });
        return readyDfd.promise();
    };

    EV.openNotes = function (notesUIDArray, title, appIdForReturn) {
        if (Evernote.openNotes != null) {
            Evernote.openNotes(JSON.stringify(notesUIDArray), title, appIdForReturn);
        }
    };
    EV.setBadgeCount = function(num){
        if (!EV.isWinClient) {
            Evernote.setBadgeCount(num);
        }
    };
    EV.fetchENEXFileToAccount = function(url) {
        var dfd = $.Deferred();
        var callback = function() {
            console.log("fetchENEX success");
            dfd.resolve();
        };
        var errorCallback = function(error) {
            console.log("fetchENEX fail", error);

            dfd.reject(error);
        };
        Evernote.fetchENEXFileToAccount(url, callback,errorCallback );
        return dfd.promise();
    };

    EV.getAnnouncementsFeedURL = function() {
        if (!EV.isWinClient) {
            return Evernote.getAnnouncementsFeedURL();
        }
        return "";
    };
    EV.findNotesMetadataAsync = function (noteFilter, startIndex, numberOfObjects, resultSpec) {
        var dfd = $.Deferred();
        if (resultSpec == null) {
            resultSpec = defaultResultSpec;
        }
        var callback = function(result) {
            var hydrated = JSON.parse(result);
            console.log(hydrated);

            dfd.resolve(hydrated);
        };
        Evernote.findNotesMetadataAsync(JSON.stringify(noteFilter), startIndex,
            numberOfObjects, JSON.stringify(resultSpec),
            callback);

        return dfd.promise();
    };
    EV.getVisibilityState = function() {
        var result = JSON.parse(Evernote.getVisibilityState());
        return result;
    };
    EV.getNote = function(uid) {
        return JSON.parse(Evernote.getNote(uid));
    };
    EV.getCurrentPosition = function(successFunc, errorFunc) {
        if(navigator.platform.indexOf("Mac") >= 0) {
            Evernote.getCurrentPosition(successFunc, errorFunc);
        } else {
            navigator.geolocation.getCurrentPosition(successFunc, errorFunc);
        }
    };
    if (navigator.platform.indexOf("Mac") >= 0) {
        // mac has custom local storage, windows doesn't
        EV.localStorage = Evernote.localStorage;
    } else {
        EV.localStorage = localStorage;
    }

    var getLanguage = function(){
        var lang = "en";
        if (Evernote.getLanguage != null){
            lang = Evernote.getLanguage();
        }
        if (lang ==="English") {
            lang = "en";
        } else if (lang === "zh-Hans") {
            lang = "zh-cn";
        } else if (lang === "zh-Hant") {
            lang = "zh-tw";
        } else if (lang === "pt-PT") {
            lang = "pt-br";
        } else if (lang === "pt") {
            lang = "pt-br";
        }

        var filepath = "js/i18n/i18n" + ( lang === "en" ? "" : "-" + lang) + ".js";
        document.write('<script src="' + filepath + '"></script>');
        return lang;
    };
//    EV.lang = getLanguage();
    EV.recordNavigationState = function(attributeDict) {
        var attributeJson = JSON.stringify(attributeDict);
        Evernote.recordNavigationState(attributeJson);
    };

    EV.events = {};
    EV.events.onRestoreNavigationState = {};
    EV.events.onRestoreNavigationState.addListener = function(aFunc) {
        Evernote.events.onRestoreNavigationState.addListener(aFunc);
    };


    window.EV = EV;
})(document, window);


