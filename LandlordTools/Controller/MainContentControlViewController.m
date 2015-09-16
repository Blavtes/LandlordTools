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
#import "ConfigHouseEditCell.h"
#import "AddFloorWaterDataViewControll.h"

@interface MainContentControlViewController () <UITableViewDelegate,UITableViewDataSource,ConfigHouseEditDelegate>
@property (weak, nonatomic) IBOutlet UIImageView *checkOutImageView;
@property (weak, nonatomic) IBOutlet UIButton *waterBt;
@property (weak, nonatomic) IBOutlet UIButton *elericBt;
@property (weak, nonatomic) IBOutlet UIButton *rentBt;
@property (weak, nonatomic) IBOutlet UIView *menuView;
@property (weak, nonatomic) IBOutlet UIButton *loginBt;


@property (weak, nonatomic) IBOutlet UITableView *titleTableView;
@property (weak, nonatomic) IBOutlet UIView *titleTableListView;
@property (weak, nonatomic) IBOutlet UIView *titleView;
@property (weak, nonatomic) IBOutlet UIButton *titleLable;
@property (weak, nonatomic) IBOutlet UITableView *roomTableView;

@property (weak, nonatomic) IBOutlet UIView *addBuildView;
@property (weak, nonatomic) IBOutlet UIButton *sortRentBt;
@property (weak, nonatomic) IBOutlet UILabel *loginLable;

@property (nonatomic, assign) int selectIndex;
@property (nonatomic, assign) int sortRentIndex;
@property (nonatomic, strong) NSMutableArray *waterArr;
@property (nonatomic, strong) NSMutableArray *elericArr;
@property (nonatomic, strong) NSMutableArray *rentArrFloor;
@property (nonatomic, strong) NSMutableArray *rentArrTime;

@property (nonatomic, strong) AddBuildModleData *arrBuildModleData;//所以 楼宇
@property (nonatomic, strong) AddBuildArrayData *currentBuildData; //当前 楼宇
@end



#define kAddRoomCellIdentifier              @"AddRoomEditTableViewCell"
#define KConfigRoomCellIdentifier           @"ConfigHouseEditCell"

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

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        _loginBt.hidden = YES;
        __weak __typeof(self)weakSelf = self;

        [[RMTUtilityLogin sharedInstance] requestGetMyBuildingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                  complete:^(NSError *error, AddBuildModleData *obj) {
                                                                      if (obj.buildings.count >0) {
                                                                          weakSelf.arrBuildModleData = obj;
                                                                          [_titleLable setTitle: ((AddBuildArrayData*)[_arrBuildModleData.buildings firstObject]).buildingName forState:UIControlStateNormal];
                                                                          _titleView.hidden = NO;
//                                                                          _addBuildView.hidden = YES;
                                                                      } else {
                                                                          _addBuildView.hidden = NO;
                                                                          
                                                                          _selectIndex = 3;
                                                                          [weakSelf checkoutImageViewFrame:_rentBt];
                                                                      }
                                                                     

                                                                  }];

        
    } else {
        _titleView.hidden = YES;
        _titleTableListView.hidden = YES;
//        _addBuildView.hidden = NO;
    }
    
    
}

- (void)viewDidLoad {
    [super viewDidLoad];
    _waterArr = [NSMutableArray arrayWithCapacity:0];
    _elericArr = [NSMutableArray arrayWithCapacity:0];
    _rentArrFloor = [NSMutableArray arrayWithCapacity:0];
    _rentArrTime = [NSMutableArray arrayWithCapacity:0];
    _sortRentIndex = RMTSortRentFloor;
    if (_addBuildView.isHidden) {
        _selectIndex = 1;
        [_waterBt setImage:[UIImage imageNamed:@"icon_water_on"] forState:UIControlStateNormal];
        [_waterBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    } else {
        _selectIndex = 3;
        [self checkoutImageViewFrame:_rentBt];
        [_rentBt setImage:[UIImage imageNamed:@"icon_ rent _on"] forState:UIControlStateNormal];
        [_rentBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    }
    [self.navigationController.navigationBar setHidden:YES];
    NSLog(@"MainContentControlViewControllerviewDidLoad  ");
    
    [[RMTUserLogic sharedInstance] requestLoginName:@"13538101601"
                                           password:@"222222"
                                           complete:^(NSError *error, RMTUserData *data) {
                                               
                                               
                                               NSLog(@"login %@",data.loginId);
                                               [[RMTUserShareData sharedInstance] updataUserData:data];
                                               
                                             
                                           }];
    
    UINib *nib = [UINib nibWithNibName:kAddRoomCellIdentifier bundle:[NSBundle mainBundle]];
    [_roomTableView registerNib:nib forCellReuseIdentifier:kAddRoomCellIdentifier];
    
    UINib *nib2 = [UINib nibWithNibName:KConfigRoomCellIdentifier bundle:[NSBundle mainBundle]];
    [_roomTableView registerNib:nib2 forCellReuseIdentifier:KConfigRoomCellIdentifier];

#pragma mark -- test
    
//    for (int i = 1; i < 4; i++) {
//        FloorsByArrObj *floors = [FloorsByArrObj new];
//        NSMutableArray *rooms = [NSMutableArray arrayWithCapacity:0];
//        for (int j = 1; j < 5; j++) {
//            RoomsByArrObj *room = [RoomsByArrObj new];
//            room._id = j;
//            room.number = [NSString stringWithFormat:@"%d0%d",i,j];
//            room.isInit = YES;
//            [rooms addObject:room];
//        }
//        floors.rooms = rooms;
//        floors._id = i;
//        floors.count = i;
//        [_waterArr addObject:floors];
//    }
    [_roomTableView reloadData];
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
    _loginLable.text = [[RMTUtilityLogin sharedInstance] getUserData].mobile;
}

- (void)checkoutImageViewFrame:(id)sender
{
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        _titleTableListView.hidden = YES;
        _titleView.hidden = NO;
    }
    [_waterBt setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [_rentBt setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [_elericBt setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [_waterBt setImage:[UIImage imageNamed:@"icon_water_off"] forState:UIControlStateNormal];
    [_rentBt setImage:[UIImage imageNamed:@"icon_ rent _off"] forState:UIControlStateNormal];
    [_elericBt setImage:[UIImage imageNamed:@"icon_ammeter_off"] forState:UIControlStateNormal];
    [UIView animateWithDuration:0.3f animations:^{
        _checkOutImageView.frame = CGRectMake(((UIButton*)sender).frame.origin.x +2 , _checkOutImageView.frame.origin.y, _checkOutImageView.frame.size.width, _checkOutImageView.frame.size.height);
        
    } completion:^(BOOL finished) {
        
    }];
}


- (IBAction)getWaterClick:(id)sender
{
    _selectIndex = RMTSelectIndexWater;
    [self checkoutImageViewFrame:sender];
    _sortRentBt.hidden = YES;
    [_waterBt setImage:[UIImage imageNamed:@"icon_water_on"] forState:UIControlStateNormal];
    [_waterBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    if (_currentBuildData.buildingName) {
        [[RMTUtilityLogin sharedInstance] requestGetToCheckWaterCostRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                      withBuildingId:_currentBuildData._id
                                                                            complete:^(NSError *error, CheckElectricCostRoomsObj *obj) {
                                                                                if (obj.code == RMTRequestBackCodeSucceed) {
                                                                                    [_waterArr removeAllObjects];
                                                                                    [_waterArr addObjectsFromArray:obj.floors];
                                                                                    [_roomTableView reloadData];
                                                                                }
                                                                                NSLog(@"water obj %@",obj);
        }];
    }

    //    WaterViewController *vc = [[WaterViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)getAmmeterClick:(id)sender
{
    _selectIndex = RMTSelectIndexElect;
    [self checkoutImageViewFrame:sender];
    _sortRentBt.hidden = YES;
    [_elericBt setImage:[UIImage imageNamed:@"icon_ammeter_on"] forState:UIControlStateNormal];
    
    [_elericBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    
    if (_currentBuildData.buildingName) {
        [[RMTUtilityLogin sharedInstance] requestGetToCheckElectricCostRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                         withBuildingId:_currentBuildData._id
                                                                               complete:^(NSError *error, CheckElectricCostRoomsObj *obj) {
                                                                                   NSLog(@"elect obj %@",obj);
                                                                                   if (obj.code == RMTRequestBackCodeSucceed) {
                                                                                       [_elericArr removeAllObjects];
                                                                                       [_elericArr addObjectsFromArray:obj.floors];
                                                                                       [_roomTableView reloadData];
                                                                                   }
        }];
    }
    
    
    //    GetAmmeterViewController *vc = [[GetAmmeterViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
    
}

- (IBAction)getRentClick:(id)sender
{
    
    _selectIndex = RMTSelectIndexRent;
    [self checkoutImageViewFrame:sender];
    _sortRentBt.hidden = NO;
    [_rentBt setImage:[UIImage imageNamed:@"icon_ rent _on"] forState:UIControlStateNormal];
    [_rentBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    if (_currentBuildData.buildingName) {
        [[RMTUtilityLogin sharedInstance] requestGetToPayRentCostRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                   withBuildingId:_currentBuildData._id
                                                                         complete:^(NSError *error, CheckoutToPayRentCostRooms *obj) {
                                                                             NSLog(@"rent obj %@",obj);
                                                                             if (obj.code == RMTRequestBackCodeSucceed) {
                                                                                 [_rentArrTime removeAllObjects];
                                                                                 [_rentArrFloor removeAllObjects];
                                                                                 [_rentArrFloor addObjectsFromArray:obj.roomsByFloor];
                                                                                 [_rentArrTime addObjectsFromArray:obj.roomsByTime];
                                                                                 [_roomTableView reloadData];
                                                                             }
                                                                             
        }];
    }
    //    RentMainViewController *vc = [[RentMainViewController alloc] init];
    //    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)addRoomClcik:(id)sender
{
    AddHouseViewController *vc = [[AddHouseViewController alloc] initWithEdit:YES];
    [self.navigationController pushViewController:vc animated:YES];
}


- (IBAction)managerClick:(id)sender {
      [self checkoutMenuViewFrame:-_menuView.frame.size.width];
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        _titleTableListView.hidden = YES;
        _titleView.hidden = NO;
    }
}

- (IBAction)managerCheckoutClicked:(id)sender {
      [self checkoutMenuViewFrame:-_menuView.frame.size.width];
    AddHouseViewController *vc = [[AddHouseViewController alloc] initWithEdit:NO];
    vc.userCheckoutType = RMTUserRoomTypeManage;
    [self.navigationController pushViewController:vc animated:YES];
}


- (IBAction)goinClick:(id)sender {
    
      [self checkoutMenuViewFrame:-_menuView.frame.size.width];
    AddHouseViewController *vc = [[AddHouseViewController alloc] initWithEdit:NO];
    vc.userCheckoutType = RMTUserRoomTypeLogIn;
    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)logoutClick:(id)sender {
    [self checkoutMenuViewFrame:-_menuView.frame.size.width];
    AddHouseViewController *vc = [[AddHouseViewController alloc] initWithEdit:NO];
    vc.userCheckoutType = RMTUserRoomTypeLogOut;
    [self.navigationController pushViewController:vc animated:YES];
}

- (IBAction)CheckoutBuildsClick:(id)sender {
    
    _titleView.hidden = YES;
    _titleTableListView.hidden = NO;
    [_titleTableView reloadData];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if (tableView == _roomTableView) {
        NSMutableArray *arr = [NSMutableArray arrayWithCapacity:0];
        if (_selectIndex == RMTSelectIndexRent) {
            [arr addObjectsFromArray:_rentArrFloor];
        } else if (_selectIndex == RMTSelectIndexWater) {
           [arr addObjectsFromArray:_waterArr];
        } else if (_selectIndex == RMTSelectIndexElect) {
            [arr addObjectsFromArray:_elericArr];
        }
        
        return  ((NSArray*)((CheckoutRoomsArrObj*)[ arr objectAtIndex:section]).rooms).count / 3
        + (((NSArray*)((CheckoutRoomsArrObj*)[ arr objectAtIndex:section]).rooms).count % 3 == 0 ? 0 :1);
    }
  
    if (_titleTableView == tableView) {
        return _arrBuildModleData.buildings.count;
    }
    return 1;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    if (tableView == _roomTableView) {
        if (_selectIndex == RMTSelectIndexRent) {
            return _rentArrFloor.count;
        } else if (_selectIndex == RMTSelectIndexWater) {
            return _waterArr.count;
        } else if (_selectIndex == RMTSelectIndexElect) {
            return _elericArr.count;
        }
    }
    return 1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    float height = 40.f;
    if (_titleTableView == tableView) {
        height =  40;
    } else if (tableView == _roomTableView ) {
        height =  60.f;
    }
    return height;
}

- (void)getWaterArr
{
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        [[RMTUtilityLogin sharedInstance] requestGetToCheckWaterCostRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                      withBuildingId:_currentBuildData._id
                                                                            complete:^(NSError *error, CheckElectricCostRoomsObj *obj) {
            NSLog(@"getwater %@ ",obj);
        }];
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (tableView == _titleTableView) {
        self.currentBuildData = ((AddBuildArrayData*)[_arrBuildModleData.buildings objectAtIndex:indexPath.row]);
        [_titleLable setTitle: _currentBuildData.buildingName forState:UIControlStateNormal];
        _titleTableListView.hidden = YES;
        _titleView.hidden = NO;
        
    }
    if (tableView == _roomTableView) {
         [_roomTableView deselectRowAtIndexPath:indexPath animated:YES];
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
    cell = [_roomTableView dequeueReusableCellWithIdentifier:KConfigRoomCellIdentifier];
    ConfigHouseEditCell *editCell = (ConfigHouseEditCell*)cell;

    if (_selectIndex == RMTSelectIndexRent) {
        if (_sortRentIndex == RMTSortRentFloor) {
             [editCell setCellContentDataRoomsWithFloors:[_rentArrFloor objectAtIndex:indexPath.section] withRow:indexPath];
        } else {

            [editCell setCellContentDataRoomsWithTime:[_rentArrTime objectAtIndex:indexPath.section] withRow:indexPath];
        }
       
    } else if (_selectIndex == RMTSelectIndexWater) {
          [editCell setCellContentDataRooms:[_waterArr objectAtIndex:indexPath.section] withRow:indexPath];
    } else if (_selectIndex == RMTSelectIndexElect) {
          [editCell setCellContentDataRooms:[_elericArr objectAtIndex:indexPath.section] withRow:indexPath];
    }
   
    editCell.delegate = self;
    NSLog(@"indexpth section %d %d",indexPath.section,indexPath.row);
    return cell;
}

- (void)configRoomDataWithSection:(int)section andIndex:(int)index
{
    NSLog(@"configRoomDataWithSection %d %d",section,index);
    AddFloorWaterDataViewControll *vc = [[AddFloorWaterDataViewControll alloc]
                                         initCheckoutWaterWithCurrentBuild:_currentBuildData
                                         andCheckoutRoomsObj:_waterArr andFloorIndex:section andRoomIndex:index];
     [self.navigationController pushViewController:vc animated:YES];
    switch (_selectIndex) {
        case RMTSelectIndexWater:
        {

        }
            break;
        case RMTSelectIndexElect:
        {
//            [vc checkoutWater];
        }
            break;
        case RMTSelectIndexRent:
        {
            switch (_sortRentIndex) {
                case RMTSortRentTime:
                {
//                    [vc checkoutWater];
                }
                    break;
                case RMTSortRentFloor:
                {
//                    [vc checkoutWater];
                }
                default:
                    break;
            }
        }
        default:
            break;
    }
   
}


- (IBAction)sortRentClick:(id)sender {
    if (_selectIndex == RMTSortRentFloor) {
        _selectIndex = RMTSortRentTime;
        [_sortRentBt setTitle:@"楼层" forState:UIControlStateNormal];
    } else {
        _selectIndex = RMTSortRentFloor;
        [_sortRentBt setTitle:@"时间" forState:UIControlStateNormal];
    }
}

@end
