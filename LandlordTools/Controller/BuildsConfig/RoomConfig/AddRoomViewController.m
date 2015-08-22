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
#import "AddRoomEditTableViewCell.h"

@interface AddRoomViewController () <UITableViewDelegate,UITableViewDataSource,AddBuildRoomsDelegate>

@property (weak, nonatomic) IBOutlet UITableView *tableView;


@property (nonatomic, strong) NSMutableArray *roomsArr;
@end

@implementation AddRoomViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _roomsArr = [NSMutableArray arrayWithCapacity:0];
        // Do any additional setup after loading the view from its nib.
    UINib *nib = [UINib nibWithNibName:@"AddRoomEditTableViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:@"AddRoomEditTableViewCell"];
    [_tableView reloadData];
    [self reloadBuildings];
}


- (void)reloadBuildings
{
    [_roomsArr removeAllObjects];
    [[RMTUtilityLogin  sharedInstance] requestGetFloorsByBuildingId:_buildingData._id
                                                        withLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                           complete:^(NSError *error, FloorsByBuildingObj *obj) {
                                                               if (obj.code == RMTRequestBackCodeSucceed) {
                                                                   if (obj.floors.count == 0) {
                                                                       
                                                                   }
                                                                   NSLog(@"obj %@",obj);
                                                                   [_roomsArr addObjectsFromArray:obj.floors];
                                                                   [_tableView reloadData];
                                                               }
                                                               NSLog(@"requestGetFloorsBy floors count %ld",obj.floors.count);
                                                           }];

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

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return 60.0f;
}


- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // 增加 楼层 放到 分区末尾。
    ///1 第一区 为 空时  该区 不为空 （显示+楼层）
    //2 当前 为 空 并且 上一区不为空 （该区 显示添加 楼层 1
    // 最后 一区 加 1；
    int section = 0;
    for (int i = 0 ; i < [_roomsArr count] ; i ++) {
        FloorsByArrObj *obj = [_roomsArr objectAtIndex:i];
        if (obj.rooms.count == 0 && i == 0) {
            section++;
        } else  if (obj.rooms.count == 0 && i != 0) {
            FloorsByArrObj *last = [_roomsArr objectAtIndex:i-1];
            if (last.rooms.count != 0) {
                section++;
            }
        } else {
            section++;
        }
    }
    return section;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    //如果 楼层断了，+添加
    // 如果最后 添加 +
    int row = 0;
    if ((((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:section]).rooms).count == 0
         && section == 0)
        || (((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:section]).rooms).count == 0
            && section != 0
            && ((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:section - 1]).rooms).count == 0)) {
        //1 第一区 为 空时 加 1
        //2 当前 为 空 并且 上一区不为空 加 1
        // 最后 一区 加 1；
            row ++;
        
    }
    if (((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:section - 1]).rooms).count == 0) {
        return row;
    }
   
    
    return ((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:section]).rooms).count / 3  + (((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:section]).rooms).count % 3 == 0 ? 1 :0) + row;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *cell = nil;
    if ((((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:indexPath.section]).rooms).count == 0
         && indexPath.section == 0)
        || (((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:indexPath.section]).rooms).count == 0
            && indexPath.section != 0
            && ((NSArray*)((FloorsByArrObj*)[ self.roomsArr objectAtIndex:indexPath.section - 1]).rooms).count != 0)) {
        
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"AddRoomDefalutCell"];
        UIButton *btn = [UIButton new];
        [btn setImage:[UIImage imageNamed:@"bt_level+"] forState:UIControlStateNormal];

        [btn addTarget:self action:@selector(addBuildingsDta:) forControlEvents:UIControlEventTouchUpInside];
        [btn setBackgroundColor:[UIColor colorWithRed:42.0f/255.0f green:42.0f/255.0f blue:42.0f/255.0f alpha:1]];
        [cell addSubview:btn];
        [cell setBackgroundColor:[UIColor colorWithHex:kBackGroundColorStr]];
        
        UILabel *lab = [UILabel new];
        [lab setBackgroundColor:[UIColor colorWithHex:KYellowFontColorStr]];
        [cell addSubview:lab];
        
        [btn mas_makeConstraints:^(MASConstraintMaker *make) {
            make.centerY.mas_equalTo(cell.mas_centerY);
            make.left.mas_equalTo(cell.mas_left).with.offset(10);
            make.size.mas_equalTo(CGSizeMake(40, 40));
        }];
        
        [lab mas_makeConstraints:^(MASConstraintMaker *make) {
            make.centerY.mas_equalTo(btn.mas_centerY);
            make.left.mas_equalTo(btn.mas_right).with.offset(-8);
            make.right.mas_equalTo(cell.mas_right).with.offset(30.0f);
            make.height.mas_equalTo(1.0f);
        }];
    } else {
        cell = (AddRoomEditTableViewCell*)[_tableView dequeueReusableCellWithIdentifier:@"AddRoomEditTableViewCell"];
        AddRoomEditTableViewCell *editCell = (AddRoomEditTableViewCell*)cell;
        [editCell setCellContentData:[_roomsArr objectAtIndex:indexPath.section] withRow:indexPath];
        editCell.delegate = self;
        NSLog(@"indexpth section %ld",indexPath.section);

    }
    
    cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
    return cell;

}


- (void)addBuildingsDta:(id)sender
{
    int count = (int)[_roomsArr count];
    NSMutableArray *floos = [NSMutableArray arrayWithCapacity:0];
    for (int i = 0 ; i <1 ;i ++) {
        EditFloorsByArrObj *obj = [[EditFloorsByArrObj alloc] init];
        obj._id = i +1;
        obj.tmpId = i +1*10;
        obj.oprType = RMTUpdataMyBuildAddType;
        obj.count = i +1;
        NSMutableArray *rooArr = [NSMutableArray arrayWithCapacity:0];
        for (int j = 1; j < 5; j ++) {
            EditRoomsByArrObj *room = [[EditRoomsByArrObj alloc] init];
            room._id = j ;
            room.tmpId = j*20;
            room.oprType = RMTUpdataMyBuildAddType;
            room.number = [NSString stringWithFormat:@"%d",(i +1)*100 *(count +1) + j];
            [rooArr addObject:room];
        }
        obj.rooms = rooArr;
        [floos addObject:obj];
    }
     __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %d %@",obj.code, obj.message);
        [weakSelf reloadBuildings];
    }];
}


- (void)addRoomWithSection:(int)section
{
    FloorsByArrObj *floors =  [_roomsArr objectAtIndex:section];
    RoomsByArrObj *objs = [floors.rooms lastObject];
    
    NSMutableArray *floos = [NSMutableArray arrayWithCapacity:0];
    for (int i = 0 ; i <1 ;i ++) {
        EditFloorsByArrObj *obj = [[EditFloorsByArrObj alloc] init];
        obj._id = floors._id;
        obj.tmpId = floors._id;
        obj.oprType = RMTUpdataMyBuildUpdataType;
        obj.count = floors.count;
        NSMutableArray *rooArr = [NSMutableArray arrayWithCapacity:0];
        for (int j = 1; j < 2; j ++) {
            EditRoomsByArrObj *room = [[EditRoomsByArrObj alloc] init];
            room._id = objs._id +1;
            room.tmpId = objs._id +1;
            room.oprType = RMTUpdataMyBuildAddType;
            room.number = [NSString stringWithFormat:@"%d",[objs.number intValue] +1];
            [rooArr addObject:room];
        }
        obj.rooms = rooArr;
        [floos addObject:obj];
    }
      __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %d %@",obj.code, obj.message);

        [weakSelf reloadBuildings];
    }];
}

- (void)deletedBuildindsWithSection:(int)section
{
    FloorsByArrObj *floors =  [_roomsArr objectAtIndex:section];
//    RoomsByArrObj *objs = [floors.rooms ];
    
    NSMutableArray *floos = [NSMutableArray arrayWithCapacity:0];
    for (int i = 0 ; i <1 ;i ++) {
        EditFloorsByArrObj *obj = [[EditFloorsByArrObj alloc] init];
        obj._id = floors._id;
        obj.tmpId = floors._id;
        obj.oprType = RMTUpdataMyBuildDeletedType;
        obj.count = floors.count;
        NSMutableArray *rooArr = [NSMutableArray arrayWithCapacity:0];
        for (RoomsByArrObj *objs in floors.rooms) {
            EditRoomsByArrObj *room = [[EditRoomsByArrObj alloc] init];
            room._id = objs._id +1;
            room.tmpId = objs._id +1;
            room.oprType = RMTUpdataMyBuildDeletedType;
            room.number = [NSString stringWithFormat:@"%@",objs.number];
            [rooArr addObject:room];
        }
        obj.rooms = rooArr;
        [floos addObject:obj];
    }
    __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"deletedBuildindsWithSection %d %@",obj.code, obj.message);
        [weakSelf reloadBuildings];
        
    }];
}

- (void)deletedRoomWithSection:(int)section
{
    FloorsByArrObj *floors =  [_roomsArr objectAtIndex:section];
    RoomsByArrObj *objs = [floors.rooms lastObject];
    if ([floors.rooms count] == 0) {
        return;
    }
    NSMutableArray *floos = [NSMutableArray arrayWithCapacity:0];
    for (int i = 0 ; i <1 ;i ++) {
        EditFloorsByArrObj *obj = [[EditFloorsByArrObj alloc] init];
        obj._id = floors._id;
        obj.tmpId = floors._id;
        obj.oprType = RMTUpdataMyBuildUpdataType;
        obj.count = floors.count;
        NSMutableArray *rooArr = [NSMutableArray arrayWithCapacity:0];
        for (int j = 1; j < 2; j ++) {
            EditRoomsByArrObj *room = [[EditRoomsByArrObj alloc] init];
            room._id = objs._id ;
            room.tmpId = objs._id;
            room.oprType = RMTUpdataMyBuildDeletedType;
            room.number = [NSString stringWithFormat:@"%@",objs.number];
            [rooArr addObject:room];
        }
        obj.rooms = rooArr;
        [floos addObject:obj];
    }
    __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %d %@",obj.code, obj.message);
        
        [weakSelf reloadBuildings];
    }];
    
}

- (void)reflashDataWithSection:(int)section andIndex:(int)index andData:(RoomsByArrObj *)data
{
    
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
