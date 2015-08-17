//
//  MainContentControlViewController.m
//  LandlordTools
//
//  Created by yong on 8/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "MainContentControlViewController.h"
#import "RMTLoginViewController.h"
#import "WaterViewController.h"
#import "RentMainViewController.h"
#import "GetAmmeterViewController.h"
#import "AddHouseViewController.h"

@interface MainContentControlViewController ()

@end

@implementation MainContentControlViewController

- (instancetype)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    if (self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil]) {

    }
    return self;
}

- (instancetype) initWithCoder:(NSCoder *)aDecoder
{
    if (self = [super initWithCoder:aDecoder]) {
        
    }
    return  self;
}

- (id)init
{
    if (self= [super init]) {
        
    }
    return self;
}
- (void)viewDidLoad {
    [super viewDidLoad];
 [self.navigationController.navigationBar setHidden:YES];
    NSLog(@"MainContentControlViewControllerviewDidLoad  ");
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
- (IBAction)logicClick:(id)sender
{
    RMTLoginViewController *vc = [[RMTLoginViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)menuClick:(id)sender
{
    [self presentLeftMenuViewController:self];
}

- (IBAction)getWaterClick:(id)sender
{
    WaterViewController *vc = [[WaterViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)getAmmeterClick:(id)sender
{
    GetAmmeterViewController *vc = [[GetAmmeterViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
    
}

- (IBAction)getRentClick:(id)sender
{
    RentMainViewController *vc = [[RentMainViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)addRoomClcik:(id)sender
{
    AddHouseViewController *vc = [[AddHouseViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

@end
