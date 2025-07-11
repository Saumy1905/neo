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
  
  // Subject filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const subjectCards = document.querySelectorAll('.subject-card');
  
  if (filterButtons.length > 0 && subjectCards.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        
        // Filter subjects
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
  
  // PDF viewer fullscreen button
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const pdfViewer = document.getElementById('pdf-viewer');
  const pdfIframe = document.getElementById('pdf-iframe');
  
  if (fullscreenBtn && pdfViewer) {
    fullscreenBtn.addEventListener('click', function() {
      if (pdfViewer.requestFullscreen) {
        pdfViewer.requestFullscreen();
      } else if (pdfViewer.mozRequestFullScreen) { /* Firefox */
        pdfViewer.mozRequestFullScreen();
      } else if (pdfViewer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        pdfViewer.webkitRequestFullscreen();
      } else if (pdfViewer.msRequestFullscreen) { /* IE/Edge */
        pdfViewer.msRequestFullscreen();
      }
    });
  }
  
  // Print PDF button
  const printBtn = document.getElementById('print-btn');
  
  if (printBtn && pdfIframe) {
    printBtn.addEventListener('click', function() {
      pdfIframe.contentWindow.focus();
      pdfIframe.contentWindow.print();
    });
  }
  
  // Search functionality
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');
  const searchQueryElement = document.getElementById('search-query');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (searchQuery && searchQueryElement) {
    searchQueryElement.textContent = searchQuery;
    
    if (searchInput) {
      searchInput.value = searchQuery;
    }
    
    if (searchResults) {
      // In a real application, you would query your site content
      // For this demo, we'll just create some dummy results
      setTimeout(() => {
        let resultsHTML = '';
        
        // Dummy data - in a real app you would search through your data
        const allSubjects = [
          { id: 'data-structures', name: 'Data Structures', category: 'computer-science', description: 'Study of organizing and storing data' },
          { id: 'algorithms', name: 'Algorithms', category: 'computer-science', description: 'Study of computational problem-solving methods' },
          { id: 'mechanics', name: 'Mechanics', category: 'physics', description: 'Study of motion and forces' },
          { id: 'circuits', name: 'Circuit Theory', category: 'engineering', description: 'Study of electrical circuits' },
          { id: 'anatomy', name: 'Anatomy', category: 'medical', description: 'Study of body structure' }
        ];
        
        const matchingSubjects = allSubjects.filter(subject => 
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          subject.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (matchingSubjects.length > 0) {
          matchingSubjects.forEach(subject => {
            resultsHTML += `
              <div class="search-result">
                <h3><a href="${site.baseurl}/subjects/${subject.id}/">${subject.name}</a></h3>
                <p>${subject.description}</p>
              </div>
            `;
          });
        } else {
          resultsHTML = '<p>No results found. Try a different search term.</p>';
        }
        
        searchResults.innerHTML = resultsHTML;
      }, 1000);
    }
  }
});