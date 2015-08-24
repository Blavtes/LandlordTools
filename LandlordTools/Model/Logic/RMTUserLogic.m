//
//  RMTUserLogic.m
//  RemoteControl
//
//  Created by vagrant on 4/1/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "RMTUserLogic.h"
#import "RMTNetworkKit.h"
#import "RMTUtility.h"

#import "NSString+RMT.h"

#import "SSKeychain.h"


@implementation RMTUserLogic

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
    return [[self class] sharedInstance];
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

#pragma mark - CMS

- (void)requestUserWalletInfo:(void (^)(NSError *error, NSInteger balance))handler
{
    NSString *url = [NSString stringWithFormat:@"http://poseidon.d3dstore.com/api/v1/pay/userAccount/get?accountType=2&%@", [self getCMSUrlParameterStringWithUid:YES]];
    [[RMTNetworkKit sharedInstance] requestWithUrl:url
                                 completionHandler:^(NSError *error, NSDictionary *dic) {
                                     if (error) {
                                         NSLog(@"error");
                                         handler(error, 0);
                                         return ;
                                     }
//                                     NSError *jsonError = nil;
//                                     RMTResponseAccountCurrencyInfo *info = [[RMTResponseAccountCurrencyInfo alloc] initWithDictionary:dic error:&jsonError];
//                                     for (RMTAccountCurrencyInfo *currencyInfo in info.data) {
//                                         if (currencyInfo.currencyId == RMT_PURCHASE_CURRENCY_ID) {
//                                             handler(nil, currencyInfo.amount);
//                                             return;
//                                         }
//                                     }
                                     
                                     handler(nil, 0);
                                 }];
}

- (void)requestUserPresentInfo:(void (^)(NSError *error, NSArray *array))handler
{
    NSString *url = [NSString stringWithFormat:@"http://poseidon.d3dstore.com/api/v1/pay/present/get?page=1&count=100&%@", [self getCMSUrlParameterStringWithUid:YES]];
    [[RMTNetworkKit sharedInstance] requestWithUrl:url
                                 completionHandler:^(NSError *error, NSDictionary *dic) {
                                     if (error) {
                                         NSLog(@"error");
                                         handler(error, nil);
                                         return ;
                                     }
                                     
//                                     NSError *jsonError = nil;
//                                     RMTResponseUserPresentData *info = [[RMTResponseUserPresentData alloc] initWithDictionary:dic error:&jsonError];
//                                     handler(jsonError, info.data.data);
                                 }];
}

//请求已购买的商品列表
- (void)requestPurchasedProductList:(void (^)(NSError *error, NSArray *list))handler
{
    NSString *url = [NSString stringWithFormat:@"http://poseidon.d3dstore.com/api/v1/pay/goodsSpend/get?page=1&count=100&%@", [self getCMSUrlParameterStringWithUid:YES]];
     [[RMTNetworkKit sharedInstance] requestWithUrl:url
                                  completionHandler:^(NSError *error, NSDictionary *dic) {
        if (error) {
            handler(error, nil);
            return ;
        }
        if (!dic) {
            handler(error, nil);
            return ;
        }
        
//        NSError *jsonError = nil;
//        RMTResponsePurchasedListInfo *info = [[RMTResponsePurchasedListInfo alloc] initWithDictionary:dic error:&jsonError];
//        if (jsonError) {
//            handler(jsonError, nil);
//            return;
//        }
//        
//        NSError *contentError = nil;
//        if (info.rtn != 0) {
//            contentError = [NSError errorWithDomain:info.errMsg code:info.rtn userInfo:nil];
//            handler(contentError, nil);
//            return;
//        }
        
//        handler(jsonError, info.data.data);
    }];
}

- (NSString *)getCMSUrlParameterStringWithUid:(BOOL)withUid
{
    NSMutableString *url = [[NSMutableString alloc] init];
    RMTUtilityBaseInfo *info = [RMTUtilityBaseInfo sharedInstance];
    [url appendFormat:@"lg=%@", info.currentLanguage];
    [url appendFormat:@"&pm=%@", info.deviceModel];
    [url appendFormat:@"&di=%@", info.devicehwid];
    [url appendFormat:@"&sv=%@", info.systemVersion];
    [url appendFormat:@"&an=%@", info.appName];
    [url appendFormat:@"&av=%@", info.appVersion];
    [url appendFormat:@"&ci=%@", info.clientId];
    if (withUid)
    {
        RMTUserData *userData = [[RMTUtilityLogin sharedInstance] getUserData];
        
        [url appendFormat:@"&token=%@", userData.token];
    }
    
    NSString *ts = [self sha1StringWithLg:info.currentLanguage ci:info.clientId];
    [url appendString:ts];
    return url;
}

- (NSString *)sha1StringWithLg:(NSString *)lg ci:(NSString *)ci
{
    NSString *salt = @"sweedee3drocks001";
    NSTimeInterval timeInMiliseconds = [[NSDate date] timeIntervalSince1970];
    NSString *ts = [NSString stringWithFormat:@"%lld", (long long)timeInMiliseconds];
    NSString *total = [NSString stringWithFormat:@"%@%@%@%@", lg, ci, ts, salt];
    NSString *gt = [total RMT_sha1];
    NSString *result = [NSString stringWithFormat:@"&ts=%@&gt=%@", ts, gt];
    return result;
}

#pragma mark - User

-(void)requestLoginName:(NSString *)account
               password:(NSString *)password
               complete:(void (^)(NSError *error, RMTUserData *data))handler
{

    [[RMTUtilityLogin sharedInstance] requestLoginWithAccount:account
                                                     password:password
                                                   verifyCode:nil
                                                  verifyToken:nil
                                                     complete:^(NSError *error, RMTUserData *data) {
        handler(error, data);
        
        if (!error && data) {
            NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
            [userDefaults setObject:account forKey:@"mobile"];
            [userDefaults synchronize];
            [SSKeychain setPassword:password forService:@"LandlordTools" account:account error:nil];
        }
    }];
}

- (void)autoLogin
{
    if ([[RMTUtilityLogin sharedInstance] isLogined]) {
        return;
    }
    
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    NSString *account = [userDefaults objectForKey:@"mobile"];
    if (!account) {
        return;
    }
    
    NSError *keychainError;
    NSString *password = [SSKeychain passwordForService:@"RemoteControl" account:account error:&keychainError];
    if (keychainError || !password || [password isEqualToString:@""]) {
        return;
    }
    
    [[RMTUtilityLogin sharedInstance] requestLoginWithAccount:account
                                                     password:password
                                                   verifyCode:nil
                                                  verifyToken:nil
                                                     complete:^(NSError *error, RMTUserData *data) {
                                                     }];
}

-(void)requestLogout:(void (^)(NSError *error))handler
{
    RMTUserData *data = [[RMTUtilityLogin sharedInstance] getUserData];
    NSString *mobile = [data.mobile copy];
    [[RMTUtilityLogin sharedInstance] requestLogout:^(NSError *error) {
            handler(error);
        
        if (error) {
            return ;
        }
        
        [SSKeychain setPassword:@"" forService:@"LandlordTools" account:mobile error:nil];
    }];
}

- (RMTRegisterUserData *)getLastUserData
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    NSString *mobile = [userDefaults objectForKey:@"mobile"];
    if (!mobile) {
        return nil;
    }
    
    RMTRegisterUserData *data = [[RMTRegisterUserData alloc] init];
    data.mobile = mobile;
    return data;
}

- (BOOL)validateWithPhoneNumber:(NSString *)number countryCode:(NSString *)code
{
    NSString *regex = @"[0-9]{1,20}";
//    if ([code isEqualToString:@"0086"]) {
        regex = @"[0-9]{11}";
//    }
    
    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", regex];
    return [predicate evaluateWithObject:number];
}


@end
