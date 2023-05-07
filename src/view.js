function render(elements, state) {
  switch (state.form.status) {
    case 'filling':
      break;

    case 'success':
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = 'RSS успешно загружен';
      elements.input.style.borderColor = '';
      elements.input.focus();
      elements.form.reset();
      break;

    case 'error':
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = state.form.error;
      elements.input.style.borderColor = 'red';
      break;

    default:
      throw new Error('Unknown status');
  }
}

export default render;
