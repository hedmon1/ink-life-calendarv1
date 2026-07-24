/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'Year Progress',
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
