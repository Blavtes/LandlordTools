//
//  RMTUtilityBaseInfo.m
//  RMTUtility
//
//  Created by vagrant on 15-2-6.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import "RMTUtilityBaseInfo.h"
#import <UIKit/UIDevice.h>
//#import <AdSupport/ASIdentifierManager.h>
#include <sys/sysctl.h>

@implementation RMTUtilityBaseInfo

@synthesize currentLanguage = _currentLanguage;
@synthesize currentLocale = _currentLocale;
@synthesize deviceModel = _deviceModel;
@synthesize systemVersion = _systemVersion;
@synthesize appName = _appName;
@synthesize appVersion = _appVersion;
@synthesize appBundleID = _appBundleID;
@synthesize systemType = _systemType;
- (id)initSingle
{
    self = [super init];
    if (self) {
        //init
    }
    return self;
}

- (id)init
{
    return [RMTUtilityBaseInfo sharedInstance];
}

+ (instancetype)sharedInstance
{
    static id instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] initSingle];
    });
    return instance;
}

- (NSString *)currentLanguage
{
    if (!_currentLanguage) {
        NSLocale *currentUsersLocale = [NSLocale currentLocale];
        _currentLanguage = [currentUsersLocale objectForKey:NSLocaleLanguageCode];
        NSLog(@"the currentLanguage is %@", _currentLanguage);
    }
    return _currentLanguage;
}

- (NSString *)currentLocale
{
    if (!_currentLocale) {
        NSLocale *currentUsersLocale = [NSLocale currentLocale];
        _currentLocale = [currentUsersLocale localeIdentifier];
        NSLog(@"the _currentLocale: %@", _currentLocale);
    }
    return _currentLocale;
}

- (NSString *)systemType
{
    _systemType = @"2";
    return _systemType;
}

//- (NSString *)IDFAString
//{
//    if (!_IDFAString) {
//        _IDFAString = [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString];
//        NSLog(@"the IDFAString is : %@", _IDFAString);
//        
//    }
//    return _IDFAString;
//}

- (NSString *)deviceModel
{
    if (!_deviceModel) {
        size_t size;
        sysctlbyname("hw.machine", NULL, &size, NULL, 0);
        
        char *answer = malloc(size);
        sysctlbyname("hw.machine", answer, &size, NULL, 0);
        
        _deviceModel = [NSString stringWithCString:answer encoding: NSUTF8StringEncoding];
        
        free(answer);
        NSLog(@"the deviceModel is : %@", _deviceModel);
        
    }
    return _deviceModel;
}

- (NSString *)systemVersion
{
    if (!_systemVersion) {
        _systemVersion = [UIDevice currentDevice].systemVersion;
        NSLog(@"the systemVersion is : %@", _systemVersion);
        
    }
    return _systemVersion;
}

- (NSString *)appVersion
{
    if (!_appVersion) {
        _appVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
        NSLog(@"the appVersion is : %@", _appVersion);
        
    }
    return _appVersion;
}

- (NSString *)appBundleID
{
    if (!_appBundleID) {
        _appBundleID = [[NSBundle mainBundle] bundleIdentifier];
        NSLog(@"the appBundleID is : %@", _appBundleID);
        
    }
    return _appBundleID;
}


@end
