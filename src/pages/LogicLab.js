import { useEffect, useMemo, useState } from 'react';
import '../styles/LogicLab.css';
import CircuitArchitecture from '../components/CircuitArchitecture';

// Local demo uses the C++ engine through the Node/Express API.
// For another host, set REACT_APP_LOGIC_LAB_API in Frontend/.env.
const API_BASE = (
  process.env.REACT_APP_LOGIC_LAB_API || 'http://localhost:5000/api/logic-lab'
).replace(/\/$/, '');

const GATES = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

async function postJSON(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

function BitSwitch({ label, value, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className={`ll-bit ${value ? 'is-on' : ''}`}
      onClick={() => onChange(value ? 0 : 1)}
      disabled={disabled}
      aria-pressed={Boolean(value)}
    >
      <span className="ll-bit-label">{label}</span>
      <span className="ll-bit-value">{value}</span>
      <span className="ll-bit-state">{value ? 'HIGH' : 'LOW'}</span>
    </button>
  );
}

export default function LogicLab() {
  const [gate, setGate] = useState('AND');
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [gateResult, setGateResult] = useState(null);
  const [truthTable, setTruthTable] = useState(null);
  const [adderInputs, setAdderInputs] = useState({ a: 1, b: 1, carryIn: 0 });
  const [adderMode, setAdderMode] = useState('half');
  const [adderResult, setAdderResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiState, setApiState] = useState('checking');

  const expression = useMemo(() => ({
    AND: 'A · B', OR: 'A + B', NOT: '¬A', NAND: '¬(A · B)',
    NOR: '¬(A + B)', XOR: 'A ⊕ B', XNOR: '¬(A ⊕ B)',
  }[gate]), [gate]);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/truth-table/${gate}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data.success === false) throw new Error(data.message || 'API unavailable');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setTruthTable(data.rows || []);
        setApiState('online');
        setError('');
      })
      .catch((err) => {
        if (!active) return;
        setApiState('offline');
        setTruthTable(null);
        setError(err.message || 'Cannot connect to the Logic Lab API.');
      });
    return () => { active = false; };
  }, [gate]);

  const evaluateGate = async () => {
    setLoading(true);
    setError('');
    try {
      const body = gate === 'NOT' ? { gate, a } : { gate, a, b };
      const data = await postJSON(`${API_BASE}/evaluate`, body);
      setGateResult(data);
      setApiState('online');
    } catch (err) {
      setError(err.message || 'Gate evaluation failed.');
      setApiState('offline');
    } finally {
      setLoading(false);
    }
  };

  const evaluateAdder = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = adderMode === 'half' ? 'half-adder' : 'full-adder';
      const body = adderMode === 'half'
        ? { a: adderInputs.a, b: adderInputs.b }
        : adderInputs;
      const data = await postJSON(`${API_BASE}/${endpoint}`, body);
      setAdderResult(data);
      setApiState('online');
    } catch (err) {
      setError(err.message || 'Adder calculation failed.');
      setApiState('offline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="logic-lab-page">
      <div className="ll-shell">
        <header className="ll-hero">
          <div>
            <div className="ll-eyebrow"><span className="ll-eyebrow-dot" /> REHANVERSE ENGINEERING LAB</div>
            <h1>Logic <span>Lab</span></h1>
            <p>Explore digital electronics through interactive logic gates, truth tables and arithmetic circuits — calculated by a C++17 engine.</p>
          </div>
          <div className={`ll-api-pill ${apiState}`}><span /> C++ ENGINE {apiState === 'online' ? 'CONNECTED' : apiState === 'checking' ? 'CONNECTING' : 'OFFLINE'}</div>
        </header>

        {error && <div className="ll-alert" role="alert"><strong>Engine connection issue:</strong> {error}<span> Make sure your local Node.js backend is running on port 5000.</span></div>}

        <section className="ll-section-grid">
          <article className="ll-panel ll-simulator">
            <div className="ll-panel-heading"><div><span className="ll-kicker">01 / INTERACTIVE SIMULATION</span><h2>Logic Gate Simulator</h2></div><span className="ll-chip">LIVE INPUT</span></div>
            <label className="ll-field-label" htmlFor="ll-gate">Select logic gate</label>
            <select id="ll-gate" className="ll-select" value={gate} onChange={(e) => { setGate(e.target.value); setGateResult(null); }}>
              {GATES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <div className="ll-circuit">
              <div className="ll-inputs">
                <BitSwitch label="INPUT A" value={a} onChange={setA} />
                {gate !== 'NOT' && <BitSwitch label="INPUT B" value={b} onChange={setB} />}
              </div>
              <div className="ll-wire"><span /><span /><span /></div>
              <div className="ll-gate-symbol"><span>{gate}</span><small>{expression}</small></div>
              <div className="ll-wire ll-wire-output"><span /><span /></div>
              <div className={`ll-output ${gateResult?.output ? 'is-on' : ''}`}><small>OUTPUT</small><strong>{gateResult ? gateResult.output : '?'}</strong><span>{gateResult ? (gateResult.output ? 'HIGH' : 'LOW') : 'NOT RUN'}</span></div>
            </div>
            <button className="ll-primary-btn" onClick={evaluateGate} disabled={loading}>{loading ? 'Processing…' : 'Evaluate with C++ Engine'} <span>→</span></button>
            <div className="ll-expression">Boolean expression <strong>{expression}</strong></div>
          </article>

          <article className="ll-panel ll-truth-panel">
            <div className="ll-panel-heading"><div><span className="ll-kicker">02 / LOGIC REFERENCE</span><h2>Truth Table</h2></div><span className="ll-chip">AUTO GENERATED</span></div>
            <p className="ll-muted">The C++ engine generates every possible input combination and its output.</p>
            {truthTable ? (
              <div className="ll-table-wrap"><table className="ll-table"><thead><tr><th>INPUT A</th>{gate !== 'NOT' && <th>INPUT B</th>}<th>OUTPUT</th></tr></thead><tbody>{truthTable.map((row, index) => <tr key={`${row.a}-${row.b}-${index}`}><td>{row.a}</td>{gate !== 'NOT' && <td>{row.b}</td>}<td><span className={`ll-result-bit ${row.output ? 'one' : ''}`}>{row.output}</span></td></tr>)}</tbody></table></div>
            ) : <div className="ll-empty">Waiting for C++ truth table…</div>}
            <div className="ll-table-foot"><span className="ll-live-dot" /> {truthTable ? `${truthTable.length} input combinations generated` : 'Connecting to engine'}</div>
          </article>
        </section>

        <section className="ll-panel ll-adder-panel">
          <div className="ll-panel-heading"><div><span className="ll-kicker">03 / COMBINATIONAL CIRCUITS</span><h2>Binary Adder Studio</h2></div><span className="ll-chip ll-chip-gold">CIRCUIT DESIGN</span></div>
          <div className="ll-adder-layout">
            <div className="ll-adder-controls">
              <div className="ll-segmented"><button className={adderMode === 'half' ? 'active' : ''} onClick={() => { setAdderMode('half'); setAdderResult(null); }}>Half Adder</button><button className={adderMode === 'full' ? 'active' : ''} onClick={() => { setAdderMode('full'); setAdderResult(null); }}>Full Adder</button></div>
              <div className="ll-adder-bits">
                <BitSwitch label="INPUT A" value={adderInputs.a} onChange={(v) => setAdderInputs((old) => ({ ...old, a: v }))} />
                <BitSwitch label="INPUT B" value={adderInputs.b} onChange={(v) => setAdderInputs((old) => ({ ...old, b: v }))} />
                {adderMode === 'full' && <BitSwitch label="CARRY IN" value={adderInputs.carryIn} onChange={(v) => setAdderInputs((old) => ({ ...old, carryIn: v }))} />}
              </div>
              <button className="ll-primary-btn" onClick={evaluateAdder} disabled={loading}>{loading ? 'Calculating…' : 'Calculate Adder'} <span>→</span></button>
            </div>
            <div className="ll-adder-result">
              <div className="ll-adder-result-title">CIRCUIT OUTPUT</div>
              <div className="ll-output-pair"><div><small>SUM</small><strong>{adderResult ? adderResult.sum : '–'}</strong></div><div><small>CARRY {adderMode === 'full' ? 'OUT' : ''}</small><strong>{adderResult ? (adderMode === 'half' ? adderResult.carry : adderResult.carryOut) : '–'}</strong></div></div>
              <p>{adderResult ? 'Result calculated by the C++ arithmetic circuit.' : 'Set the input bits and calculate to see the result.'}</p>
            </div>
          </div>
        </section>

        <CircuitArchitecture
          mode={adderMode}
          inputs={adderInputs}
          result={adderResult}
        />

        <footer className="ll-footer"><span>REHANVERSE LOGIC LAB</span><span>BUILT WITH C++17 · DIGITAL LOGIC & CIRCUITS</span></footer>
      </div>
    </main>
  );
}
