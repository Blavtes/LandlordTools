//
//  AddBuildModleData.m
//  LandlordTools
//
//  Created by yangyong on 8/17/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "AddBuildModleData.h"

@implementation UpdateBuildData
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

@implementation AddBuildArrayData

+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}

+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

@implementation AddBuildModleData
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end


@implementation EditBuildingsIdObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}


@end

@implementation EditBuildingsBackObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

@end

#pragma mark ---editfloor

@implementation EditBackRoomsObj

+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}


@end

@implementation EditFloorBackObj

+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}

@end

@implementation EditFloorsBackObj

+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

#pragma mark ---editfloor end--
@implementation BackOject
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

@implementation RoomsByArrObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}
@end

@implementation FloorsByArrObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}
@end

@implementation FloorsByBuildingObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end


@implementation EditFloorsByArrModle
+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

@implementation EditFloorsByModle
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

@implementation EditRoomsByArrModle
+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end


@implementation RoomByIdObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}


@end

@implementation RoomDescriptionObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}

@end

@implementation CheckoutRoomObj

+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}

@end

@implementation CheckoutRoomsArrObj

+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}

@end

@implementation CheckElectricCostRoomsObj

+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

@end


@implementation CheckoutToPayRentCostRooms
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

@implementation CheckoutToRoomsByTimeArrObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
@end

@implementation CheckoutToRoomsByTimeObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}
@end

@implementation CheckoutToRoomsByFloorArrObj
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}
+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"id": @"_id"}];
}
@end