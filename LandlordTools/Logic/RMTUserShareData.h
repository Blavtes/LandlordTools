//
//  RMTUserShareData.h
//  LandlordTools
//
//  Created by yong on 13/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RMTUserData.h"

@interface RMTUserShareData : NSObject
@property (nonatomic, strong) RMTUserData *userData;
+ (instancetype)sharedInstance;

- (void)updataUserData:(RMTUserData*)data;
@end
