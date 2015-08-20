//
//  RMTEbooKPopoverSlider.m
//  CustomSlider
//
//  Created by yong on 3/4/15.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import "RMTPopoverSlider.h"

@implementation RMTPopoverSlider
@synthesize showPopup = _showPopup,popupView = _popupView;

-(CGRect)trackRectForBounds:(CGRect)bounds
{
   
    if (_mHight == 0) {
        _mHight = bounds.size.height;
    }
    bounds = CGRectMake(bounds.origin.x, bounds.origin.y + bounds.size.height / 2 - _mHight / 2
                        , bounds.size.width, _mHight);
    return bounds;
}

- (void) setSizeHight:(float)h
{
    _mHight = h;
}

- (void) setMiniTrackTinitColor:(UIColor *)mini withMaxTrackTinitColor:(UIColor *)max
{
    _miniTrackTintColor = mini;
    _maxTrackTinitColor = max;
    
}

- (void )setMiniTrackImage:(UIImage *)mini withMaxTrackImage:(UIImage *)max
{
    _maxiTrackImage = max;
    _minixiTrackImage = mini;
}

- (void) setMThumbImage:(UIImage *)th
{
    _mThumbImage = th;
}

- (void) drawRect:(CGRect)rect
{
    if (_minixiTrackImage) {
         UIImage *minImage = [_minixiTrackImage resizableImageWithCapInsets:UIEdgeInsetsMake(0, 5, 0, 0)];
         [self setMinimumTrackImage:minImage forState:UIControlStateNormal];
    }
    
    if (_maxiTrackImage) {
        UIImage *maxImage = [_maxiTrackImage resizableImageWithCapInsets:UIEdgeInsetsMake(0, 0, 0, 5)];
         [self setMaximumTrackImage:maxImage forState:UIControlStateNormal];
    }

    if (_mThumbImage) {
          [self setThumbImage:_mThumbImage forState:UIControlStateNormal];
    }
    
    if (_maxTrackTinitColor) {
    
        [self setMaximumTrackTintColor:_maxTrackTinitColor];
    }
    
    if (_miniTrackTintColor) {
        
        [self setMinimumTrackTintColor:_miniTrackTintColor];
    }

}

- (void) setShowPopup:(BOOL)showPopup
{
    _showPopup = showPopup;

    _popupView.hidden = !_showPopup;
}

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        [self constructSlider];
    }
    return self;
}

-(id)initWithCoder:(NSCoder *)aDecoder {
    self = [super initWithCoder:aDecoder];
    if (self) {
        [self constructSlider];
        _showPopup = YES;
    }
    return self;
}

#pragma mark - UIControl touch event tracking
-(BOOL)beginTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event {
    // Fade in and update the popup view
    CGPoint touchPoint = [touch locationInView:self];
    
    // Check if the knob is touched. If so, show the popup view
    if(CGRectContainsPoint(CGRectInset(self.thumbRect, -12.0, -12.0), touchPoint)) {
        [self positionAndUpdatePopupView];
        [self fadePopupViewInAndOut:YES];
    }

    return [super beginTrackingWithTouch:touch withEvent:event];
}

-(BOOL)continueTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event {
    // Update the popup view as slider knob is being moved
    [self positionAndUpdatePopupView];
    return [super continueTrackingWithTouch:touch withEvent:event];
}

-(void)cancelTrackingWithEvent:(UIEvent *)event {
    [super cancelTrackingWithEvent:event];
}

-(void)endTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event {
    // Fade out the popup view
    [self fadePopupViewInAndOut:NO];
    [super endTrackingWithTouch:touch withEvent:event];
}


#pragma mark - Helper methods
-(void)constructSlider {
    _popupView = [[RMTPopoverView alloc] initWithFrame:CGRectZero withImageName:@"ga_sliderlabel.png"];
    _popupView.backgroundColor = [UIColor clearColor];
    _popupView.alpha = 0.0;
    [self addSubview:_popupView];
}

-(void)fadePopupViewInAndOut:(BOOL)aFadeIn {
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:0.5];
    if (aFadeIn) {
        _popupView.alpha = 1.0;
    } else {
        _popupView.alpha = 0.0;
    }
    [UIView commitAnimations];
}

-(void)positionAndUpdatePopupView {
    CGRect zeThumbRect = self.thumbRect;
    CGRect popupRect = CGRectOffset(zeThumbRect, 0, -floor(zeThumbRect.size.height * 1.5));
    _popupView.frame = CGRectInset(popupRect, -20, -10);
    _popupView.value = self.value;
    NSLog(@"-----page --- %f",_popupView.value);
    if ([_delegate respondsToSelector:@selector(postCurrentSliderValue:withSender:)]) {
    
     [_delegate postCurrentSliderValue:_popupView.value withSender:self];
    }
}


#pragma mark - Property accessors
-(CGRect)thumbRect {
    CGRect trackRect = [self trackRectForBounds:self.bounds];
    CGRect thumbR = [self thumbRectForBounds:self.bounds trackRect:trackRect value:self.value];
    return thumbR;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/

@end
