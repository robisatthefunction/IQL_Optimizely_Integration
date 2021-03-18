window.optlyHelper = (function () {
  return {
    v: "1.26",
    logEnabled: false,
    helperLog: function (msg) {
      if (this.logEnabled) {
        console.log("OPTLY HELPER (v" + this.v + ") ---- " + msg);
      }
    },
    getCookieValue: function (a) {
      var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
      return b ? b.pop() : '';
    },
    setCookieValue: function (cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";domain=.{YOUR_DOMAIN}.com;path=/";
    },
    activeExperiments: {}
  };
})();

// Module to save all Experiment Information, also from redirect cookie
window.optlyHelper.getExperimentInfo = (function () {
  var activeExperiments,
    redirectCookie,
    redirectVariables;
  function _getCookieValue(a) {
    var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }
  function _getQueryVariable(cookieValue) {
    var query = {};
    var pairs = (cookieValue[0] === '?' ? cookieValue.substr(1) : cookieValue).split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
  }
  function _writeRedirectInfo(r) {
    optlyHelper.redirectInfo = r;
  }
  function init() {
    optlyHelper.helperLog("ADDING EXPERIMENT INFORMATION TO STATE OBJECT");
    activeExperiments = window.optimizelyEdge.get('state').getActiveExperiments();
    redirectCookie = _getCookieValue("optimizelyRedirectData");
    // Init redirect object
    // optlyHelper.redirectInfo = {};
    if (redirectCookie.length > 0) {
      optlyHelper.helperLog("GOT REDIRECT COOKIE VALUE");
      redirectVariables = _getQueryVariable(redirectCookie);
      if (redirectVariables.hasOwnProperty('r')) {
        _writeRedirectInfo(redirectVariables);
      }
      // Override Referrer of Page
      if (redirectVariables.hasOwnProperty('r') && redirectVariables.r.length > 0) {
        Object.defineProperty(document, "referrer", { get: function () { return redirectVariables.r; } });
      }
      activeExperiments[redirectVariables.x] = {
        'id': redirectVariables.x,
        'variation': {
          'id': redirectVariables.v
        }
      };
      optlyHelper.helperLog("Added redirect cookie information to active experiments");
    }
    optlyHelper.activeExperiments = activeExperiments;
  }
  return {
    init: init
  };
})();


window.optlyHelper.IQLIntegration = (function () {
  var allActiveExperiments;

  function _getDecisionString(experimentInfo) {
    if (!!experimentInfo && window.location.hostname != "employers.indeed.com") {
    var baseUrl = "/cmsapi/logging/optimizely";
    var logUrl = baseUrl + '?a=thJsv';

    console.log('experiment_id', experimentInfo.id,'variationName', experimentInfo.variation.name)

    logUrl += '&optExpIds=' + encodeURIComponent(experimentInfo.id);
    logUrl += '&optVarNames=' + encodeURIComponent(experimentInfo.variation.name) + '_snippetLogging';
    optlyHelper.helperLog("Sending decision event to IQL");
    console.log(logUrl);
    (new Image()).src = logUrl;
  }
}


  function init() {
    optlyHelper.helperLog("IQL INTEGRATION START");
      allActiveExperiments = optlyHelper.activeExperiments;

      for (var exp in allActiveExperiments) {
        if (allActiveExperiments.hasOwnProperty(exp)) {
          var experimentInfo = allActiveExperiments[exp];

          // Manage sending IQL event
          _getDecisionString(experimentInfo);
        }
     }
  }
  return {
    init: init,
  };
})();
window.optlyHelper.getExperimentInfo.init();
window.optlyHelper.IQLIntegration.init();
