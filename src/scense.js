
const SCENES = {
    street: `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="240" fill="#d8eef8"/>
      <rect x="0" y="170" width="480" height="70" fill="#a8b4c0"/>
      <rect x="0" y="162" width="480" height="12" fill="#8890a0"/>
      <rect x="55" y="55" width="110" height="115" fill="#b8cedd" rx="4"/>
      <rect x="55" y="36" width="110" height="24" fill="#9ab5cc" rx="3"/>
      <rect x="68" y="66" width="24" height="28" fill="#6a8faf" rx="2"/>
      <rect x="108" y="66" width="24" height="28" fill="#6a8faf" rx="2"/>
      <rect x="80" y="105" width="22" height="65" fill="#83aec8" rx="2"/>
      <rect x="290" y="48" width="145" height="122" fill="#cec8e0" rx="4"/>
      <rect x="290" y="28" width="145" height="24" fill="#b0a8d4" rx="3"/>
      <rect x="302" y="60" width="27" height="30" fill="#8a7fc0" rx="2"/>
      <rect x="350" y="60" width="27" height="30" fill="#8a7fc0" rx="2"/>
      <rect x="398" y="60" width="27" height="30" fill="#8a7fc0" rx="2"/>
      <rect x="308" y="100" width="23" height="70" fill="#a098cc" rx="2"/>
      <circle cx="198" cy="84" r="21" fill="#4caf50"/>
      <rect x="193" y="104" width="9" height="60" fill="#6d4c41"/>
      <circle cx="235" cy="80" r="17" fill="#66bb6a"/>
      <rect x="230" y="97" width="8" height="65" fill="#795548"/>
      <rect x="148" y="175" width="70" height="30" rx="5" fill="#ef5350"/>
      <rect x="154" y="180" width="16" height="20" fill="#c62828" rx="1"/>
      <circle cx="158" cy="207" r="5" fill="#1a1a1a"/>
      <circle cx="210" cy="207" r="5" fill="#1a1a1a"/>
      <rect x="167" y="182" width="15" height="10" fill="#90caf9" rx="1"/>
      <rect x="345" y="173" width="55" height="24" rx="5" fill="#42a5f5"/>
      <circle cx="352" cy="199" r="4" fill="#111"/>
      <circle cx="392" cy="199" r="4" fill="#111"/>
      <rect x="354" y="176" width="13" height="8" fill="#bbdefb" rx="1"/>
      <rect x="257" y="100" width="7" height="62" fill="#78909c"/>
      <rect x="249" y="94" width="23" height="12" rx="2" fill="#37474f"/>
      <rect x="252" y="96" width="8" height="8" fill="#4caf50" opacity="0.9"/>
      <rect x="260" y="96" width="8" height="8" fill="#f44336" opacity="0.9"/>
      <ellipse cx="114" cy="185" rx="9" ry="22" fill="#5c6bc0"/>
      <circle cx="114" cy="161" r="8" fill="#ffcc80"/>
    </svg>`,
  
    kitchen: `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="240" fill="#f5ede0"/>
      <rect x="0" y="175" width="480" height="65" fill="#c8b89a"/>
      <rect x="0" y="0" width="480" height="10" fill="#d4c8b0"/>
      <rect x="18" y="10" width="125" height="165" rx="4" fill="#e8ddd0" stroke="#c8b89a" stroke-width="2"/>
      <rect x="23" y="15" width="52" height="72" rx="2" fill="#a8d8f0" opacity="0.7"/>
      <rect x="80" y="15" width="57" height="72" rx="2" fill="#a8d8f0" opacity="0.7"/>
      <rect x="23" y="100" width="115" height="12" rx="2" fill="#c8b89a"/>
      <rect x="62" y="95" width="8" height="8" rx="4" fill="#888"/>
      <rect x="337" y="28" width="125" height="195" rx="4" fill="#d4c8b0" stroke="#b8a88a" stroke-width="2"/>
      <rect x="342" y="33" width="115" height="88" rx="2" fill="#c0d8e8" opacity="0.6"/>
      <rect x="342" y="128" width="115" height="88" rx="2" fill="#b8a070" opacity="0.3"/>
      <rect x="368" y="84" width="18" height="8" rx="4" fill="#888"/>
      <rect x="158" y="98" width="172" height="72" rx="4" fill="#d0c0a8" stroke="#b8a88a" stroke-width="2"/>
      <ellipse cx="189" cy="88" rx="21" ry="4" fill="#888" opacity="0.5"/>
      <ellipse cx="241" cy="88" rx="21" ry="4" fill="#888" opacity="0.5"/>
      <ellipse cx="193" cy="90" rx="25" ry="25" fill="none" stroke="#777" stroke-width="2.5"/>
      <ellipse cx="244" cy="90" rx="25" ry="25" fill="none" stroke="#777" stroke-width="2.5"/>
      <rect x="158" y="96" width="172" height="8" rx="2" fill="#b8a88a"/>
      <rect x="193" y="175" width="94" height="50" rx="4" fill="#c8a060"/>
      <rect x="208" y="180" width="26" height="35" rx="2" fill="#d4b070"/>
      <rect x="246" y="180" width="26" height="35" rx="2" fill="#d4b070"/>
      <rect x="158" y="175" width="30" height="50" rx="2" fill="#b89060"/>
      <rect x="292" y="175" width="30" height="50" rx="2" fill="#b89060"/>
      <rect x="106" y="58" width="46" height="58" rx="4" fill="#6a9a50"/>
      <ellipse cx="129" cy="52" rx="21" ry="29" fill="#5a8840"/>
      <ellipse cx="117" cy="56" rx="13" ry="19" fill="#4a7830"/>
      <ellipse cx="141" cy="50" rx="15" ry="21" fill="#6aaa55"/>
      <rect x="125" y="86" width="8" height="30" rx="3" fill="#8b5e3c"/>
    </svg>`,
  
    nature: `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="240" fill="#87ceeb"/>
      <ellipse cx="80" cy="55" rx="50" ry="25" fill="white" opacity="0.85"/>
      <ellipse cx="60" cy="58" rx="35" ry="20" fill="white" opacity="0.9"/>
      <ellipse cx="320" cy="40" rx="60" ry="28" fill="white" opacity="0.8"/>
      <ellipse cx="350" cy="44" rx="40" ry="22" fill="white" opacity="0.85"/>
      <ellipse cx="420" cy="60" rx="38" ry="18" fill="white" opacity="0.75"/>
      <circle cx="240" cy="35" r="32" fill="#f5d76e"/>
      <polygon points="0,200 120,100 240,160 360,80 480,120 480,240 0,240" fill="#4a7a30"/>
      <polygon points="0,200 80,130 160,170 240,160 480,120 480,240 0,240" fill="#5a8a3a"/>
      <polygon points="80,130 120,80 160,110 120,100" fill="#5c8a40"/>
      <polygon points="160,80 200,40 240,70 200,65" fill="#4a7030"/>
      <polygon points="280,110 320,60 360,100 320,90" fill="#5a8040"/>
      <polygon points="360,80 400,30 440,70 400,60" fill="#4a7030"/>
      <rect x="116" y="106" width="8" height="90" fill="#6d4c41"/>
      <rect x="196" y="68" width="8" height="130" fill="#5c3a28"/>
      <rect x="316" y="88" width="8" height="120" fill="#6d4c41"/>
      <rect x="396" y="68" width="8" height="130" fill="#5c3a28"/>
      <path d="M0,190 Q60,175 120,188 Q180,200 240,185 Q300,170 360,182 Q420,194 480,180 L480,240 L0,240Z" fill="#3a6020"/>
      <ellipse cx="60" cy="225" rx="8" ry="4" fill="#ff6b6b" opacity="0.8"/>
      <ellipse cx="200" cy="218" rx="6" ry="3" fill="#ffd93d" opacity="0.9"/>
      <ellipse cx="380" cy="222" rx="7" ry="3.5" fill="#ff6b6b" opacity="0.8"/>
      <path d="M370,90 Q380,80 395,88" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M395,88 Q405,78 415,84" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="372" cy="89" r="2" fill="#333"/>
      <circle cx="414" cy="84" r="2" fill="#333"/>
    </svg>`,
  
    desk: `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="240" fill="#e8e0d8"/>
      <rect x="0" y="150" width="480" height="90" fill="#c8b8a0"/>
      <rect x="0" y="142" width="480" height="12" rx="2" fill="#b0a090"/>
      <rect x="30" y="35" width="4" height="110" fill="#a09080"/>
      <rect x="446" y="35" width="4" height="110" fill="#a09080"/>
      <rect x="28" y="30" width="424" height="8" rx="2" fill="#c8b898"/>
      <rect x="75" y="155" width="330" height="20" rx="2" fill="#b0a090"/>
      <rect x="85" y="50" width="170" height="95" rx="6" fill="#1a1a2e"/>
      <rect x="87" y="52" width="166" height="91" rx="4" fill="#16213e"/>
      <rect x="90" y="55" width="160" height="85" rx="3" fill="#0f3460"/>
      <rect x="95" y="60" width="150" height="75" rx="2" fill="#1a1a2e"/>
      <rect x="160" y="145" width="30" height="6" rx="2" fill="#333"/>
      <rect x="140" y="151" width="70" height="4" rx="2" fill="#555"/>
      <rect x="270" y="60" width="160" height="100" rx="6" fill="#2d2d2d"/>
      <rect x="273" y="63" width="154" height="94" rx="4" fill="#1a1a2e"/>
      <rect x="276" y="66" width="148" height="88" rx="2" fill="#0a0a1a"/>
      <rect x="395" y="155" width="20" height="8" rx="2" fill="#444"/>
      <rect x="75" y="152" width="155" height="10" rx="3" fill="#333"/>
      <rect x="76" y="158" width="3" height="4" rx="1" fill="#555"/>
      <rect x="82" y="158" width="3" height="4" rx="1" fill="#555"/>
      <rect x="30" y="152" width="40" height="10" rx="3" fill="#555"/>
      <ellipse cx="50" cy="148" rx="16" ry="16" fill="none" stroke="#888" stroke-width="1.5"/>
      <rect x="47" y="132" width="6" height="18" rx="3" fill="#aaa"/>
      <ellipse cx="50" cy="148" rx="3" ry="3" fill="#888"/>
      <rect x="390" y="100" width="55" height="55" rx="4" fill="#8b5e3c"/>
      <rect x="395" y="90" width="45" height="12" rx="2" fill="#9b6e4c"/>
      <rect x="30" y="95" width="40" height="55" rx="2" fill="#e8f0f8" stroke="#ccc" stroke-width="1.5"/>
      <line x1="35" y1="108" x2="65" y2="108" stroke="#aac0d8" stroke-width="1.5"/>
      <line x1="35" y1="116" x2="65" y2="116" stroke="#aac0d8" stroke-width="1.5"/>
      <line x1="35" y1="124" x2="55" y2="124" stroke="#aac0d8" stroke-width="1.5"/>
      <rect x="28" y="90" width="4" height="60" rx="2" fill="#666"/>
      <rect x="420" y="50" width="40" height="55" rx="2" fill="#2d6a4f"/>
      <ellipse cx="440" cy="44" rx="18" ry="24" fill="#40916c"/>
      <ellipse cx="430" cy="50" rx="12" ry="18" fill="#52b788"/>
      <ellipse cx="452" cy="46" rx="13" ry="20" fill="#2d6a4f"/>
      <rect x="437" y="72" width="6" height="35" rx="3" fill="#8b5e3c"/>
    </svg>`,
  
    beach: `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="240" fill="#87ceeb"/>
      <rect x="0" y="120" width="480" height="120" fill="#f4d06f"/>
      <rect x="0" y="120" width="480" height="55" fill="#1a78c2" opacity="0.7"/>
      <path d="M0,148 Q60,135 120,148 Q180,161 240,148 Q300,135 360,148 Q420,161 480,148 L480,175 L0,175Z" fill="#2196f3" opacity="0.5"/>
      <path d="M0,160 Q80,148 160,160 Q240,172 320,160 Q400,148 480,160 L480,200 L0,200Z" fill="#1565c0" opacity="0.3"/>
      <ellipse cx="400" cy="60" rx="38" ry="38" fill="#ffb347"/>
      <polygon points="90,40 80,120 100,120" fill="#8b5e3c"/>
      <ellipse cx="80" cy="38" rx="22" ry="30" fill="#66bb6a"/>
      <ellipse cx="90" cy="30" rx="18" ry="26" fill="#4caf50"/>
      <polygon points="310,55 300,120 320,120" fill="#7a4e2c"/>
      <ellipse cx="300" cy="53" rx="20" ry="28" fill="#66bb6a"/>
      <ellipse cx="312" cy="44" rx="17" ry="24" fill="#4caf50"/>
      <polygon points="165,30 163,100 175,100 173,30" fill="#c62828" stroke="#fff" stroke-width="2"/>
      <polygon points="163,30 175,30 175,55 163,55" fill="#e53935"/>
      <polygon points="175,30 200,42 175,55" fill="#fff"/>
      <ellipse cx="240" cy="185" rx="40" ry="10" fill="#e8c860" opacity="0.5"/>
      <ellipse cx="120" cy="192" rx="18" ry="8" fill="#c8b040" opacity="0.4"/>
      <ellipse cx="360" cy="188" rx="25" ry="7" fill="#c8b040" opacity="0.4"/>
      <ellipse cx="180" cy="175" rx="50" ry="18" fill="#e8d070" opacity="0.6"/>
      <path d="M370,85 Q395,75 410,85 L400,100 Q385,108 370,100Z" fill="#ff6b6b"/>
      <path d="M380,72 Q395,62 410,72" fill="none" stroke="#ddd" stroke-width="2" stroke-linecap="round"/>
      <circle cx="395" cy="84" r="3" fill="#c62828"/>
      <path d="M355,100 Q375,94 395,100" fill="none" stroke="#ddd" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
  
    city: `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="240" fill="#c8d8e8"/>
      <rect x="0" y="190" width="480" height="50" fill="#909090"/>
      <rect x="0" y="183" width="480" height="10" fill="#808080"/>
      <rect x="180" y="20" width="60" height="175" fill="#a0a8b8"/>
      <rect x="183" y="23" width="54" height="172" fill="#b0b8c8"/>
      <rect x="186" y="30" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="200" y="30" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="214" y="30" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="186" y="52" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="200" y="52" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="214" y="52" width="10" height="14" fill="#f5d76e" opacity="0.9"/>
      <rect x="186" y="74" width="10" height="14" fill="#f5d76e" opacity="0.9"/>
      <rect x="200" y="74" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="214" y="74" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="210" y="10" width="6" height="14" fill="#888"/>
      <rect x="270" y="55" width="50" height="140" fill="#9098a8"/>
      <rect x="273" y="58" width="44" height="137" fill="#a0a8b8"/>
      <rect x="276" y="64" width="8" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="288" y="64" width="8" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="300" y="64" width="8" height="12" fill="#f5d76e" opacity="0.9"/>
      <rect x="276" y="82" width="8" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="288" y="82" width="8" height="12" fill="#f5d76e" opacity="0.9"/>
      <rect x="300" y="82" width="8" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="100" y="80" width="70" height="115" fill="#a8b0c0"/>
      <rect x="103" y="83" width="64" height="112" fill="#b8c0d0"/>
      <rect x="107" y="90" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="122" y="90" width="10" height="14" fill="#f5d76e" opacity="0.9"/>
      <rect x="137" y="90" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="107" y="112" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="122" y="112" width="10" height="14" fill="#d4e8f0" opacity="0.8"/>
      <rect x="137" y="112" width="10" height="14" fill="#f5d76e" opacity="0.9"/>
      <rect x="330" y="100" width="45" height="95" fill="#98a0b0"/>
      <rect x="333" y="103" width="39" height="92" fill="#a8b0c0"/>
      <rect x="337" y="110" width="8" height="10" fill="#d4e8f0" opacity="0.8"/>
      <rect x="350" y="110" width="8" height="10" fill="#f5d76e" opacity="0.9"/>
      <rect x="337" y="126" width="8" height="10" fill="#f5d76e" opacity="0.9"/>
      <rect x="350" y="126" width="8" height="10" fill="#d4e8f0" opacity="0.8"/>
      <rect x="390" y="115" width="80" height="80" fill="#8890a0"/>
      <rect x="393" y="118" width="74" height="77" fill="#9098a8"/>
      <rect x="397" y="124" width="9" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="412" y="124" width="9" height="12" fill="#f5d76e" opacity="0.9"/>
      <rect x="427" y="124" width="9" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="0" y="115" width="95" height="80" fill="#9098a8"/>
      <rect x="3" y="118" width="89" height="77" fill="#a0a8b8"/>
      <rect x="8" y="124" width="9" height="12" fill="#f5d76e" opacity="0.9"/>
      <rect x="22" y="124" width="9" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="8" y="142" width="9" height="12" fill="#d4e8f0" opacity="0.8"/>
      <rect x="22" y="142" width="9" height="12" fill="#f5d76e" opacity="0.9"/>
      <line x1="0" y1="192" x2="480" y2="192" stroke="white" stroke-width="2" stroke-dasharray="30,20" opacity="0.4"/>
      <rect x="30" y="175" width="14" height="20" rx="2" fill="#ef5350"/>
      <circle cx="37" cy="218" r="5" fill="#222"/>
      <rect x="375" y="175" width="14" height="20" rx="2" fill="#42a5f5"/>
      <circle cx="382" cy="218" r="5" fill="#222"/>
      <rect x="144" y="175" width="8" height="18" fill="#555"/>
      <rect x="137" y="170" width="22" height="10" rx="2" fill="#ffc107" opacity="0.8"/>
    </svg>`
  };

  
export default SCENES;