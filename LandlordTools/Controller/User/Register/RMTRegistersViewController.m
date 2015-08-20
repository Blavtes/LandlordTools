//
//  RMTRegistersViewController.m
//  LandlordTools
//
//  Created by yong on 20/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "RMTRegistersViewController.h"
#import "RMTUtilityLogin.h"
#import "RMTUserShareData.h"

@interface RMTRegistersViewController ()
{
    NSTimer *_timer;
    NSDate *_sendDate;
    BOOL _verifyUse;

}

@property (weak, nonatomic) IBOutlet UILabel *notifyLabel;
@property (weak, nonatomic) IBOutlet UITextField *veritfyTextField;
@property (weak, nonatomic) IBOutlet UILabel *tipsVerifyLabel;
@property (weak, nonatomic) IBOutlet UIView *setView;
@property (weak, nonatomic) IBOutlet UITextField *passwordTextField;
@property (weak, nonatomic) IBOutlet UIButton *verifyBt;


@property (nonatomic, strong) RMTRegisterUserData *registerData;
@end

@implementation RMTRegistersViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}
- (IBAction)backClick:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

- (IBAction)verifyClick:(id)sender {
    [[RMTUtilityLogin sharedInstance] requestVerifyWithPhoneNumber:self.mobile  verifyCode:RMTVerificationCodeRegister complete:^(NSError *error, LoginPassworldBack *obj) {
        
        if (obj.code == RMTRequestBackCodeSucceed) {
            _notifyLabel.text = obj.message;
            
            _sendDate = [NSDate date];
            _timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(verifyHandle) userInfo:nil repeats:YES];
            [_timer fire];
            _verifyUse = YES;
            _tipsVerifyLabel.hidden = NO;
        }
        
    }];
}


- (void)verifyHandle
{
    NSDate *now = [NSDate date];
    NSInteger interval = (NSInteger)[now timeIntervalSinceDate:_sendDate];
    if (interval >= RMTVerfyTimeCount) {
        _verifyBt.enabled = YES;
        [_verifyBt setTitle:@"验证码" forState:UIControlStateNormal];
        [_timer invalidate];
        _timer = nil;
    }
    else
    {
        _verifyBt.enabled = NO;
        [_verifyBt setTitle:[NSString stringWithFormat:@"%ld秒后重发", (long)(RMTVerfyTimeCount - interval)] forState:UIControlStateNormal];
        [_verifyBt setTitle:[NSString stringWithFormat:@"%ld秒后重发", (long)(RMTVerfyTimeCount - interval)] forState:UIControlStateDisabled];
    }
}

- (IBAction)nextClick:(id)sender
{
    [[RMTUtilityLogin sharedInstance] requestCheckVerifyWithPhoneNumber:_mobile
                                                            checkVerify:_veritfyTextField.text
                                                              vcodeType:RMTVerificationCodeRegister
                                                               complete:^(NSError *error,LoginCheckoutVerifyData *data) {
                                                                   if (data.code == RMTRequestBackCodeSucceed) {
                                                                       RMTUserData *userData =  [[RMTUserShareData sharedInstance] userData];
                                                                       userData.token = data.token;
                                                                       [[RMTUserShareData sharedInstance] updataUserData:userData];
                                                                       _setView.hidden = NO;
                                                                       _registerData.mobile = _mobile;
                                                                       _registerData.password = _veritfyTextField.text;
                                                                       _registerData.token = data.token;
                                                                       _registerData.userType = RMTRegisterLandlordsType;
                                                                       _notifyLabel.text = @"";
                                                                   } else {
                                                                       _notifyLabel.text = data.message;
                                                                   }
                                                               }];
}


- (IBAction)registeClick:(id)sender
{
    [[RMTUtilityLogin sharedInstance] requestRegisterUserWithData:_registerData
                                                         complete:^(NSError *error,LoginPassworldBack*login) {
                                                             if (login.code == RMTRequestBackCodeSucceed) {
                                                                 RMTUserData *data = [[RMTUserData alloc] init];
                                                                 data.mobile = _registerData.mobile;
                                                                 data.token = _registerData.token;
                                                                 data.loginId = login.loginId;
                                                                 [[RMTUserShareData sharedInstance] updataUserData:data];
                                                                 for (UIViewController *controller in self.navigationController.viewControllers) {
                                                                     if ([controller isKindOfClass:NSClassFromString(@"MainContentControlViewController")]) {
                                                                         [self.navigationController popToViewController:controller animated:YES];
                                                                         
                                                                         return;
                                                                     }
                                                                 }
                                                             } else {
                                                                 _notifyLabel.text = login.message;
                                                             }
                                                         }];

}


@end
