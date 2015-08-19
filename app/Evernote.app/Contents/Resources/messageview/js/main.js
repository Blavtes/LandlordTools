/* Message View -- a component used to render the conversation for Evernote
 * Messages. Written by Andrei Thorp, 2014 <athorp@evernote.com> */

/**
 * Container / namespace for the internal MVC structure of the program.
 *
 * @type {{
 *     Server: *,
 *     Runtime: *,
 *     Template: *,
 *     View: *,
 *     Controller: *,
 *     Helper: *,
 *     Defines: *
 * }}
 */
var Internal = {
    Server: null,
    Runtime: null,
    Template: null,
    View: null,
    Controller: null,
    Helper: null,
    Defines: null
};

/**
 * Container / namespace for the exports for the host environment.
 *
 * @type {*}
 */
var MessageView = {};

/**
 * @typedef {{
 *     id: string,
 *     type: string,
 *     title: string
 * }}
 */
Internal.Attachment;

/**
 * @typedef {{
 *     id: string,
 *     senderID: string,
 *     senderName: string,
 *     senderImage: string,
 *     isSelf: boolean,
 *     body: string,
 *     sentAt: string,
 *     attachments: Array.<Internal.Attachment>
 * }}
 */
Internal.Message;

Internal.Defines = function() {
    var me = {};

    // Classes
    /** @const */ me.IMAGE_FALLBACK_CLASS = 'showBackground';

    /**
     * How much a message must be on screen for it to be considered 'visible'
     *
     * @type {number} percent
     */
    me.MESSAGE_ON_SCREEN_PERCENT = 55;

    /**
     * How long we should wait to decide that the user has stopped scrolling
     *
     * @type {number} milliseconds
     */
    me.SCROLL_JITTER_TIMEOUT = 300;

    // HTML node type defines
    /** @type {number} */ me.NODE_ELEMENT_NODE = 1;
    /** @type {number} */ me.NODE_ATTRIBUTE_NODE = 2;
    /** @type {number} */ me.NODE_TEXT_NODE = 3;
    /** @type {number} */ me.NODE_CDATA_SECTION_NODE = 4;
    /** @type {number} */ me.NODE_ENTITY_REFERENCE_NODE = 5;
    /** @type {number} */ me.NODE_ENTITY_NODE = 6;
    /** @type {number} */ me.NODE_PROCESSING_INSTRUCTION_NODE = 7;
    /** @type {number} */ me.NODE_COMMENT_NODE = 8;
    /** @type {number} */ me.NODE_DOCUMENT_NODE = 9;
    /** @type {number} */ me.NODE_DOCUMENT_TYPE_NODE = 10;
    /** @type {number} */ me.NODE_DOCUMENT_FRAGMENT_NODE = 11;
    /** @type {number} */ me.NODE_NOTATION_NODE = 12;

    /**
     * How frequently we should try loading failed images again.
     *
     * @type {number} milliseconds
     */
    me.IMAGE_RETRY_FREQUENCY = 5000; // 5 seconds

    return me;
}();

Internal.Server = function() {
    var me = {};

    /**
     * Opens the given attachment by id in the host environment.
     *
     * @param {string} id Attachment ID
     *
     * @suppress {undefinedVars|missingProperties}
     */
    me.openAttachment = function(id) {
        console.log('To Server: open attachment', id);

        try {
            Evernote.openAttachment(id);
        } catch (err) {
            console.warn('Couldn\'t run native function:', err.message);
        }
    };

    /**
     * Notifies the host environment that a message has been viewed.
     *
     * @param {string} id Message ID
     *
     * @suppress {undefinedVars|missingProperties}
     */
    me.messageViewed = function(id) {
        console.log('To Server: message viewed', id);

        try {
            Evernote.messageViewed(id);
        } catch (err) {
            console.warn('Couldn\'t run native function:', err.message);
        }
    };

    /**
     * Notifies the host environment that a message has finished loading.
     *
     * @param {string} id Message ID
     *
     * @suppress {undefinedVars|missingProperties}
     */
    me.messageLoaded = function(id) {
        console.log('To Server: message loaded', id);

        try {
            Evernote.messageLoaded(id);
        } catch (err) {
            console.warn('Couldn\'t run native function:', err.message);
        }
    };

    return me;
}();

Internal.Runtime = function() {
    var me = {};
    /** @type {number} */ me.timeoutID = -1;
    /** @type {Array.<Node>} */ me.lastSeenMessages = [];
    /** @type {Array.<Node>} */ me.currentMessages = [];

    /**
     * Checks if the current platform is Mac.
     *
     * @return {boolean}
     */
    me.isMacPlatform = function() {
        var platform = window['TEST_PLATFORM'];

        if (platform === 'MAC') {
            return true;
        } else if (platform === 'WIN') {
            return false;
        } else if (platform != null && platform !== '') {
            console.error("Invalid platform:", platform);
        }

        return (navigator.platform.indexOf('Mac') >= 0);
    };

    /**
     * Loads the CSS file for the specified dist target.
     *
     *
     * @param {string} opt_type either 'mac' or 'win'
     */
    me.loadCSS = function(opt_type) {
        /** @type {string} */
        var cssFile = '<link rel="stylesheet" href="css/win-main.css">';

        if (opt_type == null) {
            if (me.isMacPlatform()) {
                opt_type = 'mac';
            } else {
                opt_type = 'win';
            }
        }

        if (opt_type === 'mac') {
            cssFile = '<link rel="stylesheet" href="css/mac-main.css">';
        } else if (opt_type === 'win') {
            cssFile = '<link rel="stylesheet" href="css/win-main.css">';
        }

        /** @type {Node} */ var div = document.createElement('div');
        div.innerHTML = cssFile;
        document.body.appendChild(div.childNodes[0]);
    };

    /**
     * Attempts to load the given image path for the given image object. If
     * it fails, then we write the desired URL to an attribute and then
     * continue. If it succeeds, then we don't write this attribute.
     *
     * @param {Node} image
     * @param {string} desiredSrc
     */
    me.tryLoadImage = function(image, desiredSrc) {
        if (desiredSrc == null || desiredSrc === '') {

            console.warn('tryLoadImage called invalidly');
            return;
        }

        image.onerror = function _imageOnError() {
            image.setAttribute('data-desired-src', desiredSrc);
            image.style['opacity'] = '0';

            // Enables the placeholder image
            var parent = image.parentNode;
            if (parent != null && parent.classList.contains('imageCropper')) {
                parent.classList.add(Internal.Defines.IMAGE_FALLBACK_CLASS);
            }
        };

        image.onload = function _imageOnLoad() {
            image.removeAttribute('data-desired-src');
            image.style['opacity'] = '1';
        };

        image.src = null;
        image.src = desiredSrc;
    };

    /**
     * Periodically checks all of the images in the message list to see if
     * their URLs loaded successfully. If they haven't, it forces them to
     * retry. (See README.md for why we do this.)
     */
    me.imageLoadLoop = function() {
        /** @type {Node} */ var messageList;
        /** @type {NodeList} */ var images;
        /** @type {number} */ var timerID;

        timerID = setInterval(function _imageLoadLoop() {
            messageList = Internal.Helper.getMessageList();

            // Probably means we're running unit tests, but best to just bail
            // out if things get this crazy in general.
            if (messageList == null) {
                console.warn('Couldn\'t find messageList, exiting imageLoadLoop');
                clearInterval(timerID);
                return;
            }

            images = messageList.querySelectorAll('img[data-desired-src]');

            for (var i = images.length - 1; i >= 0; i--) {
                var desiredSrc = images[i].getAttribute('data-desired-src');
                me.tryLoadImage(images[i], desiredSrc);
            }
        }, Internal.Defines.IMAGE_RETRY_FREQUENCY);
    };

    /**
     * Looks for changes in the window's scroll position and intelligently
     * informs the native client when a new message is viewed.
     */
    me.handleOnScreenMessages = function() {
        /** @type {Node} */ var msg = null;
        clearTimeout(me.timeoutID);

        me.timeoutID = setTimeout(function() {
            me.currentMessages = Internal.View.getOnScreenMessages();
            if (me.currentMessages == null) {
                return;
            }

            // Count from bottom to top so that latest message is reported
            // as viewed before previous ones. Helps simplify native logic.
            for (var i = me.currentMessages.length - 1; i >= 0; i--) {
                msg = me.currentMessages[i];

                if (me.lastSeenMessages.indexOf(msg) === -1) {
                    var messageID = msg.getAttribute('data-message-id');
                    Internal.Server.messageViewed(messageID);
                }
            }

            me.lastSeenMessages = me.currentMessages;
        }, Internal.Defines.SCROLL_JITTER_TIMEOUT);
    };

    return me;
}();

Internal.Helper = function() {
    var me = {};

    /**
     * The index of node relative to parent node.
     *
     * @param {Node} node
     * @return {number}
     */
    me.index = function(node) {
        var ret = 0;
        while ((node = node.previousSibling)) {
            ret++;
        }
        return ret;
    };

    /**
     * Returns the message list element.
     *
     * @return {Node}
     */
    me.getMessageList = function() {
        var list = document.querySelector('#message-list');

        if (list == null) {
            console.warn('Couldn\'t find message list container!');
            return null;
        }

        return list;
    };

    return me;
}();

Internal.Template = function() {
    var me = {};

    /** Stores document fragment versions of templates. This was done upon
     * realizing reading the DOM and generating each template takes about
     * 0.1ms. Ouch.
     *
     * @dict
     */
    var cachedTemplates = {
    };

    /**
     * Returns a document fragment representing the specified template.
     *
     * @param {!string} templateName
     * @return {DocumentFragment}
     */
    me.getTemplate = function(templateName) {

        // Hit cache first
        if (cachedTemplates[templateName] != null) {
            var cachedResult = cachedTemplates[templateName].cloneNode(true);
            return cachedResult;
        }

        /** @type {Node} */
        var template = document.querySelector('#' + templateName);
        /** @type {DocumentFragment} */
        var frag = document.createDocumentFragment();
        /** @type {Node} */
        var tmpDiv = document.createElement('div');

        // Couldn't find template? Srs err.
        if (template == null) {
            console.error('Cant find template', templateName);
            return null;
        }

        // Security says that this isn't a problem, since we're loading
        // dircetly from our HTML file.
        tmpDiv.innerHTML = template.innerHTML;

        while (tmpDiv.hasChildNodes()) {
            // We only accept elements in templates. Stuff like text nodes
            // are filtered.
            if (tmpDiv.firstChild.nodeType !== Node.ELEMENT_NODE) {
                tmpDiv.removeChild(tmpDiv.firstChild);
            } else {
                frag.appendChild(tmpDiv.firstChild);
            }
        }

        // Store template fragment in memory for the next time
        cachedTemplates[templateName] = frag.cloneNode(true);

        return frag;
    };

    /**
     * Extracts the attachment template from the DOM and returns a version
     * that's ready for editing.
     *
     * @param {!Internal.Attachment} attachment
     * @return {DocumentFragment}
     */
    me.makeAttachment = function(attachment) {
        /** @type {DocumentFragment} */
        var template = me.getTemplate('attachment-template');
        /** @type {Node} */
        var mainDiv = null;

        // TODO:athorp:2014-08-12 enforce that type must be {note,notebook}
        if (template == null ||
            attachment == null ||
            attachment.id == null ||
            attachment.type == null) {

            console.error('Couldn\'t make attachment template!');
            return null;
        }

        attachment.title = attachment.title || 'Untitled';
        mainDiv = template.querySelector('.attachment');

        mainDiv.setAttribute('data-attachment-id', attachment.id);
        mainDiv.classList.add(attachment.type);
        mainDiv.textContent = attachment.title;

        mainDiv.onclick = function() {
            Internal.Server.openAttachment(attachment.id);
        };

        return template;
    };

    var whiteListSchemes = ['http', 'https', 'mailto', 'ftp'];

    /**
     * A white list would be nicer, but this works as well.
     * Inspired by https://github.com/punkave/sanitize-html
     *
     * @param {string} originalHref
     * @return {string}
     */
    var sanitizeHyperlink = function(originalHref) {
        var href = originalHref;

        // So we don't get faked out by a hex or decimal escaped javascript URL #1
        href = decodeURIComponent(href) || href;

        // Browsers ignore character codes of 32 (space) and below in a surprising
        // number of situations. Start reading here:
        // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab
        href = href.replace(/[\x00-\x20]+/, '');

        // Clobber any comments in URLs, which the browser might
        // interpret inside an XML data island, allowing
        // a javascript: URL to be snuck through
        href = href.replace(/<\!\-\-.*?\-\-\>/g, '');

        // Case insensitive so we don't get faked out by JAVASCRIPT #1
        var matches = href.match(/^([a-zA-Z]+)\:/);
        if (!matches) {
            return originalHref || '#';
        }
        var scheme = matches[1].toLowerCase();
        if (whiteListSchemes.indexOf(scheme) === -1) {
            return '#';
        }
        return originalHref.trim() || '#';
    };

    /**
     * Attempts to safely load the given string into the given element, while
     * avoiding script injection and respecting the whitelist of elements
     * that we support, and their attributes.
     *
     * @param {Node} node
     * @param {string} textContent
     */
    me.transformAndAppendContent = function(node, textContent) {
        /** @type {!Element} */
        var root = document.createElement('div');
        /** @type {boolean} */
        var success = true;

        var parts = [textContent];

        /**
         * Walks over parts.
         *
         * @param {Function} fn
         * @return {Array}
         */
        var transformParts = function(fn) {
            var newParts = [];
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                var result = typeof part === 'string' ? fn(part) : part;
                if (result) {
                    newParts = newParts.concat(result);
                }
            }
            return newParts;
        };

        /**
         *
         * @param {RegExp} rx
         * @param {Function} fn
         */
        var transform = function(rx, fn) {
            parts = transformParts(function _transformFunction(part) {
                // var rx = /\n|<br\/?>(<\/br>)?/gi;
                var list = [];

                var m;
                var left = part;

                // Reset the regular expression
                rx.lastIndex = 0;

                while (m = rx.exec(left)) {
                    // console.log(i++, 'm', m, m.index, left, list);
                    if (m.index > 0) {
                        // console.log('left:', left.substring(0, m.index));
                        list.push(left.substring(0, m.index));
                    }
                    var element = fn(m);
                    if (element || element === '') {
                        // console.log('el:', element);
                        list.push(element);
                    }
                    else if (element == null) {
                        list.push(m[0]);
                    }
                    left = left.substring(m.index + m[0].length, left.length);
                    // console.log('over:', left, list);

                    // Reset the regular expression
                    rx.lastIndex = 0;

                }
                if (left) {
                    list.push(left);
                }
                return list;
            });
        };

        // Transform \n and <br>
        transform(/\n|<br\/?>(<\/br>)?/gi, function() {
            return document.createElement('br');
        });

        // Transform <a>
        transform(/<a\s+href\s*=\s*\"([^\"]*?)\"\s*>(.*?)<\/a>/gi, function(m) {
            var href = sanitizeHyperlink(m[1]);
            var element = null;
            if (href) {
                element = document.createElement('a');
                element.setAttribute('href', href);
                element.textContent = m[2] || href;
            }
            return element;
        });

        // From https://mathiasbynens.be/demo/url-regex
        // Inspired by https://gist.github.com/dperini/729294
        // Modified!
        var rxWebURL = new RegExp(
            // Word boundaries
            '\\b' +
            // protocol identifier
            '(?:(?:https?|ftp)://)' +
            // user:pass authentication
            '(?:\\S+(?::\\S*)?@)?' +

            // HOST! We want it
            '(' +
            '(?:' + (
                // IP address exclusion
                // private & local networks
                '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
                '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
                '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
                // IP address dotted notation octets
                // excludes loopback network 0.0.0.0
                // excludes reserved space >= 224.0.0.0
                // excludes network & broacast addresses
                // (first & last IP address of each class)
                '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
                '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
                '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))'
                ) +
            '|' + (
                // host name
                '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
                // domain name
                '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
                // TLD identifier
                '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))') +
            ')' +
            ')' +

            // port number
            '(?::\\d{2,5})?' +
            // resource path
            '(?:/\\S*)?',
            'gi'
        );

        // Transform http(s), ftp
        transform(rxWebURL, function(m) {
            var element = document.createElement('a');
            var href = sanitizeHyperlink(m[0]);
            if (href) {
                element.setAttribute('href', href);
                element.textContent = href || '#';
                return element;
            }
        });

        // Transform email and me@me.com
        // Inspired by http://www.regular-expressions.info/examples.html
        transform(/\b(?:mailto:)?([a-z0-9!#$%&'*+/=?^_`\{\|\}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:localhost|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?))\b/gi, function(m) {
            var element = document.createElement('a');
            var href = sanitizeHyperlink(m[1]);
            if (href) {
                element.setAttribute('href', 'mailto:' + href);
                element.textContent = href;
                return element;
            }
        });

        // Smile :)
        if (Internal.Runtime.isMacPlatform()) {
            transform(/:\)|:-\)|:=\)/gi, function() {
                return '😃';
            });
        }

        // Merging into DOM
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];

            if (typeof part === 'string') {
                part = document.createTextNode(part);
            }

            root.appendChild(part);
        }

        if (success === false) {
            console.warn('Failed to safe load content:', textContent);
            node.appendChild(document.createTextNode('Malformed message!'));
            return;
        }

        // Copy everything back into the given node
        while (root.firstChild) {
            node.appendChild(root.firstChild);
        }
    };

    /**
     * Extracts the message template from the DOM and returns a version
     * that's ready for editing.
     *
     * @param {!Internal.Message} message
     * @return {DocumentFragment}
     */
    me.makeMessage = function(message) {
        /** @type {DocumentFragment} */
        var template = me.getTemplate('message-template');

        if (template == null ||
            message == null ||
            message.id == null ||
            message.senderID == null) {

            console.error('Couldn\'t make message template!');
            return null;
        }

        message.senderName = message.senderName || '';
        message.senderImage = message.senderImage || 'null';
        message.body = message.body || '';
        message.sentAt = message.sentAt || '';
        message.attachments = message.attachments || [];
        message.timestamp = message.timestamp || 1;
        message.isSelf = message.isSelf || false;

        /** @type {Node} */ var main = template.querySelector('.message');
        /** @type {Node} */ var imgCrop = template.querySelector('.imageCropper');
        /** @type {Node} */ var image = template.querySelector('.senderImage');
        /** @type {Node} */ var name = template.querySelector('.senderName');
        /** @type {Node} */ var body = template.querySelector('.body');
        /** @type {Node} */ var content = template.querySelector('.content');
        /** @type {Node} */ var sentAt = template.querySelector('.sentAt');
        /** @type {Node} */ var attachments = template.querySelector('.attachments');

        main.setAttribute('data-message-id', message.id);
        if (message.isSelf) {
            main.setAttribute('class', 'message right');
        }
        if (message.senderImage != null && message.senderImage !== 'null') {
            Internal.Runtime.tryLoadImage(image, message.senderImage);
        } else {
            imgCrop.classList.add(Internal.Defines.IMAGE_FALLBACK_CLASS);
        }
        if (message.body == '') {
            body.classList.add('empty');
        }
        name.textContent = message.senderName;
        name.setAttribute('data-sender-id', message.senderID);
        me.transformAndAppendContent(content, message.body);
        sentAt.textContent = message.sentAt;
        sentAt.setAttribute('data-server-timestamp', message.timestamp);

        for (var i = 0; i < message.attachments.length; i++) {
            attachments.appendChild(me.makeAttachment(message.attachments[i]));
        }

        return template;
    };

    return me;
}();

Internal.View = function() {
    var me = {};

    /**
     * Scrolls to the bottom of the message list.
     */
    me.scrollToBottom = function() {
        window.scrollTo(0, document.body.scrollHeight);
    };

    /**
     * Returns a reference to the message DOM element if it's already
     * been rendered. If it hasn't already been rendered, then this returns null.
     *
     * @param {string} messageID
     * @return {?Node}
     */
    me.getMessageDOMByID = function(messageID) {
        /** @type {Node} */ var messageList = Internal.Helper.getMessageList();
        /** @type {Node} */ var childNode;

        for (var i = messageList.childNodes.length - 1; i >= 0; i--) {
            childNode = messageList.childNodes[i];

            if (childNode == null ||
                    childNode.classList == null ||
                    childNode.classList.contains('message') === false) {
                console.warn('Message list contains weird node,', childNode);
                continue;
            }

            if (childNode.getAttribute('data-message-id') === messageID) {
                return childNode;
            }
        }

        return null;
    };

    /**
     * Returns whether the given message element is currently scrolled into view.
     *
     * @param {Node} message
     * @return {boolean}
     */
    me.isOnScreen = function(message) {
        var scrollTop = window.scrollY;
        var scrollBottom = scrollTop + window.innerHeight;

        // Normalized to be relative to the top of window, rather than viewport
        var elementTop = message.getBoundingClientRect().top + scrollTop;
        var elementBottom = message.getBoundingClientRect().bottom + scrollTop;

        // Generate "common interval" between the two "lines"
        var commonTop = Math.max(scrollTop, elementTop);
        var commonBottom = Math.min(scrollBottom, elementBottom);

        // Percentage that the message is on screen
        var overlapPercent = Math.max(0,
                Math.round((commonBottom - commonTop) /
                    (elementBottom - elementTop) * 100));

        return (overlapPercent >= Internal.Defines.MESSAGE_ON_SCREEN_PERCENT);

    };

    /**
     * Returns a list of messageIDs for messages that are currently on screen.
     *
     * @return {Array.<string>}
     */
    me.getOnScreenMessages = function() {
        var messagelist = Internal.Helper.getMessageList();
        if (messagelist == null) {
            console.warn('Cant check on screen messages. Maybe in test env?');
            return [];
        }
        var messages = messagelist.childNodes;
        var onScreen = [];

        for (var i = 0; i < messages.length; i++) {
            if (me.isOnScreen(messages[i])) {
                onScreen.push(messages[i]);
            }
        }

        return onScreen;
    };

    /**
     * Returns the server timestamp of the given element.
     *
     * @param {!(Node|DocumentFragment)} message
     * @return {number}
     */
    var getTimestamp = function(message) {
        var sentAtField = message.querySelector('.sentAt');
        var timestampStr = sentAtField.getAttribute('data-server-timestamp');
        return parseInt(timestampStr, 10);
    };

    /**
     * Returns the sender id of the given element.
     *
     * @param {!(Node|DocumentFragment)} message
     * @return {string}
     */
    var getSenderID = function(message) {
        var senderNameField = message.querySelector('.senderName');
        return senderNameField.getAttribute('data-sender-id');
    }

    /**
     * Returns the ID for the message represented as a node or documentfragment.
     *
     * @param {!(Node|DocumentFragment)} message
     * @return {string}
     */
    var getMessageId = function(message) {
        // This works for document fragments
        var messageField = message.querySelector('section');

        // This works for nodes
        if (messageField == null &&
            message.tagName.toLowerCase() === 'section') {

            messageField = message;
        }

        var messageId = messageField.getAttribute('data-message-id');

        if (messageId == null || messageId === '') {
            console.error('Couldn\'t find message ID!', message);
            return '';
        }

        return messageId;
    };

    /**
     * Adds a message to the message list, ordered by the timestamp field.
     *
     * @param {!(Node|DocumentFragment)} message
     */
    me.addMessage = function(message) {
        var messagelist = Internal.Helper.getMessageList();
        if (messagelist == null) {
            console.warn('Cant check on screen messages. Maybe in test env?');
            return;
        }
        var messages = messagelist.childNodes;
        var myTimestamp = getTimestamp(message);
        var myMessageId = getMessageId(message);
        var mySenderID = getSenderID(message);

        // Special case according to spec where we just always put it at bottom
        if (myTimestamp === -1) {
            messagelist.appendChild(message);
            return;
        }

        var nearestAboveTime = 99999999999;
        var nearestAboveNode = null;
        var nearestTimeDiff = -1;
        var maxTimeGap = 1000 * 60 * 20;
        var groupMessageContent = false;

        for (var i = 0; i < messages.length; i++) {
            var timestamp = getTimestamp(messages[i]);
            var senderID = getSenderID(messages[i]);

            if (timestamp > myTimestamp && timestamp < nearestAboveTime) {
                nearestAboveTime = timestamp;
                nearestAboveNode = messages[i];

                if (senderID == mySenderID) {
                    nearestTimeDiff = Math.abs(timestamp - myTimestamp);
                }
            }
        }

        if (nearestAboveNode != null) {
            messagelist.insertBefore(message, nearestAboveNode);
        } else {
            messagelist.appendChild(message);
        }

        var existingMessage = me.getMessageDOMByID(myMessageId);
        var mergeContent = function(existingMessage, lastMessage, isPrevious) {
            if (!lastMessage) {
                return;
            }

            var timestamp = getTimestamp(lastMessage);
            var senderID = getSenderID(lastMessage);
            var existingSenderID = getSenderID(existingMessage);
            var existingTimestamp = getTimestamp(existingMessage);
            if (senderID == existingSenderID) {
                var diff = Math.abs(timestamp - existingTimestamp);
                if (diff >= 0 && diff < maxTimeGap) {
                    if (isPrevious && existingTimestamp > timestamp) {
                        existingMessage.classList.add('grouped');
                    }
                    else {
                        lastMessage.classList.add('grouped');
                    }
                    return true;
                }
            }

            return false;
        };

        var merged = false;
        if (existingMessage.previousSibling && existingMessage.previousSibling) {
            merged = mergeContent(existingMessage, existingMessage.previousSibling, true);
        }
        if (existingMessage.nextSibling && !merged) {
            mergeContent(existingMessage, existingMessage.nextSibling, false);
        }

        Internal.Server.messageLoaded(myMessageId);
    };

    /**
     * Scrolls the view to show the specified message.
     *
     * @param {string} messageID
     * @param {boolean} opt_bottom
     */
    me.scrollToMessage = function(messageID, opt_bottom) {
        /** @type {Node} */ var message = me.getMessageDOMByID(messageID);

        if (opt_bottom == null) {
            opt_bottom = false;
        }

        if (message == null) {
            console.error('No message with ID', messageID);
            return;
        }

        message.scrollIntoView(!opt_bottom);
    };

    /**
     * Wipes entire display, removing everything.
     */
    me.clear = function() {
        var list = Internal.Helper.getMessageList();

        // A while loop is considerably faster than innerHTML = ''
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    };

    return me;
}();

Internal.Controller = function() {
    var me = {};

    var maxTimeThreshold = 60 * 20;

    /**
     * Creates and inserts a batch of Message objects.
     *
     * @param {Object} messages Array of Message objects
     */
    var setMessages = function(messages) {
        var frags = [];

        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];

            var messageDOM = Internal.View.getMessageDOMByID(message.id);
            var frag = Internal.Template.makeMessage(message);

            if (messageDOM == null) {
                frags.push(frag);
                continue;
            }

            // Handle updating existing messages
            if (messageDOM != null && messageDOM.parentNode != null) {
                // FIXME:athorp:2014-10-15 this should be the way that messages
                // get updated. Unfortunately, I've had to make a hack around
                // a Mac bug for now. See https://evernote.jira.com/browse/CE-471
                if (Internal.Runtime.isMacPlatform()) {
                    var oldSentAtField = messageDOM.querySelector('.sentAt');
                    var newSentAtField = frag.querySelector('.sentAt');
                    var newTimestamp = newSentAtField.getAttribute('data-server-timestamp');
                    oldSentAtField.textContent = newSentAtField.textContent;
                    oldSentAtField.setAttribute('data-server-timestamp', newTimestamp);

                    // Running this to get it to reorder the message as needed
                    messageDOM.parentNode.removeChild(messageDOM);
                    Internal.View.addMessage(messageDOM);

                } else {
                    // On windows, we don't need to do any hacks
                    messageDOM.parentNode.removeChild(messageDOM);
                    Internal.View.addMessage(frag);
                }
            } else {
                console.warn('Couldn\'t replace message!', messageDOM, frag);
            }
        }

        for (var i = 0; i < frags.length; i++) {
            Internal.View.addMessage(frags[i]);
        }
        Internal.View.scrollToBottom();

        Internal.Runtime.handleOnScreenMessages();
        return 'ok';
    };

    /**
     * Creates and inserts a message given a Message object.
     * Public interface.
     *
     * @param {Object|string} message
     * @return {string}
     */
    me.setMessage = function(message) {
        if (message == null) {
            console.error('Message required!');
            return 'Error: Message required!';
        }

        if (typeof message === 'string') {
            message = /** @type {Object} */ (JSON.parse(message));
        }

        return setMessages([message]);
    };

    /**
     * Batched version of setMessage. I.e. takes an array of Message objects
     * rather than just a single one.
     *
     * @param {Object|string} messages
     */
    me.setMessages = function(messages) {
        if (messages == null) {
            console.error('Messages required!');
        }

        if (typeof messages === 'string') {
            messages = /** @type {Object} */ (JSON.parse(messages));
        }

        return setMessages(messages);
    };

    /**
     * Sets the chat mode to allow the layout to display appropriately,
     * depending on whether the chat is 1-on-1 or group.
     *
     * @param {string} mode
     */
    me.setChatMode = function(mode) {
        if (mode == null) {
            mode = 'one-on-one';
        }

        mode = mode.toLowerCase();
        var messageList = Internal.Helper.getMessageList();
        if (mode == 'one-on-one') {
            messageList.setAttribute('class', 'one-on-one');
        } else if (mode == 'group') {
            messageList.setAttribute('class', '');
        }
    }

    return me;
}();

// Exports
MessageView.setMessage = Internal.Controller.setMessage;
MessageView.setMessages = Internal.Controller.setMessages;
MessageView.setChatMode = Internal.Controller.setChatMode;
MessageView.clear = Internal.View.clear;
MessageView.scrollToMessage = Internal.View.scrollToMessage;

// Startup
Internal.Runtime.loadCSS();
Internal.Runtime.imageLoadLoop();
window.addEventListener('scroll', Internal.Runtime.handleOnScreenMessages);
window.addEventListener('resize', Internal.Runtime.handleOnScreenMessages);
