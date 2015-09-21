//
//  UISliderCustomView.m
//  LandlordTools
//
//  Created by yong on 21/9/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "UIHUDCustomView.h"
#import "MBProgressHUD.h"
@implementation UIHUDCustomView

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
 */

- (void) showSlideHUDViewWith:(NSString*) string
{
    NSLog(@"showSlideHUDViewWith");

    self.hidden = NO;
    if (!_HUDSlider) {
        _HUDSlider =     [[MBProgressHUD alloc] initWithFrame:self.frame];
        [self addSubview:self.HUDSlider];
    }
    
    _HUDSlider.labelText = string;
    _HUDSlider.labelFont = [UIFont systemFontOfSize:15];
    _HUDSlider.mode = MBProgressHUDModeIndeterminate;
    _HUDSlider.userInteractionEnabled = NO;
    
    [self.HUDSlider show:YES];
    
}

- (void) hideSlideHUDView
{
    NSLog(@"hideSlideHUDView");
    if (_HUDSlider) {

        [_HUDSlider show:NO];
        [_HUDSlider removeFromSuperview];
        _HUDSlider = nil;
        self.hidden = YES;
    }
    
}

- (void)showHUDView
{
    self.hidden = NO;
    [MBProgressHUD showHUDAddedTo:self animated:YES];
   
}

- (void)hideHUDView
{
    self.hidden = YES;
    [MBProgressHUD hideHUDForView:self animated:YES];
}

@end
