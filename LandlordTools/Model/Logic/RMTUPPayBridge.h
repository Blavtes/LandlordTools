//
//  RMTUPPayBrige.h
//  RemoteControl
//
//  Created by vagrant on 4/14/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "UPPayPluginDelegate.h"

@class UIViewController;

typedef enum _RMTUPPayModeType {
    RMTUPPayModeTypeTest = 0,
    RMTUPPayModeTypeProduction
} RMTUPPayModeType;

@protocol RMTUPPayBridgeDelegate <NSObject>

- (void)RMTUPPayBridgePayResult:(NSString *)result;

@end


@interface RMTUPPayBridge : NSObject <UPPayPluginDelegate>

@property (nonatomic, weak) id<RMTUPPayBridgeDelegate> delegate;

+ (instancetype)sharedInstance;

- (NSString *)UPPayModeType:(RMTUPPayModeType)type;

- (BOOL)startPay:(NSString*)tn mode:(NSString*)mode viewController:(UIViewController *)viewController;

@end


