//
//  EqualizerView.m
//  RemoteControl
//
//  Created by xbmac on 4/2/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "EqualizerView.h"
#import "EqualizerSlider.h"
#import <Masonry.h>

@interface EqualizerView () {
    NSInteger _minBandLevel;
    NSInteger _middleBandLevel;
    NSInteger _maxBandLevel;
}

@property (nonatomic, strong) NSMutableArray* cloumnars;

@end

@implementation EqualizerView

- (id)initWithCoder:(NSCoder *)aDecoder {
    if (self = [super initWithCoder:aDecoder]) {
        self.mode = EqualizerViewModeColumnar;
    }
    return self;
}

- (void)reloadData {
    __weak typeof(self) weakSelf = self;

    if ([self.dataSource respondsToSelector:@selector(maxBandLevelString:)]) {
        _maxBandLevel = [self.dataSource maxBandLevelString:self];
    }
    
    if ([self.dataSource respondsToSelector:@selector(middleBandLevelString:)]) {
        _middleBandLevel = [self.dataSource middleBandLevelString:self];
    }
    
    if ([self.dataSource respondsToSelector:@selector(minBandLevelString:)]) {
        _minBandLevel = [self.dataSource minBandLevelString:self];
    }
    
    if (self.mode == EqualizerViewModeColumnar) {
        if ([self.dataSource respondsToSelector:@selector(numberOfBand:)]) {
            NSInteger numBandLevel = [self.dataSource numberOfBand:self];
            UIView* lasterView = nil;
            for (int i=0; i<numBandLevel; ++i) {
                UILabel* bandTitleLabel = nil;
                if ([self.dataSource respondsToSelector:@selector(titleForBand:withIndex:)]) {
                    NSString* bandTitleString = [self.dataSource titleForBand:self withIndex:i];
                    bandTitleLabel = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, 0, 0)];
                    bandTitleLabel.font = [UIFont systemFontOfSize:12];
                    bandTitleLabel.textAlignment = UITextAlignmentCenter;
                    bandTitleLabel.textColor = [UIColor whiteColor];
                    bandTitleLabel.text = bandTitleString;
                    [self addSubview:bandTitleLabel];
                }
                
                EqualizerSlider* eqSlider = [[EqualizerSlider alloc] initWithFrame:CGRectMake(0, 0, 0, 0)];
                eqSlider.maximumValue = _maxBandLevel;
                eqSlider.minimumValue = _minBandLevel;
                eqSlider.minimumTrackTintColor = [UIColor colorWithRed:34.0f/255.0f green:199.0f/255.0f blue:56.0f/255.0f alpha:1.0f];
                [self addSubview:eqSlider];
                eqSlider.tag = i;
                
                [eqSlider addTarget:self action:@selector(eqSliderValueChanged:) forControlEvents:UIControlEventValueChanged];
                
                if ([self.dataSource respondsToSelector:@selector(bandLevel:withIndex:)]) {
                    eqSlider.value = [self.dataSource bandLevel:self withIndex:i];
                }
                
                [eqSlider mas_makeConstraints:^(MASConstraintMaker *make) {
                    if (lasterView == nil) {
                        make.leading.equalTo(weakSelf.mas_leading).with.offset(-60);
                    }else {
                        make.leading.equalTo(lasterView.mas_leading).with.offset(66);
                    }
                    
                    make.width.mas_equalTo(weakSelf.mas_height).with.multipliedBy(0.8);
                    make.height.mas_equalTo(40);
                    make.centerY.equalTo(weakSelf.mas_centerY);
                }];
                
                lasterView = eqSlider;
                
                [bandTitleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
                    make.width.mas_equalTo(60);
                    make.height.mas_equalTo(40);
                    make.centerX.equalTo(lasterView.mas_centerX);
                    make.bottom.equalTo(weakSelf.mas_bottom);
                }];
            }
        }
    }
}

- (void)eqSliderValueChanged:(EqualizerSlider*)slider {
    if ([self.delegate respondsToSelector:@selector(eqSliderValueChanged:value:withIndex:)]) {
        [self.delegate eqSliderValueChanged:self value:slider.value withIndex:slider.tag];
    }
}

@end
