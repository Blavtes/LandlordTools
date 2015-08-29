//
//  AddLastMothDataTableViewCell.m
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "AddLastMothDataTableViewCell.h"

@implementation AddLastMothDataTableViewCell

- (void)awakeFromNib {
    // Initialization code
//         [_editTextField becomeFirstResponder];
    _editTextField.delegate = self;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

- (void)textFieldDidEndEditing:(UITextField *)textField
{
    if ([_delegate respondsToSelector:@selector(postCurrentData:withPath:)]) {
        [_delegate postCurrentData:textField.text withPath:_sectionPath];
    }
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    NSLog(@"begin edit");
    _editTextField.text = @"";
   
}

- (void)setComtentData:(NSString *)title withField:(NSString *)fieldText withPath:(NSIndexPath *)path
{
    _titleLabel.text = title;
    _editTextField.text = [NSString stringWithFormat:@"%.2f",[fieldText floatValue]];
    self.sectionPath = path;


}

- (IBAction)editBtClick:(id)sender {
    [_editTextField becomeFirstResponder];
}


@end
