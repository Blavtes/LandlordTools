//
//  RMTCountryPickerView.m
//  RemoteControl
//
//  Created by vagrant on 4/17/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "RMTCountryPickerView.h"

@interface RMTCountryPickerView() <UIPickerViewDelegate, UIPickerViewDataSource>
{
    UIPickerView *_pickerView;
}



@end

@implementation RMTCountryPickerView

- (BOOL)showPickerOnView:(UIView *)view
               withTitle:(NSString *)title
                    rows:(NSArray *)array
               doneBlock:(void (^)(RMTCountryPickerView *picker, NSInteger selectedIndex))block
{
    if (!view || !array) {
        return NO;
    }
    return YES;
    
}

@end
