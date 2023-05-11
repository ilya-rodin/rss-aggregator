import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import ru from './locales/ru.js';
import render from './view.js';
import parse from './parser.js';

const REFRESH_TIME = 5000;

function validateUrl(url, otherUrls) {
  const schema = yup.string().trim().url().notOneOf(otherUrls);
  return schema.validate(url);
}

function getAllOriginsURL(url) {
  const allOriginsURL = new URL('https://allorigins.hexlet.app/get');
  allOriginsURL.searchParams.set('disableCache', 'true');
  allOriginsURL.searchParams.set('url', url);
  return allOriginsURL;
}

function addPosts(state, posts) {
  const newPostsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));
  state.content.posts = [...newPostsWithId, ...state.content.posts];
}

function refreshFeeds(state) {
  const { feeds } = state.content;
  const oldPosts = state.content.posts;

  const promises = feeds.map((feed) => {
    const { link } = feed;
    const allOriginsURL = getAllOriginsURL(link);
    return axios.get(allOriginsURL).then((response) => {
      const rss = response.data.contents;
      const { posts } = parse(rss);
      const oldLinks = oldPosts.map((post) => post.link);
      const newPosts = posts.filter((post) => !oldLinks.includes(post.link));
      if (newPosts.length > 0) {
        addPosts(state, newPosts);
      }
    });
  });

  Promise.all(promises).finally(() => {
    setTimeout(() => refreshFeeds(state), REFRESH_TIME);
  });
}

function runApp() {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then((i18nT) => {
      const initialState = {
        form: {
          status: 'filling',
          error: null,
        },
        content: {
          feeds: [],
          posts: [],
        },
        ui: {
          modalId: null,
          visitedIds: [],
        },
      };

      const elements = {
        form: document.querySelector('.rss-form'),
        feedback: document.querySelector('.feedback'),
        input: document.querySelector('#url-input'),
        btn: document.querySelector('button[type="submit"]'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
        modal: {
          container: document.querySelector('.modal'),
          title: document.querySelector('.modal-title'),
          body: document.querySelector('.modal-body'),
          btn: document.querySelector('.full-article'),
        },
      };

      yup.setLocale({
        mixed: { notOneOf: 'existingFeed' },
        string: { url: 'invalidLink', required: 'emptyForm' },
      });

      const watchedState = onChange(
        initialState,
        render(elements, initialState, i18nT)
      );

      refreshFeeds(watchedState);

      elements.form.addEventListener('input', () => {
        watchedState.form.status = 'filling';
        watchedState.form.error = null;
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(elements.form);
        const url = formData.get('url');
        const links = watchedState.content.feeds.map(({ link }) => link);

        validateUrl(url, links)
          .then((link) => {
            watchedState.form.status = 'sending';
            const allOriginsURL = getAllOriginsURL(link);
            return axios.get(allOriginsURL);
          })
          .then((response) => {
            const rssXML = response.data.contents;
            const { feed, posts } = parse(rssXML);
            watchedState.content.feeds.push({
              ...feed,
              id: uniqueId(),
              link: url,
            });
            addPosts(watchedState, posts);
            watchedState.form.status = 'finished';
          })
          .catch((error) => {
            const errorKey = error.message;
            watchedState.form.error = errorKey;
            watchedState.form.status = 'failed';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (id && !initialState.ui.visitedIds.includes(id)) {
          watchedState.ui.visitedIds.push(id);
        }
      });

      elements.modal.container.addEventListener('show.bs.modal', (e) => {
        const { id } = e.relatedTarget.dataset;
        if (!initialState.ui.visitedIds.includes(id)) {
          watchedState.ui.visitedIds.push(id);
        }
        watchedState.ui.modalId = id;
      });
    });
}

export default runApp;
