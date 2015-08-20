//
//  RMTUtilityFeedback.h
//  RMTUtility
//

//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RMTUtilityFeedback : NSObject

+ (id)shareInstance;

- (void)sendFeedbackContent:(NSString *)content Contact:(NSString *)contact Handle:(void (^)(NSDictionary *info, NSError *error))response;

@end



