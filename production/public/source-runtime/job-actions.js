export const DETAIL_ACTION_SCROLL=120;
export function initJobActions(){
 if(document.querySelector('.detail-scroll-actions'))return;
 const original=document.querySelector('.detail-exact .detail-hero:not(.employer-hero) .detail-actions');
 if(original)document.documentElement.classList.add('job-detail-route');
 const application=document.querySelector('.job-application-box .apply');
 const box=document.querySelector('.job-application-box'),count=box?.querySelector('.job-application-count');
 const jobId=box?.dataset.jobId;
 if(count&&jobId){
  fetch('/api/mobile/applications/count?job_id='+encodeURIComponent(jobId)+'&slug='+encodeURIComponent(box.dataset.jobSlug||'')).then(response=>response.ok?response.json():null).then(data=>{
   if(!data?.success||!Number.isSafeInteger(data.count)||data.count<0)return;
   count.textContent=new Intl.NumberFormat().format(data.count)+' '+(data.count===1?'application start':'application starts');count.title='Recorded application starts on Medbiomate, not confirmed submissions to the employer.';count.hidden=false;
  }).catch(()=>{});
 }
 if(original&&application){application.addEventListener('click',event=>{event.preventDefault();original.querySelector('.apply')?.click();});}
 const follow=document.querySelector('.emp-profile-header-actions .emp-follow-btn');
 if(!original&&!follow)return;
 const source=original||follow;
 const bar=original?original.cloneNode(true):document.createElement('div');
 bar.className=original?'detail-scroll-actions job-scroll-actions':'detail-scroll-actions company-scroll-actions';bar.hidden=true;bar.setAttribute('role','group');bar.setAttribute('aria-label',original?'Job application actions':'Company follow action');
 if(original){
  bar.querySelector('.apply')?.addEventListener('click',event=>{event.preventDefault();original.querySelector('.apply')?.click();});
  bar.querySelector('.save')?.addEventListener('click',()=>original.querySelector('.save')?.click());
 }else{
  const button=follow.cloneNode(true);button.className='company-scroll-follow';button.removeAttribute('id');bar.append(button);
  button.addEventListener('click',event=>{event.stopPropagation();follow.click();});
 }
 const sync=()=>{
  if(original){const from=original.querySelector('.save'),to=bar.querySelector('.save');if(from&&to){to.classList.toggle('is-saved',from.classList.contains('is-saved'));to.setAttribute('aria-label',from.getAttribute('aria-label')||'Save job');}}
  else{const button=bar.querySelector('button');button.textContent=follow.textContent;button.classList.toggle('following',follow.classList.contains('following'));button.setAttribute('aria-pressed',String(follow.classList.contains('following')));}
 };
 const stateObserver=new MutationObserver(sync);stateObserver.observe(source,{subtree:true,attributes:true,childList:true,characterData:true,attributeFilter:['class','aria-label']});sync();document.body.append(bar);
 const threshold=original?document.querySelector('.detail-about-company-header')||box:null;
 const hasPassed=element=>{if(!element||!element.getClientRects().length)return false;const rect=element.getBoundingClientRect();return rect.height>0&&rect.bottom<=(window.visualViewport?.offsetTop||0);};
 let revealed=false,lastScrollY=window.scrollY;
 const update=()=>{if(original){const viewport=window.visualViewport;const offset=viewport?Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop):0;bar.style.setProperty('--job-footer-viewport-offset',offset+'px');}if(original){const movingUp=window.scrollY<lastScrollY-1;if(!revealed&&hasPassed(box)&&hasPassed(threshold))revealed=true;else if(revealed&&movingUp&&!hasPassed(box))revealed=false;lastScrollY=window.scrollY;bar.hidden=!revealed;}else bar.hidden=window.scrollY<DETAIL_ACTION_SCROLL;};
 // Ads, fonts and expanded descriptions can move the company after a scroll.
 // Recheck visibility on layout changes, not just scroll events.
 const visibilityObserver=original?new IntersectionObserver(update,{threshold:[0,1]}):null;
 if(visibilityObserver){if(box)visibilityObserver.observe(box);if(threshold)visibilityObserver.observe(threshold);}
 const layoutObserver=original?new ResizeObserver(update):null;
 if(layoutObserver)layoutObserver.observe(document.body);
 let frame;const scroll=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=null;update();});};
 window.addEventListener('scroll',scroll,{passive:true,capture:true});document.addEventListener('scroll',scroll,{passive:true,capture:true});window.visualViewport?.addEventListener('scroll',scroll,{passive:true});window.visualViewport?.addEventListener('resize',scroll);window.addEventListener('resize',scroll);window.addEventListener('pageshow',update);update();
 window.addEventListener('pagehide',event=>{if(event.persisted)return;stateObserver.disconnect();visibilityObserver?.disconnect();layoutObserver?.disconnect();window.removeEventListener('scroll',scroll,true);document.removeEventListener('scroll',scroll,true);window.visualViewport?.removeEventListener('scroll',scroll);window.visualViewport?.removeEventListener('resize',scroll);window.removeEventListener('resize',scroll);window.removeEventListener('pageshow',update);if(frame)cancelAnimationFrame(frame);},{once:true});
}
