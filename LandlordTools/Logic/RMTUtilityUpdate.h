//
//  RMTUtilityUpdate.h
//  RMTUtility
//
//  Created by Xi.Xiong on 15/6/24.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RMTUtilityUpdate : NSObject

+ (id)shareInstance;

- (void)checkAppUpdate:(void (^)(NSDictionary *checkInfo, NSError *error))response;

@end
