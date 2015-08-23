//
//  AddRoomEditTableViewCell.m
//  LandlordTools
//
//  Created by yangyong on 8/20/15.
//  Copyright (c) 2015 yangyong. All rights reserved.
//

#import "AddRoomEditTableViewCell.h"
#import "AddBuildModleData.h"

@implementation AddRoomEditTableViewCell

- (void)awakeFromNib {
    // Initialization code
    _oneTextField.delegate = self;
    _twoTextField.delegate = self;
    _threeTextField.delegate = self;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}


- (void) setCellContentData:(FloorsByArrObj *)array withRow:(NSIndexPath*)indexPath
{//FloorsByArrObj
    self.indexPath = indexPath;
    _data = array;
    NSLog(@"array Count %@",array);
    if (indexPath.row * 3 < array.rooms.count) {
        RoomsByArrObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3];
        self.oneTextField.text = obj.number;
        self.oneTextField.tag = (indexPath.section +1)* 10000 + indexPath.row *3;
        NSLog(@"romt one %ld",indexPath.row*3);
        self.oneTextField.hidden = NO;
        
    } else {
        self.oneTextField.hidden = YES;
    }
    if (indexPath.row * 3+1 < array.rooms.count) {
        self.twoTextField.tag = (indexPath.section +1) * 10000 + indexPath.row *3 +1;
        RoomsByArrObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 1];

        self.twoTextField.text = obj.number;
        NSLog(@"romTow  %ld",indexPath.row *3+1);
        self.twoTextField.hidden = NO;
    } else {
        self.twoTextField.hidden = YES;
    }
    if (indexPath.row * 3+2 < array.rooms.count) {
        self.threeTextField.tag = (indexPath.section +1) * 10000 + indexPath.row *3 + 2;
        RoomsByArrObj *obj =  [array.rooms objectAtIndex:indexPath.row * 3 + 2];

        self.threeTextField.text = obj.number;
        NSLog(@"romThre  %ld",indexPath.row* 3+2);
        self.threeTextField.hidden = NO;
    } else {
        self.threeTextField.hidden = YES;
    }
    
    if (indexPath.row * 3 +2< array.rooms.count) {
        
        self.stepperView.hidden = YES;
        self.deletedBt.hidden = YES;
        self.lineLable.hidden = YES;
    } else {
        self.stepperView.tag = (indexPath.section +1) + 100;
        self.lineLable.hidden = NO;
        self.stepperView.hidden = NO;
        self.deletedBt.hidden = NO;
    }
}

- (IBAction)deleteRoomClick:(id)sender {
    if ([_delegate respondsToSelector:@selector(deletedRoomWithSection:)]) {
        [_delegate deletedRoomWithSection:(int)_indexPath.section];
    }
    
}

- (IBAction)addRoomClick:(id)sender {
    if ([_delegate respondsToSelector:@selector(addRoomWithSection:)]) {
        [_delegate addRoomWithSection:(int)_indexPath.section];
    }
}


- (IBAction)deletedBuildingsClick:(id)sender {
    if ([_delegate respondsToSelector:@selector(deletedBuildindsWithSection:)]) {
        [_delegate deletedBuildindsWithSection:(int)_indexPath.section];
    }
}

- (void)textFieldDidEndEditing:(UITextField *)textField
{
    int index = 0;
    if (_oneTextField == textField) {
        index = (int)_indexPath.row * 3;
    }
    
    if (_twoTextField == textField) {
        index = (int)_indexPath.row * 3 + 1;
    }
    
    if (_threeTextField == textField) {
        index = (int)_indexPath.row * 3 + 2;
    }
    
    UITextField *field = (UITextField*)textField;
    NSLog(@"_index path %ld",_indexPath.row);
//    int index = (int)_indexPath.row * 3 + (int)field.tag - 21;
    
    RoomsByArrObj *obj =  [_data.rooms objectAtIndex:index];
    obj.number = field.text;
    if ([_delegate respondsToSelector:@selector(reflashDataWithSection:andIndex:andData:)]) {
        [_delegate reflashDataWithSection:(int)_indexPath.section andIndex:index andData:obj];
    }
}

- (IBAction)editNumber:(id)sender {
//    UITextField *field = (UITextField*)sender;
//    int index = (int)_indexPath.row * 3 + (int)field.tag - 21;
//    
//    RoomsByArrObj *obj =  [_data.rooms objectAtIndex:index];
//    obj.number = field.text;
//    if ([_delegate respondsToSelector:@selector(reflashDataWithSection:andIndex:andData:)]) {
//        [_delegate reflashDataWithSection:(int)_indexPath.section andIndex:index andData:obj];
//    }
}


@end
