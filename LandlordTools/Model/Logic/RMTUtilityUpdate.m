//
//  RMTUtilityUpdate.m
//  RMTUtility
//
//  Created by Xi.Xiong on 15/6/24.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import "RMTUtilityUpdate.h"
#import "RMTUtilityBaseInfo.h"
#import "RMTURLSession.h"


#define RMT_UTILITY_UPDATE_BASE_URL @"http://clotho.d3dstore.com/upgrade/getupgrade"

@implementation RMTUtilityUpdate

- (id)initSingle{
    self = [super init];
    if (self) {
        
    }
    return self;
}

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

- (void)checkAppUpdate:(void (^)(NSDictionary *checkInfo, NSError *error))response
{
    RMTUtilityBaseInfo *info = [RMTUtilityBaseInfo sharedInstance];
    NSString *updateUrl = [NSString stringWithFormat:@"%@?version=%@&clientid=%@&lang=%@",RMT_UTILITY_UPDATE_BASE_URL, info.appVersion, info.clientId, info.currentLanguage];
    [[RMTURLSession sharedInstance] requestApiWithUrl:updateUrl customHTTPHeaderFields:nil completionHandler:^(NSError *error, NSDictionary *dic) {
        
        NSString *rtn = [dic objectForKey:@"rtn"];
        NSString *rtmsg = [dic objectForKey:@"rtmsg"];
        NSString *introduction = [dic objectForKey:@"introduction"];
        NSString *theNewVersion = [dic objectForKey:@"new_version"];
        NSString *showType = [dic objectForKey:@"show_type"];
        NSString *upgradeType = [dic objectForKey:@"upgrade_type"];
        
        NSMutableDictionary *info = [NSMutableDictionary dictionaryWithCapacity:0];
        
        [info setValue:rtn forKey:@"rtn"];
        [info setValue:rtmsg forKey:@"rtmsg"];
        [info setValue:introduction forKey:@"introduction"];
        [info setValue:theNewVersion forKey:@"theNewVersion"];
        [info setValue:showType forKey:@"showType"];
        [info setValue:upgradeType forKey:@"upgradeType"];
        
        
        if(error){
            response(nil,error);
        }
        else{
            response(info,nil);
        }
    }];
}

@end
