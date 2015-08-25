//
//  AddLastMothDataTableViewCell.h
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol AddLastMonthDataConfigDelegate <NSObject>

- (void)postCurrentData:(NSString*)data withPath:(NSIndexPath*)path;

@end

@interface AddLastMothDataTableViewCell : UITableViewCell <UITextFieldDelegate>
@property (nonatomic, assign) id<AddLastMonthDataConfigDelegate> delegate;
@property (weak, nonatomic) IBOutlet UIImageView *backImageView;
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UITextField *editTextField;
@property (weak, nonatomic) IBOutlet UIImageView *editImageView;

@property (nonatomic, strong) NSString *titleName;
@property (nonatomic, strong) NSString * fieldText
;
@property (nonatomic, strong) NSString *placeHoldStr;
@property (nonatomic, strong) NSIndexPath *sectionPath;
- (void)setComtentData:(NSString*)title withField:(NSString*)fieldText withPath:(NSIndexPath*)path;
@end
