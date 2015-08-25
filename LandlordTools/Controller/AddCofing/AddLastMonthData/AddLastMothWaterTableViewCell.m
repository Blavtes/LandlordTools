//
//  AddLastMothWaterTableViewCell.m
//  LandlordTools
//
//  Created by yangyong on 16/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "AddLastMothWaterTableViewCell.h"

@implementation AddLastMothWaterTableViewCell

- (void)awakeFromNib {
    // Initialization code
    _numberTextField.delegate = self;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

- (void)setComtentData:(NSString*)title withField:(NSString*)fieldText withPath:(NSIndexPath *)path
{
    _titleLable.text = title;
    _numberTextField.text = [NSString stringWithFormat:@"%.2f",[fieldText floatValue]];
    self.sectionPath = path;
}

- (void)textFieldDidEndEditing:(UITextField *)textField
{
    _resultLabel.text = textField.text;
    
    if ([_delegate respondsToSelector:@selector(postCurrentData:withPath:)]) {
        [_delegate postCurrentData:textField.text withPath:_sectionPath];
    }
}

- (IBAction)editBTClick:(id)sender {
    [_numberTextField becomeFirstResponder];
}


@end
