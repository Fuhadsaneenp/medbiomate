export function matchingOptions(options,query){const q=String(query||'').trim().toLowerCase();return options.filter(o=>!q||o.label.toLowerCase().includes(q));}
export function jobSuggestions(records, filters = {}) {
 const seen = new Set();
 return records.map(j => ({title: typeof j.title === 'string' ? j.title : j.title?.rendered || ''})).filter(j => {
  const key=j.title.trim().toLowerCase(); if(!key||seen.has(key))return false;seen.add(key);return true;
 }).slice(0,5).map(j => {
  j.title=j.title.trim().replace(/\s+/g,' ');const params=new URLSearchParams({...filters,q:j.title});
  return {...j,url:'/jobs?'+params};
 });
}
export function initJobSearch(){
 const closes=new Set();const closeAll=except=>closes.forEach(close=>{if(close!==except)close()});
 const text=value=>{const el=document.createElement('span');el.innerHTML=String(value||'');return el.textContent||''};
 function keyboard(input,list,close){let index=-1;input.addEventListener('keydown',event=>{const items=[...list.querySelectorAll('button,a')];if(event.key==='Escape'){close();return;}if(!['ArrowDown','ArrowUp','Enter'].includes(event.key)||!items.length)return;if(event.key==='Enter'){if(index>=0){event.preventDefault();items[index]?.click()}return;}event.preventDefault();index=(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((item,i)=>item.classList.toggle('is-active',i===index));input.setAttribute('aria-activedescendant',items[index].id);items[index].scrollIntoView({block:'nearest'});});return()=>{index=-1;input.removeAttribute('aria-activedescendant')}}
 for(const wrapper of document.querySelectorAll('.hero-minimal-search-form .custom-select-wrapper')){
  const dropdown=wrapper.querySelector('.custom-select-dropdown');if(!dropdown||wrapper.dataset.searchEnhanced)continue;wrapper.dataset.searchEnhanced='true';
  const input=document.createElement('input');input.type='search';input.className='mb-home-location-search';input.placeholder='Search location…';input.setAttribute('aria-label','Search location');dropdown.prepend(input);input.addEventListener('click',e=>e.stopPropagation());input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();wrapper.querySelectorAll('.custom-select-option').forEach(option=>option.hidden=!!q&&!option.textContent.toLowerCase().includes(q));});
  input.addEventListener('keydown',e=>{if(e.key==='Enter')e.preventDefault();});
 }
 for(const select of document.querySelectorAll('.searchbar select[name="location"],.searchbar select[name="category"]')){
  if(select.dataset.searchEnhanced)continue;select.dataset.searchEnhanced='true';
  const wrap=document.createElement('div');wrap.className='mb-search-picker';select.before(wrap);wrap.append(select);select.hidden=true;
  const label=select.name==='location'?'location':'category',button=document.createElement('button');button.type='button';button.className='mb-picker-trigger';button.setAttribute('aria-label','Choose '+label);button.setAttribute('aria-expanded','false');button.setAttribute('aria-haspopup','dialog');
  const panel=document.createElement('div');panel.className='mb-search-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Search '+label);
  const input=document.createElement('input');input.type='search';input.placeholder='Search '+label+'…';input.setAttribute('aria-label','Search '+label);input.autocomplete='off';const list=document.createElement('div');list.className='mb-search-options';const empty=document.createElement('p');empty.className='mb-search-empty';empty.textContent='No matching '+label+' found.';empty.hidden=true;panel.append(input,list,empty);wrap.append(button,panel);
  const options=[...select.options].map(o=>({value:o.value,label:text(o.textContent)}));const updateLabel=()=>{button.textContent=text(select.selectedOptions[0]?.textContent||'Choose '+label);};updateLabel();
  const close=()=>{panel.hidden=true;button.setAttribute('aria-expanded','false')};closes.add(close);const reset=keyboard(input,list,close);
  const render=()=>{reset();list.replaceChildren();const matches=matchingOptions(options,input.value).slice(0,5);empty.hidden=!!matches.length;for(const [index,option]of matches.entries()){const item=document.createElement('button');item.id='mb-'+select.name+'-'+index;item.type='button';item.className='mb-search-option';item.textContent=option.label;item.setAttribute('aria-pressed',String(select.value===option.value));item.addEventListener('click',()=>{select.value=option.value;updateLabel();close();select.dispatchEvent(new Event('change',{bubbles:true}));button.focus()});list.append(item)}};
  button.addEventListener('click',()=>{const open=panel.hidden;closeAll(close);panel.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open){input.value='';render();input.focus()}});input.addEventListener('input',render);select.addEventListener('change',updateLabel);document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});panel.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus()}});
 }
}
