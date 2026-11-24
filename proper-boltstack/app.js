// Proper BoltStack page logic.
//
// FORMSPREE SETUP: create a form at formspree.io, copy its ID (the part after /f/ in
// https://formspree.io/f/XXXXXXXX) and paste it below. Until then the form stays switched off.
var FORMSPREE_FORM_ID = "";

(function () {
  var vibes = window.VIBES;
  var items = window.ACCOMPLISHMENTS;
  var byKey = {};
  vibes.forEach(function (v) { byKey[v.key] = v; });

  // Black washers need an outline to show on the dark background.
  function swatch(el, color) {
    el.style.background = color;
    if (color === "#1c1c1c") el.style.boxShadow = "inset 0 0 0 1px #6b7178";
  }

  // --- Hero rod: one washer per vibe, capstones taller ---
  var rod = document.getElementById("rod");
  var start = document.createElement("div"); start.className = "bar start"; rod.appendChild(start);
  vibes.forEach(function (v) {
    for (var i = 0; i < 3; i++) {
      var w = document.createElement("div");
      w.className = "washer" + (i === 2 && v.key !== "roots" && v.key !== "degenerate" ? " cap" : "");
      swatch(w, v.color);
      rod.appendChild(w);
    }
  });
  var nut = document.createElement("div"); nut.className = "nut"; rod.appendChild(nut);
  var end = document.createElement("div"); end.className = "bar end"; rod.appendChild(end);

  // --- Filter chips ---
  var active = "all";
  var chips = document.getElementById("chips");
  function addChip(key, label, color) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("aria-pressed", key === active ? "true" : "false");
    if (color) { var d = document.createElement("span"); d.className = "dot"; swatch(d, color); b.appendChild(d); }
    b.appendChild(document.createTextNode(label));
    b.addEventListener("click", function () {
      active = key;
      Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      render();
    });
    chips.appendChild(b);
  }
  addChip("all", "All vibes", null);
  vibes.forEach(function (v) { addChip(v.key, v.name, v.color); });

  // --- List ---
  var search = document.getElementById("search");
  var groups = document.getElementById("groups");
  var count = document.getElementById("count");
  search.addEventListener("input", render);

  function render() {
    var q = search.value.trim().toLowerCase();
    groups.innerHTML = "";
    var shown = 0;
    vibes.forEach(function (v) {
      if (active !== "all" && active !== v.key) return;
      var list = items.filter(function (it) {
        return it.vibe === v.key && (!q || (it.title + " " + it.proof + " " + it.n).toLowerCase().indexOf(q) !== -1);
      });
      if (!list.length) return;
      shown += list.length;

      var wrap = document.createElement("div"); wrap.className = "vibe";
      var head = document.createElement("div"); head.className = "vibe-head";
      var icon = document.createElement("span"); icon.className = "washer-icon"; swatch(icon, v.color);
      var h = document.createElement("h3"); h.textContent = v.name;
      head.appendChild(icon); head.appendChild(h); wrap.appendChild(head);
      var note = document.createElement("p"); note.className = "vibe-note"; note.textContent = v.note; wrap.appendChild(note);

      var ol = document.createElement("ol"); ol.className = "items";
      list.forEach(function (it) {
        var li = document.createElement("li");
        var num = document.createElement("span"); num.className = "num"; num.textContent = "#" + String(it.n).padStart(3, "0");
        var t = document.createElement("span"); t.className = "title"; t.textContent = it.title;
        if (it.capstone) {
          var cap = document.createElement("span"); cap.className = "cap-badge"; cap.textContent = "Capstone";
          cap.style.borderColor = v.color === "#1c1c1c" ? "#9aa0a6" : v.color;
          t.appendChild(cap);
        }
        var p = document.createElement("span"); p.className = "proof"; p.textContent = it.proof;
        li.appendChild(num); li.appendChild(t); li.appendChild(p);
        ol.appendChild(li);
      });
      wrap.appendChild(ol);
      groups.appendChild(wrap);
    });
    if (!shown) {
      var e = document.createElement("p"); e.className = "empty"; e.textContent = "Nothing matches that. Maybe it's one to propose.";
      groups.appendChild(e);
    }
    count.textContent = shown === items.length ? "Showing all " + shown + "." : "Showing " + shown + " of " + items.length + ".";
  }
  render();

  // --- Proposal form ---
  var form = document.getElementById("propose-form");
  var select = document.getElementById("vibe-select");
  var status = document.getElementById("form-status");
  var submit = form.querySelector("button.submit");

  var ph = document.createElement("option"); ph.value = ""; ph.textContent = "Pick one"; select.appendChild(ph);
  vibes.forEach(function (v) { var o = document.createElement("option"); o.value = v.name; o.textContent = v.name; select.appendChild(o); });
  var nv = document.createElement("option"); nv.value = "New vibe"; nv.textContent = "Doesn't fit any of these"; select.appendChild(nv);

  if (!FORMSPREE_FORM_ID) {
    document.getElementById("form-off").hidden = false;
    Array.prototype.forEach.call(form.elements, function (el) { el.disabled = true; });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    status.className = "status"; status.textContent = "";
    var data = new FormData(form);
    if (!data.get("accomplishment") || !data.get("vibe") || !data.get("proof")) {
      status.className = "status err";
      status.textContent = "Fill in the accomplishment, the vibe, and how it gets verified.";
      return;
    }
    submit.disabled = true;
    status.textContent = "Sending...";
    fetch("https://formspree.io/f/" + FORMSPREE_FORM_ID, {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    }).then(function (r) {
      if (r.ok) {
        form.reset();
        status.className = "status ok";
        status.textContent = "Got it. If it makes the list, you'll see it here.";
      } else {
        throw new Error();
      }
    }).catch(function () {
      status.className = "status err";
      status.textContent = "That didn't go through. Try again in a minute.";
    }).then(function () { submit.disabled = false; });
  });
})();
