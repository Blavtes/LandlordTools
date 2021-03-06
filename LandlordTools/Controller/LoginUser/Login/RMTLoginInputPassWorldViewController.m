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
#import "RMTLoginForgotViewController.h"

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
    if ([[RMTUtilityLogin sharedInstance] getIsTempData]) {
        [self.navigationController popViewControllerAnimated:YES];
        return;
    }
    for (UIViewController *controller in self.navigationController.viewControllers) {
        if ([controller isKindOfClass:NSClassFromString(@"MainContentControlViewController")]) {
            [self.navigationController popToViewController:controller animated:YES];
            
            return;
        }
    }
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
    [[RMTUserLogic sharedInstance] requestLoginName:_mobile
                                           password:_inputPassWordTextField.text
                                           complete:^(NSError *error, RMTUserData *data) {
                                               
                                               
                                               NSLog(@"login %@",data.loginId);
                                               _notifyLabel.text = data.message;
                                               [[RMTUserShareData sharedInstance] updataUserData:data];
                                               NSString *classStr = @"MainContentControlViewController";
                                               if ([[RMTUtilityLogin sharedInstance] getIsTempData]) {
                                                   classStr = @"AddRoomViewController";
                                               }
                                               for (UIViewController *controller in self.navigationController.viewControllers) {
                                                   if ([controller isKindOfClass:NSClassFromString(classStr)]) {
                                                       [self.navigationController popToViewController:controller animated:YES];
                                                       
                                                       return;
                                                   }
                                               }
                                           }];
    
    
}

- (IBAction)findPassWordClick:(id)sender
{
    RMTLoginForgotViewController *vc = [[RMTLoginForgotViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

@end
