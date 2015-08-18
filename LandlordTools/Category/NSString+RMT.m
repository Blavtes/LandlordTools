//
//  NSString+RMT.m
//  RemoteControl
//
//  Created by vagrant on 4/3/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "NSString+RMT.h"
#import <CommonCrypto/CommonDigest.h>
//#import 

@implementation NSString (RMT)

+ (NSString *)RMT_stringWithDictionary:(NSDictionary *)dic
{
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dic options:NSJSONWritingPrettyPrinted error:&error];
    
    if (!jsonData) {
        NSLog(@"error: %@", error.localizedDescription);
        return @"{}";
        
    } else {
        return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
}

- (NSString*)RMT_urlEncode
{
    if (!self) {
        return nil;
    }
    
    return (NSString *)CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes(
                                                                                 NULL,
                                                                                 (__bridge CFStringRef) self,
                                                                                 NULL,
                                                                                 (CFStringRef)@"!*'();:@&=+$,/?%#[]",
                                                                                 kCFStringEncodingUTF8));
}

- (NSString *)RMT_urlDecode
{
    NSString* decodeString = [self stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    return decodeString;
}

- (NSString *)RMT_sha1
{
    const char *cStr = [self UTF8String];
    unsigned char result[CC_SHA1_DIGEST_LENGTH];
    CC_SHA1(cStr, strlen(cStr), result);
    NSString *s = [NSString  stringWithFormat:
                   @"%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x",
                   result[0], result[1], result[2], result[3], result[4],
                   result[5], result[6], result[7],
                   result[8], result[9], result[10], result[11], result[12],
                   result[13], result[14], result[15],
                   result[16], result[17], result[18], result[19]
                   ];
    
    return s;
}

+ (NSString*)RMT_formatTime:(int)time {
    int second = time % 60;
    
    time /= 60;
    int minute = time % 60;
    
    time /= 60;
    int hour = time % 60;
    
    return [NSString stringWithFormat:@"%.2d:%.2d:%.2d", hour, minute, second];
}


@end
