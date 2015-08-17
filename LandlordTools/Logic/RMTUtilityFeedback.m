//
//  RMTUtilityFeedback.m
//  RMTUtility
//
//  Created by vagrant on 15-2-6.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import "RMTUtilityFeedback.h"
#import "RMTUtilityBaseInfo.h"
#import "RMTURLSession.h"

@implementation RMTUtilityFeedback

- (id)init
{
    return [[self class] shareInstance];
}


+ (id)shareInstance{
    static id instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance  = [[self alloc] initSingle];
    });
    return instance;
}

- (id)initSingle{
    self = [super init];
    if (self) {
        
    }
    return self;
}

- (NSMutableDictionary *)loadInitData{
    RMTUtilityBaseInfo *info = [RMTUtilityBaseInfo sharedInstance];
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:10];
    [dic setObject:@"0" forKey:@"uid"];
    [dic setObject:@"0" forKey:@"idfv"];
    [dic setObject:@"0" forKey:@"ro"];
    [dic setObject:@"0" forKey:@"appkey"];
    [dic setObject:info.devicehwid forKey:@"hwid"];
    [dic setObject:@"0" forKey:@"deviceid"];
    [dic setObject:info.deviceModel forKey:@"devicemodel"];
    [dic setObject:info.currentLocale forKey:@"area"];
    [dic setObject:@"0" forKey:@"wirelesssmac"];
    [dic setObject:@"0" forKey:@"devicebrand"];
    [dic setObject:@"2" forKey:@"os"];
    [dic setObject:@"0" forKey:@"devicehardware"];
    [dic setObject:@"0" forKey:@"deviceserial"];
    [dic setObject:@"0" forKey:@"imei"];
    [dic setObject:info.systemVersion forKey:@"osver"];
    [dic setObject:@"0" forKey:@"udid"];
    [dic setObject:@"0" forKey:@"devicedevice"];
    [dic setObject:info.appVersion forKey:@"appver"];
    [dic setObject:@"0" forKey:@"dts"];
    [dic setObject:@"0" forKey:@"wifimac"];
    [dic setObject:@"0" forKey:@"device"];
    [dic setObject:info.currentLanguage forKey:@"language"];
    [dic setObject:@"0" forKey:@"channel"];
    [dic setObject:@"0" forKey:@"wiremac"];
    [dic setObject:info.clientId forKey:@"clientId"];
    
    return dic;
}


- (void)sendFeedbackContent:(NSString *)content Contact:(NSString *)contact Handle:(void (^)(NSDictionary *info, NSError *error))response{
    NSMutableDictionary *parameter = [self loadInitData];
    
    [parameter setValue:content forKey:@"content"];
    [parameter setValue:contact forKey:@"contact"];
    

    [[RMTURLSession sharedInstance] requestApiWithUrl:@"http://clotho.d3dstore.com/comment/newcomment"
                                           parameters:parameter
                               customHTTPHeaderFields:nil
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error) {
                                            response(nil,error);
                                        }
                                        else{
                                            response(dic,nil);
                                        }
                                    }];
    
}



@end
