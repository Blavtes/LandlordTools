//
//  ConfigEditCellForButton.m
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "ConfigEditCellForButton.h"

@implementation ConfigEditCellForButton

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/
- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        [self constructUI];
    }
    return self;
}

-(id)initWithCoder:(NSCoder *)aDecoder {
    self = [super initWithCoder:aDecoder];
    if (self) {
        [self constructUI];
    
    }
    return self;
}

- (void)roomClick:(id)sender
{
    NSLog(@"room click ");
}

- (void)drawRect:(CGRect)rect
{
    _roomBt.frame = self.frame;
    _infoView.frame = CGRectMake(self.frame.size.width - 20, self.frame.size.height - 30, 30, 30);
}

- (void)constructUI
{
    _roomBt = [UIButton buttonWithType:UIButtonTypeCustom];
    [_roomBt addTarget:self action:@selector(roomClick:) forControlEvents:UIControlEventTouchUpInside];
    [_roomBt setBackgroundColor:[UIColor redColor]];
    [self addSubview:_roomBt];
    
    _infoView = [UIImageView new];
    _infoView.backgroundColor = [UIColor grayColor];
    
    [self addSubview:_infoView];
}

- (void)setEditCellData:(NSObject *)ob
{
    [_roomBt setTitle:@"101" forState:UIControlStateNormal];
    [_roomBt setTitle:@"999" forState:UIControlStateHighlighted];
    [self setShowInfoView:YES];
}

- (void)setShowInfoView:(BOOL)isShow
{
    _infoView.hidden = !isShow;
}

@end
