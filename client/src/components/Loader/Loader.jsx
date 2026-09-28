/* eslint-disable react/prop-types */
import "./Loader.css";

const DOT_X = [36, 48, 60, 72, 84];

// Animated version of the app's favicon (the electricity meter): the
// indicator lights run in sequence, the bolt pulses, current flows through
// the wires and the reading bar fills.
const Loader = ({ style, visible, label = "Loading..." }) => {
  if (!visible) return null;

  return (
    <div className="spinner-div" style={style} role="status" aria-live="polite">
      <div className="meter-loader">
        <svg
          className="meter-loader-svg"
          viewBox="0 0 120 140"
          width="120"
          height="140"
          aria-hidden="true"
        >
          {/* Wires + connectors (drawn first so the terminal block covers their tops) */}
          <g className="meter-wires">
            {DOT_X.map((x, i) => (
              <path
                key={x}
                d={`M${x} 112 V124 Q${x} 132 ${x + (i - 2) * 3} 136`}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </g>
          {DOT_X.map((x) => (
            <rect key={x} className="meter-connector" x={x - 3} y="110" width="6" height="5" rx="1" />
          ))}

          {/* Terminal block */}
          <rect className="meter-terminal" x="24" y="84" width="72" height="30" rx="7" />
          {DOT_X.map((x) => (
            <g key={x}>
              <rect className="meter-socket" x={x - 5} y="91" width="10" height="17" rx="3" />
              <circle className="meter-socket-hole" cx={x} cy="96" r="2" />
              <circle className="meter-socket-hole" cx={x} cy="103" r="2" />
            </g>
          ))}

          {/* Casing */}
          <rect className="meter-casing-shadow" x="10" y="9" width="100" height="84" rx="16" />
          <rect className="meter-casing" x="10" y="5" width="100" height="84" rx="16" />

          {/* Face */}
          <rect className="meter-face" x="19" y="13" width="82" height="68" rx="9" />

          {/* Screen + bolt */}
          <rect className="meter-screen" x="28" y="19" width="64" height="25" rx="4" />
          <polygon className="meter-bolt" points="63,22 53,34 59,34 56,42 67,29.5 61,29.5" />

          {/* Indicator lights */}
          {DOT_X.map((x, i) => (
            <circle
              key={x}
              className={`meter-dot ${i % 2 ? "meter-dot-amber" : "meter-dot-green"}`}
              cx={x}
              cy="54"
              r="4.2"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}

          {/* Reading bar */}
          <rect className="meter-bar-track" x="34" y="64" width="52" height="3.5" rx="1.75" />
          <rect className="meter-bar-fill" x="34" y="64" width="52" height="3.5" rx="1.75" />
        </svg>
        {label && <span className="meter-loader-label">{label}</span>}
      </div>
    </div>
  );
};

export default Loader;
