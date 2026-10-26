export function createFormRecovery(form, type, account) {
  const view = form.closest('.admin-view');
  let key, dirty = false, restoring = false, timer, pending, draftId, sourceSlug = '';
  let editingSlug = '';
  let jobId = '';
  function setJobId(id) {
    jobId = id ? String(id) : '';
    let field = form.querySelector('[name="id"]');
    if (!field && type === 'job') { field = document.createElement('input'); field.type = 'hidden'; field.name = 'id'; form.append(field); }
    if (field) field.value = jobId;
  }
  function presence(release = false) {
    if (!editingSlug || type !== 'job') return;
    void fetch('/api/admin/job-presence', {method:'POST',credentials:'include',keepalive:release,headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:editingSlug,release})}).catch(() => {});
  }
  setInterval(() => {
    if (!document.hidden && view.classList.contains('active-view')) presence();
    else presence(true);
  }, 15000);
  window.addEventListener('pagehide', () => presence(true));
  function record() {
    const data = Object.fromEntries(new FormData(form));
    const value = selector => view.querySelector(selector)?.value || '';
    data.title = value(type === 'job' ? '#job-gutenberg-title' : '#employer-gutenberg-title') || data.title || '';
    data.description = value(type === 'job' ? '#job-gutenberg-content' : '#employer-gutenberg-content') || data.description || '';
    if (type === 'job') {
      data.company = value('#field-employer-company-value') || data.company || '';
      for (const name of ['types','categories','locations','tags']) data[name] = [...view.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
    } else {
      data.logo = value('#field-employer-logo-val');
      for (const name of ['categories','locations']) data[name] = [...view.querySelectorAll(`#employer-checklist-${name} input:checked`)].map(el => el.value);
    }
    return data;
  }
  async function sync() {
    clearTimeout(timer);
    if (!dirty || !key || pending) return pending;
    const snapshotKey = key, snapshotId = draftId, snapshotSlug = sourceSlug;
    const data = record();
    if (!data.title.trim() && !data.description.trim()) return;
    pending = (async () => {
      try {
        const response = await fetch('/api/admin/autosave', { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({type,draftId:snapshotId,sourceSlug:snapshotSlug,record:{...data,id:jobId || snapshotId}}) });
        if (!response.ok) throw new Error('Draft sync failed');
        const saved = await response.json();
        if (key === snapshotKey && !saved.skipped) {
          if (type === 'job') { setJobId(saved.id || snapshotId); sourceSlug = saved.slug; }
          editingSlug = sourceSlug || saved.slug;
          presence();
          notice.textContent = saved.status === 'publish' ? 'Changes saved for recovery. Update to publish them.' : 'Draft saved to this job.';
          if (type === 'job' && form.elements.originalSlug) form.elements.originalSlug.value = saved.slug;
        }
      } catch { if (key === snapshotKey) notice.textContent = 'Draft saved on this device — waiting to sync. Not published.'; }
      finally { pending = null; }
    })();
    return pending;
  }
  window.addEventListener('online', sync);
  const fields = () => [...view.querySelectorAll('input,textarea,select,[contenteditable="true"]')].filter(el => !['password','file'].includes(el.type));
  const id = (el, i) => el.id || `${el.name || 'field'}:${i}`;
  const notice = document.createElement('div');
  notice.style.cssText = 'padding:10px 16px;background:#eff6ff;color:#334155;font-size:13px;display:none';
  view.prepend(notice);
  function save() {
    if (!key || !dirty || restoring) return;
    try {
      const values = fields().map((el, i) => ({ key: id(el, i), value: el.isContentEditable ? el.innerHTML : el.value, checked: el.checked, rich: el.isContentEditable }));
      localStorage.setItem(key, JSON.stringify({ values, draftId, date: Date.now(), status: 'draft' }));
      notice.style.display = 'block';
      notice.textContent = 'Recovery draft saved on this device. Not published.';
      clearTimeout(timer); timer = setTimeout(sync, 1500);
    } catch {
      notice.style.display = 'block';
      notice.textContent = 'Draft could not be saved on this device. Keep this tab open and save manually.';
    }
  }
  view.addEventListener('input', () => { dirty = true; save(); });
  view.addEventListener('change', () => { dirty = true; save(); });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  return {
    open(slug = '', id = '') {
      if (type === 'job' && !slug && pending && !sourceSlug) return;
      presence(true);
      editingSlug = slug;
      clearTimeout(timer);
      dirty = false;
      sourceSlug = slug;
      key = `medbiomate-recovery:${encodeURIComponent(account)}:${type}:${encodeURIComponent(slug || 'new')}`;
      notice.style.display = 'none';
      let draft;
      try { draft = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
      draftId = draft?.draftId || (slug.startsWith(`autosave-${type}-`) ? slug.slice(`autosave-${type}-`.length) : crypto.randomUUID());
      if (type === 'job') { setJobId(id || draftId); if (slug) presence(); }
      if (!draft?.values || type === 'job') return;
      notice.style.display = 'block';
      notice.textContent = 'An unfinished draft is available on this device. ';
      const restore = document.createElement('button');
      restore.type = 'button'; restore.textContent = 'Restore Draft';
      restore.addEventListener('click', () => {
        restoring = true;
        try {
          const map = new Map(draft.values.map(value => [value.key, value]));
          for (const [i, el] of fields().entries()) {
            const value = map.get(id(el, i));
            if (!value) continue;
            if (value.rich) el.innerHTML = value.value; else el.value = value.value;
            if (typeof value.checked === 'boolean') el.checked = value.checked;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } finally { restoring = false; }
        dirty = true; save();
      });
      notice.append(restore);
    },
    saved(job) { if (type === 'job') { setJobId(job.id); sourceSlug = job.slug; } },
    async flush() { clearTimeout(timer); if (pending) await pending; await sync(); },
    clear() { presence(true); editingSlug = ''; clearTimeout(timer); if (key) localStorage.removeItem(key); dirty = false; notice.style.display = 'none'; }
  };
}
