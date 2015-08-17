//
//  EqualizerView.h
//  RemoteControl
//
//  Created by xbmac on 4/2/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, EqualizerViewMode) {
    EqualizerViewModeColumnar,
};

@class EqualizerView;

@protocol EqualizerViewDataSource <NSObject>

@required

- (NSInteger)minBandLevelString:(EqualizerView*)eqView;

- (NSInteger)middleBandLevelString:(EqualizerView*)eqView;

- (NSInteger)maxBandLevelString:(EqualizerView*)eqView;

- (NSInteger)numberOfBand:(EqualizerView*)eqView;

- (NSString*)titleForBand:(EqualizerView*)eqView withIndex:(NSInteger)index;

- (NSInteger)bandLevel:(EqualizerView*)eqView withIndex:(NSInteger)index;

@end

@protocol EqualizerViewDelegate <NSObject>

@required

@optional
- (void)eqSliderValueChanged:(EqualizerView*)eqView value:(int)value withIndex:(int)index;

@end

@interface EqualizerView : UIView

@property (nonatomic, weak) IBOutlet NSObject<EqualizerViewDataSource>* dataSource;
@property (nonatomic, weak) IBOutlet NSObject<EqualizerViewDelegate>* delegate;

@property (nonatomic, assign) EqualizerViewMode mode;

- (void)reloadData;

@end