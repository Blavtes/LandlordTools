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
#import "ConfigHouseEditCell.h"
#import "RMTLoginEnterViewController.h"
#import "AddLastMonthDataControll.h"
#import "AddFloorWaterDataViewControll.h"
#import "UIHUDCustomView.h"
@interface AddRoomViewController () <UITableViewDelegate,UITableViewDataSource,AddBuildRoomsDelegate,ConfigHouseEditDelegate>

@property (weak, nonatomic) IBOutlet UITableView *tableView;

@property (weak, nonatomic) IBOutlet UIHUDCustomView *hubView;
@property (weak, nonatomic) IBOutlet UIButton *saveBt;

@property (nonatomic, strong) NSMutableArray *roomsArr;
@property (nonatomic, strong) NSMutableArray *sectionArr;
@property (weak, nonatomic) IBOutlet UILabel *titleLable;
@property (nonatomic, assign) BOOL isSaveRoom;
@property (nonatomic, assign) BOOL isReload;

@end

#define kSpaceStr                           @"oneSpaceStr"

#define kAddRoomCellIdentifier              @"AddRoomEditTableViewCell"
#define KConfigRoomCellIdentifier           @"ConfigHouseEditCell"

@implementation AddRoomViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    if (_userCheckoutType != RMTUserRoomTypeInit) {
        _isSaveRoom = YES;
        [_saveBt setTitle:@"编辑" forState:UIControlStateNormal];
    }
    _titleLable.text = _buildingData.buildingName;
    _roomsArr = [NSMutableArray arrayWithCapacity:0];
    _sectionArr = [NSMutableArray arrayWithCapacity:0];
    // Do any additional setup after loading the view from its nib.
    UINib *nib = [UINib nibWithNibName:kAddRoomCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib forCellReuseIdentifier:kAddRoomCellIdentifier];
    
    UINib *nib2 = [UINib nibWithNibName:KConfigRoomCellIdentifier bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib2 forCellReuseIdentifier:KConfigRoomCellIdentifier];
    
//    [_tableView reloadData];
    [_hubView showHUDView];
    [self reloadBuildings];

}


- (void)reloadSectionArr
{
//    if (_isSaveRoom) {
//        return;
//    }
    if ([_roomsArr count] == 0 && !_isSaveRoom) {
        [_sectionArr addObject:kSpaceStr];
        NSLog(@"reload null");
        return;
    }
    
    
    FloorsByArrObj *one = [_roomsArr firstObject];
    if (one.count != 1 && !_isSaveRoom ) {
        [_sectionArr addObject:kSpaceStr];
        
    }
    [_sectionArr addObject:one];
    for (int i = 1 ; i < [_roomsArr count] ; i ++) {
        FloorsByArrObj *current = [_roomsArr objectAtIndex:i];
        FloorsByArrObj *last = [_roomsArr objectAtIndex:i-1];
        if (current.count - last.count > 1) {
            if (!_isSaveRoom) {
                 [_sectionArr addObject:kSpaceStr];
            }
           
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
    if (_userCheckoutType == RMTUserRoomTypeManage) {
        [[RMTUtilityLogin  sharedInstance] requestGetFloorsByBuildingId:_buildingData._id
                                                            withLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                               complete:^(NSError *error, FloorsByBuildingObj *obj) {
                                                                   if (obj.code == RMTRequestBackCodeSucceed || obj.code == RMTRequestBackCodeFailure) {
                                                                       if (obj.floors.count == 0) {
                                                                           if (!_isReload) {
                                                                                [weakSelf addBuildingsDta:nil];
                                                                               _isReload = YES;
                                                                           }
                                                                          
                                                                           [_hubView hideHUDView];
                                                                       } else {
                                                                           [_roomsArr addObjectsFromArray:obj.floors];
                                                                           [weakSelf sortRoomArr];
                                                                           [weakSelf reloadSectionArr];
                                                                           [_hubView hideHUDView];
                                                                       }
                                                                       NSLog(@"obj %@",obj);
                                                                       
                                                                       
                                                                       
                                                                       [_tableView reloadData];
                                                                   }
                                                                   
                                                                   NSLog(@"requestGetFloorsBy floors count %ld",obj.floors.count);
                                                               }];
    } else if (_userCheckoutType == RMTUserRoomTypeLogIn) {
        [[RMTUtilityLogin sharedInstance] requestGetNotRentedRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                               withBuildingId:_buildingData._id
                                                                     complete:^(NSError *error, FloorsByBuildingObj *obj) {
                                                                         if (obj.code == RMTRequestBackCodeSucceed || obj.code == RMTRequestBackCodeFailure) {
                                                                             if (obj.floors.count == 0) {
                                                                                 if (!_isReload) {
                                                                                     [weakSelf addBuildingsDta:nil];
                                                                                     _isReload = YES;
                                                                                 }
                                                                                 [_hubView hideHUDView];
                                                                             } else {
                                                                                 [_roomsArr addObjectsFromArray:obj.floors];
                                                                                 [weakSelf sortRoomArr];
                                                                                 [weakSelf reloadSectionArr];
                                                                                 [_hubView hideHUDView];
                                                                             }
                                                                             NSLog(@"obj %@",obj);
                                                                             
                                                                             
                                                                             
                                                                             [_tableView reloadData];
                                                                         }
                                                                         
                                                                         NSLog(@"requestGetFloorsBy floors count %ld",obj.floors.count);
                                                                     }];
    } else if (_userCheckoutType == RMTUserRoomTypeLogOut) {
        [[RMTUtilityLogin sharedInstance] requestGetRentedRoomsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                            withBuildingId:_buildingData._id
                                                                  complete:^(NSError *error, FloorsByBuildingObj *obj) {
                                                                      if (obj.code == RMTRequestBackCodeSucceed || obj.code == RMTRequestBackCodeFailure) {
                                                                          if (obj.floors.count == 0) {
                                                                              if (!_isReload) {
                                                                                  [weakSelf addBuildingsDta:nil];
                                                                                  _isReload = YES;
                                                                              }
                                                                              [_hubView hideHUDView];
                                                                          } else {
                                                                              [_roomsArr addObjectsFromArray:obj.floors];
                                                                              [weakSelf sortRoomArr];
                                                                              [weakSelf reloadSectionArr];
                                                                              [_hubView hideHUDView];
                                                                          }
                                                                          NSLog(@"obj %@",obj);
                                                                          
                                                                          
                                                                          
                                                                          [_tableView reloadData];
                                                                      }
                                                                      
                                                                      NSLog(@"requestGetFloorsBy floors count %ld",obj.floors.count);
        }];
    }
   
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
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
    if (_isSaveRoom) {
        id  selectStr = [_sectionArr objectAtIndex:section];
        if ([selectStr isKindOfClass:[NSString class]] && [selectStr isEqualToString:kSpaceStr]) {
            return 1;
        }
        return  self.sectionArr.count > 0 ?  ((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count / 3
        + (((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count % 3 == 0 ? 0 :1) : 0;
    }
    if (_roomsArr.count == 0) {
        return 1;
    }
    NSLog(@"section %ld ,srr count %ld, _secArr %@",section,_sectionArr.count,_sectionArr);
    id  selectStr = [_sectionArr objectAtIndex:section];
    if ([selectStr isKindOfClass:[NSString class]] && [selectStr isEqualToString:kSpaceStr]) {
        return 1;
    }
    
    int row = 0;
    if (section == [_sectionArr count] - 1) {
        row ++;
    }
    
    //    NSLog(@"current section row %ld",((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count / 3  + (((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count % 3 == 0 ? 1 :1) + row);
    NSLog(@"current %ld",((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count);
    return ((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count / 3
            + (((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:section]).rooms).count % 3 == 0 ? 1 :1) + row;
}

- (UIView*)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
    NSString *color = kBackGroundColorStr;
    if (_isSaveRoom) {
        color = K35ColorStr;
    }
    UIView *view = [UIView new];
    [view setFrame:CGRectMake(30, 0, self.view.frame.size.width-60, 1)];
    [view setBackgroundColor:[UIColor colorWithHex:color]];
    return view;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *cell = nil;
    if (!_isSaveRoom) {
        
        
        BOOL isOne = YES;
        if (_sectionArr.count == 0) {
            isOne = YES;
        } else {
            id selectStr = [_sectionArr objectAtIndex:indexPath.section];
            
            if (([selectStr isKindOfClass:[NSString class]] &&  [selectStr isEqualToString:kSpaceStr])
                || (([[ self.sectionArr objectAtIndex:indexPath.section] isKindOfClass:[FloorsByArrObj class]]) &&
                    indexPath.row == ((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:indexPath.section]).rooms).count / 3
                        + (((NSArray*)((FloorsByArrObj*)[ self.sectionArr objectAtIndex:indexPath.section]).rooms).count % 3 == 0 ? 1 :1) )) {
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
                make.right.mas_equalTo(cell.mas_right).with.offset(-20.0f);
                make.height.mas_equalTo(1.0f);
            }];
        } else {
            cell = (AddRoomEditTableViewCell*)[_tableView dequeueReusableCellWithIdentifier:kAddRoomCellIdentifier];
            AddRoomEditTableViewCell *editCell = (AddRoomEditTableViewCell*)cell;
            [editCell setCellContentData:[_sectionArr objectAtIndex:indexPath.section] withRow:indexPath];
            editCell.delegate = self;
            NSLog(@"indexpth section %ld",indexPath.section);
            
        }
        //    [cell setSeparatorInset:UIEdgeInsetsMake(0, 40, 0, 30)];
        cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithHex:kBackGroundColorStr];
    } else {
        cell = [_tableView dequeueReusableCellWithIdentifier:KConfigRoomCellIdentifier];
        ConfigHouseEditCell *editCell = (ConfigHouseEditCell*)cell;
        [editCell setCellContentData:[_sectionArr objectAtIndex:indexPath.section] withRow:indexPath];
        editCell.delegate = self;
        NSLog(@"indexpth section %ld",indexPath.section);
    }
    return cell;
    
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
//    [_tableView deselectRowAtIndexPath:indexPath animated:YES];
    UITableViewCell *cell = [tableView cellForRowAtIndexPath:indexPath];
    [cell setSelectionStyle:UITableViewCellSelectionStyleNone];
}

- (void)addBuildingsDta:(id)sender
{
    UIButton *btn = (UIButton*)sender;
    int count = 1;
    int _id = 1;
    RMTUpdataMyBuildType oprType = RMTUpdataMyBuildAddType;
    
    if ([_roomsArr count ] != 0) {
        id obj = [_sectionArr objectAtIndex:btn.tag];
        
        if ([obj isKindOfClass:[NSString class]] && ([obj isEqualToString:kSpaceStr])) {
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
            if (_sectionArr.count >= 3) {
                for (id data in _sectionArr) {
                    if ([data isKindOfClass:[FloorsByArrObj class]]) {
                        if (((FloorsByArrObj*)data).count == 3) {
                            count += 1;
                            break;
                        }
                    }
                }
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
    NSMutableDictionary *dic = [NSMutableDictionary new];
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
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
    } else {
        //        for (int i = 0 ; i <1 ;i ++) {
        //            FloorsByArrObj *obj = [[FloorsByArrObj alloc] init];
        //            obj._id = _id;
        //            obj.count = count ;
        //            NSMutableArray *rooArr = [NSMutableArray arrayWithCapacity:0];
        //            for (int j = 1; j < 5; j ++) {
        //                RoomsByArrObj *room = [[RoomsByArrObj alloc] init];
        //                room._id = j ;
        //                room.number = [NSString stringWithFormat:@"%d",(i +1)*100 *(count) + j];
        //                [rooArr addObject:room];
        //            }
        //            obj.rooms = rooArr;
        //            [floos addObject:obj];
        //        }
        for (int i = 0 ; i <1 ;i ++) {
            NSMutableArray *roomArr = [NSMutableArray arrayWithCapacity:0];
            for (int j = 1; j < 5; j ++) {
                
                NSMutableDictionary *dict = [NSMutableDictionary
                                             dictionaryWithDictionary:@{@"id":@(j),
                                                                        @"isInit":@(0),
                                                                        @"number":[NSString stringWithFormat:@"%d",(i +1)*100 *(count) + j]}];
                [roomArr addObject:dict];
            }
            NSMutableDictionary *dict = [NSMutableDictionary
                                         dictionaryWithDictionary:@{@"id":@(_id),
                                                                    @"count":@(count),
                                                                    @"rooms":roomArr}];
            [floos addObject:dict];
        }
        
        
        [dic setValue:@(1) forKey:@"code"];
        [dic setValue:@"add build" forKey:@"message"];
        [dic setValue:floos forKey:@"floors"];
    }
    
    [_hubView showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                        withBuildindId:_buildingData._id
                                                            withFloors:floos
                                                              complete:^(NSError *error, EditFloorsBackObj *obj) {
                                                                  NSLog(@"add  obj %d %@",obj.code, obj.message);;
                                                                  if (obj.code == RMTRequestBackCodeFailure) {
                                                                      [_sectionArr addObject:floos];
                                                                      [_roomsArr addObject:floos];
                                                                      [_tableView reloadData];
                                                                  } else {
                                                                      [weakSelf reloadBuildings];
                                                                  }
                                                                  
                                                                  [_hubView hideHUDView];
                                                              }];
    } else {
        NSLog(@"dict %@",dic);
        FloorsByBuildingObj *data = [[FloorsByBuildingObj alloc] initWithDictionary:dic error:nil];
        //        NSLog(@"florrs %@",[data.floors objectAtIndex:0]);
        if ([_sectionArr count] == 1 && [[_sectionArr firstObject] isKindOfClass:[NSString class]]) {
            [_sectionArr removeAllObjects];
        }
        [_sectionArr addObjectsFromArray:data.floors];
        [_roomsArr addObjectsFromArray:floos];
        [_tableView reloadData];
        [_hubView hideHUDView];
    }
    
}


- (void)addRoomWithNotLoginId
{
    
}


- (void)addRoomWithSection:(int)section
{
    FloorsByArrObj *floors =  [_sectionArr objectAtIndex:section];
    RoomsByArrObj *objs = [floors.rooms lastObject];
    
    NSMutableArray *floos = [NSMutableArray arrayWithCapacity:0];
    
    
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
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
    } else {
        for (int i = 0 ; i <1 ;i ++) {
            FloorsByArrObj *obj = [[FloorsByArrObj alloc] init];
            obj._id = floors._id;
            obj.count = floors.count ;
            NSMutableArray *rooArr = [NSMutableArray arrayWithCapacity:0];
            for (int j = 1; j < 5; j ++) {
                RoomsByArrObj *room = [[RoomsByArrObj alloc] init];
                room._id = j ;
                room.number = [NSString stringWithFormat:@"%d",(i +1)*100 *(floors.count) + j];
                [rooArr addObject:room];
            }
            obj.rooms = rooArr;
            [floos addObject:obj];
        }
    }
    
    [_hubView showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                        withBuildindId:_buildingData._id
                                                            withFloors:floos
                                                              complete:^(NSError *error, EditFloorsBackObj *obj) {
                                                                  NSLog(@"obj %d %@",obj.code, obj.message);
                                                                  
                                                                  if (obj.code == RMTRequestBackCodeFailure) {
                                                                      [_sectionArr addObject:floos];
                                                                      [_roomsArr addObject:floos];
                                                                      [_tableView reloadData];
                                                                  } else {
                                                                      [weakSelf reloadBuildings];
                                                                  }
                                                                  
                                                              }];
    } else {
        [_hubView hideHUDView];
        [_sectionArr addObjectsFromArray:floos];
        [_roomsArr addObjectsFromArray:floos];
        [_tableView reloadData];
    }
    
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    if (_isSaveRoom) {
        if (_roomsArr.count > 0) {
             [_tableView reloadData];
        }
       
    }
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
    [_hubView showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                        withBuildindId:_buildingData._id
                                                            withFloors:floos
                                                              complete:^(NSError *error, EditFloorsBackObj *obj) {
                                                                  NSLog(@"deletedBuildindsWithSection %d %@",obj.code, obj.message);
                                                                  
                                                                  if (obj.code == RMTRequestBackCodeFailure) {
                                                                      [_sectionArr removeObject:floors];
                                                                      [_roomsArr removeObject:floos];
                                                                      [_tableView reloadData];
                                                                  } else {
                                                                      [weakSelf reloadBuildings];
                                                                  }
                                                              }];
    } else {
        [_hubView hideHUDView];
        [_sectionArr removeObject:floors];
        [_roomsArr removeObject:floos];
        [_tableView reloadData];
    }
    
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
    [_hubView showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                        withBuildindId:_buildingData._id
                                                            withFloors:floos
                                                              complete:^(NSError *error, EditFloorsBackObj *obj) {
                                                                  NSLog(@"obj %d %@",obj.code, obj.message);
                                                                  
                                                                  if (obj.code == RMTRequestBackCodeFailure) {
                                                                      [_sectionArr removeObject:floors];
                                                                      [_roomsArr removeObject:floos];
                                                                      [_tableView reloadData];
                                                                  } else {
                                                                      [weakSelf reloadBuildings];
                                                                  }
                                                                  
                                                              }];
    } else {
        NSMutableArray *arr = [NSMutableArray arrayWithCapacity:0];
        [arr addObjectsFromArray:floors.rooms];
        [arr removeLastObject];
        floors.rooms = arr;
        [_hubView hideHUDView];
        [_sectionArr replaceObjectAtIndex:section withObject:floors];
        
        [_tableView reloadData];
    }
    
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
    [_hubView showHUDView];
    __weak __typeof(&*self)weakSelf = self;
    if ([[RMTUtilityLogin sharedInstance] getLogId]) {
        [[RMTUtilityLogin sharedInstance] requestEditFloorsWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                        withBuildindId:_buildingData._id
                                                            withFloors:floos
                                                              complete:^(NSError *error, EditFloorsBackObj *obj) {
            NSLog(@"obj %d %@",obj.code, obj.message);
            
            if (obj.code == RMTRequestBackCodeFailure) {
                [_sectionArr replaceObjectAtIndex:section withObject:data];
                
                [_tableView reloadData];
            } else {
                [weakSelf reloadBuildings];
            }
            
        }];
    } else {
        [_hubView hideHUDView];
        [_sectionArr replaceObjectAtIndex:section withObject:data];
        
        [_tableView reloadData];
    }
}

- (void)configRoomDataWithSection:(int)section andIndex:(int)index
{
    FloorsByArrObj *floors =  [_sectionArr objectAtIndex:section];
    if (floors && index < floors.rooms.count) {
        RoomsByArrObj *room = [floors.rooms objectAtIndex:index];
      
        if (_userCheckoutType == RMTUserRoomTypeLogIn || _userCheckoutType == RMTUserRoomTypeLogOut) {
            NSLog(@"_userCheckout type %d",_userCheckoutType);
            if (room.isInit == RMTIsInitNot) {
                AddLastMonthDataControll *vc = [[AddLastMonthDataControll alloc] init];
                vc.roomDataObj = room;
                
                vc.buildingData = _buildingData;
                vc.isConfigMode = YES;
                vc.userCheckoutType = _userCheckoutType;
                [self.navigationController pushViewController:vc animated:YES];
            } else if (room.isInit == RMTIsInitDo) {
                CheckoutRoomObj *obj = [CheckoutRoomObj new];
                obj.number = room.number;
                obj._id = room._id;
                RMTSelectIndex index = RMTSelectIndexError;
                if (_userCheckoutType == RMTUserRoomTypeLogIn) {
                    index = RMTSelectLogIn;
                } else {
                    index = RMTSelectLogOut;
                }
                AddFloorWaterDataViewControll *vc = [[AddFloorWaterDataViewControll alloc] initCheckoutDataWithCurrentBuild:_buildingData
                                                                                                         andCheckoutRoomObj:obj
                                                                                                                    andType:index];
                vc.userCheckoutType = _userCheckoutType;
                [self.navigationController pushViewController:vc animated:YES];
            }
        } else if (_userCheckoutType == RMTUserRoomTypeInit || _userCheckoutType == RMTUserRoomTypeManage) {
            AddLastMonthDataControll *vc = [[AddLastMonthDataControll alloc] init];
            vc.roomDataObj = room;
            
            vc.buildingData = _buildingData;
            vc.isConfigMode = YES;
            vc.userCheckoutType = _userCheckoutType;
            [self.navigationController pushViewController:vc animated:YES];
        }
       
    }
}


- (IBAction)saveClick:(id)sender
{
    
    if (!_isSaveRoom) {
        if (_roomsArr.count > 0) {
            _isSaveRoom = YES;
            [_saveBt setTitle:@"编辑" forState:UIControlStateNormal];
            if ([[RMTUtilityLogin sharedInstance] getLogId] != nil ) {
                _isSaveRoom = YES;
                [_saveBt setTitle:@"编辑" forState:UIControlStateNormal];
                for (int i = (int)_sectionArr.count - 1; i >= 0; i--) {
                    id obj = [_sectionArr objectAtIndex:i];
                    if ([obj isKindOfClass:[NSString class]]) {
                        [_sectionArr removeObjectAtIndex:i];
                    }
                }
                [_tableView reloadData];
            } else {
                //login
                RMTLoginEnterViewController *vc =  [[RMTLoginEnterViewController alloc] init];
                [self.navigationController pushViewController:vc animated:YES];
                [[RMTUtilityLogin sharedInstance] setHaveTempData:YES];
                _isSaveRoom = YES;
            }
        }
      
    } else {
        _isSaveRoom = NO;
        [_saveBt setTitle:@"保存" forState:UIControlStateNormal];
        [_tableView reloadData];
    }
    
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
