/*jshint sub:true */

// for development only http://javascriptweblog.wordpress.com/2010/06/01/a-tracer-utility-in-2kb/

String.prototype.times = function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
};

var tracer = {
    nativeCodeEx: /\[native code\]/,
    indentCount: -4,
    tracing: [],

    traceMe: function(func, methodName) {
        var traceOn = function() {
                var startTime = +new Date;
                var indentString = " ".times(tracer.indentCount += 4);
                console.info(indentString + methodName + '(' + Array.prototype.slice.call(arguments).join(', ') + ')');
                var result = func.apply(this, arguments);
                console.info(indentString + methodName, '-> ', result, "(", new Date - startTime, 'ms', ")");
                tracer.indentCount -= 4;
                return result;
        };
        traceOn.traceOff = func;
        for (var prop in func) {
            traceOn[prop] = func[prop];
        }
        console.log("tracing " + methodName);
        return traceOn;
    },

    traceAll: function(root, recurse) {
        if ((root === window) || !((typeof root === 'object') || (typeof root === 'function'))) {return;}
        for (var key in root) {
            if ((root.hasOwnProperty(key)) && (root[key] != root)) {
                var thisObj = root[key];
                if (typeof thisObj == 'function') {
                    if ((this != root) && !thisObj.traceOff && !this.nativeCodeEx.test(thisObj)) {
                        root[key] = this.traceMe(root[key], key);
                        this.tracing.push({obj:root,methodName:key});
                    }
                }
                recurse && this.traceAll(thisObj, true);
             }
        }
    },

    untraceAll: function() {
        for (var i=0; i<this.tracing.length; ++i) {
            var thisTracing = this.tracing[i];
            thisTracing.obj[thisTracing.methodName] =
                thisTracing.obj[thisTracing.methodName].traceOff;
        }
        console.log("tracing disabled");
        tracer.tracing = [];
    }
};

// usage:
// Timer.timepoint("1");
// Timer.timepoint("1a");
// Timer.timepoint("1b");
// console.log(Timer.report());
// result:
// ["1 to 1a: 0", "1a to 1b: 16", "1b to 1c: 1078"]

var Timer = function () {
    var self = {};
    var timeLabels = [];
    self.timepoint = function(label) {
        timeLabels.push([label, new Date()]);
    };

    self.report = function() {
        var last = null;
        var results = [];
        for (var i=0; i < timeLabels.length;i++) {
            var cur = timeLabels[i];
            if (last != null) {
                var elapsed = (cur[1].getTime() -last[1].getTime());
                var label = last[0] + " to " + cur[0];
                results.push(label + ": " + elapsed);
            }
            last = cur;
        }
        return results;
    };

    return self;
}();

var EvHelper = function() {
    var self = {};

    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    self.loadScriptProm = function(url) {
        var dfd = $.Deferred();
        self.loadScript(url, function() {
            dfd.resolve();
        });
        return dfd.promise();
    };

    self.loadScript = function(url, callback) {
        // jquery unhelpfully substitutes an ajax get when attaching a script to the dom.
        // This then fails due to CEF's local file security policy

        // http://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState === "loaded" ||
                    script.readyState === "complete"){
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            script.onload = function(){
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    self.imagesTmpl = _.template('<li><span id="{{articleId}}" class="image-snippet"><span class="image-snippet-hold">' +
        '{{image}}' +
        '</span>' +
        '</span></li>');
    self.imagesTmpl2 = _.template('<li>' +
        '{{image}}' +
        '</li>');

    self.snippetTmpl = _.template('<div id="{{articleId}}" class="snippet"><div class="snippet-hold">{{image}}' +
        '<div class="title">{{title}}</div>'+
        '<div class="story"><span class="date">{{created_date}}</span><span class="text">{{snippet}}</span></div>' +
        '</div></div>');

    self.searchesPulldownTmpl2 = _.template('<option value="{{guid}}">{{name}}</option>');

    self.noteToImageHtml = function(note, tmpl) {
        var data = {};
        data.articleId = 'article-' + note.guid;
        data.title = note.title;

        if (note.largestResourceMime != null && note.thumbsquare!=null) {
            data.image = '<img src="' + note.thumbsquare + '" height="75px" width="75px">';
        } else {
            data.image = '';
        }
        return tmpl (data);
    };

    self.htmlEncode = function(value) {
        return $('<div/>').text(value).html();
    };

    self.htmlDecode = function(value) {
        return $('<div/>').html(value).text();
    };

    self.noteToHtml = function (note, articleTmpl) {
        var newNoteBlock = articleTmpl.clone();
        newNoteBlock.attr('id', 'article ' +note.guid);
        newNoteBlock.find('.title').html(note.title);
        var snippet = note.content;
        if (snippet) {
            var date = new Date(note.created);
            snippet = $.trim(snippet.replace(/\t *\n* */i, " "));

            newNoteBlock.find('.text').html(snippet);
            newNoteBlock.find('.meta').html(date.toDateString());
        }
        var img = newNoteBlock.find('img');
        if (note.largestResourceMime) {
            img.show();
            img.attr('src',note.thumbsquare);
        } else {
            img.hide();
        }
        newNoteBlock.show();
        return newNoteBlock;
    };

    self.busyPause = function (millis) {
        var date = new Date();
        var curDate = null;

        do { curDate = new Date(); }
        while(curDate-date < millis);
    };

    self.frameHtmlTmpl = _.template('<div class="app">'+
        '<div class="title-bar">' +
        '<span class="title">{{title}}</span>' +
        //            "<div class='close-button'></div>" +
        '</div>' +
        '<iframe src="{{url}}" class="widget-frame" style="height:{{height}};"></iframe>' +
        '</div>');

    /* Return the HTML to generate a new Widget, with data used to fill in Widget data */
    self.makeFrameHtml = function(data) {
        var url = _.template('{{fileName}}/{{fileName}}.html', data);
        if (data["properties"] != null) {
            url = self.makeUrl(url, data["properties"]);
        }
        data.url = url;
        return  self.frameHtmlTmpl(data);
    };

    self.makeFrameHtmlFromURL = function(url, height) {
        var data = { 'url': url, 'height': height +'px'};
        var template = "<div class='app'>"+
            "<div class='title-bar'><span class='title'>url: {{url}} </span></div>" +
            "<iframe src='{{url}}' class='widget-name'"+
            'style="height:{{height}};"></iframe></div>';
        return _.template(template, data);
    };

    self.makeSavedSearchFrameHtml = function(data) {
        var template = "<div class='app' id='{{appId}}'>"+
            "<div class='title'>{{title}}<span class='removeWidget' id='close-{{appId}}'>"+
            "<img src='img/edit-rtf-close.png'></span></div>"+
            "<iframe src='{{fileName}}/{{fileName}}.html' name='{{frameId}}' id='{{frameId}}' class='saved-search'></iframe></div>";

        return _.template(template, data);
    };

    self.getConfigDataAsync = function(dirname) {
        var url = '' +dirname + '/widgetConfig.json';
        return $.getJSON(url,{});
    };

    // parseUri 1.2.2
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License
    // http://blog.stevenlevithan.com/archives/parseuri
    self.parseUri = function  (str) {
        var o   = self.parseUri.options,
            m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i   = 14;

        while (i--) {uri[o.key[i]] = m[i] || "";}

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) {uri[o.q.name][$1] = $2;}
        });

        return uri;
    };

    self.parseUri.options = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
            name:   "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };

    /* Formats URL-style strings into a hash with variables. Use with window.location.href to parse current url */
    self.parseUrlVars = function(urlstring) {
        var vars = [], hash;
        var hashes = urlstring.slice(urlstring.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        var URLVarsOverride={};
        //         URLVarsOverride = {notesPerCity:3, maxCards:4};
        //         URLVarsOverride = {notesPerCity:3, notesPerState:2, notesPerCountry:2,
        //            clear: true,
        //        URLVarsOverride={ al: 0};
        return $.extend(URLVarsOverride, vars);

    };
    self.getUrlVars = function () {
        return self.parseUrlVars(window.location.href);
    };


    /* Given a tidy hash and a base url, this generates a url with variables */
    self.makeUrl = function(baseurl, varmap) {
        var url = baseurl + "?";

        for (var key in varmap) {
            url += "&" + key + "=" + encodeURIComponent(varmap[key]);
        }

        return url;
    };

    /* Hopefully temporary function to strip weird foo.list type members of objects and transform
     * them into simply "foo" being a list. For example, in the Thrift API for the browser version
     * returns stuff like results.notes.list rather than just having results.notes being a list.
     * It's very inconsistent and strange. Similarly, there are .map members as well in some places.
     *
     * Now, another problem is, since we modeled the client API on the web Thrift API, that one is
     * tainted with useless .list/.map members too. In the long run, we should change both the
     * client and browser APIs themselves to not provide this strange way of doing things, with
     * the client one being both easier to fix and the one that's more imperative to fix.
     *
     * Ultimately, this function shouldn't be used at all, as it's a slow recurse-everything
     * function.
     */
    self.stripObjectMismembers = function(object) {
        if (object.list != null) {
            object = object.list;
        }

        $.each(object, function(index, member) {
            if (member !== null && typeof(member) === "object") {
                object[index] = self.stripObjectMismembers(member);
            }
        });

        return object;
    };

    /* Platform detection -- tells us what platform we're on. Returns one of:
     * "browser", "client"
     */
    self.getPlatform = function() {
        if (window.Evernote != null) {
            return "client";
        } else {
            return "browser";
        }
    };

    /* Get the GUID, unless all we have is the local UID */
    self.getRightUid = function (object) {
        if (object.guid == null) {
            throw("Wrong input to getRightUid -- needs obj.guid (and obj.uid)");
        }

        if (object.guid === "00000000-0000-0000-0000-000000000000") {
            return object.uid;
        } else {
            return object.guid;
        }
    };

    return self;
}();
