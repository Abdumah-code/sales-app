// sales-order-app.jsx
// Körs direkt i browsern via Babel + React CDN (ingen bundler, inga imports)

const { useState } = React;

function SalesOrderApp() {
  // SÄLJARE - VÄLJ FÖRST!
  const [saljare, setSaljare] = useState('');

  // Trello “snabba frågor”
  const [trelloMeta, setTrelloMeta] = useState({
    prio: '',
    status: '',
    driftStart: '', // YYYY-MM-DD
    nastaSteg: '',
    ovrigt: ''
  });

  // Trello Email-to-Board adresser per säljare
  const saljareTrelloEmails = {
    Kevin: 'abbegazie+wd6jqwrwe4r1agvxxlwu@boards.trello.com',
    Kosrat: 'abbegazie+nunc3e4n6x2nbaabz5tg@boards.trello.com',
    Adam: 'abbegazie+bbnklionfggdmxwg9bga@boards.trello.com'
  };

  // Service selection (EN tjänst i taget)
  const [selectedService, setSelectedService] = useState('');

  // Base info (alltid)
  const [baseInfo, setBaseInfo] = useState({
    foretag: '',
    organisationsnummer: '',
    kontakter: [{ namn: '', roll: '', telefon: '', epost: '' }]
  });

  // Gemensam fri text för bindning/slutfaktura (istället för faktura-sektion)
  const [ekonomiData, setEkonomiData] = useState({
    slutfaktura: '',
    fullmakt: '',
    ovrigt: ''
  });
  // Service-specific data

  // TELEFONI: Lista av operatörer (repeatable)
  const [telefoniData, setTelefoniData] = useState([
    {
      nuvarandeOperator: '',
      nastaOperator: '',
      antalAbonnemang: '',
      ovrigt: ''
    }
  ]);

  // VÄXEL: minimalt + fri text
  const [vaxelData, setVaxelData] = useState({
    nuvarandeLosning: '',
    nastaLosning: '',
    huvudnummer: '',
    oppettider: '',
    ovrigt: ''
  });

  // KÖRJOURNAL: minimalt + lista fordon + fri text
  const [korjournalData, setKorjournalData] = useState({
    leverantorNu: '',
    leverantorSen: '',
    fordon: [{ regnr: '' }],
    ovrigt: ''
  });


  // Validation
  const [errors, setErrors] = useState({});

  const formatServiceLabel = (key) => {
    const map = {
      telefoni: 'Telefoni',
      vaxel: 'Växel',
      korjournal: 'Körjournal',
    };
    return map[key] || key;
  };

  const minusTwoMonths = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setMonth(dt.getMonth() - 2);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // NEW FUNCTION - Check if drift date is too soon
  const isDriftTooSoon = (yyyyMmDd) => {
    if (!yyyyMmDd) return false;
    const driftDate = new Date(yyyyMmDd);
    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    
    return driftDate < twoMonthsFromNow;
  };

  // NEW FUNCTION - Get days until drift
  const getDaysUntilDrift = (yyyyMmDd) => {
    if (!yyyyMmDd) return null;
    const driftDate = new Date(yyyyMmDd);
    const today = new Date();
    const diffTime = driftDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSmartDueDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return '';
  
  const driftDate = new Date(yyyyMmDd);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
  
  // Calculate ideal start date (2 months before)
  const idealStartDate = new Date(driftDate);
  idealStartDate.setMonth(idealStartDate.getMonth() - 2);
  idealStartDate.setHours(0, 0, 0, 0);
  
 // If ideal start date is in the past, set due date to 2 days from now (triggers "due soon")
  if (idealStartDate <= today) {
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const yy = twoDaysFromNow.getFullYear();
    const mm = String(twoDaysFromNow.getMonth() + 1).padStart(2, '0');
    const dd = String(twoDaysFromNow.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }
  
  // Otherwise use the ideal start date
  const yy = idealStartDate.getFullYear();
  const mm = String(idealStartDate.getMonth() + 1).padStart(2, '0');
  const dd = String(idealStartDate.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

  const getSmartDueDateWithTime = (yyyyMmDd) => {
    const dateStr = getSmartDueDate(yyyyMmDd);
    if (!dateStr) return '';
    
    // Add time (9 AM) for better Trello processing
    return `${dateStr} 09:00`;
  };

  const generateICSFile = (foretag, serviceLabel, driftDate, startDate) => {
  const now = new Date();
  const formatICSDate = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  // Set reminder for 9 AM on the start date
  const reminderDate = new Date(startDate || now);
  reminderDate.setHours(9, 0, 0, 0);
  
  const icsContent = `BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//EasyPartner//Order System//EN
    CALSCALE:GREGORIAN
    METHOD:PUBLISH
    BEGIN:VEVENT
    DTSTART:${formatICSDate(reminderDate)}
    DTEND:${formatICSDate(new Date(reminderDate.getTime() + 60*60*1000))}
    DTSTAMP:${formatICSDate(now)}
    SUMMARY:🚨 STARTA ORDER: ${foretag} - ${serviceLabel}
    DESCRIPTION:AKUT ORDER!\\n\\nKund: ${foretag}\\nTjänst: ${serviceLabel}\\nDriftsättning: ${driftDate}\\n\\nBörja arbeta med denna order OMEDELBART!
    LOCATION:EasyPartner
    STATUS:CONFIRMED
    PRIORITY:1
    BEGIN:VALARM
    TRIGGER:-PT0M
    ACTION:DISPLAY
    DESCRIPTION:Starta arbete med ${foretag}
    END:VALARM
    BEGIN:VALARM
    TRIGGER:-PT1H
    ACTION:DISPLAY
    DESCRIPTION:Om 1 timme: Starta ${foretag}
    END:VALARM
    END:VEVENT
    END:VCALENDAR`;

    return icsContent;
  };

  const downloadICSFile = (foretag, serviceLabel, driftDate, startDate) => {
    const icsContent = generateICSFile(foretag, serviceLabel, driftDate, startDate);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `URGENT-${foretag.replace(/[^a-z0-9]/gi, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const validateForm = () => {
    const newErrors = {};

    // Säljare måste vara vald
    if (!saljare) newErrors.saljare = 'Du måste välja ditt namn först!';

    // Måste välja en tjänst
    if (!selectedService) newErrors.selectedService = 'Välj en tjänst';

    // Trello meta (minimalt krav: prio + driftStart)
    if (!trelloMeta.driftStart) newErrors.driftStart = 'Välj driftsättningsdatum';

    // Base validation
    if (!baseInfo.foretag) newErrors.foretag = 'Företagsnamn krävs';
    if (!baseInfo.organisationsnummer) newErrors.organisationsnummer = 'Org.nummer krävs';

    // Contact validation
    baseInfo.kontakter.forEach((k, i) => {
      if (!k.namn) newErrors[`kontakt_${i}_namn`] = 'Namn krävs';
      if (!k.epost) newErrors[`kontakt_${i}_epost`] = 'E-post krävs';
    });

    // Service-specific minimal validation
    if (selectedService === 'telefoni') {
      telefoniData.forEach((t, i) => {
        if (!t.nuvarandeOperator) newErrors[`telefoni_${i}_nuvarande`] = 'Välj nuvarande operatör';
        if (!t.nastaOperator) newErrors[`telefoni_${i}_nasta`] = 'Välj nästa operatör';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateEmailBody = () => {
    const serviceLabel = formatServiceLabel(selectedService);
    const startDatum = minusTwoMonths(trelloMeta.driftStart);
    const smartDueDate = getSmartDueDate(trelloMeta.driftStart);
    body += `📅 Trello Due Date: ${smartDueDate}\n`;

    let body = '';
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

    // KUND & BOLAG
    body += `📋 KUND & BOLAGSUPPGIFTER\n\n`;
    body += `Företag: ${baseInfo.foretag}\n`;
    body += `Org.nummer: ${baseInfo.organisationsnummer}\n\n`;

    // KONTAKTPERSONER
    body += `👥 KONTAKTPERSONER\n\n`;
    baseInfo.kontakter.forEach((k, i) => {
      body += `Kontakt ${i + 1}:\n`;
      body += `  Namn: ${k.namn}\n`;
      body += `  Roll: ${k.roll}\n`;
      body += `  Telefon: ${k.telefon}\n`;
      body += `  E-post: ${k.epost}\n\n`;
    });

    // EKONOMI & FULLMAKTER
    body += `💰 EKONOMI & FULLMAKTER\n\n`;
    body += `1️⃣ SLUTFAKTURA (hårdvara & abonnemang):\n${ekonomiData.slutfaktura || '_'}\n\n`;
    body += `2️⃣ FULLMAKT (vilka?):\n${ekonomiData.fullmakt || '_'}\n\n`;
    body += `3️⃣ ÖVRIGT (ekonomi):\n${ekonomiData.ovrigt || '_'}\n\n`;

    // SERVICEBLOCK
    if (selectedService === 'telefoni') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `📞 TELEFONI\n\n`;
      
      telefoniData.forEach((t, i) => {
        body += `Operatör ${i + 1}:\n`;
        body += `  Nuvarande: ${t.nuvarandeOperator || '_'}\n`;
        body += `  Nästa: ${t.nastaOperator || '_'}\n`;
        body += `  Antal abonnemang: ${t.antalAbonnemang || '_'}\n`;
        if (t.ovrigt) {
          body += `  Övrigt: ${t.ovrigt}\n`;
        }
        body += `\n`;
      });
    }

    if (selectedService === 'vaxel') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `☎️ VÄXEL\n\n`;
      body += `Nuvarande lösning/leverantör: ${vaxelData.nuvarandeLosning || '_'}\n`;
      body += `Nästa lösning/leverantör: ${vaxelData.nastaLosning || '_'}\n`;
      body += `Huvudnummer: ${vaxelData.huvudnummer || '_'}\n`;
      body += `Öppettider: ${vaxelData.oppettider || '_'}\n\n`;
      body += `Övrigt (växel):\n${vaxelData.ovrigt || '_'}\n\n`;
    }

    if (selectedService === 'korjournal') {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `🚗 KÖRJOURNAL\n\n`;
      body += `Nuvarande leverantör: ${korjournalData.leverantorNu || '_'}\n`;
      body += `Nästa leverantör: ${korjournalData.leverantorSen || '_'}\n\n`;

      body += `Fordon (regnr):\n`;
      korjournalData.fordon.forEach((f, i) => {
        body += `  ${i + 1}. ${f.regnr || '_'}\n`;
      });
      body += `\nÖvrigt (körjournal):\n${korjournalData.ovrigt || '_'}\n\n`;
    }

    return body;
  };

  const handleSendOrder = () => {
    if (!validateForm()) {
      alert('Vänligen fyll i alla obligatoriska fält (inklusive ditt namn och driftsättningsdatum).');
      return;
    }

    const serviceLabel = formatServiceLabel(selectedService);
    const isUrgent = isDriftTooSoon(trelloMeta.driftStart);
    const daysLeft = getDaysUntilDrift(trelloMeta.driftStart);
    
    // Create subject with urgency marker
    let subject;
    if (isUrgent && daysLeft <= 30) {
      subject = `🚨 AKUT (${daysLeft} dagar!) - ${baseInfo.foretag} - ${serviceLabel}`;
    } else {
      subject = `Ny order - ${baseInfo.foretag} - ${serviceLabel}`;
    }

    const body = generateEmailBody();
    const trelloEmail = saljareTrelloEmails[saljare];
    const mailtoLink =
      `mailto:abbe@easypartner.se` +
      `?cc=${encodeURIComponent(trelloEmail)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  // Helper functions för repeatable listor
  const addItem = (setState, currentData, key, template) => {
    setState({
      ...currentData,
      [key]: [...currentData[key], template]
    });
  };

  const removeItem = (setState, currentData, key, index) => {
    setState({
      ...currentData,
      [key]: currentData[key].filter((_, i) => i !== index)
    });
  };

  const updateItem = (setState, currentData, key, index, field, value) => {
    const updated = [...currentData[key]];
    updated[index] = { ...updated[index], [field]: value };
    setState({ ...currentData, [key]: updated });
  };

  const completionPercentage = () => {
    let total = 10;
    let filled = 0;

    // Trello meta
    total += 2;
    if (trelloMeta.driftStart) filled++;

    // Base
    if (baseInfo.foretag) filled++;
    if (baseInfo.organisationsnummer) filled++;
    if (baseInfo.kontakter[0].namn) filled++;
    if (baseInfo.kontakter[0].epost) filled++;

    // Service selected
    if (selectedService) filled++;

   // Service min
    if (selectedService === 'telefoni') {
      total += 2;
      if (telefoniData[0]?.nuvarandeOperator) filled++;
      if (telefoniData[0]?.nastaOperator) filled++;
    }

    return Math.round((filled / total) * 100);
  };

  const anyServiceSelected = !!selectedService;

  // All operators - for "Nuvarande operatör"
  const allOperatorOptions = [
    '', 'Telia', 'Tele2', 'Telenor', '3 (Tre)', 'Hallon', 'Vimla', 'Comviq', 'Chilimobil', 'Fello', 'Annat'
  ];

  // Only the big 4 - for "Nästa operatör"
  const bigFourOperators = [
    '', 'Telia', 'Tele2', 'Telenor', '3 (Tre)'
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
      color: '#e2e8f0'
    }}>
      <style>{`
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
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
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
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
        }
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
        .error-text { color: #fca5a5; font-size: 13px; margin-top: 4px; }
        textarea.input-field { min-height: 110px; resize: vertical; }

        /* Calendar icon color - brand blue */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(64%) sepia(36%) saturate(1021%) hue-rotate(146deg) brightness(93%) contrast(87%);
          cursor: pointer;
          transition: filter 0.2s;
          width: 20px;
          height: 20px;
        }

        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          filter: invert(64%) sepia(36%) saturate(1021%) hue-rotate(146deg) brightness(110%) contrast(87%);
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '24px 0',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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

        {/* Säljare */}
        <div className="form-section">
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>👤</span>
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

        {/* Trello meta */}
        <div className="form-section">
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>⚡</span>
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
              
             {isDriftTooSoon(trelloMeta.driftStart) && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'pulse 2s infinite'
              }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#fca5a5', marginBottom: '4px' }}>
                    VARNING: Kort tid till drift!
                  </div>
                  <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                    Driftsättning är om {getDaysUntilDrift(trelloMeta.driftStart)} dagar.
                    <br />
                    Idealisk starttid har passerats. Fortsätt ändå om kunden godkänt detta.
                  </div>
                </div>
              </div>
            )}
              
              {!isDriftTooSoon(trelloMeta.driftStart) && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#86efac' }}>
                  ✅ Trello due date kommer att sättas till: {getSmartDueDate(trelloMeta.driftStart)}
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {/* Service Selection */}
        <div className="form-section">
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>1</span>
            Välj tjänst (en i taget)
          </h2>

          {errors.selectedService && <div className="error-text" style={{ marginBottom: '12px' }}>{errors.selectedService}</div>}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {[
              { key: 'telefoni', label: 'Telefoni', icon: '📞' },
              { key: 'vaxel', label: 'Växel', icon: '☎️' },
              { key: 'korjournal', label: 'Körjournal', icon: '🚗' },
            ].map(service => (
              <div
                key={service.key}
                className={`service-card ${selectedService === service.key ? 'active' : ''}`}
                onClick={() => setSelectedService(service.key)}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{service.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{service.label}</div>
                {selectedService === service.key && (
                  <div style={{
                    marginTop: '12px',
                    color: '#55c7db',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ✅ Vald
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {anyServiceSelected && (
          <>
            {/* Kund & Bolag */}
            <div className="form-section">
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>2</span>
                Kund- & Bolagsuppgifter
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Företagsnamn *
                  </label>
                  <input
                    className={`input-field ${errors.foretag ? 'error' : ''}`}
                    value={baseInfo.foretag}
                    onChange={(e) => setBaseInfo({ ...baseInfo, foretag: e.target.value })}
                    placeholder="AB Företag"
                  />
                  {errors.foretag && <div className="error-text">{errors.foretag}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Organisationsnummer *
                  </label>
                  <input
                    className={`input-field ${errors.organisationsnummer ? 'error' : ''}`}
                    value={baseInfo.organisationsnummer}
                    onChange={(e) => setBaseInfo({ ...baseInfo, organisationsnummer: e.target.value })}
                    placeholder="556XXX-XXXX"
                  />
                  {errors.organisationsnummer && <div className="error-text">{errors.organisationsnummer}</div>}
                </div>
              </div>
            </div>

            {/* Kontaktpersoner */}
            <div className="form-section">
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #55c7db 0%, #a39acb 100%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>3</span>
                  Kontaktpersoner
                </span>
                <button
                  className="btn btn-add"
                  onClick={() => addItem(
                    setBaseInfo,
                    baseInfo,
                    'kontakter',
                    { namn: '', roll: '', telefon: '', epost: '' }
                  )}
                >
                  + Lägg till
                </button>
              </h2>

              {baseInfo.kontakter.map((kontakt, index) => (
                <div key={index} className="repeatable-item">
                  {baseInfo.kontakter.length > 1 && (
                    <button
                      className="btn btn-secondary"
                      style={{ position: 'absolute', top: '12px', right: '12px' }}
                      onClick={() => removeItem(setBaseInfo, baseInfo, 'kontakter', index)}
                      title="Ta bort"
                    >
                      ×
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Namn *
                      </label>
                      <input
                        className={`input-field ${errors[`kontakt_${index}_namn`] ? 'error' : ''}`}
                        value={kontakt.namn}
                        onChange={(e) => updateItem(setBaseInfo, baseInfo, 'kontakter', index, 'namn', e.target.value)}
                        placeholder="Anna Andersson"
                      />
                      {errors[`kontakt_${index}_namn`] && <div className="error-text">{errors[`kontakt_${index}_namn`]}</div>}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Roll/Titel
                      </label>
                      <input
                        className="input-field"
                        value={kontakt.roll}
                        onChange={(e) => updateItem(setBaseInfo, baseInfo, 'kontakter', index, 'roll', e.target.value)}
                        placeholder="VD"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Telefon
                      </label>
                      <input
                        className="input-field"
                        value={kontakt.telefon}
                        onChange={(e) => updateItem(setBaseInfo, baseInfo, 'kontakter', index, 'telefon', e.target.value)}
                        placeholder="070-123 45 67"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        E-post *
                      </label>
                      <input
                        type="email"
                        className={`input-field ${errors[`kontakt_${index}_epost`] ? 'error' : ''}`}
                        value={kontakt.epost}
                        onChange={(e) => updateItem(setBaseInfo, baseInfo, 'kontakter', index, 'epost', e.target.value)}
                        placeholder="anna@foretag.se"
                      />
                      {errors[`kontakt_${index}_epost`] && <div className="error-text">{errors[`kontakt_${index}_epost`]}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ekonomi - 3 fält */}
            <div className="form-section">
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #55c7db, #a39acb)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>4</span>
                Ekonomi & Fullmakter
              </h2>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    1. Slutfaktura (hårdvara & abonnemang)
                  </label>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Ex: "Slutlösen 17187 kr efter 6 mån, hårdvara ligger hos Test Testsson Telenor privat..."
                  </div>
                  <textarea
                    className="input-field"
                    value={ekonomiData.slutfaktura}
                    onChange={(e) => setEkonomiData({ ...ekonomiData, slutfaktura: e.target.value })}
                    placeholder="Beskriv slutfaktura, bindningstid, hårdvara..."
                    style={{ minHeight: '100px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    2. Fullmakt (vilka behöver vi fullmakt från?)
                  </label>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Ex: "1. Telenor privat - Helin Shekhan, 2. Telenor företag - Test Testsson..."
                  </div>
                  <textarea
                    className="input-field"
                    value={ekonomiData.fullmakt}
                    onChange={(e) => setEkonomiData({ ...ekonomiData, fullmakt: e.target.value })}
                    placeholder="Lista vilka fullmakter vi behöver (operatör + namn)..."
                    style={{ minHeight: '100px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    3. Övrigt (ekonomi)
                  </label>
                  <textarea
                    className="input-field"
                    value={ekonomiData.ovrigt}
                    onChange={(e) => setEkonomiData({ ...ekonomiData, ovrigt: e.target.value })}
                    placeholder="Annan ekonomisk info..."
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </div>
            </div>

            {/* SERVICE: TELEFONI */}
            {selectedService === 'telefoni' && (
              <div className="form-section">
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>📞</span>
                    Telefoni
                  </span>
                  <button
                    className="btn btn-add"
                    onClick={() => setTelefoniData([
                      ...telefoniData,
                      { nuvarandeOperator: '', nastaOperator: '', antalAbonnemang: '', ovrigt: '' }
                    ])}
                  >
                    + Lägg till operatör
                  </button>
                </h2>

                {telefoniData.map((item, index) => (
                  <div key={index} className="repeatable-item" style={{ marginBottom: '20px' }}>
                    {telefoniData.length > 1 && (
                      <button
                        className="btn btn-secondary"
                        style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => setTelefoniData(telefoniData.filter((_, i) => i !== index))}
                        title="Ta bort"
                      >
                        ×
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Nuvarande operatör *
                        </label>
                        <select
                          className={`input-field ${errors[`telefoni_${index}_nuvarande`] ? 'error' : ''}`}
                          value={item.nuvarandeOperator}
                          onChange={(e) => {
                            const updated = [...telefoniData];
                            updated[index] = { ...updated[index], nuvarandeOperator: e.target.value };
                            setTelefoniData(updated);
                          }}
                        >
                          {allOperatorOptions.map(op => (
                            <option key={op} value={op}>{op || 'Välj…'}</option>
                          ))}
                        </select>
                        {errors[`telefoni_${index}_nuvarande`] && (
                          <div className="error-text">{errors[`telefoni_${index}_nuvarande`]}</div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Nästa operatör *
                        </label>
                        <select
                          className={`input-field ${errors[`telefoni_${index}_nasta`] ? 'error' : ''}`}
                          value={item.nastaOperator}
                          onChange={(e) => {
                            const updated = [...telefoniData];
                            updated[index] = { ...updated[index], nastaOperator: e.target.value };
                            setTelefoniData(updated);
                          }}
                        >
                          {bigFourOperators.map(op => (
                            <option key={op} value={op}>{op || 'Välj…'}</option>
                          ))}
                        </select>
                        {errors[`telefoni_${index}_nasta`] && (
                          <div className="error-text">{errors[`telefoni_${index}_nasta`]}</div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Antal abonnemang
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={item.antalAbonnemang}
                          onChange={(e) => {
                            const updated = [...telefoniData];
                            updated[index] = { ...updated[index], antalAbonnemang: e.target.value };
                            setTelefoniData(updated);
                          }}
                          placeholder="Ex: 15"
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Övrigt (nummer, info, etc.)
                        </label>
                        <textarea
                          className="input-field"
                          value={item.ovrigt}
                          onChange={(e) => {
                            const updated = [...telefoniData];
                            updated[index] = { ...updated[index], ovrigt: e.target.value };
                            setTelefoniData(updated);
                          }}
                          placeholder="Ex: specifika nummer, extra info..."
                          style={{ minHeight: '80px' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SERVICE: VÄXEL */}
            {selectedService === 'vaxel' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>☎️</span>
                  Växel
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Nuvarande lösning/leverantör
                    </label>
                    <input
                      className="input-field"
                      value={vaxelData.nuvarandeLosning}
                      onChange={(e) => setVaxelData({ ...vaxelData, nuvarandeLosning: e.target.value })}
                      placeholder="Ex: Telia Touchpoint / annan"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Nästa lösning/leverantör
                    </label>
                    <input
                      className="input-field"
                      value={vaxelData.nastaLosning}
                      onChange={(e) => setVaxelData({ ...vaxelData, nastaLosning: e.target.value })}
                      placeholder="Ex: Tele2 / Telenor / etc."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Huvudnummer
                    </label>
                    <input
                      className="input-field"
                      value={vaxelData.huvudnummer}
                      onChange={(e) => setVaxelData({ ...vaxelData, huvudnummer: e.target.value })}
                      placeholder="08-xxx xx xx"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Öppettider
                    </label>
                    <input
                      className="input-field"
                      value={vaxelData.oppettider}
                      onChange={(e) => setVaxelData({ ...vaxelData, oppettider: e.target.value })}
                      placeholder="Ex: 08–17"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Övrigt (växel)
                    </label>
                    <textarea
                      className="input-field"
                      value={vaxelData.ovrigt}
                      onChange={(e) => setVaxelData({ ...vaxelData, ovrigt: e.target.value })}
                      placeholder="Ex: menyval, kö, hänvisning, specialregler, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SERVICE: KÖRJOURNAL */}
            {selectedService === 'korjournal' && (
              <div className="form-section">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🚗</span>
                    Körjournal
                  </span>
                  <button
                    className="btn btn-add"
                    onClick={() => addItem(setKorjournalData, korjournalData, 'fordon', { regnr: '' })}
                  >
                    + Lägg till fordon
                  </button>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Nuvarande leverantör
                    </label>
                    <input
                      className="input-field"
                      value={korjournalData.leverantorNu}
                      onChange={(e) => setKorjournalData({ ...korjournalData, leverantorNu: e.target.value })}
                      placeholder="Ex: Fleat / annan"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Nästa leverantör
                    </label>
                    <input
                      className="input-field"
                      value={korjournalData.leverantorSen}
                      onChange={(e) => setKorjournalData({ ...korjournalData, leverantorSen: e.target.value })}
                      placeholder="Ex: ny leverantör"
                    />
                  </div>
                </div>

                {korjournalData.fordon.map((f, index) => (
                  <div key={index} className="repeatable-item">
                    {korjournalData.fordon.length > 1 && (
                      <button
                        className="btn btn-secondary"
                        style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => removeItem(setKorjournalData, korjournalData, 'fordon', index)}
                        title="Ta bort"
                      >
                        ×
                      </button>
                    )}

                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Regnr {index + 1}
                    </label>
                    <input
                      className="input-field"
                      value={f.regnr}
                      onChange={(e) => updateItem(setKorjournalData, korjournalData, 'fordon', index, 'regnr', e.target.value)}
                      placeholder="ABC123"
                    />
                  </div>
                ))}

                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Övrigt (körjournal)
                  </label>
                  <textarea
                    className="input-field"
                    value={korjournalData.ovrigt}
                    onChange={(e) => setKorjournalData({ ...korjournalData, ovrigt: e.target.value })}
                    placeholder="Ex: förare, policy, behov, integration, etc."
                  />
                </div>
              </div>
            )}

            {/* Send Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
      Redo att skicka order?
    </div>
    <div style={{ 
      fontSize: '13px', 
      color: '#fbbf24',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      ⚠️ Kom ihåg: Ta bort din email-signatur innan du skickar!
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

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SalesOrderApp />);