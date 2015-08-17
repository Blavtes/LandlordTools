//
//  ConfigHouseViewController.m
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "ConfigHouseViewController.h"
#import "ConfigHouseEditCell.h"
#import "ConfigEditHouseData.h"
#import "AddLastMonthDataControll.h"

@interface ConfigHouseViewController () <UITableViewDelegate,UITableViewDataSource,ConfigHouseEditDelegate>

@property (weak, nonatomic) IBOutlet UITableView *tableVIew;
@property (nonatomic, strong) NSMutableArray *dataArr;
@end

@implementation ConfigHouseViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    _dataArr = [NSMutableArray arrayWithCapacity:0];
    for (int i = 1; i< 9; i++) {
        NSMutableArray *arr = [NSMutableArray array];
        for (int j = 1; j < 5; j++) {
            ConfigEditHouseData *data = [ConfigEditHouseData new];
            data.houseNumber = [NSString stringWithFormat:@"%d%d",i*10,j];
            data.isConfig = [[NSNumber numberWithBool:j % 2] boolValue];

            [arr addObject:data];
        }
        [_dataArr addObject:arr];
    }
    NSLog(@"data arr %@",_dataArr);
    
    UINib* nib = [UINib nibWithNibName:@"ConfigHouseEditCell" bundle:[NSBundle mainBundle]];
    [_tableVIew registerNib:nib forCellReuseIdentifier:@"ConfigHouseEditCell"];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return 55;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return ((NSArray*)[_dataArr objectAtIndex:section]).count / 3 + (((NSArray*)[_dataArr objectAtIndex:section]).count % 3) == 0 ? 0 : 1;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return [_dataArr count];
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *detalCell = [tableView dequeueReusableCellWithIdentifier:@"ConfigHouseEditCell"];
    ConfigHouseEditCell *cell = (ConfigHouseEditCell*)detalCell;
    cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
    cell.selectedBackgroundView.backgroundColor = [UIColor clearColor];
   ConfigEditHouseData * data1 =  [((NSArray*)[_dataArr objectAtIndex:indexPath.section])objectAtIndex:indexPath.row];
    ConfigEditHouseData * data2 =  [((NSArray*)[_dataArr objectAtIndex:indexPath.section]) objectAtIndex:indexPath.row+1];
    ConfigEditHouseData * data3 =  [((NSArray*)[_dataArr objectAtIndex:indexPath.section]) objectAtIndex:indexPath.row+2];
    cell.delegate = self;
    [cell setOneData:data1 andTwoData:data2 andThreeData:data3];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *cell = [tableView cellForRowAtIndexPath:indexPath];
    [cell setSelectionStyle:UITableViewCellSelectionStyleNone];
}

- (void)currentHouseEditWith:(NSString *)houseNumber
{
    NSLog(@"number %@",houseNumber);
    AddLastMonthDataControll *vc = [[AddLastMonthDataControll alloc] init];
    [self presentViewController:vc animated:YES completion:^{
        
    }];
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
