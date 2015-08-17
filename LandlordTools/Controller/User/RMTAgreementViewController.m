//
//  AgreementViewController.m
//  RemoteControl
//
//  Created by vagrant on 7/1/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "RMTAgreementViewController.h"

@interface RMTAgreementViewController ()

@end

@implementation RMTAgreementViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)backButtonClick:(id)sender
{
    [self.navigationController popViewControllerAnimated:YES];
}

@end
