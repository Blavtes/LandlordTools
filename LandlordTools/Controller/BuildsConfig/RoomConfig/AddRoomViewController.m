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

@property (weak, nonatomic) IBOutlet UIView *hubView;

@property (nonatomic, strong) NSMutableArray *roomsArr;
@property (nonatomic, strong) NSMutableArray *sectionArr;
@property (weak, nonatomic) IBOutlet UILabel *titleLable;

@end

@implementation AddRoomViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    _titleLable.text = _buildingData.buildingName;
    _roomsArr = [NSMutableArray arrayWithCapacity:0];
    _sectionArr = [NSMutableArray arrayWithCapacity:0];
        // Do any additional setup after loading the view from its nib.
    UINib *nib = [UINib nibWithNibName:@"AddRoomEditTableViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:@"AddRoomEditTableViewCell"];
    [_tableView reloadData];
    [self showHUDView];
    [self reloadBuildings];
}


- (void)reloadSectionArr
{
    if ([_roomsArr count] == 0) {
        [_sectionArr addObject:@"one"];
        NSLog(@"reload null");
        return;
    }
    

    FloorsByArrObj *one = [_roomsArr firstObject];
    if (one.count != 1) {
        [_sectionArr addObject:@"one"];
       
    }
     [_sectionArr addObject:one];
    for (int i = 1 ; i < [_roomsArr count] ; i ++) {
        FloorsByArrObj *current = [_roomsArr objectAtIndex:i];
        FloorsByArrObj *last = [_roomsArr objectAtIndex:i-1];
        if (current.count - last.count > 1) {

            [_sectionArr addObject:@"one"];
            [_sectionArr addObject:current];
        } else {
            [_sectionArr addObject:current];
        }
        
    }
    
    NSLog(@"sectonArr count %ld",_sectionArr.count);
}

- (void)sortRoomArr {

    for (int i = 0 ; i < _roomsArr.count - 1; i++) {
        for (int j = i + 1; j < _roomsArr.count; j++) {
            FloorsByArrObj *a =   (FloorsByArrObj*)[ self.roomsArr objectAtIndex:i];;
            FloorsByArrObj *b =   (FloorsByArrObj*)[ self.roomsArr objectAtIndex:j];
            NSLog(@"sort %d %d",i,j);
            if (a.count > b.count) {
                [_roomsArr exchangeObjectAtIndex:i withObjectAtIndex:j];
            }
        }
    }
    NSLog(@"sort over");
}

- (void)reloadBuildings
{
    [_sectionArr removeAllObjects];
    [_roomsArr removeAllObjects];
    __weak __typeof(&*self)weakSelf = self;
    
    [[RMTUtilityLogin  sharedInstance] requestGetFloorsByBuildingId:_buildingData._id
                                                        withLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                           complete:^(NSError *error, FloorsByBuildingObj *obj) {
                                                               if (obj.code == RMTRequestBackCodeSucceed) {
                                                                   if (obj.floors.count == 0) {
                                                                       
                                                                   } else {
                                                                       [_roomsArr addObjectsFromArray:obj.floors];
                                                                        [weakSelf sortRoomArr];
                                                                   }
                                                                   NSLog(@"obj %@",obj);
                                                                   
                                                                  
                                                                   [weakSelf reloadSectionArr];
                                                                   [_tableView reloadData];
                                                               }
                                                                       [weakSelf hideHUDView];
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
//    if ([_roomsArr count] == 0) {
//
//        return 1;
//    }
//
//     int section = 0;
//    FloorsByArrObj *one = [_roomsArr firstObject];
//    if (one.count != 1) {
//        section++;
//    }
//    
//   
//    for (int i = 1 ; i < [_roomsArr count] ; i ++) {
//        FloorsByArrObj *current = [_roomsArr objectAtIndex:i];
//        FloorsByArrObj *last = [_roomsArr objectAtIndex:i-1];
//        if (current.count - last.count != 1) {
//            section++;
//        } else {
//        }
//       
//    }
//    section += _roomsArr.count;
//    NSLog(@"section %d",section);
    return _sectionArr.count;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    //如果 楼层断了，+添加
    // 如果最后 添加 +
//    if (_roomsArr.count == 0) {
//        [_sectionArr addObject:@"one"];
//        return 1;
//
    if (_roomsArr.count == 0) {
        return 1;
    }
    NSLog(@"section %ld ,srr count %d, _secArr %@",section,_sectionArr.count,_sectionArr);
    id  selectStr = [_sectionArr objectAtIndex:section];
    if ([selectStr isKindOfClass:[NSString class]] && [selectStr isEqualToString:@"one"]) {
        return 1;
    }
    
    int row = 0;
    if (section == [_sectionArr count] - 1) {
        row ++;
    }
    
    NSLog(@"current section row %ld",((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count / 3  + (((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count % 3 == 0 ? 1 :1) + row);
    NSLog(@"current %ld",((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count);
    return ((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count / 3  + (((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count % 3 == 0 ? 1 :1) + row;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *cell = nil;
    BOOL isOne = YES;
    if (_sectionArr.count == 0) {
        isOne = YES;
    } else {
        id selectStr = [_sectionArr objectAtIndex:indexPath.section];

        if (([selectStr isKindOfClass:[NSString class]] &&  [selectStr isEqualToString:@"one"]) || (([[ self.sectionArr objectAtIndex:indexPath.section] isKindOfClass:[FloorsByArrObj class]]) &&
            indexPath.row == ((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:indexPath.section]).rooms).count / 3  + (((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:indexPath.section]).rooms).count % 3 == 0 ? 1 :1) )) {
            isOne = YES;
           
        } else {
            isOne = NO;
        }
    }
    
    if (isOne) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"AddRoomDefalutCell"];
        UIButton *btn = [UIButton new];
        [btn setImage:[UIImage imageNamed:@"bt_level+"] forState:UIControlStateNormal];
        [btn setTag:indexPath.section];
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
        [editCell setCellContentData:[_sectionArr objectAtIndex:indexPath.section] withRow:indexPath];
        editCell.delegate = self;
        NSLog(@"indexpth section %ld",indexPath.section);

    }
    
    cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
    return cell;

}


- (void)addBuildingsDta:(id)sender
{
    UIButton *btn = (UIButton*)sender;
    int count = 1;
    int _id = 1;
    RMTUpdataMyBuildType oprType = RMTUpdataMyBuildAddType;
    
    if ([_roomsArr count ] != 0) {
        id obj = [_sectionArr objectAtIndex:btn.tag];
        
        if ([obj isKindOfClass:[NSString class]] && ([obj isEqualToString:@"one"])) {
            if (btn.tag - 2 > 0) {
                id obj2 = [_sectionArr objectAtIndex:btn.tag - 2];
                if ([obj2 isKindOfClass:[FloorsByArrObj class]]) {
                    count = ((FloorsByArrObj*)obj2).count + 1;
                }
            } else if (btn.tag - 2 == -1 || btn.tag - 2 == 0) {
                id obj2 = [_sectionArr objectAtIndex:btn.tag - 1];
                if ([obj2 isKindOfClass:[FloorsByArrObj class]]) {
                    count = ((FloorsByArrObj*)obj2).count + 1;
                }
            }
            if (count == 0) {
                count = 1;
            }
        } else {
            count = ((FloorsByArrObj*)obj).count + 1;
            if ([_roomsArr count] != 0) {
                FloorsByArrObj *floors  = (FloorsByArrObj*)[_sectionArr objectAtIndex:btn.tag];
                NSLog(@"floors ob j %@",floors);
                if (floors.rooms.count == 0) {

                    _id =  ((FloorsByArrObj*)obj)._id;
                    oprType = RMTUpdataMyBuildUpdataType;
                } else {

                    _id = ((FloorsByArrObj*)obj)._id + 1;
                }
            }
        }
        
    }
 
   
    
    NSMutableArray *floos = [NSMutableArray arrayWithCapacity:0];
    for (int i = 0 ; i <1 ;i ++) {
        EditFloorsByArrObj *obj = [[EditFloorsByArrObj alloc] init];
        obj._id = _id;
        obj.tmpId = i +1*10;
        obj.oprType = oprType;
        obj.count = count ;
        NSMutableArray *rooArr = [NSMutableArray arrayWithCapacity:0];
        for (int j = 1; j < 5; j ++) {
            EditRoomsByArrObj *room = [[EditRoomsByArrObj alloc] init];
            room._id = j ;
            room.tmpId = j*20;
            room.oprType = RMTUpdataMyBuildAddType;
            room.number = [NSString stringWithFormat:@"%d",(i +1)*100 *(count) + j];
            [rooArr addObject:room];
        }
        obj.rooms = rooArr;
        [floos addObject:obj];
    }
    [self showHUDView];
     __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %d %@",obj.code, obj.message);
        [weakSelf reloadBuildings];

    }];
}


- (void)addRoomWithSection:(int)section
{
    FloorsByArrObj *floors =  [_sectionArr objectAtIndex:section];
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
    [self showHUDView];
      __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %d %@",obj.code, obj.message);

        [weakSelf reloadBuildings];

    }];
}

- (void)deletedBuildindsWithSection:(int)section
{
    FloorsByArrObj *floors =  [_sectionArr objectAtIndex:section];
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
    [self showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"deletedBuildindsWithSection %d %@",obj.code, obj.message);
        [weakSelf reloadBuildings];

    }];
}

- (void)deletedRoomWithSection:(int)section
{
    FloorsByArrObj *floors =  [_sectionArr objectAtIndex:section];
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
    [self showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %d %@",obj.code, obj.message);
        
        [weakSelf reloadBuildings];

    }];
    
}

- (void)reflashDataWithSection:(int)section andIndex:(int)index andData:(RoomsByArrObj *)data
{
    NSLog(@"reflash section %d index %d and data %@",section,index,data);
    FloorsByArrObj *floors =  [_sectionArr objectAtIndex:section];

    
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
            room._id = data._id;
            room.tmpId = data._id;
            room.oprType = RMTUpdataMyBuildUpdataType;
            room.number = [NSString stringWithFormat:@"%@",data.number];
            [rooArr addObject:room];
        }
        obj.rooms = rooArr;
        [floos addObject:obj];
    }
    [self showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withBuildindId:_buildingData._id withFloors:floos complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %d %@",obj.code, obj.message);
        
        [weakSelf reloadBuildings];

    }];
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
