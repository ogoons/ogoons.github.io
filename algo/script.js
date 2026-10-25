(() => {
  const languageButton = document.querySelector('#language');
  const choices = document.querySelector('.moment-choices');
  const example = document.querySelector('.routine-example');
  const cases = {
    nfc: {
      ko: ['출발 준비, 한 번에.', 'NFC 태그를 인식하면', ['미디어 음량 설정', '화면 밝기 조절', '내비게이션 앱 실행'], 'NFC를 지원하는 기기와 NFC 태그가 필요해요.'],
      en: ['Ready to go.', 'When an NFC tag is scanned', ['Set media volume', 'Adjust screen brightness', 'Open your navigation app'], 'Requires an NFC-capable device and an NFC tag.']
    },
    car: {
      ko: ['차에 타면, 출발 준비.', '차량의 블루투스에 연결되면', ['미디어 음량 설정', '화면 밝기 조절', '내비게이션 앱 실행'], '차량 블루투스 연결을 시작으로 사용하는 예시예요.'],
      en: ['Get in. Get going.', 'When connected to your car’s Bluetooth', ['Set media volume', 'Adjust screen brightness', 'Open your navigation app'], 'An example using your car’s Bluetooth connection in a When step.']
    },
    light: {
      ko: ['내 공간을 편안하게.', 'NFC 태그를 인식하면', ['스마트 조명 켜기', '조명 밝기 조절', '조명 색상 바꾸기'], '지원하는 스마트 조명 연동과 NFC 기기·태그가 필요해요.'],
      en: ['Settle into your space.', 'When an NFC tag is scanned', ['Turn on a smart light', 'Adjust the light’s brightness', 'Change the light’s colour'], 'Requires a supported smart-light integration, NFC device and tag.']
    }
  };
  let locale = 'ko';
  let selectedCase = 'nfc';
  const translations = [...document.querySelectorAll('[data-en]')].map(element => ({ element, ko: element.innerHTML, en: element.dataset.en }));
  const altTexts = [...document.querySelectorAll('[data-en-alt]')].map(element => ({ element, ko: element.alt, en: element.dataset.enAlt }));

  function renderCase(animate = false) {
    const [title, trigger, actions, note] = cases[selectedCase][locale];
    document.querySelector('#case-title').textContent = title;
    document.querySelector('#case-trigger').textContent = trigger;
    document.querySelector('#case-actions').replaceChildren(...actions.map(action => {
      const item = document.createElement('li');
      item.textContent = action;
      return item;
    }));
    document.querySelector('#case-note').textContent = note;
    choices.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.case === selectedCase)));
    if (animate) {
      example.classList.remove('is-changing');
      requestAnimationFrame(() => example.classList.add('is-changing'));
    }
  }

  function setLocale(nextLocale) {
    locale = nextLocale;
    document.documentElement.lang = locale;
    translations.forEach(item => { item.element.innerHTML = item[locale]; });
    altTexts.forEach(item => { item.element.alt = item[locale]; });
    document.querySelectorAll('[data-shot]').forEach(image => { image.src = `./assets/${image.dataset.shot}-${locale}.webp`; });
    languageButton.textContent = locale === 'ko' ? 'English' : '한국어';
    languageButton.lang = locale === 'ko' ? 'en' : 'ko';
    choices.setAttribute('aria-label', locale === 'ko' ? '자동화 사용 사례' : 'Automation examples');
    document.querySelector('nav').setAttribute('aria-label', locale === 'ko' ? '주요 메뉴' : 'Main navigation');
    document.title = locale === 'ko' ? '알고 ALGO — 나만의 루틴, 알아서 착착.' : 'ALGO — Your routine. On autopilot.';
    const description = locale === 'ko'
      ? '기기 설정, NFC, 내비게이션, 스마트 조명. 안드로이드의 반복 작업을 알고로 자동화하세요. Google Play에서 무료로 시작하세요.'
      : 'Automate device settings, NFC, navigation and smart lights on your Android. Create your own routines with ALGO. Start free on Google Play.';
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[property="og:locale"]').content = locale === 'ko' ? 'ko_KR' : 'en_US';
    document.querySelector('meta[property="og:image"]').content = `https://ogoons.github.io/algo/assets/share-${locale}.webp`;
    document.querySelector('meta[property="og:image:alt"]').content = locale === 'ko' ? '알고 앱과 브랜드 로봇' : 'ALGO app and its robot mascot';
    renderCase();
    try { localStorage.setItem('algo-language', locale); } catch { /* The page also works when storage is unavailable. */ }
  }

  let initialLocale;
  try { initialLocale = localStorage.getItem('algo-language'); } catch { /* Default to Korean. */ }
  const requestedLocale = new URLSearchParams(location.search).get('lang');
  setLocale(['ko', 'en'].includes(requestedLocale) ? requestedLocale : initialLocale === 'en' ? 'en' : 'ko');
  languageButton.hidden = false;
  choices.hidden = false;
  languageButton.addEventListener('click', () => {
    setLocale(locale === 'ko' ? 'en' : 'ko');
    const url = new URL(location.href);
    url.searchParams.set('lang', locale);
    history.replaceState(null, '', url);
  });
  choices.addEventListener('click', event => {
    const button = event.target.closest('button[data-case]');
    if (!button) return;
    selectedCase = button.dataset.case;
    renderCase(true);
  });
  example.addEventListener('animationend', () => example.classList.remove('is-changing'));

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-arriving');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.section-intro > *, .app-copy, .app-row figure, .support-heading, .faq details, .closing-grid > div').forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });
  }
})();
