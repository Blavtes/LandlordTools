//  Copyright (c) 2014 Evernote. All rights reserved.

requirejs.config({
  paths: {
    Mac: '../Mac/Source',
    Shared: '../Shared/Source',
    SharedCSS: '../Shared/CSS',
    text: '../Shared/Source/External/text'
  }
});

require(['Mac/ENCPPlatform', 'Mac/ENCPNoteProcessor', 'Shared/Utilities/ENCPLogger'],
  function (ENCPPlatform, ENCPNoteProcessor, ENCPLogger) {

    // TODO: Remove globals
    window.encpPlatform = new ENCPPlatform();
    ENCPLogger.outputFunction = window.encpPlatform.showLog.bind(window.encpPlatform);

    var noteProcessor = new ENCPNoteProcessor(document.body);
    ENCPLogger.logInfo("NoteProcessorApp has been loaded");
    window.encpPlatform.applicationDidLoad(noteProcessor);
  });
