//
//  RMTUtilityLogin.h
//  RMTUtility
//
//  Created by vagrant on 15-2-4.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RMTUserData.h"
#import "AddBuildModleData.h"
#import "LoginModelData.h"

typedef enum _RMTRequestBackCode{
    RMTRequestBackCodeException = -1,
    RMTRequestBackCodeFailure = 0,
    RMTRequestBackCodeSucceed = 1
}RMTRequestBackCode;

typedef enum _RMTRegisterCode{
    RMTRegisterCodeErr = -1,// error
    RMTRegisterCodeNotRegist = 0, // no regist
    RMTRegisterCodeHaveRegist = 1 //  regist
}RMTRegisterCode;

typedef enum _RMTVerificationCode {
    
    RMTVerificationCodeRegister = 1, //  regist
    RMTVerificationCodeFindWorld = 2 //  find
}RMTVerificationCode;

typedef enum _RMTUpdataMyBuildType {
    RMTUpdataMyBuildAddType = 1,
    RMTUpdataMyBuildUpdataType = 2,
    RMTUpdataMyBuildDeletedType = 3
}RMTUpdataMyBuildType;

@interface RMTUtilityLogin : NSObject



+ (instancetype)sharedInstance;
//是否注册
//0 未注册 1 已注册，-1 异常

- (void)requestIsRegisterUserWith:(NSString*)mobile
                         complete:(void (^)(NSError *error,BackOject *obj))handler;
//登录请求
-(void)requestLoginWithAccount:(NSString *)acount
                      password:(NSString *)password
                    verifyCode:(NSString *)verifyCode
                   verifyToken:(NSString *)verifyToken
                      complete:(void (^)(NSError *error, RMTUserData* data))handler;

//注册请求
-(void)requestRegisterUserWithData:(RMTRegisterUserData *)data
                          complete:(void (^)(NSError *error,NSString *loginId))handler;

//使用手机号码找回密码
-(void)requestFindPasswordWithPhoneNumber:(NSString *)phoneNumber
                              countryCode:(NSString *)countryCode
                                 complete:(void (^)(NSError *error))handler;

//使用手机验证码重设密码
-(void)requestUpdatePasswordWithPhoneNumber:(NSString *)phoneNumber
                                   password:(NSString *)password
                                 verifyCode:(NSString *)verifyCode
                                   complete:(void (^)(NSError *error))handler;
//使用手机验证码token重设密码
-(void)requestUpdatePasswordWithPhoneNumber:(NSString *)phoneNumber
                                   password:(NSString *)password
                                      token:(NSString *)token
                                   complete:(void (^)(NSError *error))handler;
//获取手机验证码
-(void)requestVerifyWithPhoneNumber:(NSString *)phoneNumber
                        verifyCode:(NSString *)countryCode
                           complete:(void (^)(NSError *error,LoginPassworldBack *obj))handler;


//校验手机验证码 1 regist 2 find pass
-(void)requestCheckVerifyWithPhoneNumber:(NSString *)phoneNumber
                        checkVerify:(NSString *)checkVerify
                               vcodeType:(int)vcode
                           complete:(void (^)(NSError *error,NSString *token))handler;
//注销请求
-(void)requestLogout:(void (^)(NSError *error))handler;

//获取CountryCode列表
- (void)requestCountryCodeList:(void (^)(NSError *error, NSArray *data))handler;

- (BOOL)isLogined;

- (RMTUserData *)getUserData;
- (NSString *)getLogId;


//获取楼宇
- (void)requestGetMyBuildingsWithLogicId:(NSString*)logid
                                complete:(void (^)(NSError *error,AddBuildModleData*))handler;
//更新楼宇
- (void)requestUpdateMyBuilingsWithLogicId:(NSString*)logicId
                          whithBuildData:(NSArray*)data
                                complete:(void (^)(NSError *error,BackOject *object))handler;

@end
