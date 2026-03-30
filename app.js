// ===== STORE MODULE =====
const Store = {
  generateId() {
    return (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },
  getAll(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  get(key, id) {
    return this.getAll(key).find(r => r.id === id) || null;
  },
  add(key, record) {
    record.id = this.generateId();
    record.createdAt = new Date().toISOString();
    const data = this.getAll(key);
    data.push(record);
    this.save(key, data);
    return record;
  },
  update(key, id, updates) {
    const data = this.getAll(key);
    const idx = data.findIndex(r => r.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(key, data);
    return data[idx];
  },
  remove(key, id) {
    const data = this.getAll(key).filter(r => r.id !== id);
    this.save(key, data);
  },
  query(key, fn) {
    return this.getAll(key).filter(fn);
  },
  exportAll() {
    const keys = ['cm_locations','cm_facilities','cm_fodder_types','cm_fodder_inventory',
      'cm_fodder_schedules','cm_cows','cm_health_records','cm_breeding_records',
      'cm_pregnancy_tracking','cm_calving_records','cm_weaning_records'];
    const data = {};
    keys.forEach(k => data[k] = this.getAll(k));
    return data;
  },
  importAll(json) {
    Object.entries(json).forEach(([k, v]) => {
      if (k.startsWith('cm_') && Array.isArray(v)) this.save(k, v);
    });
  }
};

// ===== UI HELPERS =====
const UI = {
  openModal(title, html) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
  },
  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  },
  showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  },
  confirmDelete(name) {
    return confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`);
  },
  formatDate(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  formatDateTime(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  daysBetween(d1, d2) {
    return Math.round((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
  },
  compressImage(file, maxW = 300, maxH = 300, quality = 0.7) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxW) { h = h * maxW / w; w = maxW; }
          if (h > maxH) { w = w * maxH / h; h = maxH; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },
  buildSelect(options, selected = '', placeholder = 'Select...') {
    let html = `<option value="">${placeholder}</option>`;
    options.forEach(o => {
      const val = typeof o === 'object' ? o.value : o;
      const label = typeof o === 'object' ? o.label : o;
      html += `<option value="${val}" ${val === selected ? 'selected' : ''}>${label}</option>`;
    });
    return html;
  },
  getCowName(id) {
    const cow = Store.get('cm_cows', id);
    return cow ? `${cow.name || cow.earTag} (${cow.earTag})` : 'Unknown';
  },
  getFacilityName(id) {
    const f = Store.get('cm_facilities', id);
    return f ? f.shedName : 'Unknown';
  },
  updateStorageIndicator() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2;
      }
    }
    const mb = (total / (1024 * 1024)).toFixed(2);
    const el = document.getElementById('storageIndicator');
    if (el) el.textContent = `Storage: ${mb} MB`;
  }
};

// ===== ROUTER =====
const Router = {
  showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');
    const navEl = document.querySelector(`.nav-menu li[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');
    const titles = {
      dashboard: 'Dashboard', locations: 'Locations', facilities: 'Facilities',
      fodder: 'Fodder Management', cows: 'Cow Identification', health: 'Health Records',
      breeding: 'Breeding & Pregnancy', calving: 'Calving', weaning: 'Weaning',
      milk: 'Milk Production', vaccination: 'Vaccination Schedule', disease: 'Disease Tracking',
      deworming: 'Deworming Log', vetvisits: 'Veterinary Visits', alerts: 'Alerts & Notifications'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    location.hash = page;
    // Render page
    const renderers = {
      dashboard: () => Dashboard.render(),
      locations: () => Locations.render(),
      facilities: () => Facilities.render(),
      fodder: () => Fodder.render(),
      cows: () => Cows.render(),
      health: () => Health.render(),
      breeding: () => Breeding.render(),
      calving: () => Calving.render(),
      weaning: () => Weaning.render(),
      milk: () => MilkProduction.render(),
      vaccination: () => Vaccination.render(),
      disease: () => DiseaseTracking.render(),
      deworming: () => Deworming.render(),
      vetvisits: () => VetVisits.render(),
      alerts: () => Alerts.render()
    };
    if (renderers[page]) renderers[page]();
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  },
  init() {
    document.querySelectorAll('.nav-menu li').forEach(li => {
      li.addEventListener('click', () => Router.showPage(li.dataset.page));
    });
    // Hamburger
    document.getElementById('hamburger').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebarClose').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
    });
    // Tabs
    document.querySelectorAll('.tab-bar').forEach(bar => {
      bar.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const parent = tab.closest('section') || tab.closest('.page');
          parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          const content = parent.querySelector(`#${tab.dataset.tab}`);
          if (content) content.classList.add('active');
        });
      });
    });
    // Modal close on backdrop
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) UI.closeModal();
    });
    // Export / Import
    document.getElementById('exportBtn').addEventListener('click', () => {
      const data = JSON.stringify(Store.exportAll(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cow-management-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      UI.showToast('Data exported successfully');
    });
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target.result);
          Store.importAll(json);
          UI.showToast('Data imported successfully');
          Router.showPage('dashboard');
        } catch { UI.showToast('Invalid file format', 'error'); }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
    // Hash routing
    const hash = location.hash.replace('#', '');
    if (hash) Router.showPage(hash);
    else Router.showPage('dashboard');
  }
};

// ===== DASHBOARD =====
const Dashboard = {
  render() {
    const cows = Store.getAll('cm_cows');
    const activeCows = cows.filter(c => c.status === 'active');
    const pregnancies = Store.getAll('cm_pregnancy_tracking').filter(p => p.status === 'confirmed' || p.status === 'in-progress');
    const lowStock = Store.getAll('cm_fodder_inventory').filter(i => i.quantityInStock <= i.reorderLevel);
    const facilities = Store.getAll('cm_facilities');

    // Stat cards
    document.getElementById('dashboardCards').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon green">&#x1F404;</div>
        <div class="stat-info">
          <h4>Total Cows</h4>
          <div class="stat-number">${activeCows.length}</div>
          <div class="stat-sub">${cows.length} total registered</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">&#x1F3E0;</div>
        <div class="stat-info">
          <h4>Facilities</h4>
          <div class="stat-number">${facilities.length}</div>
          <div class="stat-sub">${facilities.reduce((s,f) => s + (f.currentOccupancy||0), 0)} occupied</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">&#x1F930;</div>
        <div class="stat-info">
          <h4>Active Pregnancies</h4>
          <div class="stat-number">${pregnancies.length}</div>
          <div class="stat-sub">${pregnancies.filter(p => {
            const days = UI.daysBetween(new Date(), p.expectedCalvingDate);
            return days >= 0 && days <= 30;
          }).length} due within 30 days</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">&#x26A0;&#xFE0F;</div>
        <div class="stat-info">
          <h4>Active Alerts</h4>
          <div class="stat-number">${lowStock.length + Store.getAll('cm_vaccinations').filter(v=>v.status!=='Completed'&&v.status!=='Cancelled'&&v.dueDate&&v.dueDate<new Date().toISOString().split('T')[0]).length + Store.getAll('cm_diseases').filter(d=>d.status==='Under Treatment'||d.status==='Quarantined').length}</div>
          <div class="stat-sub">${lowStock.length} low stock, ${Store.getAll('cm_diseases').filter(d=>d.status==='Under Treatment'||d.status==='Quarantined').length} disease cases</div>
        </div>
      </div>
    `;
    // Today's milk
    const todayMilk = Store.getAll('cm_milk_daily').filter(r => r.date === new Date().toISOString().split('T')[0]);
    const totalMilk = todayMilk.reduce((s,r) => s+(parseFloat(r.morningYield)||0)+(parseFloat(r.eveningYield)||0), 0);
    document.getElementById('dashboardCards').innerHTML += `
      <div class="stat-card">
        <div class="stat-icon blue">&#x1F95B;</div>
        <div class="stat-info">
          <h4>Today's Milk</h4>
          <div class="stat-number">${totalMilk.toFixed(1)} L</div>
          <div class="stat-sub">${todayMilk.length} cows milked</div>
        </div>
      </div>
    `;

    // Recent activity
    const allRecords = [];
    const addRecords = (key, type) => Store.getAll(key).forEach(r => allRecords.push({ ...r, _type: type }));
    addRecords('cm_cows', 'Cow');
    addRecords('cm_health_records', 'Health');
    addRecords('cm_breeding_records', 'Breeding');
    addRecords('cm_calving_records', 'Calving');
    addRecords('cm_weaning_records', 'Weaning');
    addRecords('cm_milk_daily', 'Milk');
    addRecords('cm_vaccinations', 'Vaccination');
    addRecords('cm_diseases', 'Disease');
    addRecords('cm_deworming', 'Deworming');
    addRecords('cm_vet_visits', 'Vet Visit');
    allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const recentEl = document.getElementById('recentActivity');
    if (allRecords.length === 0) {
      recentEl.innerHTML = '<div class="empty-state"><p>No activity yet. Start by adding locations and cows.</p></div>';
    } else {
      recentEl.innerHTML = allRecords.slice(0, 10).map(r => {
        let desc = '';
        if (r._type === 'Cow') desc = `New cow added: ${r.name || r.earTag}`;
        else if (r._type === 'Health') desc = `Health record: ${r.description?.substring(0, 40) || 'checkup'}`;
        else if (r._type === 'Breeding') desc = `Breeding recorded: ${r.serviceType}`;
        else if (r._type === 'Calving') desc = `Calving event recorded`;
        else if (r._type === 'Weaning') desc = `Weaning recorded`;
        else if (r._type === 'Milk') desc = `Milk recorded: ${UI.getCowName(r.cowId)}`;
        else if (r._type === 'Vaccination') desc = `Vaccination: ${r.vaccineName}`;
        else if (r._type === 'Disease') desc = `Disease reported: ${r.diseaseName}`;
        else if (r._type === 'Deworming') desc = `Deworming: ${r.drugName}`;
        else if (r._type === 'Vet Visit') desc = `Vet visit: ${r.purpose}`;
        return `<div class="activity-item">
          <div><span class="badge badge-info">${r._type}</span> ${desc}</div>
          <div class="activity-time">${UI.formatDateTime(r.createdAt)}</div>
        </div>`;
      }).join('');
    }

    // Alerts
    const alertsEl = document.getElementById('dashboardAlerts');
    let alerts = '';
    lowStock.forEach(i => {
      const ft = Store.get('cm_fodder_types', i.fodderTypeId);
      alerts += `<div class="alert-item warning">&#x26A0; Low stock: ${ft ? ft.name : 'Unknown'} (${i.quantityInStock} remaining)</div>`;
    });
    const healthRecords = Store.getAll('cm_health_records');
    healthRecords.filter(h => h.nextFollowUp && new Date(h.nextFollowUp) <= new Date()).forEach(h => {
      alerts += `<div class="alert-item danger">&#x23F0; Overdue follow-up: ${h.description?.substring(0, 30)}</div>`;
    });
    pregnancies.filter(p => {
      const days = UI.daysBetween(new Date(), p.expectedCalvingDate);
      return days >= 0 && days <= 14;
    }).forEach(p => {
      const cow = Store.get('cm_cows', p.cowId);
      alerts += `<div class="alert-item info">&#x1F930; ${cow ? cow.name || cow.earTag : 'Cow'} due in ${UI.daysBetween(new Date(), p.expectedCalvingDate)} days</div>`;
    });
    if (!alerts) alerts = '<div class="empty-state"><p>No alerts at this time.</p></div>';
    alertsEl.innerHTML = alerts;

    // Breed chart
    this.renderBreedChart(activeCows);
    UI.updateStorageIndicator();
  },

  renderBreedChart(cows) {
    const canvas = document.getElementById('breedChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const breeds = {};
    cows.forEach(c => { breeds[c.breed || 'Unknown'] = (breeds[c.breed || 'Unknown'] || 0) + 1; });
    const entries = Object.entries(breeds).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (entries.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#6B7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No cow data available', canvas.width / 2, canvas.height / 2);
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 250 * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.height = '250px';
    const w = rect.width, h = 250;
    ctx.clearRect(0, 0, w, h);
    const maxVal = Math.max(...entries.map(e => e[1]));
    const barW = Math.min(50, (w - 60) / entries.length - 10);
    const startX = 50;
    const chartH = h - 50;
    const colors = ['#2E7D32','#4CAF50','#66BB6A','#81C784','#A5D6A7','#C8E6C9','#FF8F00','#FFB74D'];
    entries.forEach(([breed, count], i) => {
      const barH = (count / maxVal) * (chartH - 20);
      const x = startX + i * (barW + 10);
      const y = chartH - barH;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();
      ctx.fillStyle = '#1A1A2E';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(count, x + barW / 2, y - 6);
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Inter, sans-serif';
      const label = breed.length > 8 ? breed.substring(0, 7) + '..' : breed;
      ctx.fillText(label, x + barW / 2, chartH + 16);
    });
  }
};

// ===== LOCATION HIERARCHY DATA =====
const LocationHierarchy = {
  countries: ["India", "USA"],
  states: {
    "India": [
      "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
      "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
      "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
      "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
      "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
      "Ladakh","Lakshadweep","Puducherry"
    ],
    "USA": [
      "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
      "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
      "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
      "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
      "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
      "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
      "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
      "Wisconsin","Wyoming"
    ]
  },
  districts: {
    "Uttar Pradesh": [
      "Agra","Aligarh","Ambedkar Nagar","Amethi","Amroha","Auraiya","Ayodhya",
      "Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki",
      "Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli",
      "Chitrakoot","Deoria","Etah","Etawah","Farrukhabad","Fatehpur","Firozabad",
      "Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur",
      "Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj",
      "Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kushinagar",
      "Lakhimpur Kheri","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri",
      "Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit",
      "Pratapgarh","Prayagraj","Raebareli","Rampur","Saharanpur","Sambhal",
      "Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti","Siddharthnagar",
      "Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"
    ]
  },
  tahasils: {
    "Sitapur": [
      "Sitapur","Misrikh","Biswan","Laharpur","Mahmoodabad","Sidhauli"
    ]
  },
  blocks: {
    "Sitapur": [
      "Sitapur","Hargaon","Parsendi","Khairabad","Laharpur","Biswan","Sevata",
      "Pahala","Reusa","Kasmanda","Machrehta","Misrikh","Pisawan","Ailiya",
      "Ramkot","Gondlamau","Gondalomau","Sakran","Behta","Mahmoodabad","Sidhauli"
    ]
  },
  // Tahasil-to-block mapping for Sitapur
  tahasilBlocks: {
    "Sitapur": ["Sitapur","Hargaon","Parsendi","Khairabad"],
    "Misrikh": ["Misrikh","Pisawan","Machrehta"],
    "Biswan": ["Biswan","Sevata","Pahala","Reusa"],
    "Laharpur": ["Laharpur","Kasmanda","Ailiya"],
    "Mahmoodabad": ["Mahmoodabad","Gondlamau","Gondalomau","Ramkot","Behta"],
    "Sidhauli": ["Sidhauli","Sakran"]
  },
  panchayats: {
    "Sitapur": [
      "Aamapur","Ahirauli","Ainjhi","Alaulapur","Alipur","Amaniganj","Atariya",
      "Babuganj","Baghla","Bakshi Ka Purwa","Bandi","Bangawa","Bankipur",
      "Barauna","Bhagwantpur","Bharawan","Bhujaini","Bishnupur","Chandapur",
      "Dadraul","Daudpur","Dhakwa","Digwara","Fatehpur","Gadanpur","Ganeshpur",
      "Ghasitpur","Gopalpur","Gumtara","Haidarpur","Ikauna","Jahangirpur",
      "Jiwatipur","Jogiya","Kalwari","Kamlapur","Kanthiya","Katia","Khalispur",
      "Kotra","Lalapur","Madhoganj","Mahewa","Maholi","Mallanpur","Manpur",
      "Misripur","Mohanpur","Nawabganj","Pahladpur","Pokharpur","Purwa","Raghunathpur",
      "Rahimpur","Raipur","Ramganj","Rampur Kala","Rasulpur","Raunapar","Saifabad",
      "Salempur","Sandwa","Sarayan","Semra","Shahpur","Singahi","Sonda","Tanda",
      "Tikra","Udaipur"
    ],
    "Hargaon": [
      "Abhaipur","Adhauli","Ahmedpur","Ambarpur","Ataura","Baburia","Bahadurpur",
      "Bahraich Purwa","Bakhtawarpur","Banthra","Barhpura","Belapur","Bhagwantipur",
      "Bhaisa","Bharatipur","Bhawanipur","Bhiti","Bisundaspur","Chandpur",
      "Dariyapur","Daulra","Devipur","Dhanipur","Dhaurahara","Dhuripur","Ganeshnagar",
      "Garhia","Ghosipura","Gokulpur","Gulalpur","Haidarabad","Hardaspur",
      "Hargaon Dehat","Husainpur","Imampur","Jafarpur","Jagdishpur","Jahanpur",
      "Kailashpur","Kamalpur","Khamhaua","Khiria","Korauna","Lakhanpur","Mahorana",
      "Manoharpur","Muhammadpur","Nabipur","Nandpur","Parsauli","Piprawan","Puranpur",
      "Raghunathpur","Ramnagar","Rasulpur","Saadatpur","Saidanpur","Saidpur",
      "Salempur","Sherpur","Singhpur","Sitalpur","Sundarpur","Tikari","Umarpur"
    ],
    "Parsendi": [
      "Amritpur","Ashrafpur","Badagaon","Bahadurnagar","Bahrauli","Bakainiya",
      "Balampur","Bandhwa","Barauli","Bhaisunda","Bharaipur","Bharkhani","Bhaupur",
      "Bibipur","Bisunpur","Chandika","Dariyapur","Dhaurahra","Durgapur",
      "Faridpur","Fatehpur","Gadhia","Gajpur","Gaura","Gopalpur","Gulariha",
      "Haidarpur","Hardoi","Harpur","Husainabad","Jagatpur","Jahangirganj",
      "Kakraha","Kamalpur","Kanchanpur","Kankaha","Khajuriha","Lakhnapur",
      "Mandhata","Mariahu","Miyanganj","Mohanpur","Motipur","Narayanpur","Parsendi Dehat",
      "Purwa","Ramdattpur","Ramnathpur","Rasulpur","Sahilamau","Saidpur","Salamatpur",
      "Sanda","Shankarpur","Shivpur","Sikrora","Sultanpur","Tindauli","Utraula"
    ],
    "Khairabad": [
      "Adilpur","Ahmedpur","Ajmatpur","Alauddinpur","Amritpur","Asafpur","Atwa",
      "Babuganj","Badanpur","Bahadurpur","Bahrampur","Bandhwa","Barabanki",
      "Belhara","Bhagwantpur","Bhatauli","Bhojpur","Chandausi","Dalipnagar",
      "Dargahpur","Dayalpur","Devidaspur","Dhanaura","Dhanaupur","Dilawarnagar",
      "Fatehullahpur","Ganeshnagar","Govindpur","Gulalpur","Haidergarh",
      "Hajipur","Hanumanpur","Husainpur","Ibrahimpur","Inayatpur","Isanagar",
      "Jafarabad","Jairampur","Kamlapur","Karimabad","Keshopur","Khairabad Dehat",
      "Khalispur","Kudawal","Lakshmanpur","Maheshpur","Mahmudpur","Malihabad",
      "Manpur","Mohammadpur","Mubarakpur","Nabipur","Nasirpur","Pahladpur",
      "Ramchandrapur","Rasulpur","Sahjahanpur","Saifpur","Shahjahanpur","Sherpur",
      "Sikandarpur","Sultanpur","Talgaon","Umapur"
    ],
    "Laharpur": [
      "Ahamadpur","Akbarpur","Alipur","Amanpur","Amritpur","Badhauli","Baghrai",
      "Bahrampur","Bakhtiarpur","Barauna","Barkhera","Bawan","Bhagwanpur",
      "Bhawanipur","Bikapur","Chandpur","Dalpatpur","Daulatpur","Dhakwa","Dhamna",
      "Dilawarnagar","Dostpur","Fatehpur","Gausganj","Girdharpur","Gopalpur",
      "Gursahaiganj","Harishpur","Hasanpur","Hisampur","Husainpur","Imamganj",
      "Jagdishpur","Jalalpur","Kamalpur","Karnapur","Keshopur","Khagapur",
      "Kherauj","Kurauna","Laharpur Dehat","Mahadeopur","Maheshpur","Malkpur",
      "Manpur","Mariawan","Mawai","Mohammadpur","Mukundpur","Narayanpur",
      "Nawabganj","Pakhrauli","Parsanda","Pathkhauli","Purwa","Raghunathpur",
      "Raipur","Rampur","Rasulpur","Saidanpur","Saidpur","Salempur",
      "Shahpur","Shivdaspur","Sikrauli","Sultanpur","Terwa"
    ],
    "Biswan": [
      "Adilpur","Ahmedabad","Ajaipur","Alahdadpur","Alamnagar","Amritpur",
      "Atauli","Badipur","Bahrampur","Bakhtiarpur","Balrampur","Bandhwa",
      "Barauli","Bhagwantpur","Bhainsahi","Bharawan","Bhaupur","Bilaspur",
      "Biswan Dehat","Chandapur","Dariyapur","Daulpur","Devipur","Dhakarwa",
      "Dhanipur","Fatehpur","Ganeshnagar","Ghatampur","Gopalpur","Gulalpur",
      "Haiderabad","Hardoi","Hasanpur","Hussainpur","Jahangirpur","Jaisinghpur",
      "Jalalpur","Kamalpur","Karimpur","Keshavpur","Khajuriha","Komalpur",
      "Lakhnapur","Maheshpur","Mahmudpur","Manikpur","Maqboolpur","Mohanpur",
      "Mubarakpur","Naimisharanya","Narayanpur","Nawabganj","Pahladpur","Piprawan",
      "Purwa","Raghunathpur","Ramnagar","Rasulpur","Sahilamau","Saidpur",
      "Shahpur","Shivapur","Sultanpur","Tikari"
    ],
    "Sevata": [
      "Ahmedpur","Alawalpur","Amritpur","Ataura","Baburia","Bahadurpur",
      "Banhara","Barauli","Bela","Bhagwantpur","Bhanpur","Bhawanipur",
      "Bikapur","Chandpur","Dariyapur","Daulatpur","Devipur","Dhakwa",
      "Dhanaupur","Fatehpur","Ganeshnagar","Gopalpur","Gulalpur","Haidarpur",
      "Hasanpur","Husainpur","Jafarpur","Jagdishpur","Jalalpur","Kamalpur",
      "Keshopur","Korauna","Lakhnapur","Maheshpur","Manpur","Mohammadpur",
      "Mubarakpur","Narayanpur","Pahladpur","Purwa","Ramnagar","Rasulpur",
      "Saifpur","Saidpur","Shahpur","Sherpur","Sultanpur","Tikari"
    ],
    "Pahala": [
      "Ajaipur","Akbarpur","Alahdadpur","Alamnagar","Bahrampur","Bakhtiarpur",
      "Bandhwa","Barauna","Bhagwantpur","Bhainsahi","Bhawanipur","Chandapur",
      "Dargahpur","Dariyapur","Daulpur","Devipur","Dhakarwa","Fatehpur",
      "Ganeshnagar","Gopalpur","Gulalpur","Haiderabad","Hardoi","Hasanpur",
      "Hussainpur","Jahangirpur","Jaisinghpur","Jalalpur","Kamalpur","Karimpur",
      "Keshavpur","Khajuriha","Lakhnapur","Maheshpur","Mahmudpur","Manikpur",
      "Mohanpur","Mubarakpur","Narayanpur","Nawabganj","Pahladpur","Piprawan",
      "Purwa","Ramnagar","Rasulpur","Saidpur","Shahpur","Sultanpur"
    ],
    "Reusa": [
      "Adilpur","Ahmedpur","Amritpur","Bahadurpur","Bahrauli","Bakainiya",
      "Barauli","Bhagwantpur","Bharaipur","Bhaupur","Bibipur","Bisunpur",
      "Chandpur","Dariyapur","Dhaurahra","Durgapur","Faridpur","Fatehpur",
      "Gopalpur","Haidarpur","Husainabad","Jagatpur","Kamalpur","Kanchanpur",
      "Keshopur","Lakhnapur","Mandhata","Mohanpur","Motipur","Narayanpur",
      "Purwa","Ramdattpur","Ramnathpur","Rasulpur","Reusa Dehat","Saidpur",
      "Salamatpur","Shahpur","Shivpur","Sultanpur","Tindauli"
    ],
    "Kasmanda": [
      "Ahamadpur","Akbarpur","Alipur","Amritpur","Baghrai","Bahrampur",
      "Barauna","Barkhera","Bhagwanpur","Bhawanipur","Bikapur","Chandpur",
      "Dalpatpur","Daulatpur","Dhakwa","Dhamna","Dostpur","Fatehpur",
      "Girdharpur","Gopalpur","Gursahaiganj","Harishpur","Hasanpur","Husainpur",
      "Imamganj","Jagdishpur","Jalalpur","Kamalpur","Karnapur","Kasmanda Dehat",
      "Keshopur","Khagapur","Kherauj","Mahadeopur","Maheshpur","Malkpur",
      "Mohammadpur","Mukundpur","Narayanpur","Nawabganj","Purwa","Raipur",
      "Rampur","Rasulpur","Saidanpur","Salempur","Shahpur","Sultanpur"
    ],
    "Machrehta": [
      "Ahmedpur","Akbarpur","Alaulapur","Amritpur","Babuganj","Bahadurpur",
      "Bakhtiarpur","Bandhwa","Barauli","Bharawan","Bhojpur","Chandausi",
      "Dariyapur","Dayalpur","Dhanaupur","Fatehullahpur","Ganeshnagar",
      "Gopalpur","Gulalpur","Hanumanpur","Husainpur","Ibrahimpur","Inayatpur",
      "Isanagar","Jafarabad","Jairampur","Kamlapur","Karimabad","Keshopur",
      "Lakshmanpur","Machrehta Dehat","Maheshpur","Mahmudpur","Manpur",
      "Mohammadpur","Mubarakpur","Nabipur","Nasirpur","Pahladpur",
      "Ramchandrapur","Rasulpur","Saifpur","Shahjahanpur","Sherpur","Sikandarpur",
      "Sultanpur","Talgaon","Umapur"
    ],
    "Misrikh": [
      "Adilpur","Ahmedabad","Ajaipur","Alipur","Amritpur","Bakhtiarpur",
      "Balrampur","Barauli","Bhagwantpur","Bharawan","Bisundaspur","Chandapur",
      "Dariyapur","Daulpur","Devipur","Fatehpur","Ganeshnagar","Gopalpur",
      "Gulalpur","Haiderabad","Hasanpur","Hussainpur","Jahangirpur","Jalalpur",
      "Kamalpur","Karimpur","Keshavpur","Lakhnapur","Maheshpur","Mahmudpur",
      "Misrikh Dehat","Mohanpur","Mubarakpur","Naimisharanya","Narayanpur",
      "Nawabganj","Pahladpur","Purwa","Ramnagar","Rasulpur","Saidpur",
      "Shahpur","Shivapur","Sultanpur"
    ],
    "Pisawan": [
      "Ahmedpur","Akbarpur","Amritpur","Babuganj","Bahadurpur","Bahrampur",
      "Bakhtiarpur","Barauna","Bhagwantpur","Bhainsahi","Bhawanipur","Chandapur",
      "Dariyapur","Daulpur","Devipur","Dhakarwa","Fatehpur","Ganeshnagar",
      "Gopalpur","Gulalpur","Hardoi","Hasanpur","Hussainpur","Jaisinghpur",
      "Jalalpur","Kamalpur","Keshopur","Khajuriha","Lakhnapur","Mahmudpur",
      "Manikpur","Mohanpur","Narayanpur","Nawabganj","Pahladpur","Pisawan Dehat",
      "Purwa","Ramnagar","Rasulpur","Saidpur","Shahpur","Sultanpur"
    ],
    "Ailiya": [
      "Ahamadpur","Akbarpur","Alipur","Amritpur","Baghrai","Bahrampur",
      "Barauna","Bhagwanpur","Bhawanipur","Chandpur","Dalpatpur","Daulatpur",
      "Dostpur","Fatehpur","Girdharpur","Gopalpur","Harishpur","Hasanpur",
      "Husainpur","Jagdishpur","Jalalpur","Kamalpur","Karnapur","Keshopur",
      "Khagapur","Mahadeopur","Maheshpur","Manpur","Mohammadpur","Mukundpur",
      "Narayanpur","Nawabganj","Purwa","Raipur","Rampur","Rasulpur",
      "Salempur","Shahpur","Sultanpur","Ailiya Dehat"
    ],
    "Ramkot": [
      "Adilpur","Ahmedpur","Amritpur","Bahadurpur","Bahrauli","Bakainiya",
      "Barauli","Bhagwantpur","Bharaipur","Bhaupur","Bisunpur","Chandpur",
      "Dariyapur","Durgapur","Faridpur","Fatehpur","Gopalpur","Haidarpur",
      "Husainabad","Jagatpur","Kamalpur","Kanchanpur","Lakhnapur","Mandhata",
      "Mohanpur","Motipur","Narayanpur","Purwa","Ramdattpur","Ramkot Dehat",
      "Ramnathpur","Rasulpur","Saidpur","Salamatpur","Shahpur","Shivpur",
      "Sultanpur"
    ],
    "Gondlamau": [
      "Ahmedpur","Akbarpur","Amritpur","Bahadurpur","Bandhwa","Barauli",
      "Bhagwantpur","Bhawanipur","Chandpur","Dariyapur","Daulatpur","Devipur",
      "Fatehpur","Ganeshnagar","Gondlamau Dehat","Gopalpur","Gulalpur","Haidarpur",
      "Hasanpur","Husainpur","Jagdishpur","Jalalpur","Kamalpur","Keshopur",
      "Lakhnapur","Maheshpur","Manpur","Mohammadpur","Narayanpur","Pahladpur",
      "Purwa","Ramnagar","Rasulpur","Saifpur","Saidpur","Shahpur","Sultanpur"
    ],
    "Gondalomau": [
      "Kusauli","Nimtapur","Lodkherava","Sandana","Sultanpur","Kaurouna","Sarosa"
    ],
    "Sakran": [
      "Ahmedpur","Amritpur","Bahadurpur","Barauli","Bhagwantpur","Bhawanipur",
      "Chandpur","Dariyapur","Devipur","Fatehpur","Gopalpur","Gulalpur",
      "Hasanpur","Husainpur","Jalalpur","Kamalpur","Keshopur","Lakhnapur",
      "Maheshpur","Mohanpur","Narayanpur","Pahladpur","Purwa","Ramnagar",
      "Rasulpur","Saidpur","Sakran Dehat","Shahpur","Sultanpur"
    ],
    "Behta": [
      "Ahmedpur","Amritpur","Bahadurpur","Bahrauli","Barauli","Bhagwantpur",
      "Bhaupur","Bisunpur","Chandpur","Dariyapur","Durgapur","Fatehpur",
      "Gopalpur","Haidarpur","Husainabad","Jagatpur","Kamalpur","Kanchanpur",
      "Keshopur","Lakhnapur","Mohanpur","Motipur","Narayanpur","Purwa",
      "Ramdattpur","Ramnathpur","Rasulpur","Behta Dehat","Saidpur","Salamatpur",
      "Shahpur","Shivpur","Sultanpur"
    ],
    "Mahmoodabad": [
      "Ahmedpur","Akbarpur","Amritpur","Babuganj","Bahadurpur","Bahrampur",
      "Bakhtiarpur","Barauna","Bhagwantpur","Bhainsahi","Bhawanipur","Chandapur",
      "Dariyapur","Daulpur","Devipur","Fatehpur","Ganeshnagar","Gopalpur",
      "Gulalpur","Hasanpur","Hussainpur","Jaisinghpur","Jalalpur","Kamalpur",
      "Keshopur","Lakhnapur","Mahmoodabad Dehat","Mahmudpur","Manikpur",
      "Mohanpur","Narayanpur","Nawabganj","Pahladpur","Purwa","Ramnagar",
      "Rasulpur","Saidpur","Shahpur","Sultanpur"
    ],
    "Sidhauli": [
      "Ahmedpur","Akbarpur","Amritpur","Bahadurpur","Bandhwa","Barauli",
      "Bhagwantpur","Bhawanipur","Chandpur","Dariyapur","Daulatpur","Devipur",
      "Fatehpur","Ganeshnagar","Gopalpur","Gulalpur","Haidarpur","Hasanpur",
      "Husainpur","Jagdishpur","Jalalpur","Kamalpur","Keshopur","Lakhnapur",
      "Maheshpur","Manpur","Mohammadpur","Narayanpur","Pahladpur","Purwa",
      "Ramnagar","Rasulpur","Saifpur","Saidpur","Shahpur","Sidhauli Dehat",
      "Sultanpur"
    ]
  },
  getStates(country) { return this.states[country] || []; },
  getDistricts(state) { return this.districts[state] || []; },
  getTahasils(district) { return this.tahasils[district] || []; },
  getBlocks(district, tahasil) {
    if (tahasil && this.tahasilBlocks[tahasil]) return this.tahasilBlocks[tahasil];
    return this.blocks[district] || [];
  },
  getPanchayats(block) { return this.panchayats[block] || []; }
};

// ===== LOCATIONS =====
const Locations = {
  render() {
    const data = Store.getAll('cm_locations');
    const tbody = document.querySelector('#locationsTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">&#x1F4CD;</div><p>No locations added yet</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(l => `<tr>
      <td>${l.country}</td><td>${l.state}</td><td>${l.district}</td><td>${l.tahasil}</td>
      <td>${l.block}</td><td>${l.panchayat}</td><td>${l.plotNumber}</td>
      <td class="action-btns">
        <button class="btn btn-sm btn-secondary" onclick="Locations.openForm('${l.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="Locations.remove('${l.id}', '${l.plotNumber}')">Delete</button>
      </td>
    </tr>`).join('');
  },
  buildOptions(items, selected, placeholder) {
    return `<option value="">${placeholder}</option>` +
      items.map(i => `<option value="${i}" ${i === selected ? 'selected' : ''}>${i}</option>`).join('');
  },
  openForm(id) {
    const loc = id ? Store.get('cm_locations', id) : {};
    const statesForCountry = LocationHierarchy.getStates(loc.country || '');
    const districtsForState = LocationHierarchy.getDistricts(loc.state || '');
    const tahasilsForDistrict = LocationHierarchy.getTahasils(loc.district || '');
    const blocksForDistrict = LocationHierarchy.getBlocks(loc.district || '', loc.tahasil || '');
    const panchayatsForBlock = LocationHierarchy.getPanchayats(loc.block || '');

    const hasDistrictData = districtsForState.length > 0;
    const hasTahasilData = tahasilsForDistrict.length > 0;
    const hasBlockData = blocksForDistrict.length > 0;
    const hasPanchayatData = panchayatsForBlock.length > 0;

    UI.openModal(id ? 'Edit Location' : 'Add Location', `
      <form id="locationForm" class="form-grid">
        <div class="form-group"><label>Country</label>
          <select name="country" id="locCountrySelect" required>
            ${Locations.buildOptions(LocationHierarchy.countries, loc.country||'', 'Select Country...')}
          </select>
        </div>
        <div class="form-group"><label>State</label>
          <select name="state" id="locStateSelect" required>
            ${Locations.buildOptions(statesForCountry, loc.state||'', statesForCountry.length ? 'Select State...' : 'Select country first...')}
          </select>
        </div>
        <div class="form-group"><label>District</label>
          ${hasDistrictData
            ? `<select name="district" id="locDistrictSelect" required>${Locations.buildOptions(districtsForState, loc.district||'', 'Select District...')}</select>`
            : `<input name="district" id="locDistrictInput" value="${loc.district||''}" required placeholder="Enter district">`
          }
        </div>
        <div class="form-group"><label>Tahasil</label>
          ${hasTahasilData
            ? `<select name="tahasil" id="locTahasilSelect" required>${Locations.buildOptions(tahasilsForDistrict, loc.tahasil||'', 'Select Tahasil...')}</select>`
            : `<input name="tahasil" id="locTahasilInput" value="${loc.tahasil||''}" required placeholder="Enter tahasil">`
          }
        </div>
        <div class="form-group"><label>Block</label>
          ${hasBlockData
            ? `<select name="block" id="locBlockSelect" required>${Locations.buildOptions(blocksForDistrict, loc.block||'', 'Select Block...')}</select>`
            : `<input name="block" id="locBlockInput" value="${loc.block||''}" required placeholder="Enter block">`
          }
        </div>
        <div class="form-group"><label>Panchayat</label>
          ${hasPanchayatData
            ? `<select name="panchayat" id="locPanchayatSelect" required>${Locations.buildOptions(panchayatsForBlock, loc.panchayat||'', 'Select Panchayat...')}</select>`
            : `<input name="panchayat" id="locPanchayatInput" value="${loc.panchayat||''}" required placeholder="Enter panchayat">`
          }
        </div>
        <div class="form-group"><label>Plot Number</label><input name="plotNumber" value="${loc.plotNumber||''}" required></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'} Location</button>
        </div>
      </form>
    `);
    // Cascading: Country -> State
    document.getElementById('locCountrySelect').addEventListener('change', (e) => {
      Locations.rebuildFromState(e.target.value, '', '', '', '', '');
    });
    // Cascading: State -> District
    Locations.addCascade('locStateSelect', (val) => {
      Locations.rebuildFromDistrict(val, '', '', '', '');
    });
    document.getElementById('locationForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const obj = Object.fromEntries(fd);
      if (obj.id) Store.update('cm_locations', obj.id, obj);
      else Store.add('cm_locations', obj);
      UI.closeModal();
      UI.showToast(`Location ${obj.id ? 'updated' : 'added'} successfully`);
      Locations.render();
    };
  },
  addCascade(selectId, handler) {
    const el = document.getElementById(selectId);
    if (el && el.tagName === 'SELECT') {
      el.addEventListener('change', (e) => handler(e.target.value));
    }
  },
  rebuildFromState(country, selState, selDistrict, selTahasil, selBlock, selPanchayat) {
    const states = LocationHierarchy.getStates(country);
    const stateEl = document.getElementById('locStateSelect');
    stateEl.innerHTML = Locations.buildOptions(states, selState, states.length ? 'Select State...' : 'Select country first...');
    stateEl.onchange = (e) => Locations.rebuildFromDistrict(e.target.value, '', '', '', '');
    Locations.rebuildFromDistrict(selState, selDistrict, selTahasil, selBlock, selPanchayat);
  },
  rebuildFromDistrict(state, selDistrict, selTahasil, selBlock, selPanchayat) {
    const districts = LocationHierarchy.getDistricts(state);
    const container = document.querySelector('[name="district"]').parentElement;
    if (districts.length > 0) {
      container.innerHTML = '<label>District</label>' +
        `<select name="district" id="locDistrictSelect" required>${Locations.buildOptions(districts, selDistrict, 'Select District...')}</select>`;
      document.getElementById('locDistrictSelect').addEventListener('change', (e) => {
        Locations.rebuildFromTahasil(e.target.value, '', '', '');
      });
    } else {
      container.innerHTML = '<label>District</label>' +
        `<input name="district" id="locDistrictInput" value="${selDistrict}" required placeholder="Enter district">`;
    }
    Locations.rebuildFromTahasil(selDistrict, selTahasil, selBlock, selPanchayat);
  },
  rebuildFromTahasil(district, selTahasil, selBlock, selPanchayat) {
    const tahasils = LocationHierarchy.getTahasils(district);
    const container = document.querySelector('[name="tahasil"]').parentElement;
    if (tahasils.length > 0) {
      container.innerHTML = '<label>Tahasil</label>' +
        `<select name="tahasil" id="locTahasilSelect" required>${Locations.buildOptions(tahasils, selTahasil, 'Select Tahasil...')}</select>`;
      document.getElementById('locTahasilSelect').addEventListener('change', (e) => {
        Locations.rebuildFromBlock(district, e.target.value, '', '');
      });
    } else {
      container.innerHTML = '<label>Tahasil</label>' +
        `<input name="tahasil" id="locTahasilInput" value="${selTahasil}" required placeholder="Enter tahasil">`;
    }
    Locations.rebuildFromBlock(district, selTahasil, selBlock, selPanchayat);
  },
  rebuildFromBlock(district, tahasil, selBlock, selPanchayat) {
    const blocks = LocationHierarchy.getBlocks(district, tahasil);
    const container = document.querySelector('[name="block"]').parentElement;
    if (blocks.length > 0) {
      container.innerHTML = '<label>Block</label>' +
        `<select name="block" id="locBlockSelect" required>${Locations.buildOptions(blocks, selBlock, 'Select Block...')}</select>`;
      document.getElementById('locBlockSelect').addEventListener('change', (e) => {
        Locations.rebuildPanchayat(e.target.value, '');
      });
    } else {
      container.innerHTML = '<label>Block</label>' +
        `<input name="block" id="locBlockInput" value="${selBlock}" required placeholder="Enter block">`;
    }
    Locations.rebuildPanchayat(selBlock, selPanchayat);
  },
  rebuildPanchayat(block, selPanchayat) {
    const panchayats = LocationHierarchy.getPanchayats(block);
    const container = document.querySelector('[name="panchayat"]').parentElement;
    if (panchayats.length > 0) {
      container.innerHTML = '<label>Panchayat</label>' +
        `<select name="panchayat" id="locPanchayatSelect" required>${Locations.buildOptions(panchayats, selPanchayat, 'Select Panchayat...')}</select>`;
    } else {
      container.innerHTML = '<label>Panchayat</label>' +
        `<input name="panchayat" id="locPanchayatInput" value="${selPanchayat}" required placeholder="Enter panchayat">`;
    }
  },
  remove(id, name) {
    if (UI.confirmDelete(name)) {
      Store.remove('cm_locations', id);
      UI.showToast('Location deleted');
      Locations.render();
    }
  }
};

// ===== FACILITIES =====
const Facilities = {
  render() {
    const data = Store.getAll('cm_facilities');
    const grid = document.getElementById('facilitiesGrid');
    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F3E0;</div><p>No facilities added yet</p><button class="btn btn-primary" onclick="Facilities.openForm()">+ Add Facility</button></div>';
      return;
    }
    grid.innerHTML = data.map(f => {
      const pct = f.capacity > 0 ? Math.round((f.currentOccupancy || 0) / f.capacity * 100) : 0;
      const pctClass = pct > 90 ? 'red' : pct > 70 ? 'orange' : 'green';
      const budgetPct = f.budgetAllocated > 0 ? Math.round((f.budgetSpent || 0) / f.budgetAllocated * 100) : 0;
      const loc = Store.get('cm_locations', f.locationId);
      return `<div class="facility-card" onclick="Facilities.showDetail('${f.id}')">
        <h4>${f.shedName}</h4>
        <div class="facility-type">${f.shedType || 'Standard'} Shed ${loc ? '| ' + loc.panchayat : ''}</div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px">
            <span>Occupancy</span><span>${f.currentOccupancy||0}/${f.capacity}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill ${pctClass}" style="width:${pct}%"></div></div>
        </div>
        <div class="facility-meta">
          <span>Caretaker: <strong>${f.caretakerName||'-'}</strong></span>
          <span>Budget: <strong>&#8377;${(f.budgetAllocated||0).toLocaleString()}</strong></span>
          <span>Spent: <strong>${budgetPct}%</strong></span>
          <span>Phone: <strong>${f.caretakerPhone||'-'}</strong></span>
        </div>
      </div>`;
    }).join('');
  },
  openForm(id) {
    const f = id ? Store.get('cm_facilities', id) : {};
    const locs = Store.getAll('cm_locations').map(l => ({ value: l.id, label: `${l.panchayat} - ${l.plotNumber}` }));
    UI.openModal(id ? 'Edit Facility' : 'Add Facility', `
      <form id="facilityForm" class="form-grid">
        <div class="form-group"><label>Location</label><select name="locationId">${UI.buildSelect(locs, f.locationId||'')}</select></div>
        <div class="form-group"><label>Shed Name</label><input name="shedName" value="${f.shedName||''}" required></div>
        <div class="form-group"><label>Shed Type</label>
          <select name="shedType">
            <option value="open" ${f.shedType==='open'?'selected':''}>Open</option>
            <option value="closed" ${f.shedType==='closed'?'selected':''}>Closed</option>
            <option value="semi-open" ${f.shedType==='semi-open'?'selected':''}>Semi-Open</option>
          </select></div>
        <div class="form-group"><label>Capacity</label><input type="number" name="capacity" value="${f.capacity||''}" required></div>
        <div class="form-group"><label>Current Occupancy</label><input type="number" name="currentOccupancy" value="${f.currentOccupancy||0}"></div>
        <div class="form-group"><label>Caretaker Name</label><input name="caretakerName" value="${f.caretakerName||''}"></div>
        <div class="form-group"><label>Caretaker Phone</label><input name="caretakerPhone" value="${f.caretakerPhone||''}"></div>
        <div class="form-group"><label>Budget Allocated (&#8377;)</label><input type="number" name="budgetAllocated" value="${f.budgetAllocated||0}"></div>
        <div class="form-group"><label>Budget Spent (&#8377;)</label><input type="number" name="budgetSpent" value="${f.budgetSpent||0}"></div>
        <div class="form-group full-width"><label>Live Feed URL</label><input name="liveFeedUrl" value="${f.liveFeedUrl||''}" placeholder="https://camera-url..."></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${f.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          ${id ? `<button type="button" class="btn btn-danger" onclick="Facilities.remove('${id}','${f.shedName}')">Delete</button>` : ''}
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'} Facility</button>
        </div>
      </form>
    `);
    document.getElementById('facilityForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const obj = Object.fromEntries(fd);
      obj.capacity = parseInt(obj.capacity) || 0;
      obj.currentOccupancy = parseInt(obj.currentOccupancy) || 0;
      obj.budgetAllocated = parseFloat(obj.budgetAllocated) || 0;
      obj.budgetSpent = parseFloat(obj.budgetSpent) || 0;
      if (obj.id) Store.update('cm_facilities', obj.id, obj);
      else Store.add('cm_facilities', obj);
      UI.closeModal();
      UI.showToast(`Facility ${obj.id ? 'updated' : 'added'} successfully`);
      Facilities.render();
    };
  },
  showDetail(id) {
    const f = Store.get('cm_facilities', id);
    if (!f) return;
    const loc = Store.get('cm_locations', f.locationId);
    let feedHtml = '';
    if (f.liveFeedUrl) {
      feedHtml = `<div class="live-feed-container"><iframe src="${f.liveFeedUrl}" allowfullscreen></iframe></div>`;
    } else {
      feedHtml = `<div class="live-feed-container"><div class="live-feed-placeholder">No live feed configured</div></div>`;
    }
    UI.openModal(f.shedName, `
      <div class="detail-field"><label>Location</label><span>${loc ? `${loc.panchayat}, ${loc.block}, ${loc.district}` : '-'}</span></div>
      <div class="detail-field"><label>Type</label><span>${f.shedType}</span></div>
      <div class="detail-field"><label>Occupancy</label><span>${f.currentOccupancy||0} / ${f.capacity}</span></div>
      <div class="detail-field"><label>Caretaker</label><span>${f.caretakerName||'-'} (${f.caretakerPhone||'-'})</span></div>
      <div class="detail-field"><label>Budget</label><span>&#8377;${(f.budgetSpent||0).toLocaleString()} / &#8377;${(f.budgetAllocated||0).toLocaleString()}</span></div>
      <div class="detail-field"><label>Notes</label><span>${f.notes||'-'}</span></div>
      <h4 style="margin-top:16px">Live Feed</h4>
      ${feedHtml}
      <div class="form-actions" style="margin-top:16px">
        <button class="btn btn-secondary" onclick="UI.closeModal(); Facilities.openForm('${id}')">Edit</button>
      </div>
    `);
  },
  remove(id, name) {
    if (UI.confirmDelete(name)) {
      Store.remove('cm_facilities', id);
      UI.closeModal();
      UI.showToast('Facility deleted');
      Facilities.render();
    }
  }
};

// ===== FODDER =====
const Fodder = {
  render() {
    this.renderTypes();
    this.renderInventory();
    this.renderSchedules();
  },
  renderTypes() {
    const data = Store.getAll('cm_fodder_types');
    const tbody = document.querySelector('#fodderTypesTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>No feed types added</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(t => `<tr>
      <td>${t.name}</td><td><span class="badge badge-info">${t.category}</span></td><td>${t.unit}</td><td>&#8377;${t.costPerUnit}</td>
      <td class="action-btns">
        <button class="btn btn-sm btn-secondary" onclick="Fodder.openTypeForm('${t.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="Fodder.removeType('${t.id}','${t.name}')">Delete</button>
      </td>
    </tr>`).join('');
  },
  renderInventory() {
    const data = Store.getAll('cm_fodder_inventory');
    const tbody = document.querySelector('#fodderInventoryTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>No inventory records</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(i => {
      const ft = Store.get('cm_fodder_types', i.fodderTypeId);
      const low = i.quantityInStock <= i.reorderLevel;
      const statusBadge = low ? '<span class="badge badge-danger">Low Stock</span>' : '<span class="badge badge-success">OK</span>';
      return `<tr>
        <td>${UI.getFacilityName(i.facilityId)}</td><td>${ft ? ft.name : '-'}</td>
        <td>${i.quantityInStock} ${ft ? ft.unit : ''}</td><td>${i.reorderLevel}</td>
        <td>${statusBadge}</td><td>${UI.formatDate(i.lastRestockedAt)}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Fodder.openInventoryForm('${i.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Fodder.removeInventory('${i.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  renderSchedules() {
    const data = Store.getAll('cm_fodder_schedules');
    const tbody = document.querySelector('#fodderSchedulesTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><p>No schedules configured</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(s => {
      const ft = Store.get('cm_fodder_types', s.fodderTypeId);
      return `<tr>
        <td>${UI.getFacilityName(s.facilityId)}</td><td>${ft ? ft.name : '-'}</td>
        <td><span class="badge badge-info">${s.timeSlot}</span></td><td>${s.quantityPerCow} ${ft ? ft.unit : ''}</td>
        <td>${s.targetGroup}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Fodder.openScheduleForm('${s.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Fodder.removeSchedule('${s.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  openTypeForm(id) {
    const t = id ? Store.get('cm_fodder_types', id) : {};
    UI.openModal(id ? 'Edit Feed Type' : 'Add Feed Type', `
      <form id="fodderTypeForm" class="form-grid">
        <div class="form-group"><label>Name</label><input name="name" value="${t.name||''}" required></div>
        <div class="form-group"><label>Category</label>
          <select name="category">
            <option value="roughage" ${t.category==='roughage'?'selected':''}>Roughage</option>
            <option value="concentrate" ${t.category==='concentrate'?'selected':''}>Concentrate</option>
            <option value="supplement" ${t.category==='supplement'?'selected':''}>Supplement</option>
          </select></div>
        <div class="form-group"><label>Unit</label>
          <select name="unit">
            <option value="kg" ${t.unit==='kg'?'selected':''}>Kg</option>
            <option value="bales" ${t.unit==='bales'?'selected':''}>Bales</option>
            <option value="liters" ${t.unit==='liters'?'selected':''}>Liters</option>
          </select></div>
        <div class="form-group"><label>Cost Per Unit (&#8377;)</label><input type="number" step="0.01" name="costPerUnit" value="${t.costPerUnit||''}" required></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'}</button>
        </div>
      </form>
    `);
    document.getElementById('fodderTypeForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      obj.costPerUnit = parseFloat(obj.costPerUnit) || 0;
      if (obj.id) Store.update('cm_fodder_types', obj.id, obj);
      else Store.add('cm_fodder_types', obj);
      UI.closeModal();
      UI.showToast('Feed type saved');
      Fodder.renderTypes();
    };
  },
  openInventoryForm(id) {
    const inv = id ? Store.get('cm_fodder_inventory', id) : {};
    const facilities = Store.getAll('cm_facilities').map(f => ({ value: f.id, label: f.shedName }));
    const types = Store.getAll('cm_fodder_types').map(t => ({ value: t.id, label: t.name }));
    UI.openModal(id ? 'Edit Inventory' : 'Add Inventory', `
      <form id="fodderInvForm" class="form-grid">
        <div class="form-group"><label>Facility</label><select name="facilityId" required>${UI.buildSelect(facilities, inv.facilityId||'')}</select></div>
        <div class="form-group"><label>Feed Type</label><select name="fodderTypeId" required>${UI.buildSelect(types, inv.fodderTypeId||'')}</select></div>
        <div class="form-group"><label>Quantity In Stock</label><input type="number" name="quantityInStock" value="${inv.quantityInStock||''}" required></div>
        <div class="form-group"><label>Reorder Level</label><input type="number" name="reorderLevel" value="${inv.reorderLevel||''}" required></div>
        <div class="form-group"><label>Last Restocked</label><input type="date" name="lastRestockedAt" value="${inv.lastRestockedAt ? inv.lastRestockedAt.slice(0,10) : ''}"></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'}</button>
        </div>
      </form>
    `);
    document.getElementById('fodderInvForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      obj.quantityInStock = parseFloat(obj.quantityInStock) || 0;
      obj.reorderLevel = parseFloat(obj.reorderLevel) || 0;
      if (obj.id) Store.update('cm_fodder_inventory', obj.id, obj);
      else Store.add('cm_fodder_inventory', obj);
      UI.closeModal();
      UI.showToast('Inventory saved');
      Fodder.renderInventory();
    };
  },
  openScheduleForm(id) {
    const s = id ? Store.get('cm_fodder_schedules', id) : {};
    const facilities = Store.getAll('cm_facilities').map(f => ({ value: f.id, label: f.shedName }));
    const types = Store.getAll('cm_fodder_types').map(t => ({ value: t.id, label: t.name }));
    UI.openModal(id ? 'Edit Schedule' : 'Add Schedule', `
      <form id="fodderSchedForm" class="form-grid">
        <div class="form-group"><label>Facility</label><select name="facilityId" required>${UI.buildSelect(facilities, s.facilityId||'')}</select></div>
        <div class="form-group"><label>Feed Type</label><select name="fodderTypeId" required>${UI.buildSelect(types, s.fodderTypeId||'')}</select></div>
        <div class="form-group"><label>Time Slot</label>
          <select name="timeSlot">
            <option value="morning" ${s.timeSlot==='morning'?'selected':''}>Morning</option>
            <option value="afternoon" ${s.timeSlot==='afternoon'?'selected':''}>Afternoon</option>
            <option value="evening" ${s.timeSlot==='evening'?'selected':''}>Evening</option>
          </select></div>
        <div class="form-group"><label>Quantity Per Cow</label><input type="number" step="0.1" name="quantityPerCow" value="${s.quantityPerCow||''}" required></div>
        <div class="form-group"><label>Target Group</label>
          <select name="targetGroup">
            <option value="all" ${s.targetGroup==='all'?'selected':''}>All</option>
            <option value="lactating" ${s.targetGroup==='lactating'?'selected':''}>Lactating</option>
            <option value="dry" ${s.targetGroup==='dry'?'selected':''}>Dry</option>
            <option value="calves" ${s.targetGroup==='calves'?'selected':''}>Calves</option>
          </select></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${s.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'}</button>
        </div>
      </form>
    `);
    document.getElementById('fodderSchedForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      obj.quantityPerCow = parseFloat(obj.quantityPerCow) || 0;
      if (obj.id) Store.update('cm_fodder_schedules', obj.id, obj);
      else Store.add('cm_fodder_schedules', obj);
      UI.closeModal();
      UI.showToast('Schedule saved');
      Fodder.renderSchedules();
    };
  },
  removeType(id, name) { if (UI.confirmDelete(name)) { Store.remove('cm_fodder_types', id); UI.showToast('Deleted'); Fodder.renderTypes(); } },
  removeInventory(id) { if (confirm('Delete this inventory record?')) { Store.remove('cm_fodder_inventory', id); UI.showToast('Deleted'); Fodder.renderInventory(); } },
  removeSchedule(id) { if (confirm('Delete this schedule?')) { Store.remove('cm_fodder_schedules', id); UI.showToast('Deleted'); Fodder.renderSchedules(); } }
};

// ===== COWS =====
const Cows = {
  // Calculate identity completeness score (how many identification fields are filled)
  getIdScore(c) {
    const fields = ['earTag','rfidTag','breed','dob','weight','sex','colorMarkings','hornPattern','distinguishingMarks','muzzlePrintBase64','pictureBase64','photoLeftBase64','photoRightBase64'];
    const filled = fields.filter(f => c[f] && c[f] !== '').length;
    return Math.round((filled / fields.length) * 100);
  },
  render(filter = '') {
    let data = Store.getAll('cm_cows');
    if (filter) {
      const f = filter.toLowerCase();
      data = data.filter(c => (c.earTag||'').toLowerCase().includes(f) || (c.name||'').toLowerCase().includes(f) ||
        (c.breed||'').toLowerCase().includes(f) || (c.rfidTag||'').toLowerCase().includes(f));
    }
    const tbody = document.querySelector('#cowsTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">&#x1F404;</div><p>${filter ? 'No matching cows' : 'No cows registered yet'}</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(c => {
      const photo = c.pictureBase64
        ? `<img src="${c.pictureBase64}" class="cow-thumb" alt="${c.name}">`
        : '<div class="cow-thumb-placeholder">&#x1F404;</div>';
      const age = c.dob ? Math.floor(UI.daysBetween(c.dob, new Date()) / 365.25) + 'y' : '-';
      const statusClass = c.status === 'active' ? 'badge-active' : c.status === 'deceased' ? 'badge-danger' : 'badge-inactive';
      const idScore = Cows.getIdScore(c);
      const scoreClass = idScore >= 70 ? 'high' : idScore >= 40 ? 'medium' : 'low';
      return `<tr style="cursor:pointer" onclick="Cows.showDetail('${c.id}')">
        <td>${photo}</td><td><strong>${c.earTag}</strong></td><td>${c.rfidTag||'-'}</td><td>${c.name||'-'}</td>
        <td>${c.breed||'-'}</td><td>${c.dob ? UI.formatDate(c.dob) : '-'} <small>(${age})</small></td>
        <td>${c.weight||'-'}</td><td>${c.sex||'-'}</td>
        <td><span class="id-score ${scoreClass}">${idScore}%</span></td>
        <td><span class="badge ${statusClass}">${c.status||'active'}</span></td>
        <td class="action-btns" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-secondary" onclick="Cows.openForm('${c.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Cows.remove('${c.id}','${c.name||c.earTag}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
    // Also render verification log
    CowVerify.renderLog();
  },
  openForm(id) {
    const c = id ? Store.get('cm_cows', id) : {};
    const facilities = Store.getAll('cm_facilities').map(f => ({ value: f.id, label: f.shedName }));
    const cows = Store.getAll('cm_cows').filter(cow => cow.id !== id).map(cow => ({ value: cow.id, label: `${cow.name || cow.earTag} (${cow.earTag})` }));
    UI.openModal(id ? 'Edit Cow' : 'Add Cow', `
      <form id="cowForm" class="form-grid">
        <div class="dup-tag-warning full-width" id="dupTagWarning">&#x26A0; This ear tag is already registered to another cow!</div>
        <div class="form-section-title">Basic Information</div>
        <div class="form-group"><label>Ear Tag *</label><input name="earTag" id="cowEarTagInput" value="${c.earTag||''}" required></div>
        <div class="form-group"><label>RFID Tag</label><input name="rfidTag" id="cowRfidInput" value="${c.rfidTag||''}" placeholder="e.g. 900012345678901"></div>
        <div class="form-group"><label>Name</label><input name="name" value="${c.name||''}"></div>
        <div class="form-group"><label>Breed</label><input name="breed" value="${c.breed||''}" list="breedList">
          <datalist id="breedList">${['Gir','Sahiwal','Red Sindhi','Tharparkar','Rathi','Kankrej','Ongole','Hariana','Jersey','Holstein Friesian','Crossbred'].map(b=>`<option value="${b}">`).join('')}</datalist></div>
        <div class="form-group"><label>Sex</label>
          <select name="sex"><option value="female" ${c.sex==='female'?'selected':''}>Female</option><option value="male" ${c.sex==='male'?'selected':''}>Male</option></select></div>
        <div class="form-group"><label>Date of Birth</label><input type="date" name="dob" value="${c.dob ? c.dob.slice(0,10) : ''}"></div>
        <div class="form-group"><label>Weight (kg)</label><input type="number" step="0.1" name="weight" value="${c.weight||''}"></div>
        <div class="form-group"><label>Facility</label><select name="facilityId">${UI.buildSelect(facilities, c.facilityId||'')}</select></div>
        <div class="form-group"><label>Phone Number</label><input name="phoneNumber" value="${c.phoneNumber||''}"></div>
        <div class="form-group"><label>Status</label>
          <select name="status">
            <option value="active" ${(!c.status||c.status==='active')?'selected':''}>Active</option>
            <option value="sold" ${c.status==='sold'?'selected':''}>Sold</option>
            <option value="deceased" ${c.status==='deceased'?'selected':''}>Deceased</option>
            <option value="transferred" ${c.status==='transferred'?'selected':''}>Transferred</option>
          </select></div>
        <div class="form-group"><label>Mother</label><select name="motherId">${UI.buildSelect(cows, c.motherId||'', 'None')}</select></div>

        <div class="form-section-title">Physical Identification (Anti-Fraud)</div>
        <div class="form-group full-width"><label>Color & Markings</label>
          <input name="colorMarkings" value="${c.colorMarkings||''}" placeholder="e.g. White body with brown patches on left flank and face"></div>
        <div class="form-group"><label>Horn Pattern</label>
          <select name="hornPattern">
            <option value="">Select...</option>
            ${['Curved Upward','Curved Inward','Curved Outward','Straight','Short/Stubby','Polled (No Horns)','Broken Left','Broken Right','Asymmetric','Other'].map(h =>
              `<option value="${h}" ${h===c.hornPattern?'selected':''}>${h}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Tail Switch Color</label><input name="tailSwitchColor" value="${c.tailSwitchColor||''}" placeholder="e.g. Black, White tip"></div>
        <div class="form-group full-width"><label>Distinguishing Marks</label>
          <textarea name="distinguishingMarks" rows="2" placeholder="Scars, birthmarks, unique patterns, brand marks, etc.">${c.distinguishingMarks||''}</textarea></div>
        <div class="form-group"><label>Body Condition Score (1-9)</label>
          <input type="number" name="bodyConditionScore" value="${c.bodyConditionScore||''}" min="1" max="9" step="0.5" placeholder="1-9"></div>
        <div class="form-group"><label>Estimated Height (cm)</label>
          <input type="number" name="heightCm" value="${c.heightCm||''}" placeholder="e.g. 130"></div>

        <div class="form-section-title">Photos (Multi-Angle for Verification)</div>
        <div class="form-group full-width">
          <div class="multi-photo-grid">
            <div class="photo-slot" onclick="Cows.triggerPhotoUpload('front')">
              ${c.pictureBase64 ? `<img src="${c.pictureBase64}">` : 'Click to add'}
              <span class="photo-label">Front View</span>
            </div>
            <div class="photo-slot" onclick="Cows.triggerPhotoUpload('left')">
              ${c.photoLeftBase64 ? `<img src="${c.photoLeftBase64}">` : 'Click to add'}
              <span class="photo-label">Left Side</span>
            </div>
            <div class="photo-slot" onclick="Cows.triggerPhotoUpload('right')">
              ${c.photoRightBase64 ? `<img src="${c.photoRightBase64}">` : 'Click to add'}
              <span class="photo-label">Right Side</span>
            </div>
          </div>
          <input type="file" accept="image/*" id="cowPhotoFront" style="display:none">
          <input type="file" accept="image/*" id="cowPhotoLeft" style="display:none">
          <input type="file" accept="image/*" id="cowPhotoRight" style="display:none">
        </div>
        <div class="form-group full-width"><label>Muzzle Print (Unique Biometric)</label>
          <input type="file" accept="image/*" id="cowMuzzleInput">
          <div id="muzzlePreview">${c.muzzlePrintBase64 ? `<img src="${c.muzzlePrintBase64}" class="image-preview" style="margin-top:6px">` : '<small style="color:#6B7280">Muzzle prints are unique like fingerprints - capture close-up of nose</small>'}</div>
        </div>
        <div class="form-group full-width"><label>Video URL</label><input name="videoUrl" value="${c.videoUrl||''}" placeholder="https://..."></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${c.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <input type="hidden" name="pictureBase64" id="hPicFront" value="${c.pictureBase64||''}">
        <input type="hidden" name="photoLeftBase64" id="hPicLeft" value="${c.photoLeftBase64||''}">
        <input type="hidden" name="photoRightBase64" id="hPicRight" value="${c.photoRightBase64||''}">
        <input type="hidden" name="muzzlePrintBase64" id="hMuzzle" value="${c.muzzlePrintBase64||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'} Cow</button>
        </div>
      </form>
    `);
    // Duplicate ear tag detection
    const earTagInput = document.getElementById('cowEarTagInput');
    const rfidInput = document.getElementById('cowRfidInput');
    const dupWarning = document.getElementById('dupTagWarning');
    const checkDuplicate = () => {
      const tag = earTagInput.value.trim();
      const rfid = rfidInput.value.trim();
      const allCows = Store.getAll('cm_cows');
      const dupTag = tag && allCows.find(cow => cow.earTag === tag && cow.id !== (id || ''));
      const dupRfid = rfid && allCows.find(cow => cow.rfidTag === rfid && cow.id !== (id || ''));
      if (dupTag) {
        dupWarning.innerHTML = '&#x26A0; <strong>DUPLICATE EAR TAG!</strong> Tag "' + tag + '" is already assigned to: <strong>' + (dupTag.name || 'Unnamed') + '</strong> (ID: ' + dupTag.earTag + ')';
        dupWarning.classList.add('visible');
      } else if (dupRfid) {
        dupWarning.innerHTML = '&#x26A0; <strong>DUPLICATE RFID!</strong> RFID "' + rfid + '" is already assigned to: <strong>' + (dupRfid.name || dupRfid.earTag) + '</strong>';
        dupWarning.classList.add('visible');
      } else {
        dupWarning.classList.remove('visible');
      }
    };
    earTagInput.addEventListener('input', checkDuplicate);
    rfidInput.addEventListener('input', checkDuplicate);

    // Multi-photo uploads
    const setupPhotoUpload = (inputId, hiddenId, slotIndex) => {
      document.getElementById(inputId).addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const base64 = await UI.compressImage(file);
          document.getElementById(hiddenId).value = base64;
          const slots = document.querySelectorAll('.multi-photo-grid .photo-slot');
          slots[slotIndex].innerHTML = `<img src="${base64}"><span class="photo-label">${['Front View','Left Side','Right Side'][slotIndex]}</span>`;
        }
      });
    };
    setupPhotoUpload('cowPhotoFront', 'hPicFront', 0);
    setupPhotoUpload('cowPhotoLeft', 'hPicLeft', 1);
    setupPhotoUpload('cowPhotoRight', 'hPicRight', 2);

    // Muzzle print upload
    document.getElementById('cowMuzzleInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const base64 = await UI.compressImage(file);
        document.getElementById('hMuzzle').value = base64;
        document.getElementById('muzzlePreview').innerHTML = `<img src="${base64}" class="image-preview" style="margin-top:6px">`;
      }
    });

    document.getElementById('cowForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      obj.weight = parseFloat(obj.weight) || 0;
      // Block submission if duplicate tag found
      const allCows = Store.getAll('cm_cows');
      const dupTag = obj.earTag && allCows.find(cow => cow.earTag === obj.earTag && cow.id !== (id || ''));
      if (dupTag && !confirm('WARNING: Ear tag "' + obj.earTag + '" is already assigned to ' + (dupTag.name || dupTag.earTag) + '. Are you sure you want to use the same tag? This may indicate cow exchange fraud.')) {
        return;
      }
      if (obj.id) Store.update('cm_cows', obj.id, obj);
      else Store.add('cm_cows', obj);
      UI.closeModal();
      UI.showToast(`Cow ${obj.id ? 'updated' : 'added'} successfully`);
      Cows.render();
    };
  },
  triggerPhotoUpload(angle) {
    const inputMap = { front: 'cowPhotoFront', left: 'cowPhotoLeft', right: 'cowPhotoRight' };
    document.getElementById(inputMap[angle]).click();
  },
  showDetail(id) {
    const c = Store.get('cm_cows', id);
    if (!c) return;
    const panel = document.getElementById('cowDetailPanel');
    const body = document.getElementById('cowDetailBody');
    const facility = Store.get('cm_facilities', c.facilityId);
    const mother = c.motherId ? Store.get('cm_cows', c.motherId) : null;
    const calves = Store.query('cm_cows', cow => cow.motherId === id);
    const healthRecords = Store.query('cm_health_records', h => h.cowId === id);
    const breedingRecords = Store.query('cm_breeding_records', b => b.cowId === id);
    const idScore = Cows.getIdScore(c);
    const scoreClass = idScore >= 70 ? 'high' : idScore >= 40 ? 'medium' : 'low';

    // Verification history for this cow
    const verifications = Store.getAll('cm_verification_log').filter(v => v.cowId === id);
    const lastVerify = verifications.length > 0 ? verifications.sort((a,b) => (b.date||'').localeCompare(a.date||''))[0] : null;

    let html = '';
    // Photos grid
    const photos = [c.pictureBase64, c.photoLeftBase64, c.photoRightBase64].filter(Boolean);
    if (photos.length > 0) {
      html += `<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">`;
      photos.forEach((p, i) => {
        html += `<img src="${p}" style="width:${photos.length===1?'100%':'calc(33%-4px)'};max-height:160px;object-fit:cover;border-radius:8px;" alt="Photo ${i+1}">`;
      });
      html += `</div>`;
    }

    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span class="id-score ${scoreClass}" style="font-size:14px;padding:5px 12px;">ID Score: ${idScore}%</span>
        ${lastVerify ? `<span class="badge ${lastVerify.result==='Pass'?'badge-verified':lastVerify.result==='Fail'?'badge-mismatch':'badge-partial-match'}">Last verified: ${UI.formatDate(lastVerify.date)} - ${lastVerify.result}</span>` : '<span class="badge badge-inactive">Not yet verified</span>'}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="detail-field"><label>Ear Tag</label><span><strong>${c.earTag}</strong></span></div>
        <div class="detail-field"><label>RFID Tag</label><span>${c.rfidTag||'<em style=color:#DC2626>Not set</em>'}</span></div>
        <div class="detail-field"><label>Name</label><span>${c.name||'-'}</span></div>
        <div class="detail-field"><label>Breed</label><span>${c.breed||'-'}</span></div>
        <div class="detail-field"><label>Sex</label><span>${c.sex||'-'}</span></div>
        <div class="detail-field"><label>DOB</label><span>${UI.formatDate(c.dob)}</span></div>
        <div class="detail-field"><label>Weight</label><span>${c.weight ? c.weight + ' kg' : '-'}</span></div>
        <div class="detail-field"><label>Height</label><span>${c.heightCm ? c.heightCm + ' cm' : '-'}</span></div>
        <div class="detail-field"><label>Status</label><span class="badge badge-${c.status==='active'?'active':'inactive'}">${c.status||'active'}</span></div>
        <div class="detail-field"><label>Body Condition</label><span>${c.bodyConditionScore || '-'}</span></div>
        <div class="detail-field"><label>Phone</label><span>${c.phoneNumber||'-'}</span></div>
        <div class="detail-field"><label>Facility</label><span>${facility ? facility.shedName : '-'}</span></div>
        <div class="detail-field"><label>Mother</label><span>${mother ? (mother.name || mother.earTag) : '-'}</span></div>
        <div class="detail-field"><label>Horn Pattern</label><span>${c.hornPattern||'-'}</span></div>
      </div>
      ${c.colorMarkings ? `<div class="detail-field" style="margin-top:12px"><label>Color & Markings</label><span>${c.colorMarkings}</span></div>` : ''}
      ${c.distinguishingMarks ? `<div class="detail-field" style="margin-top:8px"><label>Distinguishing Marks</label><span>${c.distinguishingMarks}</span></div>` : ''}
      ${c.tailSwitchColor ? `<div class="detail-field" style="margin-top:8px"><label>Tail Switch Color</label><span>${c.tailSwitchColor}</span></div>` : ''}
      ${c.muzzlePrintBase64 ? `<div class="detail-field" style="margin-top:12px"><label>Muzzle Print</label><img src="${c.muzzlePrintBase64}" style="width:120px;height:90px;object-fit:cover;border-radius:6px;border:2px solid var(--color-border)"></div>` : ''}
      ${c.videoUrl ? `<div class="detail-field" style="margin-top:12px"><label>Video</label><a href="${c.videoUrl}" target="_blank" style="color:var(--color-primary)">${c.videoUrl}</a></div>` : ''}
    `;
    if (calves.length > 0) {
      html += `<h4 style="margin-top:16px;font-size:0.9rem">Calves (${calves.length})</h4>`;
      calves.forEach(calf => {
        html += `<div class="activity-item" style="cursor:pointer" onclick="Cows.showDetail('${calf.id}')">${calf.name||calf.earTag} - ${calf.breed||''} (${UI.formatDate(calf.dob)})</div>`;
      });
    }
    if (healthRecords.length > 0) {
      html += `<h4 style="margin-top:16px;font-size:0.9rem">Health Records (${healthRecords.length})</h4>`;
      healthRecords.slice(0, 5).forEach(h => {
        html += `<div class="activity-item">${UI.formatDate(h.date)} - ${h.description||'checkup'} <small>${h.treatment||''}</small></div>`;
      });
    }
    if (breedingRecords.length > 0) {
      html += `<h4 style="margin-top:16px;font-size:0.9rem">Breeding History (${breedingRecords.length})</h4>`;
      breedingRecords.slice(0, 5).forEach(b => {
        html += `<div class="activity-item">${UI.formatDate(b.serviceDate)} - ${b.serviceType} <small>${b.bullDetails||''}</small></div>`;
      });
    }
    if (verifications.length > 0) {
      html += `<h4 style="margin-top:16px;font-size:0.9rem">Verification History (${verifications.length})</h4>`;
      verifications.slice(0, 5).forEach(v => {
        const resClass = v.result === 'Pass' ? 'badge-verified' : v.result === 'Fail' ? 'badge-mismatch' : 'badge-partial-match';
        html += `<div class="activity-item">${UI.formatDate(v.date)} - <span class="badge ${resClass}">${v.result} (${v.matchScore}%)</span> by ${v.verifiedBy||'Unknown'} ${v.mismatches ? '<small style="color:#DC2626">Mismatches: '+v.mismatches+'</small>' : ''}</div>`;
      });
    }
    html += `<div class="form-actions" style="margin-top:20px">
      <button class="btn btn-primary" onclick="Cows.closeDetail(); CowVerify.openVerifyPanel('${c.earTag}')">Verify Identity</button>
      <button class="btn btn-secondary" onclick="Cows.closeDetail(); Cows.openForm('${id}')">Edit Cow</button>
    </div>`;
    body.innerHTML = html;
    panel.classList.add('open');
  },
  closeDetail() {
    document.getElementById('cowDetailPanel').classList.remove('open');
  },
  remove(id, name) {
    if (UI.confirmDelete(name)) {
      Store.remove('cm_cows', id);
      UI.showToast('Cow deleted');
      Cows.render();
    }
  },
  init() {
    document.getElementById('cowSearch').addEventListener('input', (e) => {
      Cows.render(e.target.value);
    });
  }
};

// ===== COW VERIFICATION (ANTI-FRAUD) =====
const CowVerify = {
  openVerifyPanel(prefillTag) {
    const earTag = prefillTag || '';
    UI.openModal('Verify Cow Identity', `
      <div class="verify-panel">
        <div class="verify-lookup">
          <input type="text" id="verifyEarTag" placeholder="Enter Ear Tag or RFID..." value="${earTag}">
          <button class="btn btn-primary" onclick="CowVerify.lookupCow()">Lookup</button>
        </div>
        <div id="verifyResultArea"></div>
      </div>
    `);
    if (earTag) CowVerify.lookupCow();
  },
  lookupCow() {
    const searchVal = document.getElementById('verifyEarTag').value.trim();
    const area = document.getElementById('verifyResultArea');
    if (!searchVal) { area.innerHTML = '<p style="color:#DC2626">Enter an ear tag or RFID to search</p>'; return; }
    const allCows = Store.getAll('cm_cows');
    const cow = allCows.find(c => c.earTag === searchVal || c.rfidTag === searchVal);
    if (!cow) {
      area.innerHTML = `<div class="alert-item danger" style="padding:16px;text-align:center">
        <strong>&#x26A0; NO COW FOUND</strong> with tag/RFID "${searchVal}"<br>
        <small>This may indicate an unregistered cow or a forged tag.</small>
      </div>`;
      return;
    }
    // Build verification checklist
    const checks = [
      { label: 'Breed', expected: cow.breed || 'Not recorded', field: 'breed' },
      { label: 'Sex', expected: cow.sex || 'Not recorded', field: 'sex' },
      { label: 'Color & Markings', expected: cow.colorMarkings || 'Not recorded', field: 'colorMarkings' },
      { label: 'Horn Pattern', expected: cow.hornPattern || 'Not recorded', field: 'hornPattern' },
      { label: 'Tail Switch Color', expected: cow.tailSwitchColor || 'Not recorded', field: 'tailSwitchColor' },
      { label: 'Distinguishing Marks', expected: cow.distinguishingMarks || 'Not recorded', field: 'distinguishingMarks' },
      { label: 'Approx. Weight', expected: cow.weight ? cow.weight + ' kg' : 'Not recorded', field: 'weight' },
      { label: 'Approx. Height', expected: cow.heightCm ? cow.heightCm + ' cm' : 'Not recorded', field: 'heightCm' },
      { label: 'Body Condition', expected: cow.bodyConditionScore || 'Not recorded', field: 'bodyConditionScore' },
    ];
    if (cow.muzzlePrintBase64) checks.push({ label: 'Muzzle Print', expected: 'Photo on file', field: 'muzzlePrint', isPhoto: true });

    const photos = [cow.pictureBase64, cow.photoLeftBase64, cow.photoRightBase64].filter(Boolean);
    const photoLabels = ['Front', 'Left', 'Right'];
    let photoHtml = '';
    if (photos.length) {
      photoHtml = `<div style="display:flex;gap:6px;margin-bottom:8px">${photos.map((p, i) => `<img src="${p}" style="width:80px;height:60px;object-fit:cover;border-radius:4px;border:1px solid var(--color-border)" title="${photoLabels[i]}">`).join('')}</div>`;
    }

    area.innerHTML = `
      <div class="verify-result">
        <div class="verify-cow-header">
          ${cow.pictureBase64 ? `<img src="${cow.pictureBase64}" alt="${cow.name}">` : '<div style="width:80px;height:80px;border-radius:50%;background:#E5E7EB;display:flex;align-items:center;justify-content:center;font-size:32px">&#x1F404;</div>'}
          <div class="verify-cow-info">
            <h4>${cow.name || 'Unnamed'} (${cow.earTag})</h4>
            <p>RFID: ${cow.rfidTag || 'Not set'} | Breed: ${cow.breed || '-'} | DOB: ${cow.dob ? UI.formatDate(cow.dob) : '-'}</p>
            <p>Facility: ${cow.facilityId ? UI.getFacilityName(cow.facilityId) : '-'}</p>
          </div>
        </div>
        ${photos.length ? `<div style="padding:12px 16px;border-bottom:1px solid var(--color-border)"><small style="font-weight:600;color:#374151">Reference Photos:</small>${photoHtml}</div>` : ''}
        ${cow.muzzlePrintBase64 ? `<div style="padding:12px 16px;border-bottom:1px solid var(--color-border)"><small style="font-weight:600;color:#374151">Muzzle Print on File:</small><br><img src="${cow.muzzlePrintBase64}" style="width:120px;height:80px;object-fit:cover;border-radius:4px;margin-top:4px;border:1px solid var(--color-border)"></div>` : ''}
        <div class="verify-checklist">
          <h4>Identity Verification Checklist</h4>
          ${checks.map((ch, i) => `
            <div class="verify-item">
              <label>${ch.label}</label>
              <span class="expected">${ch.expected}</span>
              <select id="vcheck_${i}" class="verify-select" onchange="CowVerify.updateCheckStyle(this)">
                <option value="">Check...</option>
                <option value="match">Match</option>
                <option value="mismatch">Mismatch</option>
                <option value="unable">Unable to verify</option>
              </select>
            </div>
          `).join('')}
        </div>
        <div style="padding:12px 16px;border-top:1px solid var(--color-border)">
          <div class="form-group"><label>Verified By</label><input id="verifyByName" placeholder="Inspector name" style="width:100%"></div>
          <div class="form-group" style="margin-top:8px"><label>Notes</label><textarea id="verifyNotes" rows="2" placeholder="Any observations..." style="width:100%"></textarea></div>
        </div>
        <div class="verify-score-bar" id="verifyScoreBar" style="display:none">
          <div class="score-circle" id="verifyScoreCircle">-</div>
          <div class="score-text"><h4 id="verifyScoreLabel">-</h4><p id="verifyScoreDesc">-</p></div>
        </div>
        <div style="padding:12px 16px;display:flex;gap:8px">
          <button class="btn btn-primary" onclick="CowVerify.submitVerification('${cow.id}', ${checks.length})">Submit Verification</button>
          <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
        </div>
      </div>
    `;
  },
  updateCheckStyle(selectEl) {
    selectEl.className = 'verify-select ' + (selectEl.value === 'match' ? 'match' : selectEl.value === 'mismatch' ? 'mismatch' : '');
  },
  submitVerification(cowId, totalChecks) {
    const verifiedBy = document.getElementById('verifyByName').value.trim();
    if (!verifiedBy) { UI.showToast('Please enter inspector name', 'error'); return; }
    let matches = 0, mismatches = 0, unable = 0;
    const mismatchList = [];
    for (let i = 0; i < totalChecks; i++) {
      const sel = document.getElementById('vcheck_' + i);
      if (!sel) continue;
      const label = sel.closest('.verify-item').querySelector('label').textContent;
      if (sel.value === 'match') matches++;
      else if (sel.value === 'mismatch') { mismatches++; mismatchList.push(label); }
      else unable++;
    }
    const checked = matches + mismatches;
    const matchScore = checked > 0 ? Math.round((matches / checked) * 100) : 0;
    const result = mismatches > 0 ? (matchScore >= 70 ? 'Partial Match' : 'Fail') : (checked > 0 ? 'Pass' : 'Inconclusive');

    // Save to verification log
    const logEntry = {
      cowId,
      earTag: Store.get('cm_cows', cowId)?.earTag || '',
      date: new Date().toISOString().split('T')[0],
      verifiedBy,
      matchScore,
      result,
      mismatches: mismatchList.join(', '),
      totalChecks,
      matchCount: matches,
      mismatchCount: mismatches,
      unableCount: unable,
      notes: document.getElementById('verifyNotes').value
    };
    Store.add('cm_verification_log', logEntry);

    // Show result
    const scoreBar = document.getElementById('verifyScoreBar');
    const circle = document.getElementById('verifyScoreCircle');
    const label = document.getElementById('verifyScoreLabel');
    const desc = document.getElementById('verifyScoreDesc');
    scoreBar.style.display = 'flex';
    circle.textContent = matchScore + '%';
    circle.className = 'score-circle ' + (result === 'Pass' ? 'pass' : result === 'Fail' ? 'fail' : 'warn');

    if (result === 'Fail') {
      label.textContent = 'IDENTITY MISMATCH - POSSIBLE FRAUD!';
      label.style.color = '#DC2626';
      desc.textContent = `${mismatches} mismatch(es) detected: ${mismatchList.join(', ')}. This cow may have been exchanged.`;
    } else if (result === 'Partial Match') {
      label.textContent = 'PARTIAL MATCH - REVIEW REQUIRED';
      label.style.color = '#F59E0B';
      desc.textContent = `${matches} matched, ${mismatches} mismatched (${mismatchList.join(', ')}). Verify manually.`;
    } else if (result === 'Pass') {
      label.textContent = 'IDENTITY VERIFIED';
      label.style.color = '#16A34A';
      desc.textContent = `All ${matches} checked identifiers matched successfully.`;
    } else {
      label.textContent = 'INCONCLUSIVE';
      label.style.color = '#6B7280';
      desc.textContent = 'No identifiers were checked. Please verify at least one field.';
    }

    UI.showToast(`Verification ${result}: ${matchScore}% match`, result === 'Pass' ? 'success' : result === 'Fail' ? 'error' : 'warning');
  },
  renderLog() {
    const tbody = document.querySelector('#verificationLogTable tbody');
    if (!tbody) return;
    const data = Store.getAll('cm_verification_log');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>No verification records yet. Use "Verify Cow" to check cow identity.</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = [...data].sort((a, b) => (b.date||'').localeCompare(a.date||'')).map(v => {
      const cow = Store.get('cm_cows', v.cowId);
      const cowName = cow ? (cow.name || cow.earTag) : v.earTag;
      const resClass = v.result === 'Pass' ? 'badge-verified' : v.result === 'Fail' ? 'badge-mismatch' : 'badge-partial-match';
      const scoreClass = v.matchScore >= 70 ? 'high' : v.matchScore >= 40 ? 'medium' : 'low';
      return `<tr>
        <td>${UI.formatDate(v.date)}</td>
        <td><strong>${v.earTag}</strong></td>
        <td>${cowName}</td>
        <td>${v.verifiedBy}</td>
        <td><span class="id-score ${scoreClass}">${v.matchScore}%</span></td>
        <td><span class="badge ${resClass}">${v.result}</span></td>
        <td>${v.mismatches ? '<span style="color:#DC2626;font-size:12px">' + v.mismatches + '</span>' : '<span style="color:#16A34A;font-size:12px">None</span>'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-danger" onclick="CowVerify.removeLog('${v.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  removeLog(id) { if (confirm('Delete this verification record?')) { Store.remove('cm_verification_log', id); UI.showToast('Deleted'); CowVerify.renderLog(); } },
  clearLog() { if (confirm('Clear entire verification log?')) { localStorage.removeItem('cm_verification_log'); UI.showToast('Log cleared'); CowVerify.renderLog(); } }
};

// ===== HEALTH =====
const Health = {
  render() {
    const records = Store.getAll('cm_health_records');
    const individual = records.filter(r => r.recordType === 'individual');
    const group = records.filter(r => r.recordType === 'group');

    const indTbody = document.querySelector('#healthIndividualTable tbody');
    if (individual.length === 0) {
      indTbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>No individual health records</p></div></td></tr>';
    } else {
      indTbody.innerHTML = individual.sort((a,b) => new Date(b.date) - new Date(a.date)).map(h => `<tr>
        <td>${UI.formatDate(h.date)}</td><td>${UI.getCowName(h.cowId)}</td>
        <td>${h.description||'-'}</td><td>${h.treatment||'-'}</td><td>${h.veterinarian||'-'}</td>
        <td>${h.nextFollowUp ? UI.formatDate(h.nextFollowUp) : '-'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Health.openForm('${h.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Health.remove('${h.id}')">Delete</button>
        </td>
      </tr>`).join('');
    }

    const grpTbody = document.querySelector('#healthGroupTable tbody');
    if (group.length === 0) {
      grpTbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>No group health records</p></div></td></tr>';
    } else {
      grpTbody.innerHTML = group.sort((a,b) => new Date(b.date) - new Date(a.date)).map(h => `<tr>
        <td>${UI.formatDate(h.date)}</td><td>${UI.getFacilityName(h.facilityId)}</td>
        <td>${h.description||'-'}</td><td>${h.treatment||'-'}</td><td>${h.vaccineName||'-'}</td><td>${h.veterinarian||'-'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Health.openForm('${h.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Health.remove('${h.id}')">Delete</button>
        </td>
      </tr>`).join('');
    }
  },
  openForm(id) {
    const h = id ? Store.get('cm_health_records', id) : {};
    const cows = Store.getAll('cm_cows').map(c => ({ value: c.id, label: `${c.name || c.earTag} (${c.earTag})` }));
    const facilities = Store.getAll('cm_facilities').map(f => ({ value: f.id, label: f.shedName }));
    UI.openModal(id ? 'Edit Health Record' : 'Add Health Record', `
      <form id="healthForm" class="form-grid">
        <div class="form-group"><label>Record Type</label>
          <select name="recordType" id="healthRecordType">
            <option value="individual" ${(!h.recordType||h.recordType==='individual')?'selected':''}>Individual</option>
            <option value="group" ${h.recordType==='group'?'selected':''}>Group</option>
          </select></div>
        <div class="form-group"><label>Date</label><input type="date" name="date" value="${h.date ? h.date.slice(0,10) : new Date().toISOString().slice(0,10)}" required></div>
        <div class="form-group" id="healthCowField"><label>Cow</label><select name="cowId">${UI.buildSelect(cows, h.cowId||'')}</select></div>
        <div class="form-group" id="healthFacilityField" style="display:${h.recordType==='group'?'flex':'none'}"><label>Facility</label><select name="facilityId">${UI.buildSelect(facilities, h.facilityId||'')}</select></div>
        <div class="form-group full-width"><label>Description / Diagnosis</label><textarea name="description">${h.description||''}</textarea></div>
        <div class="form-group full-width"><label>Treatment</label><textarea name="treatment">${h.treatment||''}</textarea></div>
        <div class="form-group"><label>Veterinarian</label><input name="veterinarian" value="${h.veterinarian||''}"></div>
        <div class="form-group"><label>Next Follow-up</label><input type="date" name="nextFollowUp" value="${h.nextFollowUp ? h.nextFollowUp.slice(0,10) : ''}"></div>
        <div class="form-group" id="healthVaccineField" style="display:${h.recordType==='group'?'flex':'none'}"><label>Vaccine Name</label><input name="vaccineName" value="${h.vaccineName||''}"></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'} Record</button>
        </div>
      </form>
    `);
    document.getElementById('healthRecordType').addEventListener('change', (e) => {
      const isGroup = e.target.value === 'group';
      document.getElementById('healthCowField').style.display = isGroup ? 'none' : 'flex';
      document.getElementById('healthFacilityField').style.display = isGroup ? 'flex' : 'none';
      document.getElementById('healthVaccineField').style.display = isGroup ? 'flex' : 'none';
    });
    document.getElementById('healthForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.id) Store.update('cm_health_records', obj.id, obj);
      else Store.add('cm_health_records', obj);
      UI.closeModal();
      UI.showToast('Health record saved');
      Health.render();
    };
  },
  remove(id) {
    if (confirm('Delete this health record?')) {
      Store.remove('cm_health_records', id);
      UI.showToast('Deleted');
      Health.render();
    }
  }
};

// ===== BREEDING =====
const Breeding = {
  render() {
    this.renderBreeding();
    this.renderPregnancy();
  },
  renderBreeding() {
    const data = Store.getAll('cm_breeding_records').sort((a,b) => new Date(b.serviceDate) - new Date(a.serviceDate));
    const tbody = document.querySelector('#breedingTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>No breeding records</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(b => {
      let statusBadge = '';
      if (b.wasSuccessful === true || b.wasSuccessful === 'true') statusBadge = '<span class="badge badge-success">Confirmed</span>';
      else if (b.wasSuccessful === false || b.wasSuccessful === 'false') statusBadge = '<span class="badge badge-danger">Failed</span>';
      else statusBadge = '<span class="badge badge-pending">Pending</span>';
      return `<tr>
        <td>${UI.formatDate(b.serviceDate)}</td><td>${UI.getCowName(b.cowId)}</td>
        <td><span class="badge badge-info">${b.serviceType}</span></td>
        <td>${b.bullDetails||'-'}</td><td>${b.technician||'-'}</td><td>${statusBadge}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Breeding.openBreedingForm('${b.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Breeding.removeBreeding('${b.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  renderPregnancy() {
    const data = Store.getAll('cm_pregnancy_tracking');
    const grid = document.getElementById('pregnancyGrid');
    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>No pregnancies being tracked</p></div>';
      return;
    }
    grid.innerHTML = data.map(p => {
      const cow = Store.get('cm_cows', p.cowId);
      const totalDays = 283;
      const daysPregnant = UI.daysBetween(p.confirmedDate, new Date());
      const daysRemaining = Math.max(0, UI.daysBetween(new Date(), p.expectedCalvingDate));
      const pct = Math.min(100, Math.round((daysPregnant / totalDays) * 100));
      const checkups = p.checkups || [];
      const statusBadge = p.status === 'delivered' ? 'badge-success' : p.status === 'aborted' ? 'badge-danger' : 'badge-pregnant';
      return `<div class="pregnancy-card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h4>${cow ? (cow.name || cow.earTag) : 'Unknown'}</h4>
          <span class="badge ${statusBadge}">${p.status}</span>
        </div>
        <div class="pregnancy-info">
          <div>Confirmed: ${UI.formatDate(p.confirmedDate)}</div>
          <div>Expected Calving: ${UI.formatDate(p.expectedCalvingDate)}</div>
        </div>
        <div class="pregnancy-progress">
          <div class="progress-bar"><div class="progress-fill purple" style="width:${pct}%"></div></div>
          <div class="days-remaining">${daysRemaining} days remaining (${pct}%)</div>
        </div>
        ${checkups.length > 0 ? `<div class="checkup-list"><strong style="font-size:0.8rem">Checkups:</strong>${checkups.map(c => `<div class="checkup-item">${UI.formatDate(c.date)} - ${c.notes} <span class="badge badge-${c.status==='normal'?'success':'warning'}">${c.status}</span></div>`).join('')}</div>` : ''}
        <div class="form-actions" style="margin-top:12px">
          <button class="btn btn-sm btn-secondary" onclick="Breeding.addCheckup('${p.id}')">Add Checkup</button>
          <button class="btn btn-sm btn-outline" onclick="Breeding.openPregnancyForm('${p.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Breeding.removePregnancy('${p.id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  },
  openBreedingForm(id) {
    const b = id ? Store.get('cm_breeding_records', id) : {};
    const cows = Store.getAll('cm_cows').filter(c => c.sex === 'female' && c.status === 'active').map(c => ({ value: c.id, label: `${c.name || c.earTag} (${c.earTag})` }));
    UI.openModal(id ? 'Edit Breeding Record' : 'Record Breeding', `
      <form id="breedingForm" class="form-grid">
        <div class="form-group"><label>Cow</label><select name="cowId" required>${UI.buildSelect(cows, b.cowId||'')}</select></div>
        <div class="form-group"><label>Service Date</label><input type="date" name="serviceDate" value="${b.serviceDate ? b.serviceDate.slice(0,10) : new Date().toISOString().slice(0,10)}" required></div>
        <div class="form-group"><label>Service Type</label>
          <select name="serviceType">
            <option value="AI" ${b.serviceType==='AI'?'selected':''}>Artificial Insemination (AI)</option>
            <option value="natural" ${b.serviceType==='natural'?'selected':''}>Natural Service</option>
          </select></div>
        <div class="form-group"><label>Bull / Straw Details</label><input name="bullDetails" value="${b.bullDetails||''}" placeholder="Bull name or straw ID"></div>
        <div class="form-group"><label>Technician</label><input name="technician" value="${b.technician||''}"></div>
        <div class="form-group"><label>Result</label>
          <select name="wasSuccessful">
            <option value="" ${b.wasSuccessful==null?'selected':''}>Pending</option>
            <option value="true" ${b.wasSuccessful===true||b.wasSuccessful==='true'?'selected':''}>Successful</option>
            <option value="false" ${b.wasSuccessful===false||b.wasSuccessful==='false'?'selected':''}>Failed</option>
          </select></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${b.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Record'} Breeding</button>
        </div>
      </form>
    `);
    document.getElementById('breedingForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.wasSuccessful === '') obj.wasSuccessful = null;
      if (obj.id) Store.update('cm_breeding_records', obj.id, obj);
      else {
        const record = Store.add('cm_breeding_records', obj);
        // Auto-create pregnancy if successful
        if (obj.wasSuccessful === 'true') {
          const expDate = new Date(obj.serviceDate);
          expDate.setDate(expDate.getDate() + 283);
          Store.add('cm_pregnancy_tracking', {
            cowId: obj.cowId,
            breedingRecordId: record.id,
            confirmedDate: obj.serviceDate,
            expectedCalvingDate: expDate.toISOString().slice(0, 10),
            checkups: [],
            status: 'confirmed'
          });
        }
      }
      UI.closeModal();
      UI.showToast('Breeding record saved');
      Breeding.render();
    };
  },
  openPregnancyForm(id) {
    const p = id ? Store.get('cm_pregnancy_tracking', id) : {};
    const cows = Store.getAll('cm_cows').filter(c => c.sex === 'female').map(c => ({ value: c.id, label: `${c.name || c.earTag} (${c.earTag})` }));
    const breedings = Store.getAll('cm_breeding_records').map(b => ({ value: b.id, label: `${UI.getCowName(b.cowId)} - ${UI.formatDate(b.serviceDate)}` }));
    UI.openModal(id ? 'Edit Pregnancy' : 'Track Pregnancy', `
      <form id="pregnancyForm" class="form-grid">
        <div class="form-group"><label>Cow</label><select name="cowId" required>${UI.buildSelect(cows, p.cowId||'')}</select></div>
        <div class="form-group"><label>Breeding Record</label><select name="breedingRecordId">${UI.buildSelect(breedings, p.breedingRecordId||'', 'None')}</select></div>
        <div class="form-group"><label>Confirmed Date</label><input type="date" name="confirmedDate" value="${p.confirmedDate||''}" required></div>
        <div class="form-group"><label>Expected Calving Date</label><input type="date" name="expectedCalvingDate" value="${p.expectedCalvingDate||''}" required></div>
        <div class="form-group"><label>Status</label>
          <select name="status">
            <option value="confirmed" ${(!p.status||p.status==='confirmed')?'selected':''}>Confirmed</option>
            <option value="in-progress" ${p.status==='in-progress'?'selected':''}>In Progress</option>
            <option value="delivered" ${p.status==='delivered'?'selected':''}>Delivered</option>
            <option value="aborted" ${p.status==='aborted'?'selected':''}>Aborted</option>
          </select></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Track'} Pregnancy</button>
        </div>
      </form>
    `);
    // Auto-calc expected date
    const confirmedInput = document.querySelector('input[name="confirmedDate"]');
    const expectedInput = document.querySelector('input[name="expectedCalvingDate"]');
    confirmedInput.addEventListener('change', () => {
      if (!expectedInput.value) {
        const d = new Date(confirmedInput.value);
        d.setDate(d.getDate() + 283);
        expectedInput.value = d.toISOString().slice(0, 10);
      }
    });
    document.getElementById('pregnancyForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      obj.checkups = id ? (Store.get('cm_pregnancy_tracking', id)?.checkups || []) : [];
      if (obj.id) Store.update('cm_pregnancy_tracking', obj.id, obj);
      else Store.add('cm_pregnancy_tracking', obj);
      UI.closeModal();
      UI.showToast('Pregnancy record saved');
      Breeding.renderPregnancy();
    };
  },
  addCheckup(pregnancyId) {
    UI.openModal('Add Checkup', `
      <form id="checkupForm" class="form-grid">
        <div class="form-group"><label>Date</label><input type="date" name="date" value="${new Date().toISOString().slice(0,10)}" required></div>
        <div class="form-group"><label>Status</label>
          <select name="status">
            <option value="normal">Normal</option>
            <option value="concern">Concern</option>
          </select></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes" required></textarea></div>
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Checkup</button>
        </div>
      </form>
    `);
    document.getElementById('checkupForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      const pregnancy = Store.get('cm_pregnancy_tracking', pregnancyId);
      if (pregnancy) {
        const checkups = pregnancy.checkups || [];
        checkups.push(obj);
        Store.update('cm_pregnancy_tracking', pregnancyId, { checkups, status: 'in-progress' });
      }
      UI.closeModal();
      UI.showToast('Checkup added');
      Breeding.renderPregnancy();
    };
  },
  removeBreeding(id) {
    if (confirm('Delete this breeding record?')) {
      Store.remove('cm_breeding_records', id);
      UI.showToast('Deleted');
      Breeding.renderBreeding();
    }
  },
  removePregnancy(id) {
    if (confirm('Delete this pregnancy record?')) {
      Store.remove('cm_pregnancy_tracking', id);
      UI.showToast('Deleted');
      Breeding.renderPregnancy();
    }
  }
};

// ===== CALVING =====
const Calving = {
  render() {
    const data = Store.getAll('cm_calving_records').sort((a,b) => new Date(b.calvingDate) - new Date(a.calvingDate));
    const tbody = document.querySelector('#calvingTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">&#x1F42E;</div><p>No calving records yet</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(c => {
      const calves = (c.calves || []).map(calf => {
        const calfCow = Store.get('cm_cows', calf.calfId);
        return `${calfCow ? (calfCow.name || calfCow.earTag) : 'Unknown'} (${calf.sex}, ${calf.birthWeight}kg)`;
      }).join(', ');
      return `<tr>
        <td>${UI.formatDate(c.calvingDate)}</td><td>${UI.getCowName(c.motherId)}</td>
        <td><span class="badge badge-info">${c.calvingType}</span></td>
        <td>${calves || '-'}</td><td>${c.attendedBy||'-'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Calving.openForm('${c.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Calving.remove('${c.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  openForm(id) {
    const c = id ? Store.get('cm_calving_records', id) : {};
    const pregnantCows = Store.getAll('cm_cows').filter(cow => cow.sex === 'female' && cow.status === 'active').map(cow => ({ value: cow.id, label: `${cow.name || cow.earTag} (${cow.earTag})` }));
    const existingCalves = c.calves || [{ sex: 'female', birthWeight: '' }];

    let calvesHtml = existingCalves.map((calf, i) => Calving.calfEntryHtml(i, calf)).join('');

    UI.openModal(id ? 'Edit Calving Record' : 'Record Calving', `
      <form id="calvingForm" class="form-grid">
        <div class="form-group"><label>Mother</label><select name="motherId" required>${UI.buildSelect(pregnantCows, c.motherId||'')}</select></div>
        <div class="form-group"><label>Calving Date</label><input type="date" name="calvingDate" value="${c.calvingDate ? c.calvingDate.slice(0,10) : new Date().toISOString().slice(0,10)}" required></div>
        <div class="form-group"><label>Calving Type</label>
          <select name="calvingType">
            <option value="normal" ${c.calvingType==='normal'?'selected':''}>Normal</option>
            <option value="assisted" ${c.calvingType==='assisted'?'selected':''}>Assisted</option>
            <option value="cesarean" ${c.calvingType==='cesarean'?'selected':''}>Cesarean</option>
          </select></div>
        <div class="form-group"><label>Attended By</label><input name="attendedBy" value="${c.attendedBy||''}"></div>
        <div class="form-group full-width"><label>Complications</label><textarea name="complications">${c.complications||''}</textarea></div>
        <div class="form-group full-width">
          <label>Calves</label>
          <div id="calvesContainer">${calvesHtml}</div>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-top:8px" onclick="Calving.addCalfEntry()">+ Add Another Calf</button>
        </div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${c.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Record'} Calving</button>
        </div>
      </form>
    `);
    document.getElementById('calvingForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const obj = {
        motherId: fd.get('motherId'),
        calvingDate: fd.get('calvingDate'),
        calvingType: fd.get('calvingType'),
        attendedBy: fd.get('attendedBy'),
        complications: fd.get('complications'),
        notes: fd.get('notes'),
        id: fd.get('id')
      };
      // Collect calves
      const calfSexes = fd.getAll('calfSex');
      const calfWeights = fd.getAll('calfWeight');
      const calfNames = fd.getAll('calfName');
      const calfEarTags = fd.getAll('calfEarTag');
      obj.calves = calfSexes.map((sex, i) => ({
        sex,
        birthWeight: parseFloat(calfWeights[i]) || 0,
        calfName: calfNames[i] || '',
        calfEarTag: calfEarTags[i] || ''
      }));

      if (obj.id) {
        Store.update('cm_calving_records', obj.id, obj);
      } else {
        // Create calf cow records
        const mother = Store.get('cm_cows', obj.motherId);
        obj.calves = obj.calves.map(calf => {
          const newCow = Store.add('cm_cows', {
            earTag: calf.calfEarTag || `CALF-${Date.now().toString(36)}`,
            name: calf.calfName || '',
            breed: mother ? mother.breed : '',
            sex: calf.sex,
            dob: obj.calvingDate,
            weight: calf.birthWeight,
            status: 'active',
            facilityId: mother ? mother.facilityId : '',
            motherId: obj.motherId,
            pictureBase64: '',
            videoUrl: '',
            notes: 'Born via calving record'
          });
          return { ...calf, calfId: newCow.id };
        });
        Store.add('cm_calving_records', obj);
        // Update pregnancy status if exists
        const pregnancies = Store.query('cm_pregnancy_tracking', p => p.cowId === obj.motherId && (p.status === 'confirmed' || p.status === 'in-progress'));
        pregnancies.forEach(p => Store.update('cm_pregnancy_tracking', p.id, { status: 'delivered' }));
      }
      UI.closeModal();
      UI.showToast('Calving record saved');
      Calving.render();
    };
  },
  calfEntryHtml(index, calf = {}) {
    return `<div class="calf-entry">
      <h5>Calf #${index + 1}</h5>
      <div class="form-grid">
        <div class="form-group"><label>Ear Tag</label><input name="calfEarTag" value="${calf.calfEarTag||''}"></div>
        <div class="form-group"><label>Name</label><input name="calfName" value="${calf.calfName||''}"></div>
        <div class="form-group"><label>Sex</label>
          <select name="calfSex">
            <option value="female" ${calf.sex==='female'?'selected':''}>Female</option>
            <option value="male" ${calf.sex==='male'?'selected':''}>Male</option>
          </select></div>
        <div class="form-group"><label>Birth Weight (kg)</label><input type="number" step="0.1" name="calfWeight" value="${calf.birthWeight||''}"></div>
      </div>
    </div>`;
  },
  addCalfEntry() {
    const container = document.getElementById('calvesContainer');
    const count = container.querySelectorAll('.calf-entry').length;
    container.insertAdjacentHTML('beforeend', Calving.calfEntryHtml(count));
  },
  remove(id) {
    if (confirm('Delete this calving record?')) {
      Store.remove('cm_calving_records', id);
      UI.showToast('Deleted');
      Calving.render();
    }
  }
};

// ===== WEANING =====
const Weaning = {
  render() {
    const data = Store.getAll('cm_weaning_records').sort((a,b) => new Date(b.weaningDate) - new Date(a.weaningDate));
    const tbody = document.querySelector('#weaningTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">&#x1F4CA;</div><p>No weaning records yet</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(w => `<tr>
      <td>${UI.getCowName(w.calfId)}</td><td>${UI.formatDate(w.weaningDate)}</td>
      <td>${w.birthWeight}</td><td>${w.weaningWeight}</td>
      <td>${w.ageAtWeaningDays}</td><td>${w.adg ? w.adg.toFixed(3) : '-'}</td>
      <td>${w.adjustedWeight205 ? w.adjustedWeight205.toFixed(1) : '-'}</td>
      <td class="action-btns">
        <button class="btn btn-sm btn-secondary" onclick="Weaning.openForm('${w.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="Weaning.remove('${w.id}')">Delete</button>
      </td>
    </tr>`).join('');
  },
  openForm(id) {
    const w = id ? Store.get('cm_weaning_records', id) : {};
    const calves = Store.getAll('cm_cows').filter(c => c.motherId).map(c => ({ value: c.id, label: `${c.name || c.earTag} (${c.earTag})` }));
    UI.openModal(id ? 'Edit Weaning Record' : 'Record Weaning', `
      <form id="weaningForm" class="form-grid">
        <div class="form-group"><label>Calf</label><select name="calfId" id="weaningCalfSelect" required>${UI.buildSelect(calves, w.calfId||'')}</select></div>
        <div class="form-group"><label>Weaning Date</label><input type="date" name="weaningDate" id="weaningDateInput" value="${w.weaningDate ? w.weaningDate.slice(0,10) : new Date().toISOString().slice(0,10)}" required></div>
        <div class="form-group"><label>Birth Weight (kg)</label><input type="number" step="0.1" name="birthWeight" id="weaningBirthWeight" value="${w.birthWeight||''}" required></div>
        <div class="form-group"><label>Weaning Weight (kg)</label><input type="number" step="0.1" name="weaningWeight" id="weaningWeanWeight" value="${w.weaningWeight||''}" required></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${w.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="weaning-metrics full-width" id="weaningMetrics">
          <div class="metric-box"><div class="metric-value" id="metricAge">-</div><div class="metric-label">Age (days)</div></div>
          <div class="metric-box"><div class="metric-value" id="metricADG">-</div><div class="metric-label">ADG (kg/day)</div></div>
          <div class="metric-box"><div class="metric-value" id="metricAdj205">-</div><div class="metric-label">205-Day Adj Wt</div></div>
        </div>
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Record'} Weaning</button>
        </div>
      </form>
    `);
    // Auto-fill birth weight when calf selected
    const calfSelect = document.getElementById('weaningCalfSelect');
    calfSelect.addEventListener('change', () => {
      const calf = Store.get('cm_cows', calfSelect.value);
      if (calf) {
        const calvingRecords = Store.getAll('cm_calving_records');
        for (const cr of calvingRecords) {
          const calfEntry = (cr.calves || []).find(c => c.calfId === calf.id);
          if (calfEntry && calfEntry.birthWeight) {
            document.getElementById('weaningBirthWeight').value = calfEntry.birthWeight;
            break;
          }
        }
      }
      Weaning.calcMetrics();
    });
    // Real-time calc
    const calcInputs = ['weaningDateInput', 'weaningBirthWeight', 'weaningWeanWeight'];
    calcInputs.forEach(inputId => {
      document.getElementById(inputId).addEventListener('input', () => Weaning.calcMetrics());
    });
    // Initial calc
    if (id) Weaning.calcMetrics();
  },
  calcMetrics() {
    const calfId = document.getElementById('weaningCalfSelect').value;
    const weaningDate = document.getElementById('weaningDateInput').value;
    const birthWeight = parseFloat(document.getElementById('weaningBirthWeight').value) || 0;
    const weaningWeight = parseFloat(document.getElementById('weaningWeanWeight').value) || 0;

    const calf = Store.get('cm_cows', calfId);
    if (!calf || !calf.dob || !weaningDate || !birthWeight || !weaningWeight) return;

    const ageDays = UI.daysBetween(calf.dob, weaningDate);
    const adg = ageDays > 0 ? (weaningWeight - birthWeight) / ageDays : 0;
    const adj205 = ageDays > 0 ? ((weaningWeight - birthWeight) / ageDays) * 205 + birthWeight : 0;

    document.getElementById('metricAge').textContent = ageDays;
    document.getElementById('metricADG').textContent = adg.toFixed(3);
    document.getElementById('metricAdj205').textContent = adj205.toFixed(1);
  },
  remove(id) {
    if (confirm('Delete this weaning record?')) {
      Store.remove('cm_weaning_records', id);
      UI.showToast('Deleted');
      Weaning.render();
    }
  }
};

// ===== MILK PRODUCTION =====
const MilkProduction = {
  render() {
    this.renderDaily();
    this.renderLactation();
    this.renderSales();
  },
  renderDaily() {
    const data = Store.getAll('cm_milk_daily');
    const tbody = document.querySelector('#milkDailyTable tbody');
    // Summary
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = data.filter(r => r.date === today);
    const totalToday = todayRecords.reduce((s, r) => s + (parseFloat(r.morningYield)||0) + (parseFloat(r.eveningYield)||0), 0);
    const avgFat = todayRecords.length ? (todayRecords.reduce((s, r) => s + (parseFloat(r.fatPercent)||0), 0) / todayRecords.length).toFixed(1) : '-';
    const summaryEl = document.getElementById('milkDailySummary');
    if (summaryEl) summaryEl.innerHTML = `
      <div class="milk-stat">Today: <span class="milk-stat-value">${totalToday.toFixed(1)} L</span></div>
      <div class="milk-stat">Avg Fat: <span class="milk-stat-value">${avgFat}%</span></div>
      <div class="milk-stat">Cows Milked: <span class="milk-stat-value">${todayRecords.length}</span></div>
    `;
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>No milk records yet</p></div></td></tr>';
      return;
    }
    const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
    tbody.innerHTML = sorted.map(r => {
      const total = (parseFloat(r.morningYield)||0) + (parseFloat(r.eveningYield)||0);
      const gradeClass = r.grade === 'A' ? 'badge-success' : r.grade === 'B' ? 'badge-info' : 'badge-pending';
      return `<tr>
        <td>${UI.formatDate(r.date)}</td>
        <td>${UI.getCowName(r.cowId)}</td>
        <td>${r.morningYield || '-'}</td>
        <td>${r.eveningYield || '-'}</td>
        <td><strong>${total.toFixed(1)}</strong></td>
        <td>${r.fatPercent || '-'}</td>
        <td>${r.snfPercent || '-'}</td>
        <td><span class="badge ${gradeClass}">${r.grade || '-'}</span></td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="MilkProduction.openDailyForm('${r.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="MilkProduction.removeDaily('${r.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  renderLactation() {
    const data = Store.getAll('cm_milk_lactation');
    const grid = document.getElementById('lactationGrid');
    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>No lactation records yet</p><button class="btn btn-primary" onclick="MilkProduction.openLactationForm()">+ Add Lactation</button></div>';
      return;
    }
    grid.innerHTML = data.map(l => {
      const cow = Store.get('cm_cows', l.cowId);
      const cowName = cow ? (cow.name || cow.earTag) : 'Unknown';
      // Calculate total yield from daily records for this cow in this lactation period
      const dailyRecords = Store.getAll('cm_milk_daily').filter(d =>
        d.cowId === l.cowId && d.date >= l.startDate && (!l.dryOffDate || d.date <= l.dryOffDate)
      );
      const totalYield = dailyRecords.reduce((s, d) => s + (parseFloat(d.morningYield)||0) + (parseFloat(d.eveningYield)||0), 0);
      return `<div class="lactation-card">
        <h4>${cowName} - Lactation #${l.lactationNumber || '?'}</h4>
        <div class="lact-meta">
          <span>Start: ${UI.formatDate(l.startDate)}</span>
          <span>${l.dryOffDate ? 'Dry-off: ' + UI.formatDate(l.dryOffDate) : 'Active'}</span>
        </div>
        <div class="lact-stats">
          <div class="lact-stat"><div class="lact-stat-value">${l.peakYield || '-'}</div><div class="lact-stat-label">Peak Yield (L/day)</div></div>
          <div class="lact-stat"><div class="lact-stat-value">${totalYield.toFixed(1)}</div><div class="lact-stat-label">Total Yield (L)</div></div>
          <div class="lact-stat"><div class="lact-stat-value">${l.days305Yield || '-'}</div><div class="lact-stat-label">305-Day Yield (L)</div></div>
          <div class="lact-stat"><div class="lact-stat-value">${l.status || 'Active'}</div><div class="lact-stat-label">Status</div></div>
        </div>
        <div class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="MilkProduction.openLactationForm('${l.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="MilkProduction.removeLactation('${l.id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  },
  renderSales() {
    const data = Store.getAll('cm_milk_sales');
    const tbody = document.querySelector('#milkSalesTable tbody');
    const totalRevenue = data.reduce((s, r) => s + (parseFloat(r.totalAmount)||0), 0);
    const totalQty = data.reduce((s, r) => s + (parseFloat(r.quantity)||0), 0);
    const summaryEl = document.getElementById('milkSalesSummary');
    if (summaryEl) summaryEl.innerHTML = `
      <div class="milk-stat">Total Sold: <span class="milk-stat-value">${totalQty.toFixed(1)} L</span></div>
      <div class="milk-stat">Revenue: <span class="milk-stat-value">Rs ${totalRevenue.toFixed(0)}</span></div>
    `;
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>No milk sales yet</p></div></td></tr>';
      return;
    }
    const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
    tbody.innerHTML = sorted.map(r => {
      const payClass = r.paymentStatus === 'Paid' ? 'badge-paid' : r.paymentStatus === 'Partial' ? 'badge-partial' : 'badge-unpaid';
      return `<tr>
        <td>${UI.formatDate(r.date)}</td>
        <td>${r.buyerName}</td>
        <td>${r.quantity}</td>
        <td>Rs ${r.ratePerLitre}</td>
        <td><strong>Rs ${r.totalAmount}</strong></td>
        <td><span class="badge ${payClass}">${r.paymentStatus}</span></td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="MilkProduction.openSalesForm('${r.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="MilkProduction.removeSale('${r.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  openDailyForm(id) {
    const r = id ? Store.get('cm_milk_daily', id) : {};
    const cows = Store.getAll('cm_cows').filter(c => c.status === 'active' && c.sex !== 'Male');
    UI.openModal(id ? 'Edit Milk Record' : 'Record Daily Milk', `
      <form id="milkDailyForm" class="form-grid">
        <div class="form-group"><label>Date</label><input type="date" name="date" value="${r.date || new Date().toISOString().split('T')[0]}" required></div>
        <div class="form-group"><label>Cow</label>
          <select name="cowId" required>
            <option value="">Select Cow...</option>
            ${cows.map(c => `<option value="${c.id}" ${c.id===r.cowId?'selected':''}>${c.name || c.earTag} (${c.earTag})</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Morning Yield (L)</label><input type="number" step="0.1" name="morningYield" value="${r.morningYield||''}" placeholder="0.0"></div>
        <div class="form-group"><label>Evening Yield (L)</label><input type="number" step="0.1" name="eveningYield" value="${r.eveningYield||''}" placeholder="0.0"></div>
        <div class="form-group"><label>Fat %</label><input type="number" step="0.1" name="fatPercent" value="${r.fatPercent||''}" placeholder="e.g. 4.5"></div>
        <div class="form-group"><label>SNF %</label><input type="number" step="0.1" name="snfPercent" value="${r.snfPercent||''}" placeholder="e.g. 8.5"></div>
        <div class="form-group"><label>Grade</label>
          <select name="grade">
            <option value="">Select...</option>
            ${['A','B','C'].map(g => `<option value="${g}" ${g===r.grade?'selected':''}>${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${r.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Record'}</button>
        </div>
      </form>
    `);
    document.getElementById('milkDailyForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.id) Store.update('cm_milk_daily', obj.id, obj);
      else Store.add('cm_milk_daily', obj);
      UI.closeModal(); UI.showToast('Milk record saved');
      MilkProduction.render();
    };
  },
  openLactationForm(id) {
    const l = id ? Store.get('cm_milk_lactation', id) : {};
    const cows = Store.getAll('cm_cows').filter(c => c.sex !== 'Male');
    UI.openModal(id ? 'Edit Lactation' : 'Add Lactation Record', `
      <form id="lactationForm" class="form-grid">
        <div class="form-group"><label>Cow</label>
          <select name="cowId" required>
            <option value="">Select Cow...</option>
            ${cows.map(c => `<option value="${c.id}" ${c.id===l.cowId?'selected':''}>${c.name || c.earTag}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Lactation Number</label><input type="number" name="lactationNumber" value="${l.lactationNumber||''}" required min="1"></div>
        <div class="form-group"><label>Start Date</label><input type="date" name="startDate" value="${l.startDate||''}" required></div>
        <div class="form-group"><label>Dry-off Date</label><input type="date" name="dryOffDate" value="${l.dryOffDate||''}"></div>
        <div class="form-group"><label>Peak Yield (L/day)</label><input type="number" step="0.1" name="peakYield" value="${l.peakYield||''}"></div>
        <div class="form-group"><label>305-Day Yield (L)</label><input type="number" step="0.1" name="days305Yield" value="${l.days305Yield||''}"></div>
        <div class="form-group"><label>Status</label>
          <select name="status">
            ${['Active','Dry','Completed'].map(s => `<option value="${s}" ${s===l.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Add'}</button>
        </div>
      </form>
    `);
    document.getElementById('lactationForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.id) Store.update('cm_milk_lactation', obj.id, obj);
      else Store.add('cm_milk_lactation', obj);
      UI.closeModal(); UI.showToast('Lactation record saved');
      MilkProduction.render();
    };
  },
  openSalesForm(id) {
    const r = id ? Store.get('cm_milk_sales', id) : {};
    UI.openModal(id ? 'Edit Sale' : 'Record Milk Sale', `
      <form id="milkSalesForm" class="form-grid">
        <div class="form-group"><label>Date</label><input type="date" name="date" value="${r.date || new Date().toISOString().split('T')[0]}" required></div>
        <div class="form-group"><label>Buyer Name</label><input name="buyerName" value="${r.buyerName||''}" required></div>
        <div class="form-group"><label>Quantity (L)</label><input type="number" step="0.1" name="quantity" id="saleQty" value="${r.quantity||''}" required></div>
        <div class="form-group"><label>Rate per Litre (Rs)</label><input type="number" step="0.5" name="ratePerLitre" id="saleRate" value="${r.ratePerLitre||''}" required></div>
        <div class="form-group"><label>Total Amount (Rs)</label><input type="number" step="0.01" name="totalAmount" id="saleTotal" value="${r.totalAmount||''}" readonly></div>
        <div class="form-group"><label>Payment Status</label>
          <select name="paymentStatus">
            ${['Paid','Unpaid','Partial'].map(s => `<option value="${s}" ${s===r.paymentStatus?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${r.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Record'}</button>
        </div>
      </form>
    `);
    const calcTotal = () => {
      const q = parseFloat(document.getElementById('saleQty').value) || 0;
      const r2 = parseFloat(document.getElementById('saleRate').value) || 0;
      document.getElementById('saleTotal').value = (q * r2).toFixed(2);
    };
    document.getElementById('saleQty').addEventListener('input', calcTotal);
    document.getElementById('saleRate').addEventListener('input', calcTotal);
    document.getElementById('milkSalesForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.id) Store.update('cm_milk_sales', obj.id, obj);
      else Store.add('cm_milk_sales', obj);
      UI.closeModal(); UI.showToast('Sale recorded');
      MilkProduction.render();
    };
  },
  removeDaily(id) { if (confirm('Delete this milk record?')) { Store.remove('cm_milk_daily', id); UI.showToast('Deleted'); MilkProduction.render(); } },
  removeLactation(id) { if (confirm('Delete this lactation record?')) { Store.remove('cm_milk_lactation', id); UI.showToast('Deleted'); MilkProduction.render(); } },
  removeSale(id) { if (confirm('Delete this sale record?')) { Store.remove('cm_milk_sales', id); UI.showToast('Deleted'); MilkProduction.render(); } }
};

// ===== VACCINATION =====
const Vaccination = {
  render() {
    this.renderUpcoming();
    this.renderCompleted();
    this.renderAll();
  },
  renderUpcoming() {
    const data = Store.getAll('cm_vaccinations');
    const today = new Date().toISOString().split('T')[0];
    const upcoming = data.filter(v => v.status !== 'Completed');
    const grid = document.getElementById('vaccUpcomingGrid');
    if (upcoming.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>No upcoming vaccinations</p><button class="btn btn-primary" onclick="Vaccination.openForm()">+ Schedule Vaccination</button></div>';
      return;
    }
    grid.innerHTML = upcoming.sort((a, b) => (a.dueDate||'').localeCompare(b.dueDate||'')).map(v => {
      const daysUntil = v.dueDate ? UI.daysBetween(today, v.dueDate) : 999;
      const urgency = daysUntil < 0 ? 'overdue' : daysUntil <= 7 ? 'due-soon' : 'scheduled';
      const textClass = daysUntil < 0 ? 'text-danger' : daysUntil <= 7 ? 'text-warning' : 'text-info';
      const dueText = daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)} days` : daysUntil === 0 ? 'Due Today!' : `Due in ${daysUntil} days`;
      const target = v.targetType === 'Individual' ? UI.getCowName(v.cowId) : (v.facilityId ? UI.getFacilityName(v.facilityId) : v.groupName || 'Group');
      return `<div class="vacc-card ${urgency}">
        <h4>${target}</h4>
        <div class="vacc-vaccine">${v.vaccineName}</div>
        <div class="vacc-due ${textClass}">${dueText} (${v.dueDate ? UI.formatDate(v.dueDate) : 'No date'})</div>
        <div class="vacc-meta">Batch: ${v.batchNumber || '-'}</div>
        <div class="action-btns">
          <button class="btn btn-sm btn-primary" onclick="Vaccination.markComplete('${v.id}')">Mark Done</button>
          <button class="btn btn-sm btn-secondary" onclick="Vaccination.openForm('${v.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Vaccination.remove('${v.id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  },
  renderCompleted() {
    const data = Store.getAll('cm_vaccinations').filter(v => v.status === 'Completed');
    const tbody = document.querySelector('#vaccCompletedTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>No completed vaccinations</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = [...data].sort((a, b) => (b.dateGiven||'').localeCompare(a.dateGiven||'')).map(v => {
      const target = v.targetType === 'Individual' ? UI.getCowName(v.cowId) : (v.groupName || 'Group');
      return `<tr>
        <td>${UI.formatDate(v.dateGiven)}</td><td>${target}</td><td>${v.vaccineName}</td>
        <td>${v.batchNumber || '-'}</td><td>${v.administeredBy || '-'}</td>
        <td>${v.nextBoosterDate ? UI.formatDate(v.nextBoosterDate) : '-'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Vaccination.openForm('${v.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Vaccination.remove('${v.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  renderAll() {
    const data = Store.getAll('cm_vaccinations');
    const tbody = document.querySelector('#vaccAllTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>No vaccination records</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = [...data].sort((a, b) => (b.createdAt||'').localeCompare(a.createdAt||'')).map(v => {
      const target = v.targetType === 'Individual' ? UI.getCowName(v.cowId) : (v.groupName || 'Group');
      const statusClass = v.status === 'Completed' ? 'badge-success' : v.status === 'Overdue' ? 'badge-danger' : 'badge-pending';
      return `<tr>
        <td>${UI.formatDate(v.dueDate || v.dateGiven)}</td><td>${target}</td><td>${v.vaccineName}</td>
        <td>${v.batchNumber || '-'}</td><td><span class="badge ${statusClass}">${v.status}</span></td>
        <td>${v.administeredBy || '-'}</td>
        <td>${v.nextBoosterDate ? UI.formatDate(v.nextBoosterDate) : '-'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Vaccination.openForm('${v.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Vaccination.remove('${v.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  openForm(id) {
    const v = id ? Store.get('cm_vaccinations', id) : {};
    const cows = Store.getAll('cm_cows');
    const facilities = Store.getAll('cm_facilities');
    const vaccines = ['FMD (Foot & Mouth Disease)','Brucellosis','Black Quarter (BQ)','Hemorrhagic Septicemia (HS)',
      'Anthrax','Theileriosis','IBR','BVD','Rabies','Mastitis Vaccine','Other'];
    UI.openModal(id ? 'Edit Vaccination' : 'Schedule Vaccination', `
      <form id="vaccForm" class="form-grid">
        <div class="form-group"><label>Target Type</label>
          <select name="targetType" id="vaccTargetType" required>
            <option value="Individual" ${v.targetType!=='Group'?'selected':''}>Individual Cow</option>
            <option value="Group" ${v.targetType==='Group'?'selected':''}>Group/Facility</option>
          </select>
        </div>
        <div class="form-group" id="vaccCowGroup"><label>Cow</label>
          <select name="cowId" id="vaccCowSelect">
            <option value="">Select Cow...</option>
            ${cows.map(c => `<option value="${c.id}" ${c.id===v.cowId?'selected':''}>${c.name||c.earTag}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" id="vaccFacilityGroup" style="display:none"><label>Facility/Group</label>
          <select name="facilityId" id="vaccFacilitySelect">
            <option value="">Select...</option>
            ${facilities.map(f => `<option value="${f.id}" ${f.id===v.facilityId?'selected':''}>${f.shedName}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" id="vaccGroupNameDiv" style="display:none"><label>Group Name</label>
          <input name="groupName" value="${v.groupName||''}" placeholder="e.g. All Calves">
        </div>
        <div class="form-group"><label>Vaccine</label>
          <select name="vaccineName" required>
            <option value="">Select Vaccine...</option>
            ${vaccines.map(vn => `<option value="${vn}" ${vn===v.vaccineName?'selected':''}>${vn}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Batch Number</label><input name="batchNumber" value="${v.batchNumber||''}"></div>
        <div class="form-group"><label>Due Date</label><input type="date" name="dueDate" value="${v.dueDate||''}"></div>
        <div class="form-group"><label>Date Given</label><input type="date" name="dateGiven" value="${v.dateGiven||''}"></div>
        <div class="form-group"><label>Administered By</label><input name="administeredBy" value="${v.administeredBy||''}"></div>
        <div class="form-group"><label>Next Booster Date</label><input type="date" name="nextBoosterDate" value="${v.nextBoosterDate||''}"></div>
        <div class="form-group"><label>Status</label>
          <select name="status">
            ${['Scheduled','Completed','Overdue','Cancelled'].map(s => `<option value="${s}" ${s===v.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${v.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Schedule'}</button>
        </div>
      </form>
    `);
    const toggleTarget = () => {
      const isGroup = document.getElementById('vaccTargetType').value === 'Group';
      document.getElementById('vaccCowGroup').style.display = isGroup ? 'none' : '';
      document.getElementById('vaccFacilityGroup').style.display = isGroup ? '' : 'none';
      document.getElementById('vaccGroupNameDiv').style.display = isGroup ? '' : 'none';
    };
    document.getElementById('vaccTargetType').addEventListener('change', toggleTarget);
    if (v.targetType === 'Group') toggleTarget();
    document.getElementById('vaccForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.id) Store.update('cm_vaccinations', obj.id, obj);
      else Store.add('cm_vaccinations', obj);
      UI.closeModal(); UI.showToast('Vaccination saved');
      Vaccination.render();
    };
  },
  markComplete(id) {
    const v = Store.get('cm_vaccinations', id);
    if (!v) return;
    Store.update('cm_vaccinations', id, { status: 'Completed', dateGiven: new Date().toISOString().split('T')[0] });
    UI.showToast('Marked as completed');
    Vaccination.render();
  },
  remove(id) { if (confirm('Delete this vaccination record?')) { Store.remove('cm_vaccinations', id); UI.showToast('Deleted'); Vaccination.render(); } }
};

// ===== DISEASE TRACKING =====
const DiseaseTracking = {
  render() {
    const data = Store.getAll('cm_diseases');
    const tbody = document.querySelector('#diseaseTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>No disease records</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = [...data].sort((a, b) => (b.dateReported||'').localeCompare(a.dateReported||'')).map(d => {
      const statusBadge = d.status === 'Quarantined' ? 'badge-quarantine' : d.status === 'Recovered' ? 'badge-recovered' :
        d.status === 'Under Treatment' ? 'badge-treating' : 'badge-chronic';
      return `<tr>
        <td>${UI.formatDate(d.dateReported)}</td>
        <td>${UI.getCowName(d.cowId)}</td>
        <td><strong>${d.diseaseName}</strong></td>
        <td>${(d.symptoms||'').substring(0, 40)}${(d.symptoms||'').length > 40 ? '...' : ''}</td>
        <td>${d.diagnosis || '-'}</td>
        <td>${(d.treatment||'').substring(0, 30)}${(d.treatment||'').length > 30 ? '...' : ''}</td>
        <td>${d.quarantine === 'Yes' ? '<span class="badge badge-danger">Yes</span>' : 'No'}</td>
        <td><span class="badge ${statusBadge}">${d.status}</span></td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="DiseaseTracking.openForm('${d.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="DiseaseTracking.remove('${d.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  openForm(id) {
    const d = id ? Store.get('cm_diseases', id) : {};
    const cows = Store.getAll('cm_cows');
    const diseases = ['Foot and Mouth Disease','Mastitis','Brucellosis','Bovine Tuberculosis','Bloat',
      'Milk Fever','Ketosis','Pneumonia','Diarrhea','Lumpy Skin Disease','Black Quarter','Hemorrhagic Septicemia',
      'Anthrax','Theileriosis','Babesiosis','Pink Eye','Ring Worm','Other'];
    UI.openModal(id ? 'Edit Disease Record' : 'Report Disease', `
      <form id="diseaseForm" class="form-grid">
        <div class="form-group"><label>Date Reported</label><input type="date" name="dateReported" value="${d.dateReported || new Date().toISOString().split('T')[0]}" required></div>
        <div class="form-group"><label>Cow</label>
          <select name="cowId" required>
            <option value="">Select Cow...</option>
            ${cows.map(c => `<option value="${c.id}" ${c.id===d.cowId?'selected':''}>${c.name||c.earTag}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Disease</label>
          <select name="diseaseName" required>
            <option value="">Select Disease...</option>
            ${diseases.map(dn => `<option value="${dn}" ${dn===d.diseaseName?'selected':''}>${dn}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Quarantine</label>
          <select name="quarantine">
            <option value="No" ${d.quarantine!=='Yes'?'selected':''}>No</option>
            <option value="Yes" ${d.quarantine==='Yes'?'selected':''}>Yes</option>
          </select>
        </div>
        <div class="form-group full-width"><label>Symptoms</label><textarea name="symptoms" rows="2">${d.symptoms||''}</textarea></div>
        <div class="form-group full-width"><label>Diagnosis</label><input name="diagnosis" value="${d.diagnosis||''}"></div>
        <div class="form-group full-width"><label>Treatment</label><textarea name="treatment" rows="2">${d.treatment||''}</textarea></div>
        <div class="form-group"><label>Status</label>
          <select name="status">
            ${['Under Treatment','Quarantined','Recovered','Chronic','Deceased'].map(s => `<option value="${s}" ${s===d.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Recovery Date</label><input type="date" name="recoveryDate" value="${d.recoveryDate||''}"></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${d.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Report'}</button>
        </div>
      </form>
    `);
    document.getElementById('diseaseForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.id) Store.update('cm_diseases', obj.id, obj);
      else Store.add('cm_diseases', obj);
      UI.closeModal(); UI.showToast('Disease record saved');
      DiseaseTracking.render();
    };
  },
  remove(id) { if (confirm('Delete this disease record?')) { Store.remove('cm_diseases', id); UI.showToast('Deleted'); DiseaseTracking.render(); } }
};

// ===== DEWORMING =====
const Deworming = {
  render() {
    const data = Store.getAll('cm_deworming');
    const tbody = document.querySelector('#dewormingTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>No deworming records</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = [...data].sort((a, b) => (b.date||'').localeCompare(a.date||'')).map(d => {
      const target = d.targetType === 'Individual' ? UI.getCowName(d.cowId) : (d.groupName || 'Group');
      const nextDueClass = d.nextDueDate && d.nextDueDate < new Date().toISOString().split('T')[0] ? 'badge-danger' : 'badge-info';
      return `<tr>
        <td>${UI.formatDate(d.date)}</td>
        <td>${target}</td>
        <td>${d.drugName}</td>
        <td>${d.dosage} ${d.dosageUnit||''}</td>
        <td>${d.route || '-'}</td>
        <td>${d.nextDueDate ? `<span class="badge ${nextDueClass}">${UI.formatDate(d.nextDueDate)}</span>` : '-'}</td>
        <td>${d.administeredBy || '-'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="Deworming.openForm('${d.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Deworming.remove('${d.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  openForm(id) {
    const d = id ? Store.get('cm_deworming', id) : {};
    const cows = Store.getAll('cm_cows');
    const drugs = ['Albendazole','Fenbendazole','Ivermectin','Levamisole','Oxyclozanide',
      'Praziquantel','Triclabendazole','Morantel','Closantel','Other'];
    UI.openModal(id ? 'Edit Deworming' : 'Record Deworming', `
      <form id="dewormForm" class="form-grid">
        <div class="form-group"><label>Date</label><input type="date" name="date" value="${d.date || new Date().toISOString().split('T')[0]}" required></div>
        <div class="form-group"><label>Target</label>
          <select name="targetType" id="dewormTarget" required>
            <option value="Individual" ${d.targetType!=='Group'?'selected':''}>Individual</option>
            <option value="Group" ${d.targetType==='Group'?'selected':''}>Group</option>
          </select>
        </div>
        <div class="form-group" id="dewormCowDiv"><label>Cow</label>
          <select name="cowId">
            <option value="">Select Cow...</option>
            ${cows.map(c => `<option value="${c.id}" ${c.id===d.cowId?'selected':''}>${c.name||c.earTag}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" id="dewormGroupDiv" style="display:none"><label>Group Name</label>
          <input name="groupName" value="${d.groupName||''}">
        </div>
        <div class="form-group"><label>Drug Name</label>
          <select name="drugName" required>
            <option value="">Select Drug...</option>
            ${drugs.map(dn => `<option value="${dn}" ${dn===d.drugName?'selected':''}>${dn}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Dosage</label><input name="dosage" value="${d.dosage||''}" required placeholder="e.g. 10"></div>
        <div class="form-group"><label>Dosage Unit</label>
          <select name="dosageUnit">
            ${['ml','mg','mg/kg','tablet(s)'].map(u => `<option value="${u}" ${u===d.dosageUnit?'selected':''}>${u}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Route</label>
          <select name="route">
            ${['Oral','Injectable','Pour-on','Bolus'].map(r => `<option value="${r}" ${r===d.route?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Administered By</label><input name="administeredBy" value="${d.administeredBy||''}"></div>
        <div class="form-group"><label>Next Due Date</label><input type="date" name="nextDueDate" value="${d.nextDueDate||''}"></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${d.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Record'}</button>
        </div>
      </form>
    `);
    const toggleTarget = () => {
      const isGroup = document.getElementById('dewormTarget').value === 'Group';
      document.getElementById('dewormCowDiv').style.display = isGroup ? 'none' : '';
      document.getElementById('dewormGroupDiv').style.display = isGroup ? '' : 'none';
    };
    document.getElementById('dewormTarget').addEventListener('change', toggleTarget);
    if (d.targetType === 'Group') toggleTarget();
    document.getElementById('dewormForm').onsubmit = (e) => {
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target));
      if (obj.id) Store.update('cm_deworming', obj.id, obj);
      else Store.add('cm_deworming', obj);
      UI.closeModal(); UI.showToast('Deworming record saved');
      Deworming.render();
    };
  },
  remove(id) { if (confirm('Delete this deworming record?')) { Store.remove('cm_deworming', id); UI.showToast('Deleted'); Deworming.render(); } }
};

// ===== VET VISITS =====
const VetVisits = {
  render() {
    const data = Store.getAll('cm_vet_visits');
    const tbody = document.querySelector('#vetVisitsTable tbody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>No vet visit records</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = [...data].sort((a, b) => (b.visitDate||'').localeCompare(a.visitDate||'')).map(v => {
      const cowNames = (v.cowIds || []).map(id => UI.getCowName(id)).join(', ') || v.cowsSeen || '-';
      return `<tr>
        <td>${UI.formatDate(v.visitDate)}</td>
        <td>${v.vetName}</td>
        <td>${v.purpose}</td>
        <td>${cowNames.length > 50 ? cowNames.substring(0,47)+'...' : cowNames}</td>
        <td>${(v.prescriptions||'').substring(0, 40)}${(v.prescriptions||'').length > 40 ? '...' : ''}</td>
        <td>${v.followUpDate ? UI.formatDate(v.followUpDate) : '-'}</td>
        <td>Rs ${v.cost || '0'}</td>
        <td class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="VetVisits.openForm('${v.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="VetVisits.remove('${v.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  },
  openForm(id) {
    const v = id ? Store.get('cm_vet_visits', id) : {};
    const cows = Store.getAll('cm_cows');
    const purposes = ['Routine Checkup','Emergency','Vaccination','Surgery','Pregnancy Check',
      'Deworming','Hoof Trimming','Artificial Insemination','Follow-up','Other'];
    const selectedCows = v.cowIds || [];
    UI.openModal(id ? 'Edit Vet Visit' : 'Record Vet Visit', `
      <form id="vetVisitForm" class="form-grid">
        <div class="form-group"><label>Visit Date</label><input type="date" name="visitDate" value="${v.visitDate || new Date().toISOString().split('T')[0]}" required></div>
        <div class="form-group"><label>Vet Name</label><input name="vetName" value="${v.vetName||''}" required></div>
        <div class="form-group"><label>Purpose</label>
          <select name="purpose" required>
            <option value="">Select Purpose...</option>
            ${purposes.map(p => `<option value="${p}" ${p===v.purpose?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Cost (Rs)</label><input type="number" step="0.01" name="cost" value="${v.cost||''}"></div>
        <div class="form-group full-width"><label>Cows Seen (select multiple)</label>
          <select name="cowIds" id="vetCowMultiSelect" multiple size="4">
            ${cows.map(c => `<option value="${c.id}" ${selectedCows.includes(c.id)?'selected':''}>${c.name||c.earTag}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full-width"><label>Prescriptions</label><textarea name="prescriptions" rows="3">${v.prescriptions||''}</textarea></div>
        <div class="form-group"><label>Follow-up Date</label><input type="date" name="followUpDate" value="${v.followUpDate||''}"></div>
        <div class="form-group full-width"><label>Notes</label><textarea name="notes">${v.notes||''}</textarea></div>
        <input type="hidden" name="id" value="${id||''}">
        <div class="form-actions full-width">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Record'}</button>
        </div>
      </form>
    `);
    document.getElementById('vetVisitForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const obj = Object.fromEntries(fd);
      // Get multiple selected cows
      const multiSelect = document.getElementById('vetCowMultiSelect');
      obj.cowIds = Array.from(multiSelect.selectedOptions).map(o => o.value);
      if (obj.id) Store.update('cm_vet_visits', obj.id, obj);
      else Store.add('cm_vet_visits', obj);
      UI.closeModal(); UI.showToast('Vet visit recorded');
      VetVisits.render();
    };
  },
  remove(id) { if (confirm('Delete this vet visit record?')) { Store.remove('cm_vet_visits', id); UI.showToast('Deleted'); VetVisits.render(); } }
};

// ===== ALERTS & NOTIFICATIONS =====
const Alerts = {
  render() { this.refresh(); },
  refresh() {
    const today = new Date().toISOString().split('T')[0];
    const sections = [];

    // 1. Vaccination alerts
    const vaccinations = Store.getAll('cm_vaccinations').filter(v => v.status !== 'Completed' && v.status !== 'Cancelled');
    const overdueVacc = vaccinations.filter(v => v.dueDate && v.dueDate < today);
    const soonVacc = vaccinations.filter(v => v.dueDate && v.dueDate >= today && UI.daysBetween(today, v.dueDate) <= 7);
    if (overdueVacc.length || soonVacc.length) {
      let rows = '';
      overdueVacc.forEach(v => {
        const target = v.targetType === 'Individual' ? UI.getCowName(v.cowId) : (v.groupName || 'Group');
        rows += `<div class="alert-row"><span class="alert-icon">&#x1F489;</span><span class="alert-text"><strong>OVERDUE:</strong> ${v.vaccineName} for ${target}</span><span class="alert-date">${UI.formatDate(v.dueDate)}</span><button class="btn btn-sm btn-primary alert-action" onclick="Vaccination.markComplete('${v.id}'); Alerts.refresh();">Done</button></div>`;
      });
      soonVacc.forEach(v => {
        const target = v.targetType === 'Individual' ? UI.getCowName(v.cowId) : (v.groupName || 'Group');
        rows += `<div class="alert-row"><span class="alert-icon">&#x1F489;</span><span class="alert-text">${v.vaccineName} for ${target} - due in ${UI.daysBetween(today, v.dueDate)} days</span><span class="alert-date">${UI.formatDate(v.dueDate)}</span></div>`;
      });
      sections.push({ title: 'Vaccination Alerts', count: overdueVacc.length + soonVacc.length, countClass: overdueVacc.length ? '' : 'warn', rows });
    }

    // 2. Deworming alerts
    const dewormings = Store.getAll('cm_deworming').filter(d => d.nextDueDate);
    const overdueDeworm = dewormings.filter(d => d.nextDueDate < today);
    const soonDeworm = dewormings.filter(d => d.nextDueDate >= today && UI.daysBetween(today, d.nextDueDate) <= 7);
    if (overdueDeworm.length || soonDeworm.length) {
      let rows = '';
      overdueDeworm.forEach(d => {
        const target = d.targetType === 'Individual' ? UI.getCowName(d.cowId) : (d.groupName || 'Group');
        rows += `<div class="alert-row"><span class="alert-icon">&#x1F48A;</span><span class="alert-text"><strong>OVERDUE:</strong> Deworming (${d.drugName}) for ${target}</span><span class="alert-date">${UI.formatDate(d.nextDueDate)}</span></div>`;
      });
      soonDeworm.forEach(d => {
        const target = d.targetType === 'Individual' ? UI.getCowName(d.cowId) : (d.groupName || 'Group');
        rows += `<div class="alert-row"><span class="alert-icon">&#x1F48A;</span><span class="alert-text">Deworming (${d.drugName}) for ${target} - due in ${UI.daysBetween(today, d.nextDueDate)} days</span><span class="alert-date">${UI.formatDate(d.nextDueDate)}</span></div>`;
      });
      sections.push({ title: 'Deworming Alerts', count: overdueDeworm.length + soonDeworm.length, countClass: overdueDeworm.length ? '' : 'warn', rows });
    }

    // 3. Pregnancy / Calving alerts
    const pregnancies = Store.getAll('cm_pregnancy_tracking').filter(p => p.status === 'confirmed' || p.status === 'in-progress');
    const dueSoon = pregnancies.filter(p => {
      if (!p.expectedCalvingDate) return false;
      const days = UI.daysBetween(today, p.expectedCalvingDate);
      return days >= 0 && days <= 14;
    });
    if (dueSoon.length) {
      let rows = '';
      dueSoon.forEach(p => {
        const cow = Store.get('cm_cows', p.cowId);
        const cowName = cow ? (cow.name || cow.earTag) : 'Unknown';
        const days = UI.daysBetween(today, p.expectedCalvingDate);
        rows += `<div class="alert-row"><span class="alert-icon">&#x1F930;</span><span class="alert-text">${cowName} expected to calve in ${days} days</span><span class="alert-date">${UI.formatDate(p.expectedCalvingDate)}</span></div>`;
      });
      sections.push({ title: 'Upcoming Calvings', count: dueSoon.length, countClass: 'warn', rows });
    }

    // 4. Disease alerts - active cases
    const activeDiseases = Store.getAll('cm_diseases').filter(d => d.status === 'Under Treatment' || d.status === 'Quarantined');
    if (activeDiseases.length) {
      let rows = '';
      activeDiseases.forEach(d => {
        rows += `<div class="alert-row"><span class="alert-icon">&#x1F6A8;</span><span class="alert-text"><strong>${d.diseaseName}</strong> - ${UI.getCowName(d.cowId)} (${d.status})</span><span class="alert-date">${UI.formatDate(d.dateReported)}</span></div>`;
      });
      sections.push({ title: 'Active Disease Cases', count: activeDiseases.length, countClass: '', rows });
    }

    // 5. Fodder low stock
    const lowStock = Store.getAll('cm_fodder_inventory').filter(i => parseFloat(i.quantityInStock) <= parseFloat(i.reorderLevel));
    if (lowStock.length) {
      let rows = '';
      lowStock.forEach(i => {
        const ft = Store.get('cm_fodder_types', i.fodderTypeId);
        rows += `<div class="alert-row"><span class="alert-icon">&#x26A0;&#xFE0F;</span><span class="alert-text">${ft ? ft.name : 'Unknown feed'} - ${i.quantityInStock} remaining (reorder at ${i.reorderLevel})</span></div>`;
      });
      sections.push({ title: 'Low Fodder Stock', count: lowStock.length, countClass: 'warn', rows });
    }

    // 6. Vet follow-ups
    const vetVisits = Store.getAll('cm_vet_visits').filter(v => v.followUpDate);
    const overdueFollowups = vetVisits.filter(v => v.followUpDate <= today);
    const soonFollowups = vetVisits.filter(v => v.followUpDate > today && UI.daysBetween(today, v.followUpDate) <= 7);
    if (overdueFollowups.length || soonFollowups.length) {
      let rows = '';
      overdueFollowups.forEach(v => {
        rows += `<div class="alert-row"><span class="alert-icon">&#x23F0;</span><span class="alert-text"><strong>OVERDUE:</strong> Follow-up with ${v.vetName} (${v.purpose})</span><span class="alert-date">${UI.formatDate(v.followUpDate)}</span></div>`;
      });
      soonFollowups.forEach(v => {
        rows += `<div class="alert-row"><span class="alert-icon">&#x1F4C5;</span><span class="alert-text">Follow-up with ${v.vetName} (${v.purpose}) - in ${UI.daysBetween(today, v.followUpDate)} days</span><span class="alert-date">${UI.formatDate(v.followUpDate)}</span></div>`;
      });
      sections.push({ title: 'Vet Follow-ups', count: overdueFollowups.length + soonFollowups.length, countClass: overdueFollowups.length ? '' : 'info', rows });
    }

    // 7. Health record follow-ups
    const healthRecords = Store.getAll('cm_health_records').filter(h => h.nextFollowUp);
    const overdueHealth = healthRecords.filter(h => h.nextFollowUp <= today);
    if (overdueHealth.length) {
      let rows = '';
      overdueHealth.forEach(h => {
        rows += `<div class="alert-row"><span class="alert-icon">&#x2764;&#xFE0F;</span><span class="alert-text"><strong>OVERDUE:</strong> Health follow-up: ${(h.description||'').substring(0, 40)}</span><span class="alert-date">${UI.formatDate(h.nextFollowUp)}</span></div>`;
      });
      sections.push({ title: 'Health Follow-ups', count: overdueHealth.length, countClass: '', rows });
    }

    const container = document.getElementById('alertsDashboard');
    if (sections.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No alerts at this time. All clear!</p></div>';
      return;
    }
    container.innerHTML = sections.map(s => `
      <div class="alerts-section">
        <div class="alerts-section-header">
          <span>${s.title}</span>
          <span class="alert-count ${s.countClass}">${s.count}</span>
        </div>
        <div class="alerts-section-body">${s.rows}</div>
      </div>
    `).join('');
  }
};

// Attach weaning form submit handler via delegation
document.addEventListener('submit', (e) => {
  if (e.target.id === 'weaningForm') {
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = Object.fromEntries(fd);
    obj.birthWeight = parseFloat(obj.birthWeight) || 0;
    obj.weaningWeight = parseFloat(obj.weaningWeight) || 0;
    const calf = Store.get('cm_cows', obj.calfId);
    if (calf && calf.dob && obj.weaningDate) {
      obj.ageAtWeaningDays = UI.daysBetween(calf.dob, obj.weaningDate);
      obj.adg = obj.ageAtWeaningDays > 0 ? (obj.weaningWeight - obj.birthWeight) / obj.ageAtWeaningDays : 0;
      obj.adjustedWeight205 = obj.ageAtWeaningDays > 0 ? ((obj.weaningWeight - obj.birthWeight) / obj.ageAtWeaningDays) * 205 + obj.birthWeight : 0;
    }
    if (obj.id) Store.update('cm_weaning_records', obj.id, obj);
    else Store.add('cm_weaning_records', obj);
    UI.closeModal();
    UI.showToast('Weaning record saved');
    Weaning.render();
  }
});

// ===== APP INIT =====
document.addEventListener('DOMContentLoaded', () => {
  Cows.init();
  Router.init();
});
