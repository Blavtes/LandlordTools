//
//  AddLastMonthDataControll.m
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "AddLastMonthDataControll.h"
#import "AddLastMothDataTableViewCell.h"
#import "AddLastMothWaterTableViewCell.h"
#import "AddLastTodayDataTableViewCell.h"

#import "UIColor+Hexadecimal.h"
#import "RMTUtilityLogin.h"
#import <Masonry.h>

@interface AddLastMonthDataControll () <UITableViewDataSource,UITableViewDelegate,SelectRenyPayDayDelegate,AddLastMonthDataConfigDelegate>
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *notiLabel;
@property (weak, nonatomic) IBOutlet UIButton *payRentStatusBt;

@property (weak, nonatomic) IBOutlet UILabel *everyMothLabel;
@property (weak, nonatomic) IBOutlet UIImageView *messageImageView;
@property (weak, nonatomic) IBOutlet UIButton *lastMothBt;
@property (weak, nonatomic) IBOutlet UIButton *nextMothBt;

@property (nonatomic, assign) BOOL isSelectDay; // 选择日期


@property (nonatomic, strong) NSMutableArray *dataArr;

@property (nonatomic, strong) RoomByIdObj *roomConfigData;
@end

#define kLastMothDataTableViewCellIdentifier         @"AddLastMothDataTableViewCell"
#define kLastMothWaterTableViewCellIdentifier        @"AddLastMothWaterTableViewCell"
#define kLastTodayDataTableViewCellIdentifier        @"AddLastTodayDataTableViewCell"

@implementation AddLastMonthDataControll

- (void)viewDidLoad {
    [super viewDidLoad];
    _titleLabel.text = _roomDataObj.number;
    _everyMothLabel.text = [NSString stringWithFormat:@"8月%d号",_buildingData.payRentDay];
    _notiLabel.text = @"请添加上个月的数据";
    UINib* nib = [UINib nibWithNibName:kLastMothDataTableViewCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:kLastMothDataTableViewCellIdentifier];
    nib = [UINib nibWithNibName:kLastMothWaterTableViewCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:kLastMothWaterTableViewCellIdentifier];
    nib = [UINib nibWithNibName:kLastTodayDataTableViewCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:kLastTodayDataTableViewCellIdentifier];

    _dataArr = [NSMutableArray arrayWithCapacity:0];
    
    // Do any additional setup after loading the view from its nib.
    [[RMTUtilityLogin sharedInstance] requestGetRoomByRoomId:_roomDataObj._id
                                                 withLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                    complete:^(NSError *error, RoomByIdObj *obj) {
                                                        _roomConfigData = obj;
                                                        [self reloadArrayData];
    }];
    _payRentStatusBt.hidden     = _isConfigMode;
    _messageImageView.hidden    = _isConfigMode;
    _lastMothBt.hidden          = _isConfigMode;
    _nextMothBt.hidden          = _isConfigMode;
    _notiLabel.hidden           = !_isConfigMode;
    
}

- (void)reloadArrayData
{
    [_dataArr removeAllObjects];

    [_dataArr addObject:@[@[@"水表：",@(_roomConfigData.room.waterCount)]]];
    [_dataArr addObject:@[@[@"电表：",@(_roomConfigData.room.electricCount)]]];
    if (!_isSelectDay) {
        
        [_dataArr addObject:@[@[@"房租：",@(_roomConfigData.room.rentCost)],@[@"网费：",@(_roomConfigData.room.broadbandCost)],@[@"其他：",@(  _roomConfigData.room.othersCost)]]];
        //        [_dataArr addObject:@[@"网费：",@"0元/月"]];
        //        [_dataArr addObject:@[@"其他：",@"0元/月"]];
        [_dataArr addObject:@[@[@"押金：",@( _roomConfigData.room.deposit)]]];
    }
    
    [_dataArr addObject:@[@[@"payRentDay",@( _roomConfigData.room.payRentDay)]]];
    [_tableView reloadData];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

//- (UIView*)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
//{
//    UIView *view = [UIView new];
//    [view setFrame:CGRectMake(0, 0, self.view.frame.size.width, 40)];
//    [view setBackgroundColor:[UIColor colorWithHex:kBackGroundColorStr]];
//    return view;
//}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
  
    return [_dataArr count];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return ((NSArray*)[_dataArr objectAtIndex:section]).count;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (_isSelectDay && indexPath.section == 1) {
        return 360;
    }
     if (indexPath.section <= 1) {
         return 75;
     }
    return 45;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSLog(@"section %ld row %ld",indexPath.section,indexPath.row);

    if (_isSelectDay && indexPath.section == 1 ) {
        UITableViewCell *editCell = [tableView dequeueReusableCellWithIdentifier:kLastTodayDataTableViewCellIdentifier];
        AddLastTodayDataTableViewCell *cell = (AddLastTodayDataTableViewCell*)editCell;
//        NSArray *arr = [_dataArr objectAtIndex:indexPath.section];
//        NSArray *arr2 = [arr objectAtIndex:indexPath.row];
        cell.delegate = self;
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
//        [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1]];
        return cell;
    }
    if (indexPath.section <= 1) {
        UITableViewCell *editCell = [tableView dequeueReusableCellWithIdentifier:kLastMothWaterTableViewCellIdentifier];
        AddLastMothWaterTableViewCell *cell = (AddLastMothWaterTableViewCell*)editCell;
        cell.delegate = self;
        NSArray *arr = [_dataArr objectAtIndex:indexPath.section];
        NSArray *arr2 = [arr objectAtIndex:indexPath.row];
        
        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
        [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1] withPath:indexPath];
        return cell;
        
    }
    
    UITableViewCell *defalutCell = [tableView dequeueReusableCellWithIdentifier:kLastMothDataTableViewCellIdentifier];
    AddLastMothDataTableViewCell *cell = (AddLastMothDataTableViewCell*)defalutCell;
    if (indexPath.section == [_dataArr count] - 1) {
        UITableViewCell *cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:@"payRentDay"];
        cell.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
        UIView *backview = [UIView new];
        backview.backgroundColor = [UIColor colorWithHex:kBlackColorStr];
        [cell addSubview:backview];
        
        UILabel *label = [UILabel new];
        NSString *dayStr = [[[_dataArr lastObject] objectAtIndex:0] objectAtIndex:1];
        label.text = [NSString stringWithFormat:@"%@",[dayStr intValue] == 0 ? @"空房" :[NSString stringWithFormat:@"每月%@号交租",dayStr]];
        label.textColor = [UIColor colorWithHex:kTitleColorStr];
        label.textAlignment = NSTextAlignmentRight;
        [cell addSubview:label];
        
        UIButton *bt = [UIButton new];
        [bt setImage:[UIImage imageNamed:@"bt_up"] forState:UIControlStateNormal];
        [bt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
        [bt addTarget:self action:@selector(btClick:) forControlEvents:UIControlEventTouchUpInside];
        [cell addSubview:bt];
        
        
        [backview mas_makeConstraints:^(MASConstraintMaker *make) {
            make.top.mas_equalTo(cell.mas_top);
            make.bottom.mas_equalTo(cell.mas_bottom);
            make.left.equalTo(cell.mas_left).with.offset(20);
            make.right.equalTo(cell.mas_right).with.offset(-20);
        }];
        
        [label mas_makeConstraints:^(MASConstraintMaker *make) {
            make.trailing.equalTo(cell.mas_centerX).with.multipliedBy(1);
            make.centerY.equalTo(cell.mas_centerY);
        }];
        [bt mas_makeConstraints:^(MASConstraintMaker *make) {
            make.centerX.equalTo(cell.mas_centerX).with.multipliedBy(1.5);
            make.centerY.equalTo(cell.mas_centerY);
        }];
        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
        return cell;
    }
    NSArray *arr = [_dataArr objectAtIndex:indexPath.section];
       NSArray *arr2 = [arr objectAtIndex:indexPath.row];
    cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:K35ColorStr];
    cell.delegate = self;
    [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1] withPath:indexPath];
    return cell;
}

- (void)btClick:(id)sender
{
    NSLog(@"btCLick");
    _isSelectDay = YES;
    [self reloadArrayData];
 
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section == _dataArr.count -1) {
        _isSelectDay = YES;
        [self reloadArrayData];
    }
}

- (void)postSelectRenyPayDay:(NSString *)day
{
    _isSelectDay = NO;
    _roomConfigData.room.payRentDay = [day intValue];
    [self reloadArrayData];
     [self.tableView setContentOffset:CGPointMake(0, self.tableView.contentSize.height -self.tableView.bounds.size.height) animated:NO];
    NSLog(@"postSelectRenyPayDay %@",_buildingData);

}

- (void)postCurrentData:(NSString *)data withPath:(NSIndexPath *)path
{
    NSLog(@"data %@ path %ld %ld",data,path.section,path.row);
    if (path.section == 0) {
        _roomConfigData.room.waterCount = [data floatValue];
    } else if (path.section == 1) {
        _roomConfigData.room.electricCount = [data floatValue];
    } else if (path.section == 2 && path.row == 0) {
        _roomConfigData.room.rentCost = [data floatValue];

    } else if (path.section == 2 && path.row == 1) {
        _roomConfigData.room.broadbandCost = [data floatValue];
        
    } else if (path.section == 2 && path.row == 2) {
        _roomConfigData.room.othersCost = [data floatValue];
        
    } else if (path.section == 3) {
        _roomConfigData.room.deposit = [data floatValue];
        
    }
    
    NSLog(@"mode %@",_roomConfigData.room);
        
}

- (IBAction)saveClick:(id)sender
{
    if (_roomConfigData.room.rentCost == 0 || _roomConfigData.room.deposit == 0) {
        _notiLabel.text = @"房租、押金必填哦~";
        
    } else if (_roomConfigData.room.payRentDay == -1) {
        _notiLabel.text = @"请选择交租日期";
    } else {
        [[RMTUtilityLogin sharedInstance] requestEditRoomWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withRoom:_roomConfigData.room complete:^(NSError *error, BackOject *obj) {
            
        }];
    }
    NSLog(@"saveClick %@",_buildingData);
}


- (IBAction)lastMothClick:(id)sender
{
    NSLog(@"last");
}

- (IBAction)nextMothClick:(id)sender
{
    NSLog(@"next");
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
    [self.navigationController popViewControllerAnimated:YES];
}


@end
