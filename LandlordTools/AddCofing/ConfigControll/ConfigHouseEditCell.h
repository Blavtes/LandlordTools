//
//  ConfigHouseEditCell.h
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ConfigEditCellForButton.h"
#import "ConfigEditHouseData.h"

@protocol ConfigHouseEditDelegate <NSObject>

- (void)currentHouseEditWith:(NSString*)houseNumber;

@end

@interface ConfigHouseEditCell : UITableViewCell
@property (weak, nonatomic) id<ConfigHouseEditDelegate>delegate;
@property (weak, nonatomic) IBOutlet UIView *oneHouseVIew;
@property (weak, nonatomic) IBOutlet UIView *twoHouseView;

@property (weak, nonatomic) IBOutlet UIView *threeHouseView;


- (void)setOneData:(ConfigEditHouseData*)datao andTwoData:(ConfigEditHouseData*)andTwoData andThreeData:(ConfigEditHouseData*)thData;

@end
