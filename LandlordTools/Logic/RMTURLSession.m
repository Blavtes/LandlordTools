//
//  RMTURLSession.m
//  RMTUtility
//
//  Created by vagrant on 15-2-5.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import "RMTURLSession.h"

@implementation RMTURLSession

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
    return [RMTURLSession sharedInstance];
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

//get请求
- (void)requestApiWithUrl:(NSString *)urlString
   customHTTPHeaderFields:(NSDictionary *)fields
        completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler
{
    NSURL *URL = [NSURL URLWithString:urlString];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:URL];
    if (fields) {
        for (NSString *key in [fields allKeys]) {
            [request setValue:[fields objectForKey:key] forHTTPHeaderField:key];
        }
    }
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *task = [session dataTaskWithRequest:request
                                            completionHandler:
                                  ^(NSData *data, NSURLResponse *response, NSError *error) {
                                      NSDictionary *dic = nil;
                                      if (!error) {
                                          NSInteger statusCode = [(NSHTTPURLResponse *)response statusCode];
                                          if (statusCode != 200 && statusCode != 304) {
                                              error = [NSError errorWithDomain:@"http error" code:-1 userInfo:nil];
                                          }
                                          else {
                                              NSError *jsonError = nil;
                                              dic = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&jsonError];
                                              error = jsonError;
                                          }
                                      }
                                      
                                      dispatch_async(dispatch_get_main_queue(), ^{
                                          handler(error,dic);
                                      });
                                  }];
    
    [task resume];
}

//post请求
- (void)requestApiWithUrl:(NSString *)urlString
               parameters:(NSDictionary *)parameters
   customHTTPHeaderFields:(NSDictionary *)fields
        completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler
{
    NSError *error = nil;
    NSData *data = [NSJSONSerialization dataWithJSONObject:parameters options:kNilOptions error:&error];
    if (error) {
        handler(error, nil);
        return;
    }
    NSURL *URL = [NSURL URLWithString:urlString];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:URL];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    if (fields) {
        for (NSString *key in [fields allKeys]) {
            [request setValue:[fields objectForKey:key] forHTTPHeaderField:key];
        }
    }
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionUploadTask *uploadTask = [session uploadTaskWithRequest:request
                                                               fromData:data
                                                      completionHandler:
                                          ^(NSData *data, NSURLResponse *response, NSError *error) {
                                              NSDictionary *dic = nil;
                                              if (!error) {
                                                  NSError *jsonError = nil;
                                                  if (data != nil && data.length != 0) {
                                                      dic = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&jsonError];
                                                  }
                                                  error = jsonError;
                                              }
                                              
                                              dispatch_async(dispatch_get_main_queue(), ^{
                                                  handler(error,dic);
                                              });
                                              
                                          }];
    
    [uploadTask resume];
}

@end
