//
//  AddHouseViewController.h
//  LandlordTools
//
//  Created by yong on 8/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface AddHouseViewController : UIViewController
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (nonatomic ,assign) int userCheckoutType; //初始化，入住，退房
- (instancetype)initWithEdit:(BOOL)edit;
@end
