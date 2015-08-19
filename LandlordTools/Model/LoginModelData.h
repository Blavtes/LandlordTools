//
//  LoginModelData.h
//  LandlordTools
//
//  Created by yong on 19/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "JSONModel.h"

@interface LoginModelData : JSONModel

@end

@interface LoginPassworldBack : JSONModel
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) NSString *loginId;
@end


@interface LoginCheckoutVerifyData : JSONModel
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) NSString *token;

@end