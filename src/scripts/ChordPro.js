export class ChordPro {
  constructor(score) {
    this.score = score;
  }

  toHTML() {
    return this.score
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
  }
}
