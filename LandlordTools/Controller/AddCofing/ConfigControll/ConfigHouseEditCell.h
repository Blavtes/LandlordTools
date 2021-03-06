//
//  ConfigHouseEditCell.h
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ConfigEditCellForButton.h"
#import "ConfigEditHouseData.h"
#import "AddBuildModleData.h"

@protocol ConfigHouseEditDelegate <NSObject>

@optional
- (void)currentHouseEditWith:(NSString*)houseNumber;
- (void)configRoomDataWithSection:(int)section andIndex:(int)index;
@end

@interface ConfigHouseEditCell : UITableViewCell
@property (weak, nonatomic) id<ConfigHouseEditDelegate>delegate;
@property (weak, nonatomic) IBOutlet UIView *oneHouseVIew;
@property (weak, nonatomic) IBOutlet UIView *twoHouseView;

@property (weak, nonatomic) IBOutlet UIView *threeHouseView;

@property (weak, nonatomic) IBOutlet UIButton *oneBt;
@property (weak, nonatomic) IBOutlet UIButton *twoBt;
@property (weak, nonatomic) IBOutlet UIButton *threeBt;

@property (weak, nonatomic) IBOutlet UIButton *infoOne;

@property (weak, nonatomic) IBOutlet UIButton *infoTwo;
@property (weak, nonatomic) IBOutlet UIButton *infoThree;

@property (nonatomic, strong) FloorsByArrObj *data;
@property (nonatomic, strong) NSIndexPath *indexPath;


- (void)setOneData:(ConfigEditHouseData*)datao andTwoData:(ConfigEditHouseData*)andTwoData andThreeData:(ConfigEditHouseData*)thData;
- (void) setCellContentData:(FloorsByArrObj *)array withRow:(NSIndexPath*)indexPath;

- (void) setCellContentDataRooms:(CheckoutRoomsArrObj *)array withRow:(NSIndexPath*)indexPath;

- (void)setCellContentDataRoomsWithTime:(CheckoutToRoomsByTimeArrObj*)array withRow:(NSIndexPath*)indexPath;
- (void)setCellContentDataRoomsWithFloors:(CheckoutToRoomsByFloorArrObj*)array withRow:(NSIndexPath*)indexPath;
- (void)setCellContentDataRoomsWithTime:(CheckoutToRoomsByTimeArrObj*)array withRow:(NSIndexPath*)indexPath;
@end
