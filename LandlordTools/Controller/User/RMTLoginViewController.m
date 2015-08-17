//
//  RMTLoginViewController.m
//  RemoteControl
//
//  Created by vagrant on 4/2/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "RMTLoginViewController.h"
#import "RMTUtility.h"
#import "RMTRegisterViewController.h"
#import "ActionSheetStringPicker.h"
#import "MBProgressHUD.h"
#import "RMTUserLogic.h"
#import "RMTUserShareData.h"
#import "RMTUtilityLogin.h"
#import "RMTFindPasswordViewController.h"
//#import "RDVTabBarController.h"

NSString * const RMTLoginFinishedNotification = @"RMTLoginFinishedNotification";

@interface RMTLoginViewController ()
{
    IBOutlet UITextField *_accountTextField;
    IBOutlet UITextField *_passwordTextField;
    IBOutlet UIView *_HUDView;;
    
    NSArray  *_countryCodeArray;
}

@end

@implementation RMTLoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    
    // Do any additional setup after loading the view from its nib.
    
    [self loadLastAccount];
}

- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar setHidden:YES];
//    [self.rdv_tabBarController setTabBarHidden:YES animated:YES];
}



- (void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
    
}

- (void)loadLastAccount
{
//    RMTRegisterUserData *data = [[RMTUserLogic sharedInstance] getLastUserData];
//    if (!data) {
//        [_accountTextField becomeFirstResponder];
//        return;
//    }
//    _accountTextField.text = data.account;
    [_passwordTextField becomeFirstResponder];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - REQ

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    [_accountTextField resignFirstResponder];
    [_passwordTextField resignFirstResponder];
    
}

#pragma mark - UI

- (IBAction)backButtonClick:(id)sender
{
    [self.navigationController popViewControllerAnimated:YES];
//    [self presentLeftMenuViewController:self];
}

- (UIBarButtonItem *)createButtonWithType:(UIBarButtonSystemItem)type target:(id)target action:(SEL)buttonAction
{
    
    UIBarButtonItem *barButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:type target:target
                                                                               action:buttonAction];
    return barButton;
}

- (IBAction)loginButtonClick:(id)sender
{
    if ([_accountTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"手机号码不能为空"];
        return;
    }
    
    if ([_passwordTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"密码不能为空"];
        return;
    }
    
    [self showHUDView];
    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:_accountTextField.text  complete:^(NSError *error,int code) {
        if (error && code != RMTRegisterCodeHaveRegist) {
             [self hideHUDView];
            [self showAlertWithMessage:error.localizedDescription];
            return ;
        }
        [[RMTUserLogic sharedInstance] requestLoginName:_accountTextField.text password:_passwordTextField.text complete:^(NSError *error, RMTUserData *data) {
            [self hideHUDView];
            if (error) {
                [self showAlertWithMessage:error.localizedDescription];
                return ;
            }
            NSLog(@"login");
            [self showAlertWithMessage:@"登录成功"];
            [[RMTUserShareData sharedInstance] updataUserData:data];
            //        if (self.delegate) {
            //            [self.delegate loginFinishedHandler];
            //        }
            //
            //        [self.navigationController popViewControllerAnimated:YES];
            ////        [[NSNotificationCenter defaultCenter] postNotificationName:RMTLoginFinishedNotification object:nil];
        }];
    }];
    
 
}

- (IBAction)registerButtonClick:(id)sender
{
    RMTRegisterViewController *registerVC = [[RMTRegisterViewController alloc] init];
//    registerVC.delegate = _bridge;
    [self.navigationController pushViewController:registerVC animated:YES];
}

- (IBAction)accountTextFieldExit:(UITextField *)sender
{
    [_passwordTextField becomeFirstResponder];
}

- (IBAction)passwordTextFieldExit:(UITextField *)sender
{
    [sender resignFirstResponder];
    [self loginButtonClick:nil];
}

- (IBAction)resetPasswordButtonClick:(id)sender
{
    RMTFindPasswordViewController *resetVC = [[RMTFindPasswordViewController alloc] init];
    [self.navigationController pushViewController:resetVC animated:YES];
}

- (void)showHUDView
{
    _HUDView.hidden = NO;
    [MBProgressHUD showHUDAddedTo:_HUDView animated:YES];
}

- (void)hideHUDView
{
    _HUDView.hidden = YES;
    [MBProgressHUD hideHUDForView:_HUDView animated:YES];
}

- (void)showAlertWithMessage:(NSString *)message
{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:nil
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *defaultAction = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault
                                                          handler:nil];
    [alert addAction:defaultAction];
    [self presentViewController:alert animated:YES completion:nil];
    return;
}

@end







