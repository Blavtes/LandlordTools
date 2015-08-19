//
//  RMTLoginForgotViewController.m
//  LandlordTools
//
//  Created by yong on 19/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "RMTLoginForgotViewController.h"
#import "RMTUtilityLogin.h"

@interface RMTLoginForgotViewController () <UITextFieldDelegate>

{
    
    NSTimer *_timer;
    NSDate *_sendDate;
}

@property (weak, nonatomic) IBOutlet UILabel *notifyLabel;
@property (weak, nonatomic) IBOutlet UITextField *inputTextField;
@property (weak, nonatomic) IBOutlet UIView *verifyView;
@property (weak, nonatomic) IBOutlet UITextField *verifyTextField;
@property (weak, nonatomic) IBOutlet UIButton *verifyBt;


@property (nonatomic, strong) NSString *mobile;;

@end

@implementation RMTLoginForgotViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _notifyLabel.text = @"";
    _inputTextField.delegate = self;
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    _notifyLabel.text = @"";
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
        _notifyLabel.text = @"手机号码不能为空";
        return;
    }
    _mobile = _inputTextField.text;
    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:_mobile  complete:^(NSError *error,BackOject *obj) {

        if (obj.code == RMTRegisterCodeHaveRegist) {
//            RMTLoginInputPassWorldViewController *vc = [[RMTLoginInputPassWorldViewController alloc] init];
//            vc.mobile = mobile;
//            [self.navigationController pushViewController:vc animated:YES];
        }
        _notifyLabel.text = obj.message;
        NSLog(@"back code %d  message %@ ",obj.code,obj.message);
    }];
}

- (IBAction)verifyClick:(id)sender {
    [[RMTUtilityLogin sharedInstance] requestVerifyWithPhoneNumber:self.mobile  verifyCode:@"2" complete:^(NSError *error, LoginPassworldBack *obj) {
       
        if (obj.code == RMTRequestBackCodeSucceed) {
            _notifyLabel.text = obj.message;
            
            _sendDate = [NSDate date];
            _timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(verifyHandle) userInfo:nil repeats:YES];
            [_timer fire];
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
    [self.navigationController popViewControllerAnimated:YES];
}

@end
