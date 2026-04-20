// src/runtime.js
var GLOBAL_NAME = "AsgInterop";
function installInterop(targetWindow = window, targetDocument = document) {
  const currentUrl = targetWindow.location.href;
  const referrer = targetDocument.referrer;
  const interop = targetWindow[GLOBAL_NAME] || (targetWindow[GLOBAL_NAME] = {});
  interop.getCurrentUrl = () => currentUrl;
  interop.getReferrer = () => referrer;
  return interop;
}

// src/index.js
installInterop();
export {
  installInterop
};
