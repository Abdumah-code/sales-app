// sales-order-app.jsx
// Updated: multiple entries for Växel & Körjournal, new services, reset after send, operator additions

const { useState } = React;

function SalesOrderApp() {
  // ─── SUBMITTED STATE ────────────────────────────────────
  const [submitted, setSubmitted] = useState(false);
  const [lastOrderName, setLastOrderName] = useState('');

  // ─── CORE STATE ─────────────────────────────────────────
  const [saljare, setSaljare] = useState('');
  const [trelloMeta, setTrelloMeta] = useState({ driftStart: '' });
  const [selectedService, setSelectedService] = useState('');

  const [baseInfo, setBaseInfo] = useState({
    foretag: '',
    organisationsnummer: '',
    kontakter: [{ namn: '', roll: '', telefon: '', epost: '' }]
  });

  const [ekonomiData, setEkonomiData] = useState({
    slutfaktura: '', fullmakt: '', ovrigt: ''
  });

  // ─── SERVICE STATE ──────────────────────────────────────
  const [telefoniData, setTelefoniData] = useState([
    { nuvarandeOperator: '', nastaOperator: '', antalAbonnemang: '', ovrigt: '' }
  ]);

  const [vaxelData, setVaxelData] = useState([
    { nuvarandeLosning: '', nastaLosning: '', huvudnummer: '', oppettider: '', ovrigt: '' }
  ]);

  const [korjournalData, setKorjournalData] = useState([
    { leverantorNu: '', leverantorSen: '', fordon: [{ regnr: '' }], ovrigt: '' }
  ]);

  const [hemsidaData, setHemsidaData] = useState([
    { nuvarandeLeverantor: '', nastaLeverantor: '', domain: '', hosting: '', cms: '', ovrigt: '' }
  ]);

  const [kassaData, setKassaData] = useState([
    { nuvarandeLeverantor: '', nastaLeverantor: '', antalKassor: '', kassaTyp: '', ovrigt: '' }
  ]);

  const [officeLicenserData, setOfficeLicenserData] = useState([
    { nuvarandeLeverantor: '', nastaLeverantor: '', antalLicenser: '', licensTyp: '', ovrigt: '' }
  ]);

  const [errors, setErrors] = useState({});

  // ─── CONSTANTS ──────────────────────────────────────────
  const saljareTrelloEmails = {
    Kevin: 'abbegazie+wd6jqwrwe4r1agvxxlwu@boards.trello.com',
    Kosrat: 'abbegazie+nunc3e4n6x2nbaabz5tg@boards.trello.com',
    Adam: 'abbegazie+bbnklionfggdmxwg9bga@boards.trello.com'
  };

  const allOperatorOptions = [
    '', 'Telia', 'Tele2', 'Telenor', '3 (Tre)', 'Hallon', 'Vimla', 'Comviq', 'Chilimobil', 'Fello','Lynes', 'Dstny', 'Telavox', 'Annat'
  ];

  // Expanded with Lynes, Dstny, Telavox
  const nastaOperatorOptions = [
    '', 'Telia', 'Tele2', 'Telenor', '3 (Tre)', 'Lynes', 'Dstny', 'Telavox'
  ];

  const services = [
    { key: 'telefoni',      label: 'Telefoni',        icon: '📞' },
    { key: 'vaxel',         label: 'Växel',           icon: '☎️' },
    { key: 'korjournal',    label: 'Körjournal',      icon: '🚗' },
    { key: 'hemsida',       label: 'Hemsida',         icon: '🌐' },
    { key: 'kassa',         label: 'Kassa',           icon: '🖥️' },
    { key: 'officelicenser',label: 'Office Licenser', icon: '📋' },
  ];

  // ─── RESET ──────────────────────────────────────────────
  const resetForm = () => {
    setSaljare('');
    setTrelloMeta({ driftStart: '' });
    setSelectedService('');
    setBaseInfo({ foretag: '', organisationsnummer: '', kontakter: [{ namn: '', roll: '', telefon: '', epost: '' }] });
    setEkonomiData({ slutfaktura: '', fullmakt: '', ovrigt: '' });
    setTelefoniData([{ nuvarandeOperator: '', nastaOperator: '', antalAbonnemang: '', ovrigt: '' }]);
    setVaxelData([{ nuvarandeLosning: '', nastaLosning: '', huvudnummer: '', oppettider: '', ovrigt: '' }]);
    setKorjournalData([{ leverantorNu: '', leverantorSen: '', fordon: [{ regnr: '' }], ovrigt: '' }]);
    setHemsidaData([{ nuvarandeLeverantor: '', nastaLeverantor: '', domain: '', hosting: '', cms: '', ovrigt: '' }]);
    setKassaData([{ nuvarandeLeverantor: '', nastaLeverantor: '', antalKassor: '', kassaTyp: '', ovrigt: '' }]);
    setOfficeLicenserData([{ nuvarandeLeverantor: '', nastaLeverantor: '', antalLicenser: '', licensTyp: '', ovrigt: '' }]);
    setErrors({});
    setSubmitted(false);
    setLastOrderName('');
  };

  // ─── DATE HELPERS ───────────────────────────────────────
  const formatServiceLabel = (key) => {
    const map = {
      telefoni: 'Telefoni', vaxel: 'Växel', korjournal: 'Körjournal',
      hemsida: 'Hemsida', kassa: 'Kassa', officelicenser: 'Office Licenser'
    };
    return map[key] || key;
  };

  const minusTwoMonths = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setMonth(dt.getMonth() - 2);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  const isDriftTooSoon = (yyyyMmDd) => {
    if (!yyyyMmDd) return false;
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    return new Date(yyyyMmDd) < twoMonthsFromNow;
  };

  const getDaysUntilDrift = (yyyyMmDd) => {
    if (!yyyyMmDd) return null;
    return Math.ceil((new Date(yyyyMmDd) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getSmartDueDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const driftDate = new Date(yyyyMmDd);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const idealStart = new Date(driftDate);
    idealStart.setMonth(idealStart.getMonth() - 2);
    idealStart.setHours(0, 0, 0, 0);
    const useDate = idealStart <= today
      ? (() => { const d = new Date(today); d.setDate(d.getDate() + 2); return d; })()
      : idealStart;
    return `${useDate.getFullYear()}-${String(useDate.getMonth() + 1).padStart(2, '0')}-${String(useDate.getDate()).padStart(2, '0')}`;
  };

  const getSmartDueDateWithTime = (d) => { const s = getSmartDueDate(d); return s ? `${s} 09:00` : ''; };

  // ─── VALIDATION ─────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!saljare)                    e.saljare         = 'Du måste välja ditt namn!';
    if (!selectedService)            e.selectedService = 'Välj en tjänst';
    if (!trelloMeta.driftStart)      e.driftStart      = 'Välj driftsättningsdatum';
    if (!baseInfo.foretag)           e.foretag         = 'Företagsnamn krävs';
    if (!baseInfo.organisationsnummer) e.organisationsnummer = 'Org.nummer krävs';
    baseInfo.kontakter.forEach((k, i) => {
      if (!k.namn)  e[`kontakt_${i}_namn`]  = 'Namn krävs';
      if (!k.epost) e[`kontakt_${i}_epost`] = 'E-post krävs';
    });
    if (selectedService === 'telefoni') {
      telefoniData.forEach((t, i) => {
        if (!t.nuvarandeOperator) e[`telefoni_${i}_nuvarande`] = 'Välj nuvarande operatör';
        if (!t.nastaOperator)     e[`telefoni_${i}_nasta`]     = 'Välj nästa operatör';
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── EMAIL BODY ─────────────────────────────────────────
  const generateEmailBody = () => {
    const serviceLabel = formatServiceLabel(selectedService);
    const startDatum   = minusTwoMonths(trelloMeta.driftStart);
    const smartDueDate = getSmartDueDate(trelloMeta.driftStart);

    let body = '';
    body += `📅 Trello Due Date: ${smartDueDate}\n`;
    body += `📌 PRIO\n_\n\n`;
    body += `📌 Status\n_\n\n`;
    body += `📅 Senaste åtgärd\n_\n\n`;
    body += `📌 Nästa steg\n_\n\n`;
    body += `🧾 Övrigt\n_\n\n`;
    body += `🗓 Driftsättning\n${trelloMeta.driftStart || '_'}\n`;
    body += `⏳ Starta (2 mån innan)\n${startDatum || '_'}\n\n`;

    if (isDriftTooSoon(trelloMeta.driftStart)) {
      const daysLeft = getDaysUntilDrift(trelloMeta.driftStart);
      body += `\n🚨 VARNING: AKUT ORDER - Drift om ${daysLeft} dagar!\n`;
      body += `Startdatum ligger i det förflutna. Börja arbeta OMEDELBART!\n`;
    }

    body += `\n#due ${getSmartDueDateWithTime(trelloMeta.driftStart)}\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `NY ORDER - ${baseInfo.foretag}\n`;
    body += `Säljare: ${saljare}\n`;
    body += `Tjänst: ${serviceLabel}\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `📋 KUND & BOLAGSUPPGIFTER\n\n`;
    body += `Företag: ${baseInfo.foretag}\n`;
    body += `Org.nummer: ${baseInfo.organisationsnummer}\n\n`;
    body += `👥 KONTAKTPERSONER\n\n`;
    baseInfo.kontakter.forEach((k, i) => {
      body += `Kontakt ${i + 1}:\n`;
      body += `  Namn: ${k.namn}\n`;
      body += `  Roll: ${k.roll}\n`;
      body += `  Telefon: ${k.telefon}\n`;
      body += `  E-post: ${k.epost}\n\n`;
    });
    body += `💰 EKONOMI & FULLMAKTER\n\n`;
    body += `1️⃣ SLUTFAKTURA:\n${ekonomiData.slutfaktura || '_'}\n\n`;
    body += `2️⃣ FULLMAKT:\n${ekonomiData.fullmakt || '_'}\n\n`;
    body += `3️⃣ ÖVRIGT (ekonomi):\n${ekonomiData.ovrigt || '_'}\n\n`;

    // ── TELEFONI
    if (selectedService === 'telefoni') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `📞 TELEFONI\n\n`;
      telefoniData.forEach((t, i) => {
        body += `Operatör ${i + 1}:\n`;
        body += `  Nuvarande: ${t.nuvarandeOperator || '_'}\n`;
        body += `  Nästa: ${t.nastaOperator || '_'}\n`;
        body += `  Antal abonnemang: ${t.antalAbonnemang || '_'}\n`;
        if (t.ovrigt) body += `  Övrigt: ${t.ovrigt}\n`;
        body += `\n`;
      });
    }

    // ── VÄXEL
    if (selectedService === 'vaxel') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `☎️ VÄXEL\n\n`;
      vaxelData.forEach((v, i) => {
        body += `Växel ${i + 1}:\n`;
        body += `  Nuvarande lösning/leverantör: ${v.nuvarandeLosning || '_'}\n`;
        body += `  Nästa lösning/leverantör: ${v.nastaLosning || '_'}\n`;
        body += `  Huvudnummer: ${v.huvudnummer || '_'}\n`;
        body += `  Öppettider: ${v.oppettider || '_'}\n`;
        if (v.ovrigt) body += `  Övrigt: ${v.ovrigt}\n`;
        body += `\n`;
      });
    }

    // ── KÖRJOURNAL
    if (selectedService === 'korjournal') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `🚗 KÖRJOURNAL\n\n`;
      korjournalData.forEach((k, i) => {
        body += `Körjournal ${i + 1}:\n`;
        body += `  Nuvarande leverantör: ${k.leverantorNu || '_'}\n`;
        body += `  Nästa leverantör: ${k.leverantorSen || '_'}\n`;
        body += `  Fordon: ${k.fordon.map(f => f.regnr || '_').join(', ')}\n`;
        if (k.ovrigt) body += `  Övrigt: ${k.ovrigt}\n`;
        body += `\n`;
      });
    }

    // ── HEMSIDA
    if (selectedService === 'hemsida') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `🌐 HEMSIDA\n\n`;
      hemsidaData.forEach((h, i) => {
        body += `Hemsida ${i + 1}:\n`;
        body += `  Nuvarande leverantör: ${h.nuvarandeLeverantor || '_'}\n`;
        body += `  Nästa leverantör: ${h.nastaLeverantor || '_'}\n`;
        body += `  Domän: ${h.domain || '_'}\n`;
        body += `  Hosting: ${h.hosting || '_'}\n`;
        body += `  CMS/Plattform: ${h.cms || '_'}\n`;
        if (h.ovrigt) body += `  Övrigt: ${h.ovrigt}\n`;
        body += `\n`;
      });
    }

    // ── KASSA
    if (selectedService === 'kassa') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `🖥️ KASSA\n\n`;
      kassaData.forEach((k, i) => {
        body += `Kassa ${i + 1}:\n`;
        body += `  Nuvarande leverantör: ${k.nuvarandeLeverantor || '_'}\n`;
        body += `  Nästa leverantör: ${k.nastaLeverantor || '_'}\n`;
        body += `  Antal kassor: ${k.antalKassor || '_'}\n`;
        body += `  Kassatyp: ${k.kassaTyp || '_'}\n`;
        if (k.ovrigt) body += `  Övrigt: ${k.ovrigt}\n`;
        body += `\n`;
      });
    }

    // ── OFFICE LICENSER
    if (selectedService === 'officelicenser') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `📋 OFFICE LICENSER\n\n`;
      officeLicenserData.forEach((o, i) => {
        body += `Licens ${i + 1}:\n`;
        body += `  Nuvarande leverantör: ${o.nuvarandeLeverantor || '_'}\n`;
        body += `  Nästa leverantör: ${o.nastaLeverantor || '_'}\n`;
        body += `  Antal licenser: ${o.antalLicenser || '_'}\n`;
        body += `  Licenstyp: ${o.licensTyp || '_'}\n`;
        if (o.ovrigt) body += `  Övrigt: ${o.ovrigt}\n`;
        body += `\n`;
      });
    }

    return body;
  };

  // ─── SEND ────────────────────────────────────────────────
  const handleSendOrder = () => {
    if (!validateForm()) {
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const serviceLabel = formatServiceLabel(selectedService);
    const isUrgent = isDriftTooSoon(trelloMeta.driftStart);
    const daysLeft = getDaysUntilDrift(trelloMeta.driftStart);
    const subject = isUrgent && daysLeft <= 30
      ? `🚨 AKUT (${daysLeft} dagar!) - ${baseInfo.foretag} - ${serviceLabel}`
      : `Ny order - ${baseInfo.foretag} - ${serviceLabel}`;

    const body = generateEmailBody();
    const trelloEmail = saljareTrelloEmails[saljare];
    const mailtoLink =
      `mailto:abbe@easypartner.se` +
      `?cc=${encodeURIComponent(trelloEmail)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    setLastOrderName(baseInfo.foretag);
    window.location.href = mailtoLink;
    setTimeout(() => setSubmitted(true), 600);
  };

  // ─── COMPLETION ──────────────────────────────────────────
  const completionPercentage = () => {
    let total = 6, filled = 0;
    if (saljare) filled++;
    if (trelloMeta.driftStart) filled++;
    if (baseInfo.foretag) filled++;
    if (baseInfo.organisationsnummer) filled++;
    if (baseInfo.kontakter[0]?.namn) filled++;
    if (baseInfo.kontakter[0]?.epost) filled++;
    if (selectedService) { total += 1; filled++; }
    if (selectedService === 'telefoni') {
      total += 2;
      if (telefoniData[0]?.nuvarandeOperator) filled++;
      if (telefoniData[0]?.nastaOperator) filled++;
    }
    return Math.round((filled / total) * 100);
  };

  // ─── SHARED CSS ─────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Mono:wght@400;700&display=swap');
    * { box-sizing: border-box; }

    .service-card {
      background: rgba(30, 41, 59, 0.6);
      border: 2px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      backdrop-filter: blur(10px);
    }
    .service-card:hover {
      border-color: rgba(85, 199, 219, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(85, 199, 219, 0.15);
    }
    .service-card.active {
      background: rgba(85, 199, 219, 0.1);
      border-color: #55c7db;
      box-shadow: 0 0 24px rgba(85, 199, 219, 0.2);
    }

    .form-section {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
      backdrop-filter: blur(10px);
      animation: slideIn 0.4s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.7; }
    }
    @keyframes successPop {
      0%   { opacity: 0; transform: scale(0.85) translateY(30px); }
      60%  { transform: scale(1.03) translateY(-4px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 2px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 15px;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .input-field:focus {
      outline: none;
      border-color: #55c7db;
      background: rgba(15, 23, 42, 0.8);
      box-shadow: 0 0 0 3px rgba(85, 199, 219, 0.1);
    }
    .input-field.error { border-color: #ef4444; }
    select.input-field { cursor: pointer; }
    textarea.input-field { min-height: 100px; resize: vertical; }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #55c7db 0%, #a39acb 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); }
    .btn-secondary {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 8px 10px;
    }
    .btn-secondary:hover { background: rgba(239, 68, 68, 0.2); }
    .btn-add {
      background: rgba(34, 197, 94, 0.1);
      color: #86efac;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .btn-add:hover { background: rgba(34, 197, 94, 0.2); }

    .progress-bar {
      height: 8px;
      background: rgba(148, 163, 184, 0.2);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #55c7db, #a39acb);
      border-radius: 999px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
    }

    .repeatable-item {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      position: relative;
    }
    .nested-item {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 10px;
      position: relative;
    }
    .error-text { color: #fca5a5; font-size: 13px; margin-top: 4px; }

    .success-screen {
      animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(64%) sepia(36%) saturate(1021%) hue-rotate(146deg) brightness(93%) contrast(87%);
      cursor: pointer;
      width: 20px; height: 20px;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      filter: invert(64%) sepia(36%) saturate(1021%) hue-rotate(146deg) brightness(110%) contrast(87%);
    }
  `;

  // ─── SECTION HEADER ──────────────────────────────────────
  const SectionIcon = ({ label }) => (
    <span style={{
      background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
      width: '32px', height: '32px', borderRadius: '8px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '16px', fontWeight: '700', color: 'white',
      fontFamily: 'Space Mono, monospace', flexShrink: 0
    }}>{label}</span>
  );

  // ─── SUCCESS SCREEN ──────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: '"DM Sans", -apple-system, sans-serif',
        color: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <style>{css}</style>
        <div className="success-screen" style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(85, 199, 219, 0.3)',
          borderRadius: '24px',
          padding: '64px 48px',
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(85, 199, 219, 0.1)'
        }}>
          <div style={{ fontSize: '72px', marginBottom: '24px', lineHeight: 1 }}>✅</div>
          <h1 style={{
            fontSize: '32px', fontWeight: '700', marginBottom: '12px',
            background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: 'Space Mono, monospace'
          }}>
            Order skickad!
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '8px' }}>
            {lastOrderName && <><span style={{ color: '#e2e8f0', fontWeight: '600' }}>{lastOrderName}</span> är nu skickad till leverans.</>}
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px' }}>
            Trello-kortet skapas automatiskt via e-post.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={resetForm}
              style={{ fontSize: '16px', padding: '16px 40px', width: '100%', justifyContent: 'center' }}
            >
              🆕 Skapa ny order
            </button>
          </div>

          <div style={{
            marginTop: '32px', padding: '16px',
            background: 'rgba(251, 191, 36, 0.08)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '8px',
            fontSize: '13px', color: '#fbbf24'
          }}>
            ⚠️ Kom ihåg: Ta bort din e-signatur i mejlet innan du skickade!
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ─────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
      color: '#e2e8f0'
    }}>
      <style>{css}</style>

      {/* ── Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '24px 0',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontFamily: 'Space Mono, monospace'
              }}>
                EasyPartner Order
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                Intern orderhantering för leverans
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="progress-bar" style={{ width: '200px' }}>
                <div className="progress-fill" style={{ width: `${completionPercentage()}%` }} />
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>
                {completionPercentage()}% komplett
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ── Säljare */}
        <div className="form-section">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SectionIcon label="👤" />
            Vem skapar denna order?
          </h2>
          <select
            className={`input-field ${errors.saljare ? 'error' : ''}`}
            style={{ maxWidth: '400px', fontSize: '16px' }}
            value={saljare}
            onChange={(e) => setSaljare(e.target.value)}
          >
            <option value="">-- Välj ditt namn --</option>
            <option value="Adam">Adam</option>
            <option value="Kosrat">Kosrat</option>
            <option value="Kevin">Kevin</option>
          </select>
          {errors.saljare && <div className="error-text">{errors.saljare}</div>}
        </div>

        {/* ── Planering */}
        <div className="form-section">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SectionIcon label="⚡" />
            Planering
          </h2>
          <div style={{ maxWidth: '400px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
              Driftsättningsdatum *
            </label>
            <input
              type="date"
              className={`input-field ${errors.driftStart ? 'error' : ''}`}
              value={trelloMeta.driftStart}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setTrelloMeta({ ...trelloMeta, driftStart: e.target.value })}
            />
            {errors.driftStart && <div className="error-text">{errors.driftStart}</div>}
            {trelloMeta.driftStart && (
              <>
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#94a3b8' }}>
                  Ideal start: <span style={{ color: '#86efac' }}>{minusTwoMonths(trelloMeta.driftStart)}</span>
                </div>
                {isDriftTooSoon(trelloMeta.driftStart) ? (
                  <div style={{
                    marginTop: '12px', padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '2px solid #ef4444', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    animation: 'pulse 2s infinite'
                  }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#fca5a5', marginBottom: '4px' }}>
                        VARNING: Kort tid till drift!
                      </div>
                      <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                        Driftsättning är om {getDaysUntilDrift(trelloMeta.driftStart)} dagar.
                        Idealisk starttid har passerats. Fortsätt om kunden godkänt.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#86efac' }}>
                    ✅ Trello due date: {getSmartDueDate(trelloMeta.driftStart)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Tjänst */}
        <div className="form-section">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SectionIcon label="1" />
            Välj tjänst (en i taget)
          </h2>
          {errors.selectedService && <div className="error-text" style={{ marginBottom: '12px' }}>{errors.selectedService}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {services.map(s => (
              <div
                key={s.key}
                className={`service-card ${selectedService === s.key ? 'active' : ''}`}
                onClick={() => setSelectedService(s.key)}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{s.label}</div>
                {selectedService === s.key && (
                  <div style={{ marginTop: '10px', color: '#55c7db', fontSize: '13px' }}>✅ Vald</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedService && (
          <>
            {/* ── Kund & Bolag */}
            <div className="form-section">
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SectionIcon label="2" />
                Kund- & Bolagsuppgifter
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Företagsnamn *</label>
                  <input className={`input-field ${errors.foretag ? 'error' : ''}`} value={baseInfo.foretag}
                    onChange={(e) => setBaseInfo({ ...baseInfo, foretag: e.target.value })} placeholder="AB Företag" />
                  {errors.foretag && <div className="error-text">{errors.foretag}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Organisationsnummer *</label>
                  <input className={`input-field ${errors.organisationsnummer ? 'error' : ''}`} value={baseInfo.organisationsnummer}
                    onChange={(e) => setBaseInfo({ ...baseInfo, organisationsnummer: e.target.value })} placeholder="556XXX-XXXX" />
                  {errors.organisationsnummer && <div className="error-text">{errors.organisationsnummer}</div>}
                </div>
              </div>
            </div>

            {/* ── Kontaktpersoner */}
            <div className="form-section">
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <SectionIcon label="3" />
                  Kontaktpersoner
                </span>
                <button className="btn btn-add" onClick={() =>
                  setBaseInfo({ ...baseInfo, kontakter: [...baseInfo.kontakter, { namn: '', roll: '', telefon: '', epost: '' }] })
                }>+ Lägg till</button>
              </h2>
              {baseInfo.kontakter.map((k, idx) => (
                <div key={idx} className="repeatable-item">
                  {baseInfo.kontakter.length > 1 && (
                    <button className="btn btn-secondary" style={{ position: 'absolute', top: '12px', right: '12px' }}
                      onClick={() => setBaseInfo({ ...baseInfo, kontakter: baseInfo.kontakter.filter((_, i) => i !== idx) })}>×</button>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Namn *</label>
                      <input className={`input-field ${errors[`kontakt_${idx}_namn`] ? 'error' : ''}`} value={k.namn}
                        onChange={(e) => { const c = [...baseInfo.kontakter]; c[idx] = { ...c[idx], namn: e.target.value }; setBaseInfo({ ...baseInfo, kontakter: c }); }}
                        placeholder="Anna Andersson" />
                      {errors[`kontakt_${idx}_namn`] && <div className="error-text">{errors[`kontakt_${idx}_namn`]}</div>}
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Roll/Titel</label>
                      <input className="input-field" value={k.roll}
                        onChange={(e) => { const c = [...baseInfo.kontakter]; c[idx] = { ...c[idx], roll: e.target.value }; setBaseInfo({ ...baseInfo, kontakter: c }); }}
                        placeholder="VD" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Telefon</label>
                      <input className="input-field" value={k.telefon}
                        onChange={(e) => { const c = [...baseInfo.kontakter]; c[idx] = { ...c[idx], telefon: e.target.value }; setBaseInfo({ ...baseInfo, kontakter: c }); }}
                        placeholder="070-123 45 67" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>E-post *</label>
                      <input type="email" className={`input-field ${errors[`kontakt_${idx}_epost`] ? 'error' : ''}`} value={k.epost}
                        onChange={(e) => { const c = [...baseInfo.kontakter]; c[idx] = { ...c[idx], epost: e.target.value }; setBaseInfo({ ...baseInfo, kontakter: c }); }}
                        placeholder="anna@foretag.se" />
                      {errors[`kontakt_${idx}_epost`] && <div className="error-text">{errors[`kontakt_${idx}_epost`]}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Ekonomi */}
            <div className="form-section">
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SectionIcon label="4" />
                Ekonomi & Fullmakter
              </h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>1. Slutfaktura (hårdvara & abonnemang)</label>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Ex: "Slutlösen 17187 kr efter 6 mån, hårdvara hos Test Testsson Telenor privat..."</div>
                  <textarea className="input-field" value={ekonomiData.slutfaktura}
                    onChange={(e) => setEkonomiData({ ...ekonomiData, slutfaktura: e.target.value })}
                    placeholder="Beskriv slutfaktura, bindningstid, hårdvara..." />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>2. Fullmakt (vilka behöver vi fullmakt från?)</label>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Ex: "1. Telenor privat - Helin Shekhan, 2. Telenor företag - Test Testsson..."</div>
                  <textarea className="input-field" value={ekonomiData.fullmakt}
                    onChange={(e) => setEkonomiData({ ...ekonomiData, fullmakt: e.target.value })}
                    placeholder="Lista vilka fullmakter vi behöver (operatör + namn)..." />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>3. Övrigt (ekonomi)</label>
                  <textarea className="input-field" style={{ minHeight: '80px' }} value={ekonomiData.ovrigt}
                    onChange={(e) => setEkonomiData({ ...ekonomiData, ovrigt: e.target.value })}
                    placeholder="Annan ekonomisk info..." />
                </div>
              </div>
            </div>

            {/* ── TELEFONI ────────────────────────────── */}
            {selectedService === 'telefoni' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>📞</span> Telefoni
                  </span>
                  <button className="btn btn-add"
                    onClick={() => setTelefoniData([...telefoniData, { nuvarandeOperator: '', nastaOperator: '', antalAbonnemang: '', ovrigt: '' }])}>
                    + Lägg till operatör
                  </button>
                </h2>
                {telefoniData.map((item, idx) => (
                  <div key={idx} className="repeatable-item">
                    {telefoniData.length > 1 && (
                      <button className="btn btn-secondary" style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => setTelefoniData(telefoniData.filter((_, i) => i !== idx))}>×</button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nuvarande operatör *</label>
                        <select className={`input-field ${errors[`telefoni_${idx}_nuvarande`] ? 'error' : ''}`} value={item.nuvarandeOperator}
                          onChange={(e) => { const u = [...telefoniData]; u[idx] = { ...u[idx], nuvarandeOperator: e.target.value }; setTelefoniData(u); }}>
                          {allOperatorOptions.map(op => <option key={op} value={op}>{op || 'Välj…'}</option>)}
                        </select>
                        {errors[`telefoni_${idx}_nuvarande`] && <div className="error-text">{errors[`telefoni_${idx}_nuvarande`]}</div>}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nästa operatör *</label>
                        <select className={`input-field ${errors[`telefoni_${idx}_nasta`] ? 'error' : ''}`} value={item.nastaOperator}
                          onChange={(e) => { const u = [...telefoniData]; u[idx] = { ...u[idx], nastaOperator: e.target.value }; setTelefoniData(u); }}>
                          {nastaOperatorOptions.map(op => <option key={op} value={op}>{op || 'Välj…'}</option>)}
                        </select>
                        {errors[`telefoni_${idx}_nasta`] && <div className="error-text">{errors[`telefoni_${idx}_nasta`]}</div>}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Antal abonnemang</label>
                        <input type="number" className="input-field" value={item.antalAbonnemang}
                          onChange={(e) => { const u = [...telefoniData]; u[idx] = { ...u[idx], antalAbonnemang: e.target.value }; setTelefoniData(u); }}
                          placeholder="Ex: 15" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Övrigt (nummer, info, etc.)</label>
                        <textarea className="input-field" style={{ minHeight: '80px' }} value={item.ovrigt}
                          onChange={(e) => { const u = [...telefoniData]; u[idx] = { ...u[idx], ovrigt: e.target.value }; setTelefoniData(u); }}
                          placeholder="Ex: specifika nummer, extra info..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── VÄXEL ───────────────────────────────── */}
            {selectedService === 'vaxel' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>☎️</span> Växel
                  </span>
                  <button className="btn btn-add"
                    onClick={() => setVaxelData([...vaxelData, { nuvarandeLosning: '', nastaLosning: '', huvudnummer: '', oppettider: '', ovrigt: '' }])}>
                    + Lägg till växel
                  </button>
                </h2>
                {vaxelData.map((item, idx) => (
                  <div key={idx} className="repeatable-item">
                    {vaxelData.length > 1 && (
                      <button className="btn btn-secondary" style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => setVaxelData(vaxelData.filter((_, i) => i !== idx))}>×</button>
                    )}
                    {vaxelData.length > 1 && (
                      <div style={{ fontSize: '12px', color: '#55c7db', marginBottom: '12px', fontWeight: '600', fontFamily: 'Space Mono, monospace' }}>
                        VÄXEL {idx + 1}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nuvarande lösning/leverantör</label>
                        <input className="input-field" value={item.nuvarandeLosning}
                          onChange={(e) => { const u = [...vaxelData]; u[idx] = { ...u[idx], nuvarandeLosning: e.target.value }; setVaxelData(u); }}
                          placeholder="Ex: Telia Touchpoint" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nästa lösning/leverantör</label>
                        <input className="input-field" value={item.nastaLosning}
                          onChange={(e) => { const u = [...vaxelData]; u[idx] = { ...u[idx], nastaLosning: e.target.value }; setVaxelData(u); }}
                          placeholder="Ex: Lynes / Dstny / Telavox" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Huvudnummer</label>
                        <input className="input-field" value={item.huvudnummer}
                          onChange={(e) => { const u = [...vaxelData]; u[idx] = { ...u[idx], huvudnummer: e.target.value }; setVaxelData(u); }}
                          placeholder="08-xxx xx xx" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Öppettider</label>
                        <input className="input-field" value={item.oppettider}
                          onChange={(e) => { const u = [...vaxelData]; u[idx] = { ...u[idx], oppettider: e.target.value }; setVaxelData(u); }}
                          placeholder="Ex: 08–17" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Övrigt (menyval, kö, hänvisning, etc.)</label>
                        <textarea className="input-field" value={item.ovrigt}
                          onChange={(e) => { const u = [...vaxelData]; u[idx] = { ...u[idx], ovrigt: e.target.value }; setVaxelData(u); }}
                          placeholder="Ex: menyval, kö, hänvisning, specialregler..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── KÖRJOURNAL ──────────────────────────── */}
            {selectedService === 'korjournal' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🚗</span> Körjournal
                  </span>
                  <button className="btn btn-add"
                    onClick={() => setKorjournalData([...korjournalData, { leverantorNu: '', leverantorSen: '', fordon: [{ regnr: '' }], ovrigt: '' }])}>
                    + Lägg till körjournal
                  </button>
                </h2>
                {korjournalData.map((item, idx) => (
                  <div key={idx} className="repeatable-item">
                    {korjournalData.length > 1 && (
                      <button className="btn btn-secondary" style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => setKorjournalData(korjournalData.filter((_, i) => i !== idx))}>×</button>
                    )}
                    {korjournalData.length > 1 && (
                      <div style={{ fontSize: '12px', color: '#55c7db', marginBottom: '12px', fontWeight: '600', fontFamily: 'Space Mono, monospace' }}>
                        KÖRJOURNAL {idx + 1}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nuvarande leverantör</label>
                        <input className="input-field" value={item.leverantorNu}
                          onChange={(e) => { const u = [...korjournalData]; u[idx] = { ...u[idx], leverantorNu: e.target.value }; setKorjournalData(u); }}
                          placeholder="Ex: Fleat / annan" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nästa leverantör</label>
                        <input className="input-field" value={item.leverantorSen}
                          onChange={(e) => { const u = [...korjournalData]; u[idx] = { ...u[idx], leverantorSen: e.target.value }; setKorjournalData(u); }}
                          placeholder="Ex: ny leverantör" />
                      </div>
                    </div>

                    {/* Fordon sub-list */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Fordon (regnr)</label>
                        <button className="btn btn-add" style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => { const u = [...korjournalData]; u[idx] = { ...u[idx], fordon: [...u[idx].fordon, { regnr: '' }] }; setKorjournalData(u); }}>
                          + Fordon
                        </button>
                      </div>
                      {item.fordon.map((f, fIdx) => (
                        <div key={fIdx} className="nested-item">
                          {item.fordon.length > 1 && (
                            <button className="btn btn-secondary" style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', fontSize: '13px' }}
                              onClick={() => { const u = [...korjournalData]; u[idx] = { ...u[idx], fordon: u[idx].fordon.filter((_, fi) => fi !== fIdx) }; setKorjournalData(u); }}>×</button>
                          )}
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>
                            Fordon {fIdx + 1}
                          </label>
                          <input className="input-field" style={{ maxWidth: '200px' }} value={f.regnr}
                            onChange={(e) => { const u = [...korjournalData]; u[idx].fordon[fIdx] = { regnr: e.target.value }; setKorjournalData([...u]); }}
                            placeholder="ABC123" />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Övrigt (körjournal)</label>
                      <textarea className="input-field" value={item.ovrigt}
                        onChange={(e) => { const u = [...korjournalData]; u[idx] = { ...u[idx], ovrigt: e.target.value }; setKorjournalData(u); }}
                        placeholder="Ex: förare, policy, behov, integration..." />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── HEMSIDA ─────────────────────────────── */}
            {selectedService === 'hemsida' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🌐</span> Hemsida
                  </span>
                  <button className="btn btn-add"
                    onClick={() => setHemsidaData([...hemsidaData, { nuvarandeLeverantor: '', nastaLeverantor: '', domain: '', hosting: '', cms: '', ovrigt: '' }])}>
                    + Lägg till hemsida
                  </button>
                </h2>
                {hemsidaData.map((item, idx) => (
                  <div key={idx} className="repeatable-item">
                    {hemsidaData.length > 1 && (
                      <button className="btn btn-secondary" style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => setHemsidaData(hemsidaData.filter((_, i) => i !== idx))}>×</button>
                    )}
                    {hemsidaData.length > 1 && (
                      <div style={{ fontSize: '12px', color: '#55c7db', marginBottom: '12px', fontWeight: '600', fontFamily: 'Space Mono, monospace' }}>
                        HEMSIDA {idx + 1}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nuvarande leverantör</label>
                        <input className="input-field" value={item.nuvarandeLeverantor}
                          onChange={(e) => { const u = [...hemsidaData]; u[idx] = { ...u[idx], nuvarandeLeverantor: e.target.value }; setHemsidaData(u); }}
                          placeholder="Ex: Wix / One.com / annan" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nästa leverantör</label>
                        <input className="input-field" value={item.nastaLeverantor}
                          onChange={(e) => { const u = [...hemsidaData]; u[idx] = { ...u[idx], nastaLeverantor: e.target.value }; setHemsidaData(u); }}
                          placeholder="Ex: ny leverantör" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Domännamn</label>
                        <input className="input-field" value={item.domain}
                          onChange={(e) => { const u = [...hemsidaData]; u[idx] = { ...u[idx], domain: e.target.value }; setHemsidaData(u); }}
                          placeholder="Ex: foretaget.se" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Hosting</label>
                        <input className="input-field" value={item.hosting}
                          onChange={(e) => { const u = [...hemsidaData]; u[idx] = { ...u[idx], hosting: e.target.value }; setHemsidaData(u); }}
                          placeholder="Ex: Loopia / Binero / annan" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>CMS / Plattform</label>
                        <input className="input-field" value={item.cms}
                          onChange={(e) => { const u = [...hemsidaData]; u[idx] = { ...u[idx], cms: e.target.value }; setHemsidaData(u); }}
                          placeholder="Ex: WordPress / Shopify / annan" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Övrigt (hemsida)</label>
                        <textarea className="input-field" value={item.ovrigt}
                          onChange={(e) => { const u = [...hemsidaData]; u[idx] = { ...u[idx], ovrigt: e.target.value }; setHemsidaData(u); }}
                          placeholder="Ex: design, integrationer, e-handel, SEO..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── KASSA ───────────────────────────────── */}
            {selectedService === 'kassa' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🖥️</span> Kassa
                  </span>
                  <button className="btn btn-add"
                    onClick={() => setKassaData([...kassaData, { nuvarandeLeverantor: '', nastaLeverantor: '', antalKassor: '', kassaTyp: '', ovrigt: '' }])}>
                    + Lägg till kassa
                  </button>
                </h2>
                {kassaData.map((item, idx) => (
                  <div key={idx} className="repeatable-item">
                    {kassaData.length > 1 && (
                      <button className="btn btn-secondary" style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => setKassaData(kassaData.filter((_, i) => i !== idx))}>×</button>
                    )}
                    {kassaData.length > 1 && (
                      <div style={{ fontSize: '12px', color: '#55c7db', marginBottom: '12px', fontWeight: '600', fontFamily: 'Space Mono, monospace' }}>
                        KASSA {idx + 1}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nuvarande leverantör</label>
                        <input className="input-field" value={item.nuvarandeLeverantor}
                          onChange={(e) => { const u = [...kassaData]; u[idx] = { ...u[idx], nuvarandeLeverantor: e.target.value }; setKassaData(u); }}
                          placeholder="Ex: Zettle / Klarna / annan" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nästa leverantör</label>
                        <input className="input-field" value={item.nastaLeverantor}
                          onChange={(e) => { const u = [...kassaData]; u[idx] = { ...u[idx], nastaLeverantor: e.target.value }; setKassaData(u); }}
                          placeholder="Ex: ny leverantör" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Antal kassor</label>
                        <input type="number" className="input-field" value={item.antalKassor}
                          onChange={(e) => { const u = [...kassaData]; u[idx] = { ...u[idx], antalKassor: e.target.value }; setKassaData(u); }}
                          placeholder="Ex: 3" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Kassatyp</label>
                        <input className="input-field" value={item.kassaTyp}
                          onChange={(e) => { const u = [...kassaData]; u[idx] = { ...u[idx], kassaTyp: e.target.value }; setKassaData(u); }}
                          placeholder="Ex: kortläsare, tablet, fullständig kassalösning" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Övrigt (kassa)</label>
                        <textarea className="input-field" value={item.ovrigt}
                          onChange={(e) => { const u = [...kassaData]; u[idx] = { ...u[idx], ovrigt: e.target.value }; setKassaData(u); }}
                          placeholder="Ex: integrationer, hårdvara, betalterminal, kvitton..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── OFFICE LICENSER ─────────────────────── */}
            {selectedService === 'officelicenser' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>📋</span> Office Licenser
                  </span>
                  <button className="btn btn-add"
                    onClick={() => setOfficeLicenserData([...officeLicenserData, { nuvarandeLeverantor: '', nastaLeverantor: '', antalLicenser: '', licensTyp: '', ovrigt: '' }])}>
                    + Lägg till licenspost
                  </button>
                </h2>
                {officeLicenserData.map((item, idx) => (
                  <div key={idx} className="repeatable-item">
                    {officeLicenserData.length > 1 && (
                      <button className="btn btn-secondary" style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => setOfficeLicenserData(officeLicenserData.filter((_, i) => i !== idx))}>×</button>
                    )}
                    {officeLicenserData.length > 1 && (
                      <div style={{ fontSize: '12px', color: '#55c7db', marginBottom: '12px', fontWeight: '600', fontFamily: 'Space Mono, monospace' }}>
                        LICENS {idx + 1}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nuvarande leverantör</label>
                        <input className="input-field" value={item.nuvarandeLeverantor}
                          onChange={(e) => { const u = [...officeLicenserData]; u[idx] = { ...u[idx], nuvarandeLeverantor: e.target.value }; setOfficeLicenserData(u); }}
                          placeholder="Ex: Microsoft direkt / annan" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nästa leverantör</label>
                        <input className="input-field" value={item.nastaLeverantor}
                          onChange={(e) => { const u = [...officeLicenserData]; u[idx] = { ...u[idx], nastaLeverantor: e.target.value }; setOfficeLicenserData(u); }}
                          placeholder="Ex: via EasyPartner / CSP" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Antal licenser</label>
                        <input type="number" className="input-field" value={item.antalLicenser}
                          onChange={(e) => { const u = [...officeLicenserData]; u[idx] = { ...u[idx], antalLicenser: e.target.value }; setOfficeLicenserData(u); }}
                          placeholder="Ex: 20" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Licenstyp</label>
                        <input className="input-field" value={item.licensTyp}
                          onChange={(e) => { const u = [...officeLicenserData]; u[idx] = { ...u[idx], licensTyp: e.target.value }; setOfficeLicenserData(u); }}
                          placeholder="Ex: Microsoft 365 Business Basic/Standard/Premium" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Övrigt (licenser)</label>
                        <textarea className="input-field" value={item.ovrigt}
                          onChange={(e) => { const u = [...officeLicenserData]; u[idx] = { ...u[idx], ovrigt: e.target.value }; setOfficeLicenserData(u); }}
                          placeholder="Ex: Teams, Exchange, SharePoint, migrering, befintliga konton..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Send Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                  Redo att skicka order?
                </div>
                <div style={{ fontSize: '13px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠️ Ta bort din e-signatur i mejlet innan du skickar!
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSendOrder}
                style={{ fontSize: '16px', padding: '16px 32px' }}
              >
                📨 Skicka till leverans
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SalesOrderApp />);