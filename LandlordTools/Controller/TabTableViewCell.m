//
//  TabTableViewCell.m
//  LandlordTools
//
//  Created by yong on 7/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "TabTableViewCell.h"

@implementation TabTableViewCell
- (id) init
{
    if (self = [super init]) {
        
    }
    return self;
}

- (void)awakeFromNib {
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}
- (IBAction)control:(id)sender {
    UISegmentedControl *cont = (UISegmentedControl*)sender;
    NSLog(@"cont tag %ld",cont.tag);
}
- (IBAction)romClick:(id)sender {
    UIButton *bt = (UIButton*)sender;
    NSLog(@"cont tag %ld",bt.tag);
}

- (void) setcontentData:(NSArray *)array withRow:(NSIndexPath*)indexPath
{
    if (indexPath.row * 3 < array.count) {
        [self.romOne setTitle:[array objectAtIndex:indexPath.row * 3] forState:UIControlStateNormal];
        self.romOne.tag = (indexPath.section +1)* 10000 + indexPath.row *3;
        NSLog(@"romt one %ld",indexPath.row*3);
        self.romOne.hidden = NO;

    } else {
        self.romOne.hidden = YES;
    }
    if (indexPath.row * 3+1 < array.count) {
        self.romTow.tag = (indexPath.section +1) * 10000 + indexPath.row *3 +1;
        [self.romTow setTitle:[array objectAtIndex:indexPath.row * 3+1] forState:UIControlStateNormal];
           NSLog(@"romTow  %ld",indexPath.row *3+1);
        self.romTow.hidden = NO;
    } else {
        self.romTow.hidden = YES;
    }
    if (indexPath.row * 3+2 < array.count) {
        self.romThre.tag = (indexPath.section +1) * 10000 + indexPath.row *3 + 2;
        [self.romThre setTitle:[array objectAtIndex:indexPath.row * 3+2] forState:UIControlStateNormal];
         NSLog(@"romThre  %ld",indexPath.row* 3+2);
         self.romThre.hidden = NO;
    } else {
        self.romThre.hidden = YES;
    }
    
    if (indexPath.row * 3 +2< array.count) {
        
        self.romControl.hidden = YES;
        
    } else {
        self.romControl.tag = (indexPath.section +1) + 100;
        self.romControl.hidden = NO;
    }
}

@end
