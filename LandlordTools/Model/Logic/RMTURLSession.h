//
//  RMTURLSession.h
//  RMTUtility
//
//  Created by vagrant on 15-2-5.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RMTURLSession : NSObject

+ (instancetype)sharedInstance;

- (void)requestApiWithUrl:(NSString *)urlString
   customHTTPHeaderFields:(NSDictionary *)fields
        completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler;

- (void)requestApiWithUrl:(NSString *)urlString
               parameters:(NSDictionary *)parameters
   customHTTPHeaderFields:(NSDictionary *)fields
        completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler;

@end
