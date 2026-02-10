// sales-order-app.jsx
// Körs direkt i browsern via Babel + React CDN (ingen bundler, inga imports)

const { useState } = React;

function SalesOrderApp() {
  // Service selection
  const [services, setServices] = useState({
    telefoni: false,
    vaxel: false,
    kassa: false,
    korjournal: false
  });

  // Base info (always required)
  const [baseInfo, setBaseInfo] = useState({
    // Kund & Bolag
    foretag: '',
    organisationsnummer: '',
    besoksadress: '',
    postnummer: '',
    postort: '',
    antalAnstallda: '',
    antalArbetsplatser: '',

    // Kontaktpersoner (repeatable)
    kontakter: [{ namn: '', roll: '', telefon: '', epost: '' }],

    // Fakturering
    fakturaadress: '',
    fakturaEpost: '',
    betalningsvillkor: '30',
    referens: '',
    bindningstid: ''
  });

  // Service-specific data
  const [telefoniData, setTelefoniData] = useState({
    nummer: [{
      nuvarandeNummer: '',
      typ: 'portering',
      operator: '',
      simTyp: '',
      portDatum: '',
      avtalSlut: '',
      aktivDatum: '',
      anvandarnamn: ''
    }]
  });

  const [vaxelData, setVaxelData] = useState({
    huvudnummerBefintligt: 'nej',
    huvudnummer: '',
    portDatum: '',
    oppettider: '',
    koppling: '',
    stangdHanvisning: '',
    anvandare: [{
      namn: '',
      roll: '',
      mobil: '',
      direkt: '',
      epost: ''
    }]
  });

  const [kassaData, setKassaData] = useState({
    verksamhetstyp: '',
    omsattning: '',
    transaktioner: '',
    kassaplatser: [{
      platsNamn: '',
      hardvara: '',
      skrivare: '',
      kortlasare: '',
      streckkod: ''
    }],
    betalmetoder: {
      kort: false,
      swish: false,
      kontant: false
    },
    integrationer: ''
  });

  const [korjournalData, setKorjournalData] = useState({
    fordon: [{
      regnr: '',
      marke: '',
      modell: '',
      milersattning: ''
    }],
    forare: [{
      namn: '',
      personnummer: '',
      korkort: '',
      mobil: ''
    }]
  });

  // Validation
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Base validation
    if (!baseInfo.foretag) newErrors.foretag = 'Företagsnamn krävs';
    if (!baseInfo.organisationsnummer) newErrors.organisationsnummer = 'Org.nummer krävs';
    if (!baseInfo.antalAnstallda || Number(baseInfo.antalAnstallda) < 1) newErrors.antalAnstallda = 'Ange antal anställda';

    // Contact validation
    baseInfo.kontakter.forEach((k, i) => {
      if (!k.namn) newErrors[`kontakt_${i}_namn`] = 'Namn krävs';
      if (!k.epost) newErrors[`kontakt_${i}_epost`] = 'E-post krävs';
    });

    // Service-specific validation
    if (services.telefoni) {
      telefoniData.nummer.forEach((n, i) => {
        if (!n.nuvarandeNummer && !n.anvandarnamn) {
          newErrors[`telefoni_${i}`] = 'Ange nummer eller användarnamn';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateEmailBody = () => {
    const selectedServices = Object.keys(services)
      .filter(k => services[k])
      .map(k => k.charAt(0).toUpperCase() + k.slice(1))
      .join(', ');

    let body = `NY ORDER - ${baseInfo.foretag}\n`;
    body += `Tjänster: ${selectedServices}\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // KUND & BOLAG
    body += `📋 KUND & BOLAGSUPPGIFTER\n\n`;
    body += `Företag: ${baseInfo.foretag}\n`;
    body += `Org.nummer: ${baseInfo.organisationsnummer}\n`;
    body += `Besöksadress: ${baseInfo.besoksadress}\n`;
    body += `Postnummer: ${baseInfo.postnummer}\n`;
    body += `Postort: ${baseInfo.postort}\n`;
    body += `Antal anställda: ${baseInfo.antalAnstallda}\n`;
    body += `Antal arbetsplatser: ${baseInfo.antalArbetsplatser}\n\n`;

    // KONTAKTPERSONER
    body += `👥 KONTAKTPERSONER\n\n`;
    baseInfo.kontakter.forEach((k, i) => {
      body += `Kontakt ${i + 1}:\n`;
      body += `  Namn: ${k.namn}\n`;
      body += `  Roll: ${k.roll}\n`;
      body += `  Telefon: ${k.telefon}\n`;
      body += `  E-post: ${k.epost}\n\n`;
    });

    // FAKTURERING
    body += `💰 FAKTURERING & EKONOMI\n\n`;
    body += `Fakturaadress: ${baseInfo.fakturaadress}\n`;
    body += `Faktura e-post: ${baseInfo.fakturaEpost}\n`;
    body += `Betalningsvillkor: ${baseInfo.betalningsvillkor} dagar\n`;
    body += `Referens: ${baseInfo.referens}\n`;
    body += `Bindningstid: ${baseInfo.bindningstid} månader\n\n`;

    // TELEFONI
    if (services.telefoni) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `📞 TELEFONI\n\n`;
      telefoniData.nummer.forEach((n, i) => {
        body += `Nummer ${i + 1}:\n`;
        body += `  Nuvarande nummer: ${n.nuvarandeNummer}\n`;
        body += `  Typ: ${n.typ === 'portering' ? 'Portering' : 'Nytt nummer'}\n`;
        if (n.typ === 'portering') {
          body += `  Nuvarande operatör: ${n.operator}\n`;
          body += `  Porteringsdatum: ${n.portDatum}\n`;
          body += `  Avtal slutar: ${n.avtalSlut}\n`;
        } else {
          body += `  Önskat aktiveringsdatum: ${n.aktivDatum}\n`;
        }
        body += `  SIM-typ: ${n.simTyp}\n`;
        body += `  Användarnamn: ${n.anvandarnamn}\n\n`;
      });
    }

    // VÄXEL
    if (services.vaxel) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `☎️ VÄXEL\n\n`;
      body += `Huvudnummer befintligt: ${vaxelData.huvudnummerBefintligt}\n`;
      body += `Huvudnummer: ${vaxelData.huvudnummer}\n`;
      if (vaxelData.huvudnummerBefintligt === 'ja') {
        body += `Porteringsdatum: ${vaxelData.portDatum}\n`;
      }
      body += `Öppettider: ${vaxelData.oppettider}\n`;
      body += `Koppling: ${vaxelData.koppling}\n`;
      body += `Stängd hänvisning: ${vaxelData.stangdHanvisning}\n\n`;

      body += `Användare i växeln:\n`;
      vaxelData.anvandare.forEach((a, i) => {
        body += `  ${i + 1}. ${a.namn} (${a.roll})\n`;
        body += `     Mobil: ${a.mobil}\n`;
        body += `     Direkt: ${a.direkt}\n`;
        body += `     E-post: ${a.epost}\n\n`;
      });
    }

    // KASSA
    if (services.kassa) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `💳 KASSA/POS\n\n`;
      body += `Verksamhetstyp: ${kassaData.verksamhetstyp}\n`;
      body += `Årlig omsättning: ${kassaData.omsattning}\n`;
      body += `Transaktioner/månad: ${kassaData.transaktioner}\n\n`;

      body += `Kassaplatser:\n`;
      kassaData.kassaplatser.forEach((k, i) => {
        body += `  ${i + 1}. ${k.platsNamn}\n`;
        body += `     Hårdvara: ${k.hardvara}\n`;
        body += `     Skrivare: ${k.skrivare}\n`;
        body += `     Kortläsare: ${k.kortlasare}\n`;
        body += `     Streckkodsläsare: ${k.streckkod}\n\n`;
      });

      const metoder = [];
      if (kassaData.betalmetoder.kort) metoder.push('Kort');
      if (kassaData.betalmetoder.swish) metoder.push('Swish');
      if (kassaData.betalmetoder.kontant) metoder.push('Kontant');
      body += `Betalmetoder: ${metoder.join(', ')}\n`;
      body += `Integrationer: ${kassaData.integrationer}\n\n`;
    }

    // KÖRJOURNAL
    if (services.korjournal) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      body += `🚗 KÖRJOURNAL\n\n`;

      body += `Fordon:\n`;
      korjournalData.fordon.forEach((f, i) => {
        body += `  ${i + 1}. ${f.marke} ${f.modell} (${f.regnr})\n`;
        body += `     Milersättning: ${f.milersattning} kr/mil\n\n`;
      });

      body += `Förare:\n`;
      korjournalData.forare.forEach((f, i) => {
        body += `  ${i + 1}. ${f.namn} (${f.personnummer})\n`;
        body += `     Körkort: ${f.korkort}\n`;
        body += `     Mobil: ${f.mobil}\n\n`;
      });
    }

    return body;
  };

  const handleSendOrder = () => {
    if (!validateForm()) {
      alert('Vänligen fyll i alla obligatoriska fält');
      return;
    }

    const subject = `Ny order - ${baseInfo.foretag} - ${Object.keys(services)
      .filter(k => services[k])
      .map(k => k.charAt(0).toUpperCase() + k.slice(1))
      .join(', ')}`;

    const body = generateEmailBody();

    const mailtoLink = `mailto:abbe@easypartner.se?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Helper functions for repeatable lists
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
    let total = 10; // Base fields
    let filled = 0;

    if (baseInfo.foretag) filled++;
    if (baseInfo.organisationsnummer) filled++;
    if (baseInfo.antalAnstallda) filled++;
    if (baseInfo.fakturaEpost) filled++;
    if (baseInfo.kontakter[0].namn) filled++;

    if (services.telefoni) {
      total += 3;
      if (telefoniData.nummer[0].nuvarandeNummer) filled++;
      if (telefoniData.nummer[0].typ) filled++;
      if (telefoniData.nummer[0].simTyp) filled++;
    }

    if (services.vaxel) {
      total += 2;
      if (vaxelData.huvudnummer) filled++;
      if (vaxelData.oppettider) filled++;
    }

    if (services.kassa) {
      total += 2;
      if (kassaData.verksamhetstyp) filled++;
      if (kassaData.omsattning) filled++;
    }

    if (services.korjournal) {
      total += 2;
      if (korjournalData.fordon[0].regnr) filled++;
      if (korjournalData.forare[0].namn) filled++;
    }

    return Math.round((filled / total) * 100);
  };

  const anyServiceSelected = Object.values(services).some(v => v);

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
          border-color: rgba(34, 211, 238, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(34, 211, 238, 0.15);
        }

        .service-card.active {
          background: rgba(6, 182, 212, 0.1);
          border-color: #06b6d4;
          box-shadow: 0 0 24px rgba(6, 182, 212, 0.2);
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
          border-color: #06b6d4;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
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
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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
          background: linear-gradient(90deg, #06b6d4, #22c55e);
          border-radius: 999px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .checkbox-label:hover { background: rgba(148, 163, 184, 0.05); }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #06b6d4;
        }

        .repeatable-item {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          position: relative;
        }

        .error-text {
          color: #fca5a5;
          font-size: 13px;
          margin-top: 4px;
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
                background: 'linear-gradient(135deg, #06b6d4, #22c55e)',
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

            {anyServiceSelected && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '8px' }}>
                  <div className="progress-bar" style={{ width: '200px' }}>
                    <div className="progress-fill" style={{ width: `${completionPercentage()}%` }} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>
                    {completionPercentage()}% komplett
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
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
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>1</span>
            Välj tjänster
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {[
              { key: 'telefoni', label: 'Telefoni', icon: '📞' },
              { key: 'vaxel', label: 'Växel', icon: '☎️' },
              { key: 'kassa', label: 'Kassa/POS', icon: '💳' },
              { key: 'korjournal', label: 'Körjournal', icon: '🚗' }
            ].map(service => (
              <div
                key={service.key}
                className={`service-card ${services[service.key] ? 'active' : ''}`}
                onClick={() => setServices({ ...services, [service.key]: !services[service.key] })}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{service.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{service.label}</div>
                {services[service.key] && (
                  <div style={{
                    marginTop: '12px',
                    color: '#06b6d4',
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
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
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

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Besöksadress
                  </label>
                  <input
                    className="input-field"
                    value={baseInfo.besoksadress}
                    onChange={(e) => setBaseInfo({ ...baseInfo, besoksadress: e.target.value })}
                    placeholder="Gatugatan 1"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Postnummer
                    </label>
                    <input
                      className="input-field"
                      value={baseInfo.postnummer}
                      onChange={(e) => setBaseInfo({ ...baseInfo, postnummer: e.target.value })}
                      placeholder="123 45"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Postort
                    </label>
                    <input
                      className="input-field"
                      value={baseInfo.postort}
                      onChange={(e) => setBaseInfo({ ...baseInfo, postort: e.target.value })}
                      placeholder="Stockholm"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Antal anställda *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={`input-field ${errors.antalAnstallda ? 'error' : ''}`}
                    value={baseInfo.antalAnstallda}
                    onChange={(e) => setBaseInfo({ ...baseInfo, antalAnstallda: e.target.value })}
                    placeholder="5"
                  />
                  {errors.antalAnstallda && <div className="error-text">{errors.antalAnstallda}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Antal arbetsplatser
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={baseInfo.antalArbetsplatser}
                    onChange={(e) => setBaseInfo({ ...baseInfo, antalArbetsplatser: e.target.value })}
                    placeholder="1"
                  />
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
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
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

            {/* Fakturering */}
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
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>4</span>
                Fakturering & Ekonomi
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Fakturaadress
                  </label>
                  <input
                    className="input-field"
                    value={baseInfo.fakturaadress}
                    onChange={(e) => setBaseInfo({ ...baseInfo, fakturaadress: e.target.value })}
                    placeholder="Om avvikande från besöksadress"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    E-postadress för faktura
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={baseInfo.fakturaEpost}
                    onChange={(e) => setBaseInfo({ ...baseInfo, fakturaEpost: e.target.value })}
                    placeholder="ekonomi@foretag.se"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Betalningsvillkor (dagar)
                  </label>
                  <select
                    className="input-field"
                    value={baseInfo.betalningsvillkor}
                    onChange={(e) => setBaseInfo({ ...baseInfo, betalningsvillkor: e.target.value })}
                  >
                    <option value="10">10 dagar</option>
                    <option value="20">20 dagar</option>
                    <option value="30">30 dagar</option>
                    <option value="60">60 dagar</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Er referens
                  </label>
                  <input
                    className="input-field"
                    value={baseInfo.referens}
                    onChange={(e) => setBaseInfo({ ...baseInfo, referens: e.target.value })}
                    placeholder="Projektnummer eller kontakt"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Bindningstid (månader)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="36"
                    className="input-field"
                    value={baseInfo.bindningstid}
                    onChange={(e) => setBaseInfo({ ...baseInfo, bindningstid: e.target.value })}
                    placeholder="12"
                  />
                </div>
              </div>
            </div>

            {/* TELEFONI */}
            {services.telefoni && (
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
                    onClick={() => addItem(
                      setTelefoniData,
                      telefoniData,
                      'nummer',
                      {
                        nuvarandeNummer: '',
                        typ: 'portering',
                        operator: '',
                        simTyp: '',
                        portDatum: '',
                        avtalSlut: '',
                        aktivDatum: '',
                        anvandarnamn: ''
                      }
                    )}
                  >
                    + Lägg till nummer
                  </button>
                </h2>

                {telefoniData.nummer.map((nummer, index) => (
                  <div key={index} className="repeatable-item">
                    {telefoniData.nummer.length > 1 && (
                      <button
                        className="btn btn-secondary"
                        style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => removeItem(setTelefoniData, telefoniData, 'nummer', index)}
                        title="Ta bort"
                      >
                        ×
                      </button>
                    )}

                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#06b6d4' }}>
                      Nummer {index + 1}
                    </h3>

                    {errors[`telefoni_${index}`] && <div className="error-text">{errors[`telefoni_${index}`]}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Nuvarande nummer
                        </label>
                        <input
                          className="input-field"
                          value={nummer.nuvarandeNummer}
                          onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'nuvarandeNummer', e.target.value)}
                          placeholder="070-XXX XX XX"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Typ
                        </label>
                        <select
                          className="input-field"
                          value={nummer.typ}
                          onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'typ', e.target.value)}
                        >
                          <option value="portering">Portering (befintligt nummer)</option>
                          <option value="nytt">Nytt nummer</option>
                        </select>
                      </div>

                      {nummer.typ === 'portering' && (
                        <>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                              Nuvarande operatör
                            </label>
                            <select
                              className="input-field"
                              value={nummer.operator}
                              onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'operator', e.target.value)}
                            >
                              <option value="">Välj operatör</option>
                              <option value="Telia">Telia</option>
                              <option value="Tele2">Tele2</option>
                              <option value="Telenor">Telenor</option>
                              <option value="3">3 (Tre)</option>
                              <option value="Hallon">Hallon</option>
                              <option value="Annat">Annat</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                              Önskat porteringsdatum
                            </label>
                            <input
                              type="date"
                              className="input-field"
                              value={nummer.portDatum}
                              onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'portDatum', e.target.value)}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                              Avtal slutar (hos nuvarande)
                            </label>
                            <input
                              type="date"
                              className="input-field"
                              value={nummer.avtalSlut}
                              onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'avtalSlut', e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {nummer.typ === 'nytt' && (
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Önskat aktiveringsdatum
                          </label>
                          <input
                            type="date"
                            className="input-field"
                            value={nummer.aktivDatum}
                            onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'aktivDatum', e.target.value)}
                          />
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          SIM-typ
                        </label>
                        <select
                          className="input-field"
                          value={nummer.simTyp}
                          onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'simTyp', e.target.value)}
                        >
                          <option value="">Välj SIM-typ</option>
                          <option value="Fysiskt SIM">Fysiskt SIM</option>
                          <option value="eSIM">eSIM</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Användare/Anställd
                        </label>
                        <input
                          className="input-field"
                          value={nummer.anvandarnamn}
                          onChange={(e) => updateItem(setTelefoniData, telefoniData, 'nummer', index, 'anvandarnamn', e.target.value)}
                          placeholder="Anna Andersson"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VÄXEL */}
            {services.vaxel && (
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
                    <span style={{ fontSize: '24px' }}>☎️</span>
                    Växel
                  </span>
                  <button
                    className="btn btn-add"
                    onClick={() => addItem(
                      setVaxelData,
                      vaxelData,
                      'anvandare',
                      { namn: '', roll: '', mobil: '', direkt: '', epost: '' }
                    )}
                  >
                    + Lägg till användare
                  </button>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Huvudnummer befintligt?
                    </label>
                    <select
                      className="input-field"
                      value={vaxelData.huvudnummerBefintligt}
                      onChange={(e) => setVaxelData({ ...vaxelData, huvudnummerBefintligt: e.target.value })}
                    >
                      <option value="nej">Nej, nytt nummer</option>
                      <option value="ja">Ja, portera befintligt</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Huvudnummer
                    </label>
                    <input
                      className="input-field"
                      value={vaxelData.huvudnummer}
                      onChange={(e) => setVaxelData({ ...vaxelData, huvudnummer: e.target.value })}
                      placeholder="08-XXX XX XX"
                    />
                  </div>

                  {vaxelData.huvudnummerBefintligt === 'ja' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Porteringsdatum
                      </label>
                      <input
                        type="date"
                        className="input-field"
                        value={vaxelData.portDatum}
                        onChange={(e) => setVaxelData({ ...vaxelData, portDatum: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Öppettider
                    </label>
                    <input
                      className="input-field"
                      value={vaxelData.oppettider}
                      onChange={(e) => setVaxelData({ ...vaxelData, oppettider: e.target.value })}
                      placeholder="Mån-Fre 08:00-17:00"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Koppling (ringsignal)
                    </label>
                    <select
                      className="input-field"
                      value={vaxelData.koppling}
                      onChange={(e) => setVaxelData({ ...vaxelData, koppling: e.target.value })}
                    >
                      <option value="">Välj typ</option>
                      <option value="Alla samtidigt">Ring alla samtidigt</option>
                      <option value="Eftervarann">Ring efter varann</option>
                      <option value="IVR/Meny">IVR/Meny först</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Hänvisning vid stängt
                    </label>
                    <input
                      className="input-field"
                      value={vaxelData.stangdHanvisning}
                      onChange={(e) => setVaxelData({ ...vaxelData, stangdHanvisning: e.target.value })}
                      placeholder="Röstbrevlåda, mobilnummer, e-post"
                    />
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#06b6d4' }}>
                  Användare i växeln
                </h3>

                {vaxelData.anvandare.map((user, index) => (
                  <div key={index} className="repeatable-item">
                    {vaxelData.anvandare.length > 1 && (
                      <button
                        className="btn btn-secondary"
                        style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => removeItem(setVaxelData, vaxelData, 'anvandare', index)}
                        title="Ta bort"
                      >
                        ×
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Namn
                        </label>
                        <input
                          className="input-field"
                          value={user.namn}
                          onChange={(e) => updateItem(setVaxelData, vaxelData, 'anvandare', index, 'namn', e.target.value)}
                          placeholder="Anna Andersson"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Roll
                        </label>
                        <input
                          className="input-field"
                          value={user.roll}
                          onChange={(e) => updateItem(setVaxelData, vaxelData, 'anvandare', index, 'roll', e.target.value)}
                          placeholder="Receptionist"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Mobilnummer
                        </label>
                        <input
                          className="input-field"
                          value={user.mobil}
                          onChange={(e) => updateItem(setVaxelData, vaxelData, 'anvandare', index, 'mobil', e.target.value)}
                          placeholder="070-XXX XX XX"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Direkt (anknytning)
                        </label>
                        <input
                          className="input-field"
                          value={user.direkt}
                          onChange={(e) => updateItem(setVaxelData, vaxelData, 'anvandare', index, 'direkt', e.target.value)}
                          placeholder="101"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          E-post
                        </label>
                        <input
                          type="email"
                          className="input-field"
                          value={user.epost}
                          onChange={(e) => updateItem(setVaxelData, vaxelData, 'anvandare', index, 'epost', e.target.value)}
                          placeholder="anna@foretag.se"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KASSA */}
            {services.kassa && (
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
                    <span style={{ fontSize: '24px' }}>💳</span>
                    Kassa/POS
                  </span>
                  <button
                    className="btn btn-add"
                    onClick={() => addItem(
                      setKassaData,
                      kassaData,
                      'kassaplatser',
                      { platsNamn: '', hardvara: '', skrivare: '', kortlasare: '', streckkod: '' }
                    )}
                  >
                    + Lägg till kassaplats
                  </button>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Verksamhetstyp
                    </label>
                    <input
                      className="input-field"
                      value={kassaData.verksamhetstyp}
                      onChange={(e) => setKassaData({ ...kassaData, verksamhetstyp: e.target.value })}
                      placeholder="Butik, Café, Restaurang"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Årlig omsättning (kr)
                    </label>
                    <input
                      className="input-field"
                      value={kassaData.omsattning}
                      onChange={(e) => setKassaData({ ...kassaData, omsattning: e.target.value })}
                      placeholder="1 000 000"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Transaktioner per månad (ca)
                    </label>
                    <input
                      className="input-field"
                      value={kassaData.transaktioner}
                      onChange={(e) => setKassaData({ ...kassaData, transaktioner: e.target.value })}
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Integrationer
                    </label>
                    <input
                      className="input-field"
                      value={kassaData.integrationer}
                      onChange={(e) => setKassaData({ ...kassaData, integrationer: e.target.value })}
                      placeholder="Fortnox, Visma, Annat"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
                    Betalmetoder
                  </label>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={kassaData.betalmetoder.kort}
                        onChange={(e) => setKassaData({
                          ...kassaData,
                          betalmetoder: { ...kassaData.betalmetoder, kort: e.target.checked }
                        })}
                      />
                      Kort
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={kassaData.betalmetoder.swish}
                        onChange={(e) => setKassaData({
                          ...kassaData,
                          betalmetoder: { ...kassaData.betalmetoder, swish: e.target.checked }
                        })}
                      />
                      Swish
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={kassaData.betalmetoder.kontant}
                        onChange={(e) => setKassaData({
                          ...kassaData,
                          betalmetoder: { ...kassaData.betalmetoder, kontant: e.target.checked }
                        })}
                      />
                      Kontant
                    </label>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#06b6d4' }}>
                  Kassaplatser
                </h3>

                {kassaData.kassaplatser.map((kassa, index) => (
                  <div key={index} className="repeatable-item">
                    {kassaData.kassaplatser.length > 1 && (
                      <button
                        className="btn btn-secondary"
                        style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => removeItem(setKassaData, kassaData, 'kassaplatser', index)}
                        title="Ta bort"
                      >
                        ×
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Plats/Namn
                        </label>
                        <input
                          className="input-field"
                          value={kassa.platsNamn}
                          onChange={(e) => updateItem(setKassaData, kassaData, 'kassaplatser', index, 'platsNamn', e.target.value)}
                          placeholder="Kassa 1"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Hårdvara
                        </label>
                        <input
                          className="input-field"
                          value={kassa.hardvara}
                          onChange={(e) => updateItem(setKassaData, kassaData, 'kassaplatser', index, 'hardvara', e.target.value)}
                          placeholder="iPad, Terminal, PC"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Kvittoskrivare
                        </label>
                        <input
                          className="input-field"
                          value={kassa.skrivare}
                          onChange={(e) => updateItem(setKassaData, kassaData, 'kassaplatser', index, 'skrivare', e.target.value)}
                          placeholder="Ja/Nej, modell"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Kortläsare
                        </label>
                        <input
                          className="input-field"
                          value={kassa.kortlasare}
                          onChange={(e) => updateItem(setKassaData, kassaData, 'kassaplatser', index, 'kortlasare', e.target.value)}
                          placeholder="Ja/Nej, modell"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Streckkodsläsare
                        </label>
                        <input
                          className="input-field"
                          value={kassa.streckkod}
                          onChange={(e) => updateItem(setKassaData, kassaData, 'kassaplatser', index, 'streckkod', e.target.value)}
                          placeholder="Ja/Nej"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KÖRJOURNAL */}
            {services.korjournal && (
              <div className="form-section">
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🚗</span>
                  Körjournal
                </h2>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#06b6d4', margin: 0 }}>Fordon</h3>
                    <button
                      className="btn btn-add"
                      onClick={() => addItem(
                        setKorjournalData,
                        korjournalData,
                        'fordon',
                        { regnr: '', marke: '', modell: '', milersattning: '' }
                      )}
                    >
                      + Lägg till fordon
                    </button>
                  </div>

                  {korjournalData.fordon.map((fordon, index) => (
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

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Registreringsnummer
                          </label>
                          <input
                            className="input-field"
                            value={fordon.regnr}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'fordon', index, 'regnr', e.target.value)}
                            placeholder="ABC123"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Märke
                          </label>
                          <input
                            className="input-field"
                            value={fordon.marke}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'fordon', index, 'marke', e.target.value)}
                            placeholder="Volvo"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Modell
                          </label>
                          <input
                            className="input-field"
                            value={fordon.modell}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'fordon', index, 'modell', e.target.value)}
                            placeholder="V90"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Milersättning (kr)
                          </label>
                          <input
                            className="input-field"
                            value={fordon.milersattning}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'fordon', index, 'milersattning', e.target.value)}
                            placeholder="18.50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#06b6d4', margin: 0 }}>Förare</h3>
                    <button
                      className="btn btn-add"
                      onClick={() => addItem(
                        setKorjournalData,
                        korjournalData,
                        'forare',
                        { namn: '', personnummer: '', korkort: '', mobil: '' }
                      )}
                    >
                      + Lägg till förare
                    </button>
                  </div>

                  {korjournalData.forare.map((forare, index) => (
                    <div key={index} className="repeatable-item">
                      {korjournalData.forare.length > 1 && (
                        <button
                          className="btn btn-secondary"
                          style={{ position: 'absolute', top: '12px', right: '12px' }}
                          onClick={() => removeItem(setKorjournalData, korjournalData, 'forare', index)}
                          title="Ta bort"
                        >
                          ×
                        </button>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Namn
                          </label>
                          <input
                            className="input-field"
                            value={forare.namn}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'forare', index, 'namn', e.target.value)}
                            placeholder="Anna Andersson"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Personnummer
                          </label>
                          <input
                            className="input-field"
                            value={forare.personnummer}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'forare', index, 'personnummer', e.target.value)}
                            placeholder="YYYYMMDD-XXXX"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Körkortsnummer
                          </label>
                          <input
                            className="input-field"
                            value={forare.korkort}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'forare', index, 'korkort', e.target.value)}
                            placeholder="XXXXXXXXXX"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Mobilnummer
                          </label>
                          <input
                            className="input-field"
                            value={forare.mobil}
                            onChange={(e) => updateItem(setKorjournalData, korjournalData, 'forare', index, 'mobil', e.target.value)}
                            placeholder="070-XXX XX XX"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button */}
            <div style={{
              position: 'sticky',
              bottom: '24px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3), 0 0 40px rgba(6, 182, 212, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                    Redo att skicka order?
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Mejl skickas till abbe@easypartner.se
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

              {Object.keys(errors).length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#fca5a5'
                }}>
                  <span>⚠️</span>
                  <span>Vänligen fyll i alla obligatoriska fält innan du skickar</span>
                </div>
              )}
            </div>
          </>
        )}

        {!anyServiceSelected && (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
            <div style={{ fontSize: '18px', fontWeight: '500' }}>
              Välj minst en tjänst för att komma igång
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SalesOrderApp />);
