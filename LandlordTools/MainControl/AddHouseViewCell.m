//
//  AddHouseViewCell.m
//  LandlordTools
//
//  Created by yong on 10/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "AddHouseViewCell.h"
#import "ConfigSystem.h"

@implementation AddHouseViewCell

- (void)awakeFromNib {
    // Initialization code
//init
}

- (void)dataSelect:(id)sender
{
    UIButton *bt = (UIButton*)sender;
    NSLog(@"bt tag %ld",bt.tag);
    _dataLable.text = [NSString stringWithFormat: @"slelect %ld",bt.tag];
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}
- (IBAction)deleteClcik:(id)sender {
}

- (IBAction)titleTextFieldEnd:(id)sender {
    
    
}

- (IBAction)waterTextFieldEnd:(id)sender {
}

- (IBAction)ammeterTextFieldEnd:(id)sender {
    
}

- (void) changeDataViewFrame
{
    float height = 0.0f;
    if (_showData) {
        height = 220.f;
    }
      [_dataAllView setFrame:CGRectMake(_dataAllView.frame.origin.x, 0, _dataAllView.frame.size.width, height)];
}

- (void) setCellData:(AddBuildArrayData*)data andCellRow:(int)row
{
    _showData = data.isShowDataList;
    _titleTextField.text = data.buildingName;
    _waterTextField.text = [NSString stringWithFormat:@"%.1f",data.waterPrice];
    _ammterTextField.text = [NSString stringWithFormat:@"%.1f",data.electricPrice];
    _cellRow = row;
}

- (void)setHideView
{
   _dataAllView.hidden = !_showData;
}

- (void)setShowData:(BOOL)showData
{
    _showData = showData;
}

//- (void)drawRect:(CGRect)rect
//{
//    if (!_showData) {
//        _dataAllView.hidden = YES;
//    }
//}

- (IBAction)downClick:(id)sender {
    NSLog(@"ssss");
    UIButton *bt = (UIButton*)sender;
    if (!bt.selected) {
        
    }
 
    if (_dataAllView.subviews.count > 10 &&  _dataAllView.isHidden == NO) {
//        _dataAllView.hidden = YES;
        _showData = NO;
           [_delegate changeAddHouseCellHeigt:_showData andRow:_cellRow];
       
    } else {
//        _dataAllView.hidden = NO;
        _showData = YES;
           [_delegate changeAddHouseCellHeigt:_showData andRow:_cellRow];
        [self getDeviceType];
        float space = 30.0f;
        if (global_deviceType == iPhoneDeviceTypeIPhone4 || global_deviceType == iPhoneDeviceTypeIPhone4S) {
            space = 25.0f;
        } else if (global_deviceType == iPhoneDeviceTypeIPhone5 || global_deviceType == iPhoneDeviceTypeIPhone5S)
        {
            space = 30.0f;
        } else if (global_deviceType == iPhoneDeviceTypeIPhone6) {
            space = 40.f;
        } else if (global_deviceType == iPhoneDeviceTypeIPhone6P) {
            space = 90;
        }
        for (int i = 0; i < 31; i ++) {
            UIButton *bt = [UIButton new];
            [bt setFrame:CGRectMake((i % 5) * (space / 2 + 28) + space / 2 , i / 5 * space/2.5 + 6, 28, 28)];
            [bt setTitle:[NSString stringWithFormat:@"%d",i+1] forState:UIControlStateNormal];
            [bt setTag:i];
            [bt setBackgroundColor:[UIColor grayColor]];
            [bt setBackgroundImage:[UIImage imageNamed:@"rentyes"] forState:UIControlStateHighlighted];
            [bt addTarget:self action:@selector(dataSelect:) forControlEvents:UIControlEventTouchUpInside];
            [_dataAllView addSubview:bt];
        }
    }
}
- (IBAction)deletedClick:(id)sender {
    
}

-(void)getDeviceType
{
    iPhoneDeviceType type;
    
    CGRect bounds = [[UIScreen mainScreen] bounds];
    
    CGFloat height = bounds.size.height;
    NSLog(@"width %f",bounds.size.width);
    CGFloat scale = [UIScreen mainScreen].scale;
    
    if(height < 568) {
        type = iPhoneDeviceTypeIPhone4S;
    } else if(height < 667) {
        type = iPhoneDeviceTypeIPhone5S;
    } else if(scale < 2.9) {
        type=iPhoneDeviceTypeIPhone6;
    } else {
        type=iPhoneDeviceTypeIPhone6P;
    }
    global_deviceType=type;
}

typedef enum
{
    
    iPhoneDeviceTypeIPhone4,
    
    iPhoneDeviceTypeIPhone4S=iPhoneDeviceTypeIPhone4,
    
    iPhoneDeviceTypeIPhone5,
    
    iPhoneDeviceTypeIPhone5S=iPhoneDeviceTypeIPhone5,
    
    iPhoneDeviceTypeIPhone6,
    
    iPhoneDeviceTypeIPhone6P
    
}iPhoneDeviceType;

iPhoneDeviceType global_deviceType;

#define IS_IPHONE_5OR_ABOVE   (global_deviceType>=iPhoneDeviceTypeIPhone5S)

#define IS_IPHONE_6P  (global_deviceType==iPhoneDeviceTypeIPhone6P)

#define IS_IPHONE_6OR_ABOVE  (global_deviceType>=iPhoneDeviceTypeIPhone6)

#define IS_IPHONE_6          (global_deviceType==iPhoneDeviceTypeIPhone6)

#define VALUE_FOR_UNIVERSE_DEVICE(a,b,c)  ((IS_IPHONE_6P)?(a):((IS_IPHONE_6)?(b):(c)))
@end
