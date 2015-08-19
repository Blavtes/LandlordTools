//  Copyright (c) 2014 Evernote. All rights reserved.

requirejs.config({
  paths: {
    Mac: '../Mac/Source',
    CSS: '../Mac/CSS',
    Shared: '../Shared/Source',
    SharedCSS: '../Shared/CSS',
    text: '../Shared/Source/External/text'
  }
});

require(['Mac/ENCPPlatform', 'Shared/Utilities/ENCPLogger', 'Mac/ENCPPresenter'],
  function (ENCPPlatform, ENCPLogger, ENCPPresenter) {
    // TODO: Remove globals
    window.encpPlatform = new ENCPPlatform();
    ENCPLogger.outputFunction = window.encpPlatform.showLog.bind(window.encpPlatform);
    window.encpPresenter = new ENCPPresenter();
    window.encpPresenter.setup();
    window.encpPlatform.applicationDidLoad(window.encpPresenter);
  });
