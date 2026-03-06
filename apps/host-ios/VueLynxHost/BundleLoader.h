#import <Foundation/Foundation.h>

@interface BundleLoader : NSObject

+ (NSData *)loadBundleData;
+ (NSString *)bundleURL;

@end
