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
#import "RMTLoginViewController.h"
#import "RMTAgreementViewController.h"
#import "RMTUtilityLogin.h"

@interface RMTRegisterViewController ()
{
    IBOutlet UITextField *_accountTextField;
    IBOutlet UITextField *_passwordTextField;
    IBOutlet UITextField *_nicknameTextField;
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

@implementation RMTRegisterViewController

- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar setHidden:YES];
//    [self.rdv_tabBarController setTabBarHidden:YES animated:YES];
}

- (void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
}

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
    [self showHUDView];
    [[RMTUtilityLogin sharedInstance] requestCountryCodeList:^(NSError *error, NSArray *data) {
        [self hideHUDView];
        if (error) {
            [self showAlertWithMessage:@"获取国家和地区列表失败！"];
            return ;
        }
        
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
            _countryCodeLabel.text = [NSString stringWithFormat:@"%@", @"0086"];
            [_countryValueButton setTitle:_countryCodeLabel.text forState:UIControlStateNormal];
//        }
    }];
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
    
    ActionSheetStringPicker *picker = [[ActionSheetStringPicker alloc] initWithTitle:@"请选择"
                                                                                rows:array initialSelection:_selectedCountryIndex
                                                                           doneBlock:^(ActionSheetStringPicker *picker, NSInteger selectedIndex, id selectedValue) {
//                                                                               RMTCountryCodeData *data = [_countryCodeArray objectAtIndex:selectedIndex];
                                                                               _selectedCountryIndex = selectedIndex;
//                                                                               _countryCodeLabel.text = [NSString stringWithFormat:@"%@", data.countrycode];
                                                                               [_countryValueButton setTitle:selectedValue forState:UIControlStateNormal];
                                                                           } cancelBlock:^(ActionSheetStringPicker *picker) {
                                                                               NSLog(@"Block Picker Canceled");
                                                                           } origin:self.view];
    UIBarButtonItem *doneButton = [[UIBarButtonItem alloc] initWithTitle:@"完成"
                                                                   style:UIBarButtonItemStyleDone
                                                                  target:picker
                                                                  action:@selector(actionPickerDone:)];
    UIBarButtonItem *cancelButton = [[UIBarButtonItem alloc] initWithTitle:@"取消"
                                                                     style:UIBarButtonItemStyleDone
                                                                    target:picker
                                                                    action:@selector(actionPickerCancel:)];
    [picker setDoneButton:doneButton];
    [picker setCancelButton:cancelButton];
    [picker showActionSheetPicker];
}

- (IBAction)verifyButtonClick:(id)sender
{
    if ([_accountTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"手机号不能为空"];
        return;
    }
    if (![[RMTUserLogic sharedInstance] validateWithPhoneNumber:_accountTextField.text countryCode:_countryCodeLabel.text]) {
        [self showAlertWithMessage:@"手机号码有误，请重新输入"];
        return;
    }
    [self showHUDView];
    [[RMTUtilityLogin sharedInstance] requestVerifyWithPhoneNumber:_accountTextField.text
                                                       verifyCode:RMTVerificationCodeRegister
                                                          complete:^(NSError *error,LoginPassworldBack *data) {
                                                              [self hideHUDView];
                                                              if (error) {
                                                                  [self showAlertWithMessage:error.localizedDescription];
                                                                  return ;
                                                              }
                                                              [self showTipsWithString:@"验证码已发送"];
                                                              
                                                              _sendDate = [NSDate date];
                                                              _timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(verifyHandle) userInfo:nil repeats:YES];
                                                              [_timer fire];
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

- (BOOL)validateNickname
{
    NSString *nickname = _nicknameTextField.text;
    NSCharacterSet *set = [NSCharacterSet characterSetWithCharactersInString:@" @／：；（）¥「」＂、[]{}#%-*+=\\|~＜＞$€^•'@#$%^&*()_+'\""];
    if ([nickname rangeOfCharacterFromSet:set].location != NSNotFound) {
        return NO;
    }
    
    __block BOOL valid = YES;
    [nickname enumerateSubstringsInRange:NSMakeRange(0, [nickname length]) options:NSStringEnumerationByComposedCharacterSequences usingBlock:
     ^(NSString *substring, NSRange substringRange, NSRange enclosingRange, BOOL *stop) {
         
         const unichar hs = [substring characterAtIndex:0];
         if (0xd800 <= hs && hs <= 0xdbff) {
             if (substring.length > 1) {
                 const unichar ls = [substring characterAtIndex:1];
                 const int uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
                 if (0x1d000 <= uc && uc <= 0x1f77f) {
                     valid = NO;
                 }
             }
         } else if (substring.length > 1) {
             const unichar ls = [substring characterAtIndex:1];
             if (ls == 0x20e3 || ls == 0xfe0f) {
                 valid = NO;
             }
             
         } else {
             if (0x2100 <= hs && hs <= 0x27ff) {
                 valid = NO;
             } else if (0x2B05 <= hs && hs <= 0x2b07) {
                 valid = NO;
             } else if (0x2934 <= hs && hs <= 0x2935) {
                 valid = NO;
             } else if (0x3297 <= hs && hs <= 0x3299) {
                 valid = NO;
             } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030 || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b || hs == 0x2b50) {
                 valid = NO;
             }
         }
     }];
    
    return valid;
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
    [_nicknameTextField becomeFirstResponder];
}

- (IBAction)nicknameTextFieldExit:(UITextField *)sender
{
    [sender resignFirstResponder];
    [self registerButtonClick:nil];
}

- (IBAction)registerButtonClick:(id)sender
{
    
    if ([_accountTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"手机号码不能为空"];
        return;
    }
    if ([_passwordTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"密码不能为空"];
        return;
    }
    if ([_verifycodeTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"验证码不能为空"];
        return;
    }
    if ([_nicknameTextField.text isEqualToString:@""]) {
        [self showAlertWithMessage:@"昵称不能为空"];
        return;
    }
    if (_passwordTextField.text.length < 6) {
        [self showAlertWithMessage:@"密码长度不能小于6位"];
        return;
    }
    if (![[RMTUserLogic sharedInstance] validateWithPhoneNumber:_accountTextField.text countryCode:@"0086"]) {
        [self showAlertWithMessage:@"手机号码有误，请重新输入"];
        return;
    }
    if (![self validateNickname]) {
        [self showAlertWithMessage:@"昵称包含非法字符，请重新输入"];
        return;
    }
    
    RMTRegisterUserData *data = [[RMTRegisterUserData alloc] init];

    data.mobile = _accountTextField.text;
    data.password = _passwordTextField.text;
    data.userType = RMTRegisterLandlordsType;
    [self showHUDView];
    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:data.mobile
                                                       complete:^(NSError *error,BackOject *obj) {
        if (error && obj.code == RMTRegisterCodeHaveRegist) {
             [self hideHUDView];
            [self showAlertWithMessage:error.localizedDescription];
            return ;
        }
       if (obj.code == RMTRegisterCodeErr) {
           [self hideHUDView];
           [self showAlertWithMessage:error.localizedDescription];
           return;
       }
            [[RMTUtilityLogin sharedInstance] requestCheckVerifyWithPhoneNumber:data.mobile
                                                                    checkVerify:_verifycodeTextField.text
                                                                      vcodeType:RMTVerificationCodeRegister
                                                                       complete:^(NSError *error,LoginCheckoutVerifyData *token) {
                   if (error || !token) {
                       [self hideHUDView];
                       NSLog(@"验证码 失败");
                       [self showAlertWithMessage:error.localizedDescription];
                       return ;
                   }
                    data.token = token.token;
                    [[RMTUtilityLogin sharedInstance] requestRegisterUserWithData:data
                                                                         complete:^(NSError *error,NSString*loginId) {
                       
                        if (error && !loginId) {
                             [self hideHUDView];
                             NSLog(@"loginId error %@",loginId);
                            [self showAlertWithMessage:error.localizedDescription];
                            return ;
                        }
                         NSLog(@"loginId %@",loginId);
                                        [self showAlertWithMessage:error.localizedDescription];                                      
//                        [[RMTUserLogic sharedInstance] requestLoginName:data.mobile
//                                                               password:data.password
//                                                               complete:^(NSError *error, RMTUserData *data) {
//                                                                   [self hideHUDView];
//                                                                   if (error) {
//                                                                       [self showAlertWithMessage:error.localizedDescription];
//                                                                       return ;
//                                                                   }
//                                                                   
//                                                                   //                                                   if (self.delegate) {
//                                                                   //                                                       [self.delegate loginFinishedHandler];
//                                                                   //                                                   }
//                                                                   
//                                                                   [self back];
//                                                                   
//                                                                   
//                                                               }];
                    }];
               
            }];

        
    }];
    
    
}

- (IBAction)agreementButtonClick:(id)sender
{
    RMTAgreementViewController *agreementVC = [[RMTAgreementViewController alloc] init];
    [self.navigationController pushViewController:agreementVC animated:YES];
}


- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    [self.view endEditing:YES];
}

- (void)back{
    //返回引导页
    [self.navigationController popViewControllerAnimated:YES];
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











