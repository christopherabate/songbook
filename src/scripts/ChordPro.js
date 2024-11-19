const notes = [
  ["C", "B#", "B♯"],
  ["C#", "C♯", "Db", "D♭"],
  ["D"],
  ["Eb", "E♭", "D#", "D♯"],
  ["E", "Fb", "F♭"],
  ["F", "E#", "E♯"],
  ["F#", "F♯", "Gb", "G♭"],
  ["G"],
  ["Ab", "A♭", "G#", "G♯"],
  ["A"],
  ["Bb", "B♭", "A#", "A♯"],
  ["B", "Cb", "C♭"]
];

export const toHTML = (score) => {
  return score
    .replace(/^( +)/gm, spaces => spaces.replace(/ /g, '&nbsp;'))
    .replace(/^#(.*)$/gm, '<div class="hidden">$1</div>')
    .replace(/\n?\s*{(start_of_|so)(\w+)(?::\s*(.*?))?\s*}\s*([\s\S]*?)\s*\n?\{(end_of_|eo)(\2)\}\s*/g, (match, prefix, section, title, content) => {
      return title
        ? `<div class="section ${section}"><div class="section-title">${title.trim()}</div>${content.replace(/ /g, '&nbsp;')}</div>`
        : `<div class="section ${section}">${content.replace(/ /g, '&nbsp;')}</div>`;
    }) // section
    .replace(/\n?\s*{define:\s*(.*?)\s+keys\s*([\d\s]*)\}\s*/g, (match, note, keys) => {
      return `<div class="section definition keys"><span class="note">${note.trim()}</span>${defineKeys({ note, keys: keys ? keys.trim().split(/\s+/).map(Number) : [0] })}</div>`;
    }) // keys definition
    .replace(/\n?\s*{define:\s*(.*?)\s+base-fret\s+(\d+)\s+frets\s+([-0-9xX\s]+)(?:\s+fingers\s+([-0-9A-Za-z\s]+))?\}\s*/g, (match, note, baseFret, frets, fingers) => {
      const fretsArray = frets.trim() ? frets.trim().split(/\s+/).map(pos => (pos === 'x' || pos === 'X' || pos === '-1' ? -1 : parseInt(pos, 10))) : [0];
      const fingersArray = fingers ? fingers.trim().split(/\s+/).map(pos => (pos === 'x' || pos === 'X' || pos === '-' ? null : pos)) : [];
      return `<div class="section definition frets"><span class="note">${note.trim()}</span>${defineFrets({ note, baseFret: parseInt(baseFret, 10), frets: fretsArray, fingers: fingersArray })}</div>`;
    }) // frets definition
    .replace(/\n?\s*{(\w+)(?::\s*(.*?))?\s*}\s*/g, '<div class="meta $1">$2</div>') // meta
    .replace(/\[(.*?)\]/g, '<span class="chord">$1</span>') // chords
    .replace(/\n/g, '<br />') // split line
};

export const wrap = (textarea, before, after, placeholder = '') => {
  const { selectionStart: start, selectionEnd: end, value } = textarea || {};

  if (textarea && start !== undefined && end !== undefined) {
    const selectedText = start === end ? placeholder : value.substring(start, end);

    requestAnimationFrame(() => {
      textarea.focus();
      (start !== end)
        ? textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
        : textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
    });

    return value.slice(0, start) + before + selectedText + after + value.slice(end);
  }
};

export const defineFrets = (definition) => {
  return [...Array(6)].map((_, string) => // 6 strings
    `<div class="string" data-base="${definition.baseFret}" data-string="${string}">${
      [...Array(5)].map((_, fret) => { // 5 frets
        const dataFret =
          definition.frets[string] === -1 && fret === 0
            ? '⨉'
            : definition.frets[string] === 0 && fret === 0
              ? '⭘'
              : definition.frets[string] === fret
                ? (definition.fingers[string] || ' ')
                : '';
        return `<div class="fret ${dataFret ? 'active' : ''}" data-fret="${definition.baseFret + fret}" data-position="${dataFret}"></div>`
      }).join('')
    }</div>`
  ).join('');
};

export const defineKeys = (definition) => {
  const root = notes.findIndex(group => group.includes((definition.note.toUpperCase().match(/^[A-G](#|b|♯|♭)?/) || ['C'])[0])) ?? 0;
  const keys = definition.keys.map(interval => root + interval);
  
  return [...Array(2 * 12)].map((_, note) => // 2 octaves
    `<div class="key ${[1, 3, 6, 8, 10].includes(note % 12) ? 'black-key' : 'white-key'} ${keys.includes(note) ? 'active' : ''}" data-note="${notes[note % 12][0]}"></div>`
  ).join('');
};