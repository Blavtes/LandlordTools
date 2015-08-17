//
//  RMTUtilityReport.m
//  RMTUtility
//
//  Created by vagrant on 15-3-2.
//  Copyright (c) 2015年 runmit.com. All rights reserved.
//

#import <UIKit/UIScreen.h>
#import <UIKit/UIApplication.h>
#import "RMTUtilityReport.h"
#import "RMTURLSession.h"
#import "RMTUtilityBaseInfo.h"

#define RMT_REPORT_BASE_URL @"http://www.baidu.com"

@interface RMTUtilityReport()
{
    NSInteger _hb;       //延时上报间隔，单位为秒，每次启动时从服务器获取
    NSInteger _phb;      //播放心跳检测间隔，单位为秒，每次启动时从服务器获取
    NSInteger _limit;    //一次批量上报的最大事件数量，默认200
    
    NSString *_sessionID;
    NSDictionary *_reportDataDic;
    NSTimer *_reportTimer;
}

@end

@implementation RMTUtilityReport

- (id)initSingle
{
    self = [super init];
    if (self) {
        //init
    }
    return self;
}

- (id)init
{
    return [RMTUtilityReport sharedInstance];
}

+ (instancetype)sharedInstance
{
    static id instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] initSingle];
    });
    return instance;
}

- (void)initReport
{
    _sessionID = [[NSUUID UUID] UUIDString];
    [self restoreConfig];
    [self getOnlineConfig];
    
    _reportDataDic = [NSDictionary dictionaryWithObjectsAndKeys:
                      [NSMutableArray arrayWithCapacity:2], @"startups",
                      [NSMutableArray arrayWithCapacity:2], @"playinits",
                      [NSMutableArray arrayWithCapacity:8], @"playstarts",
                      [NSMutableArray arrayWithCapacity:8], @"playtimes",
                      [NSMutableArray arrayWithCapacity:8], @"playblocks",
                      [NSMutableArray arrayWithCapacity:8], @"playseeks",
                      [NSMutableArray arrayWithCapacity:8], @"clicks",
                      [NSMutableArray arrayWithCapacity:2], @"opendurs",
                      [NSMutableArray arrayWithCapacity:8], @"downloads",
                      [NSMutableArray arrayWithCapacity:8], @"errors",
                      nil];
    
    [self startReportTimer];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appDidEnterBackground)
                                                 name:UIApplicationDidEnterBackgroundNotification
                                               object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appDidBecomeActive)
                                                 name:UIApplicationDidBecomeActiveNotification
                                               object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appWillTerminate)
                                                 name:UIApplicationWillTerminateNotification
                                               object:nil];
}

#pragma mark - notification
- (void)appDidEnterBackground
{
    [self stopReportTimer];
    [self doReport];
}

- (void)appDidBecomeActive
{
    _sessionID = [[NSUUID UUID] UUIDString];
    [self startReportTimer];
}

- (void)appWillTerminate
{
    [self stopReportTimer];
    [self doReport];
}

#pragma mark - config

- (void)restoreConfig
{
    NSNumber *hbObject = [[NSUserDefaults standardUserDefaults] objectForKey:@"RMTReport_hb"];
    if (hbObject != nil) {
        _hb = [hbObject integerValue];
    }
    else {
        _hb = 180;
    }
    
    NSNumber *phbObject = [[NSUserDefaults standardUserDefaults] objectForKey:@"RMTReport_phb"];
    if (phbObject != nil) {
        _phb = [phbObject integerValue];
    }
    else {
        _phb = 180;
    }
    
    NSNumber *limitObject = [[NSUserDefaults standardUserDefaults] objectForKey:@"RMTReport_limit"];
    if (phbObject != nil) {
        _limit = [limitObject integerValue];
    }
    else {
        _limit = 100;
    }
}

- (NSDictionary *)getBaseInfoDic
{
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:10];
    [dic setObject:@(1.0) forKey:@"sv"];
    [dic setObject:@(1.0) forKey:@"sdv"];
    [dic setObject:@(0) forKey:@"hwid"];
    [dic setObject:@(1.0) forKey:@"udid"];
    [dic setObject:@"" forKey:@"wifimac"];
    [dic setObject:@"" forKey:@"wirelesssmac"];
    
    [dic setObject:@"" forKey:@"wiremac"];
    [dic setObject:@(2) forKey:@"os"];
    [dic setObject:[[RMTUtilityBaseInfo sharedInstance] systemVersion] forKey:@"osver"];
    [dic setObject:@(2) forKey:@"device"];
    [dic setObject:[[RMTUtilityBaseInfo sharedInstance] currentLocale] forKey:@"area"];
    [dic setObject:[[RMTUtilityBaseInfo sharedInstance] currentLanguage] forKey:@"language"];
    [dic setObject:@"" forKey:@"imei"];
    [dic setObject:[[RMTUtilityBaseInfo sharedInstance] IDFVString] forKey:@"idfv"];
    [dic setObject:[[RMTUtilityBaseInfo sharedInstance] appBundleID] forKey:@"appkey"];
    [dic setObject:[[RMTUtilityBaseInfo sharedInstance] appVersion] forKey:@"appver"];
    [dic setObject:@"" forKey:@"uid"];
    [dic setObject:@"" forKey:@"devicebrand"];
    [dic setObject:@"" forKey:@"devicedevice"];
    [dic setObject:@"" forKey:@"devicemodel"];
    [dic setObject:@"" forKey:@"devicehardware"];
    [dic setObject:@"" forKey:@"deviceid"];
    [dic setObject:@"" forKey:@"deviceserial"];
    
    UIScreen *MainScreen = [UIScreen mainScreen];
    CGSize size = [MainScreen bounds].size;
    [dic setObject:[NSString stringWithFormat:@"%d_%d", (int)size.width, (int)size.height] forKey:@"ro"];
    [dic setObject:@"0" forKey:@"channel"];
    [dic setObject:@([self getCurrentTime]) forKey:@"dts"];
    return [NSDictionary dictionaryWithDictionary:dic];
}

- (void)getOnlineConfig
{
    NSDictionary *dic = [self getBaseInfoDic];
    NSString *url = [NSString stringWithFormat:@"%@/log/config", RMT_REPORT_BASE_URL];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url parameters:dic customHTTPHeaderFields:nil completionHandler:^(NSError *error, NSDictionary *dic) {
        if (!error) {
            _hb = [[dic objectForKey:@"hb"] integerValue];
            _phb = [[dic objectForKey:@"phb"] integerValue];
            _limit = [[dic objectForKey:@"limit"] integerValue];
            [self saveConfig];
        }
    }];
}

- (void)saveConfig
{
    [[NSUserDefaults standardUserDefaults] setObject:@(_hb) forKey:@"RMTReport_hb"];
    [[NSUserDefaults standardUserDefaults] setObject:@(_phb) forKey:@"RMTReport_phb"];
    [[NSUserDefaults standardUserDefaults] setObject:@(_limit) forKey:@"RMTReport_limit"];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

#pragma mark - config

- (void)startReportTimer
{
    _reportTimer = [NSTimer scheduledTimerWithTimeInterval:_hb
                                                    target:self
                                                  selector:@selector(doReport)
                                                  userInfo:nil
                                                   repeats:YES];
}

- (void)stopReportTimer
{
    [_reportTimer invalidate];
    _reportTimer = nil;
}

- (void)doReport
{
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:[self getBaseInfoDic]];
    NSInteger sum = 0;
    NSArray *keyArray = [_reportDataDic allKeys];
    for(NSString *keyString in keyArray) {
        NSMutableArray *array = [_reportDataDic objectForKey:keyString];
        if (array == nil) {
            continue;
        }
        if (sum + array.count <= _limit) {
            NSArray *sendArray = [array copy];
            [dic setObject:sendArray forKey:keyString];
            [array removeAllObjects];
            sum += sendArray.count;
            if (sum >= _limit) {
                break;
            }
        }
        else {
            NSMutableArray *sendArray = [NSMutableArray arrayWithCapacity:_limit - sum];
            for (NSObject *obj in array) {
                [sendArray addObject:obj];
                [array removeObject:obj];
                sum ++;
                if (sum >= _limit) {
                    break;
                }
            }
            [dic setObject:sendArray forKey:keyString];
        }
    }
    
    NSString *url = [NSString stringWithFormat:@"%@/log/config", RMT_REPORT_BASE_URL];
    [[RMTURLSession sharedInstance] requestApiWithUrl:url parameters:dic customHTTPHeaderFields:nil completionHandler:^(NSError *error, NSDictionary *dic) {
        if (error) {
            NSLog(@"error");
            
            NSArray *keyArray = [_reportDataDic allKeys];
            for(NSString *keyString in keyArray) {
                NSArray *sendArray = [dic objectForKey:keyString];
                if (sendArray == nil) {
                    continue;
                }
                NSMutableArray *array = [_reportDataDic objectForKey:keyString];
                [array addObjectsFromArray:sendArray];
            }
        }
    }];
}


#pragma mark - record

- (void)reportStartUp
{
    NSDictionary *dic = @{@"sid": _sessionID, @"dts": @([self getCurrentTime]), @"seq": [[NSUUID UUID] UUIDString], @"nt": @([self getNetworkType])};
    NSMutableArray *array = [_reportDataDic objectForKey:@"startups"];
    [array addObject:dic];
}

- (void)reportPlayInit:(NSString*)upid
                online:(NSInteger)online
                   vid:(NSInteger)vid
                   vnm:(NSString*)vnm
                   crt:(NSInteger)crt
                   uta:(NSInteger)uta
                   utb:(NSInteger)utb
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"upid": upid,
                          @"online": @(online),
                          @"vid": @(vid),
                          @"vnm": vnm,
                          @"crt": @(crt),
                          @"uta": @(uta),
                          @"utb": @(utb)
                          };
    
    NSMutableArray *array = [_reportDataDic objectForKey:@"playinits"];
    [array addObject:dic];
}

- (void)reportPlayStart:(NSString*)upid
                 online:(NSInteger)online
                    vid:(NSInteger)vid
                    vnm:(NSString*)vnm
                    crt:(NSInteger)crt
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"upid": upid,
                          @"online": @(online),
                          @"vid": @(vid),
                          @"vnm": vnm,
                          @"crt": @(crt)
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"playstarts"];
    [array addObject:dic];
}

- (void)reportPlayTime:(NSString*)upid
                online:(NSInteger)online
                   vid:(NSInteger)vid
                   vnm:(NSString*)vnm
                   crt:(NSInteger)crt
                   dur:(NSInteger)dur
                 speed:(NSInteger)speed
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"upid": upid,
                          @"online": @(online),
                          @"vid": @(vid),
                          @"vnm": vnm,
                          @"crt": @(crt),
                          @"dur": @(dur),
                          @"speed": @(speed)
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"playtimes"];
    [array addObject:dic];
}

- (void)reportPlayBlock:(NSString*)upid
                 online:(NSInteger)online
                    vid:(NSInteger)vid
                    vnm:(NSString*)vnm
                    crt:(NSInteger)crt
                    dur:(NSInteger)dur
                 reason:(NSInteger)reason
                   flag:(NSInteger)flag
                  speed:(NSInteger)speed
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"upid": upid,
                          @"online": @(online),
                          @"vid": @(vid),
                          @"vnm": vnm,
                          @"crt": @(crt),
                          @"dur": @(dur),
                          @"reason": @(reason),
                          @"flag": @(flag),
                          @"speed": @(speed)
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"playblocks"];
    [array addObject:dic];
}

- (void)reportPlaySeek:(NSString*)upid
                online:(NSInteger)online
                   vid:(NSInteger)vid
                   vnm:(NSString*)vnm
                   crt:(NSInteger)crt
                  drt:(NSInteger)drt
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"upid": upid,
                          @"online": @(online),
                          @"vid": @(vid),
                          @"vnm": vnm,
                          @"crt": @(crt),
                          @"drt": @(drt)
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"playseeks"];
    [array addObject:dic];
}

- (void)reportClick:(NSString *)objid
                objtype:(NSInteger)objtype
                   objname:(NSString *)objname
                   memo:(NSString *)memo
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"objid": objid,
                          @"objtype": @(objtype),
                          @"objname": objname,
                          @"memo": memo
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"clicks"];
    [array addObject:dic];
}

- (void)reportOpenDuration:(NSInteger)dur
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"dur": @(dur)
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"opendurs"];
    [array addObject:dic];
    
}

- (void)reportDownload:(NSInteger)vid
                   vnm:(NSString*)vnm
                   crt:(NSInteger)crt
{
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"vid": @(vid),
                          @"vnm": vnm,
                          @"crt": @(crt)
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"downloads"];
    [array addObject:dic];
}

- (void)reportError:(NSInteger)moduleId
           actionId:(NSInteger)actionId
                err:(NSInteger)errc
{
    NSInteger evtc=moduleId*100+actionId;
    NSDictionary *dic = @{@"sid": _sessionID,
                          @"dts": @([self getCurrentTime]),
                          @"seq": [[NSUUID UUID] UUIDString],
                          @"nt": @([self getNetworkType]),
                          @"evtc": @(evtc),
                          @"errc": @(errc)
                          };
    NSMutableArray *array = [_reportDataDic objectForKey:@"errors"];
    [array addObject:dic];
}



#pragma mark - other

- (NSInteger)getCurrentTime
{
    NSTimeInterval now = [NSDate date].timeIntervalSince1970;
    return now;
}

- (NSInteger)getNetworkType
{
    return 1;
}

@end

