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

#define kBackGroundColorStr     @"2A2A2A" //424242
#define KYellowFontColorStr     @"EBBE2C" // 黄色
#define kBlackColorStr          @"040404" //4 4 4
#define kTitleColorStr          @"CCCCCC" //灰白色
#define k42ColorStr             @"2A2A2A"
#define K35ColorStr             @"242424"

typedef enum _RMTRequestBackCode{
    RMTRequestBackCodeException = -1,
    RMTRequestBackCodeFailure = 0,
    RMTRequestBackCodeSucceed = 1
}RMTRequestBackCode;

typedef enum _RMTVerfyTime {
        RMTVerfyTimeCount = 60
}RMTVerfyTime;

typedef enum _RMTRegisterCode{
    RMTRegisterCodeErr = -1,// error
    RMTRegisterCodeNotRegist = 0, // no regist
    RMTRegisterCodeHaveRegist = 1 //  regist
}RMTRegisterCode;

typedef enum _RMTVerificationCode {
    
    RMTVerificationCodeRegister = 1, //  regist
    RMTVerificationCodeFindWorld = 2 //  find
}RMTVerificationCode;

typedef enum _RMTRegisterType {
    RMTRegisterLandlordsType = 1, //房东
    RMTRegisterTenantType = 2 //房客
}RMTRegisterType;

typedef enum _RMTUpdataMyBuildType {
    RMTUpdataMyBuildAddType = 1,
    RMTUpdataMyBuildUpdataType = 2,
    RMTUpdataMyBuildDeletedType = 3
}RMTUpdataMyBuildType;


typedef enum _RMTIsPayRent{
    RMTIsPayRentNot = 0, //未交租
    RMTIsPayRentDo = 1 //已交租
}RMTIsPayRent;

typedef enum _RMTIsInit {
    RMTIsInitNot = 0, //未初始化
    RMTIsInitDo = 1 //已初始化
}RMTIsInit;


typedef enum _RMTSelectIndex {
    RMTSelectIndexWater = 1, // water
    RMTSelectIndexElect = 2, // elect
    RMTSelectIndexRent = 3 // rent
}RMTSelectIndex;


typedef enum _RMTOverTime {
    RMTOverTimeNO = 0, // 未超过7天
    RMTOverTimeYES = 1 //超过7天
}RMTOverTime;

typedef enum _RMTSortRent {
    RMTSortRentTime = 1, // 按时间排序
    RMTSortRentFloor = 2 // 按楼层排序
}RMTSortRent;

@interface RMTUtilityLogin : NSObject



+ (instancetype)sharedInstance;


- (BOOL)isLogined;

- (RMTUserData *)getUserData;
- (NSString *)getLogId;

- (BOOL)getIsTempData;
- (void)setHaveTempData:(BOOL)isTemp;



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
                          complete:(void (^)(NSError *error,LoginPassworldBack *loginId))handler;

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
                                   complete:(void (^)(NSError *error,LoginCheckoutVerifyData *data))handler;
//获取手机验证码
-(void)requestVerifyWithPhoneNumber:(NSString *)phoneNumber
                        verifyCode:(int )countryCode
                           complete:(void (^)(NSError *error,LoginPassworldBack *obj))handler;


//校验手机验证码 1 regist 2 find pass
-(void)requestCheckVerifyWithPhoneNumber:(NSString *)phoneNumber
                        checkVerify:(NSString *)checkVerify
                               vcodeType:(int)vcode
                           complete:(void (^)(NSError *error,LoginCheckoutVerifyData *token))handler;

- (void)requestChangePasswordWithPhoneNumber:(NSString*)mobile
                                    password:(NSString*)password
                                       token:(NSString*)token
                                        step:(int)step
                                    complete:(void (^)(NSError *error, LoginCheckoutVerifyData *data))handler;
//注销请求
-(void)requestLogout:(void (^)(NSError *error))handler;




//获取楼宇
- (void)requestGetMyBuildingsWithLogicId:(NSString*)logid
                                complete:(void (^)(NSError *error,AddBuildModleData*))handler;
//更新楼宇
- (void)requestUpdateMyBuilingsWithLogicId:(NSString*)logicId
                          whithBuildData:(NSArray*)data
                                complete:(void (^)(NSError *error,EditBuildingsBackObj *object))handler;

//根据楼宇id获取楼层和房间
- (void)requestGetFloorsByBuildingId:(int)buildid
                         withLoginId:(NSString*)loginId
                            complete:(void (^)(NSError *error, FloorsByBuildingObj* obj))handler;
//编辑楼层

- (void)requestEditFloorsWithLoginId:(NSString*)loginId
                      withBuildindId:(int)buildid
                          withFloors:(NSArray*) floors
                            complete:(void (^)(NSError *error, EditFloorsBackObj* obj))handler;

//根据id获取房间详情
- (void)requestGetRoomByRoomId:(int)roomId
                   withLoginId:(NSString*)loginId
                      complete:(void (^)(NSError *error, RoomByIdObj* obj))handler;
//编辑房间详情

- (void)requestEditRoomWithLoginId:(NSString*)loginId
                          withRoom:(RoomDescriptionObj*)room
                          complete:(void (^)(NSError *error, BackOject* obj))handler;

//获取要抄电表的房间
- (void)requestGetToCheckElectricCostRoomsWithLoginId:(NSString*)loginid
                                       withBuildingId:(int)buildingid
                                             complete:(void (^)(NSError *error, CheckElectricCostRoomsObj* obj))handler;


//获取要抄水表的房间
- (void)requestGetToCheckWaterCostRoomsWithLoginId:(NSString*)loginId
                                    withBuildingId:(int)buildingid
                                          complete:(void (^)(NSError *error, CheckElectricCostRoomsObj* obj))handler;

//获取要交租的房间
- (void)requestGetToPayRentCostRoomsWithLoginId:(NSString*)loginId
                                 withBuildingId:(int)buildingid
                                       complete:(void (^)(NSError *error, CheckoutToPayRentCostRooms* obj))handler;

//抄电表 数值

- (void)requestCheckElectricCostWithLoginId:(NSString*)loginId
                                 withRoomId:(int)roomId
                                  withCount:(float)electricCost
                                   complete:(void (^)(NSError *error, BackOject* obj))handler;

//抄水表

- (void)requestCheckWaterCostWithLoginId:(NSString*)loginId
                                 withRoomId:(int)roomId
                                  withCount:(float)WaterCost
                                   complete:(void (^)(NSError *error, BackOject* obj))handler;
//交房租
- (void)requestPayRentCostWithLoginId:(NSString*)loginId
                              withRoomId:(int)roomId
                               withCount:(float)payRentCost
                                complete:(void (^)(NSError *error, BackOject* obj))handler;

//入住房间

- (void)requestCheckInWithLoginId:(NSString*)loginId
                         withRoom:(RoomDescriptionObj*)room
                         complete:(void (^)(NSError *error, BackOject* obj))handler;

//退房
- (void)requestCheckoutWithLoginId:(NSString*)loginId
                          withRoom:(RoomDescriptionObj*)room
                          complete:(void (^)(NSError *error, BackOject* obj))handler;

//获取已租房间
- (void)requestGetRentedRoomsWithLoginId:(NSString*)logindId
                         withBuildingId:(NSString*)buildingId
                               complete:(void (^)(NSError *error, FloorsByBuildingObj* obj))handler;
//获取未出租房间
- (void)requestGetNotRentedRoomsWithLoginId:(NSString*)logindId
                             withBuildingId:(NSString*)buildingId
                                   complete:(void (^)(NSError *error, FloorsByBuildingObj* obj))handler;
@end
