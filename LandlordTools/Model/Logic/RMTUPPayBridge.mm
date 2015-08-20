//
//  RMTUPPayBrige.m
//  RemoteControl
//
//  Created by vagrant on 4/14/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "RMTUPPayBridge.h"
#import "UPPayPlugin.h"

@implementation RMTUPPayBridge

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

- (NSString *)UPPayModeType:(RMTUPPayModeType)type
{
    NSString *result = nil;
    
    switch(type) {
        case RMTUPPayModeTypeTest:
            result = @"01";
            break;
            
        case RMTUPPayModeTypeProduction:
            result = @"00";
            break;
    }
    
    return result;
}

- (BOOL)startPay:(NSString*)tn mode:(NSString*)mode viewController:(UIViewController *)viewController
{
    return [UPPayPlugin startPay:tn mode:mode viewController:viewController delegate:self];
}

#pragma mark - UPPayPluginDelegate

-(void)UPPayPluginResult:(NSString*)result
{
    if (self.delegate && [self.delegate respondsToSelector:@selector(RMTUPPayBridgePayResult:)]) {
        [self.delegate performSelector:@selector(RMTUPPayBridgePayResult:) withObject:result];
    }
}

@end
