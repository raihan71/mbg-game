export default function Celebration({ color, school }) {
  return (
    <div
      className="celebration"
      role="img"
      aria-label={`Children in school uniforms cheering hooray at ${school}`}
    >
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i
            key={i}
            style={{
              "--i": i,
              left: `${(i * 43) % 100}%`,
              background: ["#f47f6c", "#f0c65d", "#75af9b", "#91ace1"][i % 4],
            }}
          />
        ))}
      </div>
      <div className="hooray">Hooray! Lunch is here!</div>
      <div className="school-kids" aria-hidden="true">
        {["#b87850", "#e5ad83", "#915b3f", "#d79c70", "#c88f67"].map(
          (skin, i) => (
            <svg key={skin} viewBox="0 0 110 160" style={{ "--i": i }}>
              <ellipse
                cx="55"
                cy="152"
                rx="32"
                ry="5"
                fill="#000"
                opacity=".08"
              />
              <path
                d="M43 112v29m24-29v29"
                stroke={skin}
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M35 145h15m12 0h15"
                stroke="#303d43"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d={
                  i % 2 ? "M32 93h46l8 31H24z" : "M33 94h44v28H58v-13h-6v13H33z"
                }
                fill={color}
              />
              <path
                d="M34 70L16 48 8 28m68 42 18-22 8-20"
                stroke={skin}
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M34 63h42l7 37H27z"
                fill="white"
                stroke="#d7dedb"
                strokeWidth="2"
              />
              <path d="m43 63 12 11 12-11-12 31z" fill={color} />
              <rect x="49" y="51" width="12" height="16" rx="5" fill={skin} />
              <circle cx="55" cy="34" r="26" fill="#352a26" />
              <circle cx="55" cy="37" r="22" fill={skin} />
              <path
                d="M33 31q0-31 36-16l10 18-19-10-10 9-4-11z"
                fill="#352a26"
              />
              <path
                d="m42 37 5-2 4 2m9 0 5-2 4 2"
                fill="none"
                stroke="#352a26"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path d="M46 45q9 15 18 0z" fill="white" />
            </svg>
          ),
        )}
      </div>
    </div>
  );
}
