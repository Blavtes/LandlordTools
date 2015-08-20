//
//  MyBuildingsViewCell.h
//  LandlordTools
//
//  Created by yong on 20/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "AddBuildModleData.h"

@interface MyBuildingsViewCell : UITableViewCell
@property (weak, nonatomic) IBOutlet UILabel *myTItleLabel;
@property (weak, nonatomic) IBOutlet UILabel *waterlabel;

@property (weak, nonatomic) IBOutlet UILabel *electyLabel;
@property (weak, nonatomic) IBOutlet UILabel *renpayLabel;

@property (assign, nonatomic) int cellRow;

- (void) setCellData:(AddBuildArrayData*)data andCellRow:(int)row;
@end
