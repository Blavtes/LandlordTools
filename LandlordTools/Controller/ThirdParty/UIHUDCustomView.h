//
//  UISliderCustomView.h
//  LandlordTools
//
//  Created by yong on 21/9/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MBProgressHUD.h"

@interface UIHUDCustomView : UIView
@property (strong, nonatomic) MBProgressHUD *HUDSlider;

- (void) showSlideHUDViewWith:(NSString*) string;
- (void) hideSlideHUDView;
- (void)showHUDView;
- (void)hideHUDView;
@end
