// ServiceNow Module Guides — theme, menu position, sidebar behaviour.
(function () {
  var root = document.documentElement;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // --- theme + menu-position segmented controls ---
  var themeDark = document.getElementById('themeDarkBtn');
  var themeLight = document.getElementById('themeLightBtn');
  var navTop = document.getElementById('navTopBtn');
  var navSide = document.getElementById('navSideBtn');

  function syncControls() {
    var theme = root.dataset.theme || 'dark';
    var nav = root.dataset.nav || 'side';
    if (themeDark) themeDark.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    if (themeLight) themeLight.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    if (navTop) navTop.setAttribute('aria-pressed', nav === 'top' ? 'true' : 'false');
    if (navSide) navSide.setAttribute('aria-pressed', nav === 'side' ? 'true' : 'false');
  }
  function setTheme(t) { root.dataset.theme = t; store('sg-theme', t); syncControls(); }
  function setNav(n) { root.dataset.nav = n; store('sg-nav', n); syncControls(); closeDrawer(); }

  if (themeDark) themeDark.addEventListener('click', function () { setTheme('dark'); });
  if (themeLight) themeLight.addEventListener('click', function () { setTheme('light'); });
  if (navTop) navTop.addEventListener('click', function () { setNav('top'); });
  if (navSide) navSide.addEventListener('click', function () { setNav('side'); });
  syncControls();

  // --- mark the current page in both navs ---
  var here = window.location.pathname.replace(/\/+$/, '');
  document.querySelectorAll('.sidebar a, .topnav a').forEach(function (a) {
    var p = a.pathname.replace(/\/+$/, '');
    if (p && p === here) a.classList.add('active');
  });

  // --- build "On this page" from the article headings ---
  // The same menu lives in three places: the sticky sidebar (side mode),
  // a floating always-on panel (top mode), and it is hide-able in both.
  var content = document.getElementById('content');
  var toc = document.getElementById('toc');
  var tocGroup = document.getElementById('tocGroup');
  var tocFloat = document.getElementById('tocFloat');
  var tocPanel = document.getElementById('tocPanel');
  var tocShow = document.getElementById('tocShow');
  var tocHide = document.getElementById('tocHide');
  if (content && toc && tocGroup) {
    var headings = content.querySelectorAll('h2, h3');
    if (headings.length > 2) {
      tocGroup.hidden = false;
      headings.forEach(function (h, i) {
        if (!h.id) h.id = 'sec-' + i;
        [toc, tocFloat].forEach(function (host) {
          if (!host) return;
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent;
          if (h.tagName === 'H3') a.classList.add('toc-h3');
          a.addEventListener('click', closeDrawer);
          host.appendChild(a);
        });
      });
      // scrollspy across both menus
      var links = document.querySelectorAll('#toc a, #tocFloat a');
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      headings.forEach(function (h) { spy.observe(h); });

      // floating panel (top mode): on screen at all times, hide-able
      function setTocPanel(state) {
        root.dataset.tocpanel = state;
        store('sg-tocpanel', state);
        if (tocPanel) tocPanel.classList.toggle('open', state !== 'closed');
        if (tocShow) tocShow.classList.toggle('open', state === 'closed');
      }
      setTocPanel(root.dataset.tocpanel === 'closed' ? 'closed' : 'open');
      if (tocHide) tocHide.addEventListener('click', function () { setTocPanel('closed'); });
      if (tocShow) tocShow.addEventListener('click', function () { setTocPanel('open'); });

      // sidebar menu (side mode): collapsible
      var tocCollapse = document.getElementById('tocCollapse');
      var tocChev = document.getElementById('tocChev');
      function setSideToc(collapsed) {
        tocGroup.classList.toggle('collapsed', collapsed);
        if (tocChev) tocChev.textContent = collapsed ? '▸' : '▾';
        store('sg-tocside', collapsed ? 'closed' : 'open');
      }
      var sideState = 'open';
      try { sideState = localStorage.getItem('sg-tocside') || 'open'; } catch (e) {}
      setSideToc(sideState === 'closed');
      if (tocCollapse) tocCollapse.addEventListener('click', function () {
        setSideToc(!tocGroup.classList.contains('collapsed'));
      });
    }
  }

  // --- mobile drawer ---
  var burger = document.getElementById('navBurger');
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  function closeDrawer() {
    if (sidebar) sidebar.classList.remove('open');
    if (scrim) scrim.hidden = true;
  }
  if (burger && sidebar && scrim) {
    burger.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      scrim.hidden = !open;
    });
    scrim.addEventListener('click', closeDrawer);
  }
})();
