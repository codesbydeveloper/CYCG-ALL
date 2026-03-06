
(function () {
  const toggles = Array.prototype.slice.call(document.querySelectorAll('#views-toggle'));
  const dropdown = document.getElementById('views-dropdown');
  const source = document.getElementById('views-source');

  if (!toggles.length || !dropdown || !source) return;

  let isOpen = false;
  let isCloned = false;

  var DROPDOWN_TRANSITION_MS = 600;

  var closeTimer = null;
  var HOVER_CLOSE_DELAY = 200;
  var MOBILE_MENU_TRANSITION_MS = 300;
  var categoriesApiUrl = 'https://cycgbackendapi.chaitanyarana.com/api/categories';
  var blogsApiBase = 'https://cycgbackendapi.chaitanyarana.com/api/blogs';
  var categoryButtonClass = 'px-5 py-3 sm:px-6 sm:py-4 bg-[#111111] hover:bg-[#2E2E2E] border border-[#333333] rounded-full text-[#EBEBEB] !text-white no-underline text-[14px] sm:text-[16px] font-normal transition-colors whitespace-nowrap';
  var cachedCategoryMarkup = '';
  var recentViewsStorageKey = 'cycg-recent-view-ids';
  var recentViewsLimit = 10;
  var recentViewCardsToShow = 3;
  var fallbackImage = './assets/img/blog img.webp';
  var cachedRecentBlogs = [];

  function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    var escaped = document.createElement('div');
    escaped.innerText = text;
    return escaped.innerHTML;
  }

  function toSlug(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function findCategoryContainer(root) {
    if (!root) return null;

    var idContainer = root.querySelector('#views-category-list');
    if (idContainer) return idContainer;

    var links = root.querySelectorAll('a[href="views.html"]');
    for (var i = 0; i < links.length; i += 1) {
      var label = String(links[i].textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (label === 'all topics') {
        return links[i].parentElement;
      }
    }

    return null;
  }

  function applyCategoryContainerScroll(container) {
    if (!container) return;
    container.style.maxHeight = '410px';
    container.style.overflowY = 'auto';
    container.style.overflowX = 'hidden';
    container.style.paddingRight = '4px';
    container.style.scrollbarWidth = 'thin';
  }

  function renderCategoryMarkup(categories) {
    if (!Array.isArray(categories) || !categories.length) return '';

    var allTopicsLink = '<a href="views.html" class="' + categoryButtonClass + ' link-no-underline no-underline !text-white">All Topics</a>';
    var categoryLinks = categories.map(function (category) {
      var rawCategoryName = String((category && category.name) || 'Untitled');
      var categoryName = escapeHtml(rawCategoryName);
      var categorySlug = toSlug(rawCategoryName) || 'untitled';
      var categoryId = category && category.id != null ? String(category.id) : '';
      var href = 'views.html?category=' + encodeURIComponent(categorySlug) + '-' + encodeURIComponent(categoryId);
      return '<a href="' + href + '" class="' + categoryButtonClass + '">' + categoryName + '</a>';
    }).join('');

    return  categoryLinks;
  }

  function paintCategoriesInRoot(root) {
    if (!cachedCategoryMarkup) return;
    var container = findCategoryContainer(root);
    if (!container) return;
    container.innerHTML = cachedCategoryMarkup;
    applyCategoryContainerScroll(container);
  }

  function getStoredRecentViewIds() {
    try {
      var raw = localStorage.getItem(recentViewsStorageKey);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(function (id) { return Number(id); })
        .filter(function (id) { return Number.isInteger(id) && id > 0; })
        .slice(0, recentViewsLimit);
    } catch (error) {
      return [];
    }
  }

  function saveRecentViewIds(ids) {
    try {
      localStorage.setItem(recentViewsStorageKey, JSON.stringify(ids));
    } catch (error) {
      // Ignore localStorage write failures.
    }
  }

  function trackCurrentViewDetailId() {
    var pathname = String(window.location.pathname || '').toLowerCase();
    if (!pathname.endsWith('view-detail.html')) return;

    var params = new URLSearchParams(window.location.search);
    var id = Number(params.get('id'));
    if (!Number.isInteger(id) || id <= 0) return;

    var existing = getStoredRecentViewIds().filter(function (existingId) {
      return existingId !== id;
    });
    existing.unshift(id);
    saveRecentViewIds(existing.slice(0, recentViewsLimit));
  }

  function findRecentViewContainers(root) {
    if (!root) return [];

    var containers = [];
    var seen = new Set();

    function pushContainer(node) {
      if (!node || seen.has(node)) return;
      seen.add(node);
      containers.push(node);
    }

    var idMatches = root.querySelectorAll('#recent-views-list, #detail-recent-views-list');
    idMatches.forEach(pushContainer);

    var headings = root.querySelectorAll('h2');
    headings.forEach(function (heading) {
      var text = String(heading.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var isRecentViewsHeading = text.indexOf('recent') !== -1 && text.indexOf('views') !== -1;
      if (!isRecentViewsHeading) return;

      var next = heading.nextElementSibling;
      if (next && next.tagName && next.tagName.toLowerCase() === 'div') {
        pushContainer(next);
      }
    });

    return containers;
  }

  function formatDisplayDate(isoDate) {
    var date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';

    var day = date.getDate();
    var month = date.toLocaleString('en-US', { month: 'short' });
    var year = date.getFullYear();
    var suffix = 'th';

    if (day <= 3 || day >= 21) {
      if (day % 10 === 1) suffix = 'st';
      if (day % 10 === 2) suffix = 'nd';
      if (day % 10 === 3) suffix = 'rd';
    }

    return day + suffix + ' ' + month + ' ' + year;
  }

  function isDetailRecentContainer(container) {
    if (!container) return false;
    if (container.id === 'detail-recent-views-list') return true;
    return !!container.closest('aside');
  }

  function buildDropdownRecentCard(blog) {
    var id = blog && blog.id != null ? String(blog.id) : '';
    var title = escapeHtml(String((blog && blog.title) || 'Untitled'));
    var image = escapeHtml(String((blog && blog.image) || fallbackImage));
    var date = escapeHtml(formatDisplayDate((blog && (blog.createdAt || blog.updatedAt))));
    var href = 'view-detail.html?id=' + encodeURIComponent(id);

    return '' +
      '<a href="' + href + '" style="text-decoration: none;" class="space-between py-3 flex gap-3 p-3 sm:p-4 bg-[#242424] hover:bg-[#2A2A2A] rounded-[16px] transition-colors text-left">' +
      '<div class="flex-shrink-0 w-[100px] h-[75px] sm:w-[110px] sm:h-[85px] lg:w-[90px] lg:h-[90px] xl:w-[100px] xl:h-[100px] rounded-[10px] overflow-hidden">' +
      '<img src="' + image + '" alt="' + title + '" class="w-full h-full object-cover" loading="lazy">' +
      '</div>' +
      '<div class="flex-1 min-w-0 flex flex-col justify-center">' +
      '<h3 class="text-white font-medium text-[14px] sm:text-[15px] lg:text-[16px] leading-snug mb-0.5 line-clamp-2">' + title + '</h3>' +
      '<span class="text-[#818181] text-[12px] sm:text-[13px] lg:text-[14px] font-normal">' + date + '</span>' +
      '</div>' +
      '</a>';
  }

  function buildDetailRecentCard(blog) {
    var id = blog && blog.id != null ? String(blog.id) : '';
    var title = escapeHtml(String((blog && blog.title) || 'Untitled'));
    var image = escapeHtml(String((blog && blog.image) || fallbackImage));
    var date = escapeHtml(formatDisplayDate((blog && (blog.createdAt || blog.updatedAt))));
    var href = 'view-detail.html?id=' + encodeURIComponent(id);

    return '' +
      '<a href="' + href + '" class="flex gap-3 w-full bg-[#242424] rounded-[16px] overflow-hidden p-3 hover:bg-[#2E2E2E] transition-colors">' +
      '<div class="w-[80px] h-[60px] sm:w-[96px] sm:h-[72px] rounded-[12px] overflow-hidden flex-shrink-0">' +
      '<img src="' + image + '" alt="' + title + '" class="w-full h-full object-cover">' +
      '</div>' +
      '<div class="flex flex-col justify-between">' +
      '<p class="text-[14px] text-white leading-snug line-clamp-2">' + title + '</p>' +
      '<span class="text-[12px] text-[#EBEBEB]/70 mt-1">' + date + '</span>' +
      '</div>' +
      '</a>';
  }

  function paintRecentViewsInRoot(root) {
    var containers = findRecentViewContainers(root);
    if (!containers.length) return;

    containers.forEach(function (container) {
      if (!cachedRecentBlogs.length) {
        container.innerHTML = '<p class="text-[#818181] text-sm">No recent view blog</p>';
        return;
      }

      var cards = cachedRecentBlogs.slice(0, recentViewCardsToShow).map(function (blog) {
        return isDetailRecentContainer(container)
          ? buildDetailRecentCard(blog)
          : buildDropdownRecentCard(blog);
      }).join('');

      container.innerHTML = cards;
    });
  }

  function fetchBlogById(id) {
    return fetch(blogsApiBase + '/' + encodeURIComponent(id))
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (result) {
        if (!result) return null;
        var blog = result && result.data && !Array.isArray(result.data) ? result.data : result;
        if (!blog || typeof blog !== 'object') return null;
        if (!Number.isInteger(Number(blog.id))) return null;
        return blog;
      })
      .catch(function () {
        return null;
      });
  }

  function loadRecentViewsFromStore() {
    var ids = getStoredRecentViewIds();
    if (!ids.length) {
      cachedRecentBlogs = [];
      paintRecentViewsInRoot(source);
      paintRecentViewsInRoot(dropdown);
      paintRecentViewsInRoot(document);
      return;
    }

    Promise.all(ids.map(fetchBlogById))
      .then(function (blogs) {
        cachedRecentBlogs = blogs.filter(function (blog) { return !!blog; });
        paintRecentViewsInRoot(source);
        paintRecentViewsInRoot(dropdown);
        paintRecentViewsInRoot(document);
      })
      .catch(function () {
        cachedRecentBlogs = [];
        paintRecentViewsInRoot(source);
        paintRecentViewsInRoot(dropdown);
        paintRecentViewsInRoot(document);
      });
  }

  function ensureCloned() {
    if (isCloned) return;
    const clone = source.cloneNode(true);
    clone.classList.remove('hidden');
    clone.id = '';
    const closeBtn = clone.querySelector('#views-close-btn');
    if (closeBtn) {
      closeBtn.id = '';
      closeBtn.addEventListener('click', closeDropdown);
    }
    dropdown.appendChild(clone);
    isCloned = true;
    paintCategoriesInRoot(dropdown);
    paintRecentViewsInRoot(dropdown);
  }

  const headerEl = dropdown.closest('header');

  function openDropdown() {
    if (isOpen) return;
    isOpen = true;
    if (headerEl) headerEl.classList.add('views-dropdown-open');
    ensureCloned();
    // Keep dropdown under header (header uses z-50), so header stays visible.
    dropdown.style.zIndex = '49';
    dropdown.style.overflowY = 'hidden';
    document.body.classList.add('overflow-hidden');
 dropdown.style.height = 'auto';

var targetHeight;

if (isMobileOrTabletView()) {
  targetHeight = dropdown.scrollHeight; // better for mobile/iPhone
} else {
  targetHeight = dropdown.offsetHeight;
}

dropdown.style.height = '0px';

requestAnimationFrame(function () {
  dropdown.style.height = targetHeight + 'px';
});
 

if (isMobileOrTabletView()) {
  setTimeout(function () {
    if (!isOpen) return;

    dropdown.style.height = '100dvh';
    dropdown.style.maxHeight = '100dvh';
    dropdown.style.overflowY = 'auto';
    dropdown.style.WebkitOverflowScrolling = 'touch';

  }, DROPDOWN_TRANSITION_MS);
}
  }

  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    if (headerEl) headerEl.classList.remove('views-dropdown-open');
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
    dropdown.style.overflowY = 'hidden';
    dropdown.style.WebkitOverflowScrolling = '';
    dropdown.style.maxHeight = '';
    var currentHeight = dropdown.offsetHeight;
    dropdown.style.height = currentHeight + 'px';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        dropdown.style.height = '0px';
        setTimeout(function () {
          document.body.classList.remove('overflow-hidden');
          dropdown.style.zIndex = '';
        }, DROPDOWN_TRANSITION_MS);
      });
    });
  }

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(closeDropdown, HOVER_CLOSE_DELAY);
  }

  function cancelClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
  }

  function isMobileOrTabletView() {
    return window.matchMedia('(max-width: 1023px)').matches;
  }

  function isInsideMobileMenu(element) {
    return !!(element && element.closest && element.closest('#mobile-menu'));
  }

  function closeMobileMenuIfOpen() {
    var mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu || mobileMenu.classList.contains('translate-x-full')) return false;

    var closeBtn = document.getElementById('mobile-menu-close');
    if (closeBtn && typeof closeBtn.click === 'function') {
      closeBtn.click();
    }

    // Force-close as a fallback so behavior is identical on every page.
    mobileMenu.classList.add('translate-x-full');
    document.body.style.overflow = '';

    var menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
      var spans = menuBtn.querySelectorAll('span');
      if (spans[0]) spans[0].style.transform = '';
      if (spans[1]) spans[1].style.opacity = '';
      if (spans[2]) spans[2].style.transform = '';
    }

    return true;
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener('mouseenter', function () {
      cancelClose();
      openDropdown();
    });

    toggle.addEventListener('mouseleave', function () {
      scheduleClose();
    });

    toggle.addEventListener('click', function (e) {
      e.preventDefault();

      // On touch/tablet or when Views is tapped inside the mobile menu,
      // close menu first, then open the dropdown.
      if (isMobileOrTabletView() || isInsideMobileMenu(toggle)) {
        var didCloseMobileMenu = closeMobileMenuIfOpen();
        cancelClose();

        if (didCloseMobileMenu) {
          setTimeout(openDropdown, MOBILE_MENU_TRANSITION_MS);
        } else {
          openDropdown();
        }
      }
    });
  });

  document.addEventListener('click', function (e) {
    var trigger = e.target && e.target.closest
      ? e.target.closest('#mobile-menu a, #mobile-menu button')
      : null;

    if (!trigger) return;
    if (!isMobileOrTabletView()) return;

    var href = String(trigger.getAttribute('href') || '').toLowerCase();
    var text = String(trigger.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    var id = String(trigger.id || '').toLowerCase();
    var isViewsTrigger = id === 'views-toggle' || href.indexOf('views.html') !== -1 || text === 'views';
    if (!isViewsTrigger) return;

    e.preventDefault();
    e.stopPropagation();

    var didCloseMobileMenu = closeMobileMenuIfOpen();
    cancelClose();

    if (didCloseMobileMenu) {
      setTimeout(openDropdown, MOBILE_MENU_TRANSITION_MS);
    } else {
      openDropdown();
    }
  }, true);

  document.addEventListener('click', function (e) {
    var footerViewsLink = e.target && e.target.closest
      ? e.target.closest('footer a[href*="views.html"]')
      : null;

    if (!footerViewsLink) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    cancelClose();
    closeMobileMenuIfOpen();
    setTimeout(openDropdown, 140);
  });

  dropdown.addEventListener('mouseenter', function () {
    cancelClose();
  });

  dropdown.addEventListener('mouseleave', function () {
    scheduleClose();
  });

  document.addEventListener('click', function (e) {
    var clickedOnAnyToggle = toggles.some(function (toggle) {
      return toggle.contains(e.target);
    });

    if (isOpen && !dropdown.contains(e.target) && !clickedOnAnyToggle) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeDropdown();
  });

  function loadViewsCategories() {
    fetch(categoriesApiUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
      })
      .then(function (result) {
        var categories = Array.isArray(result)
          ? result
          : Array.isArray(result && result.data)
            ? result.data
            : [];

        cachedCategoryMarkup = renderCategoryMarkup(categories);
        if (!cachedCategoryMarkup) return;

        paintCategoriesInRoot(source);
        paintCategoriesInRoot(dropdown);
      })
      .catch(function () {
        // Keep existing fallback markup when API call fails.
      });
  }

  function initLeftToRightReveal() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('section'));
    if (sections.length > 1) {
      sections.slice(1).forEach(function (section, index) {
        if (section.hasAttribute('data-no-reveal')) return;
        if (!section.hasAttribute('data-reveal')) {
          section.setAttribute('data-reveal', 'left');
        }
        if (!section.hasAttribute('data-reveal-delay')) {
          var staggerDelay = Math.min(index * 70, 280);
          section.setAttribute('data-reveal-delay', staggerDelay + 'ms');
        }
      });
    }

    var revealItems = document.querySelectorAll('[data-reveal="left"]');
    if (!revealItems.length) return;

    var hasReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasObserver = 'IntersectionObserver' in window;

    revealItems.forEach(function (item) {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-64px)';
      item.style.transition = 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease';
      item.style.willChange = 'transform, opacity';
      item.style.transitionDelay = '0ms';
    });

    if (hasReducedMotion || !hasObserver) {
      revealItems.forEach(function (item) {
        item.style.opacity = '1';
        item.style.transform = 'none';
        item.style.transition = 'none';
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var delay = entry.target.getAttribute('data-reveal-delay');
        if (delay) {
          entry.target.style.transitionDelay = delay;
        }

        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -6% 0px'
    });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  loadViewsCategories();
  trackCurrentViewDetailId();
  loadRecentViewsFromStore();
  initLeftToRightReveal();

})();
