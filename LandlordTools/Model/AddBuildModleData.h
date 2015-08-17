//
//  AddBuildModleData.h
//  LandlordTools
//
//  Created by yangyong on 8/17/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "JSONModel.h"

@interface AddBuildArrayData : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, strong) NSString *buildingName;
@property (nonatomic, assign) float electricPrice;
@property (nonatomic, assign) float waterPrice;
@property (nonatomic, assign) int payRentDay;
//ui
@property (nonatomic, assign) BOOL isShowDataList;
@end


@protocol AddBuildArrayData <NSObject>
@end
@interface AddBuildModleData : JSONModel
@property (nonatomic, strong) NSString *message;
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSArray <AddBuildArrayData, Optional> *buildings;
@end
