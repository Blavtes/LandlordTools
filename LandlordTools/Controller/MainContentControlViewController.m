//
//  MainContentControlViewController.m
//  LandlordTools
//
//  Created by yong on 8/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "MainContentControlViewController.h"
#import "RESideMenu.h"
#import "WaterViewController.h"
#import "RentMainViewController.h"
#import "GetAmmeterViewController.h"
#import "AddHouseViewController.h"
#import "RMTLoginEnterViewController.h"
#import "RMTUserLogic.h"
#import "RMTUserShareData.h"

@interface MainContentControlViewController ()
@property (weak, nonatomic) IBOutlet UIImageView *checkOutImageView;
@property (weak, nonatomic) IBOutlet UIButton *waterBt;
@property (weak, nonatomic) IBOutlet UIButton *elericBt;
@property (weak, nonatomic) IBOutlet UIButton *rentBt;

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
    
    [[RMTUserLogic sharedInstance] requestLoginName:@"13538101601"
                                           password:@"222222"
                                           complete:^(NSError *error, RMTUserData *data) {
                                               
                                               
                                               NSLog(@"login %@",data.loginId);
                                               [[RMTUserShareData sharedInstance] updataUserData:data];
                                           }];
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
    RMTLoginEnterViewController *vc = [[RMTLoginEnterViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)menuClick:(id)sender
{
    [self presentLeftMenuViewController:self];
}

- (void)checkoutImageViewFrame:(id)sender
{
    [_waterBt setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [_rentBt setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [_elericBt setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [_waterBt setImage:[UIImage imageNamed:@"icon_water_off"] forState:UIControlStateNormal];
    [_rentBt setImage:[UIImage imageNamed:@"icon_ rent _off"] forState:UIControlStateNormal];
    [_elericBt setImage:[UIImage imageNamed:@"icon_ammeter_off"] forState:UIControlStateNormal];
    [UIView animateWithDuration:0.3f animations:^{
        _checkOutImageView.frame = CGRectMake(((UIButton*)sender).frame.origin.x, _checkOutImageView.frame.origin.y, _checkOutImageView.frame.size.width, _checkOutImageView.frame.size.height);
        
    } completion:^(BOOL finished) {
        
    }];
}


- (IBAction)getWaterClick:(id)sender
{
    [self checkoutImageViewFrame:sender];
    [_waterBt setImage:[UIImage imageNamed:@"icon_water_on"] forState:UIControlStateNormal];
    [_waterBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    //    WaterViewController *vc = [[WaterViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)getAmmeterClick:(id)sender
{
    [self checkoutImageViewFrame:sender];
    
    [_elericBt setImage:[UIImage imageNamed:@"icon_ammeter_on"] forState:UIControlStateNormal];
    
    [_elericBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    //    GetAmmeterViewController *vc = [[GetAmmeterViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
    
}

- (IBAction)getRentClick:(id)sender
{
    [self checkoutImageViewFrame:sender];
    [_rentBt setImage:[UIImage imageNamed:@"icon_ rent _on"] forState:UIControlStateNormal];
    [_rentBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    //    RentMainViewController *vc = [[RentMainViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)addRoomClcik:(id)sender
{
    AddHouseViewController *vc = [[AddHouseViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

@end
