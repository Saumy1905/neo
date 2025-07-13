document.addEventListener('DOMContentLoaded', function() {
  // ===== EXISTING FUNCTIONALITY (PRESERVED) =====
  
  // Toggle mobile menu
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function() {
      siteNav.classList.toggle('active');
    });
  }
  
  // Toggle search bar
  const searchToggle = document.querySelector('.search-toggle');
  const searchContainer = document.querySelector('.search-container');
  
  if (searchToggle && searchContainer) {
    searchToggle.addEventListener('click', function() {
      searchContainer.classList.toggle('active');
      if (searchContainer.classList.contains('active')) {
        document.querySelector('#search-input').focus();
      }
    });
  }
  
  // Toggle dark mode
  const themeToggle = document.querySelector('.theme-toggle');
  const body = document.body;
  
  // Check for saved theme preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    body.classList.add('dark-theme');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      body.classList.toggle('dark-theme');
      
      let theme = 'light';
      if (body.classList.contains('dark-theme')) {
        theme = 'dark';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
      
      localStorage.setItem('theme', theme);
    });
  }
  
  // Subject filtering (existing)
  const filterButtons = document.querySelectorAll('.filter-btn');
  const subjectCards = document.querySelectorAll('.subject-card');
  
  if (filterButtons.length > 0 && subjectCards.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        
        subjectCards.forEach(card => {
          if (filter === 'all') {
            card.style.display = 'block';
          } else {
            if (card.getAttribute('data-category') === filter) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });
  }
  
  // PDF viewer functionality (existing)
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const pdfViewer = document.getElementById('pdf-viewer');
  const pdfIframe = document.getElementById('pdf-iframe');
  
  if (fullscreenBtn && pdfViewer) {
    fullscreenBtn.addEventListener('click', function() {
      if (pdfViewer.requestFullscreen) {
        pdfViewer.requestFullscreen();
      } else if (pdfViewer.mozRequestFullScreen) {
        pdfViewer.mozRequestFullScreen();
      } else if (pdfViewer.webkitRequestFullscreen) {
        pdfViewer.webkitRequestFullscreen();
      } else if (pdfViewer.msRequestFullscreen) {
        pdfViewer.msRequestFullscreen();
      }
    });
  }
  
  const printBtn = document.getElementById('print-btn');
  
  if (printBtn && pdfIframe) {
    printBtn.addEventListener('click', function() {
      pdfIframe.contentWindow.focus();
      pdfIframe.contentWindow.print();
    });
  }

  // ===== NEW ENHANCED FEATURES =====
  
  // Initialize enhanced search functionality
  initializeEnhancedSearch();
  
  // Initialize card animations
  initializeCardAnimations();
  
  // Initialize advanced filtering
  initializeAdvancedFiltering();
});

// ===== ENHANCED SEARCH FUNCTIONALITY =====

let allPYQs = [];
let searchResults = [];
let currentResultsPage = 1;
let resultsPerPage = 25;
let currentView = 'list';
let filtersVisible = false;

function initializeEnhancedSearch() {
  // Load PYQ data from your existing data structure
  loadPYQData();
  
  // Check for URL parameters
  checkURLParameters();
  
  // Set up form submission
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      performAdvancedSearch();
    });
  }
  
  // Set up real-time search
  const mainSearch = document.getElementById('main-search');
  if (mainSearch) {
    mainSearch.addEventListener('input', debounce(performAdvancedSearch, 500));
  }
}

function loadPYQData() {
  // Convert your hierarchical data structure to flat searchable format
  allPYQs = [];
  
  // This would be populated from your site.data.colleges structure
  {% for college in site.data.colleges %}
    {% for branch in college.branches %}
      {% for semester in branch.semesters %}
        {% for subject in semester.subjects %}
          {% for pyq in subject.pyqs %}
            allPYQs.push({
              title: "{{ subject.name }}",
              college: "{{ college.name }}",
              collegeSlug: "{{ college.slug }}",
              branch: "{{ branch.name }}",
              branchSlug: "{{ branch.slug }}",
              semester: "{{ semester.number }}",
              semesterSlug: "{{ semester.slug }}",
              subject: "{{ subject.name }}",
              subjectSlug: "{{ subject.slug }}",
              year: {{ pyq.year }},
              file: "{{ pyq.file }}",
              url: "/colleges/{{ college.slug }}/{{ branch.slug }}/{{ semester.slug }}/{{ subject.slug }}/",
              pdfUrl: "/pdf-viewer/{{ college.slug }}/{{ branch.slug }}/{{ semester.slug }}/{{ subject.slug }}/{{ college.slug }}-{{ subject.slug }}-{{ pyq.year }}/"
            });
          {% endfor %}
        {% endfor %}
      {% endfor %}
    {% endfor %}
  {% endfor %}
}

function performAdvancedSearch() {
  const startTime = Date.now();
  
  showSearchState('loading');
  
  // Get search parameters
  const query = document.getElementById('main-search')?.value.toLowerCase().trim() || '';
  const college = document.getElementById('college-filter')?.value || '';
  const branch = document.getElementById('branch-filter')?.value || '';
  const semester = document.getElementById('semester-filter')?.value || '';
  const year = document.getElementById('year-filter')?.value || '';
  const sortBy = document.getElementById('sort-by')?.value || 'relevance';
  
  // Filter PYQs
  searchResults = allPYQs.filter(pyq => {
    const matchesQuery = !query || 
      pyq.title.toLowerCase().includes(query) ||
      pyq.college.toLowerCase().includes(query) ||
      pyq.branch.toLowerCase().includes(query) ||
      pyq.subject.toLowerCase().includes(query);
    
    const matchesCollege = !college || pyq.collegeSlug === college;
    const matchesBranch = !branch || pyq.branchSlug === branch;
    const matchesSemester = !semester || pyq.semesterSlug === semester;
    const matchesYear = !year || pyq.year.toString() === year;
    
    return matchesQuery && matchesCollege && matchesBranch && matchesSemester && matchesYear;
  });
  
  // Sort results
  sortSearchResults(sortBy);
  
  const searchTime = Date.now() - startTime;
  
  setTimeout(() => {
    displaySearchResults(searchTime);
    updateActiveFilters();
  }, 300);
}

function sortSearchResults(sortBy) {
  searchResults.sort((a, b) => {
    switch(sortBy) {
      case 'title':
        return a.subject.localeCompare(b.subject);
      case 'year':
        return b.year - a.year;
      case 'college':
        return a.college.localeCompare(b.college);
      case 'relevance':
      default:
        return 0;
    }
  });
}

function displaySearchResults(searchTime) {
  const resultsCount = searchResults.length;
  
  // Update search status
  const resultsCountEl = document.getElementById('results-count');
  const searchTimeEl = document.getElementById('search-time');
  
  if (resultsCountEl) {
    resultsCountEl.textContent = `${resultsCount} PYQ${resultsCount !== 1 ? 's' : ''} found`;
  }
  
  if (searchTimeEl) {
    searchTimeEl.textContent = `(${searchTime}ms)`;
  }
  
  if (resultsCount === 0) {
    showSearchState('no-results');
    return;
  }
  
  // Generate results HTML
  const resultsList = document.getElementById('results-list');
  if (resultsList) {
    resultsList.innerHTML = searchResults.map(pyq => createPYQResultHTML(pyq)).join('');
  }
  
  showSearchState('results');
}

function createPYQResultHTML(pyq) {
  return `
    <div class="search-result-item pyq-result-card">
      <div class="result-header">
        <div class="result-icon">📄</div>
        <div class="result-meta">
          <h3 class="result-title">
            <a href="${pyq.url}">${pyq.subject}</a>
          </h3>
          <div class="result-info">
            <span class="result-college">${pyq.college}</span>
            <span class="result-branch">${pyq.branch}</span>
            <span class="result-semester">Semester ${pyq.semester}</span>
            <span class="result-year">${pyq.year}</span>
          </div>
        </div>
        <div class="result-actions">
          <a href="${pyq.url}" class="btn btn-primary btn-small">View Subject</a>
          <a href="${pyq.pdfUrl}" class="btn btn-outline btn-small">View PDF</a>
        </div>
      </div>
    </div>
  `;
}

function showSearchState(state) {
  const states = ['welcome', 'loading', 'results', 'no-results'];
  
  states.forEach(s => {
    const element = document.getElementById(s === 'welcome' ? 'search-welcome' : 
                                         s === 'loading' ? 'search-loading' :
                                         s === 'results' ? 'search-results' : 'no-results');
    if (element) {
      element.style.display = s === state ? 'block' : 'none';
    }
  });
}

// ===== CARD ANIMATIONS =====

function initializeCardAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animateElements = document.querySelectorAll('.college-card, .branch-card, .semester-card, .subject-card, .pdf-card');
  animateElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
  
  // Add hover effects
  initializeHoverEffects();
}

function initializeHoverEffects() {
  // Card tilt effect
  const cards = document.querySelectorAll('.college-card, .branch-card, .semester-card, .subject-card, .pdf-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', handleCardTilt);
    card.addEventListener('mouseleave', resetCardTilt);
  });
}

function handleCardTilt(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = (y - centerY) / 10;
  const rotateY = (centerX - x) / 10;
  
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
}

function resetCardTilt(e) {
  const card = e.currentTarget;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
}

// ===== UTILITY FUNCTIONS =====

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function toggleFilters() {
  const filtersContent = document.getElementById('filters-content');
  const toggleBtn = document.querySelector('.filters-toggle');
  const toggleText = toggleBtn?.querySelector('.toggle-text');
  const toggleIcon = toggleBtn?.querySelector('.toggle-icon');
  
  filtersVisible = !filtersVisible;
  
  if (filtersContent) {
    if (filtersVisible) {
      filtersContent.style.display = 'block';
      if (toggleText) toggleText.textContent = 'Hide Filters';
      if (toggleIcon) toggleIcon.textContent = '▲';
    } else {
      filtersContent.style.display = 'none';
      if (toggleText) toggleText.textContent = 'Show Filters';
      if (toggleIcon) toggleIcon.textContent = '▼';
    }
  }
}

function clearFilters() {
  const filters = ['college-filter', 'branch-filter', 'semester-filter', 'year-filter'];
  filters.forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) filter.value = '';
  });
  
  const sortBy = document.getElementById('sort-by');
  if (sortBy) sortBy.value = 'relevance';
  
  const mainSearch = document.getElementById('main-search');
  if (mainSearch && mainSearch.value) {
    performAdvancedSearch();
  }
}

function clearAllSearchFilters() {
  const mainSearch = document.getElementById('main-search');
  if (mainSearch) mainSearch.value = '';
  clearFilters();
  showSearchState('welcome');
  updateActiveFilters();
}

function quickSearch(query = '', college = '', branch = '', year = '') {
  const mainSearch = document.getElementById('main-search');
  const collegeFilter = document.getElementById('college-filter');
  const branchFilter = document.getElementById('branch-filter');
  const yearFilter = document.getElementById('year-filter');
  
  if (mainSearch) mainSearch.value = query;
  if (collegeFilter) collegeFilter.value = college;
  if (branchFilter) branchFilter.value = branch;
  if (yearFilter) yearFilter.value = year;
  
  performAdvancedSearch();
}

function changeResultsView(view) {
  currentView = view;
  const viewBtns = document.querySelectorAll('.view-controls .view-btn');
  
  viewBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === view);
  });
  
  const resultsList = document.getElementById('results-list');
  if (resultsList) {
    resultsList.className = view === 'grid' ? 'results-grid' : 'results-list';
  }
}

function updateActiveFilters() {
  const mainSearch = document.getElementById('main-search');
  const collegeFilter = document.getElementById('college-filter');
  const branchFilter = document.getElementById('branch-filter');
  const semesterFilter = document.getElementById('semester-filter');
  const yearFilter = document.getElementById('year-filter');
  
  const query = mainSearch?.value || '';
  const college = collegeFilter?.value || '';
  const branch = branchFilter?.value || '';
  const semester = semesterFilter?.value || '';
  const year = yearFilter?.value || '';
  
  const hasFilters = query || college || branch || semester || year;
  const activeFilters = document.getElementById('active-filters');
  const filterTags = document.getElementById('filter-tags');
  
  if (activeFilters && filterTags) {
    if (hasFilters) {
      activeFilters.style.display = 'flex';
      filterTags.innerHTML = '';
      
      if (query) {
        filterTags.appendChild(createFilterTag('Search', `"${query}"`, () => {
          if (mainSearch) mainSearch.value = '';
          performAdvancedSearch();
        }));
      }
      
      if (college) {
        const collegeName = document.querySelector(`#college-filter option[value="${college}"]`)?.textContent || college;
        filterTags.appendChild(createFilterTag('College', collegeName, () => {
          if (collegeFilter) collegeFilter.value = '';
          performAdvancedSearch();
        }));
      }
      
      if (branch) {
        const branchName = document.querySelector(`#branch-filter option[value="${branch}"]`)?.textContent || branch;
        filterTags.appendChild(createFilterTag('Branch', branchName, () => {
          if (branchFilter) branchFilter.value = '';
          performAdvancedSearch();
        }));
      }
      
      if (semester) {
        const semesterName = document.querySelector(`#semester-filter option[value="${semester}"]`)?.textContent || semester;
        filterTags.appendChild(createFilterTag('Semester', semesterName, () => {
          if (semesterFilter) semesterFilter.value = '';
          performAdvancedSearch();
        }));
      }
      
      if (year) {
        filterTags.appendChild(createFilterTag('Year', year, () => {
          if (yearFilter) yearFilter.value = '';
          performAdvancedSearch();
        }));
      }
    } else {
      activeFilters.style.display = 'none';
    }
  }
}

function createFilterTag(label, value, onRemove) {
  const tag = document.createElement('span');
  tag.className = 'filter-tag';
  tag.innerHTML = `${label}: ${value} <button onclick="this.parentElement.remove(); arguments[0].stopPropagation();" onmousedown="event.preventDefault();">×</button>`;
  
  const button = tag.querySelector('button');
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    onRemove();
  });
  
  return tag;
}

function checkURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  
  const mainSearch = document.getElementById('main-search');
  const collegeFilter = document.getElementById('college-filter');
  
  if (urlParams.get('query') && mainSearch) {
    mainSearch.value = urlParams.get('query');
  }
  
  if (urlParams.get('college') && collegeFilter) {
    collegeFilter.value = urlParams.get('college');
  }
  
  // Perform search if there are parameters
  if (urlParams.toString()) {
    performAdvancedSearch();
  }
}
