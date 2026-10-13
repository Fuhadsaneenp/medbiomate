const acronyms = new Set(['IT','UAE','LLC','LLP','PLC','PJSC','FZE','FZCO','GEMS','NMC','HSBC','IBM','ABB','ADCB','ADIB','DHL','HP','BP','EY','KPMG','PWC','BMW']);
// Presentation only: never rewrite legal names, slugs or stored user input.
export function formatCompanyName(value) {
  return String(value || '').trim().replace(/\s+/g,' ').replace(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu, word => {
    if(acronyms.has(word.toUpperCase()))return word.toUpperCase();
    return word.charAt(0).toLocaleUpperCase()+word.slice(1).toLocaleLowerCase();
  });
}
