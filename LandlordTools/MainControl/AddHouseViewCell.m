//
//  AddHouseViewCell.m
//  LandlordTools
//
//  Created by yong on 10/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "AddHouseViewCell.h"

@implementation AddHouseViewCell

- (void)awakeFromNib {
    // Initialization code

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
    _showData = YES;
    _titleTextField.text = data.buildingName;
    _waterTextField.text = [NSString stringWithFormat:@"%.1f",data.waterPrice];
    _ammterTextField.text = [NSString stringWithFormat:@"%.1f",data.electricPrice];
    _cellRow = row;
}

- (IBAction)downClick:(id)sender {
    NSLog(@"ssss");
    UIButton *bt = (UIButton*)sender;
    if (!bt.selected) {
        
    }
 
    if (_dataAllView.subviews.count > 10 &&  _dataAllView.isHidden == NO) {
        _dataAllView.hidden = YES;
        _showData = NO;
           [_delegate changeAddHouseCellHeigt:_showData andRow:_cellRow];
        return;
    } else {
        _dataAllView.hidden = NO;
        _showData = YES;
           [_delegate changeAddHouseCellHeigt:_showData andRow:_cellRow];
        for (int i = 0; i < 31; i ++) {
            UIButton *bt = [UIButton new];
            [bt setFrame:CGRectMake(i % 7 * 44 +  40, i / 7 * 44, 40, 40)];
            [bt setTitle:[NSString stringWithFormat:@"%d",i+1] forState:UIControlStateNormal];
            [bt setTag:i];
            [bt setBackgroundColor:[UIColor grayColor]];
            [bt setBackgroundImage:[UIImage imageNamed:@"rentyes"] forState:UIControlStateHighlighted];
            [bt addTarget:self action:@selector(dataSelect:) forControlEvents:UIControlEventTouchUpInside];
            [_dataAllView addSubview:bt];
        }
    }
}


@end
