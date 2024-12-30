class ProjectCard extends HTMLElement {

    connectedCallback() {
        // attributes
        const previewLink = this.getAttribute('preview');
        const name = this.getAttribute('name');
        const affiliation = this.getAttribute('org');
        //categories, like frontend, but also hackathons vs personal (can use org affiliation)
        const description = this.getAttribute('description');
        const projectLink = this.getAttribute('link');
        const githubLink = this.getAttribute('github');
        const skillTags = this.getAttribute('tags');
        const startDate = this.getAttribute('start');
        const endDate = this.getAttribute('end');
        this.render(previewLink, name, affiliation, description, projectLink, githubLink, skillTags);
    }

    render(previewLink, name, affiliation, description, projectLink, githubLink, skillTags) {
      this.innerHTML = `
        <link rel="stylesheet" href="styles/components/projectCard.css">
        <div id="project-card">
            <div id="project-preview">${previewLink}</div>
            <h3 id="project-title">${name}</h3>
            <div id="project-affiliation">${affiliation}</div>
            <div id="project-tags">${skillTags}</div>
            <p id="project-description">${description}</p>
            <ul class="flex-container-row" id="project-links">
                ${projectLink != '' ? `<a href={projectLink} target="_blank" rel="noopener"><i class="material-icons">link</i></a>` : ``}
                ${githubLink != '' ? `<a href=${githubLink} target="_blank" rel="noopener"><img class="icon-logo" src="assets/brand-icons/github-logo.svg" alt="Link to my Github"></a>` : ``}
            </ul>
        </div>
      `;
    }
  }

  customElements.define('project-card', ProjectCard);