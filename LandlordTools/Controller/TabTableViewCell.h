//
//  TabTableViewCell.h
//  LandlordTools
//
//  Created by yong on 7/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TabTableViewCell : UITableViewCell
@property (weak, nonatomic) IBOutlet UIButton *romOne;
@property (weak, nonatomic) IBOutlet UIButton *romTow;
@property (weak, nonatomic) IBOutlet UIButton *romThre;
@property (weak, nonatomic) IBOutlet UIStepper *romControl;

- (void) setcontentData:(NSArray *)send withRow:(NSIndexPath*)indexPath;
- (id)init;
@end
