//
//  RMTLoginForgotViewController.m
//  LandlordTools
//
//  Created by yong on 19/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "RMTLoginForgotViewController.h"
#import "RMTUtilityLogin.h"
#import "RMTUserShareData.h"

@interface RMTLoginForgotViewController () <UITextFieldDelegate>

{
    
    NSTimer *_timer;
    NSDate *_sendDate;
    BOOL _verifyUse;
}

@property (weak, nonatomic) IBOutlet UILabel *notifyLabel1;
@property (weak, nonatomic) IBOutlet UILabel *notifyLabel2;
@property (weak, nonatomic) IBOutlet UILabel *notifyLabel3;
@property (weak, nonatomic) IBOutlet UITextField *inputTextField;
@property (weak, nonatomic) IBOutlet UIView *verifyView;
@property (weak, nonatomic) IBOutlet UITextField *verifyTextField;
@property (weak, nonatomic) IBOutlet UIButton *verifyBt;
@property (weak, nonatomic) IBOutlet UIView *setView;

@property (weak, nonatomic) IBOutlet UITextField *setTextField;

@property (nonatomic, strong) NSString *mobile;

@end

@implementation RMTLoginForgotViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _notifyLabel1.text = @"";
    _notifyLabel2.text = @"";
    _notifyLabel3.text = @"";
    _inputTextField.delegate = self;
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    _notifyLabel1.text = @"";
    _notifyLabel2.text = @"";
    _notifyLabel3.text = @"";
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

- (IBAction)nextClick:(id)sender
{
    if ([_inputTextField.text isEqualToString:@""]) {
        _notifyLabel1.text = @"手机号码不能为空";
        return;
    }
    _mobile = _inputTextField.text;
    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:_mobile  complete:^(NSError *error,BackOject *obj) {
        
        if (obj.code == RMTRegisterCodeHaveRegist) {
            _verifyView.hidden = NO;
            _notifyLabel1.text = @"";
        } else {
            _notifyLabel1.text = obj.message;
        }
        
        NSLog(@"back code %d  message %@ ",obj.code,obj.message);
    }];
}

- (IBAction)verifyNextClick:(id)sender
{
    if ([_verifyTextField.text length] == 0) {
         _notifyLabel1.text  = @"验证码错误";
        return;
    }
    [[RMTUtilityLogin sharedInstance] requestCheckVerifyWithPhoneNumber:_mobile
                                                            checkVerify:_verifyTextField.text
                                                              vcodeType:RMTVerificationCodeFindWorld
                                                               complete:^(NSError *error,LoginCheckoutVerifyData *data) {
                                                                   if (data.code == RMTRequestBackCodeSucceed) {
                                                                       RMTUserData *userData =  [[RMTUserShareData sharedInstance] userData];
                                                                       userData.token = data.token;
                                                                       [[RMTUserShareData sharedInstance] updataUserData:userData];
                                                                       _setView.hidden = NO;
                                                                   } else {
                                                                       _notifyLabel1.text = data.message;
                                                                   }
                                                               }];
}


- (IBAction)verifyClick:(id)sender {
    if (!self.mobile) {
        return;
    }
    [[RMTUtilityLogin sharedInstance] requestVerifyWithPhoneNumber:self.mobile  verifyCode:RMTVerificationCodeFindWorld complete:^(NSError *error, LoginPassworldBack *obj) {
       
        if (obj.code == RMTRequestBackCodeSucceed) {
            _notifyLabel2.text = obj.message;
            
            _sendDate = [NSDate date];
            _timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(verifyHandle) userInfo:nil repeats:YES];
            [_timer fire];
            _verifyUse = YES;
        }
       
    }];

}

- (IBAction)setClick:(id)sender
{
    [[RMTUtilityLogin sharedInstance] requestUpdatePasswordWithPhoneNumber:self.mobile
                                                                  password:_setTextField.text
                                                                     token:[[RMTUserShareData sharedInstance] userData].token
                                                                  complete:^(NSError *error,LoginCheckoutVerifyData *obj) {
                                                                      if (obj.code == RMTRequestBackCodeSucceed) {
                                                                          _notifyLabel3.text = obj.message;
                                                                      }
                                                                  }];
}


- (void)verifyHandle
{
    NSDate *now = [NSDate date];
    NSInteger interval = (NSInteger)[now timeIntervalSinceDate:_sendDate];
    if (interval >= 60) {
        _verifyBt.enabled = YES;
        [_verifyBt setTitle:@"验证码" forState:UIControlStateNormal];
        [_timer invalidate];
        _timer = nil;
    }
    else
    {
        _verifyBt.enabled = NO;
        [_verifyBt setTitle:[NSString stringWithFormat:@"%ld秒后重发", (long)(60 - interval)] forState:UIControlStateNormal];
        [_verifyBt setTitle:[NSString stringWithFormat:@"%ld秒后重发", (long)(60 - interval)] forState:UIControlStateDisabled];
    }
}

- (IBAction)backClick:(id)sender
{
    for (UIViewController *controller in self.navigationController.viewControllers) {
        if ([controller isKindOfClass:NSClassFromString(@"MainContentControlViewController")]) {
            [self.navigationController popToViewController:controller animated:YES];

            return;
        }
    }
}

@end
