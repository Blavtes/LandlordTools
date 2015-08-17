//
//  RMTUserLogic.h
//  RemoteControl
//
//  Created by vagrant on 4/1/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RMTUserData.h"

#define RMT_PURCHASE_CURRENCY_ID 6
#define  kCOUNTCODE  @"0086"
@protocol LoginFininshedDelegate <NSObject>

- (void)loginFinishedHandler;

@end


@interface RMTUserLogic : NSObject

+ (instancetype)sharedInstance;

- (void)requestUserWalletInfo:(void (^)(NSError *error, NSInteger balance))handler;

- (void)requestUserPresentInfo:(void (^)(NSError *error, NSArray *array))handler;

- (void)requestPurchasedProductList:(void (^)(NSError *error, NSArray *list))handler;

- (void)autoLogin;

-(void)requestLoginName:(NSString *)account
               password:(NSString *)password
               complete:(void (^)(NSError *error, RMTUserData *data))handler;

-(void)requestLogout:(void (^)(NSError *error))handler;

- (RMTRegisterUserData *)getLastUserData;

- (BOOL)validateWithPhoneNumber:(NSString *)number countryCode:(NSString *)code;

@end
