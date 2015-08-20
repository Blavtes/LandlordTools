//
//  AddBuildModleData.h
//  LandlordTools
//
//  Created by yangyong on 8/17/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "JSONModel.h"

@interface UpdateBuildData : JSONModel
@property (nonatomic, assign) int id;
@property (nonatomic, strong) NSString *buildingName;
@property (nonatomic, assign) float electricPrice;
@property (nonatomic, assign) float waterPrice;
@property (nonatomic, assign) int payRentDay;
@property (nonatomic, assign) int oprType;
@end

@interface AddBuildArrayData : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, strong) NSString *buildingName;
@property (nonatomic, assign) float electricPrice;
@property (nonatomic, assign) float waterPrice;
@property (nonatomic, assign) int payRentDay;
//ui
@property (nonatomic, assign) BOOL isShowDataList;
@property (nonatomic, assign) int oprType; // 1 添加 2 更新 3 删除
@end


@protocol AddBuildArrayData <NSObject>
@end
@interface AddBuildModleData : JSONModel
@property (nonatomic, strong) NSString *message;
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSArray <AddBuildArrayData, Optional> *buildings;
@end

@interface BackOject : JSONModel
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@end

#pragma mark -- get floors
@interface RoomsByArrObj : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, strong) NSString *number;
@property (nonatomic, assign) int isInit;
@end

@protocol RoomsByArrObj <NSObject>
@end
//根据楼宇id获取楼层和房间
@interface FloorsByArrObj : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, assign) int count;
@property (nonatomic, strong) NSArray <RoomsByArrObj,Optional> *rooms;
@end

@protocol FloorsByArrObj <NSObject>
@end
@interface FloorsByBuildingObj : JSONModel
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) NSArray <FloorsByArrObj,Optional> *floors;
@end


#pragma mark --edit floors

@interface EditRoomsByArrModle : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, strong) NSString *number;
@property (nonatomic, assign) int oprType;
@end

@protocol EditRoomsByArrModle <NSObject>
@end
@interface EditFloorsByArrModle : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, assign) int count;
@property (nonatomic, assign) int oprType;
@property (nonatomic, strong) NSArray <EditRoomsByArrModle, Optional> *rooms;
@end

@protocol EditFloorsByArrModle <NSObject>
@end
@interface EditFloorsByModle : JSONModel
@property (nonatomic, strong) NSArray <EditFloorsByArrModle,Optional> *floors;
@end
