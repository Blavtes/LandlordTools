//
//  EqualizerSlider.m
//  RemoteControl
//
//  Created by xbmac on 4/2/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "EqualizerSlider.h"

@implementation EqualizerSlider

- (id)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.transform = CGAffineTransformMakeRotation(-M_PI_2);
    }
    return self;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

@end
