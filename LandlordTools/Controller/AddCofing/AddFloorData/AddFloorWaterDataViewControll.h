//
//  AddFloorWaterDataViewControll.h
//  LandlordTools
//
//  Created by yangyong on 16/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ConfigEditHouseData.h"
#import "AddBuildModleData.h"

@interface AddFloorWaterDataViewControll : UIViewController
- (instancetype)initCheckoutWaterWithCurrentBuild:(AddBuildArrayData*)build andCheckoutRoomObj:(CheckoutRoomObj*)roomObj;
- (void)checkoutWaterWithCurrentBuild:(AddBuildArrayData*)build andCheckoutRoomObj:(CheckoutRoomObj*)roomObj;
@end
