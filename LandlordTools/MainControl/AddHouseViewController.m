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

@interface AddHouseViewController () <UITableViewDataSource,UITableViewDelegate,AddHouseChangeCellHeightDelegate>
@property (nonatomic, assign) BOOL showData;
@property (nonatomic, strong) NSMutableArray *arr;
@end

@implementation AddHouseViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    UINib* nib1 = [UINib nibWithNibName:@"AddHouseViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib1 forCellReuseIdentifier:@"AddHouseViewCell"];
    
    _arr = [NSMutableArray arrayWithCapacity:0];
    for (int i = 0; i < 10; i ++) {
        [_arr addObject:[NSNumber numberWithBool:NO]];
    }
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return 9;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
//      UITableViewCell *deqCell = [_tableView cellForRowAtIndexPath:indexPath];
//    AddHouseViewCell *cell = (AddHouseViewCell*)deqCell;
    if (![((NSNumber*)[_arr objectAtIndex:indexPath.row]) boolValue]) {
        return 140;
    }
    return 320;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *deqCell = [_tableView dequeueReusableCellWithIdentifier:@"AddHouseViewCell"];
    AddHouseViewCell *cell = (AddHouseViewCell*)deqCell;
    cell.delegate = self;
//    cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
//    cell.selectedBackgroundView.backgroundColor = [UIColor grayColor];
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    [cell changeDataViewFrame];
    [cell setCellData:[((NSNumber*)[_arr objectAtIndex:indexPath.row]) boolValue] andCellRow:(int)indexPath.row];
    
    
    return cell;
}


- (void) changeAddHouseCellHeigt:(BOOL)sender andRow:(int)row
{
    NSLog(@"LOG ");
    [_arr removeAllObjects];
    for (int i = 0; i < 10; i ++) {
        [_arr addObject:[NSNumber numberWithBool:NO]];
    }
    [_arr replaceObjectAtIndex:row withObject:[NSNumber numberWithBool:sender]];
    [_tableView reloadData];
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
//    [tableView deselectRowAtIndexPath:[tableView indexPathForSelectedRow] animated:NO];
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
