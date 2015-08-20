//
//  AddRoomEditTableViewCell.h
//  LandlordTools
//
//  Created by yangyong on 8/20/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface AddRoomEditTableViewCell : UITableViewCell
@property (weak, nonatomic) IBOutlet UIButton *deletedBt;
@property (weak, nonatomic) IBOutlet UITextField *oneTextField;
@property (weak, nonatomic) IBOutlet UITextField *twoTextField;
@property (weak, nonatomic) IBOutlet UITextField *threeTextField;
@property (weak, nonatomic) IBOutlet UIStepper *stepper;

@end
