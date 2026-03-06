#import "MainViewController.h"
#import "BundleLoader.h"
#import <Lynx/LynxView.h>

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.title = @"VueLynx Host";
    self.view.backgroundColor = [UIColor systemBackgroundColor];

    LynxView *lynxView = [[LynxView alloc] initWithBuilderBlock:^(LynxViewBuilder *builder) {
        builder.screenSize = self.view.bounds.size;
        builder.fontScale = 1.0;
    }];
    lynxView.frame = self.view.bounds;
    lynxView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.view addSubview:lynxView];

    NSData *bundleData = [BundleLoader loadBundleData];
    if (bundleData == nil) {
        UILabel *label = [[UILabel alloc] initWithFrame:self.view.bounds];
        label.text = @"Bundle not found. Set PGG_LYNX_BUNDLE_URL or embed main.lynx.bundle.";
        label.numberOfLines = 0;
        label.textAlignment = NSTextAlignmentCenter;
        label.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        [self.view addSubview:label];
        return;
    }

    [lynxView loadTemplate:bundleData withURL:[BundleLoader bundleURL]];
}

@end
