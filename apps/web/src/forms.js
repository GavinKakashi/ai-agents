// Progressive form handling: client-side checks with accessible error
// messages, then a JSON POST to the backend. No third-party code.
(function () {
  'use strict';

  function setStatus(form, message, isError) {
    var status = form.querySelector('.form-status');
    status.textContent = message;
    status.classList.toggle('error', !!isError);
  }

  function validate(form) {
    var firstInvalid = null;
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.type === 'hidden' || el.closest('.hp')) return;
      var valid = el.checkValidity();
      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid && !firstInvalid) firstInvalid = el;
    });
    return firstInvalid;
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-api-form]').forEach(function (form) {
      if (form.hasAttribute('data-token-from-url')) {
        var token = new URLSearchParams(location.search).get('token') || '';
        form.querySelector('input[name="token"]').value = token;
        if (!token) {
          setStatus(form, 'This link is missing its token. Please use the link from your email.', true);
          form.querySelector('button').disabled = true;
        }
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var invalid = validate(form);
        if (invalid) {
          setStatus(form, 'Please check the highlighted field: ' + (invalid.validationMessage || 'it is required').replace(/\.$/, '') + '.', true);
          invalid.focus();
          return;
        }
        var data = {};
        new FormData(form).forEach(function (value, key) {
          data[key] = value;
        });
        var button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        setStatus(form, 'Sending…', false);
        fetch(form.getAttribute('data-api-form'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
          .then(function (res) {
            return res.json().then(function (body) {
              return { ok: res.ok, body: body };
            });
          })
          .then(function (r) {
            setStatus(form, r.body.message || (r.ok ? 'Done.' : 'Something went wrong.'), !r.ok);
            if (r.ok) form.reset();
          })
          .catch(function () {
            setStatus(form, 'We could not reach the server. Please try again, or email us instead.', true);
          })
          .finally(function () {
            button.disabled = false;
          });
      });
    });
  });
})();
