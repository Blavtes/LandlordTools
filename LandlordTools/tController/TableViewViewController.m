//
//  TableViewViewController.m
//  LandlordTools
//
//  Created by yong on 6/8/15.
//  Copyright (c) 2015年 yong. All rights reserved.
//

#import "TableViewViewController.h"
#import "TabTableViewCell.h"
@interface TableViewViewController ()
@property (nonatomic, strong) NSMutableArray *array;
@property (weak, nonatomic) IBOutlet UITableView *tableView;

@end

@implementation TableViewViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    UINib* nib1 = [UINib nibWithNibName:@"TabTableViewCell" bundle:[NSBundle mainBundle]];
    [_tableView registerNib:nib1 forCellReuseIdentifier:@"TabTableViewCell"];
    // Do any additional setup after loading the view from its nib.
    
    self.array = [NSMutableArray arrayWithCapacity:0];

    for (int i = 1; i < 10; i ++) {
         NSMutableArray *a = [NSMutableArray arrayWithCapacity:0];
        for (int j = 0; j <= 18; j++) {
            NSString *st = [NSString stringWithFormat:@"%d%2d",i,j];
            [a addObject:st];
        }
        [ self.array addObject:a];
        NSLog(@"%@",_array);
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return ((NSArray*)[ self.array objectAtIndex:section]).count / 3 + 1;
}


- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return [ self.array count];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return  60;
}

- (UITableViewCell*)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    __weak __typeof(self)weakSelf = self;
     UITableViewCell *tablece = [tableView dequeueReusableCellWithIdentifier:@"TabTableViewCell"];
    TabTableViewCell *tablecell =  (TabTableViewCell *)tablece;
//    if (indexPath.row * 3 +2> ((NSArray*)[weakSelf.array objectAtIndex:indexPath.section]).count) {
//           NSArray *nib = [[NSBundle mainBundle]loadNibNamed:@"TabTableViewCell" owner:self options:nil];
//                 for(id oneObject in nib){
//                         if([oneObject isKindOfClass:[TabTableViewCell class]]){
//                               tablecell = (TabTableViewCell *)oneObject;
//                             }
//                  }
//    }
    [tablecell setcontentData:(NSArray*)[weakSelf.array objectAtIndex:indexPath.section] withRow:indexPath];
    
    NSLog(@"index section %ld ,row %ld",indexPath.section,indexPath.row);
 
   


    return tablecell;
    
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
