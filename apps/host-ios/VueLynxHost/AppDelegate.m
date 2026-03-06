#import "AppDelegate.h"
#import "MainViewController.h"
#import <Lynx/LynxEnv.h>
#import <Lynx/LynxService.h>
#import <Lynx/LynxServiceDevToolProtocol.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    LynxEnv *lynxEnv = [LynxEnv sharedInstance];
    lynxEnv.lynxDebugEnabled = YES;
    lynxEnv.devtoolEnabled = YES;
    lynxEnv.logBoxEnabled = YES;
    [LynxService(LynxServiceDevToolProtocol) setLogBoxPresetValue:YES];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    MainViewController *mainViewController = [[MainViewController alloc] init];
    UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:mainViewController];
    self.window.rootViewController = navigationController;
    [self.window makeKeyAndVisible];

    return YES;
}

@end
