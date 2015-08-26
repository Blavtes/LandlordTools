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
#import "RMTUtilityLogin.h"
#import <Masonry.h>
#import "UIColor+Hexadecimal.h"

@interface MainContentControlViewController () <UITableViewDelegate,UITableViewDataSource>
@property (weak, nonatomic) IBOutlet UIImageView *checkOutImageView;
@property (weak, nonatomic) IBOutlet UIButton *waterBt;
@property (weak, nonatomic) IBOutlet UIButton *elericBt;
@property (weak, nonatomic) IBOutlet UIButton *rentBt;
@property (weak, nonatomic) IBOutlet UIView *menuView;
@property (weak, nonatomic) IBOutlet UIButton *loginBt;


@property (weak, nonatomic) IBOutlet UITableView *titleTableView;
@property (weak, nonatomic) IBOutlet UIView *titleTableListView;
@property (weak, nonatomic) IBOutlet UIView *titleView;
@property (weak, nonatomic) IBOutlet UILabel *titleLable;


@property (nonatomic, assign) int selectIndex;

@property (nonatomic, strong) NSMutableArray *waterArr;
@property (nonatomic, strong) NSMutableArray *elericArr;
@property (nonatomic, strong) NSMutableArray *rentArr;

@property (nonatomic, strong) AddBuildModleData *arrBuildModleData;//所以 楼宇
@property (nonatomic, strong) AddBuildArrayData *currentBuildData; //当前 楼宇
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

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        _loginBt.hidden = YES;
        [[RMTUtilityLogin sharedInstance] requestGetMyBuildingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                  complete:^(NSError *error, AddBuildModleData *obj) {
                                                                      if (obj.buildings.count >0) {
                                                                          _arrBuildModleData = obj;
                                                                          _titleLable.text = ((AddBuildArrayData*)[_arrBuildModleData.buildings firstObject]).buildingName;
                                                                          _titleView.hidden = NO;

                                                                      }
                                                                     
                                                                  }];
    } else {
        _titleView.hidden = YES;
        _titleTableListView.hidden = YES;
    }
    
    
}

- (void)viewDidLoad {
    [super viewDidLoad];
    _selectIndex = 1;
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

- (void)checkoutMenuViewFrame:(float)x
{
    [UIView animateWithDuration:0.3f animations:^{
        _menuView.frame = CGRectMake(x, _menuView.frame.origin.y, _menuView.frame.size.width, _menuView.frame.size.height);
        if (x == 0) {
            _menuView.alpha = 1;
        } else {
            _menuView.alpha = 0;
        }
    } completion:^(BOOL finished) {
        
    }];
}

- (IBAction)menuClick:(id)sender
{
//    [self presentLeftMenuViewController:self];
    
    [self checkoutMenuViewFrame:0];
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
    _selectIndex = 1;
    [self checkoutImageViewFrame:sender];
    [_waterBt setImage:[UIImage imageNamed:@"icon_water_on"] forState:UIControlStateNormal];
    [_waterBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    if (_currentBuildData.buildingName) {
        [[RMTUtilityLogin sharedInstance] requestGetToCheckWaterCostRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildingId:_currentBuildData._id complete:^(NSError *error, CheckoutRoomsArrObj *obj) {
            
        }];
    }
    //    WaterViewController *vc = [[WaterViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)getAmmeterClick:(id)sender
{
    _selectIndex = 2;
    [self checkoutImageViewFrame:sender];
    
    [_elericBt setImage:[UIImage imageNamed:@"icon_ammeter_on"] forState:UIControlStateNormal];
    
    [_elericBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    
    if (_currentBuildData.buildingName) {
        [[RMTUtilityLogin sharedInstance] requestGetToCheckElectricCostRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildingId:_currentBuildData._id complete:^(NSError *error, CheckoutRoomsArrObj *obj) {
            
        }];
    }
    //    GetAmmeterViewController *vc = [[GetAmmeterViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
    
}

- (IBAction)getRentClick:(id)sender
{
    _selectIndex = 3;
    [self checkoutImageViewFrame:sender];
    [_rentBt setImage:[UIImage imageNamed:@"icon_ rent _on"] forState:UIControlStateNormal];
    [_rentBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    if (_currentBuildData.buildingName) {
        [[RMTUtilityLogin sharedInstance] requestGetToPayRentCostRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildingId:_currentBuildData._id complete:^(NSError *error, CheckoutRoomsArrObj *obj) {
            
        }];
    }
    //    RentMainViewController *vc = [[RentMainViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)addRoomClcik:(id)sender
{
    AddHouseViewController *vc = [[AddHouseViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}


- (IBAction)managerClick:(id)sender {
      [self checkoutMenuViewFrame:-_menuView.frame.size.width];
}

- (IBAction)managerClicked:(id)sender {
      [self checkoutMenuViewFrame:-_menuView.frame.size.width];
}


- (IBAction)goinClick:(id)sender {
      [self checkoutMenuViewFrame:-_menuView.frame.size.width];
}

- (IBAction)CheckoutBuildsClick:(id)sender {
    
    _titleView.hidden = YES;
    _titleTableListView.hidden = NO;
    [_titleTableView reloadData];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if (_titleTableView == tableView) {
        return _arrBuildModleData.buildings.count;
    }
    return 1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (_titleTableView == tableView) {
        return 40.0f;
    }
    return 40;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (tableView == _titleTableView) {
        _currentBuildData = ((AddBuildArrayData*)[_arrBuildModleData.buildings objectAtIndex:indexPath.row]);
        _titleLable.text = _currentBuildData.buildingName;
        _titleTableListView.hidden = YES;
        _titleView.hidden = NO;
    }
}


- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
      UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"buildesIdentifier"];
    if (tableView == _titleTableView) {
      cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"buildesIdentifier"];
        
        UIButton *btn = [UIButton new];
        [btn setImage:[UIImage imageNamed:@"bt_right"] forState:UIControlStateNormal];
        [cell addSubview:btn];
        
        UILabel * title = [UILabel new];
        title.textColor = [UIColor whiteColor];
        title.backgroundColor = [UIColor clearColor];
        title.text = ((AddBuildArrayData*)[_arrBuildModleData.buildings objectAtIndex:indexPath.row]).buildingName;
        [cell.contentView addSubview:title];
        cell.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
        [cell setSeparatorInset:UIEdgeInsetsMake(0, 0, 0, 0)];
        [btn mas_makeConstraints:^(MASConstraintMaker *make) {
            make.centerY.mas_equalTo(cell.mas_centerY);
            make.right.mas_equalTo(cell.mas_right).with.offset(-20);
            
        }];
        
        [title mas_makeConstraints:^(MASConstraintMaker *make) {
            make.centerY.mas_equalTo(cell.mas_centerY);
            make.right.mas_equalTo(cell.mas_right).with.offset(-40);

        }];
        return cell;
    }
    return cell;
}

@end
