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
@property (nonatomic, assign) int tmpId;//临时楼宇id(用于添加，返回时tmpId与新增id一一对应)
@end


@interface EditBuildingsIdObj : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, assign) int tmpId;

@end

@protocol EditBuildingsIdObj <NSObject>

@end
@interface EditBuildingsBackObj : JSONModel
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) NSArray <EditBuildingsIdObj,Optional> *buildings;
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

//根据id获取房间详情
@interface RoomDescriptionObj : JSONModel
@property (nonatomic, assign) int _id;
@property (nonatomic, strong) NSString *number;
@property (nonatomic, assign) float deposit; // 押金
@property (nonatomic, assign) float preElectricCount; //上月电表底数
@property (nonatomic, assign) float electricCount; //电表底数
@property (nonatomic, assign) float electricPrice;
@property (nonatomic, assign) float preWaterCount; //上月水表底数
@property (nonatomic, assign) float waterCount; //水表底数
@property (nonatomic, assign) float waterPrice; //水价
@property (nonatomic, assign) float rentCost; //房租
@property (nonatomic, assign) float broadbandCost; //网费
@property (nonatomic, assign) float othersCost;
@property (nonatomic, assign) int payRentDay;
@property (nonatomic, strong) NSString *payRentDayStr; //交租日字符串
@property (nonatomic, assign) int isPayRent;
@property (nonatomic, assign) int isInit;
@end

@protocol RoomDescriptionObj <NSObject>
@end
@interface RoomByIdObj : JSONModel
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) RoomDescriptionObj *room;
@end



@interface CheckoutRoomObj : JSONModel
@property (nonatomic, assign) int _id;

@property (nonatomic, strong) NSString *number;
@property (nonatomic, assign) float price;// 价格。水 或 电
@property (nonatomic, assign) float preCount; // 上月底数


@end


@interface CheckoutRoomsArrObj : JSONModel
@property (nonatomic, assign) int _id; //楼层id
@property (nonatomic, assign) int count;//楼层
@property (nonatomic, strong) CheckoutRoomObj *room;


@end

@protocol CheckoutRoomsArrObj <NSObject>
@end
//抄电表的房间
@interface CheckElectricCostRoomsObj : JSONModel
@property (nonatomic, assign) int code;
@property (nonatomic, strong) NSString *message;
@property (nonatomic, strong) CheckoutRoomsArrObj *room;

@end
