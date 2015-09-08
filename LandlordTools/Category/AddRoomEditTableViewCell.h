//
//  AddRoomEditTableViewCell.h
//  LandlordTools
//
//  Created by yangyong on 8/20/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "AddBuildModleData.h"

@protocol AddBuildRoomsDelegate <NSObject>

- (void)deletedRoomWithSection:(int)section;
- (void)deletedBuildindsWithSection:(int)section;

- (void)addRoomWithSection:(int)section;

- (void)reflashDataWithSection:(int)section andIndex:(int)index andData:(RoomsByArrObj*)data;
@end

@interface AddRoomEditTableViewCell : UITableViewCell <UITextFieldDelegate>

@property (nonatomic, assign) id<AddBuildRoomsDelegate>delegate;

@property (weak, nonatomic) IBOutlet UIButton *deletedBt;
@property (weak, nonatomic) IBOutlet UITextField *oneTextField;
@property (weak, nonatomic) IBOutlet UITextField *twoTextField;
@property (weak, nonatomic) IBOutlet UITextField *threeTextField;
@property (weak, nonatomic) IBOutlet UIView *stepperView;
@property (nonatomic, strong) FloorsByArrObj *data;
@property (nonatomic, strong) NSIndexPath *indexPath;

@property (weak, nonatomic) IBOutlet UILabel *lineLable;

- (void) setCellContentData:(FloorsByArrObj *)array withRow:(NSIndexPath*)indexPath;
@end
