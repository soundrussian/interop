const GLOBAL_NAME = "AsgInterop";

export function installInterop(targetWindow = window, targetDocument = document) {
  const currentUrl = targetWindow.location.href;
  const referrer = targetDocument.referrer;
  const interop = targetWindow[GLOBAL_NAME] || (targetWindow[GLOBAL_NAME] = {});

  interop.getCurrentUrl = () => currentUrl;
  interop.getReferrer = () => referrer;

  return interop;
}
