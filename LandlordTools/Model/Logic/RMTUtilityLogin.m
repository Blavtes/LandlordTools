//
//  RMTUtilityLogin.m
//  RMTUtility
//
//  Created by vagrant on 15-2-4.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import "RMTUtilityLogin.h"
#import "RMTURLSession.h"
#import "RMTUtilityBaseInfo.h"
#import <CommonCrypto/CommonDigest.h>
#import "AddBuildModleData.h"
#import "RMTUserShareData.h"
#import "RMTJsonModelAndDictionnary.h"
#import "NSString+RMT.h"
#import "JSONKit.h"
#import "LoginModelData.h"

static const NSString *kUCBaseUrl = @"http://112.74.26.14:8080/rentcloud";

@interface RMTUtilityLogin()
{
    RMTUserData *userData;
    NSArray *countryCodeList;
    BOOL _isHaveTempData;
   
}

@end

@implementation RMTUtilityLogin

- (id)initSingle
{
    self = [super init];
    if (self) {
        userData = [[RMTUserData alloc] init];
        userData.token = @"0";
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

- (void)setHaveTempData:(BOOL)isTemp
{
    _isHaveTempData = isTemp;
}

- (BOOL)getIsTempData
{
    return _isHaveTempData;
}

- (NSString*)getLogId
{
    return [[RMTUserShareData sharedInstance] userData].loginId;
//    return @"F30645C539BC8B8E5A8293F1A2C7E767";
}

- (void)requestIsRegisterUserWith:(NSString *)mobile complete:(void (^)(NSError *,BackOject *obj))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:mobile forKey:@"mobile"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/isRegisterUser", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        
                                        NSError *jsonError = nil;
                                        BackOject *data = [[BackOject alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];

}

//登录请求
-(void)requestLoginWithAccount:(NSString *)acount
                      password:(NSString *)password
                    verifyCode:(NSString *)verifyCode
                   verifyToken:(NSString *)verifyToken
                      complete:(void (^)(NSError *error, RMTUserData* data))handler;
{
    NSMutableDictionary *parameterDic = [NSMutableDictionary new];
    [parameterDic setValue:acount forKey:@"mobile"];
    [parameterDic setValue:password forKey:@"password"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/userLogin", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:parameterDic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic){
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError, nil);
                                            return;
                                        }
                                        
                                        NSError *jsonError = nil;
                                        LoginPassworldBack *data = [[LoginPassworldBack alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        userData.code = data.code;
                                        userData.mobile = acount;
                                        
                                        userData.message = data.message;
                                        userData.loginId = data.loginId;
                                        handler(jsonError,userData);
                                        
                                        
                                    }];
}

//注册请求
-(void)requestRegisterUserWithData:(RMTRegisterUserData *)data
                          complete:(void (^)(NSError *error,LoginPassworldBack *login))handler
{
    NSMutableDictionary *reqDic = [NSMutableDictionary new];
    
    [reqDic setValue:data.mobile forKey:@"mobile"];
    [reqDic setValue:@(data.userType) forKey:@"userType"];
//    [reqDic setValue:[self getMD5String:data.password] forKey:@"password"];
    [reqDic setValue:data.token forKey:@"token"];
     [reqDic setValue:data.password forKey:@"password"];
    NSString *url = [NSString stringWithFormat:@"%@/user/userRegister", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:reqDic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic){
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        
                                        NSError *jsonError = nil;
                                        
                                        LoginPassworldBack *obj = [[LoginPassworldBack alloc] initWithDictionary:dic error:&jsonError];
                                        handler(jsonError,obj);
                                        return;
                                    }];
}

- (void)requestChangePasswordWithPhoneNumber:(NSString *)mobile
                                    password:(NSString *)password
                                       token:(NSString *)token
                                        step:(int)step
                                    complete:(void (^)(NSError *, LoginCheckoutVerifyData *))handler
{
    NSMutableDictionary *parameterDic = [NSMutableDictionary new];
    [parameterDic setValue:mobile forKey:@"mobile"];
    [parameterDic setValue:password forKey:@"password"];
    if (token.length > 0) {
          [parameterDic setValue:token forKey:@"token"];
    }
    [parameterDic setValue:@(step) forKey:@"step"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/changePassword", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:parameterDic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic){
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError, nil);
                                            return;
                                        }
                                        
                                        NSError *jsonError = nil;
                                        LoginCheckoutVerifyData *data = [[LoginCheckoutVerifyData alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                    }];
}


//使用手机号码找回密码
-(void)requestFindPasswordWithPhoneNumber:(NSString *)phoneNumber
                              countryCode:(NSString *)countryCode
                                 complete:(void (^)(NSError *error))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:phoneNumber forKey:@"account"];
    [dic setValue:@(2) forKey:@"findType"];
    [dic setValue:countryCode forKey:@"countrycode"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/findpassword", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError);
                                            return;
                                        }
                                        
                                        NSNumber *rtnObject = [dic valueForKey:@"rtn"];
                                        if (!rtnObject) {
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"服务器错误，请重试", nil)};
                                            NSError *customError = [NSError errorWithDomain:@"RMTUtilityLoginErrorDomain"
                                                                                       code:10000
                                                                                   userInfo:userInfo];
                                            handler(customError);
                                            return;
                                        }
                                        
                                        NSInteger rtn = [rtnObject integerValue];
                                        if (rtn == 0) {
                                            handler(nil);
                                            return;
                                        }
                                        
                                          NSString *errMsg = [dic valueForKey:@"message"];
                                        NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(errMsg, nil)};
                                        NSError *customError = [NSError errorWithDomain:@"RMTUtilityLoginErrorDomain"
                                                                                   code:rtn
                                                                               userInfo:userInfo];
                                        handler(customError);
                                        return;
                                    }];
}

//使用手机验证码重设密码
-(void)requestUpdatePasswordWithPhoneNumber:(NSString *)phoneNumber
                                   password:(NSString *)password
                                 verifyCode:(NSString *)verifyCode
                                   complete:(void (^)(NSError *error))handler
{
    NSMutableDictionary *reqDic = [NSMutableDictionary new];
    
    [reqDic setValue:phoneNumber forKey:@"mobile"];
    [reqDic setValue:[self getMD5String:password] forKey:@"password"];
    [reqDic setValue:verifyCode forKey:@"verifycode"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/updatePwd", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:reqDic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic){
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError);
                                            return;
                                        }
                                        
                                        NSNumber *rtnObject = [dic valueForKey:@"code"];
                                        if (!rtnObject) {
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"服务器错误，请重试", nil)};
                                            NSError *customError = [NSError errorWithDomain:@"RMTUtilityLoginErrorDomain"
                                                                                       code:10000
                                                                                   userInfo:userInfo];
                                            handler(customError);
                                            return;
                                        }
                                        
                                       int rtn = [rtnObject intValue];
                                        if (rtn == 1) {
                                            handler(nil);
                                            return;
                                        }
                                        
                                         NSString *errMsg = [dic valueForKey:@"message"];
                                        NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(errMsg, nil)};
                                        NSError *customError = [NSError errorWithDomain:@"RMTUtilityLoginErrorDomain"
                                                                                   code:rtn
                                                                               userInfo:userInfo];
                                        handler(customError);
                                        return;
                                    }];
}


- (void)requestUpdatePasswordWithPhoneNumber:(NSString *)phoneNumber
                                    password:(NSString *)password
                                       token:(NSString *)token
                                    complete:(void (^)(NSError *,LoginCheckoutVerifyData *datas))handler
{
    NSMutableDictionary *reqDic = [NSMutableDictionary new];
    
    [reqDic setValue:phoneNumber forKey:@"mobile"];
    [reqDic setValue:password forKey:@"password"];
    [reqDic setValue:token forKey:@"token"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/resetPassword", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:reqDic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic){
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        LoginCheckoutVerifyData *data = [[LoginCheckoutVerifyData alloc] initWithDictionary:dic error:&jsonError];
                                        handler(jsonError,data);
                                        return;
                                    }];
}

//获取手机验证码
-(void)requestVerifyWithPhoneNumber:(NSString *)phoneNumber verifyCode:(int )verify complete:(void (^)(NSError *error,LoginPassworldBack *obj))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:phoneNumber forKey:@"mobile"];
    [dic setValue:@(verify) forKey:@"vcodeType"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/sendVerificationCode", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        
                                        NSError *jsonError = nil;
                                        LoginPassworldBack *obj = [[LoginPassworldBack alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,obj);
                                        return;
                                    }];
}


- (void)requestCheckVerifyWithPhoneNumber:(NSString *)phoneNumber checkVerify:(NSString *)checkVerify vcodeType:(int)vcode complete:(void (^)(NSError *,LoginCheckoutVerifyData *token))handler{
    
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:phoneNumber forKey:@"mobile"];
    [dic setValue:@(vcode) forKey:@"vcodeType"];
    [dic setValue:checkVerify forKey:@"vcode"];
    
    NSString *url = [NSString stringWithFormat:@"%@/user/checkVerificationCode", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        
                                        
                                        NSError *jsonError = nil;
                                        LoginCheckoutVerifyData *data = [[LoginCheckoutVerifyData alloc] initWithDictionary:dic error:&jsonError];
                                        handler(jsonError,data);
                                        return;
                                    }];
}

//注销请求
-(void)requestLogout:(void (^)(NSError *error))handler
{
    NSString *url = [NSString stringWithFormat:@"%@/user/home/logout?token=%@", kUCBaseUrl, userData.token];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url customHTTPHeaderFields:headerFields completionHandler:^(NSError *error, NSDictionary *dic){
        if (error || !dic) {
            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
            NSError *customError = [NSError errorWithDomain:error.domain
                                                       code:error.code
                                                   userInfo:userInfo];
            handler(customError);
            return;
        }
        
        NSNumber *rtnObject = [dic valueForKey:@"rtn"];
        if (!rtnObject) {
            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"服务器错误，请重试", nil)};
            NSError *customError = [NSError errorWithDomain:@"RMTUtilityLoginErrorDomain"
                                                       code:10000
                                                   userInfo:userInfo];
            handler(customError);
            return;
        }
        
        NSInteger rtn = [rtnObject integerValue];
        if (rtn == 1) {
            userData.isLogic = NO;

            userData.token = @"0";
            handler(nil);
            return;
        }
        
        NSString *errMsg = [self getErrorMessageWithErrorCode:rtn];
        NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(errMsg, nil)};
        NSError *customError = [NSError errorWithDomain:@"RMTUtilityLoginErrorDomain"
                                                   code:rtn
                                               userInfo:userInfo];
        handler(customError);
        return;
    }];
}


- (NSDictionary *)getHTTPHeaderFields
{
    NSMutableDictionary *dic = [[NSMutableDictionary alloc] initWithCapacity:3];
    
    [dic setValue:[[RMTUtilityBaseInfo sharedInstance] systemType] forKey:@"systemType"];
    [dic setValue:[[RMTUtilityBaseInfo sharedInstance] systemVersion] forKey:@"systemVersion"];
    [dic setValue:[[RMTUtilityBaseInfo sharedInstance] appVersion] forKey:@"appVersion"];
    return dic;
}

- (NSString *)getErrorMessageWithErrorCode:(NSInteger)code
{
   
    if (code == 20002) {
        return @"邮箱不正确，请重新输入";
    }
    if (code == 20003) {
        return @"该手机号已注册，请直接登录";
    }
    if (code == 20004) {
        return @"手机号不正确，请重新输入";
    }
    if (code == 20005) {
        return @"两次密码不一致，请重新输入";
    }
    if (code == 20006) {
        return @"短信验证码错误，请重新输入";
    }
    if (code == 20007) {
        return @"邮件认证超时，请重新注册";
    }
    if (code == 20008) {
        return @"验证码输入错误，请重新输入";
    }
    if (code == 20009) {
        return @"账号或密码有误，请重新输入";
    }

    if (code == 0) {
        return @"该手机号未注册或不存在，请输入正确的手机号";
    }
    if (code == 20013) {
        return @"密码输入不正确";
    }
    if (code == 20014) {
        return @"短信验证码失效，请重新发送验证码";
    }
    if (code == 20015) {
        return @"上传图像错误";
    }
    if (code == 20016) {
        return @"不合法的图像格式";
    }
    if (code == 20017) {
        return @"超过上传文件大小限制";
    }
    if (code == 20018) {
        return @"账号没有被激活";
    }
    if (code == 26001) {
        return @"短信发送频率过高";
    }
    if (code == 26002) {
        return @"短信发送失败，请稍后重新发送";
    }
    
    return @"未知错误";
}

- (BOOL)isLogined
{
    return userData.isLogic;
}

- (RMTUserData *)getUserData
{
    return userData;
}

- (NSString *)getMD5String:(NSString *)orgString
{
    const char *cstr = [orgString UTF8String];
    unsigned char result[16];
    CC_MD5(cstr, (CC_LONG)strlen(cstr), result);
    
    return [NSString stringWithFormat:
            @"%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X",
            result[0], result[1], result[2], result[3],
            result[4], result[5], result[6], result[7],
            result[8], result[9], result[10], result[11],
            result[12], result[13], result[14], result[15]
            ];
}

- (void)requestGetMyBuildingsWithLogicId:(NSString *)logid complete:(void (^)(NSError *, AddBuildModleData *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:logid forKey:@"loginId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/building/getMyBuildings", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        AddBuildModleData *data = [[AddBuildModleData alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
    
}

- (void)requestUpdateMyBuilingsWithLogicId:(NSString *)logicId
                            whithBuildData:(NSArray *)dataArr
                                  complete:(void (^)(NSError *, EditBuildingsBackObj *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:logicId forKey:@"loginId"];

    NSMutableArray *list = [NSMutableArray arrayWithCapacity:0];
    for (AddBuildArrayData *data in dataArr) {
        NSMutableDictionary *dict = [NSMutableDictionary
                                     dictionaryWithDictionary:@{@"id":@(data._id),
                                                                @"buildingName":[data.buildingName length] == 0 ?@"":data.buildingName,
                                                                @"electricPrice":@(data.electricPrice),
                                                                @"waterPrice":@(data.waterPrice),
                                                                @"oprType":@(data.oprType),
                                                                @"tmpId":@(data.tmpId),
                                                                @"payRentDay":@(data.payRentDay)}];
        [list addObject:dict];
    }
    

    [dic setValue:list forKey:@"buildings"];
    NSLog(@"dict %@",dic);
    NSString *url = [NSString stringWithFormat:@"%@/building/editBuildings", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        EditBuildingsBackObj *data = [[EditBuildingsBackObj alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}


- (void)requestGetFloorsByBuildingId:(int)buildid
                         withLoginId:(NSString *)loginId
                            complete:(void (^)(NSError *, FloorsByBuildingObj *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(buildid) forKey:@"buildingId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/floor/getFloorsByBuildingId", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        
                                        NSLog(@"buildings dict %@",dic);
                                        NSError *jsonError = nil;
                                        FloorsByBuildingObj *data = [[FloorsByBuildingObj alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}


- (void)requestEditFloorsWithLoginId:(NSString *)loginId withBuildindId:(int)buildid withFloors:(NSArray *)floors complete:(void (^)(NSError *, BackOject *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(buildid) forKey:@"buildingId"];
    
    
    NSMutableArray *list = [NSMutableArray arrayWithCapacity:0];
    for (EditFloorsByArrObj *floor in floors) {
         NSMutableArray *roomArr = [NSMutableArray arrayWithCapacity:0];
        for (EditRoomsByArrObj *room in floor.rooms) {
            NSMutableDictionary *dict = [NSMutableDictionary
                                         dictionaryWithDictionary:@{@"id":@(room._id),
                                                                    @"number":[room.number length] == 0 ?@"":room.number,
                                                                    @"tmpId":@(room.tmpId),
                                                                    @"oprType":@(room.oprType)}];
            [roomArr addObject:dict];
        }
        NSMutableDictionary *dict = [NSMutableDictionary
                                     dictionaryWithDictionary:@{@"id":@(floor._id),
                                                                @"count":@(floor.count),
                                                                @"rooms":roomArr,
                                                                @"tmpId":@(floor.tmpId),
                                                                @"oprType":@(floor.oprType)}];
        [list addObject:dict];
    }
    
    
    [dic setValue:list forKey:@"floors"];
    NSLog(@"dict %@",dic);
    NSString *url = [NSString stringWithFormat:@"%@/floor/editFloors", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        BackOject *data = [[BackOject alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}

- (void)requestGetRoomByRoomId:(int )roomId withLoginId:(NSString *)loginId complete:(void (^)(NSError *, RoomByIdObj *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(roomId) forKey:@"roomId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/room/getRoomById", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        RoomByIdObj *data = [[RoomByIdObj alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}


- (void)requestEditRoomWithLoginId:(NSString *)loginId withRoom:(RoomDescriptionObj *)room complete:(void (^)(NSError *, BackOject *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    NSMutableDictionary *roomObj = [NSMutableDictionary dictionaryWithDictionary:@{@"id":@(room._id),
                                                                                   @"deposit":@(room.deposit),
                                                                                   @"electricCount":@(room.electricCount),
                                                                                   @"electricPrice":@(room.electricPrice),
                                                                                   @"waterCount":@(room.waterCount),
                                                                                   @"waterPrice":@(room.waterPrice),
                                                                                   @"rentCost":@(room.rentCost),
                                                                                   @"broadbandCost":@(room.broadbandCost),
                                                                                   @"othersCost":@(room.othersCost),
                                                                                   @"payRentDay":@(room.payRentDay)}];
    [dic setValue:roomObj forKey:@"room"];
    
    NSString *url = [NSString stringWithFormat:@"%@/room/editRoom", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        BackOject *data = [[BackOject alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}

- (void)requestGetToCheckElectricCostRoomsWithLoginId:(NSString *)loginid
                                       withBuildingId:(int)buildingid
                                             complete:(void (^)(NSError *, CheckoutRoomsArrObj *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginid forKey:@"loginId"];
    [dic setValue:@(buildingid) forKey:@"buildingId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/rent/getToCheckElectricCostRooms", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        CheckoutRoomsArrObj *data = [[CheckoutRoomsArrObj alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}

- (void)requestGetToCheckWaterCostRoomsWithLoginId:(NSString *)loginId
                                    withBuildingId:(int)buildingid
                                          complete:(void (^)(NSError *, CheckoutRoomsArrObj *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(buildingid) forKey:@"buildingId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/rent/getToCheckWaterCostRooms", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        CheckoutRoomsArrObj *data = [[CheckoutRoomsArrObj alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}

- (void)requestGetToPayRentCostRoomsWithLoginId:(NSString *)loginId withBuildingId:(int)buildingid complete:(void (^)(NSError *, CheckoutRoomsArrObj *))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(buildingid) forKey:@"buildingId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/rent/getToPayRentCostRooms", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        CheckoutRoomsArrObj *data = [[CheckoutRoomsArrObj alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}



- (void)requestCheckElectricCostWithLoginId:(NSString*)loginId
                                 withRoomId:(int)roomId
                                  withCount:(float)electricCost
                                   complete:(void (^)(NSError *error, BackOject* obj))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(electricCost) forKey:@"count"];
    [dic setValue:@(roomId) forKey:@"roomId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/rent/checkElectricCost", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        BackOject *data = [[BackOject alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}

//抄水表

- (void)requestCheckWaterCostWithLoginId:(NSString*)loginId
                              withRoomId:(int)roomId
                               withCount:(float)WaterCost
                                complete:(void (^)(NSError *error, BackOject* obj))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(WaterCost) forKey:@"count"];
    [dic setValue:@(roomId) forKey:@"roomId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/rent/checkWaterCost", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        BackOject *data = [[BackOject alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}
//交房租
- (void)requestPayRentCostWithLoginId:(NSString*)loginId
                           withRoomId:(int)roomId
                            withCount:(float)payRentCost
                             complete:(void (^)(NSError *error, BackOject* obj))handler
{
    NSMutableDictionary *dic = [NSMutableDictionary new];
    [dic setValue:loginId forKey:@"loginId"];
    [dic setValue:@(roomId) forKey:@"roomId"];
    
    NSString *url = [NSString stringWithFormat:@"%@/rent/payRentCost", kUCBaseUrl];
    NSDictionary *headerFields = [self getHTTPHeaderFields];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url
                                           parameters:dic
                               customHTTPHeaderFields:headerFields
                                    completionHandler:^(NSError *error, NSDictionary *dic) {
                                        if (error || !dic) {
                                            NSLog(@"<%s : %d : %s> error:%@", __FILE__, __LINE__, __FUNCTION__, error);
                                            NSDictionary *userInfo = @{NSLocalizedDescriptionKey: NSLocalizedString(@"网络错误", nil)};
                                            NSError *customError = [NSError errorWithDomain:error.domain
                                                                                       code:error.code
                                                                                   userInfo:userInfo];
                                            handler(customError,nil);
                                            return;
                                        }
                                        NSError *jsonError = nil;
                                        BackOject *data = [[BackOject alloc] initWithDictionary:dic error:&jsonError];
                                        
                                        handler(jsonError,data);
                                        return;
                                    }];
}

@end
