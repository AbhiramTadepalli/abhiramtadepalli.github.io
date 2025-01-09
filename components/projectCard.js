class ProjectCard extends HTMLElement {

    connectedCallback() {
        // attributes
        const previewLink = this.getAttribute('preview');
        const name = this.getAttribute('name');
        const affiliation = this.getAttribute('org');
        const role = this.getAttribute('role');
        //categories, like frontend, but also hackathons vs personal (can use org affiliation)
        const snippet = this.getAttribute('snippet');
        const description = this.getAttribute('description');
        const projectLink = this.getAttribute('link');
        const githubLink = this.getAttribute('github');
        const skillTags = this.getAttribute('tags');
        const startDate = this.getAttribute('start');
        const endDate = this.getAttribute('end');
        this.render(previewLink, name, affiliation, role, snippet, description, projectLink, githubLink, skillTags);
    }

    render(previewLink, name, affiliation, role, snippet, description, projectLink, githubLink, skillTags) {
      this.innerHTML = `
        <link rel="stylesheet" href="styles/components/projectCard.css">
        <div id="project-card">
          <div id="project-preview">${false ? previewLink : ''}</div>
          <h3 id="project-title">${name}</h3>
          <div id="project-affiliation">${affiliation} ${role != '' ? '– ' + role : ''}</div>
          <div class="flex-container-row" id="project-tags">${getTagsFromList(skillTags)}</div>
          <p id="project-description">${snippet}</p>
          <ul class="flex-container-row" id="project-links">
              ${projectLink != '' ? `<a href=${projectLink} target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30"><g fill="#36c"><path d="M20.437 2.69c-3.37 0-5.778 3.05-8.186 5.297.322 0 .804-.16 1.285-.16.803 0 1.605.16 2.408.48 1.284-1.283 2.568-2.727 4.494-2.727.963 0 2.087.48 2.89 1.123 1.605 1.605 1.605 4.174 0 5.78l-4.174 4.172c-.642.642-1.926 1.124-2.89 1.124-2.246 0-3.37-1.446-4.172-3.212l-2.086 2.087c1.284 2.408 3.21 4.173 6.1 4.173 1.926 0 3.69-.802 4.815-2.086l4.172-4.174c1.445-1.444 2.408-3.21 2.408-5.297-.32-3.53-3.53-6.58-7.063-6.58z"/><path d="M13.535 22.113l-1.444 1.444c-.64.642-1.925 1.124-2.89 1.124-.962 0-2.085-.48-2.888-1.123-1.605-1.605-1.605-4.334 0-5.778l4.174-4.175c.642-.642 1.926-1.123 2.89-1.123 2.246 0 3.37 1.605 4.172 3.21l2.087-2.087c-1.284-2.407-3.21-4.173-6.1-4.173-1.926 0-3.692.803-4.815 2.087L4.547 15.69c-2.73 2.73-2.73 7.063 0 9.63 2.568 2.57 7.062 2.73 9.47 0l3.05-3.05c-.482.162-.963.162-1.445.162-.803 0-1.445 0-2.087-.32z"/></g></svg></a>` : ``}
              ${githubLink != '' ? `<a href=${githubLink} target="_blank" rel="noopener"><svg class="project-icon-logo" alt="Project Repository on GitHub" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="60px" height="60px"><path fill="currentColor" d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"/></svg></a>` : ``}
          </ul>
        </div>
      `;
    }
  }

  function getTagsFromList(tags)
  {
    return tags != '' ? tags.split(", ").map((value) => `<div class="tag">` + getTagIcon(value) + `</div>`).join("\n") : ``;
  }

  function getTagIcon(tag)
  {
    switch (tag) {
      case "C++" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "CSS" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "HTML" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "Java" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "JavaScript" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "NextJS" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "Python" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "ReactJS" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "UIKit" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      case "Tailwind CSS" : return `<img class="icon" src="assets/tech-icons/` + getTagIconAddress(tag) +`"/>`;
      default : return `${tag}`;
    }
  }

  function getTagIconAddress(tag)
  {
    switch (tag) {
      case "C++" : return `c++-icon.svg`;
      case "CSS" : return `css-icon.svg`;
      case "HTML" : return `html-icon.svg`;
      case "Java" : return `java-icon.svg`;
      case "JavaScript" : return `javascript-icon.svg`;
      case "NextJS" : return `nextjs-icon.svg`;
      case "Python" : return `python-icon.svg`;
      case "ReactJS" : return `reactjs-icon.svg`;
      case "UIKit" : return `swift-icon.svg`;
      case "Tailwind CSS" : return `tailwindcss-icon.svg`;
      default : return ``;
    }
  }

  customElements.define('project-card', ProjectCard);