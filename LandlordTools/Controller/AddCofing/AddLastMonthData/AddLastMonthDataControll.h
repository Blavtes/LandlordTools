//
//  AddLastMonthDataControll.h
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "RMTUtilityLogin.h"
#import "AddBuildModleData.h"

@interface AddLastMonthDataControll : UIViewController
@property (nonatomic, assign) BOOL isConfigMode;
@property (nonatomic, strong) RoomsByArrObj *roomDataObj;
@property (nonatomic, strong) AddBuildArrayData *buildingData;
@property (nonatomic, assign) RMTUserRoomType userCheckoutType;

@end
