//
//  RMTLoginInputPassWorldViewController.m
//  LandlordTools
//
//  Created by yong on 19/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "RMTLoginInputPassWorldViewController.h"
#import "RMTUtilityLogin.h"
#import "RMTUserLogic.h"
#import "RMTUserShareData.h"

@interface RMTLoginInputPassWorldViewController () <UITextFieldDelegate>
@property (weak, nonatomic) IBOutlet UILabel *notifyLabel;
@property (weak, nonatomic) IBOutlet UITextField *inputPassWordTextField;

@end

@implementation RMTLoginInputPassWorldViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _inputPassWordTextField.delegate = self;
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/
- (IBAction)backClick:(id)sender
{
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    _inputPassWordTextField.text = @"";
}

- (IBAction)loginClick:(id)sender
{
    if ([_inputPassWordTextField.text isEqualToString:@""]) {
        _notifyLabel.text = @"密码不能为空";
        return;
    }
     _notifyLabel.text = @"";
    [[RMTUserLogic sharedInstance] requestLoginName:_mobile password:_inputPassWordTextField.text complete:^(NSError *error, RMTUserData *data) {

        if (error) {
            NSLog(@"Login error");
            return ;
        }
        NSLog(@"login %@",data.loginId);
        _notifyLabel.text = data.message;
        [[RMTUserShareData sharedInstance] updataUserData:data];
        //        if (self.delegate) {
        //            [self.delegate loginFinishedHandler];
        //        }
        //
        //        [self.navigationController popViewControllerAnimated:YES];
        ////        [[NSNotificationCenter defaultCenter] postNotificationName:RMTLoginFinishedNotification object:nil];
    }];

    
}

- (IBAction)findPassWordClick:(id)sender
{
    
}

@end
