//
//  AddBuildModleData.m
//  LandlordTools
//
//  Created by yangyong on 8/17/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "AddBuildModleData.h"

@implementation AddBuildArrayData

+(JSONKeyMapper*)keyMapper
{
    return [[JSONKeyMapper alloc] initWithDictionary:@{@"_id": @"id"}];
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
