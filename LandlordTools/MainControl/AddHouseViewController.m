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
#import "RMTLoginViewController.h"
#import "MBProgressHUD.h"

#define WS(weakSelf)  __weak __typeof(&*self)weakSelf = self;
@interface AddHouseViewController () <UITableViewDataSource,UITableViewDelegate,AddHouseChangeCellHeightDelegate>
@property (nonatomic, assign) BOOL showData;
@property (nonatomic, strong) NSMutableArray *buildArr;
@property (weak, nonatomic) IBOutlet UIView *hubView;
@end

@implementation AddHouseViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    UINib* nib1 = [UINib nibWithNibName:@"AddHouseViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib1 forCellReuseIdentifier:@"AddHouseViewCell"];
    
    _buildArr = [NSMutableArray arrayWithCapacity:0];
    [self showHUDView];
    __weak __typeof(self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestGetMyBuildingsWithLogicId:@"F30645C539BC8B8E5A8293F1A2C7E767" complete:^(NSError *error, AddBuildModleData *buildData) {
        NSLog(@"builrd %@",buildData);
        if (buildData.code == RMTRequestBackCodeSucceed) {
            if (buildData.buildings.count == 0 )
            {
                //init
                AddBuildArrayData *data = [[AddBuildArrayData alloc] init];
                data._id = 1;
                data.buildingName = @"我的1号楼";
                data.electricPrice = 1;
                data.waterPrice = 6;
                data.payRentDay = 10;
                data.isShowDataList = NO;
                [_buildArr addObject:data];
                [_tableView reloadData];
            } else {
                [_buildArr addObjectsFromArray:buildData.buildings];
                [_tableView reloadData];
            }
        }
        [weakSelf hideHUDView];
    }];
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return _buildArr.count + 1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
//      UITableViewCell *deqCell = [_tableView cellForRowAtIndexPath:indexPath];
//    AddHouseViewCell *cell = (AddHouseViewCell*)deqCell;
    if (indexPath.row == _buildArr.count) {
        return 40;
    }
    
    if (!((AddBuildArrayData*)[_buildArr objectAtIndex:indexPath.row]).isShowDataList) {
        return 100;
    }
    return 360;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.row == _buildArr.count) {

        UITableViewCell *cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"AdddefaultCell"];
        UIButton *btn = [UIButton new];
        [btn setTitle:@"add" forState:UIControlStateNormal];
        [btn setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
        [btn addTarget:self action:@selector(addBuildDta:) forControlEvents:UIControlEventTouchUpInside];
        [btn setBackgroundColor:[UIColor yellowColor]];
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
//    cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
//    cell.selectedBackgroundView.backgroundColor = [UIColor grayColor];
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    [cell changeDataViewFrame];
    [cell setHideView];
    [cell setCellData:((AddBuildArrayData*)[_buildArr objectAtIndex:indexPath.row]) andCellRow:(int)indexPath.row];
    
    
    return cell;
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
    data.oprType = RMTUpdataMyBuildAddType;
    
    NSArray *arr = [NSArray arrayWithObjects:data, nil];
    [self showHUDView];
    __weak __typeof(self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId] whithBuildData:arr complete:^(NSError *error, BackOject *object) {
        if (object.code == RMTRequestBackCodeSucceed) {
            [_buildArr addObject:data];
            [_tableView reloadData];
        }
        NSLog(@"add code %d %@",object.code,object.message);
        [weakSelf hideHUDView];
    }];
   
}

- (void)reflashData:(AddBuildArrayData *)data andRow:(int)row
{
    if (row > _buildArr.count) {
        return;
    }

    data.oprType = RMTUpdataMyBuildUpdataType;
    [self showHUDView];
    __weak __typeof(self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId] whithBuildData:[NSArray arrayWithObject:data] complete:^(NSError *error, BackOject *object) {
        if (object.code == RMTRequestBackCodeSucceed) {
           [_buildArr replaceObjectAtIndex:row withObject:data];
        }
        NSLog(@"reflashData code %d %@",object.code,object.message);
        [weakSelf hideHUDView];
    }];
     
    
}

- (void)deletBuildData:(int)row
{
    if (row < _buildArr.count) {
        AddBuildArrayData *data = [_buildArr objectAtIndex:row];
        data.oprType = RMTUpdataMyBuildDeletedType;
        [self showHUDView];
        __weak __typeof(self)weakSelf = self;
        [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId] whithBuildData:[NSArray arrayWithObject:data] complete:^(NSError *error, BackOject *object) {
            if (object.code == RMTRequestBackCodeSucceed) {
                [_buildArr removeObjectAtIndex:row];
                [_tableView reloadData];
            }
            NSLog(@"delet code %d %@",object.code,object.message);
            [weakSelf hideHUDView];
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

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
//    [tableView deselectRowAtIndexPath:[tableView indexPathForSelectedRow] animated:NO];
}

- (IBAction)saveClick:(id)sender {
    for (AddBuildArrayData *data  in _buildArr) {
        data.oprType = RMTUpdataMyBuildUpdataType;
    }
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        [self showHUDView];
        __weak __typeof(self)weakSelf = self;
        [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                              whithBuildData:_buildArr
                                                                    complete:^(NSError *error, BackOject *object) {
                                                                        if (object.code == RMTRequestBackCodeSucceed) {
                                                                            
                                                                        }
                                                                        NSLog(@"delet code %d %@",object.code,object.message);
                                                                        [weakSelf hideHUDView];
                                                                    }];
    } else {
        RMTLoginViewController *vc = [[RMTLoginViewController alloc] init];
        [self.navigationController pushViewController:vc animated:YES];
    }
   
}


- (void)showHUDView
{
    _hubView.hidden = NO;
    [MBProgressHUD showHUDAddedTo:_hubView animated:YES];
}

- (void)hideHUDView
{
    _hubView.hidden = YES;
    [MBProgressHUD hideHUDForView:_hubView animated:YES];
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
