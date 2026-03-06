#import "BundleLoader.h"

@implementation BundleLoader

+ (NSString *)remoteBundleURL {
    NSString *override = NSProcessInfo.processInfo.environment[@"PGG_LYNX_BUNDLE_URL"];
    return override.length > 0 ? override : nil;
}

+ (NSData *)loadBundleData {
    NSString *remoteURL = [self remoteBundleURL];
    if (remoteURL.length > 0) {
        NSURL *url = [NSURL URLWithString:remoteURL];
        return url == nil ? nil : [NSData dataWithContentsOfURL:url];
    }

    NSString *bundlePath = [[NSBundle mainBundle] pathForResource:@"main" ofType:@"lynx.bundle"];
    return bundlePath == nil ? nil : [NSData dataWithContentsOfFile:bundlePath];
}

+ (NSString *)bundleURL {
    NSString *remoteURL = [self remoteBundleURL];
    return remoteURL.length > 0 ? remoteURL : @"app://main.lynx.bundle";
}

@end
