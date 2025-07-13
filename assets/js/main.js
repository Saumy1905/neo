document.addEventListener('DOMContentLoaded', function() {
  
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
  
  // PDF viewer functionality
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
      try {
        pdfIframe.contentWindow.focus();
        pdfIframe.contentWindow.print();
      } catch (e) {
        console.warn('PDF print functionality not available:', e);
      }
    });
  }

  // ===== [Search] [Animation] =====
  
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

// SOLUTION 3: Use pre-loaded global data from college-data.js
function loadPYQData() {
  allPYQs = [];
  
  try {
    // Use the globally available data from window.COLLEGE_DATA
    const collegeData = window.COLLEGE_DATA;
    
    if (!collegeData || !collegeData.colleges) {
      console.warn('Global college data not found. Make sure college-data.js is loaded before main.js');
      return;
    }
    
    // Process the global data with your specific structure
    collegeData.colleges.forEach(college => {
      if (!college.branches || !Array.isArray(college.branches)) return;
      
      college.branches.forEach(branch => {
        if (!branch.semesters || !Array.isArray(branch.semesters)) return;
        
        branch.semesters.forEach(semester => {
          if (!semester.subjects || !Array.isArray(semester.subjects)) return;
          
          semester.subjects.forEach(subject => {
            if (!subject.pyqs || !Array.isArray(subject.pyqs)) return;
            
            subject.pyqs.forEach(pyq => {
              // Process each PYQ and add to searchable array
              allPYQs.push({
                title: escapeJavaScript(subject.name || ''),
                college: escapeJavaScript(college.name || ''),
                collegeId: escapeJavaScript(college.id || ''),
                collegeSlug: escapeJavaScript(college.slug || ''),
                branch: escapeJavaScript(branch.name || ''),
                branchId: escapeJavaScript(branch.id || ''),
                branchSlug: escapeJavaScript(branch.slug || ''),
                branchIcon: escapeJavaScript(branch.icon || 'book'),
                semester: semester.number || '',
                semesterId: escapeJavaScript(semester.id || ''),
                semesterSlug: escapeJavaScript(semester.slug || ''),
                subject: escapeJavaScript(subject.name || ''),
                subjectId: escapeJavaScript(subject.id || ''),
                subjectSlug: escapeJavaScript(subject.slug || ''),
                subjectDescription: escapeJavaScript(subject.description || ''),
                subjectIcon: escapeJavaScript(subject.icon || 'book'),
                year: parseInt(pyq.year) || 0,
                file: escapeJavaScript(pyq.file || ''),
                pyqId: escapeJavaScript(pyq.id || ''),
                pages: parseInt(pyq.pages) || 0,
                pyqTitle: escapeJavaScript(pyq.title || ''),
                difficulty: escapeJavaScript(pyq.difficulty || ''),
                examType: escapeJavaScript(pyq.exam_type || ''),
                // Build URLs for navigation
                url: `/colleges/${college.slug}/${branch.slug}/${semester.slug}/${subject.slug}/`,
                pdfUrl: `/pdf-viewer/${college.slug}/${branch.slug}/${semester.slug}/${subject.slug}/${pyq.id}/`,
                downloadUrl: `/assets/pdfs/${pyq.file}`
              });
            });
          });
        });
      });
    });
    
    console.log(`✅ Loaded ${allPYQs.length} PYQs from ${collegeData.colleges.length} colleges (Global Data Store)`);
    
    // Log some sample data for debugging
    if (allPYQs.length > 0) {
      console.log('📄 Sample PYQ data:', allPYQs[0]);
    }
    
  } catch (error) {
    console.error('❌ Error loading PYQ data from global store:', error);
    allPYQs = [];
  }
}

// Helper function to safely escape JavaScript strings
function escapeJavaScript(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/['"\\]/g, '\\$&')
            .replace(/\r?\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
}

function performAdvancedSearch() {
  const startTime = Date.now();
  
  showSearchState('loading');
  
  // Get search parameters with null checks
  const query = document.getElementById('main-search')?.value?.toLowerCase().trim() || '';
  const college = document.getElementById('college-filter')?.value || '';
  const branch = document.getElementById('branch-filter')?.value || '';
  const semester = document.getElementById('semester-filter')?.value || '';
  const year = document.getElementById('year-filter')?.value || '';
  const sortBy = document.getElementById('sort-by')?.value || 'relevance';
  
  // Validate that we have data to search
  if (!Array.isArray(allPYQs) || allPYQs.length === 0) {
    console.warn('⚠️ No PYQ data available for search');
    showSearchState('no-results');
    return;
  }
  
  // Filter PYQs with comprehensive matching
  searchResults = allPYQs.filter(pyq => {
    try {
      // Text-based search across multiple fields
      const matchesQuery = !query || 
        (pyq.title && pyq.title.toLowerCase().includes(query)) ||
        (pyq.college && pyq.college.toLowerCase().includes(query)) ||
        (pyq.branch && pyq.branch.toLowerCase().includes(query)) ||
        (pyq.subject && pyq.subject.toLowerCase().includes(query)) ||
        (pyq.subjectDescription && pyq.subjectDescription.toLowerCase().includes(query)) ||
        (pyq.pyqTitle && pyq.pyqTitle.toLowerCase().includes(query)) ||
        (pyq.difficulty && pyq.difficulty.toLowerCase().includes(query)) ||
        (pyq.examType && pyq.examType.toLowerCase().includes(query));
      
      // Filter-based matching
      const matchesCollege = !college || pyq.collegeSlug === college || pyq.collegeId === college;
      const matchesBranch = !branch || pyq.branchSlug === branch || pyq.branchId === branch;
      const matchesSemester = !semester || pyq.semesterSlug === semester || pyq.semesterId === semester;
      const matchesYear = !year || pyq.year.toString() === year;
      
      return matchesQuery && matchesCollege && matchesBranch && matchesSemester && matchesYear;
    } catch (error) {
      console.warn('⚠️ Error filtering PYQ:', pyq, error);
      return false;
    }
  });
  
  // Sort results
  sortSearchResults(sortBy);
  
  const searchTime = Date.now() - startTime;
  
  // Display results with a slight delay for better UX
  setTimeout(() => {
    displaySearchResults(searchTime);
    updateActiveFilters();
  }, 300);
}

function sortSearchResults(sortBy) {
  try {
    searchResults.sort((a, b) => {
      switch(sortBy) {
        case 'title':
          return (a.subject || '').localeCompare(b.subject || '');
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'college':
          return (a.college || '').localeCompare(b.college || '');
        case 'branch':
          return (a.branch || '').localeCompare(b.branch || '');
        case 'semester':
          return (a.semester || 0) - (b.semester || 0);
        case 'relevance':
        default:
          return 0; // Keep original order for relevance
      }
    });
  } catch (error) {
    console.warn('⚠️ Error sorting search results:', error);
  }
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
  
  // Show search status
  const searchStatus = document.getElementById('search-status');
  if (searchStatus) {
    searchStatus.style.display = 'flex';
  }
  
  if (resultsCount === 0) {
    showSearchState('no-results');
    return;
  }
  
  // Generate results HTML with error handling
  const resultsList = document.getElementById('results-list');
  if (resultsList) {
    try {
      resultsList.innerHTML = searchResults.map(pyq => createPYQResultHTML(pyq)).join('');
    } catch (error) {
      console.error('❌ Error displaying search results:', error);
      resultsList.innerHTML = '<p class="error-message">Error displaying search results. Please try again.</p>';
    }
  }
  
  showSearchState('results');
}

function createPYQResultHTML(pyq) {
  // Safely escape and validate all data for HTML output
  const subject = escapeHTML(pyq.subject || 'Unknown Subject');
  const college = escapeHTML(pyq.college || 'Unknown College');
  const branch = escapeHTML(pyq.branch || 'Unknown Branch');
  const semester = pyq.semester || 'Unknown';
  const year = pyq.year || 'Unknown';
  const pages = pyq.pages || 'Unknown';
  const description = escapeHTML(pyq.subjectDescription || '');
  const pyqTitle = escapeHTML(pyq.pyqTitle || pyq.subject || 'Unknown');
  const difficulty = escapeHTML(pyq.difficulty || '');
  const examType = escapeHTML(pyq.examType || '');
  const url = pyq.url || '#';
  const pdfUrl = pyq.pdfUrl || '#';
  const downloadUrl = pyq.downloadUrl || '#';
  const branchIcon = pyq.branchIcon || 'book';
  const subjectIcon = pyq.subjectIcon || 'book-open';
  
  return `
    <div class="search-result-item pyq-result-card" 
         data-college="${pyq.collegeId}" 
         data-branch="${pyq.branchId}" 
         data-semester="${pyq.semesterId}" 
         data-subject="${pyq.subjectId}" 
         data-year="${pyq.year}">
      <div class="result-header">
        <div class="result-icon">
          <i class="fas fa-${branchIcon}" title="${branch}"></i>
        </div>
        <div class="result-meta">
          <h3 class="result-title">
            <a href="${url}" title="View ${subject} details">${pyqTitle}</a>
          </h3>
          <div class="result-info">
            <span class="result-college" title="College">
              <i class="fas fa-university"></i> ${college}
            </span>
            <span class="result-branch" title="Branch">
              <i class="fas fa-code-branch"></i> ${branch}
            </span>
            <span class="result-semester" title="Semester">
              <i class="fas fa-calendar"></i> Semester ${semester}
            </span>
            <span class="result-year" title="Year">
              <i class="fas fa-calendar-alt"></i> ${year}
            </span>
            <span class="result-pages" title="Pages">
              <i class="fas fa-file-alt"></i> ${pages} pages
            </span>
            ${difficulty ? `<span class="result-difficulty" title="Difficulty"><i class="fas fa-signal"></i> ${difficulty}</span>` : ''}
            ${examType ? `<span class="result-exam-type" title="Exam Type"><i class="fas fa-clipboard-check"></i> ${examType}</span>` : ''}
          </div>
          ${description ? `<div class="result-description">${description}</div>` : ''}
        </div>
        <div class="result-actions">
          <a href="${url}" class="btn btn-primary btn-small" title="View subject page">
            <i class="fas fa-eye"></i> View Subject
          </a>
          <a href="${pdfUrl}" class="btn btn-outline btn-small" title="View PDF file">
            <i class="fas fa-file-pdf"></i> View PDF
          </a>
          <a href="${downloadUrl}" class="btn btn-secondary btn-small" title="Download PDF" download>
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      </div>
    </div>
  `;
}

// Helper function to escape HTML
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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
  // Check for IntersectionObserver support
  if (!('IntersectionObserver' in window)) {
    console.warn('⚠️ IntersectionObserver not supported, skipping animations');
    return;
  }
  
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
  const animateElements = document.querySelectorAll('.college-card, .branch-card, .semester-card, .subject-card, .pdf-card, .search-result-item');
  animateElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
  
  // Add hover effects
  initializeHoverEffects();
}

function initializeHoverEffects() {
  // Card tilt effect with performance optimization
  const cards = document.querySelectorAll('.college-card, .branch-card, .semester-card, .subject-card, .pdf-card, .search-result-item');
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
  
  // Add will-change for better performance
  card.style.willChange = 'transform';
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
}

function resetCardTilt(e) {
  const card = e.currentTarget;
  card.style.willChange = 'auto';
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
}

// ===== ADVANCED FILTERING =====

function initializeAdvancedFiltering() {
  // Set up filter toggle functionality
  const filtersToggle = document.querySelector('.filters-toggle');
  if (filtersToggle) {
    filtersToggle.addEventListener('click', toggleFilters);
  }
  
  // Set up clear filters button
  const clearFiltersBtn = document.getElementById('clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }
  
  // Set up clear all button
  const clearAllBtn = document.getElementById('clear-all');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllSearchFilters);
  }
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
  tag.innerHTML = `${escapeHTML(label)}: ${escapeHTML(value)} <button onclick="this.parentElement.remove(); arguments[0].stopPropagation();" onmousedown="event.preventDefault();">×</button>`;
  
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
  const branchFilter = document.getElementById('branch-filter');
  const yearFilter = document.getElementById('year-filter');
  
  if (urlParams.get('q') && mainSearch) {
    mainSearch.value = urlParams.get('q');
  }
  
  if (urlParams.get('query') && mainSearch) {
    mainSearch.value = urlParams.get('query');
  }
  
  if (urlParams.get('college') && collegeFilter) {
    collegeFilter.value = urlParams.get('college');
  }
  
  if (urlParams.get('branch') && branchFilter) {
    branchFilter.value = urlParams.get('branch');
  }
  
  if (urlParams.get('year') && yearFilter) {
    yearFilter.value = urlParams.get('year');
  }
  
  // Perform search if there are parameters
  if (urlParams.toString()) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      performAdvancedSearch();
    }, 100);
  }
}

// ===== GLOBAL HELPER FUNCTIONS =====

// Make some functions globally available for onclick handlers
window.quickSearch = quickSearch;
window.changeResultsView = changeResultsView;
window.clearFilters = clearFilters;
window.clearAllSearchFilters = clearAllSearchFilters;
window.toggleFilters = toggleFilters;

// Debug function to check if data is loaded correctly
window.debugPYQData = function() {
  console.log('🔍 PYQ Data Debug Info:');
  console.log('📊 Total PYQs loaded:', allPYQs.length);
  console.log('🏫 Colleges available:', [...new Set(allPYQs.map(p => p.college))]);
  console.log('🎓 Branches available:', [...new Set(allPYQs.map(p => p.branch))]);
  console.log('📅 Years available:', [...new Set(allPYQs.map(p => p.year))].sort());
  console.log('📚 Sample PYQ:', allPYQs[0]);
  console.log('🌐 Global data source:', window.COLLEGE_DATA ? 'Available' : 'Missing');
};
