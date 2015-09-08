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
@end

@implementation AddFloorWaterDataViewControll

- (instancetype)initCheckoutWaterWithCurrentBuild:(AddBuildArrayData *)build
                              andCheckoutRoomsObj:(NSArray *)rooms
                                    andFloorIndex:(int)floorSe
                                     andRoomIndex:(int)roomindex
{
    if (self = [super init]) {
        _buildData = build;
        _floors = [NSMutableArray arrayWithCapacity:0];
        [_floors addObjectsFromArray:rooms];
//        _roomObj = roomObj;
        _floorSection = floorSe;
        _roomIndex = roomindex;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    _currentDataTextField.delegate = self;
    self.titleLabel.text = _buildData.buildingName;
    _roomObj = [((CheckoutRoomsArrObj*)[_floors objectAtIndex:_floorSection]).rooms objectAtIndex:_roomIndex];
    self.roomNumberLabel.text = _roomObj.number;
    self.lastDataLabel.text = [NSString stringWithFormat:@"%.2f", _roomObj.preCount];
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
    _currentUseDataLabel.text = [NSString stringWithFormat:@"%f",[textField.text floatValue] - _roomObj.preCount];
    _currentMonyLabel.text = [NSString stringWithFormat:@"%f",([textField.text floatValue] - _roomObj.preCount) * _roomObj.price];
}

- (IBAction)backClick:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}


- (IBAction)saveClick:(id)sender {
    
    [[RMTUtilityLogin sharedInstance] requestCheckWaterCostWithLoginId:[[RMTUtilityLogin sharedInstance] getLogId] withRoomId:_roomObj._id withCount:[_currentDataTextField.text floatValue] complete:^(NSError *error, BackOject *obj) {
        NSLog(@"obj %@",obj);
    }];
}


@end
