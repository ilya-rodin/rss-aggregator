import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index.js';
import locale from './locales/locale.js';
import render from './view.js';

function validateUrl(url, otherUrls) {
  const schema = yup
    .string()
    .trim()
    .url()
    .notOneOf(otherUrls);
  return schema.validate(url);
}

function runApp(i18n) {
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

  const watchedState = onChange(state, () => render(elements, state, i18n));

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

export default () => {
  const i18n = i18next.createInstance();

  i18n.init({
    lng: 'ru',
    resources,
  })
    .then(() => {
      yup.setLocale(locale);
      runApp(i18n);
    });
};
