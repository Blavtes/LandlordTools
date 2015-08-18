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

#define WS(weakSelf)  __weak __typeof(&*self)weakSelf = self;
@interface AddHouseViewController () <UITableViewDataSource,UITableViewDelegate,AddHouseChangeCellHeightDelegate>
@property (nonatomic, assign) BOOL showData;
@property (nonatomic, strong) NSMutableArray *buildArr;
@end

@implementation AddHouseViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    UINib* nib1 = [UINib nibWithNibName:@"AddHouseViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib1 forCellReuseIdentifier:@"AddHouseViewCell"];
    
    _buildArr = [NSMutableArray arrayWithCapacity:0];
    
    [[RMTUtilityLogin sharedInstance] requestGetMyBuildingsWithLogicId:@"F30645C539BC8B8E5A8293F1A2C7E767" complete:^(NSError *error, AddBuildModleData *buildData) {
        NSLog(@"builrd %@",buildData);
        if (buildData.code == 1) {
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
                
            }
        }
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
    
    UpdateBuildData   *updata = [[UpdateBuildData alloc] init];
    updata.id = data._id;
    updata.buildingName = data.buildingName;
    updata.waterPrice = data.waterPrice;
    updata.electricPrice = data.waterPrice;
    updata.oprType = data.oprType;
    updata.payRentDay = data.payRentDay;
    
    NSString *str = [updata toJSONString];
    NSArray *arr = [NSArray arrayWithObjects:str,str, nil];
    [[RMTUtilityLogin sharedInstance] requestUpdateMyBuilingsWithLogicId:[[RMTUtilityLogin sharedInstance] getLogId] whithBuildData:arr complete:^(NSError *error, BackOject *object) {
        if (object.code == RMTRequestBackCodeSucceed) {
            [_buildArr addObject:data];
            [_tableView reloadData];
        }
        NSLog(@"add code %d %@",object.code,object.message);
    }];
   
}

- (void)reflashData:(AddBuildArrayData *)data adnRow:(int)row
{
    if (row > _buildArr.count) {
        return;
    }
    [_buildArr replaceObjectAtIndex:row withObject:data];
}

- (void)deletBuildData:(int)row
{
    if (row < _buildArr.count) {
        [_buildArr removeObjectAtIndex:row];
        [_tableView reloadData];
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
