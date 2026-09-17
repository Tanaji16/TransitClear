// TransitClear i18n Multi-Language Translation System (English, Hindi, Marathi)
const translations = {
  en: {
    "nav.home": "Home",
    "nav.journey": "My Journey",
    "nav.alerts": "Alerts",
    "nav.report": "Report Problem",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "header.brand": "TransitClear",
    "header.tagline": "Road Restriction & Travel Safety",
    "greeting.sub": "Where are you going today?",
    "check.title": "Check My Journey",
    "check.subtitle": "Check if your route is affected.",
    "check.from": "From",
    "check.to": "To",
    "check.vehicle": "Vehicle",
    "check.btn": "Check My Route",
    "check.current_loc": "Use Current Location",
    "check.select_map": "Select from Map",
    "report.title": "Report Road Problem",
    "report.subtitle": "See a problem on the road? Report it so the concerned authority can verify it.",
    "report.submit": "Submit Road Problem Report",
    "profile.title": "Profile",
    "profile.subtitle": "Manage your account and preferences.",
    "profile.personal": "Personal Details",
    "profile.vehicle": "My Vehicle",
    "profile.fullname": "Full Name",
    "profile.phone": "Mobile Number",
    "profile.vtype": "Vehicle Type",
    "profile.vnum": "Vehicle Number",
    "profile.edit_details": "EDIT DETAILS",
    "profile.edit_vehicle": "EDIT VEHICLE"
  },
  hi: {
    "nav.home": "होम",
    "nav.journey": "मेरी यात्रा",
    "nav.alerts": "अलर्ट्स",
    "nav.report": "समस्या रिपोर्ट करें",
    "nav.profile": "प्रोफ़ाइल",
    "nav.logout": "लॉग आउट",
    "header.brand": "ट्रांजिटक्लियर",
    "header.tagline": "सड़क प्रतिबंध और यात्रा सुरक्षा",
    "greeting.sub": "आज आप कहाँ जा रहे हैं?",
    "check.title": "मेरी यात्रा जांचें",
    "check.subtitle": "जांचें कि क्या आपका मार्ग प्रभावित है।",
    "check.from": "कहाँ से",
    "check.to": "कहाँ तक",
    "check.vehicle": "वाहन",
    "check.btn": "मेरा मार्ग जांचें",
    "check.current_loc": "वर्तमान स्थान का उपयोग करें",
    "check.select_map": "नक्शे से चुनें",
    "report.title": "सड़क समस्या रिपोर्ट करें",
    "report.subtitle": "सड़क पर कोई समस्या देखी? रिपोर्ट करें ताकि संबंधित प्राधिकरण सत्यापन कर सके।",
    "report.submit": "सड़क रिपोर्ट सबमिट करें",
    "profile.title": "प्रोफ़ाइल",
    "profile.subtitle": "अपना खाता और प्राथमिकताएं प्रबंधित करें।",
    "profile.personal": "व्यक्तिगत विवरण",
    "profile.vehicle": "मेरा वाहन",
    "profile.fullname": "पूरा नाम",
    "profile.phone": "मोबाइल नंबर",
    "profile.vtype": "वाहन का प्रकार",
    "profile.vnum": "वाहन नंबर",
    "profile.edit_details": "विवरण संपादित करें",
    "profile.edit_vehicle": "वाहन संपादित करें"
  },
  mr: {
    "nav.home": "मुख्यपृष्ठ",
    "nav.journey": "माझा प्रवास",
    "nav.alerts": "सूचना (अलर्ट)",
    "nav.report": "समस्या नोंदवा",
    "nav.profile": "माझी माहिती",
    "nav.logout": "लॉग आउट",
    "header.brand": "ट्रान्झिटक्लियर",
    "header.tagline": "रस्ता निर्बंध व प्रवास सुरक्षा",
    "greeting.sub": "आज आपण कुठे जात आहात?",
    "check.title": "माझा प्रवास तपासा",
    "check.subtitle": "आपल्या मार्गावर निर्बंध आहेत का ते तपासा.",
    "check.from": "येथून",
    "check.to": "येथपर्यंत",
    "check.vehicle": "वाहन",
    "check.btn": "माझा मार्ग तपासा",
    "check.current_loc": "सध्याचे स्थान वापरा",
    "check.select_map": "नकाशावरून निवडा",
    "report.title": "रस्त्यावरील समस्या नोंदवा",
    "report.subtitle": "रस्त्यावर काही अडचण दिसली का? संबंधित प्राधिकरणाला तात्काळ कळवा.",
    "report.submit": "समस्या अहवाल पाठवा",
    "profile.title": "माझी माहिती",
    "profile.subtitle": "आपले खाते आणि प्राधान्ये व्यवस्थापित करा.",
    "profile.personal": "वैयक्तिक माहिती",
    "profile.vehicle": "माझे वाहन",
    "profile.fullname": "पूर्ण नाव",
    "profile.phone": "मोबाईल नंबर",
    "profile.vtype": "वाहनाचा प्रकार",
    "profile.vnum": "वाहन क्रमांक",
    "profile.edit_details": "माहिती बदला",
    "profile.edit_vehicle": "वाहन बदला"
  }
};

let currentLang = localStorage.getItem('tc_lang') || 'en';

export function setLanguage(lang) {
  if (!translations[lang]) lang = 'en';
  currentLang = lang;
  localStorage.setItem('tc_lang', lang);

  // Update active state on language buttons
  document.querySelectorAll('.lang-switcher .lang-btn').forEach(btn => {
    const text = btn.textContent.trim();
    if ((lang === 'en' && text === 'English') || 
        (lang === 'hi' && text === 'हिंदी') || 
        (lang === 'mr' && text === 'मराठी')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Apply translations to DOM
  const dict = translations[lang];

  // Nav links
  const navMap = [
    { href: 'home.html', key: 'nav.home' },
    { href: 'journey.html', key: 'nav.journey' },
    { href: 'alerts.html', key: 'nav.alerts' },
    { href: 'report-problem.html', key: 'nav.report' },
    { href: 'profile.html', key: 'nav.profile' }
  ];

  navMap.forEach(item => {
    document.querySelectorAll(`.sidebar-nav a[href*="${item.href}"] .nav-link-content span:last-child`).forEach(el => {
      if (dict[item.key]) el.textContent = dict[item.key];
    });
  });

  // Logout button
  document.querySelectorAll('.sidebar-logout-btn span:last-child').forEach(el => {
    if (dict['nav.logout']) el.textContent = dict['nav.logout'];
  });

  // Card & Header titles
  const checkTitle = document.querySelector('.card-title');
  if (checkTitle && dict['check.title']) checkTitle.textContent = dict['check.title'];
  const checkSub = document.querySelector('.card-subtitle');
  if (checkSub && dict['check.subtitle']) checkSub.textContent = dict['check.subtitle'];
  const greetSub = document.querySelector('.screen-subtitle');
  if (greetSub && dict['greeting.sub'] && window.location.pathname.includes('home')) {
    greetSub.textContent = dict['greeting.sub'];
  }
}

export function initI18n() {
  // Bind click listeners on all language switchers
  document.querySelectorAll('.lang-switcher .lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      let targetLang = 'en';
      if (text.includes('हिंदी')) targetLang = 'hi';
      else if (text.includes('मराठी')) targetLang = 'mr';
      setLanguage(targetLang);
    });
  });

  setLanguage(currentLang);
}

// Auto-run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
