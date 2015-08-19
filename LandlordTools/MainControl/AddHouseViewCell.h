//
//  AddHouseViewCell.h
//  LandlordTools
//
//  Created by yong on 10/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "AddBuildModleData.h"

@protocol AddHouseChangeCellHeightDelegate <NSObject>

- (void)changeAddHouseCellHeigt:(BOOL)sender andRow:(int)row;
- (void)deletBuildData:(int)row;
- (void)reflashData:(AddBuildArrayData*)data andRow:(int)row;
@end


@interface AddHouseViewCell : UITableViewCell
@property (weak, nonatomic) IBOutlet id<AddHouseChangeCellHeightDelegate> delegate;
@property (weak, nonatomic) IBOutlet UITextField *titleTextField;
@property (weak, nonatomic) IBOutlet UITextField *waterTextField;
@property (weak, nonatomic) IBOutlet UITextField *ammterTextField;
@property (weak, nonatomic) IBOutlet UILabel *dataLable;
@property (weak, nonatomic) IBOutlet UIButton *downBT;

@property (weak, nonatomic) IBOutlet UIView *dataAllView;
@property (weak, nonatomic) IBOutlet UIButton *dataBt;
@property (nonatomic, strong) AddBuildArrayData *modelData;
@property (nonatomic, assign) BOOL showData;
@property (nonatomic, strong) NSString *data;
@property (nonatomic, assign) int cellRow;
- (void) changeDataViewFrame;
- (void) setCellData:(AddBuildArrayData*)data andCellRow:(int)row;
- (void)setHideView;
- (void)setShowData:(BOOL)showData;
@end
