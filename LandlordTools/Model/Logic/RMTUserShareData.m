//
//  RMTUserShareData.m
//  LandlordTools
//
//  Created by yong on 13/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "RMTUserShareData.h"

@implementation RMTUserShareData

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

- (void)updataUserData:(RMTUserData *)data
{
    _userData = data;
}
@end
