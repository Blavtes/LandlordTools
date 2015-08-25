//
//  AddLastTodayDataTableViewCell.m
//  LandlordTools
//
//  Created by yong on 25/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "AddLastTodayDataTableViewCell.h"

@implementation AddLastTodayDataTableViewCell

- (void)awakeFromNib {
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}


- (IBAction)dataSelecteClick:(id)sender {
    UIButton *btn = (UIButton*)sender;
    NSLog(@"btn title %@  tag %ld",btn.titleLabel.text,btn.tag);
    if ([_delegate respondsToSelector:@selector(postSelectRenyPayDay:)]) {
        [_delegate postSelectRenyPayDay:btn.titleLabel.text];
    }
}


@end
