//
//  NSString+RMT.h
//  RemoteControl
//
//  Created by vagrant on 4/3/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSString (RMT)

+ (NSString *)RMT_stringWithDictionary:(NSDictionary *)dic;

- (NSString*)RMT_urlEncode;

- (NSString *)RMT_urlDecode;

- (NSString *)RMT_sha1;

+ (NSString*)RMT_formatTime:(int)time;

@end
