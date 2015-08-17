//
//  RMTDataObject.h
//  Hi3DSupport
//
//  Created by vagrant on 14-8-27.
//  Copyright (c) 2014年 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RMTUserData : NSObject

@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) NSString *mobile;
@property (nonatomic, strong) NSString *token;

@property (nonatomic, strong) NSString *name;

@property (nonatomic, strong) NSString *loginId;
@property (nonatomic, assign) BOOL isLogic;

@end

@interface RMTRegisterUserData : NSObject

@property (nonatomic, copy) NSString *mobile;
@property (nonatomic, copy) NSString *password;
@property (nonatomic, copy) NSString *token;
@property (nonatomic, copy) NSString *userType;

@end


@interface RMTCountryCodeData : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) NSString *countrycode;
@property (nonatomic, copy) NSString *locale;
@property (nonatomic, copy) NSString *language;

@end


