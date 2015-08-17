//
//  RMTEbooKPopoverSlider.h
//  CustomSlider
//
//  Created by yong on 3/4/15.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "RMTPopoverView.h"


@protocol RMTSliderDelegate <NSObject>

- (void) postCurrentSliderValue:(float)value withSender:(id)seder;

@end

@interface RMTPopoverSlider : UISlider

@property (assign, nonatomic) IBOutlet id<RMTSliderDelegate> delegate;

@property (strong, nonatomic) RMTPopoverView *popupView;

@property (assign, nonatomic) BOOL showPopup;

@property (nonatomic, readonly) CGRect thumbRect;
@property (nonatomic ,strong) UIColor *miniTrackTintColor;
@property (nonatomic, strong) UIColor *maxTrackTinitColor;
@property (nonatomic, strong) UIImage *maxiTrackImage;
@property (nonatomic, strong) UIImage *minixiTrackImage;
@property (nonatomic, strong) UIImage *mThumbImage;
@property (nonatomic,assign) float mHight;
- (void) setMiniTrackTinitColor:(UIColor*) mini withMaxTrackTinitColor:(UIColor*)max;
- (void) setMiniTrackImage:(UIImage*)mini withMaxTrackImage:(UIImage*) max;
- (void) setMThumbImage:(UIImage*)th;
- (void) setSizeHight:(float) h;
@end


