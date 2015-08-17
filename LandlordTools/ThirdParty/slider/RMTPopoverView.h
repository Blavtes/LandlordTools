//
//  RMTEbooKPopoverView.h
//  CustomSlider
//
//  Created by yong on 3/4/15.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface RMTPopoverView : UIView

@property (nonatomic) float value;
@property (nonatomic, retain) UIFont *font;
@property (nonatomic, retain) NSString *text;

- (id)initWithFrame:(CGRect)frame withImageName:(NSString*)name;

@end

