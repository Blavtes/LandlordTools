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

}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    NSLog(@"begin edit");
   
}

- (void)setComtentData:(NSString *)title withField:(NSString *)fieldText
{
    _titleLabel.text = title;
    _placeHoldStr = fieldText;
    NSLog(@"title %@  fiel %@",title,fieldText);
    _editTextField.placeholder = fieldText;

}

- (IBAction)editBtClick:(id)sender {
    [_editTextField becomeFirstResponder];
}


@end
