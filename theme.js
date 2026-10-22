// Light/dark toggle. Loaded in <head> so a saved choice applies before the page paints (no flash).
// With no saved choice the site follows the visitor's system setting.
(function () {
  var KEY = "theme";
  var root = document.documentElement;
  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked: follow the system */ }
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function current() {
    return root.getAttribute("data-theme") || (systemDark && systemDark.matches ? "dark" : "light");
  }

  function sync(button) {
    var next = current() === "dark" ? "light" : "dark";
    button.setAttribute("data-current", current());
    button.setAttribute("aria-label", "Switch to " + next + " mode");
    button.setAttribute("title", "Switch to " + next + " mode");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;
    sync(button);
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* choice just won't persist */ }
      sync(button);
    });
    if (systemDark && systemDark.addEventListener) {
      systemDark.addEventListener("change", function () { sync(button); });
    }
  });
})();
