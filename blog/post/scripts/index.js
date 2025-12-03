/** Make it harder for scrapers to get my email */
document.addEventListener('DOMContentLoaded', function () {
  // obfuscate the email address
  // var user = 'abhiram.tadepalli.7+portfolio'.split('').reverse().join('');
  // var domain = 'gmail.com'.split('').reverse().join('');
  // var element = document.getElementById('email-address');
  // element.addEventListener('click', function(e) { // don't add the email to the href attr, launch it onClick
  //     e.preventDefault();
  //     var email = user.split('').reverse().join('') + '@' + domain.split('').reverse().join(''); // reassemble the email address
  //     window.open('mailto:' + email, '_blank'); // open the mailto link in a new tab
  //   });

  /** Left Sidebar Dynamic Highlighting */
  const sections = document.querySelectorAll('section');
  const nav_section_titles = document.querySelectorAll('.nav-sidebar-item');
  const home_section_ids = ["../../#intro-section", "../../#experience-section", "/blog"];

  nav_section_titles.forEach((navItem, index) => {
      navItem.addEventListener('click', () => {
        window.location.href = home_section_ids[index];
      });
  });
  
function updateSidebarPosition(isBlog = false) {
    nav_section_titles.forEach((section, index) => {
      if (index != nav_section_titles.length - 1)
      {
        nav_section_titles[index].classList.remove('active');
      }
      else {
        nav_section_titles[index].classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', () => updateSidebarPosition(true));
  window.addEventListener('resize', () => updateSidebarPosition(true));
  updateSidebarPosition(true); // first time

  attachDetailsListeners();

  /** Mobile Navbar */
  const hamburger = document.getElementById('mobile-nav-button');
  const navMenu = document.getElementById('mobile-nav-menu');

  hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Update aria-expanded for accessibility
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
  });
  // close menu when clicking outside the nav menu
  document.addEventListener('click', (event) => {
    if (!navMenu.classList.contains('active') || hamburger.contains(event.target) || navMenu.contains(event.target)) return; // Do nothing if menu is already closed, click is on X, or click is inside menu
    // else, close the menu
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/** tl;dr typing animation */
window.addEventListener('load', function() {
    // Animate header in
    requestAnimationFrame(() => {
        document.querySelector('#tldr h2').classList.add('visible');
    });

    // For the text animation
    const tldr = document.querySelector('#tldr');
    const speed = 5;
    
    function getTextNodes(node) {
        const textNodes = [];
        function traverse(n) {
            if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
                textNodes.push(n);
            } else {
                n.childNodes.forEach(traverse);
            }
        }
        traverse(node);
        return textNodes;
    }
    
    const textNodes = getTextNodes(tldr);
    const originalTexts = textNodes.map(node => node.textContent);
    const parentOffsetHeights = textNodes.map(node => node.parentElement.offsetHeight);
    // Clear all text
    textNodes.forEach((node, i) => {
        if (i != 0) {
            node.textContent = '';
            node.parentElement.style.display = 'none';
        }
    });
    
    
    function typeWriter(nodeIndex, charIndex) {
        if (nodeIndex >= textNodes.length)
            return;
        if (charIndex === 0) {
            const parent = textNodes[nodeIndex].parentElement;
        
            // Measure height
            parent.style.display = parent.tagName === 'LI' ? 'list-item' : 'block';
            const fullHeight = parentOffsetHeights[nodeIndex];
            
            // Start from 0 height and animate
            parent.style.height = '0px';
            parent.style.transition = 'height 0.3s ease-out';
            
            // Trigger height animation
            setTimeout(() => {
                parent.style.height = fullHeight + 'px';
            }, speed*20);
        }
        if (charIndex < originalTexts[nodeIndex].length) {
            const span = document.createElement('span');
            span.textContent = originalTexts[nodeIndex].charAt(charIndex);
            span.style.opacity = '0';
            span.style.animation = 'fadeIn 0.3s ease-in forwards';
            // textNodes[nodeIndex].textContent += ;
            textNodes[nodeIndex].parentElement.appendChild(span);
            setTimeout(() => typeWriter(nodeIndex, charIndex + 1), speed);
        } 
        if (charIndex === Math.floor(originalTexts[nodeIndex].length / 2)) {
            typeWriter(nodeIndex + 1, 0);
        }
        else if (charIndex >= originalTexts[nodeIndex].length) {
            textNodes[nodeIndex].parentElement.style.height = 'fit-content' // set to fit-content after animation (during animation, it uses a calculated px height)
        }
    }
    
    setTimeout(() => {
        typeWriter(1, 0); // skip header
    }, 100); // Wait for a little bit until header starts animating
});

/** For collapsible code chunks, scrolls into view on close */
function attachDetailsListeners() {
    const detailsElements = document.querySelectorAll('details');
    
    detailsElements.forEach(details => {
        const codeContainer = details.querySelector('.code-container');
        const summary = details.querySelector('summary');

        summary.addEventListener('click', (e) => {
            // Check if details is currently open
            if (details.hasAttribute('open')) {
                // Prevent the default close behavior
                e.preventDefault();

                // Scroll summary into view
                // Check if summary is already in viewport
                const rect = summary.getBoundingClientRect();
                const targetScrollTop = details.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
                const isInViewport = (
                    rect.top >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.left >= 0 &&
                    rect.right <= window.innerWidth
                );
                
                // Only scroll if not already visible
                if (!isInViewport) {
                    // Scroll with offset using window.scrollTo
                    window.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                    });
                }
                
                // Add closing class for animation
                details.classList.add('closing');
                
                // Wait for animation to complete, then actually close
                setTimeout(() => {
                    details.removeAttribute('open');
                    details.classList.remove('closing');
                }, 500); // Match your CSS transition duration
            } else {
                // Opening
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        codeContainer.style.maxHeight = codeContainer.scrollHeight + 'px';
                    });
                }); // to fix safari bug
                // First, temporarily remove max-height to measure
                codeContainer.style.transition = 'none';
                codeContainer.style.maxHeight = 'none';
                const height = codeContainer.scrollHeight;
                
                // Reset to 0
                codeContainer.style.maxHeight = '0';
                
                // Force browser reflow
                codeContainer.offsetHeight;
                
                // Re-enable transition and animate
                codeContainer.style.transition = '';
                setTimeout(() => {
                    codeContainer.style.maxHeight = height + 'px';
                }, 10);
            }
        });
    });
}