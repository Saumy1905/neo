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

  // ===== [Search] [Animation] [PDF Viewer] =====
  
  // Initialize enhanced search functionality
  initializeEnhancedSearch();
  
  // Initialize card animations
  initializeCardAnimations();
  
  // Initialize advanced filtering
  initializeAdvancedFiltering();
  
  // Initialize PDF viewer if on a PDF viewer page
  if (document.querySelector('.pdf-viewer-container')) {
    initializePDFViewer();
  }
});

// ===== PDF VIEWER FUNCTIONALITY =====

let currentViewer = 'iframe';
let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;
let scale = 5.0; // Set to 500% by default
let rotation = 0;

// PDF Viewer initialization
function initializePDFViewer() {
  // Set up iframe error handling
  const iframe = document.getElementById('pdf-iframe');
  if (iframe) {
    iframe.addEventListener('error', function() {
      showIframeFallback();
    });
    
    // Check if iframe loaded successfully
    iframe.addEventListener('load', function() {
      hideLoading();
    });
  }
  
  // Set up PDF.js viewer
  initializePDFJS();
  
  // Set up viewer switching
  setupViewerSwitching();
  
  // Set up fullscreen functionality
  setupFullscreen();
  
  // Set up print functionality
  setupPrint();
  
  // Hide loading after a delay
  setTimeout(hideLoading, 2000);
}

function switchViewer(viewerType) {
  currentViewer = viewerType;
  
  // Update tabs
  document.querySelectorAll('.viewer-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  const targetTab = document.querySelector(`[data-viewer="${viewerType}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  // Update viewer content
  document.querySelectorAll('.viewer-content').forEach(content => {
    content.classList.remove('active');
  });
  const targetViewer = document.getElementById(`${viewerType}-viewer`);
  if (targetViewer) {
    targetViewer.classList.add('active');
  }
  
  // Update description
  const descriptions = {
    iframe: 'Default browser PDF viewer with standard controls',
    pdfjs: 'Advanced PDF.js viewer with enhanced features and better mobile support'
  };
  
  const descElement = document.getElementById('viewer-description');
  if (descElement) {
    descElement.innerHTML = 
      `<i class="fas fa-info-circle"></i> ${descriptions[viewerType]}`;
  }
  
  // If switching to PDF.js, load the PDF with 500% zoom
  if (viewerType === 'pdfjs' && !pdfDoc) {
    scale = 5.0; // Set to 500% zoom
    loadPDFJS();
  } else if (viewerType === 'pdfjs' && pdfDoc) {
    // If PDF already loaded, just update zoom to 500%
    scale = 5.0;
    updateZoomSelect();
    queueRenderPage(pageNum);
  }
}

function setupViewerSwitching() {
  // Keep iframe as default for all devices
  // No auto-switching behavior
}

function showIframeFallback() {
  const fallback = document.querySelector('.iframe-fallback');
  if (fallback) {
    fallback.style.display = 'flex';
  }
}

function hideLoading() {
  const loading = document.getElementById('pdf-loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

function showError(message) {
  const errorDiv = document.getElementById('pdf-error');
  if (errorDiv) {
    const errorP = errorDiv.querySelector('p');
    if (errorP) {
      errorP.textContent = message;
    }
    errorDiv.style.display = 'flex';
  }
}

// PDF.js functionality
function initializePDFJS() {
  // Set up PDF.js controls
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageNumInput = document.getElementById('page-num');
  const zoomSelect = document.getElementById('zoom-select');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const rotateLeftBtn = document.getElementById('rotate-left');
  const rotateRightBtn = document.getElementById('rotate-right');
  
  if (prevBtn) prevBtn.addEventListener('click', onPrevPage);
  if (nextBtn) nextBtn.addEventListener('click', onNextPage);
  if (pageNumInput) {
    pageNumInput.addEventListener('change', function() {
      const pageNumber = parseInt(this.value);
      if (pageNumber > 0 && pageNumber <= (pdfDoc ? pdfDoc.numPages : 1)) {
        pageNum = pageNumber;
        queueRenderPage(pageNum);
      }
    });
  }
  
  if (zoomSelect) {
    zoomSelect.addEventListener('change', function() {
      handleZoomChange(this.value);
    });
  }
  
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => changeZoom(1.25));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => changeZoom(0.8));
  if (rotateLeftBtn) rotateLeftBtn.addEventListener('click', () => rotatePages(-90));
  if (rotateRightBtn) rotateRightBtn.addEventListener('click', () => rotatePages(90));
}

function loadPDFJS() {
  const loading = document.querySelector('.pdfjs-loading');
  if (loading) loading.style.display = 'block';
  
  // Get PDF URL from the page
  const iframe = document.getElementById('pdf-iframe');
  if (!iframe) return;
  
  const pdfUrl = iframe.src.split('#')[0];
  
  // Check if PDF.js is available
  if (typeof pdfjsLib === 'undefined') {
    console.warn('PDF.js library not loaded');
    if (loading) loading.style.display = 'none';
    return;
  }
  
  // Set default zoom to 500%
  scale = 5.0;
  
  pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    const pageCount = document.getElementById('page-count');
    if (pageCount) {
      pageCount.textContent = pdfDoc.numPages;
    }
    
    // Set max value for page input
    const pageNumInput = document.getElementById('page-num');
    if (pageNumInput) {
      pageNumInput.max = pdfDoc.numPages;
    }
    
    // Set zoom select to 500%
    updateZoomSelect();
    
    // Render first page
    renderPage(pageNum);
    
    if (loading) loading.style.display = 'none';
  }).catch(err => {
    console.error('Error loading PDF:', err);
    showError('Failed to load PDF with PDF.js viewer');
    if (loading) loading.style.display = 'none';
  });
}

function updateZoomSelect() {
  const zoomSelect = document.getElementById('zoom-select');
  if (zoomSelect) {
    // Check if 500% option exists, if not create it
    let option500 = zoomSelect.querySelector('option[value="5"]');
    if (!option500) {
      option500 = document.createElement('option');
      option500.value = '5';
      option500.textContent = '500%';
      zoomSelect.appendChild(option500);
    }
    
    // Set to 500%
    zoomSelect.value = '5';
  }
}

function renderPage(num) {
  if (!pdfDoc) return;
  
  pageIsRendering = true;
  
  pdfDoc.getPage(num).then(page => {
    const canvas = document.getElementById('pdf-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Calculate scale based on container width
    const container = document.querySelector('.pdfjs-content');
    if (!container) return;
    
    const containerWidth = container.clientWidth - 40; // Account for padding
    const viewport = page.getViewport({ scale: 1, rotation: rotation });
    
    let calculatedScale = scale;
    const zoomSelect = document.getElementById('zoom-select');
    if (zoomSelect) {
      if (zoomSelect.value === 'auto') {
        calculatedScale = containerWidth / viewport.width;
      } else if (zoomSelect.value === 'page-width') {
        calculatedScale = containerWidth / viewport.width;
      }
    }
    
    const scaledViewport = page.getViewport({ scale: calculatedScale, rotation: rotation });
    
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    
    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport
    };
    
    page.render(renderContext).promise.then(() => {
      pageIsRendering = false;
      
      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
      
      // Update page number in input
      const pageNumInput = document.getElementById('page-num');
      if (pageNumInput) {
        pageNumInput.value = num;
      }
      
      // Update navigation buttons
      updateNavigationButtons();
    });
  });
}

function queueRenderPage(num) {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  
  if (prevBtn) prevBtn.disabled = pageNum <= 1;
  if (nextBtn) nextBtn.disabled = !pdfDoc || pageNum >= pdfDoc.numPages;
}

function handleZoomChange(zoomValue) {
  switch(zoomValue) {
    case 'auto':
    case 'page-width':
      // These are calculated in renderPage
      break;
    case 'page-actual':
      scale = 1;
      break;
    default:
      scale = parseFloat(zoomValue);
  }
  
  if (pdfDoc) {
    queueRenderPage(pageNum);
  }
}

function changeZoom(factor) {
  scale *= factor;
  scale = Math.max(0.25, Math.min(5, scale)); // Limit zoom between 25% and 500%
  
  // Update select to show custom zoom
  const zoomSelect = document.getElementById('zoom-select');
  if (zoomSelect) {
    const percentage = Math.round(scale * 100) + '%';
    zoomSelect.value = scale.toString();
    
    // If this isn't a standard zoom level, we might need to handle it differently
    if (!zoomSelect.value) {
      // Create a temporary option for custom zoom
      const existingCustom = zoomSelect.querySelector('[data-custom]');
      if (existingCustom) existingCustom.remove();
      
      const customOption = document.createElement('option');
      customOption.value = scale.toString();
      customOption.textContent = percentage;
      customOption.setAttribute('data-custom', 'true');
      customOption.selected = true;
      zoomSelect.appendChild(customOption);
    }
  }
  
  if (pdfDoc) {
    queueRenderPage(pageNum);
  }
}

function rotatePages(degrees) {
  rotation += degrees;
  rotation = rotation % 360;
  
  if (pdfDoc) {
    queueRenderPage(pageNum);
  }
}

function setupFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const pdfContainer = document.querySelector('.pdf-viewer-container');
  
  if (fullscreenBtn && pdfContainer) {
    fullscreenBtn.addEventListener('click', function() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        const targetContainer = currentViewer === 'iframe' ? pdfContainer : document.querySelector('.pdfjs-container');
        if (targetContainer) {
          targetContainer.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
          });
        }
      }
    });
  }
}

function setupPrint() {
  const printBtn = document.getElementById('print-btn');
  
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      if (currentViewer === 'iframe') {
        const iframe = document.getElementById('pdf-iframe');
        if (iframe) {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } catch (e) {
            // Fallback: open PDF in new window for printing
            window.open(iframe.src, '_blank');
          }
        }
      } else {
        // For PDF.js viewer, open PDF in new window for printing
        const iframe = document.getElementById('pdf-iframe');
        if (iframe) {
          const pdfUrl = iframe.src.split('#')[0];
          window.open(pdfUrl, '_blank');
        }
      }
    });
  }
}

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
    // Get the baseurl passed from Jekyll, or default to an empty string
    const baseUrl = '';
    
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

// Make functions globally available for onclick handlers
window.quickSearch = quickSearch;
window.changeResultsView = changeResultsView;
window.clearFilters = clearFilters;
window.clearAllSearchFilters = clearAllSearchFilters;
window.toggleFilters = toggleFilters;
window.switchViewer = switchViewer;

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
  if (pdfDoc && currentViewer === 'pdfjs') {
    // Re-render current page with new scale
    setTimeout(() => {
      queueRenderPage(pageNum);
    }, 100);
  }
});

// Debug function to check if data is loaded correctly
window.debugPYQData = function() {
  console.log('🔍 PYQ Data Debug Info:');
  console.log('📊 Total PYQs loaded:', allPYQs.length);
  console.log('🏫 Colleges available:', [...new Set(allPYQs.map(p => p.college))]);
  console.log('🎓 Branches available:', [...new Set(allPYQs.map(p => p.branch))]);
  console.log('📅 Years available:', [...new Set(allPYQs.map(p => p.year))].sort());
  console.log('📚 Sample PYQ:', allPYQs[0]);
  console.log('🌐 Global data source:', window.COLLEGE_DATA ? 'Available' : 'Missing');
  console.log('📱 Current PDF viewer:', currentViewer);
  console.log('📄 PDF document loaded:', pdfDoc ? 'Yes' : 'No');
  console.log('🔍 Current zoom scale:', scale);
};
