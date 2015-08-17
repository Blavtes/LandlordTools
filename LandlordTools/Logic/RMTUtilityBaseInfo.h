//
//  RMTUtilityBaseInfo.h
//  RMTUtility
//
//  Created by vagrant on 15-2-6.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RMTUtilityBaseInfo : NSObject

//超多维手机的hwid
@property (nonatomic, strong) NSString *devicehwid;

@property (nonatomic, readonly) NSString *currentLanguage;

@property (nonatomic, readonly) NSString *currentLocale;

@property (nonatomic, strong) NSString *IDFVString;

//@property (nonatomic, readonly) NSString *IDFAString;

@property (nonatomic, readonly) NSString *deviceModel;

@property (nonatomic, readonly) NSString *systemVersion;

@property (nonatomic, strong) NSString *appName;

@property (nonatomic, readonly) NSString *appVersion;

@property (nonatomic, readonly) NSString *appBundleID;

@property (nonatomic, strong) NSString *clientId;

@property (nonatomic, strong) NSString *superProjectId;

@property (nonatomic, strong) NSString *systemType;

+ (instancetype)sharedInstance;

@end
