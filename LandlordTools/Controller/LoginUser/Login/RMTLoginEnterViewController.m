//
//  RMTLoginEnterViewController.m
//  LandlordTools
//
//  Created by yong on 19/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "RMTLoginEnterViewController.h"
#import "RMTLoginInputPassWorldViewController.h"
#import "RMTRegistersViewController.h"
#import "RMTUtilityLogin.h"

@interface RMTLoginEnterViewController () <UITextFieldDelegate>
@property (weak, nonatomic) IBOutlet UILabel *notifyLabel;
@property (weak, nonatomic) IBOutlet UITextField *inputNumberTextField;
@property (weak, nonatomic) IBOutlet UIButton *nextBt;

@end

@implementation RMTLoginEnterViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    _notifyLabel.text = @"";
    _inputNumberTextField.delegate = self;
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
- (IBAction)backClick:(id)sender {
    NSString *classStr = @"MainContentControlViewController";
    if ([[RMTUtilityLogin sharedInstance] getIsTempData]) {
        classStr = @"AddRoomViewController";
    }
    for (UIViewController *controller in self.navigationController.viewControllers) {
        if ([controller isKindOfClass:NSClassFromString(classStr)]) {
            [self.navigationController popToViewController:controller animated:NO];
            
            return;
        }
    }
    [self.navigationController popViewControllerAnimated:NO];
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    _notifyLabel.text = @"";
}


- (IBAction)nextClick:(id)sender {
    _notifyLabel.text = @"";
    if ([_inputNumberTextField.text isEqualToString:@""]) {
        _notifyLabel.text = @"手机号码不能为空";
        return;
    }
    NSString *mobile = _inputNumberTextField.text;
    __weak __typeof(self)weakSelf = self;

    [[RMTUtilityLogin sharedInstance] requestIsRegisterUserWith:mobile  complete:^(NSError *error,BackOject *obj) {
        if (obj.code == RMTRegisterCodeErr) {

            _notifyLabel.text = obj.message;
        } else if (obj.code == RMTRegisterCodeHaveRegist) {
            RMTLoginInputPassWorldViewController *vc = [[RMTLoginInputPassWorldViewController alloc] init];
            vc.mobile = mobile;
            [weakSelf.navigationController pushViewController:vc animated:NO];
        } else if (obj.code == RMTRegisterCodeNotRegist){
            RMTRegistersViewController *vc = [[RMTRegistersViewController alloc] init];
            vc.mobile = mobile;
            [weakSelf.navigationController pushViewController:vc animated:NO];
        } else {
            _notifyLabel.text = @"数据异常";
        }
        NSLog(@"back code %d  message %@ ",obj.code,obj.message);
    }];
}

@end
