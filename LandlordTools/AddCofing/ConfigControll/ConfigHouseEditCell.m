//
//  ConfigHouseEditCell.m
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "ConfigHouseEditCell.h"


@implementation ConfigHouseEditCell

- (void)awakeFromNib {
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

- (void)setOneData:(ConfigEditHouseData*)datao andTwoData:(ConfigEditHouseData*)andTwoData andThreeData:(ConfigEditHouseData*)thData
{
    if (datao) {
        _oneHouseVIew.hidden = NO;
        UIButton *bt1 =  (UIButton*)[_oneHouseVIew viewWithTag:901];
        [bt1 setTitle:datao.houseNumber forState:UIControlStateNormal];
        UIImageView *image1 = (UIImageView*)[_oneHouseVIew viewWithTag:801];
        [image1 setHidden:datao.isConfig];
    } else {
        _oneHouseVIew.hidden = YES;
    }
  
    if (andTwoData) {
        _twoHouseView.hidden = NO;
        UIButton *bt1 =  (UIButton*)[_twoHouseView viewWithTag:902];
        [bt1 setTitle:andTwoData.houseNumber forState:UIControlStateNormal];
        UIImageView *image1 = (UIImageView*)[_twoHouseView viewWithTag:802];
        [image1 setHidden:andTwoData.isConfig];
    } else {
        _twoHouseView.hidden = YES;
    }
    
    if (thData) {
        _threeHouseView.hidden = NO;
        UIButton *bt1 =  (UIButton*)[_threeHouseView viewWithTag:903];
        [bt1 setTitle:thData.houseNumber forState:UIControlStateNormal];
        UIImageView *image1 = (UIImageView*)[_threeHouseView viewWithTag:803];
        [image1 setHidden:thData.isConfig];
    } else {
        _threeHouseView.hidden = YES;
    }
    
    
}



- (IBAction)houseConfigClick:(id)sender {
    UIButton *bt = (UIButton*)sender;
    NSLog(@"bt tag %ld",bt.tag);
    if (_delegate && [_delegate respondsToSelector:@selector(currentHouseEditWith:)]) {
        [_delegate currentHouseEditWith:bt.titleLabel.text];
    }
}

@end
