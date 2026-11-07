import {esc as escapeAttr,icon,stylesheet,host,pager as renderPager,label} from './ui.js';
import {publicJobPath} from './job-urls.js';
export async function renderJobDirectory(tax,api){
 stylesheet('/trikonet-listing.css');
 const path=location.pathname,queryParams=new URLSearchParams(location.search);
 const slug=path.split('/').pop();
 const category=path.startsWith('/category/')?tax.categories?.find(t=>t.slug===slug):path==='/nurse-jobs-in-uae'?tax.categories?.find(t=>t.name==='Nurse Jobs'):null;
 if(category)queryParams.set('category',category.name);
 if(path.startsWith('/job-location/')){const term=tax.locations?.find(t=>t.slug===slug);if(term)queryParams.set('location',term.name)}
 if(path.startsWith('/job-type/')){const term=tax.types?.find(t=>t.slug===slug);if(term)queryParams.set('job_type',term.name)}
 const currentPage=Math.max(1,Number(queryParams.get('page'))||1),pageSize=10;
 const params=new URLSearchParams(queryParams);params.set('page',currentPage);params.set('per_page',pageSize);
 const counter=new URLSearchParams(queryParams);counter.set('type','job_listing');counter.delete('page');counter.delete('per_page');
 const [records,count,posts]=await Promise.all([api('wp/job_listing?'+params),api('wp/count?'+counter),api('wp/posts?per_page=3').catch(()=>[])]);
 const plain=html=>{const d=document.createElement('div');d.innerHTML=html||'';return(d.textContent||'').trim().replace(/\s+/g,' ')};
 const mapJob=r=>({ ...r,title:label(r.title),company:r.metas?._job_employer_name||'',logo:r.metas?._job_logo||'',location:Object.values(r.metas?._job_location||{}).join(', '),category:Object.values(r.metas?._job_category||{}).join(', '),type:Object.values(r.metas?._job_type||{}).join(', '),date:r.date?new Date(r.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'',excerpt:plain(label(r.excerpt)||label(r.content)).slice(0,190),employerSlug:(r.metas?._job_employer_url||'').split('/').filter(Boolean).pop()});
 const data={jobs:records.map(mapJob),taxonomies:tax,counts:{job_listing:count.total,category:count.total},posts:posts.map(r=>({...r,title:label(r.title),featuredImage:'',categoryName:'Healthcare Insights',date:r.date?new Date(r.date).toLocaleDateString('en-GB'):''}))};
 const seoInternalLinks=[],defaultTopCategories=tax.categories||[];
 const slugifyCategory=r=>typeof r==='object'?r.slug:String(r).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const findCategoryBySlug=s=>tax.categories?.find(r=>r.slug===s);
 const sortUaeLocations=rows=>[...rows];
 const cleanJobExcerpt=plain;
 const employerProfileHref=job=>job.employerSlug?'/employer/'+job.employerSlug:'/employers';
 const getPostUrl=r=>'/blog/'+r.slug;
 const pager=(_base,total,limit)=>renderPager(path,queryParams,currentPage,total,limit);
 const searchBar=settings=>`<form class="searchbar" id="mb-reference-search" action="${escapeAttr(path)}"><label class="field"><b>${icon('search')}</b><input name="q" aria-label="Job title" placeholder="${escapeAttr(settings.keyword)}" value="${escapeAttr(queryParams.get('q'))}"></label><label class="field"><b>${icon('pin')}</b><select name="location" aria-label="Location"><option value="">All Locations</option>${(tax.locations||[]).map(r=>`<option value="${escapeAttr(r.name)}" ${queryParams.get('location')===r.name?'selected':''}>${escapeAttr(r.name)}</option>`).join('')}</select></label><label class="field"><select name="category" aria-label="Category"><option value="">All Categories</option>${(tax.categories||[]).map(r=>`<option value="${escapeAttr(r.name)}" ${queryParams.get('category')===r.name?'selected':''}>${escapeAttr(r.name)}</option>`).join('')}</select></label><button class="primary">${escapeAttr(settings.button)}</button></form>`;
function categoryPage(destination = null, allJobs = false) {
  const catSlug = path.replace('/category/', '').split('/')[0].split('?')[0];
  const cat = destination ? {name:destination.page.category,slug:slugifyCategory(destination.page.category)} : allJobs ? data.taxonomies.categories.find(c=>c.name===queryParams.get('category')) : findCategoryBySlug(catSlug);
  const categoryName = cat ? cat.name : allJobs ? 'All' : (catSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  const categoryCleanSlug = slugifyCategory(cat || categoryName);

  if (typeof document !== 'undefined') {
    document.title = `${categoryName.replace(/\s+jobs$/i,'')} Jobs${allJobs?' in the GCC':''} — Medbiomate`;
  }

  const pageLimit = 10;
  const decode=value=>{const node=document.createElement('textarea');node.innerHTML=String(value || '');return node.value;};
  const list = destination ? destination.jobs.map(record=>{const job=mapJob(record);return {...job,title:decode(job.title),company:decode(job.company),excerpt:decode(job.excerpt)};}) : data.jobs.slice(0, pageLimit);
  const total = destination ? destination.total : allJobs ? (data.counts?.job_listing ?? list.length) : (data.counts?.category || cat?.count || list.length);
  const start = total ? (currentPage - 1) * pageLimit + 1 : 0;
  const end = Math.min(start + list.length - 1, total);

  const qQuery = queryParams.get('q') || '';
  const selectedLoc = destination?.page.location || queryParams.get('location') || '';
  const selectedType = queryParams.get('job_type') || '';
  const hasActiveFilters = !!(selectedLoc || selectedType || qQuery);

  const removeLocParams = new URLSearchParams(queryParams);
  removeLocParams.delete('location');
  removeLocParams.delete('page');
  const removeTypeParams = new URLSearchParams(queryParams);
  removeTypeParams.delete('job_type');
  removeTypeParams.delete('page');

  let pageTitle = `${escapeAttr(categoryName.replace(/\s+jobs$/i,''))} Jobs${allJobs?' in the GCC':''}`;
  if (qQuery) pageTitle = `"${escapeAttr(qQuery)}" in ${escapeAttr(categoryName)}`;
  else if (selectedLoc) pageTitle = `${escapeAttr(categoryName)} Jobs in ${escapeAttr(selectedLoc)}`;
  pageTitle=destination?escapeAttr(destination.page.h1 || destination.page.title):pageTitle.replace(/Jobs Jobs/g,'Jobs');
  if(allJobs && !cat && !qQuery && !selectedLoc)pageTitle='Healthcare Jobs in the GCC';

  const iconCheckTick = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const iconBookmark = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
  const iconBell = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
  const iconBriefcase = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
  const iconPin = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const iconClock = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const latestArticles = (data.posts || [])
    .filter(article => article && article.slug && article.title)
    .slice(0, 3);
  const iconShareLinkedin = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`;
  const iconShareFb = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>`;
  const iconShareWa = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
  const iconShareX = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

  // Other related categories
  const otherCats = (data.taxonomies?.categories?.length ? data.taxonomies.categories : defaultTopCategories)
    .filter(c => c.name.toLowerCase() !== categoryName.toLowerCase())
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 8);

  return `<main class="nurse-results-page category-results-page">
    <section class="nurse-results-hero category-page-hero">
      <div class="wrap">
        <div class="nurse-hero-topline">
          <nav class="nurse-breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span class="sep">&gt;</span>
            <a href="/jobs">${allJobs && !cat ? 'Healthcare Jobs in the GCC' : 'Categories'}</a>
            ${allJobs && !cat ? '' : `<span class="sep">&gt;</span>${destination ? `<a href="/category/${escapeAttr(categoryCleanSlug)}">${escapeAttr(categoryName)}</a><span class="sep">&gt;</span><span class="current" aria-current="page">${escapeAttr(destination.page.location || 'UAE')}</span>` : `<span class="current" aria-current="page">${escapeAttr(categoryName)}</span>`}`}
          </nav>
        </div>
        <div class="category-hero-head">
          <div class="nurse-hero-title-row">
            <h1>${pageTitle}</h1>
            <span class="nurse-hero-count-tag">${Number(total).toLocaleString()} Active Vacancies</span>
          </div>
          <p class="nurse-hero-desc">Explore verified ${escapeAttr(categoryName)} job vacancies across Dubai, Abu Dhabi, Sharjah, and all UAE emirates with direct employer hiring.</p>
        </div>
        <div class="nurse-search-wrapper">
          ${searchBar({ keyword: allJobs?'Job Title, Keywords':`${categoryName} job title, role...`, category: allJobs?(cat?.name || 'All Categories'):categoryName, location:selectedLoc || 'Country or City', button: allJobs?'Find Jobs':'Search Category', action: allJobs?'/jobs':`/category/${categoryCleanSlug}` })}
        </div>
        <div class="category-popular-chips">
          <span class="chips-label">
            <span class="chips-label-desktop">Popular in ${escapeAttr(categoryName)}:</span>
            <span class="chips-label-mobile">Popular:</span>
          </span>
          <a href="/category/${categoryCleanSlug}?location=Dubai">Dubai</a>
          <a href="/category/${categoryCleanSlug}?location=Abu+Dhabi">Abu Dhabi</a>
          <a href="/category/${categoryCleanSlug}?location=Sharjah">Sharjah</a>
        </div>
      </div>
    </section>

    <section class="wrap nurse-results-layout category-results-layout">
      <aside class="filters nurse-site-filters jobs-filter-card">
        <div class="nurse-filter-header">
          <div class="nurse-filter-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>Filter Jobs</span>
          </div>
          ${hasActiveFilters ? `<a href="/category/${categoryCleanSlug}" class="nurse-filter-reset-link">Reset All</a>` : ''}
          <button type="button" class="jobs-filter-mobile-toggle" aria-expanded="false" aria-label="Show job filters"><span>Show filters</span><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
        </div>

        <div class="jobs-filter-collapsible">
        <div class="nurse-filter-group">
          <h3>Location</h3>
          ${sortUaeLocations((data.taxonomies?.locations || []).filter(l => ['UAE', 'United Arab Emirates', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'].some(k => k.toLowerCase() === (l.name || '').toLowerCase()))).map(x => {
            const params = new URLSearchParams(queryParams);
            const isSelected = selectedLoc === x.name;
            if (isSelected) params.delete('location');
            else params.set('location', x.name);
            params.delete('page');
            const countText = x.count != null ? Number(x.count).toLocaleString() : '';
            return `<a class="nurse-filter-row${isSelected ? ' active' : ''}" href="/category/${categoryCleanSlug}?${params}">
              <span class="nurse-row-label">
                <span class="nurse-custom-cb">${iconCheckTick}</span>
                <span class="nurse-filter-name">${escapeAttr(x.name)}</span>
              </span>
              ${countText ? `<span class="nurse-filter-count">${countText}</span>` : ''}
            </a>`;
          }).join('')}
        </div>

        <div class="nurse-filter-group">
          <h3>Job type</h3>
          ${(data.taxonomies?.types || []).map(x => {
            const params = new URLSearchParams(queryParams);
            const isSelected = selectedType === x.name;
            if (isSelected) params.delete('job_type');
            else params.set('job_type', x.name);
            params.delete('page');
            const countText = x.count != null ? Number(x.count).toLocaleString() : '';
            return `<a class="nurse-filter-row${isSelected ? ' active' : ''}" href="/category/${categoryCleanSlug}?${params}">
              <span class="nurse-row-label">
                <span class="nurse-custom-cb">${iconCheckTick}</span>
                <span class="nurse-filter-name">${escapeAttr(x.name)}</span>
              </span>
              ${countText ? `<span class="nurse-filter-count">${countText}</span>` : ''}
            </a>`;
          }).join('')}
        </div>

        <div class="nurse-filter-group other-categories-group">
          <h3>Other Top Categories</h3>
          <div class="other-categories-list">
            ${otherCats.map(c => `
              <a class="other-category-link" href="/category/${slugifyCategory(c)}">
                <span class="other-cat-name">${escapeAttr(c.name)}</span>
                <span class="other-cat-count">${Number(c.count || 0).toLocaleString()}</span>
              </a>
            `).join('')}
          </div>
        </div>
        </div>
      </aside>

      <section class="nurse-results-main">
        <div class="nurse-results-tools">
          <div class="nurse-tools-top">
            <span class="nurse-tools-count">Showing <b>${start} – ${end}</b> ${escapeAttr(categoryName)} Jobs</span>
            <div class="nurse-tools-actions">
              <select class="nurse-sort-select" aria-label="Sort listings">
                <option>Most Relevant</option>
                <option>Newest First</option>
              </select>
              <button type="button" class="nurse-alert-trigger">${iconBell} Alert Me</button>
            </div>
          </div>
          ${(selectedLoc || selectedType || qQuery) ? `
            <div class="nurse-active-chips-bar">
              <span class="nurse-active-label">Active filters:</span>
              ${qQuery ? `<span class="nurse-active-chip">Keyword: "${escapeAttr(qQuery)}" <a href="/category/${categoryCleanSlug}?${(() => { const p = new URLSearchParams(queryParams); p.delete('q'); p.delete('page'); return p.toString(); })()}" title="Remove keyword">×</a></span>` : ''}
              ${selectedLoc ? `<span class="nurse-active-chip">${escapeAttr(selectedLoc)} <a href="/category/${categoryCleanSlug}?${removeLocParams}" title="Remove filter">×</a></span>` : ''}
              ${selectedType ? `<span class="nurse-active-chip">${escapeAttr(selectedType)} <a href="/category/${categoryCleanSlug}?${removeTypeParams}" title="Remove filter">×</a></span>` : ''}
              <a href="/category/${categoryCleanSlug}" class="nurse-clear-all-link">Clear all</a>
            </div>
          ` : ''}
        </div>

        <div class="nurse-job-list">
          ${list.length ? list.map((job) => `
            <article class="nurse-job-card">
              <div class="nurse-card-top">
                ${job.logo ? `
                  <div class="nurse-card-logo">
                    <img src="${escapeAttr(job.logo)}" alt="${escapeAttr(job.company)}">
                  </div>
                ` : `
                  <div class="nurse-card-logo-fallback">
                    <span>${escapeAttr(String(job.company || (typeof job.title === 'string' ? job.title : job.title?.rendered) || 'TJ').slice(0, 2).toUpperCase())}</span>
                  </div>
                `}
                <div class="nurse-card-info">
                  <div class="nurse-card-title-row">
                    <a href="${escapeAttr(publicJobPath(job))}" class="nurse-job-title-link">
                      <h2>${escapeAttr(job.title)}</h2>
                    </a>
                    <button type="button" class="nurse-card-save-btn" title="Save job" aria-label="Save job">${iconBookmark}</button>
                  </div>
                  <div class="nurse-company-row">
                    <a class="comp-name company-profile-link" href="${escapeAttr(employerProfileHref(job))}">${escapeAttr(job.company || 'Employer')}</a>
                  </div>
                  <div class="nurse-job-meta-row">
                    <span class="nurse-meta-badge">${iconBriefcase} ${escapeAttr(job.type || 'Full Time')}</span>
                    <span class="nurse-meta-badge">${iconPin} ${escapeAttr(job.location || 'GCC')}</span>
                    <span class="nurse-meta-badge">${iconClock} ${escapeAttr(job.date || 'Recently posted')}</span>
                  </div>
                  ${job.excerpt ? `
                    <p class="nurse-job-excerpt">${escapeAttr(cleanJobExcerpt(job.excerpt))}</p>
                  ` : ''}
                </div>
              </div>
              <div class="nurse-card-footer">
                <div class="nurse-footer-tags">
                  ${(() => {
                    if (!job.category) return '';
                    const primaryCat = String(job.category).split(',')[0].trim();
                    const categoryPage=seoInternalLinks.find(page=>page.pageType==='main_category' && page.category===primaryCat);
                    const categoryTerm=data.taxonomies.categories.find(term=>term.name===primaryCat);
                    const href=categoryPage?.href || (categoryTerm?`/category/${slugifyCategory(categoryTerm)}`:'');
                    return href?`<a class="nurse-tag-category" href="${escapeAttr(href)}">${escapeAttr(primaryCat)}</a>`:`<span class="nurse-tag-category">${escapeAttr(primaryCat)}</span>`;
                  })()}
                </div>
                <a href="${escapeAttr(publicJobPath(job))}" class="nurse-view-job-btn">View Job <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></a>
              </div>
            </article>
          `).join('') : `
            <div class="nurse-empty-state">
              <h3>No jobs found matching your criteria</h3>
              <p>Try resetting filters or searching for different keywords within ${escapeAttr(categoryName)}.</p>
              <a href="/category/${categoryCleanSlug}" class="primary" style="display:inline-block;margin-top:12px;padding:10px 20px;border-radius:8px;">Reset Filters</a>
            </div>
          `}
        </div>
        ${pager(destination ? path : `/category/${categoryCleanSlug}`, total, pageLimit)}
      </section>

      <aside class="nurse-side-column">
        <a href="/resume-builder" class="nurse-resume-builder-card" aria-label="Open Medbiomate Resume Builder">
          <span class="nurse-resume-builder-badge">FREE TOOL</span>
          <span class="nurse-resume-builder-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>
          </span>
          <span class="nurse-resume-builder-copy">
            <strong>Build your professional résumé</strong>
            <small>Create an ATS-friendly CV for UAE ${escapeAttr(categoryName)} roles.</small>
          </span>
          <span class="nurse-resume-builder-action">Build my résumé <span aria-hidden="true">→</span></span>
        </a>

        <section class="nurse-side-card nurse-articles-card">
          <div class="nurse-side-card-header">
            <h3>Latest Articles</h3>
            <a href="/blog" class="nurse-side-see-all">View all &rarr;</a>
          </div>
          <div class="nurse-side-article-list">
            ${latestArticles.length ? latestArticles.map(article => `
              <a href="${escapeAttr(getPostUrl(article))}" class="nurse-side-article-row">
                <span class="nurse-side-article-image">
                  <img src="${escapeAttr(article.featuredImage || '/assets/article-1.jpg')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='/assets/article-1.jpg'">
                </span>
                <span class="nurse-side-article-copy">
                  <small>${escapeAttr(article.categoryName || 'Career Advice')}</small>
                  <strong>${escapeAttr(article.title)}</strong>
                  ${article.date ? `<time>${escapeAttr(article.date)}</time>` : ''}
                </span>
              </a>
            `).join('') : `<p class="nurse-side-article-empty">Published articles will appear here.</p>`}
          </div>
        </section>

        <section class="nurse-side-card nurse-alert-card">
          <div class="nurse-alert-card-top">
            <div class="nurse-alert-badge-icon">${iconBell}</div>
            <div>
              <h4>${escapeAttr(categoryName)} Job Alerts</h4>
              <p>Get newly posted ${escapeAttr(categoryName)} vacancies delivered to your inbox.</p>
            </div>
          </div>
          <form class="nurse-side-alert-form" action="/alerts-jobs" id="mb-job-alert-form">
            <input type="email" placeholder="Enter your email address..." class="nurse-side-email-input" required>
            <button type="submit" class="nurse-side-alert-btn">Subscribe Free</button>
          </form>
        </section>

        <section class="nurse-side-card">
          <div class="nurse-side-card-header">
            <h3>Share Jobs</h3>
          </div>
          <p class="nurse-side-share-txt">Know someone looking for a ${escapeAttr(categoryName)} job in the UAE?</p>
          <div class="nurse-side-share-btns">
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.medbiomate.com'+path)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on LinkedIn">${iconShareLinkedin} LinkedIn</a>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${categoryName} Healthcare Jobs in the GCC: https://www.medbiomate.com/category/${categoryCleanSlug}`)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on WhatsApp">${iconShareWa} WhatsApp</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.medbiomate.com/category/${categoryCleanSlug}`)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on Facebook">${iconShareFb} Facebook</a>
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.medbiomate.com/category/${categoryCleanSlug}`)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on X">${iconShareX} X</a>
          </div>
        </section>
      </aside>
    </section>
  </main>`;
}
 let html=categoryPage(null,!category);
 const categorySlug=slugifyCategory(category||'All');
 if(!category)html=html.replaceAll('/category/'+categorySlug,path);
 html=html.replace(/Explore verified All job vacancies[^<]+/,'Explore healthcare vacancies across the GCC with direct employer application instructions.');
 html=html.replace(/<a href="https:\/\/www.medbiomate.com"[^>]*class="nurse-share-pill"[^>]*aria-label="Share on LinkedIn"/,`<a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.medbiomate.com'+path)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on LinkedIn"`);
 host().innerHTML=html;
 const form=host().querySelector('#mb-reference-search');form.onsubmit=e=>{e.preventDefault();const q=new URLSearchParams(new FormData(form));q.delete('page');location.href='/jobs?'+q};
 const toggle=host().querySelector('.jobs-filter-mobile-toggle'),filters=host().querySelector('.jobs-filter-collapsible');
 toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',open);filters.classList.toggle('is-open',open);toggle.querySelector('span').textContent=open?'Hide filters':'Show filters'};
 for(const [i,b]of [...host().querySelectorAll('.nurse-card-save-btn')].entries()){
  const read=()=>{try{return JSON.parse(localStorage.getItem('medbiomate-bookmarks')||'[]')}catch{return []}};
  const update=()=>{const saved=read().some(j=>j.id===records[i].id);b.setAttribute('aria-pressed',saved);b.setAttribute('aria-label',(saved?'Unsave ':'Save ')+label(records[i].title));b.classList.toggle('saved',saved)};update();
  b.onclick=()=>{let list=read();list=list.some(j=>j.id===records[i].id)?list.filter(j=>j.id!==records[i].id):[...list,records[i]];localStorage.setItem('medbiomate-bookmarks',JSON.stringify(list));update()};
 }
 host().querySelector('.nurse-alert-trigger').onclick=()=>location.href='/profile';
 host().querySelector('#mb-job-alert-form').onsubmit=e=>{e.preventDefault();location.href='/login?redirect=/profile'};
 const sort=host().querySelector('.nurse-sort-select');sort.value='Newest First';sort.onchange=()=>{const p=new URLSearchParams(queryParams);p.delete('page');location.href=path+'?'+p};
 // The copied template's article thumbnails resolve to bundled Medbiomate media.
 host().querySelectorAll('.nurse-side-article-image img').forEach(img=>img.src='/assets/medbiomate-article.jpg');

}
