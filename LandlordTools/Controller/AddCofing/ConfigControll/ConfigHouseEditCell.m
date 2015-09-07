//
//  ConfigHouseEditCell.m
//  LandlordTools
//
//  Created by yangyong on 15/8/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "ConfigHouseEditCell.h"
#import "RMTUtilityLogin.h"
#import "UIColor+Hexadecimal.h"

@implementation ConfigHouseEditCell

- (void)awakeFromNib {
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

- (void)setOneData:(ConfigEditHouseData*)datao andTwoData:(ConfigEditHouseData*)andTwoData andThreeData:(ConfigEditHouseData*)thData
{
    if (datao) {
        _oneHouseVIew.hidden = NO;
        UIButton *bt1 =  (UIButton*)[_oneHouseVIew viewWithTag:901];
        [bt1 setTitle:datao.houseNumber forState:UIControlStateNormal];
        UIImageView *image1 = (UIImageView*)[_oneHouseVIew viewWithTag:801];
        [image1 setHidden:datao.isConfig];
    } else {
        _oneHouseVIew.hidden = YES;
    }
  
    if (andTwoData) {
        _twoHouseView.hidden = NO;
        UIButton *bt1 =  (UIButton*)[_twoHouseView viewWithTag:902];
        [bt1 setTitle:andTwoData.houseNumber forState:UIControlStateNormal];
        UIImageView *image1 = (UIImageView*)[_twoHouseView viewWithTag:802];
        [image1 setHidden:andTwoData.isConfig];
    } else {
        _twoHouseView.hidden = YES;
    }
    
    if (thData) {
        _threeHouseView.hidden = NO;
        UIButton *bt1 =  (UIButton*)[_threeHouseView viewWithTag:903];
        [bt1 setTitle:thData.houseNumber forState:UIControlStateNormal];
        UIImageView *image1 = (UIImageView*)[_threeHouseView viewWithTag:803];
        [image1 setHidden:thData.isConfig];
    } else {
        _threeHouseView.hidden = YES;
    }
    
    
}


- (void) setCellContentData:(FloorsByArrObj *)array withRow:(NSIndexPath*)indexPath
{//FloorsByArrObj
    self.indexPath = indexPath;
    _data = array;
    NSLog(@"array Count %@",array);
    if (indexPath.row * 3 < array.rooms.count) {
        RoomsByArrObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3];
        [self.oneBt setTitle:obj.number forState:UIControlStateNormal];
        self.oneBt.tag = (indexPath.section +1)* 10000 + indexPath.row *3;
        NSLog(@"romt one %ld",indexPath.row*3);
        self.oneBt.hidden = NO;
        if (obj.isInit != RMTIsInitNot) {
            _infoOne.hidden = YES;
        } else {
            _infoOne.hidden = NO;
        }
    } else {
        self.oneHouseVIew.hidden = YES;
    }
    if (indexPath.row * 3+1 < array.rooms.count) {
        self.twoBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 +1;
        RoomsByArrObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 1];
        if (obj.isInit != RMTIsInitNot) {
            _infoTwo.hidden = YES;
        } else {
            _infoTwo.hidden = NO;
        }
        [self.twoBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romTow  %ld",indexPath.row *3+1);
        self.twoBt.hidden = NO;
    } else {
        self.twoHouseView.hidden = YES;
    }
    if (indexPath.row * 3+2 < array.rooms.count) {
        self.threeBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 + 2;
        RoomsByArrObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 2];
        if (obj.isInit != RMTIsInitNot) {
            _infoThree.hidden = YES;
        } else {
              _infoThree.hidden = NO;
        }
        [self.threeBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romThre  %ld",indexPath.row* 3+2);
        self.threeBt.hidden = NO;
    } else {
        self.threeHouseView.hidden = YES;
    }
    
}

- (void)setCellContentDataRooms:(CheckoutRoomsArrObj *)array withRow:(NSIndexPath *)indexPath
{
    self.indexPath = indexPath;

    NSLog(@"array Count %@ %d %d",array,indexPath.section,indexPath.row);
    if (indexPath.row * 3 < array.rooms.count) {
        CheckoutRoomObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3];
        [self.oneBt setTitle:obj.number forState:UIControlStateNormal];
        self.oneBt.tag = (indexPath.section +1)* 10000 + indexPath.row *3;
        NSLog(@"romt one %ld",indexPath.row*3);
        self.oneBt.hidden = NO;
        _infoOne.hidden = YES;
        [self.oneBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];

    } else {
        self.oneHouseVIew.hidden = YES;
    }
    if (indexPath.row * 3+1 < array.rooms.count) {
        self.twoBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 +1;
        CheckoutRoomObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 1];
            _infoTwo.hidden = YES;
        [self.twoBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romTow  %ld",indexPath.row *3+1);
        self.twoBt.hidden = NO;
        [self.twoBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];

    } else {
        self.twoHouseView.hidden = YES;
    }
    if (indexPath.row * 3+2 < array.rooms.count) {
        self.threeBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 + 2;
        CheckoutRoomObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 2];
            _infoThree.hidden = YES;
        [self.threeBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romThre  %ld",indexPath.row* 3+2);
        self.threeBt.hidden = NO;
        [self.threeBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];

    } else {
        self.threeHouseView.hidden = YES;
    }

}

- (void)setCellContentDataRoomsWithFloors:(CheckoutToRoomsByFloorArrObj *)array withRow:(NSIndexPath *)indexPath
{
    self.indexPath = indexPath;
    
    NSLog(@"array Count %@ %d %d",array,indexPath.section,indexPath.row);
    if (indexPath.row * 3 < array.rooms.count) {
        CheckoutToRoomsByTimeObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3];
        [self.oneBt setTitle:obj.number forState:UIControlStateNormal];
        self.oneBt.tag = (indexPath.section +1)* 10000 + indexPath.row *3;
        NSLog(@"romt one %ld",indexPath.row*3);
        self.oneBt.hidden = NO;
        _infoOne.hidden = YES;
     
        if (obj.overTime == RMTOverTimeYES) {
            [self.oneBt setTitleColor:[UIColor colorWithHex:KYellowFontColorStr] forState:UIControlStateNormal];
        } else {
            [self.oneBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];
        }
    } else {
        self.oneHouseVIew.hidden = YES;
    }
    if (indexPath.row * 3+1 < array.rooms.count) {
        self.twoBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 +1;
        CheckoutToRoomsByTimeObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 1];
        //        if (obj.isInit != RMTIsInitNot) {
        _infoTwo.hidden = YES;
        if (obj.overTime == RMTOverTimeYES) {
            [self.twoBt setTitleColor:[UIColor colorWithHex:KYellowFontColorStr] forState:UIControlStateNormal];
        } else {
            [self.twoBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];
        }
        [self.twoBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romTow  %ld",indexPath.row *3+1);
        self.twoBt.hidden = NO;
    } else {
        self.twoHouseView.hidden = YES;
    }
    if (indexPath.row * 3+2 < array.rooms.count) {
        self.threeBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 + 2;
        CheckoutToRoomsByTimeObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 2];
        //        if (obj.isInit != RMTIsInitNot) {
        _infoThree.hidden = YES;
        if (obj.overTime == RMTOverTimeYES) {
            [self.threeBt setTitleColor:[UIColor colorWithHex:KYellowFontColorStr] forState:UIControlStateNormal];
        } else {
            [self.threeBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];
        }
        [self.threeBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romThre  %ld",indexPath.row* 3+2);
        self.threeBt.hidden = NO;
    } else {
        self.threeHouseView.hidden = YES;
    }

}

- (void)setCellContentDataRoomsWithTime:(CheckoutToRoomsByTimeArrObj *)array withRow:(NSIndexPath *)indexPath
{
    self.indexPath = indexPath;
    
    NSLog(@"array Count %@ %d %d",array,indexPath.section,indexPath.row);
    if (indexPath.row * 3 < array.rooms.count) {
        CheckoutToRoomsByTimeObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3];
        [self.oneBt setTitle:obj.number forState:UIControlStateNormal];
        self.oneBt.tag = (indexPath.section +1)* 10000 + indexPath.row *3;
        NSLog(@"romt one %ld",indexPath.row*3);
        self.oneBt.hidden = NO;
        _infoOne.hidden = YES;
        
        if (obj.overTime == RMTOverTimeYES) {
            [self.oneBt setTitleColor:[UIColor colorWithHex:KYellowFontColorStr] forState:UIControlStateNormal];
        } else {
            [self.oneBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];
        }
    } else {
        self.oneHouseVIew.hidden = YES;
    }
    if (indexPath.row * 3+1 < array.rooms.count) {
        self.twoBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 +1;
        CheckoutToRoomsByTimeObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 1];
        //        if (obj.isInit != RMTIsInitNot) {
        _infoTwo.hidden = YES;
        if (obj.overTime == RMTOverTimeYES) {
            [self.twoBt setTitleColor:[UIColor colorWithHex:KYellowFontColorStr] forState:UIControlStateNormal];
        } else {
            [self.twoBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];
        }
        [self.twoBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romTow  %ld",indexPath.row *3+1);
        self.twoBt.hidden = NO;
    } else {
        self.twoHouseView.hidden = YES;
    }
    if (indexPath.row * 3+2 < array.rooms.count) {
        self.threeBt.tag = (indexPath.section +1) * 10000 + indexPath.row *3 + 2;
        CheckoutToRoomsByTimeObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 2];
        //        if (obj.isInit != RMTIsInitNot) {
        _infoThree.hidden = YES;
        if (obj.overTime == RMTOverTimeYES) {
            [self.threeBt setTitleColor:[UIColor colorWithHex:KYellowFontColorStr] forState:UIControlStateNormal];
        } else {
            [self.threeBt setTitleColor:[UIColor colorWithHex:kTitleColorStr] forState:UIControlStateNormal];
        }
        [self.threeBt setTitle:obj.number forState:UIControlStateNormal];
        NSLog(@"romThre  %ld",indexPath.row* 3+2);
        self.threeBt.hidden = NO;
    } else {
        self.threeHouseView.hidden = YES;
    }

}


- (IBAction)houseConfigClick:(id)sender {
    
    UIButton *bt = (UIButton*)sender;
    NSLog(@"inde %d %d",_indexPath.row,_indexPath.section);
    int index = 0;
    if (bt == _oneBt) {
        index = (int)_indexPath.row * 3;
    }
    
    if (bt == _twoBt) {
        index = (int)_indexPath.row * 3 + 1;
    }
    
    if (bt == _threeBt) {
        index = (int)_indexPath.row * 3 + 2;
    }
    
    
    
    NSLog(@"bt tag %ld",bt.tag);
    if (_delegate && [_delegate respondsToSelector:@selector(configRoomDataWithSection:andIndex:)]) {
        [_delegate configRoomDataWithSection:(int)_indexPath.section andIndex:index];
    }
}

@end
