//
//  ConfigEditCellForButton.h
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ConfigEditCellForButton : UIView
@property (nonatomic, strong) UIButton *roomBt;
@property (nonatomic, strong) UIImageView *infoView;
- (void)setShowInfoView:(BOOL)isShow;
- (void)setEditCellData:(NSObject*)ob; // isshow/title
@end
