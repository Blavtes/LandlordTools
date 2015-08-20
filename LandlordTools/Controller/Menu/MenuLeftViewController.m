//
//  MenuLeftViewController.m
//  LandlordTools
//
//  Created by yong on 8/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "MenuLeftViewController.h"
#import "RMTUserShareData.h"
#import "RMTChangePassWorldViewController.h"

@interface MenuLeftViewController ()
@property (weak, nonatomic) IBOutlet UILabel *amountLable;

@end

@implementation MenuLeftViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    NSLog(@"menu viewWillAppear");
    _amountLable.text = [[RMTUserShareData sharedInstance] userData].mobile;
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
- (IBAction)homeImageClick:(id)sender
{
    
}

- (IBAction)homeManageClick:(id)sender
{
    
}

- (IBAction)checkInClick:(id)sender
{
    
}

- (IBAction)checkoutClick:(id)sender
{
    
}

- (IBAction)changePasswordClick:(id)sender
{
    RMTChangePassWorldViewController *vc = [[RMTChangePassWorldViewController alloc] init];
    [self.sideMenuViewController setContentViewController:[[UINavigationController alloc] initWithRootViewController:vc]
                                                 animated:YES];
    [self.sideMenuViewController hideMenuViewController];
  
}

- (IBAction)logoutClick:(id)sender
{
    
}



















@end
