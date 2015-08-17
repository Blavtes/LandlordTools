//
//  RMTNetworkKit.m
//  RemoteControl
//
//  Created by vagrant on 4/1/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "RMTNetworkKit.h"
#import "AFHTTPRequestOperationManager.h"

@implementation RMTNetworkKit

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

- (void)requestWithUrl:(NSString *)urlString
        completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler
{
    AFHTTPRequestOperationManager *manager = [AFHTTPRequestOperationManager manager];
    [manager.requestSerializer setTimeoutInterval:8];
    [manager GET:urlString parameters:nil success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSLog(@"request url is %@, response JSON: %@", urlString, responseObject);
        handler(nil, responseObject);
        
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        NSLog(@"Error: %@", error);
        handler(error, nil);
    }];
}

- (void)requestWithUrl:(NSString *)urlString
            parameters:(NSDictionary *)parameters
     completionHandler:(void (^)(NSError *error, NSDictionary *dic))handler
{
    NSMutableURLRequest *request =[[AFJSONRequestSerializer serializer] requestWithMethod:@"POST"
                                                                                URLString:urlString
                                                                               parameters:parameters
                                                                                    error:nil];
    [request setTimeoutInterval:8];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    AFHTTPRequestOperation *operation = [[AFHTTPRequestOperation alloc]
                                         initWithRequest:request];
    operation.responseSerializer = [AFJSONResponseSerializer serializer];
    [operation setCompletionBlockWithSuccess:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSLog(@"request url is %@, response JSON: %@", urlString, responseObject);
        handler(nil, responseObject);
        
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        NSLog(@"Error: %@", error);
        handler(error, nil);
    }];
    [operation start];
}












@end
