import i18nTexts from "./i18n.js";


const addCss = (url, id) => {
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.href = url;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.id = id;
    document.getElementsByTagName("head")[0].appendChild(link);
  }
}

const addScript = (url, id) => {
  if (!document.getElementById(id)) {
    const script = document.createElement("script");
    script.src = url;
    script.id = id;
    document.getElementsByTagName("head")[0].appendChild(script);
  }
}

const addScriptPromise = (url, id) => {
  return new Promise((resolve, reject) => {
    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.src = url;
      script.id = id;
      script.onload = resolve;
      script.onerror = reject;
      document.getElementsByTagName("head")[0].appendChild(script);
    } else {
      resolve();
    }
  });
}

const removeCss = (id) => {
  const elem = document.getElementById(id);
  if (elem) {
    elem.parentNode.removeChild(elem);
  }
}

const removeScript = (id) => {
  const elem = document.getElementById(id);
  if (elem) {
    elem.parentNode.removeChild(elem);
  }
}

const i18n = () => {
  const href = window.location.href.toString()
  const currentLang = href.indexOf("/es/") !== -1 ? "es" : ( href.indexOf("/en/") !== -1 ? "en" : ( href.indexOf("/fr/") !== -1 ? "fr" : "ca" ) )
  return i18nTexts[currentLang]
}

export  { addCss, addScript, removeCss, removeScript, addScriptPromise, i18n }