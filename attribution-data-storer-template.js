/*
Built by Daniel Perry-Reed @ Kickflip Analytics
https://kickflipanalytics.com/
v1.0 - https://github.com/dpezrez/gtm-attribution-data-storer/
*/

var log = require('logToConsole');
var getQueryParam = require('getQueryParameters');
var setCookie = require('setCookie');
var getCookieValues = require('getCookieValues');
var JSON = require('JSON');
var localStorage = require('localStorage');
var createQueue = require('createQueue');
var getReferrerUrl = require('getReferrerUrl');
var getType = require('getType');
var getUrl = require('getUrl');
var getTimestamp = require('getTimestamp');

// --- Configuration ---
var cookieDomain = data.cookieDomain || 'auto';
var cookieName = data.cookieName || 'attr_data';
var cookieHours = data.cookieHours * 1 || 720;
var logToConsole = data.logMessages === true;
var enableLocalStorage = data.enableLocalStorage === true;
var pushToDataLayer = data.pushToDataLayer === true;
var dataLayerEventName = data.dataLayerEventName || 'gtm_attr';
var ignoreSelfReferrals = data.ignoreSelfReferrals === true;
var storePreviousValues = data.storePreviousValues === true;
var localStorageKey = 'attr_data'; // Fixed key for GTM permissions

var extraClickIds = data.extraClickIds ? data.extraClickIds.split(',').map(function (id) { return id.trim(); }) : [];
var maxAge = cookieHours * 60 * 60;
var dataLayerPush = createQueue('dataLayer');

var didSyncPush = false;
var didUpdate = false;

// --- Sync cookie and localStorage ---
var existingCookie = getCookieValues(cookieName)[0];
var existingLocalStorage = localStorage.getItem(localStorageKey); // Use fixed key
if (!existingCookie && existingLocalStorage) {
  setCookie(cookieName, existingLocalStorage, { domain: cookieDomain, path: '/', 'max-age': maxAge }, false);
  if (logToConsole) log('🔄 Synced from localStorage to cookie:', existingLocalStorage);
  if (pushToDataLayer) {
    var parsedDlSource = JSON.parse(existingLocalStorage);
    var dlData = { event: dataLayerEventName };
    for (var key in parsedDlSource) {
        dlData[key] = parsedDlSource[key];
    }
    dataLayerPush(dlData);
    didSyncPush = true;
    if (logToConsole) log('📤 dataLayer push after sync from localStorage:', dlData);
  }
} else if (!existingLocalStorage && existingCookie && enableLocalStorage) {
  localStorage.setItem(localStorageKey, existingCookie); // Use fixed key
  if (logToConsole) log('🔄 Synced from cookie to localStorage:', existingCookie);
}

// --- Load existing attribution data ---
var currentAttr = {};
if (existingCookie) {
  var parsed = JSON.parse(existingCookie);
  if (parsed && getType(parsed) === 'object') currentAttr = parsed;
}

// --- Helper Functions for ISO Timestamp ---

// Helper: Pad numbers to 2 digits
function pad(n) {
  if (n < 10) {
    return '0' + n;
  }
  return '' + n;
}

// Helper: Check if year is leap year
function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

// Generate ISO 8601 UTC date string from timestamp
function formatIso8601(timestamp) {
  // Use bitwise OR `| 0` as a sandbox-safe replacement for Math.floor()
  var totalSeconds = (timestamp / 1000) | 0;
  var millis = timestamp % 1000;
  var daysSinceEpoch = (totalSeconds / 86400) | 0;
  var secondsInDay = totalSeconds % 86400;
  var year = 1970;
  var dayCounter = daysSinceEpoch;
  var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  while (true) {
    var daysInYear = isLeap(year) ? 366 : 365;
    if (dayCounter < daysInYear) {
      break;
    }
    dayCounter = dayCounter - daysInYear;
    year = year + 1;
  }

  if (isLeap(year)) {
    monthDays[1] = 29;
  }

  var month = 0;
  while (dayCounter >= monthDays[month]) {
    dayCounter = dayCounter - monthDays[month];
    month = month + 1;
  }

  var day = dayCounter + 1;
  var hours = (secondsInDay / 3600) | 0;
  var minutes = ((secondsInDay % 3600) / 60) | 0;
  var seconds = secondsInDay % 60;
  var millisStr = '' + millis;
  while (millisStr.length < 3) {
    millisStr = '0' + millisStr;
  }

  return (
    year + '-' +
    pad(month + 1) + '-' +
    pad(day) + 'T' +
    pad(hours) + ':' +
    pad(minutes) + ':' +
    pad(seconds) + '.' +
    millisStr + 'Z'
  );
}


// --- Core Logic ---

// Define all parameters we want to track
var paramsToTrack = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
  'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic',
  'gclid', 'fbclid', 'msclkid'
].concat(extraClickIds);

var hasNewUrlParams = false;
paramsToTrack.forEach(function(param) {
    if (getQueryParam(param)) {
        hasNewUrlParams = true;
    }
});

// Only proceed if there are new attribution parameters in the URL
if (hasNewUrlParams) {
  var ignoreUpdate = false;
  // If the option is enabled, check the referrer
  if (ignoreSelfReferrals) {
    var pageHost = getUrl('host') || '';
    var referrerHost = getReferrerUrl('host') || '';

    // Check if referrer is blank or the same host as the current page
    if (referrerHost === '' || (pageHost !== '' && pageHost === referrerHost)) {
      ignoreUpdate = true;
      if (logToConsole) log('ℹ️ Ignoring update due to blank or self-referral.');
    }
  }

  // If we are not ignoring the update, process the parameters
  if (!ignoreUpdate) {
    var captureMetadata = {
      datetime: formatIso8601(getTimestamp()),
      location: getUrl() || '',
      referrer: getReferrerUrl() || ''
    };

    paramsToTrack.forEach(function(param) {
      var newValue = getQueryParam(param);
      if (!newValue) return;

      var existingParam = currentAttr[param];
      var newCount = (existingParam && existingParam.count ? existingParam.count : 0) + 1;
      
      var newParamData = {
        value: newValue,
        count: newCount,
        datetime: captureMetadata.datetime,
        location: captureMetadata.location,
        referrer: captureMetadata.referrer
      };

      if (storePreviousValues) {
        var previousValues = (existingParam && existingParam.previous_values) ? existingParam.previous_values.slice(0) : [];
        if (existingParam && existingParam.value !== newValue) {
          previousValues.unshift(existingParam.value);
        }
        newParamData.previous_values = previousValues.slice(0, 5);
      }

      currentAttr[param] = newParamData;

      if (logToConsole) log('📝 Set/updated ' + param + '. New count: ' + newCount);
      didUpdate = true;
    });
  }
} else {
    if (logToConsole) log('ℹ️ No new attribution parameters found in URL.');
}


// --- Final Processing and Storage ---

var storageValue = JSON.stringify(currentAttr);
var hasData = false;
for (var k in currentAttr) { hasData = true; break; }

if (hasData && didUpdate) {
  setCookie(cookieName, storageValue, { domain: cookieDomain, path: '/', 'max-age': maxAge }, false);
  if (logToConsole) log('🍪 Cookie updated:', cookieName, storageValue);
  if (enableLocalStorage) {
    localStorage.setItem(localStorageKey, storageValue); // Use fixed key
    if (logToConsole) log('📦 localStorage updated: ' + localStorageKey, storageValue);
  }
}

if (pushToDataLayer && !didSyncPush && (hasData || existingLocalStorage)) {
  var dlSource = hasData ? storageValue : existingLocalStorage;
  var parsedDlSource = JSON.parse(dlSource);
  var dlData = { event: dataLayerEventName };
  for (var key in parsedDlSource) {
      dlData[key] = parsedDlSource[key];
  }
  dataLayerPush(dlData);
  if (logToConsole) log('📤 dataLayer push with final JSON:', dlData);
}

data.gtmOnSuccess();
