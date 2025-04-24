// ====== MENU DE CONFIGURACIÓN ======
function toggleConfig() {
    const menu = document.getElementById('config-menu');
    menu.classList.toggle('hidden');
  }
  
  // ====== VISIBILIDAD DE DISCIPLINAS ======
  function toggleDiscipline(discipline) {
    const map = {
      bjj: 'bjj-belt-wrapper',
      kb: 'kb-belt',
      wrestling: 'wrestling-belt'
    };
    const elemId = map[discipline];
    const el = document.getElementById(elemId).parentElement;
    const visible = el.style.display !== 'none';
  
    el.style.display = visible ? 'none' : 'block';
    saveSettings();
  }
  
  // ====== CAMBIO DE COLOR DE CINTURÓN ======
  function setBeltColor(beltId, color) {
    const belt = document.getElementById(beltId);
    belt.style.backgroundColor = color;
    saveSettings();
  }
  
  // ====== RAYAS DE JIU JITSU ======
  function setStripes(count) {
    const stripes = document.querySelectorAll('#bjj-belt-wrapper .stripe');
    stripes.forEach((dot, index) => {
      dot.style.opacity = index < count ? '1' : '0.3';
    });
    localStorage.setItem('bjjStripes', count);
  }
  
  // ====== DAR ME GUSTA A UNA PUBLICACIÓN ======
  function likePost(button) {
    if (button.classList.contains('liked')) {
      button.classList.remove('liked');
      button.innerText = '❤️ Me gusta';
    } else {
      button.classList.add('liked');
      button.innerText = '💖 Te gusta';
    }
  }
  
  // ====== GUARDAR CONFIGURACIÓN ======
  function saveSettings() {
    const settings = {
      bjjVisible: document.getElementById('bjj-belt-wrapper').parentElement.style.display !== 'none',
      kbVisible: document.getElementById('kb-belt').parentElement.style.display !== 'none',
      wrestlingVisible: document.getElementById('wrestling-belt').parentElement.style.display !== 'none',
      bjjColor: document.getElementById('bjj-belt').style.backgroundColor,
      kbColor: document.getElementById('kb-belt').style.backgroundColor,
      wrestlingColor: document.getElementById('wrestling-belt').style.backgroundColor
    };
    localStorage.setItem('mmaSettings', JSON.stringify(settings));
  }
  
  // ====== CARGAR CONFIGURACIÓN AL INICIO ======
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('mmaSettings'));
    if (!settings) return;
  
    document.getElementById('bjj-belt-wrapper').parentElement.style.display = settings.bjjVisible ? 'block' : 'none';
    document.getElementById('kb-belt').parentElement.style.display = settings.kbVisible ? 'block' : 'none';
    document.getElementById('wrestling-belt').parentElement.style.display = settings.wrestlingVisible ? 'block' : 'none';
  
    document.getElementById('bjj-belt').style.backgroundColor = settings.bjjColor || 'blue';
    document.getElementById('kb-belt').style.backgroundColor = settings.kbColor || 'green';
    document.getElementById('wrestling-belt').style.backgroundColor = settings.wrestlingColor || 'purple';
  
    const stripeCount = localStorage.getItem('bjjStripes') || 0;
    setStripes(stripeCount);
  }
  
  // Ejecutar automáticamente al cargar la página
  window.onload = loadSettings;
  