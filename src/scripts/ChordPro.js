export const toHTML = (score) => {
  return score
    .replace(/^( +)/gm, spaces => spaces.replace(/ /g, '&nbsp;'))
    .replace(/^#(.*)$/gm, '<div class="hidden">$1</div>')
    .replace(/\n?\s*{(start_of_|so)(\w+)(?::\s*(.*?))?\s*}\s*([\s\S]*?)\s*\n?\{(end_of_|eo)(\2)\}\s*/g, (match, prefix, section, title, content) => {
      return title
        ? `<div class="section-title">${title.trim()}</div><div class="section ${section}">${content.replace(/ /g, '&nbsp;')}</div>`
        : `<div class="section ${section}">${content.replace(/ /g, '&nbsp;')}</div>`;
    }) // section
    .replace(/\n?\s*{(\w+)(?::\s*(.*?))?\s*}\s*/g, '<div class="meta $1">$2</div>') // meta
    .replace(/\[(.*?)\]/g, '<span class="chord">$1</span>') // chords
    .replace(/\n/g, '<br />') // split line
};

export const getNotes = (score) => {
  const notes = [];
  
  score.replace(/\n?\s*{(start_of_note)(?::\s*(.*?))?\s*}\s*([\s\S]*?)\s*\n?\{(end_of_note)\}\s*/g, (match, prefix, title, content) => {
    notes.push(
      title 
        ? `<div class="section-title">${title.trim()}</div><div class="section note">${content.replace(/ /g, '&nbsp;').replace(/\n/g, '<br />')}</div>` 
        : `<div class="section note">${content.replace(/ /g, '&nbsp;').replace(/\n/g, '<br />')}</div>`
    );
  });

  return notes;
};



export const wrap = (textarea, before, after, placeholder = '') => {
  const { selectionStart: start, selectionEnd: end, value } = textarea || {};

  if (textarea && start !== undefined && end !== undefined) {
    // Insère le placeholder si la sélection est vide
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
