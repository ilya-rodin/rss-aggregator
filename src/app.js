import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

yup.setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
  mixed: {
    notOneOf: 'RSS уже существует'
  }
});

function validateUrl(url, otherUrls) {
  const schema = yup.string()
    .trim()
    .url()
    .notOneOf(otherUrls);
  return schema.validate(url);
}

function runApp() {
  const state = {
    form: {
      status: 'filling',
      error: null,
    },
    feeds: [],
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
  };

  const watchedState = onChange(state, () => render(elements, state));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    validateUrl(url, watchedState.feeds)
      .then(() => {
        watchedState.form.status = 'success';
        watchedState.feeds.push(url);
      })
      .catch((error) => {
        watchedState.form.error = error.message;
        watchedState.form.status = 'error';
      });
  });
}

export default runApp;
