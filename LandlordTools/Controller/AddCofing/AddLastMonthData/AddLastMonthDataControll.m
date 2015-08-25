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

@interface AddLastMonthDataControll () <UITableViewDataSource,UITableViewDelegate,SelectRenyPayDayDelegate>
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
@end

#define kLastMothDataTableViewCellIdentifier         @"AddLastMothDataTableViewCell"
#define kLastMothWaterTableViewCellIdentifier        @"AddLastMothWaterTableViewCell"
#define kLastTodayDataTableViewCellIdentifier        @"AddLastTodayDataTableViewCell"

@implementation AddLastMonthDataControll

- (void)viewDidLoad {
    [super viewDidLoad];
    UINib* nib = [UINib nibWithNibName:kLastMothDataTableViewCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:kLastMothDataTableViewCellIdentifier];
    nib = [UINib nibWithNibName:kLastMothWaterTableViewCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:kLastMothWaterTableViewCellIdentifier];
    nib = [UINib nibWithNibName:kLastTodayDataTableViewCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:kLastTodayDataTableViewCellIdentifier];

    _dataArr = [NSMutableArray arrayWithCapacity:0];
    [self reloadArrayData];
    // Do any additional setup after loading the view from its nib.
    
    _payRentStatusBt.hidden     = _isConfigMode;
    _messageImageView.hidden    = _isConfigMode;
    _lastMothBt.hidden          = _isConfigMode;
    _nextMothBt.hidden          = _isConfigMode;
    _notiLabel.hidden           = !_isConfigMode;
    
}

- (void)reloadArrayData
{
    [_dataArr removeAllObjects];
    [_dataArr addObject:@[@[@"水表：",@"0.0"]]];
    [_dataArr addObject:@[@[@"电表：",@"0.0"]]];
    if (!_isSelectDay) {
        
        [_dataArr addObject:@[@[@"房租：",@"0.0"],@[@"网费：",@"0.0"],@[@"其他：",@"0.0"]]];
        //        [_dataArr addObject:@[@"网费：",@"0元/月"]];
        //        [_dataArr addObject:@[@"其他：",@"0元/月"]];
        [_dataArr addObject:@[@[@"押金：",@"0.0"]]];
    }
    
    [_dataArr addObject:@[@[@"afafds"]]];
    [_tableView reloadData];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (UIView*)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
    UIView *view = [UIView new];
    [view setFrame:CGRectMake(0, 0, self.view.frame.size.width, 40)];
    [view setBackgroundColor:[UIColor colorWithHex:kBackGroundColorStr]];
    return view;
}

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
        return 180;
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
        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
//        [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1]];
        return cell;
    }
    if (indexPath.section <= 1) {
        UITableViewCell *editCell = [tableView dequeueReusableCellWithIdentifier:kLastMothWaterTableViewCellIdentifier];
        AddLastMothWaterTableViewCell *cell = (AddLastMothWaterTableViewCell*)editCell;
        NSArray *arr = [_dataArr objectAtIndex:indexPath.section];
        NSArray *arr2 = [arr objectAtIndex:indexPath.row];
        
        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
        [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1]];
        return cell;
        
    }
    
    UITableViewCell *defalutCell = [tableView dequeueReusableCellWithIdentifier:kLastMothDataTableViewCellIdentifier];
    AddLastMothDataTableViewCell *cell = (AddLastMothDataTableViewCell*)defalutCell;
    if (indexPath.section == [_dataArr count] - 1) {
        UITableViewCell *cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:@"addsell"];
        UILabel *label = [UILabel new];
        label.text = @"每月10号交房租";
        
        [cell addSubview:label];
        
        UIButton *bt = [UIButton new];
        [bt setTitle:@"^^" forState:UIControlStateNormal];
        [bt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
        [bt addTarget:self action:@selector(btClick:) forControlEvents:UIControlEventTouchUpInside];
        [cell addSubview:bt];
        
        [label mas_makeConstraints:^(MASConstraintMaker *make) {
            make.centerX.equalTo(cell.mas_centerX).with.multipliedBy(0.5);
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
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
    
    [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1]];
    return cell;
}

- (void)btClick:(id)sender
{
    NSLog(@"btCLick");
    _isSelectDay = YES;
    [self reloadArrayData];
 
}

- (void)postSelectRenyPayDay:(NSString *)day
{
    NSLog(@"postSelectRenyPayDay %@",day);
    _isSelectDay = NO;
    [self reloadArrayData];
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
