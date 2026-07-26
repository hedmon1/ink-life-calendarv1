/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  // Xcode target name — must contain no spaces and must match `targetName` in
  // app.json's extra.eas.build.experimental.ios.appExtensions, or EAS can't
  // attach the widget's provisioning profile ("Configure Xcode project" fails).
  name: 'YearProgress',
  // what the user actually sees in the widget gallery
  displayName: 'Ink — Life in Weeks',
  // pinned so it always matches the registered identifier + credentials
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  entitlements: {
    // shared with the app so the widget can read the birth year
    'com.apple.security.application-groups': ['group.com.ink.lifecalendar'],
  },
  colors: {
    $accent: '#e8b84b',
    $widgetBackground: '#08090a',
  },
};
