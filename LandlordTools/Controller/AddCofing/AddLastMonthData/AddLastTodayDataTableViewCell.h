//
//  AddLastTodayDataTableViewCell.h
//  LandlordTools
//
//  Created by yong on 25/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
@protocol SelectRenyPayDayDelegate <NSObject>
- (void)postSelectRenyPayDay:(NSString*)day;
@end

@interface AddLastTodayDataTableViewCell : UITableViewCell
@property (nonatomic, assign) id<SelectRenyPayDayDelegate>delegate;

@end
