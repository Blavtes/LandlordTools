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

#import <Masonry.h>

@interface AddLastMonthDataControll () <UITableViewDataSource,UITableViewDelegate>
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (nonatomic, strong) NSMutableArray *dataArr;
@end

@implementation AddLastMonthDataControll

- (void)viewDidLoad {
    [super viewDidLoad];
    UINib* nib = [UINib nibWithNibName:@"AddLastMothDataTableViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:@"AddLastMothDataTableViewCell"];
    nib = [UINib nibWithNibName:@"AddLastMothWaterTableViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:@"AddLastMothWaterTableViewCell"];
    
    _dataArr = [NSMutableArray arrayWithCapacity:0];
    [_dataArr addObject:@[@[@"水表：",@"0.0"]]];
    [_dataArr addObject:@[@[@"电表：",@"0.0"]]];
        [_dataArr addObject:@[@[@"房租：",@"0.0"],@[@"网费：",@"0.0"],@[@"其他：",@"0.0"]]];
//        [_dataArr addObject:@[@"网费：",@"0元/月"]];
//        [_dataArr addObject:@[@"其他：",@"0元/月"]];
        [_dataArr addObject:@[@[@"押金：",@"0.0"]]];
    [_dataArr addObject:@[@[@"afafds"]]];
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
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
     if (indexPath.section <= 1) {
         return 55;
     }
    return 40;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSLog(@"section %ld row %ld",indexPath.section,indexPath.row);

    
    if (indexPath.section <= 1) {
        UITableViewCell *editCell = [tableView dequeueReusableCellWithIdentifier:@"AddLastMothWaterTableViewCell"];
        AddLastMothWaterTableViewCell *cell = (AddLastMothWaterTableViewCell*)editCell;
        NSArray *arr = [_dataArr objectAtIndex:indexPath.section];
        NSArray *arr2 = [arr objectAtIndex:indexPath.row];
        
        
        [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1]];
        return cell;
        
    }
    
    UITableViewCell *defalutCell = [tableView dequeueReusableCellWithIdentifier:@"AddLastMothDataTableViewCell"];
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
        return cell;
    }
    NSArray *arr = [_dataArr objectAtIndex:indexPath.section];
       NSArray *arr2 = [arr objectAtIndex:indexPath.row];
   
    
    [cell setComtentData:[arr2 objectAtIndex:0] withField:[arr2 objectAtIndex:1]];
    return cell;
}

- (void)btClick:(id)sender
{
    NSLog(@"btCLick");
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
    [self dismissViewControllerAnimated:YES completion:^{
        
    }];
}


@end
