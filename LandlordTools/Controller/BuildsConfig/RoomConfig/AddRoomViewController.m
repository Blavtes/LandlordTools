//
//  AddRoomViewController.m
//  LandlordTools
//
//  Created by yong on 20/8/15.
//  Copyright (c) 2015年 yangyong. All rights reserved.
//

#import "AddRoomViewController.h"
#import "UIColor+Hexadecimal.h"
#import "RMTUtilityLogin.h"
#import <Masonry/Masonry.h>
#import "RMTLoginEnterViewController.h"
#import "UIColor+Hexadecimal.h"
#import "MBProgressHUD.h"
#import "RMTUserShareData.h"

@interface AddRoomViewController ()
@property (weak, nonatomic) IBOutlet UITableView *tableView;


@property (nonatomic, strong) NSMutableArray *roomsArr;
@end

@implementation AddRoomViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _roomsArr = [NSMutableArray arrayWithCapacity:0];
    [[RMTUtilityLogin  sharedInstance] requestGetFloorsByBuildingId:_buildingData._id
                                                        withLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                           complete:^(NSError *error, FloorsByBuildingObj *obj) {
                                                               if (obj.code == RMTRequestBackCodeSucceed) {
                                                                   if (obj.floors.count == 0) {
                                                                     
                                                                   }
                                                               }
                                                             NSLog(@"requestGetFloorsBy floors count %ld",obj.floors.count);
    }];
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}
- (IBAction)saveClick:(id)sender
{
    
}
- (IBAction)backClick:(id)sender
{
    [self.navigationController popViewControllerAnimated:YES];
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
