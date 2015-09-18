//
//  AddFloorWaterDataViewControll.m
//  LandlordTools
//
//  Created by yangyong on 16/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "AddFloorWaterDataViewControll.h"
#import "RMTUserLogic.h"
#import "RMTUserShareData.h"
#import "RMTUtilityLogin.h"
#import <Masonry.h>
#import "UIColor+Hexadecimal.h"
#import "AddLastMonthDataControll.h"


@interface AddFloorWaterDataViewControll () <UITextFieldDelegate>
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *checkNotiLabel;
@property (weak, nonatomic) IBOutlet UILabel *roomNumberLabel;
@property (weak, nonatomic) IBOutlet UILabel *lastDataLabel;
@property (weak, nonatomic) IBOutlet UITextField *currentDataTextField;
@property (weak, nonatomic) IBOutlet UILabel *currentUseDataLabel;
@property (weak, nonatomic) IBOutlet UILabel *currentMonyLabel;
@property (weak, nonatomic) IBOutlet UIButton *saveBt;

@property (weak, nonatomic) IBOutlet UIView *notiVIew;

@property (nonatomic, strong) AddBuildArrayData *buildData;
@property (nonatomic, strong) CheckoutRoomObj *roomObj;
@property (nonatomic, strong) NSMutableArray *floors;
@property (nonatomic, assign) int floorSection;
@property (nonatomic, assign) int roomIndex;
@property (nonatomic, assign) RMTSelectIndex selectType;
@property (nonatomic, assign) RMTSelectIndex currentSelectType; //入住时 需要的 抄水表 还 电表
@property (nonatomic, strong) RoomByIdObj *currentRoomDes;
@end

@implementation AddFloorWaterDataViewControll

//抄表
- (instancetype)initCheckoutWaterWithCurrentBuild:(AddBuildArrayData *)build
                              andCheckoutRoomsObj:(NSArray *)rooms
                                    andFloorIndex:(int)floorSe
                                     andRoomIndex:(int)roomindex
                                       andType:(RMTSelectIndex)selec
{
    if (self = [super init]) {
        _buildData = build;
        _floors = [NSMutableArray arrayWithCapacity:0];
        [_floors addObjectsFromArray:rooms];
//        _roomObj = roomObj;
        _floorSection = floorSe;
        _roomIndex = roomindex;
        _selectType = selec;
    }
    return self;
}

//login out
- (instancetype)initCheckoutDataWithCurrentBuild:(AddBuildArrayData *)build
                              andCheckoutRoomObj:(CheckoutRoomObj *)roomObj
                                         andType:(RMTSelectIndex)selec
{
    if (self = [super init]) {
        _buildData = build;
        _floors = [NSMutableArray arrayWithCapacity:0];
        [_floors addObject:roomObj];
        //        _roomObj = roomObj;
        _floorSection = 0;
        _roomIndex = 0;
        _selectType = selec;
        if (selec == RMTSelectLogIn) {
            _userCheckoutType = RMTUserRoomTypeLogIn;
        } else if (selec == RMTSelectLogOut) {
            _userCheckoutType = RMTUserRoomTypeLogOut;
        }
        _currentSelectType = RMTSelectIndexWater;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    _checkNotiLabel.hidden = YES;
    _currentDataTextField.delegate = self;
    [[RMTUtilityLogin sharedInstance] requestGetRoomByRoomId:_roomObj._id withLoginId:[[RMTUtilityLogin sharedInstance] getLogId] complete:^(NSError *error, RoomByIdObj *obj) {
        _currentRoomDes = obj;
        NSString *defalut = nil;
        if ( _selectType == RMTSelectIndexWater) {
            defalut = @"水表底数:";
        } else {
            defalut = @"电表底数:";
        }
        self.lastDataLabel.text = [NSString stringWithFormat:@"%@%.2f",defalut, _currentRoomDes.room.preWaterCount];
    }];
    self.titleLabel.text = _buildData.buildingName;
    if (_selectType == RMTSelectIndexRent ||
        _selectType == RMTSelectIndexWater ||
        _selectType == RMTSelectIndexElect) {//查水表 查电表 交房租
        
        _roomObj = [((CheckoutRoomsArrObj*)[_floors objectAtIndex:_floorSection]).rooms objectAtIndex:_roomIndex];
    } else { //退房 入住
        _roomObj = (CheckoutRoomObj*) [_floors objectAtIndex:0];
    }
  
    self.roomNumberLabel.text = _roomObj.number;

    // Do any additional setup after loading the view from its nib.
}

- (void)checkoutWaterWithCurrentBuild:(AddBuildArrayData*)build andCheckoutRoomObj:(CheckoutRoomObj *)roomObj
{
    NSLog(@"checkoutWater");
    self.titleLabel.text = build.buildingName;
    self.roomNumberLabel.text = roomObj.number;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

- (void)textFieldDidEndEditing:(UITextField *)textField
{
    //chekcout noti label
    // count
    if (_currentSelectType == RMTSelectIndexWater) {
        _currentUseDataLabel.text = [NSString stringWithFormat:@"%.2f(吨)",[textField.text floatValue] - _roomObj.preCount];
        _currentMonyLabel.text = [NSString stringWithFormat:@"%.2f(元)",([textField.text floatValue] - _roomObj.preCount) * _buildData.waterPrice];
    } else if (_currentSelectType == RMTSelectIndexElect) {
        _currentUseDataLabel.text = [NSString stringWithFormat:@"%.2f(度)",[textField.text floatValue] - _roomObj.preCount];
        _currentMonyLabel.text = [NSString stringWithFormat:@"%.2f(元)",([textField.text floatValue] - _roomObj.preCount) * _buildData.electricPrice];
    }
      NSString *defalut = nil;
    if ( _currentSelectType == RMTSelectIndexWater) {
        defalut = @"水表底数:";
    } else {
        defalut = @"电表底数:";
    }
    self.lastDataLabel.text = [NSString stringWithFormat:@"%@%.2f",defalut, _currentRoomDes.room.preElectricCount];
    
}

- (IBAction)backClick:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

- (BOOL)reflashData
{
    _checkNotiLabel.hidden = YES;
    if (_selectType == RMTSelectIndexRent ||
        _selectType == RMTSelectIndexWater ||
        _selectType == RMTSelectIndexElect) {//查水表 查电表 交房租
        if (_roomIndex < ((CheckoutRoomsArrObj*)[_floors objectAtIndex:_floorSection]).rooms.count -1 ) {
            _roomIndex++;
        } else {
            if (_floorSection < _floors.count - 1) {
                _floorSection++;
                _roomIndex = 0;
            } else {
                return NO;
            }
        }
        _roomObj = [((CheckoutRoomsArrObj*)[_floors objectAtIndex:_floorSection]).rooms objectAtIndex:_roomIndex];
    }
    
    self.roomNumberLabel.text = _roomObj.number;
    NSString *defalut = nil;
    if ( _selectType == RMTSelectIndexWater) {
        defalut = @"水表底数:";
    } else {
        defalut = @"电表底数:";
    }
    self.lastDataLabel.text = [NSString stringWithFormat:@"%@%.2f",defalut, _roomObj.preCount];
    return YES;
}

- (IBAction)saveClick:(id)sender {
    if (_selectType == RMTSelectIndexWater) {
        NSLog(@"chao shuib ");
        [[RMTUtilityLogin sharedInstance] requestCheckWaterCostWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                withRoomId:_roomObj._id
                                                                 withCount:[_currentDataTextField.text floatValue]
                                                                  complete:^(NSError *error, BackOject *obj) {
                                                                    NSLog(@"obj CheckWaterCost %@",obj);
                                                                    if (obj.code == RMTRequestBackCodeSucceed) {
                                                                        if ([self reflashData]) {
                                                                            NSLog(@"切换数据成功");
                                                                        } else {
                                                                            NSLog(@"无下一间");
                                                                        }
                                                                    }
        }];
    } else if (_selectType == RMTSelectIndexElect) {
        NSLog(@"chao elect  ");
        [[RMTUtilityLogin sharedInstance]  requestCheckElectricCostWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                withRoomId:_roomObj._id
                                                                 withCount:[_currentDataTextField.text floatValue]
                                                                  complete:^(NSError *error, BackOject *obj) {
                                                                      NSLog(@"obj CheckWaterCost %@",obj);
                                                                      if (obj.code == RMTRequestBackCodeSucceed) {
                                                                          if ([self reflashData]) {
                                                                              NSLog(@"切换数据成功");
                                                                          } else {
                                                                              NSLog(@"无下一间");
                                                                          }
                                                                      }
                                                                  }];
    } else if (_selectType == RMTSelectIndexRent) {
         NSLog(@"rent pay ");
    
    } else if (_selectType == RMTSelectLogIn || _selectType == RMTSelectLogOut) {
        if (_currentSelectType == RMTSelectIndexWater) {
            [[RMTUtilityLogin sharedInstance] requestCheckWaterCostWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                    withRoomId:_roomObj._id
                                                                     withCount:[_currentDataTextField.text floatValue]
                                                                      complete:^(NSError *error, BackOject *obj) {
                                                                          NSLog(@"objtCheckWater %@",obj);
                                                                          if (obj.code == RMTRequestBackCodeSucceed) {
                                                                              _currentSelectType = RMTSelectIndexElect;
                                                                              
                                                                          }
                                                                      }];

        } else {
            [[RMTUtilityLogin sharedInstance] requestCheckElectricCostWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId]
                                                                       withRoomId:_roomObj._id
                                                                        withCount:[_currentDataTextField.text floatValue]
                                                                         complete:^(NSError *error, BackOject *obj) {
                NSLog(@"objCheckElectric %@",obj);
                if (obj.code == RMTRequestBackCodeSucceed) {
                    AddLastMonthDataControll *vc = [[AddLastMonthDataControll alloc] init];
                    vc.userCheckoutType = _userCheckoutType;
                    vc.roomDataObj = [RoomsByArrObj new];
                    vc.roomDataObj._id = _roomObj._id;
                    vc.roomDataObj.number = _roomObj.number;
                    vc.roomDataObj.isInit = RMTIsInitDo;
                    vc.buildingData = _buildData;
                    [self.navigationController pushViewController:vc animated:YES];
                }
                                                                             
            }];
        }
    }
   
}


@end
