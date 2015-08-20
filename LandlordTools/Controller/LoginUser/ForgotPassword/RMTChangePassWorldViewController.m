//
//  RMTChangePassWorldViewController.m
//  LandlordTools
//
//  Created by yong on 19/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "RMTChangePassWorldViewController.h"
#import "RMTUtilityLogin.h"
#import "RMTUserLogic.h"
#import "RMTUserShareData.h"

@interface RMTChangePassWorldViewController ()
@property (weak, nonatomic) IBOutlet UILabel *notifyLabel;
@property (weak, nonatomic) IBOutlet UITextField *numberTextField;

@property (weak, nonatomic) IBOutlet UIView *oldPassWorldView;
@property (weak, nonatomic) IBOutlet UITextField *oldPassWorldTextField;


@property (weak, nonatomic) IBOutlet UIView *setView;
@property (weak, nonatomic) IBOutlet UITextField *passworldTextField;
@property (strong, nonatomic) NSString *mobile;
@property (strong, nonatomic) NSString *token;
@property (weak, nonatomic) IBOutlet UIView *loginView;

@end

@implementation RMTChangePassWorldViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.navigationController.navigationBar setHidden:YES];
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
- (IBAction)nextClick:(id)sender
{
    _notifyLabel.text = @"";
    _mobile = _numberTextField.text;
    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:_mobile  complete:^(NSError *error,BackOject *obj) {
        if (obj.code == RMTRegisterCodeErr) {
            
            _notifyLabel.text = obj.message;
        } else if (obj.code == RMTRegisterCodeHaveRegist) {
            _oldPassWorldView.hidden = NO;
        } else if (obj.code == RMTRegisterCodeNotRegist){
            
        } else {
            _notifyLabel.text = @"数据异常";
        }
        NSLog(@"back code %d  message %@ ",obj.code,obj.message);
    }];

}

- (IBAction)oldPassworldClick:(id)sender
{
    _notifyLabel.text = @"";
    [[RMTUtilityLogin sharedInstance] requestChangePasswordWithPhoneNumber:_mobile
                                                                  password:_oldPassWorldTextField.text
                                                                     token:@""
                                                                      step:1
                                                                  complete:^(NSError *error, LoginCheckoutVerifyData *data) {
    
        
        if (error) {
            NSLog(@"Login error");
            return ;
        }

        if (data.code == RMTRequestBackCodeSucceed) {

            _notifyLabel.text = @"";
            _setView.hidden = NO;
            _token = data.token;
        } else {
            _notifyLabel.text = data.message;
        }

    }];
}

- (IBAction)changeClick:(id)sender
{
    [[RMTUtilityLogin sharedInstance] requestChangePasswordWithPhoneNumber:_mobile
                                                                  password:_passworldTextField.text
                                                                     token:_token
                                                                      step:2
                                                                  complete:^(NSError *error, LoginCheckoutVerifyData *data) {
        
        
        if (error) {
            NSLog(@"Login error");
            return ;
        }
        
        if (data.code == RMTRequestBackCodeSucceed) {
            
            _notifyLabel.text = @"";
            _loginView.hidden = NO;

        } else {
          
        }
        _notifyLabel.text = data.message;
    }];
}

- (IBAction)loginClick:(id)sender {
    for (UIViewController *controller in self.navigationController.viewControllers) {
        if ([controller isKindOfClass:NSClassFromString(@"RMTLoginEnterViewController")]) {
            [self.navigationController popToViewController:controller animated:YES];
            
            return;
        }
    }
}
- (IBAction)backClick:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

@end
