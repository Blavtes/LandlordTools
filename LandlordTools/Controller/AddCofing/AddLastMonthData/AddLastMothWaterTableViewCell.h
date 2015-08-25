//
//  AddLastMothWaterTableViewCell.h
//  LandlordTools
//
//  Created by yangyong on 16/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "AddLastMothDataTableViewCell.h"

@interface AddLastMothWaterTableViewCell : UITableViewCell <UITextFieldDelegate,AddLastMonthDataConfigDelegate>
@property (weak, nonatomic) IBOutlet UILabel *titleLable;

@property (nonatomic, assign) id<AddLastMonthDataConfigDelegate> delegate;
@property (weak, nonatomic) IBOutlet UIImageView *editImageView;
@property (weak, nonatomic) IBOutlet UITextField *numberTextField;
@property (weak, nonatomic) IBOutlet UILabel *resultLabel;
@property (weak, nonatomic) IBOutlet UILabel *monyLabel;
@property (nonatomic, strong) NSIndexPath *sectionPath;
- (void)setComtentData:(NSString*)title withField:(NSString*)fieldText withPath:(NSIndexPath*)path;

@end
