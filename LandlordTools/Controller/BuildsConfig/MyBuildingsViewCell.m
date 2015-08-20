//
//  MyBuildingsViewCell.m
//  LandlordTools
//
//  Created by yong on 20/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "MyBuildingsViewCell.h"

@implementation MyBuildingsViewCell

- (void)awakeFromNib {
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

- (void) setCellData:(AddBuildArrayData*)data andCellRow:(int)row
{

    _myTItleLabel.text = data.buildingName;
    _waterlabel.text = [NSString stringWithFormat:@"%.1f",data.waterPrice];
    _electyLabel.text = [NSString stringWithFormat:@"%.1f",data.electricPrice];
    _cellRow = row;
    _renpayLabel.text = [NSString stringWithFormat:@"%d号抄表",data.payRentDay];
}

@end
