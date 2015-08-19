var EVAnnDebug = function() {
    var self = {};
    /* DO NOT SHIP WITH THIS SETTING ON */
    self.DEBUG_MODE_ENABLED = false;

    self.Setup = function() {

        if (self.DEBUG_MODE_ENABLED === false) {
            return;
        }

        /* Create warning message about debug mode */
        $("body").prepend("<div id='debug-mode-on'>DEBUG MODE ON</div>");
        var debugElement = $("#debug-mode-on");
        var debugAnimationInterval = 600;

        debugElement.fadeIn(300);
        setInterval(function() {
            $("#debug-mode-on").addClass("fadeIn");

            setTimeout(function() {
                $("#debug-mode-on").removeClass("fadeIn");
            }, debugAnimationInterval);
        }, debugAnimationInterval * 2);

        /* Set up key handlers */
        $(document).keyup(function(e) {
            if (self.DEBUG_MODE_ENABLED === false) {
                return;
            }

            switch(e.which) {
                // S -- delete seen state of an article
                case 83:
                    EVAnnModel.deleteSeenArticleState();
                    break;

                // C -- delete read state of an article
                case 67:
                    EVAnnModel.deleteReadArticleState();
                    break;

                // F -- Force full reload to server's RSS (invalidate cache)
                case 70:
                    EVAnnModel.loadFeedCacheFromServer();
                    break;

                // R -- Reload the page
                case 82:
                    var uri = $('<a href="' + location.href + '"></a>').uri();
                    if (uri.hasSearch("debug") === false) {
                        uri.addSearch("debug");
                    }
                    location.href = uri.normalize().toString();
                    location.reload(true);
                    break;

                // Q -- Exit debug mode
                case 81:
                    self.Disable();
                    break;

                default:
                    return;
            }

            e.preventDefault();
        });
    };

    self.TearDown = function() {
        if (self.DEBUG_MODE_ENABLED === true) {
            return;
        }

        /* Delete the debug mode warning */
        var debugElement = $("#debug-mode-on");
        debugElement.fadeOut(300);
        setTimeout(function() {
            debugElement.remove();
        }, 300);

        /* Unregister keybinds */
        $(document).unbind("keyup");
    };

    self.PrintInfo = function() {
        console.log("Welcome to Announcements debug mode!");
        console.log("Available keybinds:");
        console.log("  s\t\tMark an article as not recently seen");
        console.log("  c\t\tMark an article as unread");
        console.log("  f\t\tForce sync cache to server's feed");
        console.log("  r\t\tReload page");
        console.log("  q\t\tQuit debug mode");
    };

    self.Enable = function() {
        self.DEBUG_MODE_ENABLED = true;
        self.Setup();
        self.PrintInfo();
    };

    self.Disable = function() {
        var uri = $('<a href="' + location.href + '"></a>').uri();
        if (uri.hasSearch("debug") === true) {
            uri.removeSearch("debug");
        }
        location.href = uri.normalize().toString();
        self.DEBUG_MODE_ENABLED = false;
        self.TearDown();
        console.log("Exited debug mode.");
    };

    /* Initialize if there's a debug param in the URL */
    var uri = $('<a href="' + location.href + '"></a>').uri();
    if (uri.hasSearch("debug") === true) {
        self.Enable();
    }

    return self;
}();
EVAnnDebug = EVAnnDebug;

var EVAnnModel = function() {

    var self = {};
    var _readHash ={}, _visibleArticlesHash = {};
    var _pageNeedsRefresh = false;
    var _numUnviewedArticlesForBadging = 0;
    self.newlyVisible = null;

    var options = {};
    options.secsBetweenNetworkRefresh = 24 * 60 * 60; // 1 day

    // There are 2 of these:
    // 1. being shown in the view,
    // 2. a fresh one waiting for the user to look away so that it can
    //    update the view.
    var FeedCache = function() {
        this.store = {};
        this.config = {
            // rssurl: "feed.xml",
            // rssurl: "feedNumbered.xml",
            // rssurl: "feedWithAlert.xml",
            // rssurl: "http://evannounce.appspot.com/feed.xml",
            // rssurl: "https://announcements.corp.etonreve.com/custom-feed/" +
            //         "?locale=en_US&platformProduct=mac-evernote",

            // Official final redirecting magic url for US
            // rssurl: "https://evernote.com/announcements/feed.php?" +
            //         "locale=en_US&platformProduct=mac-evernote",
            // USE THIS ONE FOR PRODUCTION
            rssurl: "https://announce.evernote.com/?locale=en-US_US&" +
                    "platformProduct=mac-evernote&uid=1292",
            // rssurl: "https://announce.evernote.com/?locale=en-US_US&" +
            //         "platformProduct=mac-evernote&uid=1292",
            // rssurl: "https://evannounce.appspot.com/redirect/",
            // rssurl: "https://evernote-a.akamaihd.net/mac-evernote-en.xml",

            // This is for reflector on appengine
            // rssurl:"/custom-feed/?locale=en_US&platformProduct=mac-evernote",
            // rssurl:"/announcements/feed.php?locale=en_US&platformProduct=mac-evernote",
            placeholder: ""
        };

        if (EV.isClient && this.config.rssurl.indexOf("announce.evernote.com/") > -1) {
            // if we are the client and not using a test feed, set it to the proper feed
            this.config.rssurl = EV.getAnnouncementsFeedURL();
            console.log("using EV.getAnnouncementsFeedURL: " +  this.config.rssurl);
        }
    };

    FeedCache.prototype.getNonAlertArticles = function() {
        var result = null;
        if (this.store != null && this.store.nonAlertArticles != null) {
            result = this.store.nonAlertArticles;
        }
        return result;
    };

    FeedCache.prototype.getAlert = function() {
        var result = null;
        if (this.store != null && this.store.alertArticle != null) {
            result = this.store.alertArticle;
        }
        return result;
    };

    FeedCache.prototype.getPageLevelVal = function(key) {
        return this.store[key];
    };

    FeedCache.prototype.loadFromXML = function(data) {
        var xml = $.parseXML(data);
        var $xml = $(xml);
        var self1 = this;
        self1.store.pageTitle = self.safeFind(
                'evernote\\:pageTitle, pageTitle', $xml);
        self1.store.saveButtonText = self.safeFind(
                'evernote\\:saveButtonText, saveButtonText', $xml);
        self1.store.backButtonText = self.safeFind(
                'evernote\\:backButtonText, backButtonText', $xml);
        self1.store.savedMsg = self.safeFind(
                'evernote\\:savedMsg, savedMsg', $xml);
        self1.store.saveErrorMsg = self.safeFind(
                'evernote\\:saveErrorMsg, saveErrorMsg', $xml);
        self1.store.footerMsg = self.safeFind(
                'evernote\\:footerMsg, footerMsg', $xml);
        self1.store.readMoreMsg = self.safeFind(
                'evernote\\:readMoreMsg, readMoreMsg', $xml);
        self1.store.newMsg = self.safeFind(
                'evernote\\:newMsg, newMsg', $xml);

        self1.store.rawArticles = [];
        $xml.find("item").each(function(itemIndex) {
            var $this = $(this);
            var item = {
                read: false,
                idx: itemIndex,
                seen: false,
                title: self.safeFind("title", $this),
                link: self.safeFind("link", $this),
                id: self.safeFind('evernote\\:shortGuid, shortGuid', $this),
                author: self.safeFind("author", $this),
                description: self.safeFind("description", $this),
                descriptionImg: self.unsafeFind(
                    "evernote\\:descriptionImg, descriptionImg", $this),
                userPrivilege: self.safeFindMultipleTag(
                    'evernote\\:userPrivilege, userPrivilege', $this),
                pubDate: self.unsafeFind("pubDate", $this),
                content: self.safeFind('content\\:encoded, encoded', $this)
            };

            ["contentCategory", "contentCategoryTitle",
            "readMoreTitle", "readMoreURI",
            "applicationVersion", "enexURI",
            "sidebarCallout1URI", "sidebarCallout1Title",
            "sidebarCallout1Img", "sidebarCallout2URI",
            "sidebarCallout2Title", "sidebarCallout2Img",
            "sidebarCallout3URI", "sidebarCallout3Title",
            "sidebarCallout3Img", "ctaBrowserURI",
            "ctaBrowserTitle", "goPremiumTitle",
            "ctaAuthenticatedLinkTitle", "ctaAuthenticatedLinkURI",
            "ctaMarketProductURI", "ctaMarketProductTitle",
            "ctaMarketShopWindowImg", "ctaMarketShopWindowTitle",
            "ctaAppStoreURI", "ctaAppStoreProductTitle",
            "ctaAppStoreProductImg"].every(function(tagName) {
                var searchString = 'evernote\\:' + tagName + ', ' + tagName;
                item[tagName] = self.safeFind(searchString, $this);
                return true;
            });

            item.header = (item.contentCategoryTitle || "");
            item.contentTypeClass = (item.contentCategory || "").toLowerCase();
            item.contentTypeClass = _.str.dasherize(item.contentTypeClass);
            self1.store.rawArticles.push(item);
        });

        self1.store.rssurl = self1.config.rssurl;
    };

    FeedCache.prototype.saveToLocalStorage = function(key) {
        EV.localStorage.setItem(key, JSON.stringify(this.store));
    };

    FeedCache.prototype.loadFromLocalStorage = function(key) {
        var lsResult =  EV.localStorage.getItem(key);
        if(_.isEmpty(lsResult)) {
            console.log("loadFromLocalStorage empty");
            this.store={};
        } else {
            console.log("loadFromLocalStorage full ");
            this.store = JSON.parse(lsResult);
        }
    };

    FeedCache.prototype.loadFromClient = function() {
        var success = false;
        if (EV.isWinClient) {
            var xml = Evernote.getAnnouncementsXML();
            if (_.isEmpty(xml)) {
                this.store = {};
            } else {
                this.loadFromXML(xml);
                success = true;
            }
        }
        return success;
    };

    FeedCache.prototype.isValid = function() {
        var result = (this.store != null &&
                (this.config.rssurl === this.store.rssurl));

        return result;
    };

    FeedCache.prototype.rssFeedProm = function() {
        console.log("fetching: ", this.config.rssurl );
        /* This confuses the later parseXML call for some server headers:
         *   return $.get(this.config.rssurl,{}, null, "xml");
         * so force text instead */
        return $.get(this.config.rssurl,{}, null, "text");
    };
    FeedCache.prototype.markReadArticlesFromReadHash = function() {
        var self1 = this;
        var ids = self.getReadIds();
        $.each(ids, function(idIdx, id) {
            $.each(self1.store.nonAlertArticles, function(idx,item){
                if (item.id === id) {
                    item.read = true;
                    return false;
                }
            });
        });
    };
    FeedCache.prototype.indexOfArticle= function( shortGuid) {
        var result = -1;
        var self1 = this;
        $.each(self1.store.nonAlertArticles, function(idx,item){
            if (item.id === shortGuid) {
                result = idx;
                return false;
            }
        });
        return result;
    };
    FeedCache.prototype.indexOfNextArticle = function( shortGuid) {
        // for the next button
        var idx = this.indexOfArticle(shortGuid) +1;

        idx = Math.min(idx, (this.store.nonAlertArticles.length-1));
        return idx;
    };
    FeedCache.prototype.indexOfPrevArticle = function(shortGuid) {
        // for the prev button
        var idx = this.indexOfArticle(shortGuid) -1;

        idx = Math.max(idx, 0);
        return idx;
    };

    FeedCache.prototype.markReadArticle = function(shortGuid) {
        var itemIdx = this.indexOfArticle(shortGuid);
        var item = this.store.nonAlertArticles[itemIdx];
        _readHash[item.id] = true;
        EV.localStorage.setItem("readItems", JSON.stringify(_readHash));
    };

    FeedCache.prototype.filterArticlesByPrivilege = function() {
        var priv = JSON.parse(Evernote.getUserPrivilegeLevels());
        /* We don't consider business users premium for our usecases */
        var isPremiumUser = priv.isPremium && !priv.isBusiness;
        var isBusinessUser = priv.isBusiness;
        var isFreeUser = !priv.isPremium && !priv.isBusiness;

        this.store.rawArticles = _.filter(this.store.rawArticles, function(item) {
            if (!EV.isClient) {
                return true;
            }

            var showArticle = false;
            var premiumArticle = _.contains(item.userPrivilege, "PremiumOnly");
            var businessArticle = _.contains(item.userPrivilege, "BusinessOnly");
            var freeArticle = _.contains(item.userPrivilege, "FreeOnly");

            if (!isFreeUser) {
                item.goPremiumTitle = "";
            }

            if (isBusinessUser && businessArticle) {
                showArticle = true;
            }

            if (isPremiumUser && premiumArticle) {
                showArticle = true;
            }

            if (isFreeUser && freeArticle) {
                showArticle = true;
            }

            return showArticle;
        });

        this.store.nonAlertArticles = _.filter(this.store.rawArticles, function(item) {
            return item.contentCategory !== "alert";
        });
        this.store.alertArticle = _.find(this.store.rawArticles, function(item) {
            return item.contentCategory === "alert";
        });
    };

    self.FeedCache = FeedCache; // expose for unit tests

    // _feedCacheNewestNetwork is the directly updated cache from an http request.
    // _feedCacheCurrentView might be old, it is only replaced when the articles are displayed
    var _feedCacheCurrentView = new FeedCache();
    var _feedCacheNewestNetwork = new FeedCache();

    self.init = function() {
        _readHash = JSON.parse((EV.localStorage.getItem("readItems")||"{}"));
        if (EV.isWinClient) {
            self.initForWin();
        } else {
            self.initForNotWin();
        }
    };

    self.initForWin = function() {
        _visibleArticlesHash = JSON.parse((EV.localStorage.getItem("visibleArticlesHash")||"{}"));
        self.loadFeedCacheFromClient();
    };

    self.initForNotWin = function() {
        _visibleArticlesHash = JSON.parse((EV.localStorage.getItem("visibleArticlesHash")||"{}"));
        _feedCacheNewestNetwork.loadFromLocalStorage("newestNetworkFeed");

        if (!_feedCacheNewestNetwork.isValid()) {
            // if we don't have a valid cache we can try waiting for the load
            _feedCacheNewestNetwork = new FeedCache();
            var handle = $.subscribe("newestNetworkFeedUpdated", function() {
                // event from successful loadFeedCacheFromServer call
                if (self._showingOfflinePage) {
                    window.location.reload();
                }
                self.copyNetworkFeedToViewFeed();
                $.unsubscribe(handle);
            });
            self.loadFeedCacheFromServer();
        } else {
            // if we have a valid cache, show it
            self.copyNetworkFeedToViewFeed();
            self.updateCacheIfNeeded();
        }
        self.watchForNeedCacheUpdate();
        self.showNewStoriesIfHidden();
    };

    self._lastEmptyCheck = new Date();
    self._lastEmptyCheckDuration = 8; // 8 secs
    self._cacheUpdated = false;
    self._showingOfflinePage = false;

    //  next version:  Cacheing - cache 302 location check it every 24 hours,
    //        check that location every hour, make sure etag works for these requests.
    self.watchForNeedCacheUpdate = function() {

        var checkWithBackoff = function() {
            _feedCacheNewestNetwork.loadFromLocalStorage("newestNetworkFeed");
            // empty is special because there is no fall back.  we want to check it more often,
            // but back off checking the network so we don't flood it
            if (!_feedCacheNewestNetwork.isValid()) {
                var secsSinceLastTry = (new Date() - self._lastEmptyCheck) / 1000;
                if (secsSinceLastTry > self._lastEmptyCheckDuration) {
                    self._lastEmptyCheckDuration = Math.min(self._lastEmptyCheckDuration *2, 60*60*24);
                    self.updateCacheIfNeeded();
                }
            } else {
                self.updateCacheIfNeeded();
            }
        };

        // poll for new feed
        (function checkForNeedCacheUpdate() {
            setTimeout (  function() {
                checkWithBackoff();
                checkForNeedCacheUpdate();
            },10*60*1000 );  // 10 minutes
        })();


        if (EV.isClient) {
            Evernote.events.onNetworkReachabilityChanged.addListener(function(result) {
                console.log("Is network reachable:", result.networkReachable);
                if (result.networkReachable) {
                    checkWithBackoff();
                }
            });
        }
    };

    self.showNewStoriesIfHidden = function() {
        if (EV.isClient) {
            Evernote.events.onVisibilityChanged.addListener(function(state) {
                if(state != null && state.visibilityState === "hidden") {
                    // if cache has been updated, then reload page.
                    if (self._cacheUpdated) {
                        window.location.reload();
                    }
                }
            });
        }
    };

    self.copyNetworkFeedToViewFeed = function() {
        _feedCacheCurrentView.store = jQuery.extend(true, {}, _feedCacheNewestNetwork.store);
        self._cacheUpdated = false;
        _feedCacheCurrentView.filterArticlesByPrivilege();
        self.markReadArticlesFromLocalStorage();
        self.setUnviewedArticlesForBadging();
        $.publish("feedCacheCurrentViewReady");
    };

    self.getUnviewedNumberForBadging = function() {
        return _numUnviewedArticlesForBadging;
    };

    self.setUnviewedArticlesForBadging = function() {
        // assumes _feedCacheCurrentView is correct

        var alreadyShown = _.keys(_visibleArticlesHash);
        if (_.isEmpty(alreadyShown)) {
            alreadyShown = [];
        }
        var currentViewIds = _.pluck(_feedCacheCurrentView.getNonAlertArticles(), "id");

        self.newlyVisible = _.difference(currentViewIds, alreadyShown);
        console.log("current view ids", currentViewIds);
        console.log("already shown", alreadyShown);
        console.log("newly visible", self.newlyVisible);

        _numUnviewedArticlesForBadging =  self.newlyVisible.length;
    };

    self.saveShownCurrentView = function() {
        _visibleArticlesHash = JSON.parse((EV.localStorage.getItem("visibleArticlesHash")||"{}"));
        $.each(_feedCacheCurrentView.store.nonAlertArticles, function(idx,item){
            _visibleArticlesHash[item.id] = true;
        });
        EV.localStorage.setItem("visibleArticlesHash", JSON.stringify(_visibleArticlesHash));
    };

    self.updateCacheIfNeeded = function(){
        if (self.checkShouldUpdateCache()) {
            self.loadFeedCacheFromServer();
        }
    };

    self.checkShouldUpdateCache = function() {
        // check if cache is older that 1 day or never filled
        var newestNetworkFeedUpdated = JSON.parse((EV.localStorage.getItem("newestNetworkFeedUpdated")||"{}"));
        console.log("Check should update cache, last updated:", newestNetworkFeedUpdated);
        var elapsed,articlesUpdatedDate;
        var shouldUpdate = false;
        if (_.isEmpty(newestNetworkFeedUpdated)) {
            console.log("shouldUpdate true (empty)");
            shouldUpdate = true;
        } else {
            articlesUpdatedDate = new Date(Date.parse(newestNetworkFeedUpdated["date"]));
            elapsed = (new Date() - articlesUpdatedDate) / 1000;
            shouldUpdate = (elapsed > options.secsBetweenNetworkRefresh);
            console.log("shouldUpdate (elapsed) : ", shouldUpdate,articlesUpdatedDate);
        }
        return shouldUpdate;
    };

    self.getReadIds = function() {
        return _.keys(_readHash);
    };

    self.markReadArticle = function (shortGuid) {
        _feedCacheCurrentView.markReadArticle(shortGuid);
    };

    self.markReadArticlesFromLocalStorage = function() {
        _feedCacheCurrentView.markReadArticlesFromReadHash();
    };

    self.getPageLevelVal = function (key){
        return _feedCacheCurrentView.getPageLevelVal(key);
    };

    self.getArticles = function() {
        return _feedCacheCurrentView.getNonAlertArticles();
    };
    self.getAlert = function() {
        return _feedCacheCurrentView.getAlert();
    };

    self.indexInArticles = function(shortGuid) {
        return _feedCacheCurrentView.indexOfArticle(shortGuid);
    };

    self.indexOfNextArticle = function(shortGuid) {
        // for the next button
        return _feedCacheCurrentView.indexOfNextArticle(shortGuid);
    };

    self.indexOfPrevArticle = function(shortGuid) {
        // for the prev button
        return _feedCacheCurrentView.indexOfPrevArticle(shortGuid);
    };

    self.unsafeFind = function(name, $start) {
        var result = $start.find(name).text();
        if (result === "") {
            result = null;
        }
        return result;
    };

    self.safeFind = function(name, $start) {
        var urlTransformer = function(inUrl) {
            return inUrl;
        };
        var result = html_sanitize($start.find(name).text(), urlTransformer);
        if(result === "") {
            result = null;
        }
        return result;
    };

    self.safeFindMultipleTag = function(name, $start) {
        var urlTransformer = function(inUrl) {
            return inUrl;
        };
        var result = [];
        $.each($start.find(name), function() {
            result.push(html_sanitize($(this).text(), urlTransformer));
        });
        return result;
    };

    self.loadFeedCacheFromClient = function() {
        var loadSuccess = _feedCacheCurrentView.loadFromClient();

        if (loadSuccess === true) {
            _feedCacheCurrentView.filterArticlesByPrivilege();
            self.markReadArticlesFromLocalStorage();
            self.setUnviewedArticlesForBadging();
            $.publish("feedCacheCurrentViewReady");
            _pageNeedsRefresh = true;
        } else {
            EVAnnView.showOfflinePage();
        }
    };

    self.loadFeedCacheFromServer = function() {
        var feedProm = _feedCacheNewestNetwork.rssFeedProm();

        feedProm.success(function(data) {
            _feedCacheNewestNetwork.loadFromXML(data);
            _feedCacheNewestNetwork.saveToLocalStorage("newestNetworkFeed");
            EV.localStorage.setItem("newestNetworkFeedUpdated", JSON.stringify({"date":new Date()}));
            console.log("remote load success");

            $.publish("newestNetworkFeedUpdated");
            self._cacheUpdated = true;
            _pageNeedsRefresh = true;
        }).fail(function() {
            if (!_feedCacheNewestNetwork.isValid()) {
                EVAnnView.showOfflinePage();
            }
            console.log("remote load fail");
        });
    };

    /**
     * Deletes whatever element happens to be "first" for the given storage
     * key in localStorage. Usually this is used for debugging by deleting
     * the read state of some articles or such.
     *
     * @param {String} storageKey
     */
    var deleteFirstElementOfLocalStorage = function(storageKey) {
        var current = JSON.parse((EV.localStorage.getItem(storageKey) || "{}"));

        if (current != null && Object.keys(current).length > 0) {
            console.log("Deleting", Object.keys(current)[0], "from", storageKey);
            delete current[Object.keys(current)[0]];
        } else if (Object.keys(current).length <= 0) {
            console.log("No more items to delete from", storageKey);
        }

        EV.localStorage.setItem(storageKey, JSON.stringify(current));
    };

    self.deleteReadArticleState = function() {
        deleteFirstElementOfLocalStorage("readItems");
    };

    self.deleteSeenArticleState = function() {
        deleteFirstElementOfLocalStorage("visibleArticlesHash");
    };

    return self;
}();

var EVAnnView = function() {
    var self = {};
    self.$isoContainer = null;

    self.render = function() {

        self.$isoContainer = $('.do-masonry');
        self.$isoContainer.isotope({
            itemSelector : 'article',
            filter: "*",
            sortBy: "read-and-order",
            animationEngine: "jQuery",
            animationOptions: {
                duration: 0
            },
            getSortData: {
                "read-and-order" : function($elem) {
                    var read = $elem.hasClass("read");
                    var result = parseInt($elem.attr("order"),10);
                    if (read) {
                        result +=100;
                    }
                    return result;
                }
            }
        });
        $.subscribe("feedCacheCurrentViewReady", function() {
            if (EV.isClient) {
                var visState = EV.getVisibilityState();
                console.log("visState", visState, "badgeCount",
                    EVAnnModel.getUnviewedNumberForBadging());

                if (visState != null && visState.visibilityState === "hidden") {
                    EV.setBadgeCount(EVAnnModel.getUnviewedNumberForBadging());
                } else if (visState != null && visState.visibilityState === "hidden"){
                    EV.setBadgeCount(0);
                    EVAnnModel.saveShownCurrentView();
                }
            }
            self.makeHeader();
            self.makeStoryDivs();
            self.addStoryClickEvents();
            self.addSaveButtonStates();
        });
        $(document).keyup(function(event) {
            // esc key
            if (event.which === 27) {
                $('.big-story').fadeOut(300, function() {
                    $('#stories').fadeIn();
                });
            }
        });
        EVAnnModel.init();

        self.configureIsotope();
        self.addHeaderLeftClickEvents();
        self.addNextArticleClickEvent();
        self.addPrevArticleClickEvent();
        self.addGoPremiumClickEvent();
        self.addInstallClickTracking();
        self.addSidebarClickTracking();
    };

    self.configureIsotope = function() {
        /* these are the centered column overrides from the isotope centered masonry demo */
        $.Isotope.prototype._getCenteredMasonryColumns = function(){
            this.width = this.element.width();

            var parentWidth = this.element.parent().width();

            // i.e. options.masonry && options.masonry.columnWidth
            var colW = this.options.masonry && this.options.masonry.columnWidth ||
                // or use the size of the first item
                this.$filteredAtoms.outerWidth(true) ||
                // if there's no items, use size of container
                parentWidth;

            var cols = Math.floor( parentWidth / colW );
            cols = Math.max( cols, 1 );

            // i.e. this.masonry.cols = ....
            this.masonry.cols = cols;
            // i.e. this.masonry.columnWidth = ...
            this.masonry.columnWidth = colW;
        };

        $.Isotope.prototype._masonryReset = function(){
            // layout-specific props
            this.masonry = {};
            // FIXME shouldn't have to call this again
            this._getCenteredMasonryColumns();
            var i = this.masonry.cols;
            this.masonry.colYs = [];
            while (i--){
                this.masonry.colYs.push( 0 );
            }
        };

        $.Isotope.prototype._masonryResizeChanged = function() {
            var prevColCount = this.masonry.cols;
            // get updated colCount
            this._getCenteredMasonryColumns();
            return ( this.masonry.cols !== prevColCount );
        };

        $.Isotope.prototype._masonryGetContainerSize = function() {
            var unusedCols = 0,
                i = this.masonry.cols;
            // count unused columns
            while ( --i ){
                if ( this.masonry.colYs[i] !== 0 ){
                    break;
                }
                unusedCols++;
            }

            return {
                height : Math.max.apply( Math, this.masonry.colYs ),
                       // fit container to columns that have been used;
                       width : (this.masonry.cols - unusedCols) * this.masonry.columnWidth
            };
        };

    };
    self.resetView = function() {
        $("header .button.left:visible").click();
    };

    self.addSaveButtonStates = function() {
        if($('.button.save')) {
            var spinopts = {
                lines: 8,
                length: 3,
                width: 2,
                radius: 4,
                trail: 60,
                speed: 1.0,
                color: "#9a9a9a"
            };
            var spinner = new Spinner(spinopts).spin();
            $('.button.save .busy').prepend(spinner.el);

            $('.button.save').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                var removeStates = function(){
                    $this.removeClass("default");
                    $this.removeClass("busy");
                    $this.removeClass("error");
                    $this.removeClass("success");
                };
                if(EV.isClient) {
                    var saveProm = EV.fetchENEXFileToAccount($this.attr("href"));
                    removeStates();
                    $this.addClass("busy");
                    saveProm.done(function() {
                        removeStates();
                        $this.addClass("success");
                        var articleId = $this.attr("data-id");
                        var articleIndex = EVAnnModel.indexInArticles(articleId);
                        var article = EVAnnModel.getArticles()[articleIndex];
                        EVAnnView.trackEvent("save_article",
                             articleId + " " + article.title);
                    });
                    saveProm.fail(function() {
                        removeStates();
                        $this.addClass("error");
                    });
                }
            });
        }
    };

    self.addStoryClickEvents = function() {
        var $snippetTile = $(".snippet-tile");
        var $article = $("article");
        $(document).on("click",".clickable-snippet-tile", function(event) {
            // this and addClass below, diable clicking on and opening 2 stories at once
            $snippetTile.removeClass("clickable-snippet-tile");
            var id = $(this).attr("id");
            var animationEndOnce = function() {
                $("#snippet-tiles").hide();
                $(".alerts").hide();
                self.showBigStory(id);
                $(".main.home").hide();
                $(".page-footer").hide();
            };
            animationEndOnce = _.once(animationEndOnce);

            $article.one("webkitAnimationEnd", animationEndOnce);
            $article.addClass("shrink-fade-out");
            console.log("clicked:", id, event, $(this).attr("id"));
            setTimeout(function() {
                $snippetTile.addClass("clickable-snippet-tile");
            },300);
        });
    };

    self.addNextArticleClickEvent = function() {
        $(document).on("click","header .paginate .next", function() {
            self.nextArticle();
        });
    };

    self.addPrevArticleClickEvent = function() {
        $(document).on("click","header .paginate .button.previous", function() {
            self.prevArticle();
        });
    };

    self.addGoPremiumClickEvent = function() {
        $(document).on("click",".cta-premium a", function() {
            if (EV.isClient) {
                var articleId = $(this).attr("data-short-guid");
                var articleIndex = EVAnnModel.indexInArticles(articleId);
                var article = EVAnnModel.getArticles()[articleIndex];
                EVAnnView.trackEvent("go_premium",
                     articleId + " " + article.title);
                Evernote.openPremiumView($(this).attr("data-short-guid"));
            }
        });
    };

    self.addInstallClickTracking = function() {
        $(document).on("click", ".cta-evernote a", function() {
            if (EV.isClient) {
                var articleId = $(this).parents("section").first().attr("id");
                articleId = articleId.replace("big-story-", "");
                var articleIndex = EVAnnModel.indexInArticles(articleId);
                var article = EVAnnModel.getArticles()[articleIndex];
                EVAnnView.trackEvent("install_app", articleId + " " +
                    $(this).attr("href") + " " + article.title);
            }
        });
    };

    self.addSidebarClickTracking = function() {
        $(document).on("click", ".callout a", function() {
            if (EV.isClient) {
                var articleId = $(this).parents("section").first().attr("id");
                articleId = articleId.replace("big-story-", "");
                var articleIndex = EVAnnModel.indexInArticles(articleId);
                var article = EVAnnModel.getArticles()[articleIndex];
                EVAnnView.trackEvent("sidebar_click", articleId + " " +
                    $(this).attr("href") + " " + article.title);
            }
        });
    };

    self.nextArticle = function() {
        var idx = EVAnnModel.indexOfNextArticle(self.currentBigId);
        var toShow = EVAnnModel.getArticles()[idx];
        if (toShow.id === self.currentBigId) {
            return;
        }
        self.hideBigStory();
        setTimeout(function() {
            self.showBigStory(toShow.id);
        },400);
    };

    self.prevArticle = function() {
        var idx = EVAnnModel.indexOfPrevArticle(self.currentBigId);
        var toShow = EVAnnModel.getArticles()[idx];
        if (toShow.id === self.currentBigId) {
            return;
        }
        self.hideBigStory();
        setTimeout(function() {
            self.showBigStory(toShow.id);
        },400);
    };

    self.addHeaderLeftClickEvents = function() {
        $(document).on("click","header .button.left", function() {
            self.disableNavigationButtons();
            self.hideBigStory();

            setTimeout(function() {
                self.showTiles();
            }, 400);

            setTimeout(function() {
                self.enableNavigationButtons();
            }, 800);
        });
    };

    self.disableNavigationButtons = function() {
        $("a", $("header")).css("pointer-events", "none");
    };

    self.enableNavigationButtons = function() {
        $("a", $("header")).css("pointer-events", "auto");
    };

    self.currentBigId = null;
    self.showBigStory = function(elemId) {
        var id = elemId.replace("snippet-tile-", "");
        self.currentBigId = id;
        var article = EVAnnModel.getArticles()[EVAnnModel.indexInArticles(id)];
        EVAnnView.trackEvent("article_view", "" + id + " " + article.title);

        EVAnnModel.markReadArticle(id);
        var storyNum = EVAnnModel.indexInArticles(id);
        storyNum++;
        $(".paginate .current").html(storyNum);
        var $nextButton = $(".paginate .button.next");
        var $prevButton = $(".paginate .button.previous");
        if (storyNum === 1) {
            // remove arrow buttons at begining and end of stories
            $prevButton.animate({opacity:0}, 100);
            $nextButton.animate({opacity:1}, 100);
        } else if (storyNum === EVAnnModel.getArticles().length) {
            $nextButton.animate({opacity:0}, 100);
            $prevButton.animate({opacity:1}, 100);
        } else {
            $prevButton.animate({opacity:1}, 100);
            $nextButton.animate({opacity:1}, 100);
        }
        $(".paginate .total").html(EVAnnModel.getArticles().length);

        var $bigStorySection =  $("#big-story-"+id);
        $bigStorySection.show();
        var $bigStorySectionSidebar = $bigStorySection.find(".sidebar");
        $bigStorySectionSidebar.hide();

        var $bigStorySectionContent = $bigStorySection.find(".content");
        $bigStorySection.find(".content").addClass("grow-fade-in-less");
        $bigStorySectionContent.show();
        setTimeout(function() {
            $bigStorySectionSidebar.show();
            $bigStorySectionSidebar.addClass("fade-in");
        }, 320);
        self.showHeaderButtonLeft();
        self.showPaginate();

        /* and don't forget to re-scroll page to top */
        $(".scroll-content")[0].scrollTop = 0;
    };

    self.hideBigStory = function() {
        var $bigStorySection = $("section.main.article");
        var $bigStorySectionSidebar = $bigStorySection.find(".sidebar");
        $bigStorySectionSidebar.removeClass("fade-in");
        $bigStorySectionSidebar.addClass("fade-out");

        var $bigStorySectionContent = $bigStorySection.find(".content");
        $bigStorySectionContent.removeClass("grow-fade-in-less");
        $bigStorySectionContent.addClass("shrink-fade-out-less");
        setTimeout(function() {
            $bigStorySection.hide();
            $bigStorySectionContent.hide();
            $bigStorySectionSidebar.hide();
        }, 330);
    };

    self.showTiles = function() {

        EVAnnModel.markReadArticlesFromLocalStorage();
        self.sortSnippets();

        $("article").removeClass("shrink-fade-out");
        $("article").addClass("grow-fade-in");
        $(".main.home").show();

        $("#snippet-tiles").show();
        $(".alerts").show();

        $("header .paginate").fadeOut();
        $("header .button.left").fadeOut();
        $("article").one("webkitAnimationEnd", function() {
            $("article").removeClass("grow-fade-in");
            $(".page-footer").show();
        });
    };

    self.showHeaderButtonLeft = function() {
        $("header .button.left").fadeIn(333);
    };
    self.showPaginate = function() {
        $("header .paginate").fadeIn(333);
    };
    self.sortSnippets = function() {
        //update read state and sort read items to bottom
        var readIds = EVAnnModel.getReadIds();
        $.each(readIds, function(idx, id) {
            $("#snippet-tile-"+id).addClass("read");
        });
        setTimeout(function() {
            EVAnnView.$isoContainer.isotope( 'updateSortData',  $(".snippet-tile")).isotope()  ;
        },1);
    };

    self.makeHeader = function(){
        var pageHeaderTmpl = _.template($("#page-header-tmpl").html());
        var html = pageHeaderTmpl({
            "backButtonText": EVAnnModel.getPageLevelVal("backButtonText") || "Back to All"
        });
        $("header").html(html);
    };

    self.makeAlertDiv = function() {
        var alertTmpl = _.template(_.str.trim($("#alert-tmpl").html()));
        var alertData = EVAnnModel.getAlert();
        if (alertData != null) {
            var insert = alertTmpl({"item": alertData});
            $(".scroll-content").prepend(insert);
        }
    };

    self.trackEvent = function(action, label) {
        console.log("Recording Analytics Event:", action, label);
        Evernote.recordAnalyticsEventCategory("announcements", action, label);
    };

    self.addAuthenticatedUrlClickEvents = function() {
        $(document).on("click", 'a[href^="evernote-authentication-service:/"]',
                function() {

                    var path = $(this).attr('href').replace("evernote-authentication-service:", "");

                    if (EV.isClient) {
                        if (_.str.startsWith(path, "/") ) {
                            Evernote.openAuthenticatedLink(path);
                        }
                    }
                    return false;
                });
    };
    self.showOfflinePage =function() {
        EVAnnModel._showingOfflinePage = true;
        console.log("show offline page", EVAnnModel._showingOfflinePage );

        $("header").remove();
        $("footer").remove();
        $("#snippet-tiles").remove();
        $(".offline").show();
        $(".offline").find(".offline-message").html(
                Evernote.getLocalizedMessage("Announcements",
                "announcementsNoConnection") );
        $("scroll-content").remove();
    };

    self.makeStoryDivs  = function() {
        self.makeAlertDiv();
        var stories = EVAnnModel.getArticles();

        var bigStoryTmpl = _.template($("#big-story-tmpl").html());
        var storyTmpl = _.template(_.str.trim($("#story-tmpl").html()));
        var prefix = (EV.isClient && navigator.platform.indexOf("Mac") >= 0) ?
            "en_cached_20_http_" : "";

        var snippetHtml = "";
        var pageLevelVals = {};
        pageLevelVals["saveButtonText"] = EVAnnModel.getPageLevelVal("saveButtonText");
        pageLevelVals["savedMsg"] = EVAnnModel.getPageLevelVal("savedMsg");
        pageLevelVals["saveErrorMsg"] = EVAnnModel.getPageLevelVal("saveErrorMsg");
        pageLevelVals["footerMsg"] = EVAnnModel.getPageLevelVal("footerMsg");
        pageLevelVals["readMoreMsg"] = EVAnnModel.getPageLevelVal("readMoreMsg");
        pageLevelVals["newMsg"] = EVAnnModel.getPageLevelVal("newMsg");

        _.each(stories, function(story) {

            /* Decide if we need a sidebar */
            var hasSidebar = (
                !_.isEmpty(story.ctaAppStoreURI) ||
                !_.isEmpty(story.ctaBrowserURI) ||
                !_.isEmpty(story.goPremiumTitle) ||
                !_.isEmpty(story.ctaMarketShopWindowTitle) ||
                !_.isEmpty(story.ctaMarketProductTitle) ||
                !_.isEmpty(story.ctaAuthenticatedLinkURI) ||
                !_.isEmpty(story.sidebarCallout1URI) ||
                !_.isEmpty(story.sidebarCallout2URI) ||
                !_.isEmpty(story.sidebarCallout3URI)
                );

            /* Adds query parameters to outgoing urls to let the marketing team
             * do research on what is being clicked on by our clients */
            var addAnalyticsInfo = function(url) {
                var uri = $('<a href="' + url + '"></a>').uri();
                if (EV.isWinClient === true) {
                    uri.addSearch("utm_client", "windows");
                } else {
                    uri.addSearch("utm_client", "mac");
                }
                uri.addSearch("utm_medium", "announcements");
                uri.addSearch("utm_campaign", story.title);

                return uri.normalize().toString();
            };

            if (!_.isEmpty(story.ctaBrowserURI)) {
                story.ctaBrowserURI = addAnalyticsInfo(story.ctaBrowserURI);
            }

            if (!_.isEmpty(story.ctaAppStoreURI)) {
                story.ctaAppStoreURI = addAnalyticsInfo(story.ctaAppStoreURI);
            }

            if (!_.isEmpty(story.readMoreURI)) {
                story.readMoreURI = addAnalyticsInfo(story.readMoreURI);
            }

            if (!_.isEmpty(story.ctaAuthenticatedLinkURI)) {
                story.ctaAuthenticatedLinkURI =
                    addAnalyticsInfo(story.ctaAuthenticatedLinkURI);
            }

            /* Checks if the story is new and styles that */
            story.new = "";
            story.newMsg = pageLevelVals["newMsg"] || "New";
            story.readMoreMsg = pageLevelVals["readMoreMsg"] || "Read More";

            for (var i = 0; i < EVAnnModel.newlyVisible.length; i++) {
                if (story == null || story.id == null ||
                        EVAnnModel.newlyVisible[i] == null) {
                    continue;
                }

                if (EVAnnModel.newlyVisible[i] === story.id) {
                    story.new = "new";
                }
            }

            var noSidebarClass = hasSidebar ? "" : "no-sidebar";
            var insertThis = storyTmpl({"item":story});
            snippetHtml += insertThis;

            var $bigStoryDomFrag = $($.parseHTML(bigStoryTmpl({"item":story,
                "page":pageLevelVals ,
                "noSidebarClass": noSidebarClass })));

            // Replace src attributes to use cache on mac
            var images = $bigStoryDomFrag.find('img');
            for (var i = 0; i < images.length; i++) {
                var image = $(images[i]);
                var src = image.attr('src');
                if (src != null) {
                    image.attr('src', src.replace("://", "://" + prefix));
                }
            }

            $("#big-stories").append($bigStoryDomFrag);
        });

        self.addAuthenticatedUrlClickEvents();

        var $finalHtmlFrag = $($.parseHTML(snippetHtml));
        $finalHtmlFrag.find('img').each(function(){
            $(this).attr('src',
                ($(this).attr('src')).replace("://", "://"+prefix));
        });

        self.$isoContainer.isotope("insert", $finalHtmlFrag);

        self.$isoContainer.imagesLoaded(function() {
            self.$isoContainer.isotope( 'reLayout' )  ;
            if (!_.str.isBlank(pageLevelVals["footerMsg"])){
                $(".page-footer h3").html(pageLevelVals["footerMsg"]);
                $(".page-footer").show();
            } else {
                $(".page-footer").remove();
            }
        });
    };

    /* Hides the "new" flags on articles */
    self.hideNewLabels = function() {
        $(".new").removeClass("new");
    };

    return self;
}();


var EVAnnPresenter = function() {
    _.templateSettings = {
        evaluate:/<%([\s\S]+?)%>/g,
        interpolate : /\{\{(.+?)\}\}/g
    };
    var self = {};

    self.run = function() {
        EVAnnView.render();
        if (EV.isClient) {
            Evernote.events.onVisibilityChanged.addListener(function(state) {
                console.log("Visibility state is:", state.visibilityState);
                if (state != null && state.visibilityState === "visible") {
                    EV.setBadgeCount(0);
                    EVAnnModel.saveShownCurrentView();
                } else if (state != null && state.visibilityState === "hidden") {
                    EVAnnModel.setUnviewedArticlesForBadging();
                    EVAnnView.hideNewLabels();
                }
            });

            if (Evernote.events != null &&
                    Evernote.events.onResetView != null &&
                    Evernote.events.onResetView.addListener != null) {

                Evernote.events.onResetView.addListener(EVAnnView.resetView);
            }
        }
    };

    return self;
}();
EVAnnPresenter = EVAnnPresenter;
