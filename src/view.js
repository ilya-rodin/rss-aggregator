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

  state.content.feeds.forEach((feed) => {
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

  state.content.posts.forEach((post) => {
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
    link.classList.add(state.ui.visitedIds.includes(post.id)
      ? ('fw-normal', 'link-secondary')
      : 'fw-bold');

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
  const post = state.content.posts.find(({ id }) => id === modalId);
  const { title, description, link } = post;
  modal.title.textContent = title;
  modal.body.textContent = description;
  modal.btn.href = link;
}

function handleFormFilling(elements) {
  const { feedback, input } = elements;

  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = null;
}

function handleFormSending(elements) {
  const { btn, input } = elements;
  btn.disabled = true;
  input.disabled = true;
}

function handleFormError(errorCode, elements, i18nT) {
  const {
    feedback, btn, input, form
  } = elements;

  btn.disabled = false;
  input.disabled = false;

  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = i18nT(`errors.${errorCode.replace(' ', '')}`);
  resetForm(form);
}

function handleFormSuccess(elements, i18nT) {
  const {
    feedback, btn, input, form
  } = elements;

  btn.disabled = false;
  input.disabled = false;

  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18nT('success');

  resetForm(form);
}

function handleFormStatus(elements, state, formState, i18nT) {
  switch (formState) {
    case 'filling':
      handleFormFilling(elements);
      break;

    case 'sending':
      handleFormSending(elements);
      break;

    case 'finished':
      handleFormSuccess(elements, i18nT);
      break;

    case 'failed':
      handleFormError(state.form.error, elements, i18nT);
      break;

    default:
      throw new Error('Unknown status');
  }
}

const render = (elements, initialState, i18nT) => (path, value) => {
  switch (path) {
    case 'form.status':
      handleFormStatus(elements, initialState, value, i18nT);
      break;

    case 'content.feeds':
      renderFeeds(elements, initialState, i18nT);
      break;

    case 'content.posts':
    case 'ui.visitedIds':
      renderPosts(elements, initialState, i18nT);
      break;

    case 'ui.modalId':
      renderModal(elements, initialState, value);
      break;

    default:
      throw new Error('unknown path');
  }
};

export default render;
