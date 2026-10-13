const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=v=>typeof v==='object'?v?.rendered||'':v||'';
export function replaceElement(source,className,inner){
 const rx=new RegExp('<([a-z][a-z0-9]*)\\b[^>]*class=["\'][^"\']*\\b'+className+'\\b[^"\']*["\'][^>]*>','i');const m=rx.exec(source);if(!m)return source;
 const start=m.index+m[0].length,tag=m[1],tags=new RegExp('</?'+tag+'\\b[^>]*>','gi');tags.lastIndex=start;let depth=1,t;
 while((t=tags.exec(source))){depth+=t[0].startsWith('</')?-1:1;if(depth===0)return source.slice(0,start)+inner+source.slice(t.index)}return source;
}
export function renderJob(template,job){
 const m=job.metas||{},title=text(job.title),location=Object.values(m._job_location||{}).join(', '),category=Object.values(m._job_category||{}).join(', '),type=Object.values(m._job_type||{}).join(', ');
 let html=template.replace(/<title>.*?<\/title>/s,'<title>'+esc(title)+' | Medbiomate</title>');
 html=replaceElement(html,'employer-logo',m._job_logo?'<a href="'+esc((m._job_employer_url||'/employers-list').replace('https://www.medbiomate.com',''))+'"><img width="150" height="150" src="'+esc(m._job_logo)+'" alt="'+esc(m._job_employer_name)+'"></a>':'');html=replaceElement(html,'job-detail-title',esc(title));html=replaceElement(html,'job-detail-description','<h3 class="title">Job Description</h3>'+text(job.content));
 html=replaceElement(html,'job-metas-detail',`<div class="job-category with-icon"><i class="flaticon-briefcase-1"></i>${esc(category)}</div><div class="job-location"><i class="flaticon-location"></i>${esc(location)}</div><div class="job-deadline with-icon">${esc(job.date?.slice(0,10))}</div>`);
 html=replaceElement(html,'job-metas-detail-bottom','<span class="type-job">'+esc(type)+'</span>');
 const href=m._job_apply_type==='email'&&m._job_apply_email?'mailto:'+m._job_apply_email:m._job_apply_url;
 html=replaceElement(html,'job-detail-buttons',`<div class="action">${href?'<a class="btn btn-apply btn-apply-job-external" target="_blank" rel="noopener noreferrer" href="'+esc(href)+'">Apply Now<i class="next flaticon-right-arrow"></i></a>':'<span>See application details in description</span>'}<button id="bookmark" class="btn-follow" aria-label="Save job"><i class="flaticon-bookmark"></i></button><p id="bookmark-status" role="status"></p></div>`);
 html=replaceElement(html,'job-detail-detail','<ul class="list">'+[['Date Posted',job.date?.slice(0,10)],['Location',location],['Expiration date',m._job_expiry_date],['Experience',m.experience],['Qualification',m.qualification]].filter(r=>r[1]).map(([k,v])=>'<li><div class="details"><div class="text">'+esc(k)+'</div><div class="value">'+esc(v)+'</div></div></li>').join('')+'</ul>');
 html=replaceElement(html,'job-detail-employer-info',`<div class="job-employer-header">${m._job_logo?'<div class="employer-thumbnail"><img width="60" src="'+esc(m._job_logo)+'" alt=""></div>':''}<div class="employer-links"><h3 class="employer-title">${esc(m._job_employer_name)}</h3><a class="more-link" href="${esc((m._job_employer_url||'/employers-list').replace('https://www.medbiomate.com',''))}">View Company Profile</a></div></div>`);
 // Template-related records are replaced with a catalogue link.
 html=replaceElement(html,'related-jobs','<a class="btn btn-theme" href="/jobs-list">Browse More Jobs</a>');
 html=html.replace(/<meta[^>]+(?:og:|twitter:)[^>]+>/g,'').replace(/<link[^>]+rel=["']canonical["'][^>]+>/g,'<link rel="canonical" href="https://www.medbiomate.com/job/'+esc(job.slug)+'">');
 return html.replace('</head>','<meta name="description" content="'+esc(title+' at '+(m._job_employer_name||'')+' in '+location)+'"></head>');
}
export function renderEmployer(template,employer,jobs=[]){
 const m=employer.metas||{},title=text(employer.title),location=Object.values(m._employer_location||{}).join(', '),category=Object.values(m._employer_category||{}).join(', ');
 let html=template.replace(/<title>.*?<\/title>/s,'<title>'+esc(title)+' | Medbiomate</title>');html=replaceElement(html,'candidate-title',esc(title));html=replaceElement(html,'employer-logo',m._employer_logo?'<img width="150" height="150" src="'+esc(m._employer_logo)+'" alt="'+esc(title)+'">':'');
 html=replaceElement(html,'candidate-metas',`<div class="job-category">${esc(category)}</div><div class="employer-location">${esc(location)}</div>`);html=replaceElement(html,'candidate-metas-bottom','<a href="/jobs-list?employer_slug='+esc(employer.slug)+'">View Open Jobs</a>');html=replaceElement(html,'candidate-detail-buttons','<a class="btn btn-theme" href="/jobs-list?employer_slug='+esc(employer.slug)+'">View Open Jobs</a>');
 html=replaceElement(html,'employer-detail-description','<h3 class="title">About Company</h3><div class="inner">'+text(employer.content)+'</div>');
 html=replaceElement(html,'job-detail-employer-info',[['Categories',category],['Company Size',m._employer_company_size],['Founded Date',m._employer_founded_date],['Location',location],['Phone Number',m._employer_phone],['Email',m._employer_email]].filter(r=>r[1]).map(([k,v])=>'<div class="employer-meta"><h3 class="title">'+esc(k)+':</h3><div class="value">'+esc(v)+'</div></div>').join('')+(m._employer_website?'<a class="btn btn-theme-light btn-block" href="'+esc(m._employer_website)+'">'+esc(m._employer_website)+'</a>':''));
 html=replaceElement(html,'widget-open-jobs','<h3>Open Jobs</h3>'+jobs.map(j=>'<article class="job-list"><h2 class="job-title"><a href="/job/'+esc(j.slug)+'">'+esc(text(j.title))+'</a></h2><div class="job-location">'+esc(Object.values(j.metas?._job_location||{}).join(', '))+'</div></article>').join('')+'<a class="btn btn-theme-light" href="/jobs-list?employer_slug='+esc(employer.slug)+'">Browse All Open Jobs</a>');html=replaceElement(html,'employer-detail-map-location',esc(location));
 return html.replace(/<meta[^>]+(?:og:|twitter:)[^>]+>/g,'').replace(/<link[^>]+rel=["']canonical["'][^>]+>/g,'<link rel="canonical" href="https://www.medbiomate.com/employer/'+esc(employer.slug)+'">');
}
