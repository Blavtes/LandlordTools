//
//  RMTRegisterViewController.m
//  RemoteControl
//
//  Created by vagrant on 4/16/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "RMTRegisterViewController.h"
#import "RMTUtility.h"
#import "ActionSheetStringPicker.h"
#import "MBProgressHUD.h"
#import "RMTUserLogic.h"
#import "RMTFindPasswordViewController.h"
#import "RMTAgreementViewController.h"
#import "RMTUserLogic.h"
#import "RMTUtilityLogin.h"

@interface RMTFindPasswordViewController ()
{
    IBOutlet UITextField *_accountTextField;
    IBOutlet UITextField *_passwordTextField;
    IBOutlet UITextField *_verifycodeTextField;
    IBOutlet UILabel *_countryCodeLabel;
    IBOutlet UIButton *_countryValueButton;
    IBOutlet UIButton *_verifyButton;
    IBOutlet UIView *_HUDView;
    
    UIView *_tipsView;
    NSArray  *_countryCodeArray;
    NSTimer *_timer;
    NSDate *_sendDate;
    NSInteger _selectedCountryIndex;
}

@end

@implementation RMTFindPasswordViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self requestCountryCodeList];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - REQ

- (void)requestCountryCodeList
{
//    [self showHUDView];
//    [[RMTUtilityLogin sharedInstance] requestCountryCodeList:^(NSError *error, NSArray *data) {
//        [self hideHUDView];
//        if (error) {
//            [self showAlertWithMessage:@"获取国家和地区列表失败！"];
//            return ;
//        }
//        
//        _countryCodeArray = [data copy];
//        if (_countryCodeArray.count > 0) {
//            _selectedCountryIndex = 0;
//            NSString *language = [[NSLocale preferredLanguages] objectAtIndex:0];
//            if ([language isEqualToString:@"zh-Hant"]) {
//                for (NSInteger i = 0; i < _countryCodeArray.count; i++) {
//                    RMTCountryCodeData *data = _countryCodeArray[i];
//                    if ([data.countrycode isEqualToString:@"00886"]) {
//                        _selectedCountryIndex = i;
//                    }
//                }
//            }
//            
//            RMTCountryCodeData *data = [_countryCodeArray objectAtIndex:_selectedCountryIndex];
//            _countryCodeLabel.text = [NSString stringWithFormat:@"%@", data.countrycode];
//            [_countryValueButton setTitle:data.name forState:UIControlStateNormal];
//        }
//    }];
}

#pragma mark - UI

- (IBAction)countryCodeButtonClick:(id)sender
{
    NSMutableArray *array = [[NSMutableArray alloc] initWithCapacity:_countryCodeArray.count];
//    for (RMTCountryCodeData *code in _countryCodeArray) {
//        [array addObject:code.name];
//    }
    
    if (!array || array.count == 0) {
        [self showAlertWithMessage:@"获取列表失败！"];
        return;
    }
//    
//    ActionSheetStringPicker *picker = [[ActionSheetStringPicker alloc] initWithTitle:@"请选择"
//                                                                                rows:array initialSelection:_selectedCountryIndex
//                                                                           doneBlock:^(ActionSheetStringPicker *picker, NSInteger selectedIndex, id selectedValue) {
//                                                                               RMTCountryCodeData *data = [_countryCodeArray objectAtIndex:selectedIndex];
//                                                                               _selectedCountryIndex = selectedIndex;
//                                                                               _countryCodeLabel.text = [NSString stringWithFormat:@"%@", data.countrycode];
//                                                                               [_countryValueButton setTitle:selectedValue forState:UIControlStateNormal];
//                                                                           } cancelBlock:^(ActionSheetStringPicker *picker) {
//                                                                               NSLog(@"Block Picker Canceled");
//                                                                           } origin:self.view];
//    UIBarButtonItem *doneButton = [[UIBarButtonItem alloc] initWithTitle:@"完成"
//                                                                   style:UIBarButtonItemStyleDone
//                                                                  target:picker
//                                                                  action:@selector(actionPickerDone:)];
//    UIBarButtonItem *cancelButton = [[UIBarButtonItem alloc] initWithTitle:@"取消"
//                                                                     style:UIBarButtonItemStyleDone
//                                                                    target:picker
//                                                                    action:@selector(actionPickerCancel:)];
//    [picker setDoneButton:doneButton];
//    [picker setCancelButton:cancelButton];
//    [picker showActionSheetPicker];
}

- (IBAction)verifyButtonClick:(id)sender
{
    NSString *mobile = _accountTextField.text;

    if ([mobile isEqualToString:@""]) {
        [self showAlertWithMessage:@"手机号不能为空"];
        return;
    }
    if (![[RMTUserLogic sharedInstance] validateWithPhoneNumber:mobile countryCode:kCOUNTCODE]) {
        [self showAlertWithMessage:@"手机号码有误，请重新输入"];
        return;
    }
    
    
    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:mobile complete:^(NSError *error, int code) {
        if (error && code != RMTRegisterCodeHaveRegist) {
            [self showAlertWithMessage:error.localizedDescription];
             [self hideHUDView];
            return ;
        }
        
        [[RMTUtilityLogin sharedInstance] requestVerifyWithPhoneNumber:mobile  verifyCode:@"2" complete:^(NSError *error) {
            if (error) {
                [self showAlertWithMessage:error.localizedDescription];
                 [self hideHUDView];
                return ;
            }
          
            
//            [[RMTUtilityLogin sharedInstance] requestFindPasswordWithPhoneNumber:mobile
//                                                                     countryCode:kCOUNTCODE
//                                                                        complete:^(NSError *error) {
//                [self hideHUDView];
//                if (error) {
//                    [self showAlertWithMessage:error.localizedDescription];
//                    return ;
//                }
            
                                                                            
                [self hideHUDView];
                [self showTipsWithString:@"验证码已发送"];
                
                _sendDate = [NSDate date];
                _timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(verifyHandle) userInfo:nil repeats:YES];
                [_timer fire];
//            }];
        }];
        
      
        
    }];
    

    
}

- (void)verifyHandle
{
    NSDate *now = [NSDate date];
    NSInteger interval = (NSInteger)[now timeIntervalSinceDate:_sendDate];
    if (interval >= 60) {
        _verifyButton.enabled = YES;
        [_verifyButton setTitle:@"发送验证码" forState:UIControlStateNormal];
        [_timer invalidate];
        _timer = nil;
    }
    else
    {
        _verifyButton.enabled = NO;
        [_verifyButton setTitle:[NSString stringWithFormat:@"%ld秒后重发", (long)(60 - interval)] forState:UIControlStateNormal];
        [_verifyButton setTitle:[NSString stringWithFormat:@"%ld秒后重发", (long)(60 - interval)] forState:UIControlStateDisabled];
    }
}

- (IBAction)backButtonClick:(id)sender
{
    [_timer invalidate];
    _timer = nil;
    [self.navigationController popViewControllerAnimated:YES];
}

- (IBAction)showPasswordClick:(id)sender
{
    _passwordTextField.secureTextEntry = !_passwordTextField.secureTextEntry;
}

- (IBAction)verifyTextFieldExit:(UITextField *)sender
{
    [_passwordTextField becomeFirstResponder];
}

- (IBAction)passwordTextFieldExit:(UITextField *)sender
{
    [sender becomeFirstResponder];
    [self resetButtonClick:nil];
}

- (IBAction)resetButtonClick:(id)sender
{
    NSString *mobile = _accountTextField.text;
    if ([_accountTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"手机号码不能为空"];
//        return;
    }
    if ([_passwordTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"密码不能为空"];
//        return;
    }
    if ([_verifycodeTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"验证码不能为空"];
//        return;
    }
    if (_verifycodeTextField.text.length != 6) {
        [self showAlertWithMessage:@"短信验证码错误，请重新输入"];
//        return;
    }
    if (_passwordTextField.text.length < 6) {
        [self showAlertWithMessage:@"密码长度不能小于6位"];
//        return;
    }
    if (![[RMTUserLogic sharedInstance] validateWithPhoneNumber:_accountTextField.text countryCode:@"0086"]) {
        [self showAlertWithMessage:@"手机号码有误，请重新输入"];
//        return;
    }
    
    [self showHUDView];
    
    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:mobile complete:^(NSError *error, int code) {
         if (error && code != RMTRegisterCodeHaveRegist) {
            [self showAlertWithMessage:error.localizedDescription];
            [self hideHUDView];
            return ;
        }
        
        [[RMTUtilityLogin sharedInstance] requestCheckVerifyWithPhoneNumber:mobile
                                                                checkVerify:_verifycodeTextField.text
                                                                  vcodeType:RMTVerificationCodeFindWorld
                                                                   complete:^(NSError *error,NSString*tokens) {
              if (error || !tokens) {
                [self showAlertWithMessage:error.localizedDescription];
                [self hideHUDView];
                return ;
            }
            [[RMTUtilityLogin sharedInstance] requestUpdatePasswordWithPhoneNumber:_accountTextField.text
                                                                          password:_passwordTextField.text
                                                                             token:tokens
                                                                          complete:^(NSError *error) {
                                                                              [self hideHUDView];
                                                                              if (error) {
                                                                                  [self showAlertWithMessage:error.localizedDescription];
                                                                                  return ;
                                                                              }
                                                                              //
                                                                              [self showTipsWithString:@"密码设置成功"];
                                                                              [self performSelector:@selector(backButtonClick:) withObject:nil afterDelay:0.5];
                                                                          }];
            }];
      
        }];
}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    [self.view endEditing:YES];
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

- (void)showTipsWithString:(NSString *)title
{
    if (_tipsView == nil) {
        _tipsView = [[UIView alloc] initWithFrame:CGRectMake((CGRectGetWidth(self.view.frame) - 150 ) / 2, (CGRectGetHeight(self.view.frame) - 50 ) / 2, 150, 50)];
        _tipsView.backgroundColor = [UIColor colorWithRed:0 green:0 blue:0 alpha:0.9];
        _tipsView.layer.cornerRadius = 8.0;
        _tipsView.layer.masksToBounds = YES;
        
        UILabel *label = [[UILabel alloc] initWithFrame:_tipsView.bounds];
        label.textColor = [UIColor whiteColor];
        label.tag = 100;
        label.text = title;
        label.textAlignment = NSTextAlignmentCenter;
        [_tipsView addSubview:label];
    }
    else
    {
        UILabel *label = (UILabel *)[_tipsView viewWithTag:100];
        label.text = title;
    }
    
    [self.view addSubview:_tipsView];
    [_tipsView performSelector:@selector(removeFromSuperview) withObject:nil afterDelay:3];
}

@end











