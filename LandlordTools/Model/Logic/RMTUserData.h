//
//  RMTDataObject.h
//  Hi3DSupport
//
//  Created by vagrant on 14-8-27.
//  Copyright (c) 2014年 runmit.com. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RMTUserData : NSObject
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) NSString *mobile;
@property (nonatomic, strong) NSString *token;

@property (nonatomic, strong) NSString *name;

@property (nonatomic, strong) NSString *loginId;
@property (nonatomic, assign) BOOL isLogic;

@end

@interface RMTRegisterUserData : NSObject

@property (nonatomic, copy) NSString *mobile;
@property (nonatomic, copy) NSString *password;
@property (nonatomic, copy) NSString *token;
@property (nonatomic, assign) int userType;

@end


@interface RMTCountryCodeData : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) NSString *countrycode;
@property (nonatomic, copy) NSString *locale;
@property (nonatomic, copy) NSString *language;

@end


@interface EditRoomsByArrObj : NSObject
@property (nonatomic, assign) int _id;
@property (nonatomic, strong) NSString *number;
@property (nonatomic, assign) int oprType;
@property (nonatomic, assign) int tmpId;
@end

@protocol EditRoomsByArrObj <NSObject>
@end
@interface EditFloorsByArrObj : NSObject
@property (nonatomic, assign) int _id;
@property (nonatomic, assign) int tmpId;
@property (nonatomic, assign) int count;
@property (nonatomic, assign) int oprType;
@property (nonatomic, strong) NSMutableArray <EditRoomsByArrObj> *rooms;
@end

@protocol EditFloorsByArrObj <NSObject>
@end
@interface EditFloorsByObj : NSObject
@property (nonatomic, strong) NSArray <EditFloorsByArrObj> *floors;
@end


