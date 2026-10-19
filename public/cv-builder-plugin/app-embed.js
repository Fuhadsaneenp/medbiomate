(function(){
  if(window.parent!==window)document.documentElement.classList.add('cv-hosted-editor');
  var onboardingRoutes=['onboarding/choice','onboarding/templates'];

  function setupOnboardingNavigation(){
    if(document.querySelector('.cv-app-mobile-nav'))return;
    var nav=document.createElement('div');
    nav.className='cv-app-mobile-nav';
    nav.innerHTML='<button type="button" class="cv-app-nav-back">Back</button><span class="cv-app-nav-progress"></span><button type="button" class="cv-app-nav-next">Next</button>';
    document.body.appendChild(nav);
    var back=nav.querySelector('.cv-app-nav-back');
    var next=nav.querySelector('.cv-app-nav-next');
    var progress=nav.querySelector('.cv-app-nav-progress');

    var selectionSelectors={
      'onboarding/choice':'.cv-choice-card.is-selected',
      'onboarding/experience':'.cv-exp-card.is-selected',
      'onboarding/company':'.cv-company-card.is-selected',
      'onboarding/goals':'.cv-goal-card.is-selected',
      'onboarding/industry':'.cv-industry-pill.is-selected',
      'onboarding/templates':'.cv-template-select-card.is-selected'
    };
    function currentRoute(){return (window.location.hash||'#onboarding/choice').replace(/^#/,'')}
    function hasSelection(route){
      if(route==='onboarding/industry'){
        var custom=document.getElementById('cv-industry-custom-input');
        if(custom&&custom.value.trim())return true;
      }
      var selector=selectionSelectors[route];
      return selector?!!document.querySelector(selector):true;
    }
    function reportSelection(){
      var route=currentRoute();
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-selection',route:route,valid:hasSelection(route)},'*');
    }
    function sync(){
      var route=currentRoute();
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-route',route:route},'*');
      reportSelection();
      var index=onboardingRoutes.indexOf(route);
      var visible=index>=0||route==='onboarding/upgrade';
      nav.classList.toggle('is-visible',visible);
      if(!visible)return;
      if(route==='onboarding/upgrade'){
        progress.textContent='Upload CV';
        back.disabled=false;
        next.style.visibility='hidden';
        return;
      }
      progress.textContent='Step '+(index+1)+' of '+onboardingRoutes.length;
      back.disabled=index===0;
      next.style.visibility=index===onboardingRoutes.length-1?'hidden':'visible';
      next.textContent=index===0?'Create CV':'Next';
    }
    back.addEventListener('click',function(){
      var route=currentRoute();
      if(route==='onboarding/upgrade'){window.location.hash='onboarding/choice';return}
      var index=onboardingRoutes.indexOf(route);
      if(index>0)window.location.hash=onboardingRoutes[index-1];
    });
    next.addEventListener('click',function(){
      var route=currentRoute();
      var index=onboardingRoutes.indexOf(route);
      if(index===0){window.location.hash='onboarding/templates';return}
      if(index>=0&&index<onboardingRoutes.length-1)window.location.hash=onboardingRoutes[index+1];
    });
    window.addEventListener('hashchange',sync);
    document.addEventListener('click',function(event){
      if(event.target.closest('.cv-choice-card,.cv-exp-card,.cv-company-card,.cv-goal-card,.cv-industry-pill,.cv-template-select-card'))setTimeout(reportSelection,0);
    });
    var customIndustry=document.getElementById('cv-industry-custom-input');
    if(customIndustry)customIndustry.addEventListener('input',reportSelection);
    sync();
  }

  function setupTemplateModalPreviewRepair(){
    var modal=document.getElementById('cv-template-modal');
    var container=document.getElementById('cv-modal-preview-container');
    if(!modal||!container||container.dataset.previewRepairReady)return;
    container.dataset.previewRepairReady='true';
    function reportModalVisibility(){
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-template-modal',open:!modal.classList.contains('cv-hidden')},'*');
    }
    new MutationObserver(reportModalVisibility).observe(modal,{attributes:true,attributeFilter:['class']});
    reportModalVisibility();
    var repairQueued=false;
    function restorePreview(){
      repairQueued=false;
      if(modal.classList.contains('cv-hidden'))return;
      var indexNode=document.getElementById('cv-modal-current-index');
      var index=Math.max(0,(parseInt(indexNode&&indexNode.textContent||'1',10)||1)-1);
      var cards=document.querySelectorAll('.cv-template-select-card');
      var source=cards[index]&&cards[index].querySelector('.cv-preview');
      if(!source)return;
      var sourceImage=source.children.length===1&&source.firstElementChild&&source.firstElementChild.tagName==='IMG'?source.firstElementChild:null;
      if(sourceImage){
        var existingImage=container.querySelector('.cv-modal-static-preview');
        var resolvedSource=new URL(sourceImage.getAttribute('src'),document.baseURI).href;
        if(existingImage&&existingImage.src===resolvedSource)return;
        var previewImage=document.createElement('img');
        previewImage.className='cv-modal-static-preview';
        previewImage.alt=sourceImage.alt||'CV template preview';
        previewImage.src=resolvedSource;
        previewImage.decoding='async';
        container.replaceChildren(previewImage);
        return;
      }
      if(container.firstElementChild&&!container.querySelector('.cv-modal-static-preview'))return;
      container.replaceChildren(source.cloneNode(true));
      window.requestAnimationFrame(function(){window.dispatchEvent(new Event('resize'))});
    }
    function queueRepair(){
      if(repairQueued)return;
      repairQueued=true;
      window.requestAnimationFrame(restorePreview);
    }
    new MutationObserver(queueRepair).observe(container,{childList:true,subtree:true});
    document.addEventListener('click',function(){window.setTimeout(queueRepair,0)});
    window.addEventListener('hashchange',function(){window.setTimeout(restorePreview,0)});
    var closeButton=document.getElementById('cv-modal-close-btn');
    if(closeButton&&!closeButton.dataset.appCloseReady){
      closeButton.dataset.appCloseReady='true';
      closeButton.addEventListener('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        modal.classList.add('cv-hidden');
      });
    }
  }

  function setupMobileWorkspace(){
    if (/Android/i.test(navigator.userAgent)) document.body.classList.add('cv-android-host');
    document.querySelectorAll('.cv-choice-card').forEach(function(card){
      if(card.dataset.appDirectChoice)return;
      card.dataset.appDirectChoice='true';
      card.addEventListener('click',function(){
        window.location.hash=card.getAttribute('data-choice')==='create-new'?'onboarding/templates':'onboarding/upgrade';
      });
    });
    var workspace=document.getElementById('cv-builder-workspace');
    function reportTabsVisibility(){
      if(window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-tabs-collapsed',collapsed:document.body.classList.contains('cv-mobile-topbar-collapsed')},'*');
    }
    new MutationObserver(reportTabsVisibility).observe(document.body,{attributes:true,attributeFilter:['class']});
    reportTabsVisibility();
    if(!workspace||workspace.querySelector('.cv-mobile-preview-action'))return;
    if(window.location.hash==='#preview'){
      document.body.classList.add('cv-mobile-preview-mode');
    }else{
      document.body.classList.remove('cv-mobile-preview-mode','cv-download-page-mode');
    }
    var previewAction=document.createElement('button');
    previewAction.type='button';
    previewAction.className='cv-mobile-preview-action';
    previewAction.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg><span>Preview</span>';
    var topbar=workspace.querySelector('.cv-workspace-topbar');
    var workspaceBody=workspace.querySelector('.cv-workspace-body');
    var previewColumn=workspace.querySelector('.cv-workspace-preview-column');
    var addContentContainer=workspace.querySelector('.cv-dash-add-content-container');
    var templatesTab=workspace.querySelector('.cv-topbar-templates-tab');
    var desktopPreviewFrame=0;
    function syncDesktopPreviewScale(){
      if(window.innerWidth<=768){
        // Mobile edits do not use desktop preview scaling, but the host must
        // still be told that the initialized workspace is ready to display.
        window.requestAnimationFrame(function(){
          if(!workspace.classList.contains('cv-hidden')&&window.parent!==window)
            window.parent.postMessage({type:'medbiomate-cv-preview-ready'},'*');
        });
        return;
      }
      if(!previewColumn)return;
      window.cancelAnimationFrame(desktopPreviewFrame);
      desktopPreviewFrame=window.requestAnimationFrame(function(){
        var columnStyle=window.getComputedStyle(previewColumn);
        var availableWidth=previewColumn.clientWidth-(parseFloat(columnStyle.paddingLeft)||0)-(parseFloat(columnStyle.paddingRight)||0);
        if(availableWidth<=0)return;
        var scale=Math.min(1.25,Math.max(.55,availableWidth/800));
        previewColumn.querySelectorAll('.cv-preview-sheet-container').forEach(function(sheet){
          var pages=Math.max(1,parseInt(window.getComputedStyle(sheet).getPropertyValue('--page-count'),10)||1);
          sheet.style.setProperty('width',(800*scale)+'px','important');
          sheet.style.setProperty('height',(1131.4*scale*pages)+'px','important');
          sheet.style.setProperty('max-width','none','important');
          var preview=sheet.querySelector('.cv-preview');
          if(!preview)return;
          preview.style.setProperty('width','800px','important');
          preview.style.setProperty('height',(1131.4*pages)+'px','important');
          preview.style.setProperty('transform','scale('+scale+')','important');
          preview.style.setProperty('transform-origin','top left','important');
        });
        workspace.classList.add('cv-preview-size-ready');
        if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-preview-ready'},'*');
      });
    }
    if(templatesTab)templatesTab.addEventListener('click',function(){
      // Return to the existing visual template gallery, so changing a template
      // always follows the same selection flow as initial CV creation.
      window.location.hash='onboarding/templates';
    });
    var currentWorkspaceTab='content';
    function openWorkspaceTab(tab){
      if(window.location.hash!=='#cv-workspace')window.location.hash='cv-workspace';
      window.requestAnimationFrame(function(){
        window.requestAnimationFrame(function(){
          var button=workspace.querySelector('[data-workspace-tab="'+tab+'"]');
          if(button)button.click();
        });
      });
    }
    window.addEventListener('message',function(event){
      if(event.source!==window.parent||!event.data||event.data.type!=='medbiomate-cv-host-action')return;
      var action=event.data.action;
      window.requestAnimationFrame(function(){
        if(action==='preview')previewAction.click();
        else if(action==='workspace-templates'&&templatesTab)templatesTab.click();
        else if(action==='workspace-content')openWorkspaceTab('content');
        else if(action==='workspace-customize')openWorkspaceTab('customize');
        else if(action==='workspace-download'){
          if(window.location.hash!=='#cv-workspace')window.location.hash='cv-workspace';
          window.requestAnimationFrame(function(){
            window.requestAnimationFrame(function(){document.getElementById('cv-workspace-download-btn')?.click()});
          });
        }
        else if(action==='workspace-save')window.dispatchEvent(new Event('medbiomate-request-save'));
        else if(action==='add-section'){
          var addButton=document.getElementById('cv-dash-add-content-btn');
          if(addButton)addButton.click();
        }else if(action==='reset-design'){
          var resetButton=document.getElementById('cv-restore-template-style');
          if(resetButton)resetButton.click();
        }else if(action==='back'){
          if(previewPopup&&!previewPopup.hidden)closePreviewPopup();
          else if(document.body.classList.contains('cv-mobile-preview-mode'))setMobileView('content');
        }
      });
    });
    function reportHostActions(tab){
      if(tab)currentWorkspaceTab=tab;
      var isMobile=window.innerWidth<=768;
      var visible=!workspace.classList.contains('cv-hidden')&&isMobile;
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-actions',tab:visible?currentWorkspaceTab:'hidden'},'*');
    }
    new MutationObserver(function(){reportHostActions()}).observe(workspace,{attributes:true,attributeFilter:['class']});
    var originalAddParent=addContentContainer?addContentContainer.parentElement:null;
    var originalAddSibling=addContentContainer?addContentContainer.nextSibling:null;
    var actionDock=document.createElement('div');
    actionDock.className='cv-mobile-action-dock';
    actionDock.setAttribute('aria-label','CV actions');
    actionDock.appendChild(previewAction);

    function syncMobileDesktopDock(){
      var isMobile=window.innerWidth<=768;
      if(topbar){
        if(isMobile)topbar.style.removeProperty('display');
        else topbar.style.setProperty('display','none','important');
      }
      if(isMobile){
        if(addContentContainer&&addContentContainer.parentElement!==actionDock){
          actionDock.appendChild(addContentContainer);
        }
        actionDock.style.display='';
        workspace.classList.add('cv-content-actions-visible');
      }else{
        if(addContentContainer&&originalAddParent&&addContentContainer.parentElement!==originalAddParent){
          if(originalAddSibling){
            originalAddParent.insertBefore(addContentContainer,originalAddSibling);
          }else{
            originalAddParent.appendChild(addContentContainer);
          }
        }
        actionDock.style.display='none';
        workspace.classList.remove('cv-content-actions-visible');
      }
      reportHostActions();
      syncDesktopPreviewScale();
    }
    syncMobileDesktopDock();
    window.addEventListener('resize',syncMobileDesktopDock);
    if(previewColumn)new MutationObserver(syncDesktopPreviewScale).observe(previewColumn,{childList:true,subtree:true});
    if(workspaceBody)workspaceBody.insertAdjacentElement('afterend',actionDock);
    var fullscreenPreviewHeader=document.createElement('header');
    fullscreenPreviewHeader.className='cv-fullscreen-preview-header';
    fullscreenPreviewHeader.innerHTML='<strong>Preview actions</strong><div class="cv-preview-header-actions"><button type="button" class="cv-fullscreen-preview-back" aria-label="Back to CV editor"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg><span>Back</span></button><button type="button" class="cv-preview-reset" aria-label="Reset CV design"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v6h6M5.5 15a7 7 0 1 0 1-7.5L4 10"/></svg><span>Reset</span></button></div>';
    if(previewColumn)previewColumn.appendChild(fullscreenPreviewHeader);
    var exportView=document.createElement('section');
    exportView.className='cv-export-view';
    exportView.setAttribute('aria-label','Download CV');
    exportView.innerHTML='<div class="cv-export-hero"><div class="cv-export-hero-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span>YOUR CV IS READY</span><h2>Choose a download format</h2><p>Select the file type that works best for where you are applying.</p></div>'+
      '<section class="cv-export-preview-card" aria-label="CV preview"><div class="cv-export-preview-heading"><div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg><strong>CV preview</strong></div><span class="cv-export-preview-count">Page 1</span></div><div class="cv-export-preview-stage"></div></section>'+
      '<div class="cv-export-formats">'+
        '<button type="button" class="cv-export-format cv-export-format-pdf" data-cv-format="pdf"><span class="cv-export-format-icon">PDF</span><strong>High-quality PDF</strong><small>Matches your preview</small><em>Recommended</em></button>'+
        '<button type="button" class="cv-export-format cv-export-format-word" data-cv-format="word"><span class="cv-export-format-icon">W</span><strong>Word document</strong><small>Editable text document</small><em>.DOC</em></button>'+
        '<button type="button" class="cv-export-format cv-export-format-png" data-cv-format="png"><span class="cv-export-format-icon">PNG</span><strong>PNG image</strong><small>High-quality image</small><em>.PNG</em></button>'+
        '<button type="button" class="cv-export-format cv-export-format-jpeg" data-cv-format="jpeg"><span class="cv-export-format-icon">JPG</span><strong>JPEG image</strong><small>Smaller image file</small><em>.JPG</em></button>'+
      '</div><div class="cv-export-note"><span aria-hidden="true">&#10003;</span><p><strong>Private and secure</strong>Your CV is prepared on this device.</p></div>';
    if(topbar)topbar.insertAdjacentElement('afterend',exportView);
    var exportPreviewCard=exportView.querySelector('.cv-export-preview-card');
    var exportPreviewStage=exportView.querySelector('.cv-export-preview-stage');
    var exportPreviewCount=exportView.querySelector('.cv-export-preview-count');
    var previewZoom=1;
    var pinchStartDistance=0;
    var pinchStartZoom=1;
    function applyPreviewZoom(nextZoom,originX,originY){
      previewZoom=Math.min(2.5,Math.max(1,nextZoom));
      if(!previewColumn)return;
      previewColumn.classList.toggle('is-zoomed',previewZoom>1.01);
      previewColumn.querySelectorAll('.cv-preview-sheet-container').forEach(function(sheet){
        var baseHeight=parseFloat(sheet.style.height)||sheet.getBoundingClientRect().height;
        sheet.style.setProperty('transform','scale('+previewZoom+')','important');
        sheet.style.setProperty('transform-origin',originX!=null?originX+'% '+originY+'%':'top left','important');
        sheet.style.setProperty('margin-bottom',(baseHeight*(previewZoom-1))+'px','important');
      });
      previewColumn.style.setProperty('--cv-preview-zoom-label',"'"+Math.round(previewZoom*100)+"%' ");
    }
    function touchDistance(touches){
      var dx=touches[0].clientX-touches[1].clientX;
      var dy=touches[0].clientY-touches[1].clientY;
      return Math.sqrt((dx*dx)+(dy*dy));
    }
    var previewPopup=document.createElement('section');
    previewPopup.className='cv-preview-popup';
    previewPopup.hidden=true;
    previewPopup.setAttribute('aria-label','Full screen CV preview');
    previewPopup.innerHTML='<header><button type="button" class="cv-preview-popup-back" aria-label="Close full preview"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg><span>Back</span></button><div><strong>Full preview</strong><small>Pinch or use the controls to zoom</small></div><nav aria-label="Preview zoom"><button type="button" data-popup-zoom="out" aria-label="Zoom out">−</button><output>100%</output><button type="button" data-popup-zoom="in" aria-label="Zoom in">+</button></nav></header><div class="cv-preview-popup-stage"><div class="cv-preview-popup-canvas"></div></div>';
    document.body.appendChild(previewPopup);
    var popupStage=previewPopup.querySelector('.cv-preview-popup-stage');
    var popupCanvas=previewPopup.querySelector('.cv-preview-popup-canvas');
    var popupOutput=previewPopup.querySelector('output');
    var popupSheet=null;
    var popupFitScale=1;
    var popupZoom=1;
    var popupContentHeight=1131.4;
    var popupPinchDistance=0;
    var popupPinchZoom=1;
    function applyPopupZoom(nextZoom){
      popupZoom=Math.min(3,Math.max(1,nextZoom));
      if(!popupSheet)return;
      var scale=popupFitScale*popupZoom;
      popupSheet.style.setProperty('transform','scale('+scale+')','important');
      popupCanvas.style.width=(800*scale)+'px';
      popupCanvas.style.height=(popupContentHeight*scale)+'px';
      popupOutput.textContent=Math.round(popupZoom*100)+'%';
    }
    function openPreviewPopup(sourceSheet){
      popupCanvas.innerHTML='';
      var sourcePaper=sourceSheet.querySelector('[data-preview]');
      var sourcePaperHeight=sourcePaper?parseFloat(sourcePaper.style.height):0;
      var sourceOverflowHeight=sourcePaper?sourcePaper.scrollHeight:0;
      var pageCount=parseFloat(getComputedStyle(sourceSheet).getPropertyValue('--page-count'))||0;
      popupContentHeight=Math.max(1131.4,sourcePaperHeight,sourceOverflowHeight,pageCount*1131.4);
      popupSheet=sourceSheet.cloneNode(true);
      popupSheet.querySelectorAll('[id]').forEach(function(node){node.removeAttribute('id')});
      popupSheet.classList.add('cv-preview-popup-sheet');
      popupSheet.style.setProperty('width','800px','important');
      popupSheet.style.setProperty('max-width','none','important');
      popupSheet.style.setProperty('height',popupContentHeight+'px','important');
      popupSheet.style.setProperty('margin','0','important');
      popupSheet.style.setProperty('overflow','visible','important');
      popupSheet.style.setProperty('transform-origin','top left','important');
      var popupPaper=popupSheet.querySelector('[data-preview]');
      if(popupPaper){
        popupPaper.style.setProperty('width','800px','important');
        popupPaper.style.setProperty('max-width','none','important');
        popupPaper.style.setProperty('height',popupContentHeight+'px','important');
        popupPaper.style.setProperty('overflow','visible','important');
        popupPaper.style.setProperty('transform','none','important');
      }
      popupCanvas.appendChild(popupSheet);
      previewPopup.hidden=false;
      // Some template layouts use positioned columns that are not included in
      // the stored page count. Measure the real lowest rendered descendant so
      // the full-screen preview can never crop the lower half of the CV.
      if(popupPaper){
        var paperTop=popupPaper.getBoundingClientRect().top;
        var renderedBottom=paperTop+Math.max(popupPaper.scrollHeight,popupPaper.offsetHeight);
        popupPaper.querySelectorAll('*').forEach(function(node){
          var rect=node.getBoundingClientRect();
          if(rect.height&&rect.bottom>renderedBottom)renderedBottom=rect.bottom;
        });
        popupContentHeight=Math.max(popupContentHeight,Math.ceil(renderedBottom-paperTop)+24);
        popupPaper.style.setProperty('height',popupContentHeight+'px','important');
        popupSheet.style.setProperty('height',popupContentHeight+'px','important');
      }
      document.body.classList.add('cv-preview-popup-open');
      popupFitScale=Math.min(.72,Math.max(.36,(window.innerWidth-16)/800));
      popupZoom=1;
      applyPopupZoom(1);
      popupStage.scrollTop=0;
      popupStage.scrollLeft=0;
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-preview-popup',open:true},'*');
    }
    function closePreviewPopup(){
      previewPopup.hidden=true;
      document.body.classList.remove('cv-preview-popup-open');
      popupCanvas.innerHTML='';
      popupSheet=null;
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-preview-popup',open:false},'*');
    }
    previewPopup.querySelector('.cv-preview-popup-back').addEventListener('click',closePreviewPopup);
    previewPopup.querySelector('[data-popup-zoom="out"]').addEventListener('click',function(){applyPopupZoom(popupZoom-.25)});
    previewPopup.querySelector('[data-popup-zoom="in"]').addEventListener('click',function(){applyPopupZoom(popupZoom+.25)});
    popupStage.addEventListener('touchstart',function(event){
      if(event.touches.length!==2)return;
      popupPinchDistance=touchDistance(event.touches);
      popupPinchZoom=popupZoom;
    },{passive:true});
    popupStage.addEventListener('touchmove',function(event){
      if(event.touches.length!==2||!popupPinchDistance)return;
      event.preventDefault();
      applyPopupZoom(popupPinchZoom*(touchDistance(event.touches)/popupPinchDistance));
    },{passive:false});
    popupStage.addEventListener('touchend',function(event){if(event.touches.length<2)popupPinchDistance=0},{passive:true});
    var mobilePage=0;
    var pageNav=document.createElement('nav');
    pageNav.setAttribute('aria-label','CV pages');
    pageNav.style.cssText='display:flex;align-items:center;justify-content:center;gap:16px;padding:8px;width:100%;';
    pageNav.innerHTML='<button type="button" aria-label="Previous page">←</button><span aria-live="polite"></span><button type="button" aria-label="Next page">→</button>';
    if(previewColumn)previewColumn.appendChild(pageNav);
    function showMobilePage(){
      var sheets=previewColumn.querySelectorAll('.cv-preview-sheet-container');
      mobilePage=Math.max(0,Math.min(mobilePage,sheets.length-1));
      sheets.forEach(function(sheet,index){sheet.style.setProperty('display',index===mobilePage?'block':'none','important')});
      pageNav.querySelector('span').textContent='Page '+(mobilePage+1)+' of '+sheets.length;
      pageNav.querySelectorAll('button')[0].disabled=mobilePage===0;
      pageNav.querySelectorAll('button')[1].disabled=mobilePage>=sheets.length-1;
      previewColumn.appendChild(pageNav);
      previewColumn.appendChild(fullscreenPreviewHeader);
    }
    pageNav.querySelectorAll('button')[0].onclick=function(){mobilePage--;showMobilePage()};
    pageNav.querySelectorAll('button')[1].onclick=function(){mobilePage++;showMobilePage()};
    var swipeStart=null;
    if(previewColumn){
      previewColumn.addEventListener('touchstart',function(e){swipeStart=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
      previewColumn.addEventListener('touchend',function(e){
        if(!swipeStart||previewZoom>1||!e.changedTouches.length)return;
        var dx=e.changedTouches[0].clientX-swipeStart.x,dy=e.changedTouches[0].clientY-swipeStart.y;
        swipeStart=null;
        if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){mobilePage+=dx<0?1:-1;showMobilePage()}
      },{passive:true});
    }
    function fitMobilePreview(){
      if(!window.matchMedia('(max-width: 600px)').matches)return;
      if(!previewColumn)return;
      // The CV is authored on an 800px-wide A4 canvas.  Scaling that canvas as a
      // single surface preserves its columns, typography and page breaks on mobile.
      var paperWidth=Math.max(280,Math.min(420,(previewColumn.clientWidth||388)-12));
      var paperScale=paperWidth/800;
      previewColumn.querySelectorAll('.cv-preview-sheet-container').forEach(function(sheet){
        var pageCount=parseFloat(getComputedStyle(sheet).getPropertyValue('--page-count'))||1;
        var paper=sheet.querySelector('[data-preview]');
        sheet.style.setProperty('width',paperWidth+'px','important');
        sheet.style.setProperty('max-width',paperWidth+'px','important');
        sheet.style.setProperty('height',(1131.4*paperScale)+'px','important');
        sheet.style.setProperty('min-height',(1131.4*paperScale)+'px','important');
        sheet.style.setProperty('max-height',(1131.4*paperScale)+'px','important');
        sheet.style.setProperty('aspect-ratio','auto','important');
        sheet.style.setProperty('overflow','hidden','important');
        if(!paper)return;
        paper.style.setProperty('width','800px','important');
        paper.style.setProperty('max-width','none','important');
        paper.style.setProperty('height',(1131.4*pageCount)+'px','important');
        paper.style.setProperty('transform','scale('+paperScale+')','important');
        paper.style.setProperty('transform-origin','top left','important');
        paper.style.setProperty('top',(-((Number(sheet.dataset.pageNumber)||1)-1)*1131.4*paperScale)+'px','important');
      });
      applyPreviewZoom(previewZoom);
      showMobilePage();
    }
    function syncExportPreview(){
      var pages=workspace.querySelectorAll('.cv-workspace-preview-column .cv-preview-sheet-container');
      if(!pages.length){exportPreviewCard.hidden=true;return}
      exportPreviewCard.hidden=false;
      exportPreviewStage.innerHTML='';
      var source=pages[0];
      var clone=source.cloneNode(true);
      clone.classList.add('cv-export-preview-sheet');
      clone.setAttribute('aria-hidden','true');
      exportPreviewStage.appendChild(clone);
      var sourceWidth=parseFloat(source.style.width)||source.getBoundingClientRect().width||339;
      var sourceHeight=parseFloat(source.style.height)||source.getBoundingClientRect().height||480;
      var targetWidth=Math.min(exportPreviewStage.clientWidth||220,220);
      var previewScale=targetWidth/sourceWidth;
      clone.style.transform='scale('+previewScale+')';
      exportPreviewStage.style.height=(sourceHeight*previewScale)+'px';
      exportPreviewCount.textContent=pages.length===1?'1 page':'1 of '+pages.length+' pages';
    }
    function setMobileView(view){
      var isPreview=view==='preview';
      var isDownload=view==='download';
      document.body.classList.toggle('cv-mobile-preview-mode',isPreview);
      document.body.classList.toggle('cv-download-page-mode',isDownload);
      if(workspaceBody){
        if(isDownload)workspaceBody.style.setProperty('display','none','important');
        else workspaceBody.style.removeProperty('display');
      }
      previewAction.classList.toggle('is-previewing',isPreview);
      previewAction.querySelector('span').textContent=isPreview?'Back':'Preview';
      var downloadTab=workspace.querySelector('.cv-topbar-download-tab');
      if(downloadTab)downloadTab.classList.toggle('is-active',isDownload);
      if(isDownload)reportHostActions('download');
      if(isPreview){
        previewColumn.querySelectorAll('.cv-preview-sheet-container').forEach(function(sheet){sheet.style.removeProperty('display')});
        window.dispatchEvent(new Event('cv-refresh-preview'));
        mobilePage=0;
        if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-actions',tab:'preview'},'*');
        previewZoom=1;
        if(previewColumn){previewColumn.scrollTop=0;previewColumn.scrollLeft=0;}
        window.requestAnimationFrame(fitMobilePreview);
      }else if(!isDownload){
        reportHostActions(currentWorkspaceTab);
      }
    }
    window.addEventListener('resize',function(){
      if(document.body.classList.contains('cv-mobile-preview-mode'))fitMobilePreview();
    });
    if(previewColumn){
      previewColumn.addEventListener('touchstart',function(event){
        if(!document.body.classList.contains('cv-mobile-preview-mode'))return;
        if(event.touches.length===2){
          pinchStartDistance=touchDistance(event.touches);
          pinchStartZoom=previewZoom;
        }
      },{passive:true});
      previewColumn.addEventListener('touchmove',function(event){
        if(event.touches.length===2&&pinchStartDistance){
          event.preventDefault();
          applyPreviewZoom(pinchStartZoom*(touchDistance(event.touches)/pinchStartDistance));
          return;
        }
      },{passive:false});
      previewColumn.addEventListener('touchend',function(event){
        if(event.touches.length<2)pinchStartDistance=0;
      },{passive:true});
      previewColumn.addEventListener('click',function(event){
        var sheet=event.target.closest('.cv-preview-sheet-container');
        if(sheet)openPreviewPopup(sheet);
      });
    }
    previewAction.addEventListener('click',function(){
      setMobileView(document.body.classList.contains('cv-mobile-preview-mode')?'edit':'preview');
    });
    fullscreenPreviewHeader.querySelector('.cv-fullscreen-preview-back').addEventListener('click',function(){
      setMobileView('edit');
    });
    fullscreenPreviewHeader.querySelector('.cv-preview-reset').addEventListener('click',function(){
      var restoreButton=workspace.querySelector('#cv-restore-template-style');
      if(restoreButton)restoreButton.click();
      window.requestAnimationFrame(fitMobilePreview);
    });
    var previewSaveButton=fullscreenPreviewHeader.querySelector('.cv-preview-save');
    if(previewSaveButton){
    previewSaveButton.addEventListener('click',function(){
      if(previewSaveButton.disabled)return;
      previewSaveButton.disabled=true;
      previewSaveButton.querySelector('span').textContent='Saving…';
      if(window.parent&&window.parent!==window)window.parent.postMessage({type:'medbiomate-cv-preview-save'},'*');
    });
    window.addEventListener('message',function(event){
      if(event.data&&event.data.type==='medbiomate-cv-preview-save-result'){
        previewSaveButton.disabled=false;
        previewSaveButton.classList.toggle('is-error',!event.data.success);
        previewSaveButton.querySelector('span').textContent=event.data.success?'Saved':'Retry';
        window.setTimeout(function(){
          if(!previewSaveButton.classList.contains('is-error'))previewSaveButton.querySelector('span').textContent='Save';
        },1600);
      }
    });
    }
    var downloadTab=workspace.querySelector('.cv-topbar-download-tab');
    if(downloadTab)downloadTab.addEventListener('click',function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      syncExportPreview();
      setMobileView('download');
      exportView.scrollTop=0;
    },true);
    exportView.addEventListener('click',function(event){
      var formatButton=event.target.closest('[data-cv-format]');
      if(!formatButton||formatButton.classList.contains('is-preparing'))return;
      formatButton.classList.add('is-preparing');
      formatButton.setAttribute('aria-busy','true');
      window.parent.postMessage({type:'medbiomate-cv-download',format:formatButton.getAttribute('data-cv-format')},'*');
      window.setTimeout(function(){formatButton.classList.remove('is-preparing');formatButton.removeAttribute('aria-busy')},2800);
    });
    workspace.addEventListener('click',function(event){
      var workspaceTab=event.target.closest('[data-workspace-tab]');
      if(workspaceTab){
        var workspaceTabName=workspaceTab.getAttribute('data-workspace-tab');
        workspace.classList.toggle('cv-overview-active',workspaceTabName==='overview');
        workspace.classList.toggle('cv-content-actions-visible',workspaceTabName==='content');
        setMobileView('edit');
        reportHostActions(workspaceTabName);
      }
    });
    reportHostActions();
    if(window.location.hash.includes('preview')) setMobileView('preview');
  }
  function setup(){setupOnboardingNavigation();setupTemplateModalPreviewRepair();setupMobileWorkspace()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
