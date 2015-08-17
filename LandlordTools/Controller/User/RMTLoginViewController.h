//
//  RMTLoginViewController.h
//  RemoteControl
//
//  Created by vagrant on 4/2/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import <UIKit/UIKit.h>
//#import "RMTUserLogic.h"
#import "RESideMenu.h"
extern NSString * const RMTLoginFinishedNotification;

@interface RMTLoginViewController : UIViewController

@property (nonatomic, weak) id  bridge;

//@property (nonatomic, weak) id <LoginFininshedDelegate> delegate;

@end
