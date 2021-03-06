//
//  AddHouseViewController.m
//  LandlordTools
//
//  Created by yong on 8/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "AddHouseViewController.h"
#import "AddHouseViewCell.h"
#import "UIColor+Hexadecimal.h"
#import "RMTUtilityLogin.h"
#import <Masonry/Masonry.h>
#import "RMTLoginEnterViewController.h"
#import "UIColor+Hexadecimal.h"
#import "MBProgressHUD.h"
#import "MyBuildingsViewCell.h"
#import "AddRoomViewController.h"
#import "UIHUDCustomView.h"


#define WS(weakSelf)  __weak __typeof(&*self)weakSelf = self;
@interface AddHouseViewController () <UITableViewDataSource,UITableViewDelegate,AddHouseChangeCellHeightDelegate>
@property (nonatomic, assign) BOOL showData;
@property (nonatomic, strong) NSMutableArray *buildArr;
@property (weak, nonatomic) IBOutlet UIHUDCustomView *hubView;

@property (weak, nonatomic) IBOutlet UIButton *saveBt;
@property (weak, nonatomic) IBOutlet UIButton *editBt;

@property (nonatomic, assign) BOOL isEdit;

@end

@implementation AddHouseViewController

- (instancetype)initWithEdit:(BOOL)edit
{
    if (self = [super init]) {
        self.isEdit = edit;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
//    _isEdit = YES;
    _editBt.enabled = !_isEdit;
    if (_isEdit) {

        _editBt.hidden = YES;
        _saveBt.hidden = NO;
        _editBt.enabled = NO;
        _saveBt.enabled = YES;
    } else {

        _editBt.hidden = NO;
        _saveBt.hidden = YES;
        _editBt.enabled = YES;
        _saveBt.enabled = NO;
    }
    UINib* nib1 = [UINib nibWithNibName:@"AddHouseViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib1 forCellReuseIdentifier:@"AddHouseViewCell"];
    
    UINib* nib2 = [UINib nibWithNibName:@"MyBuildingsViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib2 forCellReuseIdentifier:@"MyBuildingsViewCell"];
    
    _buildArr = [NSMutableArray arrayWithCapacity:0];
    [_hubView showHUDView];
    __weak __typeof(self)weakSelf = self;
    if (_userAddHouseCheckoutType == RMTUserRoomTypeManage) {
        
    }
    [[RMTUtilityLogin sharedInstance] requestGetMyBuildingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId] complete:^(NSError *error, AddBuildModleData *buildData) {
        NSLog(@"builrd %@",buildData);
        if (buildData.code == RMTRequestBackCodeSucceed || buildData.code == RMTRequestBackCodeFailure) {
            if (buildData.buildings.count == 0 )
            {
                //init
                [weakSelf initBuildArrayData];
            } else {
                [_buildArr addObjectsFromArray:buildData.buildings];
                NSLog(@"bulid %@",buildData);
                [_tableView reloadData];
            }
        } else {
            [weakSelf initBuildArrayData];
        }
        [_hubView hideHUDView];
    }];
    // Do any additional setup after loading the view from its nib.
}

- (void)initBuildArrayData
{
    AddBuildArrayData *data = [[AddBuildArrayData alloc] init];
    //                data._id = 1;
    data.buildingName = @"我的1号楼";
    data.electricPrice = 1;
    data.waterPrice = 6;
    data.payRentDay = 10;
    data.isShowDataList = NO;
    [_buildArr addObject:data];
    [_tableView reloadData];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return 1;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return _buildArr.count + (_isEdit  == YES ? 1 : 0);
}

- (UIView*)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
    UIView *view  = [UIView new];
    view.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
    return view;
}

- (UIView*)tableView:(UITableView *)tableView viewForFooterInSection:(NSInteger)section
{
    UIView *view  = [UIView new];
    view.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
    return view;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
//      UITableViewCell *deqCell = [_tableView cellForRowAtIndexPath:indexPath];
//    AddHouseViewCell *cell = (AddHouseViewCell*)deqCell;
    NSLog(@"");
    if (_isEdit) {
        if (indexPath.section == _buildArr.count) {
            return 80;
        }
        
        if (!((AddBuildArrayData*)[_buildArr objectAtIndex:indexPath.section]).isShowDataList) {
            return 135;
        }
        return 360;
    }
    return 94;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{

    if (_isEdit) {
        if (indexPath.section == _buildArr.count) {
            
           UITableViewCell *cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"AdddefaultCell"];
            UIButton *btn = [UIButton new];
            [btn setTitle:@"+ 添加楼宇" forState:UIControlStateNormal];
            [btn setTitleColor:[UIColor colorWithHex:@"fabe00"] forState:UIControlStateNormal];
            [btn addTarget:self action:@selector(addBuildDta:) forControlEvents:UIControlEventTouchUpInside];
            [btn setBackgroundColor:[UIColor colorWithRed:42.0f/255.0f green:42.0f/255.0f blue:42.0f/255.0f alpha:1]];
            [cell addSubview:btn];
            
            [btn mas_makeConstraints:^(MASConstraintMaker *make) {
                make.top.mas_equalTo(cell.mas_top);
                make.left.mas_equalTo(cell.mas_left);
                make.right.mas_equalTo(cell.mas_right);
                make.bottom.mas_equalTo(cell.mas_bottom);
                
            }];
            
            return cell;
        }
        UITableViewCell *deqCell = [_tableView dequeueReusableCellWithIdentifier:@"AddHouseViewCell"];
        AddHouseViewCell *cell = (AddHouseViewCell*)deqCell;
        cell.delegate = self;
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
        [cell changeDataViewFrame];
        [cell setHideView];
        [cell setCellData:((AddBuildArrayData*)[_buildArr objectAtIndex:indexPath.section]) andCellRow:(int)indexPath.section];
        return cell;
    }
    
        UITableViewCell *deqCell = [_tableView dequeueReusableCellWithIdentifier:@"MyBuildingsViewCell"];
        MyBuildingsViewCell *cell = (MyBuildingsViewCell*)deqCell;

        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor clearColor];
        [cell setCellData:((AddBuildArrayData*)[_buildArr objectAtIndex:indexPath.section]) andCellRow:(int)indexPath.section];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{

    if(!_isEdit) {
        AddBuildArrayData * buildid = [_buildArr objectAtIndex:indexPath.section];
        AddRoomViewController *vc = [[AddRoomViewController alloc] init];
        vc.buildingData = buildid;
        vc.userCheckoutType = _userAddHouseCheckoutType;
        [self.navigationController pushViewController:vc animated:YES];
        
    }
     [_tableView deselectRowAtIndexPath:indexPath animated:YES];
}


- (void) addBuildDta:(id)sender
{
    
    AddBuildArrayData *data = [[AddBuildArrayData alloc] init];
    data._id = 1;
    data.buildingName = @"我的1号楼";
    data.electricPrice = 1;
    data.waterPrice = 6;
    data.payRentDay = 10;
    data.isShowDataList = NO;
    data.tmpId = ((AddBuildArrayData*)[_buildArr lastObject])._id;
    data.oprType = RMTUpdataMyBuildAddType;
    
    NSArray *arr = [NSArray arrayWithObjects:data, nil];
    [_hubView showHUDView];
    __weak __typeof(self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                          whithBuildData:arr
                                                                complete:^(NSError *error, EditBuildingsBackObj *object) {
        if (object.code == RMTRequestBackCodeSucceed || object.code == RMTRequestBackCodeFailure) {
            
            [_buildArr addObject:data];
            [_tableView reloadData];
        }
        NSLog(@"add code %d %@",object.code,object.message);
        [_hubView hideHUDView];
    }];
   
}

- (void)reflashData:(AddBuildArrayData *)data andRow:(int)row
{
    if (row > _buildArr.count) {
        return;
    }

    data.oprType = RMTUpdataMyBuildUpdataType;
    [_hubView showHUDView];
    __weak __typeof(self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId] whithBuildData:[NSArray arrayWithObject:data] complete:^(NSError *error, EditBuildingsBackObj *object) {
        if (object.code == RMTRequestBackCodeSucceed || object.code == RMTRequestBackCodeFailure) {
           [_buildArr replaceObjectAtIndex:row withObject:data];
        }
        NSLog(@"reflashData code %d %@",object.code,object.message);
        [_hubView hideHUDView];
    }];
     
    
}

- (void)deletBuildData:(int)row
{
    if (row < _buildArr.count) {
        AddBuildArrayData *data = [_buildArr objectAtIndex:row];
        data.oprType = RMTUpdataMyBuildDeletedType;
        [_hubView showHUDView];
        __weak __typeof(self)weakSelf = self;
        [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId] whithBuildData:[NSArray arrayWithObject:data] complete:^(NSError *error, EditBuildingsBackObj *object) {
            if (object.code == RMTRequestBackCodeSucceed || object.code == RMTRequestBackCodeFailure) {
                [_buildArr removeObjectAtIndex:row];
                [_tableView reloadData];
            }
            NSLog(@"delet code %d %@",object.code,object.message);
            [_hubView hideHUDView];
        }];
    }
    NSLog(@"delete build index %d",row);
}

- (void) changeAddHouseCellHeigt:(BOOL)sender andRow:(int)row
{
    NSLog(@"LOG ");
    for (int i = 0 ; i < _buildArr.count; i++) {
        AddBuildArrayData *data = [_buildArr objectAtIndex:i];
        data.isShowDataList = NO;
    }
    [_tableView reloadData];
    AddBuildArrayData *data = [_buildArr objectAtIndex:row];
    data.isShowDataList = sender;
    [_buildArr replaceObjectAtIndex:row withObject:data];
    [_tableView reloadData];
}

- (IBAction)backClick:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

- (IBAction)saveClick:(id)sender {

    if (self.isEdit) {
        if (_buildArr.count > 0) {
            [_saveBt setTitle:@"编辑" forState:UIControlStateNormal];
            
            for (AddBuildArrayData *data  in _buildArr) {
                data.oprType = RMTUpdataMyBuildUpdataType;
            }
            //        if ([[RMTUtilityLogin sharedInstance] getLogId]) {
            [_hubView showHUDView];
            __weak __typeof(self)weakSelf = self;
            [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                  whithBuildData:_buildArr
                                                                        complete:^(NSError *error, EditBuildingsBackObj *object) {
                                                                            if (object.code == RMTRequestBackCodeSucceed || object.code == RMTRequestBackCodeFailure) {
                                                                                
                                                                            }
                                                                            NSLog(@"delet code %d %@",object.code,object.message);
                                                                            [_hubView hideHUDView];
                                                                            self.isEdit = NO;
                                                                            [_tableView reloadData];
                                                                            
                                                                        }];
        }
  
//        } else {
//            RMTLoginEnterViewController *vc = [[RMTLoginEnterViewController alloc] init];
//            [self.navigationController pushViewController:vc animated:YES];
//        }
    } else {
        [_saveBt setTitle:@"保存" forState:UIControlStateNormal];
        self.isEdit = YES;

        [_tableView reloadData];
    }
 
   
}


- (IBAction)editClick:(id)sender
{
    _isEdit = YES;
    _editBt.hidden = YES;
    _saveBt.hidden = NO;
    _editBt.enabled = NO;
    _saveBt.enabled = YES;
    [_tableView reloadData];
}




/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
