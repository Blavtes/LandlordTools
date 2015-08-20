//
//  RMTNetworkKit.h
//  RemoteControl
//
//  Created by vagrant on 4/1/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RMTNetworkKit : NSObject

+ (instancetype)sharedInstance;

- (void)requestWithUrl:(NSString *)urlString
     completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler;

- (void)requestWithUrl:(NSString *)urlString
            parameters:(NSDictionary *)parameters
     completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler;

@end
