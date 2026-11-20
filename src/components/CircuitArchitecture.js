import React from 'react';
import '../styles/CircuitArchitecture.css';

function SignalWire({ points, value, label, labelX, labelY }) {
  const active = value === 1;
  return (
    <g className={active ? 'ca-signal ca-signal-on' : 'ca-signal'}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {label && (
        <g className="ca-wire-label" transform={`translate(${labelX} ${labelY})`}>
          <rect x="-12" y="-13" width="24" height="24" rx="7" />
          <text textAnchor="middle" dominantBaseline="central">{value === undefined ? '–' : value}</text>
        </g>
      )}
    </g>
  );
}

function GateNode({ x, y, name, expression, output }) {
  return (
    <g className={`ca-gate ${output === 1 ? 'ca-gate-on' : ''}`} transform={`translate(${x} ${y})`}>
      <rect width="104" height="58" rx="12" />
      <text className="ca-gate-name" x="52" y="24" textAnchor="middle">{name}</text>
      <text className="ca-gate-expression" x="52" y="42" textAnchor="middle">{expression}</text>
      <circle className="ca-gate-port" cx="0" cy="29" r="4" />
      <circle className="ca-gate-port" cx="104" cy="29" r="4" />
    </g>
  );
}

function OutputNode({ x, y, label, value }) {
  return (
    <g className={`ca-output ${value === 1 ? 'ca-output-on' : ''}`} transform={`translate(${x} ${y})`}>
      <rect width="76" height="58" rx="12" />
      <text x="38" y="19" textAnchor="middle">{label}</text>
      <text className="ca-output-value" x="38" y="43" textAnchor="middle">{value === undefined ? '–' : value}</text>
    </g>
  );
}

export default function CircuitArchitecture({ mode, inputs, result }) {
  const isFull = mode === 'full';
  const matches = result && (
    isFull
      ? result.mode === 'fullAdder' && result.a === inputs.a && result.b === inputs.b && result.carryIn === inputs.carryIn
      : result.mode === 'halfAdder' && result.a === inputs.a && result.b === inputs.b
  );
  const r = matches ? result : {};
  const sum = matches ? r.sum : undefined;
  const carry = matches ? (isFull ? r.carryOut : r.carry) : undefined;

  return (
    <section className="ca-panel" aria-labelledby="ca-title">
      <div className="ca-heading-row">
        <div>
          <span className="ca-kicker">04 / GATE-LEVEL BREAKDOWN</span>
          <h2 id="ca-title">Visual Circuit Architecture</h2>
          <p>Follow each binary signal through the actual gates used by the C++ adder engine.</p>
        </div>
        <span className="ca-live-tag">{isFull ? 'FULL ADDER' : 'HALF ADDER'}</span>
      </div>

      <div className="ca-input-summary">
        <span>INPUT A <b>{inputs.a}</b></span>
        <span>INPUT B <b>{inputs.b}</b></span>
        {isFull && <span>CARRY IN <b>{inputs.carryIn}</b></span>}
        {!matches && <em>Calculate the adder above to load C++ gate outputs.</em>}
        {matches && <em className="ca-confirmed">C++ gate-level results received</em>}
      </div>

      <div className="ca-diagram-wrap">
        {isFull ? (
          <svg className="ca-diagram ca-full-diagram" viewBox="0 0 790 310" role="img" aria-label="Full adder circuit with two XOR gates, two AND gates and one OR gate">
            <text className="ca-input-label" x="18" y="66">A = {inputs.a}</text>
            <text className="ca-input-label" x="18" y="220">B = {inputs.b}</text>
            <text className="ca-input-label" x="290" y="25">Cin = {inputs.carryIn}</text>
            <SignalWire points="18,82 95,82 95,88 170,88" value={matches ? inputs.a : undefined} />
            <SignalWire points="18,205 95,205 95,117 170,117" value={matches ? inputs.b : undefined} />
            <SignalWire points="18,82 75,82 75,192 170,192" value={matches ? inputs.a : undefined} />
            <SignalWire points="18,205 115,205 115,221 170,221" value={matches ? inputs.b : undefined} />
            <GateNode x={170} y={74} name="XOR 1" expression="A ⊕ B" output={matches ? r.xor1 : undefined} />
            <GateNode x={170} y={178} name="AND 1" expression="A · B" output={matches ? r.and1 : undefined} />
            <SignalWire points="274,103 330,103 330,91 420,91" value={matches ? r.xor1 : undefined} label labelX={350} labelY={88} />
            <SignalWire points="274,103 330,103 330,204 420,204" value={matches ? r.xor1 : undefined} />
            <SignalWire points="340,35 380,35 380,105 420,105" value={matches ? inputs.carryIn : undefined} />
            <SignalWire points="340,35 395,35 395,218 420,218" value={matches ? inputs.carryIn : undefined} />
            <GateNode x={420} y={74} name="XOR 2" expression="P ⊕ Cin" output={matches ? r.xor2 : undefined} />
            <GateNode x={420} y={178} name="AND 2" expression="P · Cin" output={matches ? r.and2 : undefined} />
            <SignalWire points="274,207 560,207 560,165 610,165" value={matches ? r.and1 : undefined} label labelX={500} labelY={193} />
            <SignalWire points="524,207 565,207 565,188 610,188" value={matches ? r.and2 : undefined} label labelX={548} labelY={226} />
            <GateNode x={610} y={148} name="OR 1" expression="G + H" output={matches ? r.or1 : undefined} />
            <SignalWire points="524,103 680,103 680,70 710,70" value={matches ? r.xor2 : undefined} label labelX={650} labelY={88} />
            <SignalWire points="714,177 750,177" value={matches ? r.or1 : undefined} />
            <OutputNode x={710} y={41} label="SUM" value={sum} />
            <OutputNode x={710} y={148} label="CARRY" value={carry} />
            <text className="ca-stage-note" x="170" y="270">Stage 1: Generate P and G</text>
            <text className="ca-stage-note" x="420" y="270">Stage 2: Generate SUM and H</text>
            <text className="ca-stage-note" x="610" y="270">Stage 3: Combine carry</text>
          </svg>
        ) : (
          <svg className="ca-diagram ca-half-diagram" viewBox="0 0 680 245" role="img" aria-label="Half adder circuit with XOR sum gate and AND carry gate">
            <text className="ca-input-label" x="18" y="72">A = {inputs.a}</text>
            <text className="ca-input-label" x="18" y="190">B = {inputs.b}</text>
            <SignalWire points="18,88 125,88 125,78 205,78" value={matches ? inputs.a : undefined} />
            <SignalWire points="18,205 125,205 125,107 205,107" value={matches ? inputs.b : undefined} />
            <SignalWire points="18,88 95,88 95,172 205,172" value={matches ? inputs.a : undefined} />
            <SignalWire points="18,205 145,205 145,201 205,201" value={matches ? inputs.b : undefined} />
            <GateNode x={205} y={63} name="XOR" expression="A ⊕ B" output={matches ? r.xor1 : undefined} />
            <GateNode x={205} y={158} name="AND" expression="A · B" output={matches ? r.and1 : undefined} />
            <SignalWire points="309,92 445,92 445,92 520,92" value={matches ? r.xor1 : undefined} label labelX={400} labelY={78} />
            <SignalWire points="309,187 445,187 445,187 520,187" value={matches ? r.and1 : undefined} label labelX={400} labelY={173} />
            <OutputNode x={520} y={63} label="SUM" value={sum} />
            <OutputNode x={520} y={158} label="CARRY" value={carry} />
            <text className="ca-stage-note" x="205" y="238">XOR produces Sum · AND produces Carry</text>
          </svg>
        )}
      </div>

      <div className="ca-legend">
        <span><i className="ca-legend-high" /> HIGH (1)</span>
        <span><i className="ca-legend-low" /> LOW (0)</span>
        <span>Wire values appear after calculation</span>
      </div>

      <div className="ca-equations">
        {isFull ? (
          <><div><small>INTERMEDIATE P</small><strong>P = A ⊕ B = {matches ? r.xor1 : '–'}</strong></div><div><small>SUM</small><strong>S = P ⊕ Cin = {sum === undefined ? '–' : sum}</strong></div><div><small>CARRY OUT</small><strong>Cout = (A·B) + (P·Cin) = {carry === undefined ? '–' : carry}</strong></div></>
        ) : (
          <><div><small>SUM</small><strong>S = A ⊕ B = {sum === undefined ? '–' : sum}</strong></div><div><small>CARRY</small><strong>C = A · B = {carry === undefined ? '–' : carry}</strong></div></>
        )}
      </div>
    </section>
  );
}
