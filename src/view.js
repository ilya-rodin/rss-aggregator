function resetForm(form) {
  form.reset();
  form.focus();
}

function setFeedbackError(errorCode, elements, i18n) {
  const { feedback, input, form } = elements;

  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = i18n.t(`errors.${errorCode}`);
  resetForm(form);
}

function setFeedbackSuccess(elements, i18n) {
  const { feedback, input, form } = elements;

  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('success');
  resetForm(form);
}

function render(elements, state, i18n) {
  switch (state.form.status) {
    case 'filling':
      break;

    case 'success':
      setFeedbackSuccess(elements, i18n);
      break;

    case 'error':
      setFeedbackError(state.form.error, elements, i18n);
      break;

    default:
      throw new Error('Unknown status');
  }
}

export default render;
