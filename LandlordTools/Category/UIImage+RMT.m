//
//  UIImage+RMT.m
//  RemoteControl
//
//  Created by xbmac on 5/7/15.
//  Copyright (c) 2015 runmit.com. All rights reserved.
//

#import "UIImage+RMT.h"

@implementation UIImage (RMT)

+ (UIImage*)imageWithImage:(UIImage*)image scaledToSize:(CGSize)newSize {
    // Create a graphics image context
    UIGraphicsBeginImageContext(newSize);
    
    // Tell the old image to draw in this new context, with the desired
    // new size
    [image drawInRect:CGRectMake(0,0,newSize.width,newSize.height)];
    
    // Get the new image from the context
    UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
    
    // End the context
    UIGraphicsEndImageContext();
    
    // Return the new image.
    return newImage;
}

@end
