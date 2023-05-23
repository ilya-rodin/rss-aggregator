/* eslint object-curly-newline: "off" */

function resetForm(form) {
  form.reset();
  form.focus();
}

function renderFeeds(elements, state, i18nT) {
  const { feeds } = elements;
  feeds.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nT('feeds');

  cardBody.append(cardTitle);

  const cardList = document.createElement('ul');
  cardList.classList.add('list-group', 'border-0', 'rounder-0');

  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const liTitle = document.createElement('h3');
    liTitle.classList.add('h6', 'm-0');
    liTitle.textContent = feed.title;

    const liDescription = document.createElement('p');
    liDescription.classList.add('m-0', 'small', 'text-black-50');
    liDescription.textContent = feed.description;

    li.append(liTitle, liDescription);
    cardList.prepend(li);
  });

  card.append(cardBody, cardList);
  feeds.append(card);
}

function renderPosts(elements, state, i18nT) {
  const { posts } = elements;
  posts.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nT('posts');

  cardBody.append(cardTitle);

  const cardList = document.createElement('ul');
  cardList.classList.add('list-group', 'border-0', 'rounder-0');

  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const link = document.createElement('a');
    link.href = post.link;
    link.classList.add(
      state.ui.visitedIds.includes(post.id)
        ? ('fw-normal', 'link-secondary')
        : 'fw-bold',
    );

    link.setAttribute('data-id', post.id);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = post.title;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.setAttribute('data-id', post.id);
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#modal');
    btn.textContent = i18nT('preview');

    li.append(link, btn);
    cardList.append(li);
  });

  card.append(cardBody, cardList);
  posts.append(card);
}

function renderModal(elements, state, modalId) {
  const { modal } = elements;
  const post = state.posts.find(({ id }) => id === modalId);
  const { title, description, link } = post;
  modal.title.textContent = title;
  modal.body.textContent = description;
  modal.btn.href = link;
}

function handleFilling(elements) {
  const { feedback, input } = elements;

  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = null;
}

function handleValidating(elements) {
  const { btn, input } = elements;
  btn.disabled = true;
  input.disabled = true;
}

function handleError(elements, errorCode, i18nT) {
  const { feedback, btn, input } = elements;

  btn.disabled = false;
  input.disabled = false;

  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = i18nT(`errors.${errorCode}`);
}

function handleSuccessLoad(elements, i18nT) {
  const { feedback, btn, input, form } = elements;

  btn.disabled = false;
  input.disabled = false;

  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18nT('success');

  resetForm(form);
}

function handleStatus(elements, status, i18nT) {
  switch (status) {
    case 'filling':
    case 'loading':
      handleFilling(elements);
      break;

    case 'validating':
      handleValidating(elements);
      break;

    case 'success':
      handleSuccessLoad(elements, i18nT);
      break;

    default:
      break;
  }
}

const render = (elements, initialState, i18nT) => (path, value) => {
  switch (path) {
    case 'form.status':
    case 'loadingProcess.status':
      handleStatus(elements, value, i18nT);
      break;

    case 'form.error':
      handleError(elements, initialState.form.error, i18nT);
      break;

    case 'loadingProcess.error':
      handleError(elements, initialState.loadingProcess.error, i18nT);
      break;

    case 'feeds':
      renderFeeds(elements, initialState, i18nT);
      break;

    case 'posts':
    case 'ui.visitedIds':
      renderPosts(elements, initialState, i18nT);
      break;

    case 'ui.modalId':
      renderModal(elements, initialState, value);
      break;

    default:
      break;
  }
};

export default render;
