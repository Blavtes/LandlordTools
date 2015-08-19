/*jshint sub:true */
var EVAtlas = function () {
    var self = {};
    self.geocodeCache = {};
    self.scrollToTop = false;
    self._atlasUsedOnce = false;
    self._config = {"isWindowsClient": EV.isClient && navigator.platform.indexOf("Win32") >=0,
        "isMacClient": EV.isClient && navigator.platform.indexOf("Mac") >=0 };

    var _maxNotesPerQuery = 3000;
    var _maxCards = 30;
    var _lang = "en";
    if (EvHelper.getUrlVars().al != null && EvHelper.getUrlVars().al ===0) {
        _maxCards = 150;
    }

    if (EvHelper.getUrlVars().maxCards != null) {
        _maxCards = parseInt(EvHelper.getUrlVars().maxCards,10);
    }

    var _maxBigZoom = 17;
    var _minBigZoom = 2;
    var _cards = new Array(_maxCards);
    var _page;
    var _state;
    var _cardTmpl;

    var _languages = {
        undefined:   { unicodeFilter: false, requireTranslation: false, name: ""},
        "ar":   { unicodeFilter: true , requireTranslation: true , name: "Arabic"},
        "bg":   { unicodeFilter: false, requireTranslation: true , name: "Bulgarian"},
        "ca":   { unicodeFilter: false, requireTranslation: false, name: "Catalan"},
        "cz":   { unicodeFilter: false, requireTranslation: true , name: "Czech"},
        "da":   { unicodeFilter: false, requireTranslation: false, name: "Danish"},
        "de":   { unicodeFilter: false, requireTranslation: false, name: "German"},
        "el":   { unicodeFilter: true , requireTranslation: true , name: "Modern Greek"},
        "en":   { unicodeFilter: false, requireTranslation: false, name: "English"},
        "es":   { unicodeFilter: false, requireTranslation: true , name: "Spanish"},
        "eo":   { unicodeFilter: false, requireTranslation: true , name: "Estonian"},
        "et":   { unicodeFilter: false, requireTranslation: true , name: "Basque"},
        "eu":   { unicodeFilter: false, requireTranslation: true , name: "Persian"},
        "fi":   { unicodeFilter: false, requireTranslation: false, name: "Finnish"},
        "fr":   { unicodeFilter: false, requireTranslation: false, name: "French"},
        "gl":   { unicodeFilter: false, requireTranslation: true , name: "Gallengan"},
        "he":   { unicodeFilter: false, requireTranslation: true , name: "Hebrew"},
        "hr":   { unicodeFilter: false, requireTranslation: true , name: "Croatian"},
        "hu":   { unicodeFilter: false, requireTranslation: false, name: "Hungarian"},
        "id":   { unicodeFilter: false, requireTranslation: false, name: "Indonesian"},
        "it":   { unicodeFilter: false, requireTranslation: false, name: "Italian"},
        "ja":   { unicodeFilter: true , requireTranslation: true , name: "Japanese"},
        "ka":   { unicodeFilter: false, requireTranslation: true , name: "Georgian"},
        "ko":   { unicodeFilter: true , requireTranslation: true , name: "Korean"},
        "lt":   { unicodeFilter: false, requireTranslation: true , name: "Lithuanian"},
        "lv":   { unicodeFilter: false, requireTranslation: true , name: "Latvian"},
        "mn":   { unicodeFilter: false, requireTranslation: true , name: "Mongolian"},
        "ms":   { unicodeFilter: false, requireTranslation: true , name: "Malay"},
        "nl":   { unicodeFilter: false, requireTranslation: false, name: "Dutch"},
        "no":   { unicodeFilter: false, requireTranslation: false, name: "Norwegian"},
        "pa":   { unicodeFilter: false, requireTranslation: true , name: "Panjabi"},
        "pl":   { unicodeFilter: false, requireTranslation: true , name: "Polish"},
        "pt":   { unicodeFilter: false, requireTranslation: false, name: "Portuguese"},
        "pt-br":{ unicodeFilter: false, requireTranslation: false, name: "Portuguese"},
        "ro":   { unicodeFilter: false, requireTranslation: false, name: "Romanian"},
        "ru":   { unicodeFilter: true , requireTranslation: true , name: "Russian"},
        "sh":   { unicodeFilter: true , requireTranslation: true , name: "Serbian"},
        "sk":   { unicodeFilter: false, requireTranslation: true , name: "Slovak"},
        "sl":   { unicodeFilter: false, requireTranslation: true , name: "Slo"},
        "sr":   { unicodeFilter: false, requireTranslation: true , name: "Serbian"},
        "sv":   { unicodeFilter: false, requireTranslation: false, name: "Swedish"},
        "ta":   { unicodeFilter: false, requireTranslation: true , name: "Tamil"},
        "te":   { unicodeFilter: false, requireTranslation: true , name: "Telugu"},
        "th":   { unicodeFilter: false, requireTranslation: true , name: "Thai"},
        "tr":   { unicodeFilter: false, requireTranslation: false, name: "Turkish"},
        "uk":   { unicodeFilter: false, requireTranslation: true , name: "Ukrainian"},
        "ur":   { unicodeFilter: false, requireTranslation: true , name: "Urdu"},
        "zh-cn":{ unicodeFilter: true , requireTranslation: true , name: "Chinese (Simplified)"},
        "zh-tw":{ unicodeFilter: true , requireTranslation: true , name: "Chinese (Traditional)"},
        "vi":   { unicodeFilter: false, requireTranslation: true , name: "Vietnamese"}
    };

    languageRequireTranslation = function(lang) {
        lang = lang.toLowerCase();
        if (_languages[lang] == null) {
            return true;
        }
        return _languages[lang].requireTranslation;
    };

    languageUnicodeFilter = function(lang) {
        lang = lang.toLowerCase();
        if (_languages[lang] == null) {
            return true;
        }
        return _languages[lang].unicodeFilter;
    };
    self.groupNotesBySource = function(notes) {
        var food =[], hello=[], other=[];
        for(var i=0; i< notes.length;i++) {
            var note = notes[i];
            var sourceApp = note.attributes.sourceApplication;
            if (sourceApp == null) {
                other.push(note);
            } else if ( _.includes(sourceApp, "food.")) {
                food.push(note);
            } else if( _.includes(sourceApp, "hello.")) {
                hello.push(note);
            } else {
                other.push(note);
            }
        }
        return {"food":food, "hello": hello,"other":other, "all":notes};

    };
    self.retinaAppend = function() {
        var retina = L.Browser.retina ? "@2x" : "";
        return retina;
    };
    self.flyoutRowsToHTMLTable = function(rows) {
        var rowTmpl = _.template(_.trim($("#flyout-table-tmpl").html()));
        var tableHtml =rowTmpl({"rows":rows, "retina":EVAtlas.retinaAppend()});
        return tableHtml;
    };

    self.makeFlyoutTableRows = function(notes) {
        var notesByType = self.groupNotesBySource(notes);
        var hello = notesByType.hello,
            food = notesByType.food,
            other = notesByType.other,
            all = notesByType.all;

        var rows = [];
        if (hello.length >0 || food.length >0) {
            // break out to food, hello, notes and all notes
            if (other.length >0) {
                rows.push({typeId:"other", type:EV.i18n.L("Notes"), numOfType:""+other.length});
            }
            if (food.length >0) {
                rows.push({typeId:"food", type:EV.i18n.L("Food notes"), numOfType:""+food.length});
            }
            if (hello.length >0) {
                rows.push({typeId:"hello", type:EV.i18n.L("Hello notes"), numOfType:""+hello.length});
            }
            rows.push({typeId:"all", type:EV.i18n.L("View all"), numOfType:""+all.length});
        } else {
            var notesPl = all.length === 1 ?"note":"notes";
            rows.push({typeId:"all", type:EV.i18n.L("View all num "+notesPl,[all.length]), numOfType:""+all.length});
        }
        return rows;
    };

    self.makeFlyoutBoxDom =  function(height, width) {
        var tmplStr = $("#flyout-tmpl").html();
        var tmpl = _.template(_.trim(tmplStr));
        var domFlyout = $($.parseHTML(tmpl({})));
        var borderHeight = 32;
        var borderWidth = 30;
        var arrowHeight = 32;
        if (height < 32) {
            height = 32;
        }
        var midWidth = 150;
        var midHeight = height;
        // TODO: this width != null really says we have a card dialog, refactor to make explicit
        if (width != null) {
            midWidth = width - 10;
            midHeight -= 14;
        }

        var totalHeight = midHeight + borderHeight *2;
        domFlyout.css({height:totalHeight});
        var joinerHeight;
        joinerHeight = (midHeight - arrowHeight)/2;
        domFlyout.css({top:-3, left:-3,width:(borderWidth*2)+midWidth});
        domFlyout.find(".mid-left-top").css({top: borderHeight, height:joinerHeight});
        domFlyout.find(".arrow-left").css({top:borderHeight+joinerHeight});
        domFlyout.find(".mid-left-bottom").css({top: joinerHeight + arrowHeight +borderHeight,height:joinerHeight});

        domFlyout.find(".mid-right").css({height:midHeight});
        domFlyout.find(".mid-mid").css({height:midHeight, width:midWidth});
        domFlyout.find(".bottom-mid").css({width:midWidth});
        domFlyout.find(".top-mid").css({width:midWidth});

        return domFlyout;
    };

    var FLECard = function(position) {
        var defaults = {};
        this.position = position;
    };

    FLECard.prototype.createDomElement = function() {
        var cardTmpl = _.template(_.trim($("#card-tmpl-fle").html()));
        var message = (EV.i18n.L("See your notes on a map.") +
            "<p>"+
            EV.i18n.L("Atlas organizes your notes by location."));
        var subtitle = EV.i18n.L("Evernote Atlas");
        subtitle = subtitle.toLowerCase();
        var html = cardTmpl({"message":message,"subtitle": subtitle,
            "idx":"" + this.position});
        var cardFrag = $($.parseHTML(html)).attr('id', "atlas-card-" + this.position);
        cardFrag.attr("data-position", this.position);
        _page.append(cardFrag);
    };

    FLECard.prototype.show = function() {
        var card = $('#atlas-card-'+this.position);
        card.css('opacity', 1);
    };

    var Card =  function(position, options) {
        var defaults = {};
        this.options = $.extend({}, defaults, options);

        this.baseDur = 320;
        this.mapCardWidth = 304 -6; // -6 for shadow size
        this.mapCardHeight = 366 -6;
        this.state = "small";
        this.bigClusterer;

        this.setPosition(position);
        this.drawBackgroundFrame();
        this.drawSmallMap();
    };
    Card.prototype.getSelector = function() {
        var card = $('#atlas-card-'+this.position);
        return card;
    };
    Card.prototype.setOpacity = function(val) {
        var card = $('#atlas-card-'+this.position);
        card.css('opacity', val);
    };
    Card.prototype.scaleX = function(){
        return this.mapCardWidth/pageWidth();
    };

    Card.prototype.scaleY = function(){
        return this.mapCardHeight/(window.innerHeight - 150);
    };

    Card.prototype.setNotes = function(notes) {
        this.notes = this.visibleNotes = notes;
    };
    Card.prototype.getNotes = function() {
        return this.notes;
    };

    Card.prototype.setTitle = function(title) {
        this.title = title;
    };
    Card.prototype.setSuperTitle = function(superTitle) {
        if (superTitle == null){
            superTitle = EV.i18n.L("Evernote Atlas");
        }
        superTitle = superTitle.toLowerCase();
        this.superTitle = superTitle;
    };
    Card.prototype.setSuperTitleFromGeoData = function(named) {
        var idxOfGeoType = _geoTypes.indexOf(this.geoType);
        var superTitle = null;
        for(var i = idxOfGeoType + 1; i < _geoTypes.length; i++){
            var superGeoType = _geoTypes[i];
            if (superGeoType && named[superGeoType] && named[superGeoType].name){
                if (languageRequireTranslation(_lang) && !named[superGeoType].translated){
                    continue;
                }
                superTitle = named[superGeoType].name;
                break;
            }
        }

        this.setSuperTitle(superTitle);
    };

    Card.prototype.setPosition = function(position) {
        this.position = position;
    };
    Card.prototype.setGeotype = function(geoType) {
        this.geoType = geoType;
    };
    Card.prototype.drawCardHeader = function() {
        this.drawPlace();
        this.drawNumNotes();
    };

    Card.prototype.drawNumNotes = function() {
        var txt = (this.notes.length === 1 ? EV.i18n.L("num note", [this.notes.length]) : EV.i18n.L("num notes", [this.notes.length]));
        $("#subtitle-" + (this.position)).html(txt);
    };

    Card.prototype.drawPlace = function() {
        var titleDiv = $("#title-" + (this.position));
        titleDiv.html("<span>"+this.title+"</span>");
        var superTitleDiv = $("#supertitle-"+ (this.position));
        superTitleDiv.html(this.superTitle);
    };

    Card.prototype.getMarkersOfNotes = function(notes) {
        var markers = [];
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var attr = note.attributes;
            var latlng = new L.LatLng(attr.latitude, attr.longitude);
            var marker = new L.Marker(latlng, {
                _origNote:note
            });
            markers.push(marker);
        }
        return markers;
    };

    Card.prototype.triggerBigToSmallAndRemember = function () {
        this.triggerBigToSmall();
    };

    Card.prototype.triggerBigToSmall = function() {
        _state = "small";
        this.state = "small";
        if (Evernote.externalInfo != null) {
            Evernote.externalInfo.visibleNoteIds = JSON.stringify([]);
        }
        var cardBack = $('#card-back-' +  this.position);
        var card = this;
        // fade out controls
        card.toggleControls('fadeOut', 0);
        $.extend(card.bigMap.options, {
            zoomAnimation: false
        });

        // unrotate and shrink to edge on position
        var dfd = $.Deferred();
        cardBack.parent().removeClass('active');
        cardBack.parent().transition( {rotateY: '-90deg', scale:[card.scaleX(), card.scaleY()]}, this.baseDur*1.1, "ease-in",
            function() {
                // as it gets to edge on hide big map div
                cardBack.parent().hide();
                dfd.resolve();
            });

        var prom = dfd.promise();
        var mapCard = $('#atlas-card-' + this.position);
        var dfd2 = $.Deferred();
        var mapCards =$(".atlas-card");

        // show the front small card and rotate it to be flat
        prom.then(function() {
            mapCard.show();
        }).then(function() {
                reflowMapCards();
                // move back to original position
                mapCards.not(mapCard).each(function(index, el){
                    $(el).show();
                    $(el).css('opacity','0');
                    $(el).transition({opacity: 1}, card.baseDur*1.5, "linear");
                });

                //create a placeholder to keep the atlas-cards floated in the right position
                //we'll use it to calculate the now correct 'webkit-transition: translate'
                //to initially center the card
                var mapCardCopy = mapCard.clone();
                mapCardCopy.attr("id", "atlas-card-clone");
                //remove cloned webkit-transform to place correctly and make invisible
                mapCardCopy.css('-webkit-transform','');
                mapCardCopy.css("opacity", "0");
                if(EVAtlas.scrollToTop) {
                    $('body').scrollTop(0);
                } else {
                    $('body').scrollTop(parseInt(mapCard.css("top"),10) - 100);
                }
                // figure out where to append the clone
                // after the previous atlas-card unless we've cloned the 0th atlas-card
                var prevPos = parseInt(mapCard.attr("data-position"),10) - 1;
                if(prevPos >= 0){
                    mapCardCopy.insertAfter($('#atlas-card-' + prevPos));
                    mapCardCopy.width($('.atlas-card').width());
                }
                else {
                    mapCardCopy.prependTo(_page);
                }

                // calculate centered coordinates of atlas-card
                // pageOffset accounts for scrolling on page
                var posX = pageXOffset + window.innerWidth/2 - mapCard.width()/2;
                var posY = pageYOffset + window.innerHeight/2 - mapCard.height()/2;

                //calculate dx/dy from center --> destination position for webkit-transition
                var dx = posX - mapCardCopy.offset().left;
                var dy = posY - mapCardCopy.offset().top;

                //delete copy/placeholder
                mapCardCopy.remove();

                var wpy = pageYOffset + window.innerHeight/2 - $(mapCard).height()/4;
                _page.css("-webkit-perspective-origin-y", (wpy) + 'px');

                mapCard.transition({ x: dx, y: dy, rotateY: "90deg"}, 0);
                mapCard.transition({ x: 0, y: 0, rotateY: "0deg"}, card.baseDur*1.5, "ease-out", function() {
                    mapCard.removeClass("zooming").show();
                    dfd2.resolve();
                });
            });

        var prom2 = dfd2.promise();
        prom2.then(function() {
            EVAtlas.addSmallToBigClickEvent();
            $("html").css("overflow", "auto");
            // this kills windows on small to big transitions
//            card.filterBigMap("");
        });
    };

    Card.prototype.addCloseBigMapEvent = function() {
        var card = this;
//        console.log('adding close big map event');
        $('#card-back-' +  this.position).siblings(".close-button").one('click', function(event) {
//            console.log("clicked close-button");
            card.triggerBigToSmallAndRemember();
        });
    };

    Card.prototype.triggerSmallToBigAndRemember = function() {
        this.triggerSmallToBig();
//        console.log("  - recording navigation state small to big, position:", this.position);
//        EV.recordNavigationState({"state": "big","comment":  "(from triggerSmallToBig)", "cardPosition":this.position});
    };

    Card.prototype.triggerSmallToBig = function() {
        console.log("func: triggerSmallToBig");

        _state = "big";
        this.state = "big";
        var card = this;
        $("html").css("overflow", "hidden");
        if(!EVAtlas._atlasUsedOnce) {
            EV.localStorage.setItem("atlasUsedOnce", "true");
        }
        var prom;
        if (self._config.isWindowsClient) {
            prom = card.zoomToBigMapCEF1Prom();
        } else {
            prom = card.zoomToBigMapProm();
        }

        prom.then(function() {
            if (card.bigMap == null) {
                card.drawBigMap("#card-back-"+card.position, card.position);
            } else {
                $(card.bigMap._container).find('.leaflet-map-pane').addClass("leaflet-no-anim");
                card.zoomMap(true);
                card.toggleControls('fadeIn');
                $.extend(card.bigMap.options, {
                    zoomAnimation: true
                });
                $(card.bigMap._container).find('.leaflet-map-pane').removeClass("leaflet-no-anim");
            }
            $(card.bigMap._container).trigger("focus");
            $("#card-back-container-"+card.position).addClass("active");
            card.addCloseBigMapEvent();
        });
    };

    Card.prototype.initClusterer = function(isBig, map) {
        var className = "leaflet-cluster" + (isBig ? " big-map" : " small-map");

        var clusterer = new L.MarkerClusterGroup({
            maxClusterRadius: 55,
            iconCreateFunction: function (cluster){
                var count = cluster.getChildCount();
//                    console.log("icon create this:", this);
                var size = " ones";
                if (count > 9){
                    size = " tens";
                }
                if (count > 99){
                    size = " hundreds";
                }
                if (count > 999){
                    size = " thousands";
                }
                if (count === 1 && isBig) {
                    var children = cluster.getAllChildMarkers();
                    var note = children[0].options._origNote;
                    var imgHtml;
//                        console.log(note);
                    var classes = "single-pic-marker";
                    if (note.snippetFile != null) {
                        imgHtml = '<img  src="'+note.snippetFile+'">';
                        classes += " marker-snippet";
                    } else if (note.cardThumbnailFile != null) {
                        imgHtml = '<img src="img/flyout/atlas-singlenote-icon@2x.png">';
                        classes += " marker-card";
                    }

                    var singleNoteHtml = '<div class="'+classes+'">'+imgHtml+'</div>';
                    return new L.DivIcon({html: singleNoteHtml, className: "single-cluster", iconSize:38});
//                        return new L.DivIcon({ html: "<span class='cluster-count'>"+count+"</span>", className: className + size });
                } else {
                    return new L.DivIcon({ html: "<span class='cluster-count'>"+count+"</span>", className: className + size });
                }
            },
            clusterSingleMarkers: true,
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false
        });
        if (isBig) {
            this.bigClusterer = clusterer;
        }
        return clusterer;
    };

    Card.prototype.drawAllNotesOnMap = function(isBig) {
        var notes;
        if(isBig) {
            // all notes
            notes = _cards[0].notes;
        } else {
            notes = this.notes;
        }
        this.drawNotesOnMap(isBig, notes);
    };

    Card.prototype.drawNotesOnMap = function(isBig, notes) {
        var markers = this.getMarkersOfNotes(notes);
        var map = this.getBigOrSmallLeafletMap(isBig);
        var card = this;

        var afterMapLoad = function() {
            var clusterer = card.initClusterer(isBig, map);

            for (var i = markers.length - 1; i >= 0; i--) {
                clusterer.addLayer(markers[i]);
            }

            map.addLayer(clusterer);
            var getNotesFromClusterLayer = function(node) {
                if (node._childClusters == null)  {
                    // this is for single notes
                    return [node.options._origNote];
                } else if (node._childClusters.length === 0 || node._childCount === 0) {
                    // this is for parts of clusters used in recursion, including 1 size clusters
                    return _.map(node._markers, function(marker){
                        return marker.options._origNote;
                    });
                }
          
                return _.map(node._childClusters, function(child){
                    return getNotesFromClusterLayer(child);
                });
            };

            var openClusterFlyout = function(event) {
                if( _state === "small" ){
                    // opens map card
                    $('#'+event.target._map._container.offsetParent.id).click();
                    return;
                }

                var notes = _.flatten(getNotesFromClusterLayer(event.layer));
                var html, domElem;
                // increase Y moves down, increase X moves right
                var offsetY, offsetX;
                if (notes.length === 1) {
                    var imgHeight = 196;
                    var imgWidth = 192;
                    if (self._config.isWindowsClient) {
                        imgHeight = 200;
                        imgWidth = 200;
                    }
                    html =  '<div class="flyout-card-content"><div class="flyout-card-big">' +
                        '<img width='+imgWidth+' height='+imgHeight+' src="'+notes[0].cardThumbnailFile+'"></div></div>';
                    if (self._config.isWindowsClient) {
                        domElem = EVAtlas.makeFlyoutBoxDom(imgHeight+18,imgWidth+10);
                    } else {
                        domElem = EVAtlas.makeFlyoutBoxDom(200,192);
                    }
                    var $mid = domElem.find(".mid-mid");
                    $mid.html(html);
                    if (self._config.isWindowsClient) {
                        $mid.width("200px");
                        var $img = $mid.find("img");
                        // really unsetting clip to override css
                        $img.css("clip", "rect(0px 200px 200px 0px)");
                        $img.css("left","0px");
                    }
                    offsetY = 168;
                    offsetX = 142;
                } else {

                    var rows = EVAtlas.makeFlyoutTableRows(notes);
                    html = EVAtlas.flyoutRowsToHTMLTable(rows);
                    var height = 132;
                    if (rows.length === 1) {
                        domElem = EVAtlas.makeFlyoutBoxDom(32);
                        offsetY = 50;
                        offsetX = 130;
                    } else if(rows.length === 2) {
                        domElem = EVAtlas.makeFlyoutBoxDom(60);
                        offsetY = 64;
                        offsetX = 130;
                    } else if(rows.length === 3) {
                        domElem = EVAtlas.makeFlyoutBoxDom(90);
                        offsetY = 79;
                        offsetX = 130;
                    } else if(rows.length === 4) {
                        domElem = EVAtlas.makeFlyoutBoxDom(120);
                        offsetY = 94;
                        offsetX = 132;
                    }
                    domElem.find(".mid-mid").html(html);
                    if (rows.length === 1) {
                        domElem.find(".flyout-table").css({"margin-top":3});
                    }
                }

                domElem.on("click", ".flyout-card-big", function(clickevent) {
                    EV.openNotes([notes[0].uid], notes[0].title, "com.evernote.atlas");
                });
                domElem.on("click", "tr", function(clickevent) {
                    var trClasses = $(this).attr("class");
                    var notesByType = EVAtlas.groupNotesBySource(notes);
                    var typeToOpen;
                    if (_.includes(trClasses, "food")) {
                        typeToOpen = "food";
                    } else if(_.includes(trClasses, "hello")) {
                        typeToOpen = "hello";
                    } else if(_.includes(trClasses, "other")) {
                        typeToOpen = "other";
                    }else {
                        typeToOpen = "all";
                    }
                    console.log(notesByType[typeToOpen]);

                    EV.openNotes(_.pluck(notesByType[typeToOpen], "uid"), EV.i18n.L("Atlas Notes"), "com.evernote.atlas");
                });

                event.layer.bindPopup(domElem.get(0),
                    {offset:new L.Point(offsetX,offsetY)}
                );
                event.layer.openPopup();
                event.layer.unbindPopup();

            };

            clusterer.on("clusterclick", openClusterFlyout);

            $.each(map._layers, function(layer){
                map._layers[layer].off("load", afterMapLoad);
                return false;
            });
        };
        card.renderLayersOnMap = afterMapLoad;

        // set leafClusterer to init when first layer of map is finished loading tiles
        // cannot use _layers[0] b/c it's an object, not an array
        $.each(map._layers, function(layer){
            map._layers[layer].on("load", afterMapLoad);
            return false;
        });
    };

    Card.prototype.zoomMapToNoteBounds = function(isBig) {
        var bounds = new L.LatLngBounds();
        for (var i = 0; i < this.notes.length; i++) {
            var note = this.notes[i];
            var latLng = new L.LatLng(note.attributes.latitude, note.attributes.longitude, false);
            bounds.extend(latLng);
        }
        var map = this.getBigOrSmallLeafletMap(isBig);
        var boundsZoom = map.getBoundsZoom(bounds);
        var boundsCenter = bounds.getCenter();
        // stop grey bar at top of map with extra wide bounds by centering on equator
        if (boundsZoom === 0 || ( boundsZoom ===2 && isBig)) {
            boundsCenter = new L.LatLng(0.0, boundsCenter.lng);
        }

        map.setView(boundsCenter, boundsZoom);
    };

    Card.prototype.drawSmallMap = function() {
        var options = {
            center: new L.LatLng(51.505, -0.09),
            zoom: 3,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom:false,
            doubleClickZoom:false,
            trackResize: false,
            dragging: false,
            zoomAnimation: false,
            fadeAnimation: false,
            minZoom: 0,
            maxZoom: 11
        };
        var prefix = (EV.isClient) ? "en_cached_60_http_":"";
        this.map = new L.Map('map-canvas-'+this.position, $.extend({},options, {
                // en cached protocol, the number is the number of days the file is cached for
                layers:new L.TileLayer(
                    'http://'+prefix+'{s}.tiles.mapbox.com/v3/evnote.atfull3/{z}/{x}/{y}.png',
                    {detectRetina: true}
                )}
        ));
    };
    Card.prototype.getBigOrSmallLeafletMap = function(isBig) {
        var map = null;
        if (isBig) {
            map = this.bigMap;
        } else {
            map = this.map;
        }
        return map;
    };

    Card.prototype.zoomMap = function(isBig, noteForZoom) {
        var idxOfGeoType=_geoTypes.indexOf(this.geoType);

        // for city, zoom in to center.  try to be about 10 miles wide
        if(noteForZoom == null) {
            noteForZoom = this.notes[0];
        }
        var map = this.getBigOrSmallLeafletMap(isBig);
        var urlvars = EvHelper.getUrlVars();
        var bounds, marker;
        if (this.position===0 && isBig) {
            // All Notes doesn't have a geotype
            this.zoomMapToNoteBounds(isBig);
        } else  if (idxOfGeoType === _geoTypes.indexOf("locality")) {
            var latCenter = noteForZoom.named[this.geoType].lat;
            var lngCenter = noteForZoom.named[this.geoType].lon;

            if (urlvars.bbox != null) {
                marker = new L.Marker(new L.LatLng(latCenter, lngCenter));
                map.addLayer(marker);
            }
            var zoom;
            if (isBig === true) {
                zoom = 13;
            } else {
                zoom = 10;
            }
            // zoom to 11 for smaller cities?
//          // (named.geoname[0].population <= 150000) {
//             zoom = 11;
//         }
            if (map.originalBounds != null){
                map.fitBounds(map.originalBounds.pad(0.05));
                return;
            }

            map.setView(new L.LatLng(latCenter, lngCenter),zoom);
            bounds = map.getBounds();
            var extendBounds = false;
            for (var i = 0; i < this.notes.length; i++) {
                var note = this.notes[i];
                var latLng = new L.LatLng(note.attributes.latitude, note.attributes.longitude, false);
                if (!bounds.contains(latLng)){
                    bounds.extend(latLng);
                    extendBounds = true;
                }
            }
            if (extendBounds){
                map.originalBounds = bounds;
                map.fitBounds(bounds.pad(0.05));
            }

        } else {
            bounds = noteForZoom.named[this.geoType].bounds;
            var sw = new L.LatLng(bounds[1], bounds[0]);
            var ne = new L.LatLng(bounds[3], bounds[2]);
            if (urlvars.bbox != null) {
                marker = new L.Marker(sw);
                var marker2 = new L.Marker(ne);
                map.addLayer(marker);
                map.addLayer(marker2);
            }
            var boundsOfGeo = new L.LatLngBounds(sw,ne);
            var boundsZoom = map.getBoundsZoom(boundsOfGeo);
            if (boundsZoom === 0 || ( boundsZoom ===2 && isBig)) {
                var boundsCenter = new L.LatLng(0.0, boundsOfGeo.getCenter().lng);
                map.setView(boundsCenter, 0);
            }
            else {
                map.fitBounds(boundsOfGeo);
            }
        }
    };

    Card.prototype.zoomIn = function() {
        // add 1
        var oldZoom = this.bigMap.getZoom();
        if (oldZoom < _maxBigZoom) {
            this.bigMap.setZoom(oldZoom+1);
        }
    };
    Card.prototype.zoomOut = function() {
        // subtract 1
        var oldZoom = this.bigMap.getZoom();
        if (oldZoom > _minBigZoom) {
            this.bigMap.setZoom(oldZoom-1);
        }
    };

    Card.prototype.setZoom = function(newZoom) {
        var oldZoom = this.bigMap.getZoom();
        if (oldZoom !== newZoom) {
            this.bigMap.setZoom(newZoom);
        }
    };

    Card.prototype.openNotes = function(notes) {
        if (notes == null) {
            notes = this.visibleNotes;
        }
        if (notes.length === 0){
            return;
        }
        var title = $('#card-back-container-'+this.position).find('.map-label-big').html();
        if (title == null){
            title = EV.i18n.L("Notes from Map");
        }
        var uids = _.pluck(notes, 'uid');
        EV.openNotes(uids, title, "com.evenote.atlas");
    };
    Card.prototype.filterBigMap = function(searchText) {
        var notesProm = notesSearchProm("latitude:* "+searchText);
        var card = this;
        notesProm.then(function(notes) {
            console.log(searchText);
            console.log("filter search done:", notes.notes, notes.notes.length);
            // fastest rendering to remove all markers then re add
            card.bigClusterer.clearLayers();
            var map = card.getBigOrSmallLeafletMap(true);
            card.drawNotesOnMap(true, notes.notes);
            card.renderLayersOnMap();
        });
    };


    Card.prototype.drawBackgroundFrame = function() {
        if (_cardTmpl == null) {
            _cardTmpl = _.template(_.trim($("#card-tmpl").html()));
        }
        var html = _cardTmpl({
            place:"",
            numNotes:"",
            "idx":"" + this.position});
        var cardFrag = $($.parseHTML(html)).attr('id', "atlas-card-" + this.position);
        cardFrag.attr("data-position", this.position);

        if (this.options.loading){
            cardFrag.attr("style", "background:none;");
        }
        _page.append(cardFrag);
    };

    Card.prototype.calcVisibleMarkers = function() {
        var bounds = this.bigMap.getBounds();
        this.visibleNotes = [];
        for (var i =0; i < _cards[0].notes.length ; i++) {
            var note =  _cards[0].notes[i];
            var location = new L.LatLng(note.attributes.latitude, note.attributes.longitude);
            if (bounds.contains(location)) {
                this.visibleNotes.push(note);
            }
        }
        return this.visibleNotes.length;
    };

    Card.prototype.setNumNotes = function () {
        var num = this.calcVisibleMarkers();
        $(".all-notes-button-text").html(num !== 1 ? EV.i18n.L("num Notes", [""+num]) : EV.i18n.L("num Note", [num]));

        if (Evernote.externalInfo != null) {
            var uids = _.pluck(this.visibleNotes, "uid");
            Evernote.externalInfo.visibleNoteIds = JSON.stringify(uids);
        }

        var allButton = $(".all-notes-button");
        if (num === 0) {
            allButton.addClass("disabled");
        } else {
            allButton.removeClass("disabled");
        }

    };
    Card.prototype.toggleControls = function(method, duration) {
        var card = this;
        $("#card-back-"+card.position + " .big-control")[method](duration);
    };

    Card.prototype.setBigMapTitle = function(){
        var notes = this.visibleNotes;
        var title = null;

        if (notes.length === 0){
            return;
        }

        var allSameGeoTypeName = function(geoType){
            if (languageRequireTranslation(_lang)) {
                if (!notes[0].named || !notes[0].named[geoType] || !notes[0].named[geoType].translated){
                    return null;
                }
            }

            var sameGeoTypeName = _.all(notes, function(note) {
                var safeAccess = note.named && note.named[geoType];
                return safeAccess && note.named[geoType].name === notes[0].named[geoType].name;
            });

            if (sameGeoTypeName){
                return notes[0].named[geoType].name;
            }

            return null;
        };

        for (var i = 0; i < _geoTypes.length; i++){
            if (title != null){
                break;
            }
            title = allSameGeoTypeName(_geoTypes[i]);
        }

        this.title = title || EV.i18n.L("Evernote Atlas");

        $('#card-back-container-'+this.position).find('.map-label-big').html(this.title);
    };

    Card.prototype.drawBigMap = function(container, idxOfMap) {
        var bigMapHtml = _.trim($("#map-big-tmpl").html());
        $(container).append($.parseHTML(bigMapHtml));

        var card = _cards[idxOfMap];

        var options = {
            center: new L.LatLng(51.505, -0.09),
            zoom: 3,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom:true,
            doubleClickZoom:true,
            trackResize: false,
            dragging: true,
            zoomAnimation: false,
            minZoom: _minBigZoom,
            maxZoom: _maxBigZoom
        };
        var cardBack = $("#card-back-" + this.position);
        cardBack.find(".map-label-big").html(card.title);

        var mapTiles;
        if (self.getLanguage() === "en") {
            mapTiles = L.Browser.retina ? 'map-o9h7s9it' : 'map-apsfg8mr';
        } else {
            mapTiles = L.Browser.retina ? 'map-bk2p9bbt' : 'map-3eh3tpzv';
        }
        var mapDiv =cardBack.find(" .map-div");
        var prefix = (EV.isClient) ? "en_cached_4_http_":"";

        this.bigMap = new L.Map(mapDiv[0], $.extend({},options,
            {layers:new L.TileLayer('http://'+prefix+'{s}.tiles.mapbox.com/v3/evnote.' + mapTiles + '/{z}/{x}/{y}.png', { detectRetina: true })}
        ));

        this.zoomMap(true);
        this.drawAllNotesOnMap(true);

        card = this;
        setTimeout(function(){
            card.bigMap.fire("moveend");
            $.extend(card.bigMap.options, {
                zoomAnimation: true
            });
        });

        (function(card) {
            card.toggleControls('fadeIn');
            card.bigMap.on("moveend", function() {
                var sliderInput = $(".zoom-slider input");
                var curZoom = card.bigMap.getZoom();
                var val = sliderInput.prop("value");
                if (curZoom !== val) {
                    sliderInput.prop("value", curZoom );
                }
                card.setNumNotes();
                card.setBigMapTitle();
            });
            $(".findme").addClass("findme-normal");
            $(".findme").hover(function() {
                if (!$(this).hasClass("findme-hover")) {
                    $(this).addClass("findme-hover");
                }
            }, function() {
                $(this).removeClass("findme-hover");
                $(this).removeClass("findme-push");
            });
            $(".findme").mousedown(function() {
                if (!$(this).hasClass("findme-push")) {
                    $(this).addClass("findme-push");
                }
            });

            $(".findme").mouseup(function() {
                $(this).removeClass("findme-push");
            });
            $(".findme").on("click", function() {
                // add spinner
                var findMe = $(".findme");
                $(this).toggleClass("findme-wait");
                console.log("clicked findme");
                EV.getCurrentPosition(function(pos){
                    var lat = pos.coords.latitude,
                        lng = pos.coords.longitude,
                        latlng = new L.LatLng(lat, lng);
                    console.log("calling locate and set view: ", pos);

                    card.bigMap.setView(latlng, card.bigMap.getMaxZoom()-1);
                    //remove spinner
                    setTimeout(function() {
                        findMe.removeClass("findme-wait");
                    }, 100);
                }, function(error) {
                    console.log("error with getCurrentPosition:", error);
                    setTimeout(function() {
                        findMe.removeClass("findme-wait");
                    }, 100);
                });
                $(card.bigMap._container).trigger("focus");

            });
            $(".zoom-in").on("click", function() {
                $(card.bigMap._container).trigger("focus");
                card.zoomIn();
            });
            $(".zoom-out").on("click", function() {
                $(card.bigMap._container).trigger("focus");
                card.zoomOut();
            });
            $(".all-notes-button").on("click", function(){
                $(card.bigMap._container).trigger("focus");
                card.openNotes();
            });
            $(".search-input").on("search", (function (e) {
                card.filterBigMap(this.value);
                return false;
            }));
            card.bigMap.on('dragstart', function() {
                card.bigMap.closePopup();
            });
            card.bigMap.on('zoomstart', function() {
                card.bigMap.closePopup();
            });
        })(this);
        $(".zoom-slider input").on("mouseup", function(event) {
            var newZoom = $(this).val();
            card.setZoom(newZoom);
        });
    };
    Card.prototype.drawBigMapFrame = function() {
        // add .atlas-card back

        var cardBackHtml = _.trim($("#card-back-tmpl").html());
        cardBackHtml = _.template(cardBackHtml, {retina:EVAtlas.retinaAppend()});

        var id = "card-back-" + this.position;
        var cardFrag = $($.parseHTML(cardBackHtml))
            .attr('id', id);
        var cardBackContainer = $('<div id="card-back-container-' + this.position + '" class="card-back-container"></div>');
        cardBackContainer.append(cardFrag);
        var closebutton = _.template(_.trim($("#close-button-tmpl").html()));
        cardBackContainer.append(closebutton({retina:EVAtlas.retinaAppend()}));
        cardBackContainer
            .css({
                "-webkit-transform": "scale("+this.scaleX() +", "+this.scaleY() +") rotateY(-89deg)" ,
                //118 is container margins + padding
                width: window.innerWidth - (118),
                height: window.innerHeight - 75
            });
        cardBackContainer.find('.map-container').css('height', cardBackContainer.height() - 75);

        var mapEmboss = cardBackContainer.find(".map-container .map-emboss");
        // 300+23 is height of compass img + logo img
        // 300 is width of img
        mapEmboss.css("margin-top", ((cardBackContainer.height() - 323) * 0.25) + "px");
        mapEmboss.css("margin-left", ((pageWidth()*0.9 - 300) * 0.5) + "px");

        _page.append(cardBackContainer);
    };


    // cef1 doesn't have css3 3d effects and is jumpy on windows.
    Card.prototype.zoomToBigMapCEF1Prom = function() {
        console.log("zoomToBigMapCEF1Prom");
        this.baseDur = 180;
        var theBaseDur = this.baseDur;
        //        console.log('clicked atlas-card');
        var mapCard = $('#atlas-card-' + this.position);
        mapCard.addClass("zooming");
        var card = this;
        var origIdx = card.position;
        //        console.log($(clickedCard).attr("id"), origIdx);

        // use offset to determine position "relative to document" rather than "relative to parent"
        // we want the effect to center mapCard in the middle of the window, not parent
        var off = $(mapCard).offset();

        // we don't want to calc w/pageOffsets here b/c the window will
        // scroll to top-left when transitioning to big map
        var mvX = window.innerWidth/2 - mapCard.width()/2 - off.left;
        var mvY = pageYOffset + window.innerHeight/2 - mapCard.height()/2 - off.top;

        $(".atlas-card").not(mapCard).each(function (index, card) {
            $(card).fadeOut(theBaseDur);
        });

        var dfd = $.Deferred();

        // finishRotate does the second half of the effect, from edge on to the large map
        var finishRotate = function () {
            // hide contents of .mapcard
            mapCard.hide();
            var cardBack = $("#card-back-" + origIdx);
            if (cardBack.length === 0) {
                card.drawBigMapFrame();
                cardBack = $("#card-back-" + origIdx);
            }

            cardBack.parent().css('top', pageYOffset);
            cardBack.parent().show();
            resizeBigMap(card);
            $('body').scrollTop(0);
            cardBack.parent().transition({rotateY:'0deg', scale:[1, 1]}, card.baseDur * 1.3, "ease-out", function () {
                dfd.resolve();
            });
        };
        //        might want to switch to keyframes and pure css to avoid stutter in animation
        //        http://stackoverflow.com/questions/4797675/how-do-i-re-trigger-a-webkit-css-animation-via-javascript
        //        http://joehewitt.com/2011/10/05/fast-animation-with-ios-webkit
        _page.css("-webkit-perspective", "1000px");
        var wpy = pageYOffset + window.innerHeight / 2 - $(mapCard).height() / 4;
        _page.css("-webkit-perspective-origin-y", (wpy) + 'px');

        // add min height to keep page from jumping / scrolling up during transition
        var cardLast = $('.atlas-card:last');
        _page.css("min-height", cardLast.offset().top + cardLast.height());
        $(mapCard).transition({y:"+=" + (mvY ) + "px", x:"+=" + (mvX) + "px", rotateY:'0deg'},
            (card.baseDur) + "", "linear");
        $(mapCard).transition({rotateY:'89deg'}, (card.baseDur * 0.7) + "", "linear",
            function () {
                _page.css("-webkit-perspective-origin-y", '');
                finishRotate();
            });
        return dfd.promise();
    };

    Card.prototype.zoomToBigMapProm = function() {
        //        console.log('clicked atlas-card');
        var mapCard = $('#atlas-card-' + this.position);
        mapCard.addClass("zooming");
        var card = this;
        var origIdx = card.position;
        //        console.log($(clickedCard).attr("id"), origIdx);

        // use offset to determine position "relative to document" rather than "relative to parent"
        // we want the effect to center mapCard in the middle of the window, not parent
        var off = $(mapCard).offset();

        // we don't want to calc w/pageOffsets here b/c the window will 
        // scroll to top-left when transitioning to big map
        var mvX = window.innerWidth/2 - mapCard.width()/2 - off.left;
        var mvY = pageYOffset + window.innerHeight/2 - mapCard.height()/2 - off.top;

        $(".atlas-card").not(mapCard).each(function (index, card) {
            $(card).fadeOut(card.baseDur);
        });

        var dfd = $.Deferred();

        // finishRotate does the second half of the effect, from edge on to the large map
        var finishRotate = function () {
            // hide contents of .mapcard
            mapCard.hide();
            var cardBack = $("#card-back-" + origIdx);
            if (cardBack.length === 0) {
                card.drawBigMapFrame();
                cardBack = $("#card-back-" + origIdx);
            }

            // adjusted so that the large card doesn't flip differently from small card
            // (happens even though scaled)
            var wpy = window.innerHeight / 2 - $(cardBack).height() / 4;
            _page.css("-webkit-perspective-origin-y", (wpy) + 'px');
            _page.css("-webkit-perspective", "5000px");

            cardBack.parent().css('top', pageYOffset);
            cardBack.parent().show();
            resizeBigMap(card);
            $('body').scrollTop(0);
            cardBack.parent().transition({rotateY:'0deg', scale:[1, 1]}, card.baseDur * 1.3, "ease-out", function () {
                dfd.resolve();
            });
        };
        //        might want to switch to keyframes and pure css to avoid stutter in animation
        //        http://stackoverflow.com/questions/4797675/how-do-i-re-trigger-a-webkit-css-animation-via-javascript
        //        http://joehewitt.com/2011/10/05/fast-animation-with-ios-webkit
        _page.css("-webkit-perspective", "1000px");
        var wpy = pageYOffset + window.innerHeight / 2 - $(mapCard).height() / 4;
        _page.css("-webkit-perspective-origin-y", (wpy) + 'px');

        // add min height to keep page from jumping / scrolling up during transition
        var cardLast = $('.atlas-card:last');
        _page.css("min-height", cardLast.offset().top + cardLast.height());
        $(mapCard).transition({y:"+=" + (mvY * 0.5) + "px", x:"+=" + (mvX * 0.5) + "px", rotateY:'0deg' },
            (card.baseDur * 0.5) + "", "ease-in");
        $(mapCard).transition({y:"+=" + (mvY * 0.5) + "px", x:"+=" + (mvX * 0.5) + "px", rotateY:'19deg'},
            (card.baseDur * 0.5) + "", "linear");
        $(mapCard).transition({rotateY:'89deg'}, (card.baseDur * 0.7) + "", "linear",
            function () {
                _page.css("-webkit-perspective-origin-y", '');
                finishRotate();
            });
        return dfd.promise();
    };


    self.Geocoder = function () {
        var selfG = {};

        selfG.getKeyFromMBResponse = function (response) {
            return  response && response.query && self.Geocoder.latLngToKey(response.query[1], response.query[0]);
        };

        selfG.addGeocodeRequestToPromises = function (points, promises) {
            var url = self.Geocoder.bulkMapBoxUrl(points);
            var options = {url:url,
                type:"GET"
            };
            var promise = $.ajax(options).retry({times:3, timeout:5000});
            promises.push(promise);
        };


        selfG.bulkMapBoxUrl = function (pointAr) {

            var pointStrs = [];
            // mapbox wants lng, lat instead of lat, lng
            for (var i = 0; i < pointAr.length; i++) {
                var point = pointAr[i];
                //            console.log(point);
                pointStrs.push(point[2].toFixed(4) + "," + point[1].toFixed(4));
            }
            // quirk of mapbox ssl api, always need at least 2 points
            if (pointStrs.length===1) {
                pointStrs.push("0.0000" + "," + "0.0000" );
            }
            var allStr = pointStrs.join(";") + ".json";
            // Sample staging geocoder address
            // http://a.carmen-dev-api-us-east-1.tilestream.net/v3/
            // evnote.map-vvq35jir,evnote.en-custom-city/geocode/
            // -73.9841,40.7399.json
            var url = _.sprintf(
                "https://a.tiles.mapbox.com/v3/evnote.map-vvq35jir,evnote.en-custom-city/geocode/%s",
//                "http://api.tiles.mapbox.com/v3/evnote.map-vvq35jir,evnote.en-custom-city/geocode/%s",
                allStr);
            return url;
        };

        selfG.getKeysFromNotes = function (notes) {
            return _.map(notes, function (note) {
                return selfG.latLngToKey(note.attributes.latitude, note.attributes.longitude);
            });
        };

        selfG.getLocFromMBResponse = function (response) {
            var newObj = {};
            if (response == null || response.results == null) {
                return null;
            }
            newObj.mapbox = response;
            newObj.locality = selfG.mbGetCity(response.results[0]);
            newObj.state = selfG.mbGetState(response.results[0]);
            newObj.country = selfG.mbGetCountry(response.results[0]);
            newObj.continent = selfG.mbGetContinent(response.results[0]);

            return newObj;
        };
        selfG.removeExcessDataForCache = function (resp) {
            // remove excess data for cache
            if (resp == null || resp.results == null || resp.results[0] == null) {
                return;
            }
            if (resp["attribution"]) {
                delete resp["attribution"];
            }

            for(var i =0; i < resp.results[0].length; i++) {
                var result = resp.results[0][i];
                var keys = _.keys(result);
                for (var j =0; j < keys.length; j++) {
                    var key = keys[j];
                    if (result[key] == null || result[key] ==="") {
                        delete result[key];
                    }
                }
            }
        };
        selfG.mbGetContinent = function (results) {
            var continentResult = _.find(results, function (aResult) {
                return (aResult.type === "continent");
            });
            return continentResult;
        };

        selfG.mbGetState = function (results) {
            var stateResult = _.find(results, function (aResult) {
                return (aResult.type === "province" && aResult.source !== "evernote" && aResult.source !== "ne");
            });
            var neResult = _.find(results, function (aResult) {
                return (aResult.type === "province" && aResult.source === "ne");
            });
            var evernoteStateResult = _.find(results, function (aResult) {
                return (aResult.type === "province" && aResult.source === "evernote");
            });
            stateResult = $.extend({}, neResult, stateResult, evernoteStateResult);
            return stateResult;
        };

        selfG.mbGetCountry = function (results) {
            var countryResult = _.find(results, function (aResult) {
                return (aResult.type === "country" && aResult.source !== "evernote");
            });

            var countryLocalizedResult = _.find(results, function (aResult) {
                return (aResult.featurecla && aResult.featurecla.indexOf("country") !== -1 &&
                     aResult.id && aResult.id.indexOf("ne-countries-localized") !== -1);
            });

            var evernoteCountryResult = _.find(results, function (aResult) {
                return (aResult.type === "country" && aResult.source === "evernote");
            });

            if (countryResult && evernoteCountryResult && evernoteCountryResult.bounds &&
                countryResult.id === evernoteCountryResult.mapbox_id) {
                countryResult.bounds = evernoteCountryResult.bounds;
                countryResult.name = evernoteCountryResult.name;
            }

            if (countryResult && countryLocalizedResult) {
                countryResult = $.extend(countryLocalizedResult, countryResult);
            }

            return countryResult;// || evernoteCountryResult;
        };

        selfG.mbGetCity = function (results) {
            if (results == null) {
                return null;
            }

            var compareId = function(result, id) {
              return result.id.indexOf(id) >= 0 ? true : false
            }

            /* List of functions to compare data against to see if that type of result
             * is what we're seeing. These functions are also in order from most important
             * to least important. */
            var searchPreferences = {
                0: function(result) { return compareId(result, "en-custom-city") },
                1: function(result) {
                        return compareId(result, "en-custom-mapbox") &&
                            ( result.mapbox_id == null ||
                            result.mapbox_id.indexOf("flickr") < 0 );
                    },
                2: function(result) { return compareId(result, "mapbox-places") },
                3: function(result) { return compareId(result, "en-custom-tiger") },
                4: function(result) {
                        return compareId(result, "en-custom-mapbox") &&
                            result.mapbox_id != null &&
                            result.mapbox_id.indexOf("flickr") >= 0;
                    }
            };

            /* Find the best result that matches by using the priority of the
             * searchPreferences functions. */
            var bestResult = null;
            var bestResultId = Object.keys(searchPreferences).length - 1;
            for (var i = 0; i < results.length; i++)  {
                var result = results[i];

                if (result == null || result.id == null) {
                    continue
                }

                for (var j = bestResultId; j >= 0; j--) {
                    if (searchPreferences[j](result)) {
                        bestResultId = j;
                        bestResult = result
                    }
                }
            }

            return bestResult
        };

        selfG.getUncachedKeyAndLatLng = function (notes) {
            var geocodeAtMB = [];
            for (var i = 0; i < notes.length; i++) {
                var note = notes[i];
                var key = selfG.latLngToKey(note.attributes.latitude,
                    note.attributes.longitude);
                if (self.lsGet(key) == null) {
                    geocodeAtMB.push([key, note.attributes.latitude,
                                      note.attributes.longitude]);
                }
            }
            return geocodeAtMB;
        };

        selfG.latLngToKey = function (lat, lng) {
            var latF = lat.toFixed(4).replace("-", "_").replace(".", "z");
            var lngF = lng.toFixed(4).replace("-", "_").replace(".", "z");
            return latF + "i" + lngF;
        };
        selfG.validLatLng = function (lat, lng) {
            var epsilon = 0.0000000001;
            var invalid = (
                lat == null || lng == null ||
                    !_.isNumber(lat) || !_.isNumber(lng) ||
                    (Math.abs(lat) < epsilon && Math.abs(lng) < epsilon) || // zero coordinates are invalid (some client's bug)
                    lng > 180 ||
                    lng < -180 ||
                    lat > 85 ||
                    lat < -85);// 85 instead of 90 because that's the extent of our map
            return !invalid;
        };
        return selfG;
    }();

    self.addSmallToBigClickEvent = function () {
        $('#page').one('click', '.map-card', function (event, target) {
            // "one" because dbl click was executing twice
//            console.log("clicked card transitioning small to big");
            event.preventDefault();
            _cards[$(this).attr('data-position')].triggerSmallToBigAndRemember();
        });
    };


    _.templateSettings = {
        evaluate:/<%([\s\S]+?)%>/g,
        interpolate:/\{\{(.+?)\}\}/g
    };

    // geoTypes must be ordered from smallest to largest
    var _geoTypes = ["colloquial_area", "locality", "state", "country", "continent"];
    self._geoTypes = _geoTypes;
    var notesSearchProm = function (searchQuery) {
        var dfd = $.Deferred();

        var allNotes = [];
        var getPageOfResults = function (startIndex) {

          var resultSpec = {includeTitle:true, includeAttributes:true, includeCreated:false,
            includeUpdated:false, includeTagGuids:false, includeLargestResourceMime:false,
            includeContentLength:false, includeNotebookGuid:false,
            includeLargestResourceSize:false, includeSnippetFile:true,
            includeCardThumbnailFile:true};

          var prom = EV.findNotesMetadataAsync({words:searchQuery, order:2, ascending:false},
                startIndex, _maxNotesPerQuery, resultSpec);
            prom.then(function (resp) {
                if (resp != null && resp.notes != null) {
                    allNotes = allNotes.concat(resp.notes);
                    if (allNotes.length < resp.totalNotes) {
                        console.log("findNotesResponse totals", startIndex, resp.totalNotes, resp.notes.length);
                        getPageOfResults(startIndex + resp.notes.length);
                    } else {
                        resp.notes = allNotes;
                        dfd.resolve(resp);
                    }
                } else {
                    if (resp == null) {
                        resp = {};
                    }
                    resp.notes = allNotes;
                    dfd.resolve(resp);
                }
            });
        };
        getPageOfResults(0);

        return dfd.promise();
    };

    var userDataNotesProm = function (key) {
        var dfd = $.Deferred();

        var notes = userDataToNotes(userData[key]);
        dfd.resolve({notes:notes});

        return dfd.promise();
    };

    self.getNotesProm = function () {
        var dfd = $.Deferred();
        var notesProm;
        var urlVars = EvHelper.getUrlVars();
        if (urlVars.userid != null) {
            notesProm = userDataNotesProm(urlVars.userid);
        } else {
            notesProm = notesSearchProm("latitude:*");
        }

        // the jsonrpc library call back was hiding exceptions, this timeout code is pulling the function call
        // out from being a callback to where it's stack trace can be properly seen.
        var unHiddenResults = null;
        notesProm.then(function (results) {
            unHiddenResults = results;
        });

        (function pollWait() {
            if (unHiddenResults != null) {
                var notes = unHiddenResults.notes;
//                console.log("total geo notes from search ", notes.length, "notes: ", notes);
//                  console.log(notes.length, " total notes from search");
                var filteredNotes = _.filter(notes, function (note) {
                    return ( self.Geocoder.validLatLng(note.attributes.latitude, note.attributes.longitude));
                });

                console.log(filteredNotes.length, " total notes after filtering out invalid lat,lngs ");
                dfd.resolve(filteredNotes);
            } else {
                setTimeout(pollWait, 90);
            }
        })();
        return dfd.promise();
    };
    // check the country against
    var invalidateOldVersions = function(notes){
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var lat = note.attributes.latitude;
            var lng = note.attributes.longitude;
            var key = self.Geocoder.latLngToKey(lat, lng);
            var val = self.lsGet(key);
            if (val != null) {
                // get country version:
                getCountry(val);
            }
        }
    };
    var getCountry = function (entry) {

    };
    var getItemsNotInLS = function (notes, keys) {
        var geocodeAtMB = [];
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var lat = note.attributes.latitude;
            var lng = note.attributes.longitude;
            var key = self.Geocoder.latLngToKey(lat, lng);
            keys.push(key);
            if (self.lsGet(key) == null) {
                geocodeAtMB.push([key, lat, lng]);
            }
        }
//        console.log("getItemsNotInLS to geocode array :", geocodeAtMB);
        return geocodeAtMB;
    };
    var _loadingStatus = -1;
    var _geocodingFailed = false;
    self.updateLoadingStatus = function(percentComplete) {
        if (EV.isClient) {
            if (_loadingStatus === -1) {
                _loadingStatus = percentComplete;

                (function pollLoadingStatus() {
                    if (_geocodingFailed && _loadingStatus !== 100) {
                        // set error on main screen, change Loading... to Connection Error...
                        $(".loading span").html(EV.i18n.L("Connect to the Internet to view Atlas"));
                        self.updateLoadingStatus(100);
                    } else if (_loadingStatus !== 100) {
                        setTimeout(pollLoadingStatus,2000);
                    }
                })();
            } else {
                _loadingStatus = percentComplete;
            }

            EV.setProgressBar(percentComplete);
        }
        // TODO Loading... indicator on page should be image
    };

    self.geocodeResultsMapboxProm = function (notes) {
        var promises = [];
        var keys = [];
        var geocodeAtMB = getItemsNotInLS(notes, keys);
        console.log("all items: ", notes, " items not in localStorage:", geocodeAtMB);
        var chunkSize = parseInt(EvHelper.getUrlVars().chunkSize,10) || 39;
        while (geocodeAtMB != null && geocodeAtMB.length > 0) {
            var head = _.head(geocodeAtMB, chunkSize);
            console.log("head length:", head.length, " geocodeAtMB.length:", geocodeAtMB.length);
            // add promises that resolve when new geocoding is done
            self.Geocoder.addGeocodeRequestToPromises(head, promises);
            geocodeAtMB = _.last(geocodeAtMB, geocodeAtMB.length - head.length);
        }
        var storedProm = storeGeoToLocalStorage(keys, promises);
        return storedProm;
    };


    var storeGeoToLocalStorage = function (keys, geoRequests) {
        var num = geoRequests.length;
        var dfd = $.Deferred();
        if (geoRequests.length === 0) {
            dfd.resolve();
        }
        var numCompleted = 0;
        for (var i = 0; i < geoRequests.length; i++) {
            var prom = geoRequests[i];

            prom.then(function (jsonResponses) {
                numCompleted++;
                self.updateLoadingStatus(Math.round((numCompleted/geoRequests.length)*99));
            }, function(status) {
                // loading status has always been started at this point, set this sentinel
                // so that the error message will be displayed by polling check.
                _geocodingFailed = true;
                console.log("geocoding status 2  ", status);
            });
        }
//        console.log(keys, geoRequests);
        $.when.apply($, geoRequests).then(function () {
            // save to local store
            for (var k = 0; k < geoRequests.length; k++) {
                var prom = geoRequests[k];

                prom.then(function (jsonResponses) {
                    if (jsonResponses.length == null) {
                        jsonResponses = [jsonResponses];
                    }


                    // each result group is [points, namedObj]
                    for (var j = 0; j < jsonResponses.length; j++) {
                        var jsonResponse = jsonResponses[j];

                        self.Geocoder.removeExcessDataForCache(jsonResponses[j]);
                        var geoNames = self.Geocoder.getLocFromMBResponse(jsonResponse);
                        var key = self.Geocoder.getKeyFromMBResponse(jsonResponse);
                        if (geoNames != null && key != null) {
                            self.lsPut(key, geoNames);
                        }
                    }
//                    if (k === promises.length -1) {
//                        console.log("   resolved", k);
//                    }
                    num--;
                    if (num === 0) {
                        console.log("   storing to localstorage done, resolving keys");
                        dfd.resolve(keys);
                    }
                });
            }
        });

        return dfd.promise();
    };

    // save the original result to localStorage, save the derived locations to
    // variable cache
    self.localStorageFull = false;
    self.lsPut = function (key, obj) {
        if (obj != null && obj.mapbox != null) {
            var lsObj = {};
            if (!self.localStorageFull) {
                // only save the original result
                lsObj.mapbox = obj.mapbox;
                try {
                    EV.localStorage.setItem(key,JSON.stringify(lsObj));
                } catch (e) {
                    self.localStorageFull = true;
                    console.log("localStorage put error:");
                }
            } else {
                console.log("localStorage full");
            }
            if (_.keys(obj).length > 0) {
                self.geocodeCache[key] = obj;
            }
        }
    };



    self.lsGet = function (key) {
        var cacheObj = self.geocodeCache[key];
        if (cacheObj != null && _.keys(cacheObj).length > 0) {
            return cacheObj;
        } else {
            var lsObj = EV.localStorage.getItem(key);
            if (lsObj == null) {
                return null;
            }
            lsObj = JSON.parse(lsObj);
            if ( lsObj != null && lsObj.mapbox != null) {
                var obj = self.Geocoder.getLocFromMBResponse(lsObj.mapbox);
                if (_.keys(obj).length > 0) {
                    self.geocodeCache[key] = obj;
                    return obj;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    };
    var addLocalStoreGeoToNotes = function (notesIn) {
        for (var i = 0; i < notesIn.length; i++) {
            var note = notesIn[i];
            var lat = note.attributes.latitude;
            var lng = note.attributes.longitude;
            var key = self.Geocoder.latLngToKey(lat, lng);
            var value = self.lsGet(key);
            note.named = value;
//                        console.log("named, key", note.named, key);
        }
    };
    var countCluster = function (cluster) {
        var result = 0;
//            console.log(cluster);
        $.each(cluster, function (idx, arr) {
//                console.log(arr);
            result += arr.length;
        });
        return result;
    };


    // sort is converting array of objects to array of arrays
    self.sortClusters = function (clustersOut) {
        for (var i = 0; i < clustersOut.length; i++) {
            clustersOut[i] = _.sortBy(clustersOut[i], function (val, key) {
//                console.log(val, key);
                return -val.length;
            });
        }
    };

    self.clusterNotesByNotesPerCity = function (groupedCity, groupedAAL1, groupedCountry, opts) {
        groupedCity = _.filter(groupedCity, function (val, key) {
            //            console.log(key,val);
            return key !== "undefined" && val.length >= opts.notesPerCity;
        });
        // states with more than notesPerState note
        groupedAAL1 = _.filter(groupedAAL1, function (val, key) {
            return key !== "undefined" && val.length >= opts.notesPerState;
        });
        // countries with more than notesPerCountry note
        groupedCountry = _.filter(groupedCountry, function (val, key) {
            return key !== "undefined" && val.length >= opts.notesPerCountry;
        });
        return [groupedCity, groupedAAL1, groupedCountry];
    };

    // First limit to each of max city, state etc.
    self.clusterAlgorithm1 = function (groupedCity, groupedState, groupedCountry, options) {
        var defaults = {maxCityCards:7, maxStateCards:3, maxCountryCards:5};
        var opts = $.extend({}, defaults, options);

        var clusters = [groupedCity, groupedState, groupedCountry];
        self.sortClusters(clusters);
        clusters[0] = _.first(clusters[0], opts.maxCityCards);
        clusters[1] = _.first(clusters[1], opts.maxStateCards);
        clusters[2] = _.first(clusters[2], opts.maxCountryCards);
        return clusters;
    };

    self.removeCities = function(cluster) {
        var result = _.filter(cluster, function(arrayOfNotes) {
            /* Remove places with QUESTIONABLE characters in 'em */
            var excludeChar = false;
            var state = null;

            if (arrayOfNotes.length > 0 && arrayOfNotes[0].named != null) {
                state = arrayOfNotes[0].named["state"].name;
            }

            if (state != null) {
                excludeChar = (state.indexOf("?") >= 0);
            } else {
                console.log("State was null for", cluster);
            }

            return !excludeChar;
        });
        return result;
    };

    self.removeStates = function(cluster) {
        var toRemove = ["\u00CEle-de-France","Tokyo", "Beijing", "?"];
        var result = _.filter(cluster, function(arrayOfNotes) {
            var name = arrayOfNotes[0].named["state"].name;
            var excludeName = _.contains(toRemove, name);
            return !excludeName;
        });
        return result;
    };

    // Exclude states and countries with only one locality (unless that "locality" is blank),
    //
    //
    // 1. start with the top maxCityCards cities
    // 2. remove states that only have 1 city, when that city is in 1
    // 3. remove countries that only have 1 city, when that city is in 1
    // 4. sort states and countries by number of notes.

    self.clusterAlgorithm2 = function (groupedCity, groupedState, groupedCountry, options) {
        var defaults = {maxCityCards:6, maxStateCards:3, maxCountryCards:4};
        var opts = $.extend({}, defaults, options);
        opts.maxCards = opts.maxCityCards + opts.maxStateCards + opts.maxCountryCards;
        var cardCount = 0;

        var clusters = [groupedCity, groupedState, groupedCountry];

        clusters[0] = self.removeCities(clusters[0]);
        clusters[1] = self.removeStates(clusters[1]);
        // cards, cityCards, cityGroups
        self.sortClusters(clusters);

        // states with more than x different cities
        clusters[1] = _.filter(clusters[1], function (stateCluster) {
            var cities = _.map(stateCluster, function (state) {
                return state.named && state.named.locality &&
                     state.named.locality.name;
            });
            var uniqCities = _.uniq(cities);
            return uniqCities.length > 1;
        });
        // countries with more than x different cities
        clusters[2] = _.filter(clusters[2], function (countryCluster) {
            var cities = _.map(countryCluster, function (country) {
                return country.named && country.named.locality &&
                    country.named.locality.name;
            });
            var uniqCities = _.uniq(cities);
            return uniqCities.length > 1;
        });

        // get first maxStateCards cards unless we didn't fill the maxCityCard quota, then try to make up losses
        clusters[1] = _.first(clusters[1], opts.maxStateCards);
        cardCount += clusters[1].length;

        // try to fill up the maxCards quota
        // maxCards - cardCount == maxCountryCards if cities + states are filled to max
        clusters[2] = _.first(clusters[2], opts.maxCountryCards);
        cardCount += clusters[2].length;

        clusters[0] = _.first(clusters[0], opts.maxCards - cardCount);
        console.log(clusters[0]);

        return clusters;
    };
    self.fixNames = function(notes) {
        var replacements = {
            "Constantinople": "Istanbul",
            "Petrograd": "Saint Petersburg",
            "Stalinsk": "Novokuznetsk",
            "Leningrad": "Saint Petersburg",
            "Empire State": "New York State",
            "State of Montana": "Montana",
            "Timbuktu":"Portland"
        };
        $.each(notes, function (index, note) {
            $.each(_geoTypes, function (index2, geoType) {
                if (note.named[geoType] != null) {
                    var newName = replacements[note.named[geoType].name];
                    if (newName != null) {
                        note.named[geoType].name = newName;
                    }
                }
            });
        });
    };

    self.fixBounds = function(notes) {
        var replBounds = {
            // 491 and 561 are hawaii
            "province.491": [-161.001, 18.27, -154.20, 22.46],
            "province.561": [-161.001, 18.27, -154.20, 22.46]
        };
        $.each(notes, function (index, note) {
            var geoType = "state";
            if (note.named[geoType] != null && note.named[geoType].id != null) {
                var newBounds = replBounds[note.named[geoType].id];
                if (newBounds != null) {
                    note.named[geoType].bounds = newBounds;
                }
            }
        });
    };
    self.fixIds = function(notes) {
        $.each(notes, function (index, note) {
            $.each(_geoTypes, function (index2, geoType) {
                if (note.named[geoType] != null && note.named[geoType].id != null) {
                    note.named[geoType].id = note.named[geoType].id.replace("evnote-","");
                }
            });
        });
    };

    self.selectTranslationForNote = function(note, geoType, lang) {
        var name_ = 'name_' + lang;
        var processTranslations = function (note, geoType) {
            if (note.named && note.named[geoType] && note.named[geoType][name_] != null && note.named[geoType][name_] !== "") {
                if (languageUnicodeFilter(_lang) && note.named[geoType][name_].charCodeAt(0) < 255) {
                    return;
                }
                note.named[geoType].name = note.named[geoType][name_];
                note.named[geoType].translated = true;
            }
        };
        processTranslations(note, geoType);
    };
    self.selectTranslationForNames = function(notes) {
        var name_ = 'name_' + _lang;
        $.each(notes, function (index, note) {
            $.each(_geoTypes, function (index, geoType) {
                self.selectTranslationForNote(note, geoType, _lang);
            });
        });
    };

    /*
    Create dictionary where each of _geoTypes has a key and an array of all the notes that have
    that geotype.  So "locality": [notes with some locality data]

    Also filters out notes that don't have translated locations which should.
     */
    self.groupByLocationType = function(notes, options) {
        var groups = {};
        $.each(_geoTypes, function (index, geoType) {
            var notesWithThisGeotypeAndValid = _.filter(notes, function (note) {
                return note.named[geoType] != null && note.named[geoType].name != null &&
                    self.Geocoder.validLatLng(note.named[geoType].lat, note.named[geoType].lon);
            });
            var groupByTemp = _.groupBy(notesWithThisGeotypeAndValid, function (note) {
                if (geoType === "state" || geoType === "country") {
                    return note.named[geoType].name;
                } else {
                    return note.named[geoType].id;
                }
            });
            // groupByTemp looks like {"country.9": [array of notes],...}, all of one
            // geoType per loop
//            console.log("groupByTemp", groupByTemp, _.toArray(groupByTemp));
            groups[geoType] = _.toArray(groupByTemp);
            // toArray just grabs the values of the dict
            // looks like [[array of notes], [array of notes]]
        });

        if (languageRequireTranslation(_lang) && options.filter !== "false") {
            console.log("Filtering based on translation required and present...");
            $.each(_geoTypes, function (index, geoType) {
                groups[geoType] = _.filter(groups[geoType], function (note) {
                    return note[0].named[geoType].translated;
                });
            });
        }
        return groups;
    };

    self.groupAndChooseNotesByLocation = function (notesIn, options) {
        var defaults = {al:2, notesPerCity:1, notesPerState:1, notesPerCountry:1};

        var opts = $.extend({}, defaults, options);
//        console.log("opts - ", opts);
//        console.log("clusterNotesByLocation...", notesIn);

//        console.log(notesIn.length, " total geo notes pre geoname lookup filter");
        var notes = _.filter(notesIn, function (note) {
            return note.named != null;
        });

        self.selectTranslationForNames(notes);
        self.fixNames(notes);
        self.fixIds(notes);
        self.fixBounds(notes);

        console.log(notes.length, " total geo notes post geoname lookup filter");

        var groups = self.groupByLocationType(notes, opts);

//        console.log(groups['locality'], groups['state'], groups['country']);
//        console.log(countCluster(groups['locality']), countCluster(groups['state']), countCluster(groups['country']));

        var clusters;
        if (opts.al === 0) {
            clusters = self.clusterNotesByNotesPerCity(groups['locality'], groups['state'], groups['country'], opts);
        } else if (opts.al === 1) {
            clusters = self.clusterAlgorithm1(groups['locality'], groups['state'], groups['country'], opts);
        } else if (opts.al === 2) {
            clusters = self.clusterAlgorithm2(groups['locality'], groups['state'], groups['country'], opts);
        }
        console.log(countCluster(groups['locality']), countCluster(groups['state']), countCluster(groups['country']));

        self.sortClusters(clusters);
        console.log("clusters", clusters);
        console.log("clusterNotesByLocale end");

        return clusters;
    };


    var mapCluster = function (groupsOfNotes, geoType, mapIdx) {
        for (var i = 0; i < groupsOfNotes.length; i++) {
            if (mapIdx > _maxCards - 1) {break;}
            var notes = groupsOfNotes[i];
            var named = notes[0].named;
            var card = new Card(mapIdx);
            _cards[mapIdx] = card;
            card.setNotes(notes);
            card.setGeotype(geoType);
            card.setPosition(mapIdx);
//            console.log(notes[0].named[geoType].name);
            card.setTitle(named[geoType].name);
            card.setSuperTitleFromGeoData(named);

            card.zoomMap();
            card.drawAllNotesOnMap();
            card.drawCardHeader();

            mapIdx++;
        }
        return mapIdx;
    };

    var resizeBigMap = function (card) {
        var container = $(document.getElementById('card-back-container-' + card.position));
        if (container[0].style.display !== "none") {
            // 118 is container's margin-left + margin-right + padding-left + padding-right
            var newContainerWidth = pageWidth() - 118;

            //set min height to 535px
            var windowHeight = window.innerHeight > 535 ? window.innerHeight : 535;

            var newContainerHeight = windowHeight - 75;

            container[0].style.width = newContainerWidth + 'px';
            container[0].style.height = newContainerHeight + 'px';

            var cardBackBg = container.find(".card-back  .map-container");

            cardBackBg[0].style.width = newContainerWidth + 'px';
            cardBackBg[0].style.height = (newContainerHeight - 75) + 'px';

            var mapEmboss = container.find(".map-container .map-emboss");
            // 323 is height of compass img + logo img
            mapEmboss[0].style.marginTop = ((newContainerHeight - 323) * 0.25) + "px";
            mapEmboss[0].style.marginLeft = ((pageWidth() * 0.9 - 300) * 0.5) + "px";

            if (card.bigMap) {
                card.bigMap.invalidateSize();
            }
        }
    };

    var resizeBigMaps = function () {
        $.each(_cards, function (index, card) {
            if (card && card.bigMap) {
                resizeBigMap(card);
            }
        });
    };

    var CARD_WIDTH = 180;
    var CARD_HEIGHT = 225;
    var MIN_MARGIN = 30;
    var MARGIN_TOP = 40;

    var pageWidth = function () {
        //60 is page margin
        var width = window.innerWidth - 60;

        //return a min width of 575
        return width > 575 ? width : 575;
    };

    var reflowMapCards = function () {
        //calculate the margins to apply to each card
        var cards = document.getElementsByClassName('atlas-card');
        var _pageWidth = pageWidth();
        var cardsPerRow = Math.floor(_pageWidth / (CARD_WIDTH + MIN_MARGIN));

        var totalMarginWidth = _pageWidth - (cardsPerRow * CARD_WIDTH);
        var marginSide = Math.floor(totalMarginWidth / cardsPerRow);

        for (var index = cards.length - 1; index >= 0; index--) {
            cards[index].style.top = Math.floor(index / cardsPerRow) * (CARD_HEIGHT + MARGIN_TOP) + 'px';
            cards[index].style.left = ((index % cardsPerRow) * (CARD_WIDTH + marginSide)) + marginSide * 0.5 + 'px';
        }

        // set minheight b/c absolute positioned children don't add to parent height
        // this will "add" bottom padding to the page
        _page[0].style.minHeight = (Math.floor(cards.length / cardsPerRow) -1)* (CARD_HEIGHT + MARGIN_TOP) + 'px';
    };

    var addMapCardsReflowResizeListener = function () {

        // add listener to reflow on window resize
        $(window).on('resize', function (e, i) {
            if (_state === "small") {
                reflowMapCards();
            }
            else {
                resizeBigMaps();
            }
        });

        // to reflow when the page loads. wouldn't work without the setTimeout
        setTimeout(function () {
            reflowMapCards();
        }, 0);
    };

    self.closeOpenBigMap=function() {
        if (_state === "big" ) {
            $(".close-button").trigger("click");
        }
    };

    self.init = function () {
        console.log("init EVAtlas");
        _page = $('#page');
        _state = "small";
        $(document).keyup(function(event) {
            // esc key
            if (event.which === 27) {
                self.closeOpenBigMap();
            }
        });
        self._atlasUsedOnce = EV.localStorage.getItem("atlasUsedOnce") != null;
        if (EV.isClient) {
            Evernote.events.onNoteCreated.addListener(function(note) {
//                console.log("onNoteCreated",note);
                var noteObj = JSON.parse(note.note);
                self.reloadIfUpdated(noteObj);
            });
            Evernote.events.onNoteUpdated.addListener(function(note) {
//                console.log("onNoteUpdated",note);
                var noteObj = JSON.parse(note.note);
                self.reloadIfUpdated(noteObj);
            });
            Evernote.events.onNoteDeleted.addListener(function(note) {
//                console.log("onNoteDeleted",note);
                var noteObj = JSON.parse(note.note);
                self.reloadIfUpdated(noteObj);
            });
            Evernote.events.onNetworkReachabilityChanged.addListener(function(result) {
                if (result.networkReachable) {
                    if (_geocodingFailed) {
                        // the network is back! remove loading bar, and reload page
                        self.updateLoadingStatus(100);
                        window.location.reload(false);
                    }
                }
            });
        }
    };
    self.validNoteLatLng = function(note) {
        if (note == null || note.attributes == null) {
            return false;
        }
        return self.Geocoder.validLatLng(note.attributes.latitude,note.attributes.longitude);
    };
    self.locationChange = function(note, oldNote) {
        if(note.active !== 1 &&
            self.validNoteLatLng(oldNote)) {
            // the note was deleted and used to be valid
            return true;
        }
        if (!self.validNoteLatLng(note)) {
            if (self.validNoteLatLng(oldNote)){
                // formally valid note location now invalid,
                // so update
                return true;
            } else {
                // neither has good location, so no need to update
                return false;
            }
        }
        if (!self.validNoteLatLng(oldNote)) {
            // old one not valid, so if new is valid, update otherwise
            // don't need to
            return self.validNoteLatLng(note);
        }
        // we know old and new notes are valid, update if they are different
        return note.attributes.latitude !== oldNote.attributes.latitude ||
            note.attributes.longitude !== oldNote.attributes.longitude;

    };
    var debouncedWindowReload = _.debounce(function() {
//        console.log("would reload");
        window.location.reload(false);
    }, 7000);
    self.reloadIfUpdated = function(note) {
        var oldNote = self.getMatchingOldNote(note);
        if (self.locationChange(note, oldNote) ) {
            debouncedWindowReload();
        }
    };

    self.getMatchingOldNote = function(idObj) {
        // find id in existing notes
        var currentNotes = null;
        if(_cards[0] != null ) {
            currentNotes = _cards[0].getNotes();
        }
        var matchNote = _.find(currentNotes, function(note) {
            return note.uid === idObj.uid || note.guid === idObj.guid;
        });
        return matchNote;
    };
    self.resetView = function() {
        console.log("resetting view");
        self.scrollToTop = true;
        $(".card-back-container.active").find(".card-back").siblings(".close-button").click();
        setTimeout(function() {
           self.scrollToTop = false;
        },900);
    };

    self.createLoadingCard = function() {
        var loadingCard = new Card(1, {loading:true});
        loadingCard.setPosition(1);
        loadingCard.setNotes([]);
        loadingCard.setTitle(EV.i18n.L("Loading..."));
        loadingCard.drawCardHeader();

        loadingCard.getSelector().hide();
        return loadingCard;
    };
    self.createFLECard = function() {
        var fleCard = new FLECard(_maxCards-1);
        fleCard.createDomElement();
        return fleCard;
    };

    self.createAllNotesCard = function (notes) {
        console.log("createAllNotesCard");
        var card = new Card(0);
        _cards[0] = card;
        card.setNotes(notes);
        card.setPosition(0);
        card.setTitle(EV.i18n.L("All Notes"));
        card.setSuperTitle(EV.i18n.L("Evernote Atlas"));

        card.drawAllNotesOnMap();
        card.zoomMapToNoteBounds();
        card.drawCardHeader();

        var loadingCard = self.createLoadingCard();

        setTimeout(function () {
            reflowMapCards();
            card.getSelector().show();
            loadingCard.getSelector().show();

            card.setOpacity(1);
            loadingCard.setOpacity(1);
        }, 0);
    };

    self.createCards = function (notes) {
        console.log("createCards");
        addLocalStoreGeoToNotes(notes);
        var urlVars = EvHelper.getUrlVars();

        var clusters = self.groupAndChooseNotesByLocation(notes, urlVars);
        var mapIdx = 1;

        console.log("start map clusters");
        $('#atlas-card-1').remove();

        mapIdx = mapCluster(clusters[0], "locality", mapIdx);
        mapIdx = mapCluster(clusters[1], "state", mapIdx);
        mapCluster(clusters[2], "country", mapIdx);
        console.log("end map clusters");
        var mapCard = $('.atlas-card');

        if (notes.length < 5 ||
            !self._atlasUsedOnce) {
            var fleCard = self.createFLECard();
            fleCard.show();
        }

        addMapCardsReflowResizeListener();

        mapCard.not("#atlas-card-0").each(function (i, e) {
            $(e).css("opacity", "0");
            $(e).find(".title").css("opacity", "0");
        });

        setTimeout(function () {
            mapCard.not("#atlas-card-0").each(function (i, e) {
                $(e).transition({opacity:"1"}, 400);
                $(e).find(".title").css("opacity", "1");
            });
        }, 1);
    };
    self.setLanguage = function (lang) {
        _lang = lang;
    };
    self.getLanguage = function () {
        return _lang;
    };
    self.addUserLinks = function () {
        var _optionTmplStr = _.trim($("#option-tmpl").html());
        var _optionTmpl = _.template(_optionTmplStr);
        //        debugger;
        var users = [];
        $.each(userData, function (key, value) {
            var user = {};
            user["userId"] = key;
            user["numRecords"] = value.length;
            users.push(user);
        });
        users = _.sortBy(users, function (user) {
            return -1 * user.numRecords;
        });
        var hash = {users:users};
        var html = _optionTmpl(hash);
        $("#container").append($.parseHTML(html));
    };

    var userDataToNotes = function (locations) {
        // array of objects locations
        // note obj has attributes.latitude, attributes.longitude
        var notes = [];
        $.each(locations, function (idx, location) {
            //            console.log(location);
            var note = {};
            note["attributes"] = {};
            note["attributes"]["latitude"] = location[1];
            note["attributes"]["longitude"] = location[0];
            note["title"] = location[1] + "," + location[0];
            notes.push(note);
        });
        return notes;
    };

    self.showLoadingCard = function() {
        var mapCard1 = $("#atlas-card-1");
        mapCard1.children().not(".title").each(function(i, e) {
            $(e).css("opacity", "0");
        });
        var title = mapCard1.find(".title");
        title.addClass("loading");
        title.css("opacity", "1");
        mapCard1.unbind('click');
    };
    self.findBigCard = function() {
        console.log(_cards);
        var card =  _.find(_cards, function (card) {
            return (card && card.state === "big");
        });
        return card;
    };
    self.restoreState = function (state) {
        console.log("");
        console.log("restoreState listener called");
        console.log(state);
        if (state != null) {
            console.log("restoring state, position", state.state,state.cardPosition);
            if (state.state != null){
                if ( state.state === "small") {
                    var card = self.findBigCard();
                    console.log(card);
                    if(card != null) {
                        card.triggerBigToSmall();
                    }
                } else if (state.state === "big")  {
                    _cards[state.cardPosition].triggerSmallToBig();
                }
            }
        }
    };
    return self;
}();

if (typeof(EV) !== "undefined" &&
    EV.drawAtlas === true) {
    EV.ready().then(function () {
        var urlvars = EvHelper.getUrlVars();
        EVAtlas.updateLoadingStatus(0);
        EVAtlas.setLanguage(EV.lang);
        if (EV.isClient) {
            if (Evernote.events != null &&
                Evernote.events.onResetView != null &&
                Evernote.events.onResetView.addListener != null) {
                  Evernote.events.onResetView.addListener(EVAtlas.resetView);
            }
        }

        EV.i18n.onReady(function () {
            $.when(EVAtlas.getNotesProm()).then(function (notes) {
//                EV.localStorage.clear();
                EVAtlas.init();
                if (notes.length === 0) {
                    EVAtlas.updateLoadingStatus(100);
                    var fleCard = EVAtlas.createFLECard();
                    fleCard.show();
                    return;
                }
//                EV.events.onRestoreNavigationState.addListener(function(state) {
//                    EVAtlas.restoreState(state);
//                });
                EVAtlas.createAllNotesCard(notes);
                EVAtlas.showLoadingCard();
                var addToProm = EVAtlas.geocodeResultsMapboxProm(notes);
                addToProm.then(function () {
                    EVAtlas.createCards(notes);
                    EVAtlas.addSmallToBigClickEvent();
                    EVAtlas.updateLoadingStatus(100);
                });
            });
        });
    });
}
