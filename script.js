// script.js - Complete and Fixed Version

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginPanel = document.getElementById('login-panel');
  const registerPanel = document.getElementById('register-panel');
  const toRegister = document.getElementById('to-register');
  const toLogin = document.getElementById('to-login');

  // Toggle helpers
  function showLogin() {
    tabLogin.classList.add('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabRegister.classList.remove('active');
    tabRegister.setAttribute('aria-selected', 'false');

    loginPanel.classList.add('active');
    loginPanel.setAttribute('aria-hidden', 'false');
    registerPanel.classList.remove('active');
    registerPanel.setAttribute('aria-hidden', 'true');
  }

  function showRegister() {
    tabRegister.classList.add('active');
    tabRegister.setAttribute('aria-selected', 'true');
    tabLogin.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'false');

    registerPanel.classList.add('active');
    registerPanel.setAttribute('aria-hidden', 'false');
    loginPanel.classList.remove('active');
    loginPanel.setAttribute('aria-hidden', 'true');
  }

  tabLogin.addEventListener('click', showLogin);
  tabRegister.addEventListener('click', showRegister);
  toRegister.addEventListener('click', showRegister);
  toLogin.addEventListener('click', showLogin);

  // Password Visibility & Strength
  function enhanceForm(form) {
    const pwd = form.querySelector('input[type="password"]');
    if (!pwd) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'pw-toggle';
    pwd.parentNode.insertBefore(wrapper, pwd);
    wrapper.appendChild(pwd);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.innerText = 'Show';
    toggle.addEventListener('click', () => {
      const isPwd = pwd.type === 'password';
      pwd.type = isPwd ? 'text' : 'password';
      toggle.innerText = isPwd ? 'Hide' : 'Show';
    });
    wrapper.appendChild(toggle);

    const strength = document.createElement('div');
    strength.className = 'strength';
    const bar = document.createElement('i');
    strength.appendChild(bar);
    wrapper.parentNode.insertBefore(strength, wrapper.nextSibling);

    function updateStrength() {
      const val = pwd.value;
      let score = 0;
      if (val.length >= 6) score += 2;
      if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score += 2;
      if (/[0-9]/.test(val)) score += 2;
      
      const pct = Math.min((score / 6) * 100, 100);
      bar.style.width = pct + '%';
      if (pct < 34) bar.style.background = '#ff6b6b';
      else if (pct < 67) bar.style.background = '#ffd166';
      else bar.style.background = '#5cc8ff';
    }
    pwd.addEventListener('input', updateStrength);
  }

  enhanceForm(loginPanel);
  enhanceForm(registerPanel);

  // --- THE FIXED SUBMIT HANDLER ---
  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const roleInput = form.querySelector('input[name="role"]:checked');

    // Validation
    if (!email || !validateEmail(email)) {
      flash(form, 'Please enter a valid email.');
      return;
    }
    if (!password || password.length < 6) {
      flash(form, 'Password must be at least 6 characters.');
      return;
    }
    if (!roleInput) {
      flash(form, 'Please select a role.');
      return;
    }

    // Determine if we are logging in or registering based on the form ID
    const endpoint = form.id === 'login-panel' ? '/api/login' : '/api/register';

    // Send to Python
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password,
        role: roleInput.value
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        flash(form, 'Success! Redirecting...', 1500, true);
        
        if (form.id === 'login-panel') {
          setTimeout(() => {
            window.location.href = data.role === 'admin' ? '/admin.html' : '/student.html';
          }, 1000);
        } else {
          setTimeout(() => document.getElementById('tab-login').click(), 1500);
        }
      } else {
        flash(form, data.message); // Show error from Python (e.g. Email exists)
      }
    })
    .catch(err => {
      console.error(err);
      flash(form, 'Server error. Make sure Python app.py is running.');
    });
  }

  // Attach submit handlers
  loginPanel.addEventListener('submit', handleSubmit);
  registerPanel.addEventListener('submit', handleSubmit);

  // Helpers
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function flash(form, message, timeout = 1600, success = false) {
    const existing = form.querySelector('.__flash_msg');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = '__flash_msg';
    el.style.cssText = `
      position:relative; margin-top:10px; padding:10px; border-radius:8px; font-weight:bold;
      color:${success ? '#021026' : 'white'};
      background:${success ? '#bff1ff' : '#ff6b6b'};
      text-align:center;
    `;
    el.textContent = message;
    form.appendChild(el);
    setTimeout(() => el.remove(), timeout);
  }

  showLogin();
});