(function () {
	const STORAGE_KEY = 'cvBuilderPluginState';

	// Error collection helper
	const collectedErrors = [];
	if (window.location.search.includes('debug=true')) {
		window.onerror = function (message, source, lineno, colno, error) {
			collectedErrors.push(`JS Error: ${message} at ${source}:${lineno}:${colno}`);
			return false;
		};
		const originalConsoleError = console.error;
		console.error = function (...args) {
			collectedErrors.push(`Console Error: ${args.map(a => String(a)).join(' ')}`);
			originalConsoleError.apply(console, args);
		};
	}

	const OPTIONAL_FIELDS = [
		{ id: 'website', label: 'Website', placeholder: 'e.g. portfolio.com' },
		{ id: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
		{ id: 'nationality', label: 'Nationality', placeholder: 'e.g. Canadian' },
		{ id: 'dob', label: 'Date of Birth', placeholder: 'e.g. March 15, 1990' },
		{ id: 'visa', label: 'Visa Status', placeholder: 'e.g. H1-B, Green Card' },
		{ id: 'passport', label: 'Passport or Id', placeholder: 'Enter ID number' },
		{ id: 'availability', label: 'Availability', placeholder: 'e.g. Immediate, 2 weeks notice' }
	];

	const ICONS = {
		location: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-10a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
		email: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2-.9 2-2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
		phone: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
		website: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
		linkedin: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
		dob: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
		nationality: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
		visa: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
		passport: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"></path><path d="M9 22V12h6v10"></path><path d="M2 10h20"></path><path d="M12 2a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"></path></svg>`,
		availability: `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
	};

	const defaultIcon = `<svg class="cv-contact-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

	const getPluginAssetUrl = (fileName) => {
		if (typeof cvBuilderData !== 'undefined' && cvBuilderData.pluginUrl) {
			return cvBuilderData.pluginUrl + fileName;
		}
		return fileName;
	};

	const PAGE_HEIGHT = 1131.4;
	const PAGE_HEADER_MARGIN = 37.8; // 1cm at 96dpi
	const PAGE_FOOTER_MARGIN = 37.8; // 1cm at 96dpi
	const PAGE_OVERFLOW_THRESHOLD = 90;
	let resizeModalPreviewFn = null;
	let resizeWorkspacePreviewFn = null;
	let previewResizeObserver = null;
	let queuePreviewLayoutSync = () => { };

	// Dedicated Print Mount Isolation for 100% accurate A4 printing
	const preparePrintClone = () => {
		const workspace = document.getElementById('cv-builder-workspace') || document.body;
		let mount = document.getElementById('cv-print-mount');
		if (!mount) {
			mount = document.createElement('div');
			mount.id = 'cv-print-mount';
			workspace.appendChild(mount);
		} else if (mount.parentElement !== workspace) {
			workspace.appendChild(mount);
		}
		mount.innerHTML = '';

		// Find active preview (workspace preview or modal preview)
		const activePreview = document.querySelector('.cv-workspace-preview-column [data-preview]') ||
			document.querySelector('[data-preview]') ||
			document.querySelector('[data-preview-modal]');

		if (!activePreview) return;

		const clone = activePreview.cloneNode(true);
		clone.removeAttribute('id');

		// Preserve all computed inline styles and CSS variables exactly
		clone.style.cssText = activePreview.style.cssText;
		clone.style.removeProperty('transform');
		clone.style.removeProperty('transform-origin');
		clone.style.removeProperty('position');
		clone.style.removeProperty('left');
		clone.style.removeProperty('top');
		clone.style.removeProperty('min-width');
		clone.style.removeProperty('max-width');
		clone.style.setProperty('width', '210mm', 'important');
		clone.style.setProperty('box-shadow', 'none', 'important');
		clone.style.setProperty('border-radius', '0', 'important');
		clone.style.setProperty('margin', '0', 'important');

		// Determine if content is 1 page or genuinely multi-page
		let measuredPages = 1;
		try {
			const measurement = measurePaginatedPreview(activePreview);
			if (measurement && measurement.pageCount) {
				measuredPages = measurement.pageCount;
			}
		} catch (err) {
			measuredPages = parseInt(activePreview.style.getPropertyValue('--page-count')) || 1;
		}

		if (measuredPages <= 1) {
			// Strict single page enforcement: fits exact A4 and prevents empty 2nd page spillover
			clone.style.setProperty('height', '296.8mm', 'important');
			clone.style.setProperty('max-height', '297mm', 'important');
			clone.style.setProperty('min-height', '296.8mm', 'important');
			clone.style.setProperty('overflow', 'hidden', 'important');
			clone.style.setProperty('page-break-after', 'avoid', 'important');
			clone.style.setProperty('break-after', 'avoid', 'important');
			mount.setAttribute('data-single-page', 'true');
		} else {
			// Multi page CV: allow natural page flow across multiple pages
			clone.style.setProperty('height', 'auto', 'important');
			clone.style.setProperty('min-height', `${measuredPages * 297}mm`, 'important');
			clone.style.removeProperty('max-height');
			clone.style.setProperty('overflow', 'visible', 'important');
			clone.style.removeProperty('page-break-after');
			clone.style.removeProperty('break-after');
			mount.removeAttribute('data-single-page');
		}

		mount.appendChild(clone);
	};

	const cleanupPrintClone = () => {
		const mount = document.getElementById('cv-print-mount');
		if (mount) {
			mount.innerHTML = '';
		}
	};

	window.addEventListener('beforeprint', () => {
		preparePrintClone();
	});

	window.addEventListener('afterprint', () => {
		cleanupPrintClone();
		if (resizeWorkspacePreviewFn) {
			resizeWorkspacePreviewFn();
		}
		if (resizeModalPreviewFn) {
			resizeModalPreviewFn();
		}
	});

	// Instantly clean up any legacy debug overlays
	const legacyDebug = document.getElementById('cv-debug-overlay');
	if (legacyDebug) legacyDebug.remove();

	const repairWorkspacePreviewStructure = (app) => {
		if (!app) return;
		const workspace = app.querySelector('#cv-builder-workspace');
		const workspaceBody = workspace ? workspace.querySelector('.cv-workspace-body') : null;
		const editorColumn = workspaceBody ? workspaceBody.querySelector('.cv-workspace-editor-column') : null;
		const previewColumn = app.querySelector('.cv-workspace-preview-column');
		if (!workspace || !workspaceBody || !editorColumn || !previewColumn) return;
		if (previewColumn.parentElement === workspaceBody && previewColumn.previousElementSibling === editorColumn) return;
		if (previewColumn.parentElement) {
			previewColumn.parentElement.removeChild(previewColumn);
		}
		if (editorColumn.nextSibling) {
			workspaceBody.insertBefore(previewColumn, editorColumn.nextSibling);
		} else {
			workspaceBody.appendChild(previewColumn);
		}
	};

	const defaultState = {
		template: 'classic',
		fullName: 'George Emmanuel',
		jobTitle: 'Project Manager',
		email: 'george.emmanuel@email.com',
		phone: '+44 7911 123456',
		location: 'London, United Kingdom',
		website: '',
		linkedin: 'linkedin.com/in/george-emmanuel',
		activeFields: ['linkedin'],
		summary: 'Project Manager with 6+ years of experience leading cross-functional teams, managing budgets, and executing high-impact international projects. Strong background in stakeholder alignment, resource scheduling, risk management, and vendor negotiations. Proven track record of delivering projects on time and within scope while adhering to global standards and best practices.',
		skills: [
			{ name: 'Project Planning', details: '', level: 'Expert' },
			{ name: 'Stakeholder Management', details: '', level: 'Expert' },
			{ name: 'Risk Management', details: '', level: 'Expert' },
			{ name: 'Agile Delivery', details: '', level: 'Expert' },
			{ name: 'Budget Tracking', details: '', level: 'Expert' },
			{ name: 'Process Improvement', details: '', level: 'Expert' },
			{ name: 'Jira', details: '', level: 'Expert' },
			{ name: 'Microsoft Project', details: '', level: 'Expert' },
			{ name: 'Resource Planning', details: '', level: 'Expert' },
			{ name: 'Change Management', details: '', level: 'Expert' }
		],
		certificates: [
			{ name: 'Project Management Professional (PMP)', link: '', details: '' },
			{ name: 'Certified ScrumMaster (CSM)', link: '', details: '' },
			{ name: 'Google Project Management Certificate', link: '', details: '' },
			{ name: 'PRINCE2 Foundation', link: '', details: '' }
		],
		languages: [
			{ name: 'English', details: '', level: 'Native/Bilingual' },
			{ name: 'French', details: '', level: 'Conversational' },
			{ name: 'Spanish', details: '', level: 'Intermediate' },
			{ name: 'German', details: '', level: 'Basic' }
		],
		interests: [],
		projects: [],
		experience: [
			{
				role: 'Project Manager',
				company: 'Northbridge Digital',
				companyLink: '',
				startDate: '2022/03',
				endDate: 'Present',
				city: 'London',
				country: 'United Kingdom',
				details: 'Managed release plans across product, engineering, and operations teams.\nCoordinated stakeholder updates, risk reviews, and milestone reporting.\nImproved delivery tracking, reducing gaps across concurrent workstreams.\nDelivered quarterly roadmap commitments within approved budgets.',
			},
			{
				role: 'Project Coordinator',
				company: 'MapleWorks Solutions',
				companyLink: '',
				startDate: '2019/07',
				endDate: '2022/02',
				city: 'London',
				country: 'United Kingdom',
				details: 'Supported schedules, budgets, and documentation for transformation initiatives.\nFacilitated team meetings and maintained cross-department action logs.\nEscalated risks before blockers affected delivery timelines.\nPrepared progress packs for sponsors and steering groups.',
			},
			{
				role: 'Operations Analyst',
				company: 'BrightPath Services',
				companyLink: '',
				startDate: '2017/09',
				endDate: '2019/06',
				city: 'Manchester',
				country: 'United Kingdom',
				details: 'Analyzed workflow data to identify service delivery delays.\nPrepared reports supporting resource planning and prioritization.\nDocumented process improvements for managers and project teams.\nBuilt performance dashboards used in monthly operational reviews.',
			},
			{
				role: 'Project Management Assistant',
				company: 'Apex Global Solutions',
				companyLink: '',
				startDate: '2016/09',
				endDate: '2017/04',
				city: 'Manchester',
				country: 'United Kingdom',
				details: 'Supported project timelines, meeting notes, and team follow-ups.\nUpdated task boards and tracked deadlines for project initiatives.\nMaintained project files, decision logs, and change records.\nCoordinated action owners to close overdue tasks.',
			}
		],
		education: [
			{
				degree: 'Bachelor of Commerce in Management',
				school: 'Metropolitan Business University',
				schoolLink: '',
				startDate: '2013',
				endDate: '2017',
				city: 'Manchester',
				country: 'United Kingdom',
				details: 'Focused on operations, organizational strategy, finance, and project delivery.',
			},
			{
				degree: 'Diploma in Business Administration',
				school: 'Westminster Management College',
				schoolLink: '',
				startDate: '2011',
				endDate: '2013',
				city: 'Bristol',
				country: 'United Kingdom',
				details: 'Completed practical coursework in business planning and process administration.',
			},
		],
		courses: [],
		photo: getPluginAssetUrl('george-avatar.png'),
		previewFontScale: 1.0,
		previewColorTitle: '',
		previewColorSubtitle: '',
		previewColorBody: '',
		previewColorBullet: '',
		previewColorDate: '',
		previewColorLocation: '',
		previewColorAccent: '',
		previewColorAccentDark: '',
		previewColorAccentSoft: '',
		previewColorAccentInk: '',
		previewColorAccentMuted: '',
		previewColorLeftBadge: '',
		previewColorRightBadge: '',
		previewColorPhotoBox: '',
		multiPageBackgroundColor: '#ffffff',
		multiSidebarColor: '#1e293b',
		sidebarTextColor: '#ffffff',
		boxBubbleColor: '#ebeffa',
		levelColor: '#6366f1',
		previewFontSizeBase: 9,
		previewFontSizeName: 11,
		previewFontSizeTitle: 5,
		previewFontSizeHeading: 3,
		previewFontSizeBody: 0,
		previewFontSizeEntry: -1,
		previewLineHeight: 115,
		previewElementSpace: 12,
		previewSideMargin: 22,
		previewVerticalMargin: 12,
		hideSummary: false
	};

	// One complete sample shared by every design, matching the gallery reference.
	const sampleContent = JSON.parse(JSON.stringify(Object.fromEntries(
		['fullName','jobTitle','email','phone','location','website','linkedin','activeFields','summary','experience','education','skills','languages','certificates','photo','interests','projects'].map(key => [key, defaultState[key]])
	)));
	sampleContent.summary = 'Project Manager with six years of experience coordinating cross-functional initiatives in technology and business operations. Skilled in stakeholder communication, project planning, risk tracking, and delivery governance across complex environments. Known for building practical workflows, improving team alignment, and keeping priorities moving under tight deadlines.';
	sampleContent.experience = JSON.parse(JSON.stringify(defaultState.experience));
	sampleContent.education = JSON.parse(JSON.stringify(defaultState.education));
	sampleContent.skills = JSON.parse(JSON.stringify(defaultState.skills));
	sampleContent.languages = JSON.parse(JSON.stringify(defaultState.languages));
	sampleContent.certificates = JSON.parse(JSON.stringify(defaultState.certificates));
	sampleContent.activeSections = ['summary','experience','education','skills','certificates','languages'];
	const freshSample = () => JSON.parse(JSON.stringify(sampleContent));
	const getContrastTextColor = (color, light = '#ffffff', dark = '#0f172a') => {
		if (!color || typeof color !== 'string') return light;
		const normalized = color.trim();
		if (!normalized.startsWith('#')) return light;
		let hex = normalized.slice(1);
		if (hex.length === 3) {
			hex = hex.split('').map(ch => ch + ch).join('');
		}
		if (hex.length !== 6) return light;
		const red = parseInt(hex.slice(0, 2), 16);
		const green = parseInt(hex.slice(2, 4), 16);
		const blue = parseInt(hex.slice(4, 6), 16);
		if ([red, green, blue].some(Number.isNaN)) return light;
		const luminance = ((0.299 * red) + (0.587 * green) + (0.114 * blue)) / 255;
		return luminance > 0.62 ? dark : light;
	};
	const templateColorDefaults = {
		classic:{colorMode:'single',colorTarget:'full',solidColor:'#22579b',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#1e293b',boxBubbleColor:'#ebeffa',levelColor:'#6366f1'},
		clear:{colorMode:'single',colorTarget:'full',solidColor:'#1f2937',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#1f2937',boxBubbleColor:'#f1f5f9',levelColor:'#475569'},
		modern:{colorMode:'multi',colorTarget:'column',solidColor:'#22579b',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#22579b',boxBubbleColor:'#eaf2ff',levelColor:'#2a6bbd'},
		bold:{colorMode:'single',colorTarget:'full',solidColor:'#7f1d1d',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#7f1d1d',boxBubbleColor:'#fee2e2',levelColor:'#b91c1c'},
		simple:{colorMode:'single',colorTarget:'full',solidColor:'#334155',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#334155',boxBubbleColor:'#f1f5f9',levelColor:'#64748b'},
		minimal:{colorMode:'single',colorTarget:'full',solidColor:'#22579b',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#1e293b',boxBubbleColor:'#f1f5f9',levelColor:'#22579b'},
		chromatic:{colorMode:'single',colorTarget:'full',solidColor:'#22579b',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#22579b',boxBubbleColor:'#eaf2ff',levelColor:'#2a6bbd'},
		visual:{colorMode:'single',colorTarget:'border',solidColor:'#e11d48',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#e11d48',boxBubbleColor:'#ffe4e6',levelColor:'#e11d48'},
		sleek:{colorMode:'single',colorTarget:'full',solidColor:'#19333d',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#19333d',boxBubbleColor:'#eef2f6',levelColor:'#19333d'},
		flare:{colorMode:'multi',colorTarget:'column',solidColor:'#40594b',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#40594b',boxBubbleColor:'#eef2ed',levelColor:'#40594b'},
		professional:{colorMode:'multi',colorTarget:'column',solidColor:'#8b8b82',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#ecece8',boxBubbleColor:'#eeeeeb',levelColor:'#8b8b82'},
		polished:{colorMode:'single',colorTarget:'full',solidColor:'#22579b',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#22579b',boxBubbleColor:'#eaf2ff',levelColor:'#22579b'},
		freeform:{colorMode:'multi',colorTarget:'column',solidColor:'#40594b',multiPageBackgroundColor:'#ffffff',multiSidebarColor:'#40594b',boxBubbleColor:'#eef2ed',levelColor:'#40594b'}
	};
	const applyTemplateDefaultPalette = (target, template) => {
		const palette = templateColorDefaults[template] || templateColorDefaults.classic;
		Object.assign(target, palette, {previewColorTitle:'#0f172a',previewColorSubtitle:'#334155',previewColorBody:'#334155',previewColorBullet:'#334155',previewColorDate:'#475569',previewColorLocation:'#475569',sidebarTextColor:getContrastTextColor(palette.multiSidebarColor),manualPageTextColor:false,manualSidebarTextColor:false});
	};
	const applyAutomaticPageContrast = (target, background) => {
		if (target.manualPageTextColor) return;
		const text = getContrastTextColor(background);
		target.previewColorTitle=text;target.previewColorSubtitle=text;target.previewColorBody=text;target.previewColorBullet=text;target.previewColorDate=text;target.previewColorLocation=text;
	};

	const annaFieldPrefill = {
		template: 'chromatic',
		fullName: 'Anna Field',
		jobTitle: 'Creative and Results-Driven Junior Project Manager',
		email: 'anna@field.com',
		phone: '+11 23434546',
		location: '123 Main Street, Paris, France',
		website: '',
		summary: 'Passionate and driven Junior Project Manager with a track record of delivering successful projects on time and within budget. Strong ability to lead cross-functional teams, effectively communicate with stakeholders, and adapt to dynamic environments. Committed to achieving outstanding results while maintaining a positive and collaborative work atmosphere.',
		skills: [
			{ name: '🔑 Exceptional leadership skills demonstrated through successful cross-functional team management, resulting in a 20% reduction in project delivery time.', details: '', level: 'Expert' },
			{ name: '🌟 Excellent communication and interpersonal skills, fostering strong relationships with stakeholders and ensuring seamless project execution.', details: '', level: 'Expert' },
			{ name: '🚀 Proven track record in managing projects from inception to completion, resulting in a 15% increase in overall project efficiency.', details: '', level: 'Expert' },
			{ name: '💡 Strategic problem solver with a keen eye for detail, leading to a 10% decrease in project errors and improved client satisfaction.', details: '', level: 'Expert' }
		],
		certificates: [
			{ name: 'Certified Associate in Project Management (CAPM)', link: '', details: '' },
			{ name: 'Professional Scrum Master I (PSM I)', link: '', details: '' }
		],
		languages: [
			{ name: 'French', details: '', level: '5/5' },
			{ name: 'English', details: '', level: '4/5' },
			{ name: 'Spanish', details: '', level: '4/5' }
		],
		interests: [],
		projects: [],
		experience: [
			{
				role: 'Junior Project Manager',
				company: 'ABC Corporation',
				startDate: '08/2021',
				endDate: 'Present',
				city: 'Paris',
				country: 'France',
				details: 'Successfully managed multiple projects simultaneously, coordinating cross-functional teams.\nLed a team of 10 members, delegating tasks and providing guidance resulting in a 30% reduction in project errors and improved team collaboration.'
			},
			{
				role: 'Assistant Project Manager',
				company: 'XYZ Solutions',
				startDate: '03/2019',
				endDate: '06/2021',
				city: 'Paris',
				country: 'France',
				details: 'Assisted in managing high-profile projects, contributing to a 15% increase in overall project efficiency.'
			}
		],
		education: [
			{
				degree: 'Bachelor of Science in Business Administration',
				school: 'Paris University',
				startDate: '09/2018',
				endDate: '2022',
				city: 'Paris',
				country: 'France',
				details: ''
			}
		],
		activeSections: ["summary", "experience", "education", "skills", "languages"],
		previewColorAccent: '#991b1b',
		previewColorTitle: '#ffffff',
		previewColorBody: '#374151',
		previewColorBullet: '#374151',
		previewColorDate: '#374151',
		previewColorLocation: '#374151',
		previewColorSidebarAccent: '',
		previewColorPhotoBox: '',
		previewFontSizeBase: 8.5,
		previewFontSizeName: 10,
		previewFontSizeTitle: 4,
		previewFontSizeHeading: 2,
		previewFontSizeBody: 0,
		previewFontSizeEntry: 0,
		previewLineHeight: 110,
		previewElementSpace: 8,
		previewSideMargin: 18,
		previewVerticalMargin: 10,
		hideSummary: false
	};

	const getDefaultStateForTemplate = (template) => {
		// Templates change presentation only. Every new CV starts with the same
		// concise one-page sample profile.
		void template;
		return defaultState;
	};

	const safeParse = (value) => {
		try {
			return JSON.parse(value);
		} catch (error) {
			return null;
		}
	};

	const formatAwardOrPubDate = (item) => {
		if (!item) return '';
		let parts = [];
		const showDay = !item.hideDay && item.day;
		const showMonth = !item.hideMonth && item.month;
		if (showDay) parts.push(item.day);
		if (showMonth) parts.push(item.month);
		if (item.year) parts.push(item.year);
		return parts.join(' ');
	};

	const cloneTemplate = (selector) => {
		const template = document.querySelector(selector);
		return template ? template.content.firstElementChild.cloneNode(true) : null;
	};

	const makePreviewItem = (title, subtitle, meta, details, location, subtitleLink) => {
		const item = document.createElement('article');
		item.className = 'cv-preview-item';

		const isClassic = typeof state !== 'undefined' && state.template === 'classic';
		let detailsHTML = '';
		if (details) {
			const lines = details.split('\n').map(l => l.trim()).filter(Boolean);
			if (lines.length > 1) {
				const itemMargin = isClassic ? '1.5px' : '6px';
				const lineHeight = isClassic ? '1.28' : '1.45';
				const ulMarginTop = isClassic ? '2px' : 'var(--cv-subtitle-text-space, 6px)';
				const bulletFont = isClassic ? "font-family: Georgia, 'Times New Roman', Times, serif; font-size: 7.8pt;" : '';
				detailsHTML = `<ul class="cv-preview-item-bullets" style="list-style-type: disc; margin-left: 20px; padding-left: 0; margin-top: ${ulMarginTop}; margin-bottom: 0; color: var(--cv-preview-bullet, var(--cv-preview-body, #111111));">` +
					lines.map(line => `<li style="margin-bottom: ${itemMargin}; line-height: ${lineHeight}; ${bulletFont}">${line.replace(/^[•\-\*]\s*/, '')}</li>`).join('') +
					`</ul>`;
			} else {
				const pFont = isClassic ? "font-family: Georgia, 'Times New Roman', Times, serif; font-size: 7.8pt;" : '';
				detailsHTML = `<p style="margin: var(--cv-subtitle-text-space, 6px) 0 0 0; line-height: 1.35; color: var(--cv-preview-body, #111111); ${pFont}">${details}</p>`;
			}
		}

		const renderedSubtitle = subtitleLink
			? `<a href="${subtitleLink.startsWith('http') ? subtitleLink : 'https://' + subtitleLink}" target="_blank" style="color: inherit; text-decoration: underline;">${subtitle || ''}</a>`
			: (subtitle || '');

		item.innerHTML = `
			<div class="cv-preview-item-header">
				<div class="cv-preview-item-header-left">
					<h4>${title || ''}</h4>
					<div class="cv-preview-item-meta cv-preview-item-subtitle subtitle">${renderedSubtitle}</div>
				</div>
				<div class="cv-preview-item-header-right">
					<div class="cv-preview-item-meta cv-preview-item-date date">${meta || ''}</div>
					${location ? `<div class="cv-preview-item-meta cv-preview-item-location location">${location}</div>` : ''}
				</div>
			</div>
			<div class="cv-preview-item-details">${detailsHTML}</div>
		`;
		return item;
	};

	const initApp = () => {
		document.querySelectorAll('[data-cv-builder]').forEach((app) => {
			repairWorkspacePreviewStructure(app);
			if (window.location.search.includes('clear=true')) {
				window.localStorage.removeItem(STORAGE_KEY);
				window.location.href = window.location.pathname;
				return;
			}
			let stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
			let forceGeorgeSeed = false;

			// Clean up default mock data for the 4 new sections from localStorage to start fresh
			if (stored) {
				let clearedNewSections = false;
				if (Array.isArray(stored.awards) && stored.awards.length === 1 && stored.awards[0].title === "Outstanding Employee of the Year") {
					stored.awards = [];
					clearedNewSections = true;
				}
				if (Array.isArray(stored.publications) && stored.publications.length === 1 && stored.publications[0].title === "Optimizing High-Throughput Web Applications") {
					stored.publications = [];
					clearedNewSections = true;
				}
				if (Array.isArray(stored.references) && stored.references.length === 1 && stored.references[0].name === "John Smith") {
					stored.references = [];
					clearedNewSections = true;
				}
				if (stored.declaration && stored.declaration.text === "I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.") {
					stored.declaration = {
						text: '',
						signature: '',
						name: '',
						place: '',
						date: ''
					};
					clearedNewSections = true;
				}
				if (Array.isArray(stored.interests) && stored.interests.length === 2 && stored.interests[0].name === "Technical Writing") {
					stored.interests = [];
					clearedNewSections = true;
				}
				if (Array.isArray(stored.projects) && stored.projects.length === 1 && stored.projects[0].title === "HVAC System Upgrade") {
					stored.projects = [];
					clearedNewSections = true;
				}
				if (Array.isArray(stored.certificates) && stored.certificates.length === 3 && stored.certificates[0].name === "AutoCAD Professional Certificate") {
					stored.certificates = [];
					clearedNewSections = true;
				}
				if (Array.isArray(stored.courses) && stored.courses.length === 1 && (stored.courses[0].title === "Project Management Professional (PMP)" || stored.courses[0].title === "Complete Web Development Bootcamp")) {
					stored.courses = [];
					clearedNewSections = true;
				}
				if (clearedNewSections && Array.isArray(stored.activeSections)) {
					stored.activeSections = stored.activeSections.filter(s => !['awards', 'publications', 'references', 'declaration', 'interests', 'projects', 'certificates', 'courses'].includes(s));
				}
				if (stored.boxBubbleColor === '#e11d48') {
					stored.boxBubbleColor = '#ebeffa';
					clearedNewSections = true;
				}
				if (clearedNewSections) {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
				}
			}

			if (window.location.search.includes('debug=true')) {
				const params = new URLSearchParams(window.location.search);
				stored = {
					template: "classic",
					fullName: "Emily Carter",
					email: "emily@example.com",
					previewFontScaleTitle: parseFloat(params.get('previewFontScaleTitle')) || 1.0,
					previewFontScaleSubtitle: parseFloat(params.get('previewFontScaleSubtitle')) || 1.0,
					previewFontScaleBody: parseFloat(params.get('previewFontScaleBody')) || 1.0,
					experience: [
						{
							role: "Digital Marketing Lead",
							company: "Giz Ads",
							startDate: "2022",
							endDate: "Present",
							city: "New Delhi",
							country: "India",
							details: "Team Management & Leadership: Directed and mentored a team of SEO executives, content writers, and developers to execute digital marketing campaigns.\nSEO & Ranking Achievements: Achieved top rankings for competitive keywords, resulting in a 40% increase in organic traffic within six months.\nClient & Project Management: Managed SEO campaigns for various clients, from strategy development to execution and reporting.\nWebsite Development: Collaborated with developers to optimize website structure, improve site speed, and implement schema markup.\nUser engagement and lead generation: Optimized landing pages and call-to-actions to improve conversion rates and lead quality.\nSEO Campaigns for Clients: Conducted technical SEO audits and implemented recommendations to fix crawl errors and broken links."
						},
						{
							role: "SEO Specialist",
							company: "Employer",
							startDate: "2020",
							endDate: "2022",
							city: "New Delhi",
							country: "India",
							details: "Managed the godigit website using Adobe Experience Manager (AEM CMS) and optimized over 1000+ pages. Managed the godigit website using Adobe Experience Manager (AEM CMS) and optimized over 1000+ pages.\nUtilized Google Analytics and Search Console to analyze website performance and make data-driven decisions for optimization. Utilized Google Analytics and Search Console to analyze website performance and make data-driven decisions for optimization.\nManaged business insurance theme, identified gaps, and optimized content to drive traffic. Managed business insurance theme, identified gaps, and optimized content to drive traffic.\nIdentified and resolved website technical issues, such as 404 errors and canonical problems, in collaboration with developers. Identified and resolved website technical issues, such as 404 errors and canonical problems, in collaboration with developers.\nManaged local SEO strategies via Google My Business to enhance web presence and reach targeted audiences. Managed local SEO strategies via Google My Business to enhance web presence and reach targeted audiences.\nConducted comprehensive keyword research, competitor analysis, and backlink analysis using SEMrush and other SEO tools. Conducted comprehensive keyword research, competitor analysis, and backlink analysis using SEMrush and other SEO tools.\nImplemented both on-page and off-page SEO techniques to enhance website rankings on search engine results pages. Implemented both on-page and off-page SEO techniques to enhance website rankings on search engine results pages.\nCollaborated with the team to develop tools for the Digit Mobile App and associated YouTube videos, effectively engaging the. Collaborated with the team to develop tools for the Digit Mobile App and associated YouTube videos, effectively engaging the.\ntarget audience. target audience.\nGenerated monthly reports on website performance and presented findings to management. Generated monthly reports on website performance and presented findings to management."
						}
					],
					education: [
						{
							degree: "Master of Business Administration Acharya Institute",
							school: "Sdm College Of Business Management Pg Centre Bachelor of Business Administration",
							location: "Mangalore University",
							startDate: "2021",
							endDate: "2022",
							details: "School"
						},
						{
							degree: "Marketing & Finance Marketing",
							school: "School",
							startDate: "2021",
							endDate: "2022"
						}
					],
					courses: [
						{
							title: "Complete Web Development Bootcamp",
							institution: "Udemy",
							startDate: "2020",
							endDate: "2020",
							location: "Online",
							details: "Learned HTML, CSS, JavaScript, Node.js, and React.\nCompleted multiple full-stack projects.",
							link: "https://udemy.com"
						}
					],
					awards: [
						{
							title: "Outstanding Employee of the Year",
							issuer: "Global Corp Inc.",
							day: "10",
							month: "October",
							year: "2024",
							hideDay: false,
							hideMonth: false,
							link: "https://globalcorp.com/awards/2024",
							details: "Received the annual award for leading the development of the high-performance real-time analytics system."
						}
					],
					publications: [
						{
							title: "Optimizing High-Throughput Web Applications",
							publisher: "International Journal of Software Engineering",
							day: "20",
							month: "June",
							year: "2023",
							hideDay: false,
							hideMonth: false,
							link: "https://ijse.org/papers/optimizing-web-apps",
							details: "Co-authored a paper on optimization strategies using non-blocking I/O architectures."
						}
					],
					references: [
						{
							name: "John Smith",
							jobTitle: "Senior Engineering Manager",
							organization: "Tech Solutions Corp",
							email: "john.smith@techsolutions.com",
							phone: "+1 (555) 019-2834",
							link: "https://linkedin.com/in/johnsmith"
						}
					],
					declaration: {
						text: "I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.",
						signature: "",
						name: "Rohan Kumar",
						place: "New Delhi, India",
						date: "01/08/2026"
					},
					languages: [
						{ name: 'English', details: '', level: 'Native/Bilingual' },
						{ name: 'French', details: '', level: 'Fluent' }
					],
					certificates: [
						{ name: 'AutoCAD Professional Certificate', details: 'asdasasdsaasdsasd', link: '' }
					],
					activeSections: ["summary", "experience", "education", "languages", "certificates", "courses", "awards", "publications", "references", "declaration"]
				};
			} else if (stored && stored.fullName === 'Ishaan Agrawal') {
				stored = Object.assign({}, defaultState, {
					template: stored.template || defaultState.template,
					photo: getPluginAssetUrl('george-avatar.png')
				});
				forceGeorgeSeed = true;
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
			} else if (stored && (stored.fullName === 'Jane Doe' || !stored.fullName || stored.fullName === 'Rohan K. Patel' || stored.fullName === 'Rohan Kumar' || stored.fullName === 'Emily Carter' || stored.fullName === 'Anna Field' || stored.fullName === 'Michael Nwosu' || (stored.photo && stored.photo.includes('unsplash')))) {
				window.localStorage.removeItem(STORAGE_KEY);
				stored = null;
			}
			const state = Object.assign({}, defaultState, stored || {});
			const shouldApplyGeorgeSeed = !stored || forceGeorgeSeed;

			const getGeorgeOnePageSections = (template) => {
				return ['summary', 'experience', 'education', 'skills', 'languages', 'certificates'];
			};

			// Auto-enrich George Emmanuel default profile with enough sample content for all templates
			if (state.fullName === 'George Emmanuel' && shouldApplyGeorgeSeed) {
				if (!Array.isArray(state.skills) || state.skills.length < 4) {
					state.skills = [
						{ name: 'Project Management', details: '', level: 'Expert' },
						{ name: 'Agile Methodologies', details: '', level: 'Expert' },
						{ name: 'Stakeholder Engagement', details: '', level: 'Expert' },
						{ name: 'Risk Management', details: '', level: 'Expert' }
					];
				}
				if (!Array.isArray(state.languages) || state.languages.length < 2) {
					state.languages = [
						{ name: 'English', details: '', level: 'Native/Bilingual' },
						{ name: 'Spanish', details: '', level: 'Fluent' }
					];
				}
				if (!Array.isArray(state.certificates) || state.certificates.length < 2) {
					state.certificates = [
						{ name: 'Lean Six Sigma Green Belt', link: 'iassc.org/certifications/lean-six-sigma-green-belt-certification', details: '' },
						{ name: 'Certified Supply Chain Professional (CSCP)', link: 'ascm.org/learning-development/certifications-credentials/cscp', details: '' }
					];
				}
				if (!Array.isArray(state.experience) || state.experience.length < 2) {
					state.experience = [
						{
							role: 'Senior Project Manager',
							company: 'Deloitte UK',
							companyLink: 'deloitte.com',
							startDate: '01/2022',
							endDate: 'Present',
							city: 'London',
							country: 'United Kingdom',
							details: 'Led delivery of enterprise digital transformation initiatives across EMEA.\nCoordinated resource allocation and budget management for a £2M portfolio.\nManaged client communications and secured steering committee approvals.'
						},
						{
							role: 'Project Associate',
							company: 'Unilever',
							companyLink: 'unilever.com',
							startDate: '07/2019',
							endDate: '12/2021',
							city: 'London',
							country: 'United Kingdom',
							details: 'Supported cross-functional product development pipelines for global markets.\nMaintained milestone tracking and project documentation under Prince2 framework.\nResolved supply chain coordination issues to reduce shipping delays.'
						}
					];
				}
				if (!Array.isArray(state.education) || state.education.length < 2) {
					state.education = [
						{
							degree: 'M.Sc. in Project Management',
							school: 'University of Manchester',
							schoolLink: 'manchester.ac.uk',
							startDate: '2016',
							endDate: '2017',
							city: 'Manchester',
							country: 'United Kingdom',
							details: 'Specialized in Agile Project Delivery and Risk Mitigation frameworks.\nGraduated with Distinction.'
						},
						{
							degree: 'B.Sc. in Business Administration',
							school: 'University of Bristol',
							schoolLink: 'bristol.ac.uk',
							startDate: '2013',
							endDate: '2016',
							city: 'Bristol',
							country: 'United Kingdom',
							details: 'Majored in Operations Management and Business Strategy.\nPresident of the Student Consulting Club.'
						}
					];
				}
				state.courses = [];
				state.projects = [];
				state.interests = [];
				state.activeSections = getGeorgeOnePageSections(state.template);
				state.photo = getPluginAssetUrl('george-avatar.png');
				if (Array.isArray(state.education)) {
					state.education.forEach(edu => {
						if (edu.school === 'University of Manchester' && !edu.details) {
							edu.details = 'Specialized in Agile Project Delivery and Risk Mitigation frameworks.\nGraduated with Distinction.';
						}
						if (edu.school === 'University of Bristol' && !edu.details) {
							edu.details = 'Majored in Operations Management and Business Strategy.\nPresident of the Student Consulting Club.';
						}
					});
				}
			}

			const normalizeState = (targetState) => {
				if (!targetState) return targetState;


				if (!Array.isArray(targetState.experience)) targetState.experience = [];

				// Dynamic migration to ultra-short single-line descriptions
				targetState.experience.forEach((exp) => {
					if (exp.company === 'Adani Infrastructure') {
						exp.details = 'Led project coordination for infrastructure upgrades.\nStandardized reporting to improve tracking accuracy.\nManaged vendor communication and material schedules.';
					} else if (exp.company === 'Larsen & Toubro') {
						exp.details = 'Supported equipment installation and safety compliance.\nCoordinated inspections to reduce commissioning delays.\nResolved engineering issues between design and site teams.';
					} else if (exp.company === 'Tata Projects') {
						exp.details = 'Assisted with BOQ preparation and site measurements.\nAssisted in material planning for civil and mechanical packages.';
					}
				});

				if (!Array.isArray(targetState.education)) targetState.education = [];
				if (!Array.isArray(targetState.courses)) targetState.courses = [];

				if (typeof targetState.skills === 'string') {
					const oldSkills = targetState.skills.split(',').map(s => s.trim()).filter(Boolean);
					targetState.skills = oldSkills.map(skill => {
						let name = skill;
						let level = 'Competent';
						if (skill.includes(':')) {
							const parts = skill.split(':');
							name = parts[0].trim();
							level = parts.slice(1).join(':').trim();
						} else if (skill.includes(' - ')) {
							const parts = skill.split(' - ');
							name = parts[0].trim();
							level = parts.slice(1).join(' - ').trim();
						} else if (skill.includes('(') && skill.includes(')')) {
							const start = skill.indexOf('(');
							const end = skill.indexOf(')');
							name = skill.substring(0, start).trim();
							level = skill.substring(start + 1, end).trim();
						}
						return {
							name: name,
							details: '',
							level: level
						};
					});
				}
				if (!Array.isArray(targetState.skills)) targetState.skills = [];

				if (typeof targetState.languages === 'string') {
					const oldLangs = targetState.languages.split(',').map(s => s.trim()).filter(Boolean);
					targetState.languages = oldLangs.map(lang => {
						let name = lang;
						let level = 'Fluent';
						if (lang.includes(':')) {
							const parts = lang.split(':');
							name = parts[0].trim();
							level = parts.slice(1).join(':').trim();
						} else if (lang.includes(' - ')) {
							const parts = lang.split(' - ');
							name = parts[0].trim();
							level = parts.slice(1).join(' - ').trim();
						} else if (lang.includes('(') && lang.includes(')')) {
							const start = lang.indexOf('(');
							const end = lang.indexOf(')');
							name = lang.substring(0, start).trim();
							level = lang.substring(start + 1, end).trim();
						}
						return {
							name: name,
							details: '',
							level: level
						};
					});
				}
				if (!Array.isArray(targetState.languages)) targetState.languages = [];

				if (typeof targetState.certificates === 'string') {
					const oldCerts = targetState.certificates.split(',').map(s => s.trim()).filter(Boolean);
					targetState.certificates = oldCerts.map(cert => {
						let name = cert;
						let details = '';
						if (cert.includes(' - ')) {
							const parts = cert.split(' - ');
							name = parts[0].trim();
							details = parts.slice(1).join(' - ').trim();
						}
						return {
							name: name,
							details: details,
							link: ''
						};
					});
				}
				if (!Array.isArray(targetState.certificates)) targetState.certificates = [];

				if (typeof targetState.interests === 'string') {
					const oldInts = targetState.interests.split(',').map(s => s.trim()).filter(Boolean);
					targetState.interests = oldInts.map(int => {
						let name = int;
						let details = '';
						if (int.includes(' - ')) {
							const parts = int.split(' - ');
							name = parts[0].trim();
							details = parts.slice(1).join(' - ').trim();
						}
						return {
							name: name,
							details: details,
							link: ''
						};
					});
				}
				if (!Array.isArray(targetState.interests)) targetState.interests = [];

				if (!Array.isArray(targetState.projects)) targetState.projects = [];

				if (!Array.isArray(targetState.awards)) targetState.awards = [];
				if (!Array.isArray(targetState.publications)) targetState.publications = [];
				if (!Array.isArray(targetState.references)) targetState.references = [];
				if (!targetState.declaration) {
					targetState.declaration = {
						text: '',
						signature: '',
						name: '',
						place: '',
						date: ''
					};
				}

				// Normalize optional fields and activeFields array
				if (!Array.isArray(targetState.activeFields)) {
					targetState.activeFields = ['website'];
				}
				OPTIONAL_FIELDS.forEach((f) => {
					const key = f.id;
					if (typeof targetState[key] !== 'string') {
						targetState[key] = '';
					}
					// If a field already has content, make sure it is marked active
					if (targetState[key] && targetState[key].trim() && !targetState.activeFields.includes(key)) {
						targetState.activeFields.push(key);
					}
				});

				// Normalize activeSections list
				if (!Array.isArray(targetState.activeSections)) {
					targetState.activeSections = [];
					if (targetState.summary) targetState.activeSections.push('summary');
					if (targetState.languages && targetState.languages.length > 0) targetState.activeSections.push('languages');
					if (targetState.experience && targetState.experience.length > 0) targetState.activeSections.push('experience');
					if (targetState.education && targetState.education.length > 0) targetState.activeSections.push('education');
					if (targetState.courses && targetState.courses.length > 0) targetState.activeSections.push('courses');
					if (targetState.skills && targetState.skills.length > 0) targetState.activeSections.push('skills');
					if (targetState.certificates && targetState.certificates.length > 0) targetState.activeSections.push('certificates');
					if (targetState.interests && targetState.interests.length > 0) targetState.activeSections.push('interests');
					if (targetState.projects && targetState.projects.length > 0) targetState.activeSections.push('projects');
					if (targetState.awards && targetState.awards.length > 0) targetState.activeSections.push('awards');
					if (targetState.publications && targetState.publications.length > 0) targetState.activeSections.push('publications');
					if (targetState.references && targetState.references.length > 0) targetState.activeSections.push('references');
					if (targetState.declaration && targetState.declaration.text) targetState.activeSections.push('declaration');
				}

				return targetState;
			};

			normalizeState(state);
			// Only migrate recognizable untouched demo content; keep personal edits.
			const isLegacySample = state.fullName === sampleContent.fullName && state.email === sampleContent.email &&
				state.jobTitle === sampleContent.jobTitle && state.phone === sampleContent.phone &&
				state.location === sampleContent.location && [sampleContent.summary, defaultState.summary].includes(state.summary);
			const hasCanonicalSample = (state.experience || []).length === 4 &&
				(state.experience || [])[0]?.company === 'Northbridge Digital' &&
				(state.education || []).length === 2 && (state.skills || []).length === 10 &&
				(state.certificates || []).length === 4 && (state.languages || []).length === 4 &&
				(state.projects || []).length === 0;
			if (!stored || (isLegacySample && (!hasCanonicalSample || (state.sampleContentVersion || 0) < 7))) {
				if (stored) localStorage.setItem(STORAGE_KEY + '-before-sample-repair', JSON.stringify(stored));
				Object.assign(state, freshSample(), {sampleContentVersion:7});
			}

			// Each design owns its typography; personal content remains shared.
			const typographyPresets = {
				classic: [7.8, 10, 2, 1.5, 118, 5, 14, 10],
				modern: [9, 12, 2, 3, 125, 18, 12, 10],
				bold: [9, 13, 2, 1.5, 125, 16, 0, 0],
				simple: [9, 14, 3, 2.5, 125, 20, 14, 10],
				minimal: [9, 12, 2, 1, 120, 16, 12, 12],
				chromatic: [9, 13, 3, 2, 120, 14, 12, 10],
				visual: [9, 14, 2, 3, 120, 18, 12, 10],
				sleek: [9, 11, 2, 1.5, 125, 16, 12, 12],
				flare: [9, 13, 2, 2.5, 120, 14, 0, 0],
				professional: [9, 12, 2, 2, 125, 16, 0, 0],
				clear: [9, 12, 2, 2, 125, 16, 12, 12]
			};
			const typographyKeys = ['previewFontSizeBase', 'previewFontSizeName', 'previewFontSizeTitle', 'previewFontSizeHeading', 'previewLineHeight', 'previewElementSpace', 'previewSideMargin', 'previewVerticalMargin'];
			const styleStorageKey = STORAGE_KEY + '-template-styles-v1';
			const templateStyles = safeParse(localStorage.getItem(styleStorageKey)) || {};
			// Compact, template-specific defaults keep the enriched sample on one A4
			// sheet while preserving each design's own heading hierarchy.
			const a4DefaultDensity = {
				classic: { body: 7.8, line: 118, space: 5 },
				modern: { body: 7.4, line: 120, space: 6 },
				bold: { body: 7.4, line: 118, space: 5 },
				simple: { body: 7.5, line: 120, space: 6 },
				minimal: { body: 7.5, line: 120, space: 5 },
				chromatic: { body: 7.4, line: 120, space: 6 },
				visual: { body: 7.4, line: 118, space: 5 },
				sleek: { body: 7.5, line: 120, space: 5 },
				flare: { body: 7.4, line: 118, space: 5 },
				professional: { body: 7.4, line: 118, space: 5 },
				clear: { body: 7.4, line: 120, space: 5 }
			};
			// Upgrade only unmodified old presets; preserve saved custom typography.
			Object.entries(typographyPresets).forEach(([template, old]) => {
				const saved = templateStyles[template];
				const previousA4Preset = [template === 'classic' ? 7.8 : 7.5, old[1], 2, template === 'classic' ? 1.5 : 2, template === 'classic' ? 118 : 130, template === 'classic' ? 5 : 10, old[6], old[7]];
				const savedMatches = candidate => typographyKeys.every((key, index) => saved && saved[key] === candidate[index]);
				if (saved && (savedMatches(old) || savedMatches(previousA4Preset))) {
					typographyKeys.forEach(key => { delete saved[key]; });
				}
				const density = a4DefaultDensity[template] || a4DefaultDensity.classic;
				typographyPresets[template] = [density.body, old[1], old[2], old[3], density.line, density.space, old[6], old[7]];
			});
			const isStyleKey = key => /^(preview|cust)/.test(key) || ['colorMode','colorTarget','solidColor','multiPageBackgroundColor','multiSidebarColor','sidebarTextColor','boxBubbleColor','levelColor'].includes(key);
			const originalStyle = template => {
				const values = typographyPresets[template] || typographyPresets.classic;
				const result = Object.fromEntries(Object.entries(defaultState).filter(([key]) => isStyleKey(key)));
				typographyKeys.forEach((key, index) => { result[key] = values[index]; });
				return Object.assign(result, {previewFontSizeBody:0, previewFontSizeEntry:0, previewSubtitleTextSpace:4});
			};
			let styledTemplate = null;
			const applyTemplateStyle = () => {
				if (styledTemplate === state.template) return;
				Object.keys(state).filter(isStyleKey).forEach(key => { delete state[key]; });
				Object.assign(state, originalStyle(state.template), templateStyles[state.template] || {});
				styledTemplate = state.template;
			};
			applyTemplateStyle();

			let previewSyncTimer = null;
			let richEditorPersistTimer = null;
			const syncResumeLibrary = () => {
				try {
					const activeId = window.localStorage.getItem('medbiomate-cv-active-id-v1');
					if (!activeId) return;
					const libraryKey = 'medbiomate-cv-library-v1';
					const library = safeParse(window.localStorage.getItem(libraryKey)) || [];
					const existingIndex = library.findIndex(entry => entry && entry.id === activeId);
					const fullName = String(state.fullName || '').trim();
					const currentName = existingIndex >= 0 ? library[existingIndex].name : '';
					const nextEntry = {
						id: activeId,
						name: fullName ? `${fullName} résumé` : (currentName || 'Untitled résumé'),
						template: state.template || 'classic',
						updatedAt: Date.now(),
						state: JSON.parse(JSON.stringify(state))
					};
					if (existingIndex >= 0) library[existingIndex] = nextEntry;
					else library.unshift(nextEntry);
					window.localStorage.setItem(libraryKey, JSON.stringify(library));
					if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'medbiomate-cv-library-updated' }, '*');
				} catch (error) {
					console.warn('Unable to update résumé library', error);
				}
			};

			const preview = app.querySelector('.cv-preview-sheet-container > [data-preview]');
			const fields = app.querySelectorAll('[data-field]');

			queuePreviewLayoutSync = () => {
				const runSync = () => {
					if (resizeWorkspacePreviewFn) {
						resizeWorkspacePreviewFn();
					}
					if (resizeModalPreviewFn) {
						resizeModalPreviewFn();
					}
				};

				window.requestAnimationFrame(() => {
					window.requestAnimationFrame(runSync);
				});

				[0, 60, 180, 360].forEach((delay) => {
					setTimeout(runSync, delay);
				});
			};

			const save = () => {
				applyTemplateStyle();
				templateStyles[state.template] = Object.fromEntries(Object.entries(state).filter(([key]) => isStyleKey(key)));
				window.localStorage.setItem(styleStorageKey, JSON.stringify(templateStyles));
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
				if (window.parent && window.parent !== window) {
					window.parent.postMessage({ type: 'medbiomate-cv-dirty' }, '*');
				}
			};

			window.addEventListener('medbiomate-request-save', () => {
				if (previewSyncTimer) {
					window.clearTimeout(previewSyncTimer);
					previewSyncTimer = null;
				}
				if (richEditorPersistTimer) {
					window.clearTimeout(richEditorPersistTimer);
					richEditorPersistTimer = null;
				}
				save();
				renderAll();
				queuePreviewLayoutSync();
				window.requestAnimationFrame(() => {
					window.requestAnimationFrame(() => {
						if (window.parent && window.parent !== window) {
							window.parent.postMessage({ type: 'medbiomate-cv-state-ready' }, '*');
						}
					});
				});
			});

			const schedulePreviewFieldRender = () => {
				if (previewSyncTimer) {
					window.clearTimeout(previewSyncTimer);
				}
				previewSyncTimer = window.setTimeout(() => {
					previewSyncTimer = null;
					renderAll();
					if (resizeWorkspacePreviewFn) {
						resizeWorkspacePreviewFn();
					}
				}, 250);
			};

			const scheduleRichEditorPersist = () => {
				if (richEditorPersistTimer) {
					window.clearTimeout(richEditorPersistTimer);
				}
				richEditorPersistTimer = window.setTimeout(() => {
					richEditorPersistTimer = null;
					save();
					renderBindableFields();
				}, 140);
			};

			const renderBindableFields = () => {
				if (!preview) return;
				app.querySelectorAll('[data-bind]').forEach((node) => {
					const key = node.dataset.bind;
					if (key === 'location') {
						node.textContent = [state.location, state.country].filter(Boolean).join(', ');
					} else if (key === 'website' || key === 'linkedin') {
						const linkVal = state['link_' + key];
						const textVal = state[key] || '';
						if (linkVal) {
							node.innerHTML = `<a href="${linkVal.startsWith('http') ? linkVal : 'https://' + linkVal}" target="_blank" style="color: inherit; text-decoration: underline;">${textVal}</a>`;
						} else {
							node.textContent = textVal;
						}
					} else if (key === 'summary') {
						node.innerHTML = state.summary || '';
					} else {
						node.textContent = state[key] || '';
					}

					// Hide preview item parent wrapper if the field is empty or inactive
					const contactItem = node.closest('.cv-preview-contact-item');
					if (contactItem) {
						const isFieldActive = !['website', 'linkedin', 'nationality', 'dob', 'visa', 'passport', 'availability'].includes(key) || (state.activeFields && state.activeFields.includes(key));
						let hasValue = !!state[key];
						if (key === 'location') {
							hasValue = !!state.location || !!state.country;
						}
						contactItem.classList.toggle('cv-hidden', !hasValue || !isFieldActive);
					}
				});
			};

			const isRichEditorEmpty = (html) => {
				if (!html) return true;
				const normalized = String(html)
					.replace(/\u200B/g, '')
					.replace(/<br\s*\/?>/gi, '')
					.replace(/&nbsp;/gi, '')
					.replace(/<div><\/div>/gi, '')
					.replace(/<p><\/p>/gi, '')
					.replace(/<[^>]+>/g, '')
					.trim();
				return !normalized;
			};

			const syncRichEditorEmptyState = (contentDiv) => {
				if (!contentDiv) return;
				const empty = isRichEditorEmpty(contentDiv.innerHTML);
				contentDiv.classList.toggle('is-empty', empty);
				if (empty && contentDiv.innerHTML !== '') {
					contentDiv.innerHTML = '';
				}
			};

			const setRichEditorValue = (contentDiv, value) => {
				if (!contentDiv) return;
				contentDiv.innerHTML = isRichEditorEmpty(value) ? '' : value;
				syncRichEditorEmptyState(contentDiv);
			};

			const placeCaretAtEnd = (contentDiv) => {
				if (!contentDiv) return;
				contentDiv.focus();
				const selection = window.getSelection();
				if (!selection) return;
				const range = document.createRange();
				range.selectNodeContents(contentDiv);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			};

			const ensureEditableCaretTarget = (contentDiv) => {
				if (!contentDiv || !isRichEditorEmpty(contentDiv.innerHTML)) return;
				contentDiv.innerHTML = '\u200B';
				contentDiv.classList.remove('is-empty');
				placeCaretAtEnd(contentDiv);
			};

			const activateEmptyRichEditor = (contentDiv) => {
				if (!contentDiv) return;
				ensureEditableCaretTarget(contentDiv);
				window.requestAnimationFrame(() => {
					placeCaretAtEnd(contentDiv);
				});
			};

			const insertPlainTextAtSelection = (contentDiv, text) => {
				contentDiv.focus();
				const selection = window.getSelection();
				if (!selection || selection.rangeCount === 0) {
					document.execCommand('insertText', false, text);
					return;
				}

				const range = selection.getRangeAt(0);
				range.deleteContents();

				const fragment = document.createDocumentFragment();
				const lines = text.replace(/\r/g, '').split('\n');
				lines.forEach((line, index) => {
					if (index > 0) {
						fragment.appendChild(document.createElement('br'));
					}
					fragment.appendChild(document.createTextNode(line));
				});

				range.insertNode(fragment);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			};

			const initRichEditors = () => {
				app.querySelectorAll('.cv-rich-editor').forEach((editorWrap) => {
					const contentDiv = editorWrap.querySelector('.cv-rich-editor-content');
					if (!contentDiv) return;

					syncRichEditorEmptyState(contentDiv);

					// Handle toolbar clicks
					editorWrap.querySelectorAll('.cv-rich-editor-toolbar button').forEach((btn) => {
						btn.addEventListener('mousedown', (e) => {
							e.preventDefault();

							// Check if selection is already inside contentDiv
							const selection = window.getSelection();
							let isInside = false;
							if (selection.rangeCount > 0) {
								const range = selection.getRangeAt(0);
								isInside = contentDiv.contains(range.commonAncestorContainer);
							}

							if (!isInside) {
								contentDiv.focus();
								const range = document.createRange();
								range.selectNodeContents(contentDiv);
								range.collapse(false); // Collapse to end
								selection.removeAllRanges();
								selection.addRange(range);
							}

							const cmd = btn.dataset.cmd;
							if (cmd === 'createLink') {
								const url = prompt('Enter URL:');
								if (url) {
									document.execCommand(cmd, false, url);
								}
							} else {
								document.execCommand(cmd, false, null);
							}

							// Keep focus on editor content
							contentDiv.focus();

							updateToolbarStatus(editorWrap, contentDiv);
							contentDiv.dispatchEvent(new Event('input', { bubbles: true }));
						});
					});

					// Focus styling
					contentDiv.addEventListener('focus', () => {
						editorWrap.classList.add('is-focused');
						activateEmptyRichEditor(contentDiv);
						updateToolbarStatus(editorWrap, contentDiv);
					});
					contentDiv.addEventListener('pointerdown', (event) => {
						if (event.button !== 0) return;
						if (!isRichEditorEmpty(contentDiv.innerHTML)) return;
						window.requestAnimationFrame(() => {
							activateEmptyRichEditor(contentDiv);
						});
					});
					contentDiv.addEventListener('click', () => {
						if (!isRichEditorEmpty(contentDiv.innerHTML)) return;
						activateEmptyRichEditor(contentDiv);
					});
					contentDiv.addEventListener('mouseup', () => {
						updateToolbarStatus(editorWrap, contentDiv);
						if (!isRichEditorEmpty(contentDiv.innerHTML)) return;
						activateEmptyRichEditor(contentDiv);
					});
					contentDiv.addEventListener('blur', () => {
						editorWrap.classList.remove('is-focused');
						syncRichEditorEmptyState(contentDiv);
					});

					// Sync contenteditable input event
					contentDiv.addEventListener('input', () => {
						syncRichEditorEmptyState(contentDiv);
						const fieldName = contentDiv.dataset.richField;
						if (fieldName) {
							state[fieldName] = isRichEditorEmpty(contentDiv.innerHTML) ? '' : contentDiv.innerHTML;
							schedulePreviewFieldRender();
							scheduleRichEditorPersist();
						}
					});

					contentDiv.addEventListener('paste', (event) => {
						event.preventDefault();
						const text = event.clipboardData?.getData('text/plain') || '';
						insertPlainTextAtSelection(contentDiv, text);
						contentDiv.dispatchEvent(new Event('input', { bubbles: true }));
					});

					contentDiv.addEventListener('keyup', () => updateToolbarStatus(editorWrap, contentDiv));
				});
			};

			const updateToolbarStatus = (editorWrap, contentDiv) => {
				const cmds = ['bold', 'italic', 'underline', 'insertUnorderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];

				// Detect if any alignment is active
				let isCenter = document.queryCommandState('justifyCenter');
				let isRight = document.queryCommandState('justifyRight');
				let isFull = document.queryCommandState('justifyFull');
				let isLeft = document.queryCommandState('justifyLeft');

				// If none of the alignment states are explicitly true, default to justifyLeft
				if (!isCenter && !isRight && !isFull && !isLeft) {
					isLeft = true;
				}

				cmds.forEach((cmd) => {
					const btn = editorWrap.querySelector(`[data-cmd="${cmd}"]`);
					if (btn) {
						let active = false;
						if (cmd === 'justifyLeft') active = isLeft;
						else if (cmd === 'justifyCenter') active = isCenter;
						else if (cmd === 'justifyRight') active = isRight;
						else if (cmd === 'justifyFull') active = isFull;
						else active = document.queryCommandState(cmd);

						btn.classList.toggle('is-active', active);
					}
				});
			};

			const getFilledDotsCount = (level) => {
				if (!level) return 3;
				const lvl = level.toLowerCase();
				if (lvl.includes('native') || lvl.includes('fluent') || lvl.includes('bilingual') || lvl.includes('expert') || lvl.includes('c2') || lvl.includes('5/5') || lvl === '5') return 5;
				if (lvl.includes('adv') || lvl.includes('c1') || lvl.includes('profess') || lvl.includes('4/5') || lvl === '4') return 4;
				if (lvl.includes('inter') || lvl.includes('b2') || lvl.includes('b1') || lvl.includes('good') || lvl.includes('3/5') || lvl === '3') return 3;
				if (lvl.includes('basic') || lvl.includes('elem') || lvl.includes('a2') || lvl.includes('a1') || lvl.includes('2/5') || lvl === '2') return 2;
				return 3;
			};

			const createBulletTextFragment = (text, withBullet = false) => {
				const fragment = document.createDocumentFragment();
				if (withBullet) {
					const bullet = document.createElement('span');
					bullet.className = 'cv-inline-bullet';
					bullet.textContent = '•';
					fragment.appendChild(bullet);

					const spacer = document.createTextNode(' ');
					fragment.appendChild(spacer);
				}

				fragment.appendChild(document.createTextNode(text));
				return fragment;
			};

			const createSeparatorNode = (separator) => {
				if (separator.trim() === '•') {
					const fragment = document.createDocumentFragment();
					fragment.appendChild(document.createTextNode(' '));
					const bullet = document.createElement('span');
					bullet.className = 'cv-inline-bullet';
					bullet.textContent = '•';
					fragment.appendChild(bullet);
					fragment.appendChild(document.createTextNode(' '));
					return fragment;
				}

				return document.createTextNode(separator);
			};

			const renderSkills = () => {
				app.querySelectorAll('[data-bind-list="skills"]').forEach((skillsNode) => {
					skillsNode.innerHTML = '';
					const skillList = Array.isArray(state.skills) ? state.skills : [];
					if (skillList.length === 0) return;

					let layout = state.custSkillsLayout || 'grid';
					if (state.template === 'bold') {
						layout = 'level';
					} else if (state.template === 'classic') {
						layout = 'grid';
					}
					const cols = state.template === 'classic' ? 2 : (state.custSkillsCols || 3);
					const rowSpace = state.custSkillsRowSpace || 'tight';
					const rowBullets = !!state.custSkillsRowBullets;
					const sep = state.custSkillsSep || 'bullet';
					const subinfoStyle = state.custSkillsSubinfo || 'colon';

					const formatSubinfo = (name, level) => {
						if (state.template === 'classic') return name;
						if (!level || state.hideSkillsStars) return name;
						if (subinfoStyle === 'colon') return `${name}: ${level}`;
						if (subinfoStyle === 'dash') return `${name} – ${level}`;
						if (subinfoStyle === 'bracket') return `${name} (${level})`;
						return `${name}: ${level}`;
					};

					if (layout === 'grid') {
						skillsNode.className = 'cv-skill-list cv-skills-grid-layout';
						skillsNode.style.display = 'grid';
						skillsNode.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
						skillsNode.style.gap = '8px';

						skillList.forEach((skill, idx) => {
							if (Array.isArray(state.hidden_skills) && state.hidden_skills.includes(idx)) return;
							const div = document.createElement('div');
							div.className = 'cv-skill-grid-item';

							const mainContainer = document.createElement('div');
							mainContainer.style.display = 'flex';
							mainContainer.style.flexDirection = 'column';

							const nameLabel = document.createElement('span');
							nameLabel.textContent = formatSubinfo(skill.name, skill.level);
							mainContainer.appendChild(nameLabel);

							if (skill.details && skill.details.trim()) {
								const detailsDiv = document.createElement('div');
								detailsDiv.className = 'cv-skill-details';
								detailsDiv.style.fontSize = '0.75rem';
								detailsDiv.style.color = 'var(--cv-preview-body, #718096)';
								detailsDiv.style.marginTop = '2px';
								detailsDiv.innerHTML = skill.details;
								mainContainer.appendChild(detailsDiv);
							}

							div.appendChild(mainContainer);
							skillsNode.appendChild(div);
						});
					} else if (layout === 'rows') {
						skillsNode.className = 'cv-skill-list cv-skills-rows-layout';
						skillsNode.style.display = 'flex';
						skillsNode.style.flexDirection = 'column';
						skillsNode.style.gap = rowSpace === 'spacious' ? '10px' : '4px';

						skillList.forEach((skill, idx) => {
							if (Array.isArray(state.hidden_skills) && state.hidden_skills.includes(idx)) return;
							const div = document.createElement('div');
							div.className = 'cv-skill-row-item';

							let bulletText = rowBullets ? '• ' : '';
							const mainContainer = document.createElement('div');
							mainContainer.style.display = 'flex';
							mainContainer.style.flexDirection = 'column';

							const nameLabel = document.createElement('span');
							nameLabel.appendChild(createBulletTextFragment(formatSubinfo(skill.name, skill.level), !!rowBullets));
							mainContainer.appendChild(nameLabel);

							if (skill.details && skill.details.trim()) {
								const detailsDiv = document.createElement('div');
								detailsDiv.className = 'cv-skill-details';
								detailsDiv.style.fontSize = '0.75rem';
								detailsDiv.style.color = 'var(--cv-preview-body, #718096)';
								detailsDiv.style.marginTop = '2px';
								detailsDiv.innerHTML = skill.details;
								mainContainer.appendChild(detailsDiv);
							}

							div.appendChild(mainContainer);
							skillsNode.appendChild(div);
						});
					} else if (layout === 'compact') {
						skillsNode.className = 'cv-skill-list cv-skills-compact-layout';
						skillsNode.style.display = 'block';

						const sepChar = sep === 'bullet' ? ' • ' : sep === 'pipe' ? ' | ' : ', ';
						const spans = [];

						skillList.forEach((skill, idx) => {
							if (Array.isArray(state.hidden_skills) && state.hidden_skills.includes(idx)) return;
							spans.push(formatSubinfo(skill.name, skill.level));
						});

						spans.forEach((label, index) => {
							if (index > 0) {
								skillsNode.appendChild(createSeparatorNode(sepChar.trim() === '•' ? '•' : sepChar));
							}
							skillsNode.appendChild(document.createTextNode(label));
						});
					} else if (layout === 'bubble') {
						skillsNode.className = 'cv-skill-list cv-skills-bubble-layout';
						skillsNode.style.display = 'flex';
						skillsNode.style.flexWrap = 'wrap';
						skillsNode.style.gap = '6px';

						skillList.forEach((skill, idx) => {
							if (Array.isArray(state.hidden_skills) && state.hidden_skills.includes(idx)) return;
							const chip = document.createElement('span');
							chip.className = 'cv-skill-chip cv-skill-chip-bubble';
							chip.textContent = formatSubinfo(skill.name, skill.level);
							skillsNode.appendChild(chip);
						});
					} else if (layout === 'level') {
						skillsNode.className = 'cv-skill-list cv-skills-level-layout';
						skillsNode.style.display = 'grid';
						skillsNode.style.gridTemplateColumns = 'repeat(2, 1fr)';
						skillsNode.style.gap = '10px 16px';

						skillList.forEach((skill, idx) => {
							if (Array.isArray(state.hidden_skills) && state.hidden_skills.includes(idx)) return;
							const div = document.createElement('div');
							div.className = 'cv-skill-level-item';

							const mainContainer = document.createElement('div');
							mainContainer.style.display = 'flex';
							mainContainer.style.flexDirection = 'column';
							mainContainer.style.flex = '1';

							const nameLabel = document.createElement('span');
							nameLabel.className = 'cv-skill-level-name';
							nameLabel.textContent = skill.name;
							mainContainer.appendChild(nameLabel);

							if (skill.details && skill.details.trim()) {
								const detailsDiv = document.createElement('div');
								detailsDiv.className = 'cv-skill-details';
								detailsDiv.style.fontSize = '0.75rem';
								detailsDiv.style.color = 'var(--cv-preview-body, #718096)';
								detailsDiv.style.marginTop = '2px';
								detailsDiv.innerHTML = skill.details;
								mainContainer.appendChild(detailsDiv);
							}
							div.appendChild(mainContainer);

							if (!state.hideSkillsStars) {
								if (state.template === 'bold') {
									const dotsContainer = document.createElement('div');
									dotsContainer.className = 'cv-skill-level-dots';

									const filledCount = getFilledDotsCount(skill.level);
									for (let i = 1; i <= 5; i++) {
										const dot = document.createElement('span');
										dot.className = 'cv-skill-level-dot' + (i <= filledCount ? ' is-filled' : '');
										dotsContainer.appendChild(dot);
									}
									div.appendChild(dotsContainer);
								} else {
									let width = '60%';
									const lvl = (skill.level || '').toLowerCase();
									if (lvl.includes('expert') || lvl.includes('adv') || lvl.includes('proficient') || lvl === '5' || lvl === '4') width = '90%';
									else if (lvl.includes('inter') || lvl.includes('medium') || lvl.includes('competent') || lvl === '3') width = '70%';
									else if (lvl.includes('begin') || lvl.includes('basic') || lvl.includes('amateur') || lvl === '1' || lvl === '2') width = '40%';

									const barBg = document.createElement('div');
									barBg.className = 'cv-skill-level-bar-bg';

									const barFill = document.createElement('div');
									barFill.className = 'cv-skill-level-bar-fill';
									barFill.style.width = width;

									barBg.appendChild(barFill);
									div.appendChild(barBg);
								}
							}
							skillsNode.appendChild(div);
						});
					}
				});
			};

			const renderCertificates = () => {
				app.querySelectorAll('[data-bind-list="certificates"]').forEach((node) => {
					node.innerHTML = '';
					const certList = Array.isArray(state.certificates) ? state.certificates : [];
					if (certList.length === 0) return;

					certList.forEach((item, idx) => {
						if (Array.isArray(state.hidden_certificates) && state.hidden_certificates.includes(idx)) return;

						let title = item.name || '';
						let subtitle = item.details || '';

						const temp = document.createElement('div');
						temp.innerHTML = subtitle;
						const plainSubtitle = temp.textContent || temp.innerText || '';

						const certOrder = state.custCertOrder || 'name-issuer';
						let displayText = title;
						if (certOrder === 'issuer-name' && plainSubtitle) {
							displayText = `${plainSubtitle} – ${title}`;
						} else if (plainSubtitle) {
							displayText = `${title} – ${plainSubtitle}`;
						}

						const chip = document.createElement('span');
						chip.className = 'cv-certificate-chip';

						if (state.template !== 'classic' && item.link && item.link.trim()) {
							const anchor = document.createElement('a');
							anchor.href = item.link.startsWith('http') ? item.link : 'https://' + item.link;
							anchor.target = '_blank';
							anchor.style.color = 'inherit';
							anchor.style.textDecoration = 'none';
							anchor.textContent = displayText;
							chip.appendChild(anchor);
						} else {
							chip.textContent = displayText;
						}

						node.appendChild(chip);
					});
				});
			};

			const renderInterests = () => {
				app.querySelectorAll('[data-bind-list="interests"]').forEach((node) => {
					node.innerHTML = '';
					const intList = Array.isArray(state.interests) ? state.interests : [];
					if (intList.length === 0) return;

					intList.forEach((item, idx) => {
						if (!item) return;
						if (Array.isArray(state.hidden_interests) && state.hidden_interests.includes(idx)) return;

						let title = item.name || '';
						let subtitle = item.details || '';

						const temp = document.createElement('div');
						temp.innerHTML = subtitle;
						const plainSubtitle = temp.textContent || temp.innerText || '';

						let displayText = title;
						if (plainSubtitle) {
							displayText = `${title} – ${plainSubtitle}`;
						}

						const chip = document.createElement('span');
						chip.className = 'cv-interests-chip cv-certificate-chip';

						if (item.link && item.link.trim()) {
							const anchor = document.createElement('a');
							anchor.href = item.link.startsWith('http') ? item.link : 'https://' + item.link;
							anchor.target = '_blank';
							anchor.style.color = 'inherit';
							anchor.style.textDecoration = 'none';
							anchor.textContent = displayText;
							chip.appendChild(anchor);
						} else {
							chip.textContent = displayText;
						}

						node.appendChild(chip);
					});
				});
			};

			const renderLanguages = () => {
				app.querySelectorAll('[data-bind-list="languages"]').forEach((node) => {
					node.innerHTML = '';
					const langList = Array.isArray(state.languages) ? state.languages : [];
					if (langList.length === 0) return;

					let layout = state.custLangLayout || 'grid';
					let levelStyle = state.custLangLevelStyle || 'text';
					let subinfoStyle = state.custLangSubinfo || 'colon';
					if (state.template === 'bold' || state.template === 'chromatic' || state.template === 'sleek') {
						layout = 'level';
						levelStyle = 'dots';
					} else if (state.template === 'visual') {
						layout = 'compact';
						subinfoStyle = 'dash';
					} else if (state.template === 'classic') {
						layout = 'grid';
					}
					const cols = state.template === 'classic' ? 2 : (state.custLangCols || 3);
					const rowSpace = state.custLangRowSpace || 'tight';
					const rowBullets = !!state.custLangRowBullets;
					const sep = state.custLangSep || 'bullet';

					const formatSubinfo = (name, level) => {
						if (state.template === 'classic') return name;
						if (!level || state.hideLangStars) return name;
						if (subinfoStyle === 'colon') return `${name}: ${level}`;
						if (subinfoStyle === 'dash') return `${name} – ${level}`;
						if (subinfoStyle === 'bracket') return `${name} (${level})`;
						return `${name}: ${level}`;
					};

					const getBarPercentWidth = (level) => {
						const lvl = (level || '').toLowerCase();
						if (lvl.includes('native') || lvl.includes('fluent') || lvl.includes('bilingual') || lvl.includes('expert') || lvl.includes('c2') || lvl.includes('5/5') || lvl === '5') return '100%';
						if (lvl.includes('adv') || lvl.includes('c1') || lvl.includes('profess') || lvl.includes('4/5') || lvl === '4') return '80%';
						if (lvl.includes('inter') || lvl.includes('b2') || lvl.includes('b1') || lvl.includes('good') || lvl.includes('3/5') || lvl === '3') return '60%';
						if (lvl.includes('basic') || lvl.includes('elem') || lvl.includes('a2') || lvl.includes('a1') || lvl.includes('2/5') || lvl === '2') return '40%';
						return '60%';
					};

					if (layout === 'grid') {
						node.className = 'cv-language-list cv-languages-grid-layout';
						node.style.display = 'grid';
						node.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
						node.style.gap = '8px';

						langList.forEach((lang, idx) => {
							if (Array.isArray(state.hidden_languages) && state.hidden_languages.includes(idx)) return;
							const div = document.createElement('div');
							div.className = 'cv-lang-grid-item';

							const mainContainer = document.createElement('div');
							mainContainer.style.display = 'flex';
							mainContainer.style.flexDirection = 'column';

							const nameLabel = document.createElement('span');
							nameLabel.textContent = formatSubinfo(lang.name, lang.level);
							mainContainer.appendChild(nameLabel);

							if (lang.details && lang.details.trim()) {
								const detailsDiv = document.createElement('div');
								detailsDiv.className = 'cv-lang-details';
								detailsDiv.style.fontSize = '0.75rem';
								detailsDiv.style.color = 'var(--cv-preview-body, #4b5563)';
								detailsDiv.style.marginTop = '2px';
								detailsDiv.innerHTML = lang.details;
								mainContainer.appendChild(detailsDiv);
							}

							div.appendChild(mainContainer);
							node.appendChild(div);
						});
					} else if (layout === 'rows') {
						node.className = 'cv-language-list cv-languages-rows-layout';
						node.style.display = 'flex';
						node.style.flexDirection = 'column';
						node.style.gap = rowSpace === 'spacious' ? '10px' : '4px';

						langList.forEach((lang, idx) => {
							if (Array.isArray(state.hidden_languages) && state.hidden_languages.includes(idx)) return;
							const div = document.createElement('div');
							div.className = 'cv-lang-row-item';

							let bulletText = rowBullets ? '• ' : '';
							const mainContainer = document.createElement('div');
							mainContainer.style.display = 'flex';
							mainContainer.style.flexDirection = 'column';

							const nameLabel = document.createElement('span');
							nameLabel.appendChild(createBulletTextFragment(formatSubinfo(lang.name, lang.level), !!rowBullets));
							mainContainer.appendChild(nameLabel);

							if (lang.details && lang.details.trim()) {
								const detailsDiv = document.createElement('div');
								detailsDiv.className = 'cv-lang-details';
								detailsDiv.style.fontSize = '0.75rem';
								detailsDiv.style.color = 'var(--cv-preview-body, #4b5563)';
								detailsDiv.style.marginTop = '2px';
								detailsDiv.innerHTML = lang.details;
								mainContainer.appendChild(detailsDiv);
							}

							div.appendChild(mainContainer);
							node.appendChild(div);
						});
					} else if (layout === 'compact') {
						node.className = 'cv-language-list cv-languages-compact-layout';
						node.style.display = 'block';

						const sepChar = sep === 'bullet' ? ' • ' : sep === 'pipe' ? ' | ' : ', ';
						const spans = [];

						langList.forEach((lang, idx) => {
							if (Array.isArray(state.hidden_languages) && state.hidden_languages.includes(idx)) return;
							spans.push(formatSubinfo(lang.name, lang.level));
						});

						spans.forEach((label, index) => {
							if (index > 0) {
								node.appendChild(createSeparatorNode(sepChar.trim() === '•' ? '•' : sepChar));
							}
							node.appendChild(document.createTextNode(label));
						});
					} else if (layout === 'bubble') {
						node.className = 'cv-language-list cv-languages-bubble-layout';
						node.style.display = 'flex';
						node.style.flexWrap = 'wrap';
						node.style.gap = '6px';

						langList.forEach((lang, idx) => {
							if (Array.isArray(state.hidden_languages) && state.hidden_languages.includes(idx)) return;
							const chip = document.createElement('span');
							chip.className = 'cv-language-chip cv-lang-chip-bubble';
							chip.textContent = formatSubinfo(lang.name, lang.level);
							node.appendChild(chip);
						});
					} else if (layout === 'level') {
						node.className = 'cv-language-list cv-languages-level-layout';
						node.style.display = 'flex';
						node.style.flexDirection = 'column';
						node.style.gap = '8px';

						langList.forEach((lang, idx) => {
							if (Array.isArray(state.hidden_languages) && state.hidden_languages.includes(idx)) return;
							const div = document.createElement('div');
							div.className = 'cv-lang-level-item';

							const mainContainer = document.createElement('div');
							mainContainer.style.display = 'flex';
							mainContainer.style.flexDirection = 'column';

							const nameLabel = document.createElement('span');
							nameLabel.className = 'cv-lang-level-name';
							nameLabel.textContent = lang.name;
							mainContainer.appendChild(nameLabel);

							if (lang.details && lang.details.trim()) {
								const detailsDiv = document.createElement('div');
								detailsDiv.className = 'cv-lang-details';
								detailsDiv.style.fontSize = '0.75rem';
								detailsDiv.style.color = 'var(--cv-preview-body, #4b5563)';
								detailsDiv.style.marginTop = '2px';
								detailsDiv.innerHTML = lang.details;
								mainContainer.appendChild(detailsDiv);
							}
							div.appendChild(mainContainer);

							if (!state.hideLangStars) {
								if (levelStyle === 'text') {
									const textVal = document.createElement('span');
									textVal.className = 'cv-lang-level-text-val';
									textVal.style.fontSize = 'var(--cv-base-font-size, 9pt)';
									textVal.style.color = 'inherit';
									textVal.style.opacity = '0.75';
									textVal.textContent = lang.level;
									div.appendChild(textVal);
								} else if (levelStyle === 'dots') {
									const dotsContainer = document.createElement('div');
									dotsContainer.className = 'cv-lang-level-dots';

									const filledCount = getFilledDotsCount(lang.level);
									for (let i = 1; i <= 5; i++) {
										const dot = document.createElement('span');
										dot.className = 'cv-lang-level-dot' + (i <= filledCount ? ' is-filled' : '');
										dotsContainer.appendChild(dot);
									}
									div.appendChild(dotsContainer);
								} else if (levelStyle === 'bar') {
									const barBg = document.createElement('div');
									barBg.className = 'cv-lang-level-bar-bg';

									const barFill = document.createElement('div');
									barFill.className = 'cv-lang-level-bar-fill';
									barFill.style.width = getBarPercentWidth(lang.level);

									barBg.appendChild(barFill);
									div.appendChild(barBg);
								}
							}

							node.appendChild(div);
						});
					}
				});
			};

			const renderCollectionPreview = () => {
				const experiencePreviews = app.querySelectorAll('[data-bind-list="experience"]');
				const educationPreviews = app.querySelectorAll('[data-bind-list="education"]');

				experiencePreviews.forEach((experiencePreview) => {
					experiencePreview.innerHTML = '';
					state.experience.forEach((item, idx) => {
						if (Array.isArray(state.hidden_experience) && state.hidden_experience.includes(idx)) return;
						const dateSep = state.template === 'classic' ? ' – ' : ' - ';
						experiencePreview.appendChild(
							makePreviewItem(
								item.role,
								item.company,
								[item.startDate, item.endDate].filter(Boolean).join(dateSep),
								item.details,
								item.location || [item.city, item.country].filter(Boolean).join(', '),
								item.companyLink
							)
						);
					});
				});

				educationPreviews.forEach((educationPreview) => {
					educationPreview.innerHTML = '';
					state.education.forEach((item, idx) => {
						if (Array.isArray(state.hidden_education) && state.hidden_education.includes(idx)) return;

						const eduOrder = state.custEduOrder || 'degree-school';
						let titleText = item.degree;
						let subtitleText = item.school;
						let link = item.schoolLink;

						if (eduOrder === 'school-degree') {
							titleText = item.schoolLink
								? `<a href="${item.schoolLink.startsWith('http') ? item.schoolLink : 'https://' + item.schoolLink}" target="_blank" style="color: inherit; text-decoration: underline;">${item.school}</a>`
								: item.school;
							subtitleText = item.degree;
							link = null;
						}

						const dateSep = state.template === 'classic' ? ' – ' : ' - ';
						educationPreview.appendChild(
							makePreviewItem(
								titleText,
								subtitleText,
								[item.startDate, item.endDate].filter(Boolean).join(dateSep),
								item.details,
								item.location || [item.city, item.country].filter(Boolean).join(', '),
								link
							)
						);
					});
				});

				const coursesPreviews = app.querySelectorAll('[data-bind-list="courses"]');
				coursesPreviews.forEach((coursesPreview) => {
					coursesPreview.innerHTML = '';
					const crsList = Array.isArray(state.courses) ? state.courses : [];
					crsList.forEach((item, idx) => {
						if (Array.isArray(state.hidden_courses) && state.hidden_courses.includes(idx)) return;

						const crsOrder = state.custCoursesOrder || 'title-institution';
						let titleText = item.title;
						let subtitleText = item.institution;
						let link = item.link;

						if (crsOrder === 'institution-title') {
							titleText = item.link
								? `<a href="${item.link.startsWith('http') ? item.link : 'https://' + item.link}" target="_blank" style="color: inherit; text-decoration: underline;">${item.institution}</a>`
								: item.institution;
							subtitleText = item.title;
							link = null;
						}

						coursesPreview.appendChild(
							makePreviewItem(
								titleText,
								subtitleText,
								[item.startDate, item.endDate].filter(Boolean).join(' - '),
								item.details,
								item.location || '',
								link
							)
						);
					});
				});

				const projectsPreviews = app.querySelectorAll('[data-bind-list="projects"]');
				projectsPreviews.forEach((projectsPreview) => {
					projectsPreview.innerHTML = '';
					const prjList = Array.isArray(state.projects) ? state.projects : [];
					prjList.forEach((item, idx) => {
						if (Array.isArray(state.hidden_projects) && state.hidden_projects.includes(idx)) return;
						projectsPreview.appendChild(
							makePreviewItem(
								item.title,
								item.subtitle,
								[item.startDate, item.endDate].filter(Boolean).join(' - '),
								item.details,
								'',
								item.link
							)
						);
					});
				});



				const awardsPreviews = app.querySelectorAll('[data-bind-list="awards"]');
				awardsPreviews.forEach((awardsPreview) => {
					awardsPreview.innerHTML = '';
					const awList = Array.isArray(state.awards) ? state.awards : [];
					awList.forEach((item, idx) => {
						if (Array.isArray(state.hidden_awards) && state.hidden_awards.includes(idx)) return;

						const order = state.custAwardsOrder || 'title-issuer';
						let titleText = item.title;
						let subtitleText = item.issuer;
						let link = item.link;

						if (order === 'issuer-title') {
							titleText = item.link
								? `<a href="${item.link.startsWith('http') ? item.link : 'https://' + item.link}" target="_blank" style="color: inherit; text-decoration: underline;">${item.issuer}</a>`
								: item.issuer;
							subtitleText = item.title;
							link = null;
						}

						awardsPreview.appendChild(
							makePreviewItem(
								titleText,
								subtitleText,
								formatAwardOrPubDate(item),
								item.details,
								'',
								link
							)
						);
					});
				});

				const publicationsPreviews = app.querySelectorAll('[data-bind-list="publications"]');
				publicationsPreviews.forEach((publicationsPreview) => {
					publicationsPreview.innerHTML = '';
					const pbList = Array.isArray(state.publications) ? state.publications : [];
					pbList.forEach((item, idx) => {
						if (Array.isArray(state.hidden_publications) && state.hidden_publications.includes(idx)) return;

						const order = state.custPublicationsOrder || 'title-publisher';
						let titleText = item.title;
						let subtitleText = item.publisher;
						let link = item.link;

						if (order === 'publisher-title') {
							titleText = item.link
								? `<a href="${item.link.startsWith('http') ? item.link : 'https://' + item.link}" target="_blank" style="color: inherit; text-decoration: underline;">${item.publisher}</a>`
								: item.publisher;
							subtitleText = item.title;
							link = null;
						}

						publicationsPreview.appendChild(
							makePreviewItem(
								titleText,
								subtitleText,
								formatAwardOrPubDate(item),
								item.details,
								'',
								link
							)
						);
					});
				});

				const referencesPreviews = app.querySelectorAll('[data-bind-list="references"]');
				referencesPreviews.forEach((referencesPreview) => {
					referencesPreview.innerHTML = '';
					const refList = Array.isArray(state.references) ? state.references : [];
					refList.forEach((item, idx) => {
						if (Array.isArray(state.hidden_references) && state.hidden_references.includes(idx)) return;

						let nameText = item.name;
						let jobInfo = [item.jobTitle, item.organization].filter(Boolean).join(', ');
						let contactInfo = [
							item.email ? `Email: ${item.email}` : '',
							item.phone ? `Phone: ${item.phone}` : ''
						].filter(Boolean).join(' | ');

						referencesPreview.appendChild(
							makePreviewItem(
								nameText,
								jobInfo,
								'',
								contactInfo ? `<p>${contactInfo}</p>` : '',
								'',
								item.link
							)
						);
					});
				});

				// Render Declaration Preview
				const decTextBinds = app.querySelectorAll('[data-bind-declaration="text"]');
				decTextBinds.forEach(el => el.textContent = state.declaration ? state.declaration.text : '');

				const decPlaceBinds = app.querySelectorAll('[data-bind-declaration="place"]');
				decPlaceBinds.forEach(el => el.textContent = state.declaration ? state.declaration.place : '');

				const decDateBinds = app.querySelectorAll('[data-bind-declaration="date"]');
				decDateBinds.forEach(el => el.textContent = state.declaration ? state.declaration.date : '');

				const decNameBinds = app.querySelectorAll('[data-bind-declaration="fullname"]');
				decNameBinds.forEach(el => el.textContent = state.declaration ? state.declaration.name : '');

				const decSigWraps = app.querySelectorAll('#cv-preview-declaration-sig-container');
				const decSigImgs = app.querySelectorAll('#cv-preview-declaration-sig-img');

				const sigVal = state.declaration ? state.declaration.signature : '';
				decSigImgs.forEach(img => {
					img.src = sigVal || '';
				});
				decSigWraps.forEach(wrap => {
					wrap.classList.toggle('cv-hidden', !sigVal);
				});
			};

			let editingExperienceIndex = -1;
			let editingEducationIndex = -1;

			const renderExperienceList = () => {
				const listContainer = app.querySelector('#cv-exp-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				state.experience.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info">
						<strong>${item.role || 'Job Position'}</strong>
						<span>${item.company || ''} (${item.startDate || ''} - ${item.endDate || ''})</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openExperienceEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.experience.splice(index, 1);
						save();
						renderExperienceList();
						renderCollectionPreview();
					});

					listContainer.appendChild(card);
				});
			};

			const openExperienceEdit = (index = -1) => {
				editingExperienceIndex = index;
				const editTitle = app.querySelector('#cv-exp-edit-title');
				const saveBtn = app.querySelector('#cv-exp-edit-save-btn');

				const jobtitleInp = app.querySelector('#cv-exp-jobtitle');
				const employerInp = app.querySelector('#cv-exp-employer');
				const startDateInp = app.querySelector('#cv-exp-start-date');
				const endDateInp = app.querySelector('#cv-exp-end-date');
				const locationInp = app.querySelector('#cv-exp-location');
				const descEditor = app.querySelector('#cv-exp-desc-rich-editor .cv-rich-editor-content');

				if (!jobtitleInp) return;

				if (index >= 0) {
					const item = state.experience[index];
					if (editTitle) editTitle.textContent = 'Update your experience';
					if (saveBtn) saveBtn.textContent = 'Save details';

					jobtitleInp.value = item.role || '';
					employerInp.value = item.company || '';
					employerInp.dataset.companyLink = item.companyLink || '';
					startDateInp.value = item.startDate || '';
					endDateInp.value = item.endDate || '';
					locationInp.value = item.location || [item.city, item.country].filter(Boolean).join(', ');
					if (descEditor) {
						descEditor.innerHTML = item.details || '';
					}

					const linkBtn = app.querySelector('#cv-exp-employer-link');
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.companyLink);
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add your experience';
					if (saveBtn) saveBtn.textContent = 'Add details';

					jobtitleInp.value = '';
					employerInp.value = '';
					employerInp.dataset.companyLink = '';
					startDateInp.value = '';
					endDateInp.value = '';
					locationInp.value = '';
					if (descEditor) {
						descEditor.innerHTML = '';
					}

					const linkBtn = app.querySelector('#cv-exp-employer-link');
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
				}

				const linkBtn = app.querySelector('#cv-exp-employer-link');
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = employerInp.dataset.companyLink || '';
						const newLink = prompt('Enter URL for Employer/Company:', currentLink);
						if (newLink !== null) {
							employerInp.dataset.companyLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-exp-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-exp-edit-view').classList.remove('cv-hidden');
			};

			const saveExperienceEntry = () => {
				const jobtitleInp = app.querySelector('#cv-exp-jobtitle');
				const employerInp = app.querySelector('#cv-exp-employer');
				const startDateInp = app.querySelector('#cv-exp-start-date');
				const endDateInp = app.querySelector('#cv-exp-end-date');
				const locationInp = app.querySelector('#cv-exp-location');
				const descEditor = app.querySelector('#cv-exp-desc-rich-editor .cv-rich-editor-content');

				const item = {
					role: jobtitleInp.value || 'Job Position',
					company: employerInp.value || 'Employer',
					companyLink: employerInp.dataset.companyLink || '',
					startDate: startDateInp.value.trim(),
					endDate: endDateInp.value.trim(),
					location: locationInp.value.trim(),
					details: descEditor ? descEditor.innerHTML : ''
				};

				if (editingExperienceIndex >= 0) {
					state.experience[editingExperienceIndex] = item;
				} else {
					state.experience.push(item);
				}

				save();
				renderExperienceList();
				renderCollectionPreview();

				app.querySelector('#cv-exp-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-exp-list-view').classList.remove('cv-hidden');
			};

			const renderEducationList = () => {
				const listContainer = app.querySelector('#cv-edu-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				state.education.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info">
						<strong>${item.degree || 'Degree / Field of Study'}</strong>
						<span>${item.school || ''} (${item.startDate || ''} - ${item.endDate || ''})</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openEducationEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.education.splice(index, 1);
						save();
						renderEducationList();
						renderCollectionPreview();
					});

					listContainer.appendChild(card);
				});
			};

			const openEducationEdit = (index = -1) => {
				editingEducationIndex = index;
				const editTitle = app.querySelector('#cv-edu-edit-title');
				const saveBtn = app.querySelector('#cv-edu-edit-save-btn');

				const degreeInp = app.querySelector('#cv-edu-degree');
				const schoolInp = app.querySelector('#cv-edu-school');
				const startDateInp = app.querySelector('#cv-edu-start-date');
				const endDateInp = app.querySelector('#cv-edu-end-date');
				const locationInp = app.querySelector('#cv-edu-location');
				const detailsEditor = app.querySelector('#cv-edu-details-rich-editor .cv-rich-editor-content');

				if (!degreeInp) return;

				if (index >= 0) {
					const item = state.education[index];
					if (editTitle) editTitle.textContent = 'Update your education';
					if (saveBtn) saveBtn.textContent = 'Save details';

					degreeInp.value = item.degree || '';
					schoolInp.value = item.school || '';
					schoolInp.dataset.schoolLink = item.schoolLink || '';
					startDateInp.value = item.startDate || '';
					endDateInp.value = item.endDate || '';
					locationInp.value = item.location || [item.city, item.country].filter(Boolean).join(', ');
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}

					const linkBtn = app.querySelector('#cv-edu-school-link');
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.schoolLink);
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add your education';
					if (saveBtn) saveBtn.textContent = 'Add details';

					degreeInp.value = '';
					schoolInp.value = '';
					schoolInp.dataset.schoolLink = '';
					startDateInp.value = '';
					endDateInp.value = '';
					locationInp.value = '';
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}

					const linkBtn = app.querySelector('#cv-edu-school-link');
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
				}

				const linkBtn = app.querySelector('#cv-edu-school-link');
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = schoolInp.dataset.schoolLink || '';
						const newLink = prompt('Enter URL for School/University:', currentLink);
						if (newLink !== null) {
							schoolInp.dataset.schoolLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-edu-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-edu-edit-view').classList.remove('cv-hidden');
			};

			const saveEducationEntry = () => {
				const degreeInp = app.querySelector('#cv-edu-degree');
				const schoolInp = app.querySelector('#cv-edu-school');
				const startDateInp = app.querySelector('#cv-edu-start-date');
				const endDateInp = app.querySelector('#cv-edu-end-date');
				const locationInp = app.querySelector('#cv-edu-location');
				const detailsEditor = app.querySelector('#cv-edu-details-rich-editor .cv-rich-editor-content');

				const item = {
					degree: degreeInp.value || 'Degree',
					school: schoolInp.value || 'School',
					schoolLink: schoolInp.dataset.schoolLink || '',
					startDate: startDateInp.value.trim(),
					endDate: endDateInp.value.trim(),
					location: locationInp.value.trim(),
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (editingEducationIndex >= 0) {
					state.education[editingEducationIndex] = item;
				} else {
					state.education.push(item);
				}

				save();
				renderEducationList();
				renderCollectionPreview();

				app.querySelector('#cv-edu-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-edu-list-view').classList.remove('cv-hidden');
			};

			let editingCoursesIndex = -1;

			const renderCoursesList = () => {
				const listContainer = app.querySelector('#cv-courses-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				const courseList = Array.isArray(state.courses) ? state.courses : [];

				courseList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info">
						<strong>${item.title || 'Course Title'}</strong>
						<span>${item.institution || ''} (${item.startDate || ''} - ${item.endDate || ''})</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openCoursesEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.courses.splice(index, 1);
						save();
						renderCoursesList();
						renderCollectionPreview();
					});

					listContainer.appendChild(card);
				});
			};

			const openCoursesEdit = (index = -1) => {
				editingCoursesIndex = index;
				const editTitle = app.querySelector('#cv-courses-edit-title');
				const saveBtn = app.querySelector('#cv-courses-edit-save-btn');

				const titleInp = app.querySelector('#cv-courses-title');
				const institutionInp = app.querySelector('#cv-courses-institution');
				const startDateInp = app.querySelector('#cv-courses-start-date');
				const endDateInp = app.querySelector('#cv-courses-end-date');
				const locationInp = app.querySelector('#cv-courses-location');
				const detailsEditor = app.querySelector('#cv-courses-details-rich-editor .cv-rich-editor-content');

				if (!titleInp) return;

				if (index >= 0) {
					const item = state.courses[index];
					if (editTitle) editTitle.textContent = 'Update your course';
					if (saveBtn) saveBtn.textContent = 'Save details';

					titleInp.value = item.title || '';
					institutionInp.value = item.institution || '';
					institutionInp.dataset.coursesLink = item.link || '';
					startDateInp.value = item.startDate || '';
					endDateInp.value = item.endDate || '';
					locationInp.value = item.location || '';
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}

					const linkBtn = app.querySelector('#cv-courses-link');
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.link);
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add your course';
					if (saveBtn) saveBtn.textContent = 'Add details';

					titleInp.value = '';
					institutionInp.value = '';
					institutionInp.dataset.coursesLink = '';
					startDateInp.value = '';
					endDateInp.value = '';
					locationInp.value = '';
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}

					const linkBtn = app.querySelector('#cv-courses-link');
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
				}

				const linkBtn = app.querySelector('#cv-courses-link');
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = institutionInp.dataset.coursesLink || '';
						const newLink = prompt('Enter URL for Course:', currentLink);
						if (newLink !== null) {
							institutionInp.dataset.coursesLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-courses-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-courses-edit-view').classList.remove('cv-hidden');
			};

			const saveCoursesEntry = () => {
				const titleInp = app.querySelector('#cv-courses-title');
				const institutionInp = app.querySelector('#cv-courses-institution');
				const startDateInp = app.querySelector('#cv-courses-start-date');
				const endDateInp = app.querySelector('#cv-courses-end-date');
				const locationInp = app.querySelector('#cv-courses-location');
				const detailsEditor = app.querySelector('#cv-courses-details-rich-editor .cv-rich-editor-content');

				const item = {
					title: titleInp.value || 'Course Title',
					institution: institutionInp.value || 'Institution',
					link: institutionInp.dataset.coursesLink || '',
					startDate: startDateInp.value.trim(),
					endDate: endDateInp.value.trim(),
					location: locationInp.value.trim(),
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (!Array.isArray(state.courses)) {
					state.courses = [];
				}

				if (editingCoursesIndex >= 0) {
					state.courses[editingCoursesIndex] = item;
				} else {
					state.courses.push(item);
				}

				save();
				renderCoursesList();
				if (!state.activeSections.includes('courses')) state.activeSections.push('courses');
				renderAll();
				queuePreviewLayoutSync();

				app.querySelector('#cv-courses-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-courses-list-view').classList.remove('cv-hidden');
			};

			let editingAwardsIndex = -1;
			let editingPublicationsIndex = -1;
			let editingReferencesIndex = -1;

			const populateDateSelects = (daySelect, monthSelect, yearSelect, selectedDay, selectedMonth, selectedYear) => {
				daySelect.innerHTML = '<option value="">Day</option>';
				monthSelect.innerHTML = '<option value="">Month</option>';
				yearSelect.innerHTML = '<option value="">Year</option>';
				for (let i = 1; i <= 31; i++) {
					const opt = document.createElement('option');
					opt.value = i.toString();
					opt.textContent = i.toString();
					if (selectedDay && selectedDay.toString() === i.toString()) opt.selected = true;
					daySelect.appendChild(opt);
				}
				const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				months.forEach((m) => {
					const opt = document.createElement('option');
					opt.value = m;
					opt.textContent = m;
					if (selectedMonth && selectedMonth.toLowerCase() === m.toLowerCase()) opt.selected = true;
					monthSelect.appendChild(opt);
				});
				const currentYr = new Date().getFullYear();
				for (let y = currentYr + 10; y >= 1950; y--) {
					const opt = document.createElement('option');
					opt.value = y.toString();
					opt.textContent = y.toString();
					if (selectedYear && selectedYear.toString() === y.toString()) opt.selected = true;
					yearSelect.appendChild(opt);
				}
			};

			// AWARDS SECTION
			const renderAwardsList = () => {
				const listContainer = app.querySelector('#cv-awards-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';
				const awList = Array.isArray(state.awards) ? state.awards : [];
				awList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info">
						<strong>${item.title || 'Award Title'}</strong>
						<span>${item.issuer || ''} (${formatAwardOrPubDate(item)})</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openAwardsEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.awards.splice(index, 1);
						save();
						renderAwardsList();
						renderCollectionPreview();
					});
					listContainer.appendChild(card);
				});
			};

			const openAwardsEdit = (index = -1) => {
				editingAwardsIndex = index;
				const editTitle = app.querySelector('#cv-awards-edit-title');
				const saveBtn = app.querySelector('#cv-awards-edit-save-btn');

				const titleInp = app.querySelector('#cv-awards-title');
				const issuerInp = app.querySelector('#cv-awards-issuer');
				const daySelect = app.querySelector('#cv-awards-date-day');
				const monthSelect = app.querySelector('#cv-awards-date-month');
				const yearSelect = app.querySelector('#cv-awards-date-year');
				const hideDayCheck = app.querySelector('#cv-awards-hide-day');
				const hideMonthCheck = app.querySelector('#cv-awards-hide-month');
				const detailsEditor = app.querySelector('#cv-awards-details-rich-editor .cv-rich-editor-content');

				if (!titleInp) return;

				if (index >= 0) {
					const item = state.awards[index];
					if (editTitle) editTitle.textContent = 'Update your award';
					if (saveBtn) saveBtn.textContent = 'Save details';

					titleInp.value = item.title || '';
					issuerInp.value = item.issuer || '';
					issuerInp.dataset.awardsLink = item.link || '';
					populateDateSelects(daySelect, monthSelect, yearSelect, item.day, item.month, item.year);
					hideDayCheck.checked = !!item.hideDay;
					hideMonthCheck.checked = !!item.hideMonth;
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}

					const linkBtn = app.querySelector('#cv-awards-link');
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.link);
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add your award';
					if (saveBtn) saveBtn.textContent = 'Add details';

					titleInp.value = '';
					issuerInp.value = '';
					issuerInp.dataset.awardsLink = '';
					populateDateSelects(daySelect, monthSelect, yearSelect, '', '', '');
					hideDayCheck.checked = false;
					hideMonthCheck.checked = false;
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}

					const linkBtn = app.querySelector('#cv-awards-link');
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
				}

				const linkBtn = app.querySelector('#cv-awards-link');
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = issuerInp.dataset.awardsLink || '';
						const newLink = prompt('Enter URL for Award:', currentLink);
						if (newLink !== null) {
							issuerInp.dataset.awardsLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-awards-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-awards-edit-view').classList.remove('cv-hidden');
			};

			const saveAwardsEntry = () => {
				const titleInp = app.querySelector('#cv-awards-title');
				const issuerInp = app.querySelector('#cv-awards-issuer');
				const daySelect = app.querySelector('#cv-awards-date-day');
				const monthSelect = app.querySelector('#cv-awards-date-month');
				const yearSelect = app.querySelector('#cv-awards-date-year');
				const hideDayCheck = app.querySelector('#cv-awards-hide-day');
				const hideMonthCheck = app.querySelector('#cv-awards-hide-month');
				const detailsEditor = app.querySelector('#cv-awards-details-rich-editor .cv-rich-editor-content');

				const item = {
					title: titleInp.value || 'Award Title',
					issuer: issuerInp.value || 'Issuer',
					link: issuerInp.dataset.awardsLink || '',
					day: daySelect.value,
					month: monthSelect.value,
					year: yearSelect.value,
					hideDay: hideDayCheck.checked,
					hideMonth: hideMonthCheck.checked,
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (!Array.isArray(state.awards)) {
					state.awards = [];
				}

				if (editingAwardsIndex >= 0) {
					state.awards[editingAwardsIndex] = item;
				} else {
					state.awards.push(item);
				}

				save();
				renderAwardsList();
				renderCollectionPreview();

				app.querySelector('#cv-awards-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-awards-list-view').classList.remove('cv-hidden');
			};


			// PUBLICATIONS SECTION
			const renderPublicationsList = () => {
				const listContainer = app.querySelector('#cv-publications-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';
				const pbList = Array.isArray(state.publications) ? state.publications : [];
				pbList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info">
						<strong>${item.title || 'Publication Title'}</strong>
						<span>${item.publisher || ''} (${formatAwardOrPubDate(item)})</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openPublicationsEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.publications.splice(index, 1);
						save();
						renderPublicationsList();
						renderCollectionPreview();
					});
					listContainer.appendChild(card);
				});
			};

			const openPublicationsEdit = (index = -1) => {
				editingPublicationsIndex = index;
				const editTitle = app.querySelector('#cv-publications-edit-title');
				const saveBtn = app.querySelector('#cv-publications-edit-save-btn');

				const titleInp = app.querySelector('#cv-publications-title');
				const publisherInp = app.querySelector('#cv-publications-publisher');
				const daySelect = app.querySelector('#cv-publications-date-day');
				const monthSelect = app.querySelector('#cv-publications-date-month');
				const yearSelect = app.querySelector('#cv-publications-date-year');
				const hideDayCheck = app.querySelector('#cv-publications-hide-day');
				const hideMonthCheck = app.querySelector('#cv-publications-hide-month');
				const detailsEditor = app.querySelector('#cv-publications-details-rich-editor .cv-rich-editor-content');

				if (!titleInp) return;

				if (index >= 0) {
					const item = state.publications[index];
					if (editTitle) editTitle.textContent = 'Update your publication';
					if (saveBtn) saveBtn.textContent = 'Save details';

					titleInp.value = item.title || '';
					publisherInp.value = item.publisher || '';
					publisherInp.dataset.publicationsLink = item.link || '';
					populateDateSelects(daySelect, monthSelect, yearSelect, item.day, item.month, item.year);
					hideDayCheck.checked = !!item.hideDay;
					hideMonthCheck.checked = !!item.hideMonth;
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}

					const linkBtn = app.querySelector('#cv-publications-link');
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.link);
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add your publication';
					if (saveBtn) saveBtn.textContent = 'Add details';

					titleInp.value = '';
					publisherInp.value = '';
					publisherInp.dataset.publicationsLink = '';
					populateDateSelects(daySelect, monthSelect, yearSelect, '', '', '');
					hideDayCheck.checked = false;
					hideMonthCheck.checked = false;
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}

					const linkBtn = app.querySelector('#cv-publications-link');
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
				}

				const linkBtn = app.querySelector('#cv-publications-link');
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = publisherInp.dataset.publicationsLink || '';
						const newLink = prompt('Enter URL for Publication:', currentLink);
						if (newLink !== null) {
							publisherInp.dataset.publicationsLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-publications-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-publications-edit-view').classList.remove('cv-hidden');
			};

			const savePublicationsEntry = () => {
				const titleInp = app.querySelector('#cv-publications-title');
				const publisherInp = app.querySelector('#cv-publications-publisher');
				const daySelect = app.querySelector('#cv-publications-date-day');
				const monthSelect = app.querySelector('#cv-publications-date-month');
				const yearSelect = app.querySelector('#cv-publications-date-year');
				const hideDayCheck = app.querySelector('#cv-publications-hide-day');
				const hideMonthCheck = app.querySelector('#cv-publications-hide-month');
				const detailsEditor = app.querySelector('#cv-publications-details-rich-editor .cv-rich-editor-content');

				const item = {
					title: titleInp.value || 'Publication Title',
					publisher: publisherInp.value || 'Publisher',
					link: publisherInp.dataset.publicationsLink || '',
					day: daySelect.value,
					month: monthSelect.value,
					year: yearSelect.value,
					hideDay: hideDayCheck.checked,
					hideMonth: hideMonthCheck.checked,
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (!Array.isArray(state.publications)) {
					state.publications = [];
				}

				if (editingPublicationsIndex >= 0) {
					state.publications[editingPublicationsIndex] = item;
				} else {
					state.publications.push(item);
				}

				save();
				renderPublicationsList();
				renderCollectionPreview();

				app.querySelector('#cv-publications-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-publications-list-view').classList.remove('cv-hidden');
			};


			// REFERENCES SECTION
			const renderReferencesList = () => {
				const listContainer = app.querySelector('#cv-references-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';
				const refList = Array.isArray(state.references) ? state.references : [];
				refList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info">
						<strong>${item.name || 'Reference Name'}</strong>
						<span>${item.jobTitle || ''}${item.organization ? ', ' + item.organization : ''}</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openReferencesEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.references.splice(index, 1);
						save();
						renderReferencesList();
						renderCollectionPreview();
					});
					listContainer.appendChild(card);
				});
			};

			const openReferencesEdit = (index = -1) => {
				editingReferencesIndex = index;
				const editTitle = app.querySelector('#cv-references-edit-title');
				const saveBtn = app.querySelector('#cv-references-edit-save-btn');

				const nameInp = app.querySelector('#cv-references-name');
				const jobTitleInp = app.querySelector('#cv-references-job-title');
				const orgInp = app.querySelector('#cv-references-organization');
				const emailInp = app.querySelector('#cv-references-email');
				const phoneInp = app.querySelector('#cv-references-phone');

				if (!nameInp) return;

				if (index >= 0) {
					const item = state.references[index];
					if (editTitle) editTitle.textContent = 'Update reference details';
					if (saveBtn) saveBtn.textContent = 'Save details';

					nameInp.value = item.name || '';
					nameInp.dataset.referencesLink = item.link || '';
					jobTitleInp.value = item.jobTitle || '';
					orgInp.value = item.organization || '';
					emailInp.value = item.email || '';
					phoneInp.value = item.phone || '';

					const linkBtn = app.querySelector('#cv-references-link');
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.link);
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add reference details';
					if (saveBtn) saveBtn.textContent = 'Add details';

					nameInp.value = '';
					nameInp.dataset.referencesLink = '';
					jobTitleInp.value = '';
					orgInp.value = '';
					emailInp.value = '';
					phoneInp.value = '';

					const linkBtn = app.querySelector('#cv-references-link');
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
				}

				const linkBtn = app.querySelector('#cv-references-link');
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = nameInp.dataset.referencesLink || '';
						const newLink = prompt('Enter URL for Reference:', currentLink);
						if (newLink !== null) {
							nameInp.dataset.referencesLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-references-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-references-edit-view').classList.remove('cv-hidden');
			};

			const saveReferencesEntry = () => {
				const nameInp = app.querySelector('#cv-references-name');
				const jobTitleInp = app.querySelector('#cv-references-job-title');
				const orgInp = app.querySelector('#cv-references-organization');
				const emailInp = app.querySelector('#cv-references-email');
				const phoneInp = app.querySelector('#cv-references-phone');

				const item = {
					name: nameInp.value || 'Reference Name',
					jobTitle: jobTitleInp.value.trim(),
					organization: orgInp.value.trim(),
					email: emailInp.value.trim(),
					phone: phoneInp.value.trim(),
					link: nameInp.dataset.referencesLink || ''
				};

				if (!Array.isArray(state.references)) {
					state.references = [];
				}

				if (editingReferencesIndex >= 0) {
					state.references[editingReferencesIndex] = item;
				} else {
					state.references.push(item);
				}

				save();
				renderReferencesList();
				renderCollectionPreview();

				app.querySelector('#cv-references-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-references-list-view').classList.remove('cv-hidden');
			};


			// DECLARATION SECTION
			const openDeclarationEdit = () => {
				const textInp = app.querySelector('#cv-declaration-text');
				const nameInp = app.querySelector('#cv-declaration-fullname');
				const placeInp = app.querySelector('#cv-declaration-place');
				const dateInp = app.querySelector('#cv-declaration-date');

				if (!textInp) return;

				const dec = state.declaration || { text: '', signature: '', name: '', place: '', date: '' };
				textInp.value = dec.text || '';
				nameInp.value = dec.name || '';
				placeInp.value = dec.place || '';
				dateInp.value = dec.date || '';

				setDeclarationSignature(dec.signature || '');
			};

			const saveDeclarationEntry = () => {
				const textInp = app.querySelector('#cv-declaration-text');
				const nameInp = app.querySelector('#cv-declaration-fullname');
				const placeInp = app.querySelector('#cv-declaration-place');
				const dateInp = app.querySelector('#cv-declaration-date');

				state.declaration = {
					text: textInp ? textInp.value : '',
					signature: state.declaration ? state.declaration.signature : '',
					name: nameInp ? nameInp.value : '',
					place: placeInp ? placeInp.value : '',
					date: dateInp ? dateInp.value : ''
				};

				save();
				renderCollectionPreview();
				showContentDashboard();
			};

			let sigCanvas = null;
			let sigCtx = null;
			let isDrawing = false;
			let lastX = 0;
			let lastY = 0;

			const initSignatureCanvas = () => {
				sigCanvas = app.querySelector('#cv-signature-canvas');
				if (!sigCanvas) return;
				sigCtx = sigCanvas.getContext('2d');
				sigCtx.strokeStyle = '#0f172a';
				sigCtx.lineWidth = 2.5;
				sigCtx.lineCap = 'round';
				sigCtx.lineJoin = 'round';

				const getPos = (e) => {
					const rect = sigCanvas.getBoundingClientRect();
					const clientX = e.touches ? e.touches[0].clientX : e.clientX;
					const clientY = e.touches ? e.touches[0].clientY : e.clientY;
					return {
						x: clientX - rect.left,
						y: clientY - rect.top
					};
				};

				const startDraw = (e) => {
					isDrawing = true;
					const pos = getPos(e);
					lastX = pos.x;
					lastY = pos.y;
				};

				const draw = (e) => {
					if (!isDrawing) return;
					e.preventDefault();
					const pos = getPos(e);
					sigCtx.beginPath();
					sigCtx.moveTo(lastX, lastY);
					sigCtx.lineTo(pos.x, pos.y);
					sigCtx.stroke();
					lastX = pos.x;
					lastY = pos.y;
				};

				const stopDraw = () => {
					isDrawing = false;
				};

				sigCanvas.addEventListener('mousedown', startDraw);
				sigCanvas.addEventListener('mousemove', draw);
				sigCanvas.addEventListener('mouseup', stopDraw);
				sigCanvas.addEventListener('mouseleave', stopDraw);

				sigCanvas.addEventListener('touchstart', startDraw, { passive: false });
				sigCanvas.addEventListener('touchmove', draw, { passive: false });
				sigCanvas.addEventListener('touchend', stopDraw);
			};

			const clearSignatureCanvas = () => {
				if (!sigCanvas || !sigCtx) return;
				sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
			};

			const saveSignatureCanvas = () => {
				if (!sigCanvas) return;
				const isBlank = !sigCanvas.getContext('2d')
					.getImageData(0, 0, sigCanvas.width, sigCanvas.height)
					.data.some(channel => channel !== 0);

				if (isBlank) {
					alert('Please draw a signature first.');
					return;
				}
				const dataURL = sigCanvas.toDataURL('image/png');
				setDeclarationSignature(dataURL);
				closeSignatureModal();
			};

			const initSignatureUpload = () => {
				const fileInp = app.querySelector('#cv-signature-upload-input');
				const previewImg = app.querySelector('#cv-signature-upload-preview');
				const previewWrap = app.querySelector('#cv-signature-upload-preview-container');
				if (!fileInp) return;

				fileInp.addEventListener('change', (e) => {
					const file = e.target.files[0];
					if (!file) return;

					if (file.size > 5 * 1024 * 1024) {
						alert('File size exceeds the 5MB limit.');
						return;
					}

					const reader = new FileReader();
					reader.onload = (evt) => {
						previewImg.src = evt.target.result;
						previewWrap.classList.remove('cv-hidden');
					};
					reader.readAsDataURL(file);
				});

				const saveUploadBtn = app.querySelector('#cv-signature-upload-save');
				if (saveUploadBtn) {
					saveUploadBtn.addEventListener('click', (e) => {
						e.preventDefault();
						if (previewImg.src && previewImg.src !== window.location.href) {
							setDeclarationSignature(previewImg.src);
							closeSignatureModal();
						} else {
							alert('Please select an image file first.');
						}
					});
				}
			};

			const setDeclarationSignature = (base64) => {
				if (!state.declaration) {
					state.declaration = { text: '', signature: '', name: '', place: '', date: '' };
				}
				state.declaration.signature = base64;
				const previewWrap = app.querySelector('#cv-declaration-sig-preview-wrap');
				const previewImg = app.querySelector('#cv-declaration-sig-preview');
				if (base64) {
					if (previewImg) previewImg.src = base64;
					if (previewWrap) previewWrap.classList.remove('cv-hidden');
				} else {
					if (previewImg) previewImg.src = '';
					if (previewWrap) previewWrap.classList.add('cv-hidden');
				}
				renderCollectionPreview();
			};

			const removeDeclarationSignature = () => {
				setDeclarationSignature('');
			};

			const initSignatureTabs = () => {
				const tabs = app.querySelectorAll('.cv-signature-modal-tab-btn');
				tabs.forEach((tab) => {
					tab.addEventListener('click', (e) => {
						e.preventDefault();
						tabs.forEach(t => {
							t.classList.remove('is-active');
							t.style.borderBottomColor = 'transparent';
							t.style.color = '#64748b';
						});
						tab.classList.add('is-active');
						tab.style.borderBottomColor = '#2563eb';
						tab.style.color = '#2563eb';

						const targetTab = tab.dataset.sigTab;
						app.querySelector('#cv-sig-tab-draw').style.display = targetTab === 'draw' ? 'block' : 'none';
						app.querySelector('#cv-sig-tab-upload').style.display = targetTab === 'upload' ? 'block' : 'none';
						if (targetTab === 'draw') {
							clearSignatureCanvas();
						}
					});
				});
			};

			const openSignatureModal = () => {
				const modal = app.querySelector('#cv-signature-modal');
				if (modal) {
					modal.classList.remove('cv-hidden');
					clearSignatureCanvas();
					const fileInp = app.querySelector('#cv-signature-upload-input');
					if (fileInp) fileInp.value = '';
					const previewWrap = app.querySelector('#cv-signature-upload-preview-container');
					if (previewWrap) previewWrap.classList.add('cv-hidden');
					const previewImg = app.querySelector('#cv-signature-upload-preview');
					if (previewImg) previewImg.src = '';
					const drawTabBtn = app.querySelector('[data-sig-tab="draw"]');
					if (drawTabBtn) drawTabBtn.click();
					if (!sigCanvas) {
						initSignatureCanvas();
					}
				}
			};

			const closeSignatureModal = () => {
				const modal = app.querySelector('#cv-signature-modal');
				if (modal) {
					modal.classList.add('cv-hidden');
				}
			};

			let editingSkillIndex = -1;

			const renderSkillsList = () => {
				const listContainer = app.querySelector('#cv-skills-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				const skillList = Array.isArray(state.skills) ? state.skills : [];

				skillList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info" style="cursor: pointer;">
						<strong>${item.name || 'Skill'}</strong>
						<span>${item.level || ''}</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.cv-entry-card-info').addEventListener('click', (e) => {
						e.preventDefault();
						openSkillsEdit(index);
					});
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openSkillsEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.skills.splice(index, 1);
						save();
						renderSkillsList();
						renderAll();
					});

					listContainer.appendChild(card);
				});
			};

			const openSkillsEdit = (index = -1) => {
				editingSkillIndex = index;
				const editTitle = app.querySelector('#cv-skills-edit-title');
				const saveBtn = app.querySelector('#cv-skills-edit-save-btn');

				const nameInp = app.querySelector('#cv-skills-name');
				const levelSelect = app.querySelector('#cv-skills-level');
				const detailsEditor = app.querySelector('#cv-skills-desc-rich-editor .cv-rich-editor-content');

				if (!nameInp) return;

				if (index >= 0) {
					const item = state.skills[index];
					if (editTitle) editTitle.textContent = 'Edit Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = item.name || '';
					levelSelect.value = item.level || '';
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = '';
					levelSelect.value = '';
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}
				}

				app.querySelector('#cv-skills-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-skills-edit-view').classList.remove('cv-hidden');
			};

			const saveSkillsEntry = () => {
				const nameInp = app.querySelector('#cv-skills-name');
				const levelSelect = app.querySelector('#cv-skills-level');
				const detailsEditor = app.querySelector('#cv-skills-desc-rich-editor .cv-rich-editor-content');

				if (!nameInp || !nameInp.value.trim()) {
					alert('Please enter a skill name.');
					return;
				}

				const item = {
					name: nameInp.value.trim(),
					level: levelSelect ? levelSelect.value : '',
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (editingSkillIndex >= 0) {
					state.skills[editingSkillIndex] = item;
				} else {
					state.skills.push(item);
				}

				save();
				renderSkillsList();
				renderAll();

				app.querySelector('#cv-skills-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-skills-list-view').classList.remove('cv-hidden');
			};

			let editingLangIndex = -1;

			const renderLanguagesList = () => {
				const listContainer = app.querySelector('#cv-lang-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				const langList = Array.isArray(state.languages) ? state.languages : [];

				langList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info" style="cursor: pointer;">
						<strong>${item.name || 'Language'}</strong>
						<span>${item.level || ''}</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.cv-entry-card-info').addEventListener('click', (e) => {
						e.preventDefault();
						openLanguagesEdit(index);
					});
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openLanguagesEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.languages.splice(index, 1);
						save();
						renderLanguagesList();
						renderAll();
					});

					listContainer.appendChild(card);
				});
			};

			const openLanguagesEdit = (index = -1) => {
				editingLangIndex = index;
				const editTitle = app.querySelector('#cv-lang-edit-title');
				const saveBtn = app.querySelector('#cv-lang-edit-save-btn');

				const nameInp = app.querySelector('#cv-lang-name');
				const levelSelect = app.querySelector('#cv-lang-level');
				const detailsEditor = app.querySelector('#cv-lang-desc-rich-editor .cv-rich-editor-content');

				if (!nameInp) return;

				if (index >= 0) {
					const item = state.languages[index];
					if (editTitle) editTitle.textContent = 'Edit Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = item.name || '';
					levelSelect.value = item.level || '';
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = '';
					levelSelect.value = '';
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}
				}

				app.querySelector('#cv-lang-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-lang-edit-view').classList.remove('cv-hidden');
			};

			const saveLanguagesEntry = () => {
				const nameInp = app.querySelector('#cv-lang-name');
				const levelSelect = app.querySelector('#cv-lang-level');
				const detailsEditor = app.querySelector('#cv-lang-desc-rich-editor .cv-rich-editor-content');

				if (!nameInp || !nameInp.value.trim()) {
					alert('Please enter a language.');
					return;
				}

				const item = {
					name: nameInp.value.trim(),
					level: levelSelect ? levelSelect.value : '',
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (editingLangIndex >= 0) {
					state.languages[editingLangIndex] = item;
				} else {
					state.languages.push(item);
				}

				save();
				renderLanguagesList();
				renderAll();

				app.querySelector('#cv-lang-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-lang-list-view').classList.remove('cv-hidden');
			};

			let editingCertIndex = -1;

			const renderCertificatesList = () => {
				const listContainer = app.querySelector('#cv-cert-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				const certList = Array.isArray(state.certificates) ? state.certificates : [];

				certList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info" style="cursor: pointer;">
						<strong>${item.name || 'Certificate'}</strong>
						<span>${item.details ? (item.details.replace(/<[^>]*>/g, '').substring(0, 60) + '...') : ''}</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.cv-entry-card-info').addEventListener('click', (e) => {
						e.preventDefault();
						openCertificatesEdit(index);
					});
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openCertificatesEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.certificates.splice(index, 1);
						save();
						renderCertificatesList();
						renderAll();
					});

					listContainer.appendChild(card);
				});
			};

			const openCertificatesEdit = (index = -1) => {
				editingCertIndex = index;
				const editTitle = app.querySelector('#cv-cert-edit-title');
				const saveBtn = app.querySelector('#cv-cert-edit-save-btn');

				const nameInp = app.querySelector('#cv-cert-name');
				const detailsEditor = app.querySelector('#cv-cert-desc-rich-editor .cv-rich-editor-content');
				const linkBtn = app.querySelector('#cv-cert-link-btn');

				if (!nameInp) return;

				if (index >= 0) {
					const item = state.certificates[index];
					if (editTitle) editTitle.textContent = 'Edit Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = item.name || '';
					nameInp.dataset.certLink = item.link || '';
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.link);
					}
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = '';
					nameInp.dataset.certLink = '';
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}
				}

				// Bind link button click:
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = nameInp.dataset.certLink || '';
						const newLink = prompt('Enter URL for Certificate:', currentLink);
						if (newLink !== null) {
							nameInp.dataset.certLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-cert-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-cert-edit-view').classList.remove('cv-hidden');
			};

			const saveCertificatesEntry = () => {
				const nameInp = app.querySelector('#cv-cert-name');
				const detailsEditor = app.querySelector('#cv-cert-desc-rich-editor .cv-rich-editor-content');

				if (!nameInp || !nameInp.value.trim()) {
					alert('Please enter a certificate.');
					return;
				}

				const item = {
					name: nameInp.value.trim(),
					link: nameInp.dataset.certLink || '',
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (editingCertIndex >= 0) {
					state.certificates[editingCertIndex] = item;
				} else {
					state.certificates.push(item);
				}

				save();
				renderCertificatesList();
				renderAll();

				app.querySelector('#cv-cert-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-cert-list-view').classList.remove('cv-hidden');
			};

			let editingIntsIndex = -1;

			const renderInterestsList = () => {
				const listContainer = app.querySelector('#cv-interests-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				const intList = Array.isArray(state.interests) ? state.interests : [];

				intList.forEach((item, index) => {
					if (!item) return;
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info" style="cursor: pointer;">
						<strong>${item.name || 'Interest'}</strong>
						<span>${item.details ? (item.details.replace(/<[^>]*>/g, '').substring(0, 60) + '...') : ''}</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.cv-entry-card-info').addEventListener('click', (e) => {
						e.preventDefault();
						openInterestsEdit(index);
					});
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openInterestsEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.interests.splice(index, 1);
						save();
						renderInterestsList();
						renderAll();
					});

					listContainer.appendChild(card);
				});
			};

			const openInterestsEdit = (index = -1) => {
				editingIntsIndex = index;
				const editTitle = app.querySelector('#cv-interests-edit-title');
				const saveBtn = app.querySelector('#cv-interests-edit-save-btn');

				const nameInp = app.querySelector('#cv-interests-name');
				const detailsEditor = app.querySelector('#cv-interests-desc-rich-editor .cv-rich-editor-content');
				const linkBtn = app.querySelector('#cv-interests-link-btn');
				const deleteBtn = app.querySelector('#cv-interests-delete-btn');
				const visibilityBtn = app.querySelector('#cv-interests-visibility-btn');

				if (!nameInp) return;

				if (index >= 0) {
					const item = state.interests[index];
					if (editTitle) editTitle.textContent = 'Edit Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = item.name || '';
					nameInp.dataset.interestsLink = item.link || '';
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.link);
					}
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}
					if (deleteBtn) {
						deleteBtn.style.display = 'inline-flex';
						deleteBtn.onclick = (e) => {
							e.preventDefault();
							if (confirm('Are you sure you want to delete this entry?')) {
								state.interests.splice(index, 1);
								save();
								renderInterestsList();
								renderAll();
								app.querySelector('#cv-interests-edit-view').classList.add('cv-hidden');
								app.querySelector('#cv-interests-list-view').classList.remove('cv-hidden');
							}
						};
					}
					if (visibilityBtn) {
						visibilityBtn.style.display = 'inline-flex';
						const isHidden = Array.isArray(state.hidden_interests) && state.hidden_interests.includes(index);
						visibilityBtn.classList.toggle('is-hidden', isHidden);
						visibilityBtn.onclick = (e) => {
							e.preventDefault();
							if (!Array.isArray(state.hidden_interests)) {
								state.hidden_interests = [];
							}
							const idx = state.hidden_interests.indexOf(index);
							if (idx > -1) {
								state.hidden_interests.splice(idx, 1);
							} else {
								state.hidden_interests.push(index);
							}
							save();
							renderInterestsList();
							renderAll();
							const nowHidden = state.hidden_interests.includes(index);
							visibilityBtn.classList.toggle('is-hidden', nowHidden);
						};
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					nameInp.value = '';
					nameInp.dataset.interestsLink = '';
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}
					if (deleteBtn) deleteBtn.style.display = 'none';
					if (visibilityBtn) visibilityBtn.style.display = 'none';
				}

				// Bind link button click:
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = nameInp.dataset.interestsLink || '';
						const newLink = prompt('Enter URL for Interest:', currentLink);
						if (newLink !== null) {
							nameInp.dataset.interestsLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-interests-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-interests-edit-view').classList.remove('cv-hidden');
			};

			const saveInterestsEntry = () => {
				const nameInp = app.querySelector('#cv-interests-name');
				const detailsEditor = app.querySelector('#cv-interests-desc-rich-editor .cv-rich-editor-content');

				if (!nameInp || !nameInp.value.trim()) {
					alert('Please enter an interest.');
					return;
				}

				const item = {
					name: nameInp.value.trim(),
					link: nameInp.dataset.interestsLink || '',
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (editingIntsIndex >= 0) {
					state.interests[editingIntsIndex] = item;
				} else {
					state.interests.push(item);
				}

				save();
				renderInterestsList();
				renderAll();

				app.querySelector('#cv-interests-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-interests-list-view').classList.remove('cv-hidden');
			};

			let editingPrjIndex = -1;

			const renderProjectsList = () => {
				const listContainer = app.querySelector('#cv-projects-entries-list');
				if (!listContainer) return;
				listContainer.innerHTML = '';

				const prjList = Array.isArray(state.projects) ? state.projects : [];

				prjList.forEach((item, index) => {
					const card = document.createElement('div');
					card.className = 'cv-entry-card-item';
					card.innerHTML = `
					<div class="cv-entry-card-info" style="cursor: pointer;">
						<strong>${item.title || 'Project'}</strong>
						<span>${item.subtitle || ''} (${item.startDate || ''} - ${item.endDate || ''})</span>
					</div>
					<div class="cv-entry-card-actions">
						<button type="button" class="cv-entry-card-action-btn edit" data-index="${index}">Edit</button>
						<button type="button" class="cv-entry-card-action-btn delete" data-index="${index}">Delete</button>
					</div>
				`;

					card.querySelector('.cv-entry-card-info').addEventListener('click', (e) => {
						e.preventDefault();
						openProjectsEdit(index);
					});
					card.querySelector('.edit').addEventListener('click', (e) => {
						e.preventDefault();
						openProjectsEdit(index);
					});
					card.querySelector('.delete').addEventListener('click', (e) => {
						e.preventDefault();
						state.projects.splice(index, 1);
						save();
						renderProjectsList();
						renderAll();
					});

					listContainer.appendChild(card);
				});
			};

			const openProjectsEdit = (index = -1) => {
				editingPrjIndex = index;
				const editTitle = app.querySelector('#cv-projects-edit-title');
				const saveBtn = app.querySelector('#cv-projects-edit-save-btn');

				const titleInp = app.querySelector('#cv-project-title');
				const subtitleInp = app.querySelector('#cv-project-subtitle');
				const startDateInp = app.querySelector('#cv-project-start-date');
				const endDateInp = app.querySelector('#cv-project-end-date');
				const detailsEditor = app.querySelector('#cv-projects-desc-rich-editor .cv-rich-editor-content');
				const linkBtn = app.querySelector('#cv-projects-link-btn');
				const deleteBtn = app.querySelector('#cv-projects-delete-btn');
				const visibilityBtn = app.querySelector('#cv-projects-visibility-btn');

				if (!titleInp) return;

				if (index >= 0) {
					const item = state.projects[index];
					if (editTitle) editTitle.textContent = 'Edit Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					titleInp.value = item.title || '';
					titleInp.dataset.projectsLink = item.link || '';
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!item.link);
					}
					if (subtitleInp) subtitleInp.value = item.subtitle || '';
					if (startDateInp) startDateInp.value = item.startDate || '';
					if (endDateInp) endDateInp.value = item.endDate || '';
					if (detailsEditor) {
						detailsEditor.innerHTML = item.details || '';
					}
					if (deleteBtn) {
						deleteBtn.style.display = 'inline-flex';
						deleteBtn.onclick = (e) => {
							e.preventDefault();
							if (confirm('Are you sure you want to delete this entry?')) {
								state.projects.splice(index, 1);
								save();
								renderProjectsList();
								renderAll();
								app.querySelector('#cv-projects-edit-view').classList.add('cv-hidden');
								app.querySelector('#cv-projects-list-view').classList.remove('cv-hidden');
							}
						};
					}
					if (visibilityBtn) {
						visibilityBtn.style.display = 'inline-flex';
						const isHidden = Array.isArray(state.hidden_projects) && state.hidden_projects.includes(index);
						visibilityBtn.classList.toggle('is-hidden', isHidden);
						visibilityBtn.onclick = (e) => {
							e.preventDefault();
							if (!Array.isArray(state.hidden_projects)) {
								state.hidden_projects = [];
							}
							const idx = state.hidden_projects.indexOf(index);
							if (idx > -1) {
								state.hidden_projects.splice(idx, 1);
							} else {
								state.hidden_projects.push(index);
							}
							save();
							renderProjectsList();
							renderAll();
							const nowHidden = state.hidden_projects.includes(index);
							visibilityBtn.classList.toggle('is-hidden', nowHidden);
						};
					}
				} else {
					if (editTitle) editTitle.textContent = 'Add Entry';
					if (saveBtn) {
						const btnText = saveBtn.querySelector('span');
						if (btnText) btnText.textContent = 'Done';
					}

					titleInp.value = '';
					titleInp.dataset.projectsLink = '';
					if (linkBtn) {
						linkBtn.classList.remove('is-linked');
					}
					if (subtitleInp) subtitleInp.value = '';
					if (startDateInp) startDateInp.value = '';
					if (endDateInp) endDateInp.value = '';
					if (detailsEditor) {
						detailsEditor.innerHTML = '';
					}
					if (deleteBtn) deleteBtn.style.display = 'none';
					if (visibilityBtn) visibilityBtn.style.display = 'none';
				}

				// Bind link button click:
				if (linkBtn) {
					linkBtn.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						const currentLink = titleInp.dataset.projectsLink || '';
						const newLink = prompt('Enter URL for Project:', currentLink);
						if (newLink !== null) {
							titleInp.dataset.projectsLink = newLink.trim();
							linkBtn.classList.toggle('is-linked', !!newLink.trim());
						}
					};
				}

				app.querySelector('#cv-projects-list-view').classList.add('cv-hidden');
				app.querySelector('#cv-projects-edit-view').classList.remove('cv-hidden');
			};

			const saveProjectsEntry = () => {
				const titleInp = app.querySelector('#cv-project-title');
				const subtitleInp = app.querySelector('#cv-project-subtitle');
				const startDateInp = app.querySelector('#cv-project-start-date');
				const endDateInp = app.querySelector('#cv-project-end-date');
				const detailsEditor = app.querySelector('#cv-projects-desc-rich-editor .cv-rich-editor-content');

				if (!titleInp || !titleInp.value.trim()) {
					alert('Please enter a project title.');
					return;
				}

				const item = {
					title: titleInp.value.trim(),
					subtitle: subtitleInp ? subtitleInp.value.trim() : '',
					startDate: startDateInp ? startDateInp.value.trim() : '',
					endDate: endDateInp ? endDateInp.value.trim() : '',
					link: titleInp.dataset.projectsLink || '',
					details: detailsEditor ? detailsEditor.innerHTML : ''
				};

				if (editingPrjIndex >= 0) {
					state.projects[editingPrjIndex] = item;
				} else {
					state.projects.push(item);
				}

				save();
				renderProjectsList();
				renderAll();

				app.querySelector('#cv-projects-edit-view').classList.add('cv-hidden');
				app.querySelector('#cv-projects-list-view').classList.remove('cv-hidden');
			};

			const showFormSection = (sectionName) => {
				const workspace = app.querySelector('#cv-builder-workspace');
				if (workspace) {
					workspace.classList.remove('formatting-mode');
				}

				// Update active tab in sidebar
				app.querySelectorAll('.cv-sidebar-item').forEach((btn) => {
					btn.classList.toggle('is-active', btn.dataset.section === sectionName);
				});

				// Show matching form wrapper
				app.querySelectorAll('.cv-workspace-form-section').forEach((sec) => {
					sec.classList.toggle('cv-hidden', sec.dataset.formSection !== sectionName);
				});

				// Update tip box text
				const tipText = app.querySelector('#cv-workspace-tip-text');
				if (tipText) {
					if (sectionName === 'header') {
						tipText.textContent = 'Provide your contact details so recruiters know how to reach you.';
					} else if (sectionName === 'experience') {
						tipText.textContent = 'In the next steps you can add professionally written examples that match your experience.';
					} else if (sectionName === 'education') {
						tipText.textContent = 'Showcase your academic background and degrees to show your qualifications.';
					} else if (sectionName === 'skills') {
						tipText.textContent = 'Highlight your key professional skills to match job description keywords.';
					} else if (sectionName === 'summary') {
						tipText.textContent = 'Write a short, engaging description of your top accomplishments and career goals.';
					} else if (sectionName === 'formatting') {
						tipText.textContent = 'Fine-tune the size and colors of your CV elements. Changes apply in real time.';
					} else {
						tipText.textContent = 'Add extra details like certificates or languages to stand out even more.';
					}
				}

				// Re-scale workspace preview immediately
				if (resizeWorkspacePreviewFn) {
					resizeWorkspacePreviewFn();
				}

				// If Experience list is empty, open edit view directly
				if (sectionName === 'experience') {
					if (state.experience.length === 0) {
						openExperienceEdit(-1);
					} else {
						app.querySelector('#cv-exp-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-exp-list-view').classList.remove('cv-hidden');
					}
				}

				// If Education list is empty, open edit view directly
				if (sectionName === 'education') {
					if (state.education.length === 0) {
						openEducationEdit(-1);
					} else {
						app.querySelector('#cv-edu-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-edu-list-view').classList.remove('cv-hidden');
					}
				}

				// If Courses list is empty, open edit view directly
				if (sectionName === 'courses') {
					if (!state.courses || state.courses.length === 0) {
						openCoursesEdit(-1);
					} else {
						app.querySelector('#cv-courses-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-courses-list-view').classList.remove('cv-hidden');
					}
				}

				if (sectionName === 'awards') {
					if (!state.awards || state.awards.length === 0) {
						openAwardsEdit(-1);
					} else {
						app.querySelector('#cv-awards-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-awards-list-view').classList.remove('cv-hidden');
					}
				}

				if (sectionName === 'publications') {
					if (!state.publications || state.publications.length === 0) {
						openPublicationsEdit(-1);
					} else {
						app.querySelector('#cv-publications-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-publications-list-view').classList.remove('cv-hidden');
					}
				}

				if (sectionName === 'references') {
					if (!state.references || state.references.length === 0) {
						openReferencesEdit(-1);
					} else {
						app.querySelector('#cv-references-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-references-list-view').classList.remove('cv-hidden');
					}
				}

				if (sectionName === 'declaration') {
					openDeclarationEdit();
				}

				// If Skills list is empty, open edit view directly
				if (sectionName === 'skills') {
					if (!Array.isArray(state.skills) || state.skills.length === 0) {
						openSkillsEdit(-1);
					} else {
						app.querySelector('#cv-skills-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-skills-list-view').classList.remove('cv-hidden');
					}
				}

				// If Languages list is empty, open edit view directly
				if (sectionName === 'languages') {
					if (!Array.isArray(state.languages) || state.languages.length === 0) {
						openLanguagesEdit(-1);
					} else {
						app.querySelector('#cv-lang-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-lang-list-view').classList.remove('cv-hidden');
					}
				}

				// If Certificates list is empty, open edit view directly
				if (sectionName === 'other') {
					if (!Array.isArray(state.certificates) || state.certificates.length === 0) {
						openCertificatesEdit(-1);
					} else {
						app.querySelector('#cv-cert-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-cert-list-view').classList.remove('cv-hidden');
					}
				}

				// If Interests list is empty, open edit view directly
				if (sectionName === 'interests') {
					if (!Array.isArray(state.interests) || state.interests.length === 0) {
						openInterestsEdit(-1);
					} else {
						app.querySelector('#cv-interests-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-interests-list-view').classList.remove('cv-hidden');
					}
				}

				// If Projects list is empty, open edit view directly
				if (sectionName === 'projects') {
					if (!Array.isArray(state.projects) || state.projects.length === 0) {
						openProjectsEdit(-1);
					} else {
						app.querySelector('#cv-projects-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-projects-list-view').classList.remove('cv-hidden');
					}
				}
			};

			const isSectionEditorOpen = () => {
				const dashboard = app.querySelector('#cv-content-dashboard');
				const formContainer = app.querySelector('#cv-dashboard-form-container');
				return Boolean(dashboard?.classList.contains('cv-hidden') && !formContainer?.classList.contains('cv-hidden'));
			};

			const showContentDashboard = () => {
				const dashboard = app.querySelector('#cv-content-dashboard');
				const formContainer = app.querySelector('#cv-dashboard-form-container');
				const modal = app.querySelector('#cv-content-modal');

				if (dashboard && formContainer) {
					dashboard.classList.remove('cv-hidden');
					formContainer.classList.add('cv-hidden');
				}
				if (modal) {
					modal.classList.add('cv-hidden');
				}
				if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden: false }, '*');
				renderContentDashboard();
			};

			const openAddContentModal = () => {
				const modal = app.querySelector('#cv-content-modal');
				if (modal) {
					modal.classList.remove('cv-hidden');
				}
				if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden: true }, '*');
			};

			const closeAddContentModal = () => {
				const modal = app.querySelector('#cv-content-modal');
				if (modal) {
					modal.classList.add('cv-hidden');
				}
				if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden: false }, '*');
			};

			// Keep the bottom action dock visible while users expand/reorder cards or
			// choose a display location. Only a real text-entry keyboard should hide it.
			// On iOS/Android, when the keyboard opens the browser auto-scrolls the page
			// to bring the focused field into view — that scroll event was incorrectly
			// restoring the dock (un-hiding the host Chrome bar) and blocking typing.
			// Fix: track whether a typing input is focused (keyboard likely open) and
			// block all dock-restore messages until the keyboard is dismissed.
			const isTypingControl = (node) => node instanceof Element && Boolean(node.closest('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]), textarea, [contenteditable="true"], [role="textbox"]'));
			let typingFocused = false;
			// Use visualViewport to detect keyboard open/close on iOS/Android.
			// When the keyboard opens the visualViewport height shrinks by >120px.
			let baseViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
			let keyboardOpen = false;
			const updateKeyboardState = () => {
				const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
				const shrinkage = baseViewportHeight - currentHeight;
				const nowOpen = shrinkage > 120;
				if (nowOpen !== keyboardOpen) {
					keyboardOpen = nowOpen;
					document.body.classList.toggle('cv-keyboard-open', keyboardOpen);
					if (!keyboardOpen && !typingFocused) {
						// Keyboard dismissed — restore the dock after a tick so the
						// viewport has finished resizing before we send the message.
						window.setTimeout(() => {
							if (!typingFocused) restoreDockAfterNavigation();
						}, 80);
					}
				}
				if (!nowOpen) baseViewportHeight = Math.max(baseViewportHeight, currentHeight);
			};
			if (window.visualViewport) {
				window.visualViewport.addEventListener('resize', updateKeyboardState);
			} else {
				window.addEventListener('resize', updateKeyboardState);
			}
			app.addEventListener('focusin', (event) => {
				if (isTypingControl(event.target)) {
					typingFocused = true;
					if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden: true }, '*');
				}
			});
			app.addEventListener('pointerdown', (event) => {
				const modalOpen = !app.querySelector('#cv-content-modal')?.classList.contains('cv-hidden');
				if (!modalOpen && !isTypingControl(event.target) && window.parent && window.parent !== window) {
					window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden: isSectionEditorOpen() }, '*');
				}
			}, true);
			const restoreDockAfterNavigation = () => {
				// Do NOT restore the dock while the keyboard is open or a typing control
				// has focus — that would push the action bar on top of the keyboard and
				// block the focused input field.
				if (keyboardOpen || typingFocused) return;
				const modalOpen = !app.querySelector('#cv-content-modal')?.classList.contains('cv-hidden');
				if (!modalOpen && window.parent && window.parent !== window) {
					window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden: isSectionEditorOpen() }, '*');
				}
			};
			// Only restore on genuine user-initiated touch scrolls, not the
			// programmatic scroll iOS does to bring a focused field into view.
			app.addEventListener('touchmove', restoreDockAfterNavigation, { passive: true });
			app.addEventListener('scroll', restoreDockAfterNavigation, true);
			app.addEventListener('focusout', () => {
				window.setTimeout(() => {
					typingFocused = isTypingControl(document.activeElement);
					const modalOpen = !app.querySelector('#cv-content-modal')?.classList.contains('cv-hidden');
					const hidden = modalOpen || isSectionEditorOpen() || typingFocused || keyboardOpen;
					if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden }, '*');
				}, 80);
			});

			const renderContentDashboard = () => {
				restoreDockAfterNavigation();
				// Update Name
				const nameEl = app.querySelector('#cv-dash-name');
				if (nameEl) {
					nameEl.textContent = state.fullName || 'Your name';
				}

				const contactHeader = app.querySelector('.cv-dash-contact-card-header');
				if (contactHeader) {
					let roleEl = contactHeader.querySelector('.cv-dash-role');
					if (!roleEl) {
						roleEl = document.createElement('p');
						roleEl.className = 'cv-dash-role';
						contactHeader.appendChild(roleEl);
					}
					roleEl.textContent = state.jobTitle || '';
					roleEl.classList.toggle('cv-hidden', !state.jobTitle);
				}

				// Update Email
				const emailEl = app.querySelector('#cv-dash-email');
				if (emailEl) {
					emailEl.textContent = state.email || 'Email';
				}

				// Update Phone
				const phoneEl = app.querySelector('#cv-dash-phone');
				if (phoneEl) {
					phoneEl.textContent = state.phone || 'Phone';
				}

				// Update Address
				const addrEl = app.querySelector('#cv-dash-address');
				if (addrEl) {
					addrEl.textContent = [state.location, state.country].filter(Boolean).join(', ') || 'Address';
				}

				// Update Photo
				const photoImg = app.querySelector('#cv-dash-photo-img');
				const photoPlaceholder = app.querySelector('.cv-dash-photo-placeholder');
				if (photoImg && photoPlaceholder) {
					if (state.photo) {
						photoImg.src = state.photo;
						photoImg.classList.remove('cv-hidden');
						photoPlaceholder.classList.add('cv-hidden');
					} else {
						photoImg.src = '';
						photoImg.classList.add('cv-hidden');
						photoPlaceholder.classList.remove('cv-hidden');
					}
				}

				// Update Sections List
				const listContainer = app.querySelector('#cv-dashboard-sections-list');
				if (listContainer) {
					listContainer.innerHTML = '';

					const sections = [
						{
							id: 'summary',
							name: 'Summary',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
						},
						{
							id: 'experience',
							name: 'Professional Experience',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>'
						},
						{
							id: 'education',
							name: 'Education',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>'
						},
						{
							id: 'courses',
							name: 'Courses',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5v-15A2.5 2.5 0 0 1 6.5 2M20 2v20"></path></svg>'
						},
						{
							id: 'awards',
							name: 'Awards',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 0 0-4 4v8h8V6a4 4 0 0 0-4-4z"></path></svg>'
						},
						{
							id: 'publications',
							name: 'Publications',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>'
						},
						{
							id: 'references',
							name: 'References',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
						},
						{
							id: 'declaration',
							name: 'Declaration',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM14 2v6h6M16 13H8M16 17H8M10 9H8"></path></svg>'
						},
						{
							id: 'skills',
							name: 'Skills',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'
						},
						{
							id: 'certificates',
							name: 'Certificates',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>'
						},
						{
							id: 'languages',
							name: 'Languages',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
						},
						{
							id: 'projects',
							name: 'Projects',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'
						},
						{
							id: 'interests',
							name: 'Interests',
							icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
						}
					];

					// The editor list and the rendered CV must share one source of truth for
					// section order. Previously this filtered the catalogue order, so the
					// dashboard could disagree with the actual résumé preview.
					const sectionById = new Map(sections.map(sec => [sec.id, sec]));
					const activeSecs = (Array.isArray(state.activeSections) ? state.activeSections : [])
						.map(id => sectionById.get(id))
						.filter(Boolean);

					activeSecs.forEach((sec, activeIndex) => {
						const card = document.createElement('div');
						card.className = 'cv-dash-accordion-card';
						// Native draggable parents can consume the first tap on iOS and prevent
						// their nested edit/expand buttons from firing. Reordering remains a
						// desktop interaction; mobile cards are immediately tappable.
						card.setAttribute('draggable', window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 'true' : 'false');
						card.dataset.sectionId = sec.id;

						let entriesHTML = '';

						// Heading Editor Drawer Panel
						const headingVal = state['custom_heading_' + sec.id] || '';
						const subtitleVal = state['subtitle_' + sec.id] || '';
						const colPref = state['column_preference_' + sec.id] || 'default';
						let headingEditorHTML = `
						<div class="cv-dash-heading-editor-panel cv-hidden" data-heading-editor-sec="${sec.id}">
							<div class="cv-dash-heading-editor-row">
								<label>Section Title:
									<input type="text" class="cv-dash-heading-title-input" data-heading-title-sec="${sec.id}" value="${headingVal}" placeholder="${sec.name}" />
								</label>
							</div>
							<div class="cv-dash-heading-editor-row">
								<label>Subtitle:
									<input type="text" class="cv-dash-heading-subtitle-input" data-heading-subtitle-sec="${sec.id}" value="${subtitleVal}" placeholder="Add section subtitle..." />
								</label>
							</div>
							<div class="cv-dash-heading-editor-row">
								<label>Show in:
									<select class="cv-dash-heading-column-select" data-column-sec="${sec.id}" style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; font-size: 0.85rem; color: #334155; margin-top: 4px;">
										<option value="default" ${colPref === 'default' ? 'selected' : ''}>Template Default</option>
										<option value="main" ${colPref === 'main' ? 'selected' : ''}>Main Content</option>
										<option value="sidebar" ${colPref === 'sidebar' ? 'selected' : ''}>Sidebar</option>
									</select>
								</label>
							</div>
							<button type="button" class="cv-dash-heading-editor-close-btn" data-heading-editor-close="${sec.id}">Done</button>
						</div>
					`;

						const gripIconSVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="8" cy="5" r="1.75"></circle><circle cx="16" cy="5" r="1.75"></circle><circle cx="8" cy="12" r="1.75"></circle><circle cx="16" cy="12" r="1.75"></circle><circle cx="8" cy="19" r="1.75"></circle><circle cx="16" cy="19" r="1.75"></circle></svg>`;
						const eyeSVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
						const eyeOffSVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
						const trashSVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

						let listHTML = '';
						let hasContent = false;

						if (sec.id === 'summary') {
							if (!state.hideSummary && state.summary) {
								hasContent = true;
								listHTML = `
								<div class="cv-dash-entry-card" data-edit-type="summary">
									<div class="cv-dash-entry-left">
										<div class="cv-dash-entry-text cv-dash-summary-text">${state.summary}</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-delete" data-delete-type="summary" title="Clear summary">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							}
						} else if (sec.id === 'languages') {
							const langs = Array.isArray(state.languages) ? state.languages : [];
							if (langs.length > 0) hasContent = true;
							langs.forEach((lang, idx) => {
								const isHidden = Array.isArray(state.hidden_languages) && state.hidden_languages.includes(idx);
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="languages" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${lang.name || 'Language'}</strong>
											${lang.level ? `<span class="cv-dash-entry-badge">${lang.level}</span>` : ''}
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="languages" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="languages" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						} else if (sec.id === 'experience') {
							const exp = state.experience || [];
							if (exp.length > 0) hasContent = true;
							exp.forEach((item, idx) => {
								const isHidden = Array.isArray(state.hidden_experience) && state.hidden_experience.includes(idx);
								const subtitle = [item.company, (item.startDate || item.endDate) ? `${item.startDate || ''}${item.startDate && item.endDate ? ' - ' : ''}${item.endDate || ''}` : ''].filter(Boolean).join(' • ');
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="experience" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${item.role || 'Job Position'}</strong>
											${subtitle ? `<span class="cv-dash-entry-subtitle">${subtitle}</span>` : ''}
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="experience" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="experience" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						} else if (sec.id === 'education') {
							const edu = state.education || [];
							if (edu.length > 0) hasContent = true;
							edu.forEach((item, idx) => {
								const isHidden = Array.isArray(state.hidden_education) && state.hidden_education.includes(idx);
								const subtitle = [item.school, (item.startDate || item.endDate) ? `${item.startDate || ''}${item.startDate && item.endDate ? ' - ' : ''}${item.endDate || ''}` : ''].filter(Boolean).join(' • ');
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="education" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${item.degree || 'Degree / Field'}</strong>
											${subtitle ? `<span class="cv-dash-entry-subtitle">${subtitle}</span>` : ''}
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="education" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="education" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						} else if (sec.id === 'courses') {
							const crs = state.courses || [];
							if (crs.length > 0) hasContent = true;
							crs.forEach((item, idx) => {
								const isHidden = Array.isArray(state.hidden_courses) && state.hidden_courses.includes(idx);
								const subtitle = [item.institution, (item.startDate || item.endDate) ? `${item.startDate || ''}${item.startDate && item.endDate ? ' - ' : ''}${item.endDate || ''}` : ''].filter(Boolean).join(' • ');
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="courses" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${item.title || 'Course Title'}</strong>
											${subtitle ? `<span class="cv-dash-entry-subtitle">${subtitle}</span>` : ''}
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="courses" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="courses" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						} else if (sec.id === 'skills') {
							const skills = Array.isArray(state.skills) ? state.skills : [];
							if (skills.length > 0) hasContent = true;
							skills.forEach((skill, idx) => {
								const isHidden = Array.isArray(state.hidden_skills) && state.hidden_skills.includes(idx);
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="skills" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${skill.name || 'Skill'}</strong>
											${skill.level ? `<span class="cv-dash-entry-badge">${skill.level}</span>` : ''}
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="skills" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="skills" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						} else if (sec.id === 'certificates') {
							const certs = Array.isArray(state.certificates) ? state.certificates : [];
							if (certs.length > 0) hasContent = true;
							certs.forEach((cert, idx) => {
								const isHidden = Array.isArray(state.hidden_certificates) && state.hidden_certificates.includes(idx);
								const subtitle = [cert.issuer, cert.date].filter(Boolean).join(' • ');
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="certificates" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${cert.name || 'Certificate'}</strong>
											${subtitle ? `<span class="cv-dash-entry-subtitle">${subtitle}</span>` : ''}
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="certificates" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="certificates" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						} else if (sec.id === 'interests') {
							const ints = Array.isArray(state.interests) ? state.interests : [];
							if (ints.length > 0) hasContent = true;
							ints.forEach((item, idx) => {
								const isHidden = Array.isArray(state.hidden_interests) && state.hidden_interests.includes(idx);
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="interests" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${item.name || 'Interest'}</strong>
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="interests" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="interests" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						} else if (sec.id === 'projects') {
							const prjs = Array.isArray(state.projects) ? state.projects : [];
							if (prjs.length > 0) hasContent = true;
							prjs.forEach((item, idx) => {
								const isHidden = Array.isArray(state.hidden_projects) && state.hidden_projects.includes(idx);
								const subtitle = [item.role, (item.startDate || item.endDate) ? `${item.startDate || ''}${item.startDate && item.endDate ? ' - ' : ''}${item.endDate || ''}` : ''].filter(Boolean).join(' • ');
								listHTML += `
								<div class="cv-dash-entry-card ${isHidden ? 'cv-dash-entry-hidden' : ''}" data-edit-type="projects" data-index="${idx}">
									<div class="cv-dash-entry-left">
										<span class="cv-dash-drag-handle" title="Drag to reorder">${gripIconSVG}</span>
										<div class="cv-dash-entry-text">
											<strong class="cv-dash-entry-title">${item.title || 'Project'}</strong>
											${subtitle ? `<span class="cv-dash-entry-subtitle">${subtitle}</span>` : ''}
										</div>
									</div>
									<div class="cv-dash-entry-right">
										<button type="button" class="cv-dash-entry-visibility-btn" data-visibility-sec="projects" data-visibility-idx="${idx}" title="${isHidden ? 'Show in CV' : 'Hide from CV'}">
											${isHidden ? eyeOffSVG : eyeSVG}
										</button>
										<button type="button" class="cv-dash-entry-delete" data-delete-type="projects" data-index="${idx}" title="Delete Entry">
											${trashSVG}
										</button>
									</div>
								</div>
							`;
							});
						}

						let actionsHTML = '';
						if (sec.id === 'summary') {
							if (!hasContent) {
								actionsHTML = `
								<div class="cv-dash-section-actions">
									<button type="button" class="cv-dash-add-entry-btn" data-add-type="summary">
										<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
										<span>Add Summary</span>
									</button>
								</div>
							`;
							}
						} else {
							const addLabel = sec.name === 'Education' ? 'Add Education' :
								sec.name === 'Experience' ? 'Add Experience' :
								sec.name === 'Certificates' ? 'Add Certificate' :
								sec.name === 'Languages' ? 'Add Language' :
								sec.name === 'Skills' ? 'Add Skill' :
								sec.name === 'Courses' ? 'Add Course' :
								sec.name === 'Projects' ? 'Add Project' :
								sec.name === 'Interests' ? 'Add Interest' : 'Add Entry';

							actionsHTML = `
							<div class="cv-dash-section-actions ${hasContent ? 'has-content' : ''}">
								<button type="button" class="cv-dash-add-entry-btn" data-add-type="${sec.id}">
									<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
									<span>${addLabel}</span>
								</button>
								${hasContent ? `
								<button type="button" class="cv-dash-section-clear-btn" data-clear-section="${sec.id}" title="Clear all entries in ${sec.name}">
									<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
									<span>Clear all</span>
								</button>
								` : ''}
							</div>
						`;
						}

						const colBarHTML = `
						<div class="cv-dash-section-column-bar">
							<div class="cv-dash-col-label">
								<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18"></path></svg>
								<span>Display Location:</span>
							</div>
							<div class="cv-dash-col-select-wrap">
								<select class="cv-dash-heading-column-select" data-column-sec="${sec.id}">
									<option value="default" ${colPref === 'default' ? 'selected' : ''}>Template Default</option>
									<option value="main" ${colPref === 'main' ? 'selected' : ''}>Main Content</option>
									<option value="sidebar" ${colPref === 'sidebar' ? 'selected' : ''}>Sidebar</option>
								</select>
								<svg class="cv-dash-select-chevron" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
							</div>
						</div>
					`;

						entriesHTML = headingEditorHTML + colBarHTML + listHTML + actionsHTML;

						window.__cv_expanded_sections = window.__cv_expanded_sections || new Set(['summary', 'education']);
						const isInitiallyExpanded = window.__cv_expanded_sections.has(sec.id);
						if (isInitiallyExpanded) {
							card.classList.add('is-open');
						}

						card.innerHTML = `
						<div class="cv-dash-accordion-header">
							<div class="cv-dash-accordion-title-wrap">
								<div class="cv-dash-sec-icon-wrap">${sec.icon}</div>
								<strong data-dash-title="${sec.id}">${state['custom_heading_' + sec.id] || sec.name}</strong>
							</div>
							<div class="cv-dash-accordion-actions">
								<div class="cv-dash-order-controls" role="group" aria-label="Move ${sec.name}">
									<button type="button" class="cv-dash-order-btn" data-move-section="${sec.id}" data-move-direction="up" draggable="false" title="Move ${sec.name} up" ${activeIndex === 0 ? 'disabled' : ''}>
										<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
									</button>
									<button type="button" class="cv-dash-order-btn" data-move-section="${sec.id}" data-move-direction="down" draggable="false" title="Move ${sec.name} down" ${activeIndex === activeSecs.length - 1 ? 'disabled' : ''}>
										<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
									</button>
								</div>
								<button type="button" class="cv-dash-edit-heading-btn ${isInitiallyExpanded ? '' : 'cv-hidden'}" data-edit-heading="${sec.id}" draggable="false" title="Edit ${sec.name}">
									<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
								</button>
								<span class="cv-dash-accordion-arrow" draggable="false">
									<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="transform: ${isInitiallyExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; transition: transform 0.2s ease;"><polyline points="6 9 12 15 18 9"></polyline></svg>
								</span>
							</div>
						</div>
						<div class="cv-dash-accordion-content ${isInitiallyExpanded ? '' : 'cv-hidden'}">
							${entriesHTML}
						</div>
					`;

						card.querySelector('.cv-dash-accordion-header').addEventListener('click', (e) => {
							if (e.target.closest('.cv-dash-edit-heading-btn, .cv-dash-order-btn')) return;
							const content = card.querySelector('.cv-dash-accordion-content');
							const arrow = card.querySelector('.cv-dash-accordion-arrow svg');
							const editBtn = card.querySelector('.cv-dash-edit-heading-btn');
							if (content) {
								const willBeOpen = content.classList.contains('cv-hidden');
								content.classList.toggle('cv-hidden', !willBeOpen);
								card.classList.toggle('is-open', willBeOpen);
								if (willBeOpen) {
									window.__cv_expanded_sections.add(sec.id);
								} else {
									window.__cv_expanded_sections.delete(sec.id);
								}
								if (editBtn) {
									editBtn.classList.toggle('cv-hidden', !willBeOpen);
								}
								if (arrow) {
									arrow.style.transform = willBeOpen ? 'rotate(180deg)' : 'rotate(0deg)';
									arrow.style.transition = 'transform 0.2s ease';
								}
							}
						});

						card.querySelectorAll('.cv-dash-entry-card').forEach((entryCard) => {
							const editType = entryCard.dataset.editType;
							const index = entryCard.dataset.index ? parseInt(entryCard.dataset.index, 10) : -1;

							entryCard.addEventListener('click', (e) => {
								if (e.target.closest('.cv-dash-entry-delete') || e.target.closest('.cv-dash-entry-visibility-btn') || e.target.closest('.cv-dash-drag-handle')) return;
								e.preventDefault();

								if (editType === 'summary') {
									openSectionForm('summary');
								} else if (editType === 'languages' || editType === 'certificates') {
									openSectionForm('other');
								} else if (editType === 'experience') {
									openSectionForm('experience');
									openExperienceEdit(index);
								} else if (editType === 'education') {
									openSectionForm('education');
									openEducationEdit(index);
								} else if (editType === 'courses') {
									openSectionForm('courses');
									openCoursesEdit(index);
								} else if (editType === 'skills') {
									openSectionForm('skills');
									openSkillsEdit(index);
								} else if (editType === 'interests') {
									openSectionForm('interests');
									openInterestsEdit(index);
								} else if (editType === 'projects') {
									openSectionForm('projects');
									openProjectsEdit(index);
								}
							});
						});

						card.querySelectorAll('.cv-dash-add-entry-btn').forEach((addBtn) => {
							const addType = addBtn.dataset.addType;
							addBtn.addEventListener('click', (e) => {
								e.preventDefault();
								if (addType === 'summary') {
									openSectionForm('summary');
								} else if (addType === 'languages' || addType === 'certificates') {
									openSectionForm('other');
								} else if (addType === 'interests') {
									openSectionForm('interests');
									openInterestsEdit(-1);
								} else if (addType === 'projects') {
									openSectionForm('projects');
									openProjectsEdit(-1);
								} else if (addType === 'experience') {
									openSectionForm('experience');
									openExperienceEdit(-1);
								} else if (addType === 'education') {
									openSectionForm('education');
									openEducationEdit(-1);
								} else if (addType === 'courses') {
									openSectionForm('courses');
									openCoursesEdit(-1);
								} else if (addType === 'skills') {
									openSectionForm('skills');
									openSkillsEdit(-1);
								}
							});
						});

						// Use the section pencil consistently: like Personal Details, it opens
						// a dedicated editor screen instead of editing inside the dashboard card.
						card.querySelectorAll('[data-edit-heading]').forEach((btn) => {
							const secId = btn.dataset.editHeading;
							btn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();
								const formSection = (secId === 'languages' || secId === 'certificates') ? 'other' : secId;
								openSectionForm(formSection);
							});
						});

						// Close heading editor panel via Done button
						card.querySelectorAll('[data-heading-editor-close]').forEach((btn) => {
							const secId = btn.dataset.headingEditorClose;
							btn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();
								const panel = card.querySelector(`[data-heading-editor-sec="${secId}"]`);
								if (panel) {
									panel.classList.add('cv-hidden');
								}
							});
						});

						// Section Title input typing listener
						card.querySelectorAll('.cv-dash-heading-title-input').forEach((input) => {
							const secId = input.dataset.headingTitleSec;
							input.addEventListener('input', () => {
								state['custom_heading_' + secId] = input.value;
								save();
								renderHeadings();
								// Also update dashboard accordion title
								const titleEl = card.querySelector(`[data-dash-title="${secId}"]`);
								if (titleEl) {
									titleEl.textContent = input.value || (secId.charAt(0).toUpperCase() + secId.slice(1));
								}
							});
						});

						// Section Subtitle input typing listener
						card.querySelectorAll('.cv-dash-heading-subtitle-input').forEach((input) => {
							const secId = input.dataset.headingSubtitleSec;
							input.addEventListener('input', () => {
								state['subtitle_' + secId] = input.value;
								save();
								renderSubtitles();
							});
						});

						// Section column select preference dropdown change listener
						card.querySelectorAll('.cv-dash-heading-column-select').forEach((select) => {
							const secId = select.dataset.columnSec;
							select.addEventListener('change', () => {
								state['column_preference_' + secId] = select.value;
								save();
								renderAll();
							});
						});

						// Entry Visibility Toggle click listener
						card.querySelectorAll('.cv-dash-entry-visibility-btn').forEach((btn) => {
							const secId = btn.dataset.visibilitySec;
							const idx = parseInt(btn.dataset.visibilityIdx, 10);
							btn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();

								if (!Array.isArray(state['hidden_' + secId])) {
									state['hidden_' + secId] = [];
								}
								const indexInHidden = state['hidden_' + secId].indexOf(idx);
								if (indexInHidden > -1) {
									state['hidden_' + secId].splice(indexInHidden, 1);
								} else {
									state['hidden_' + secId].push(idx);
								}

								save();
								renderAll();
								renderContentDashboard();
							});
						});

						// Delete Entry click listener
						card.querySelectorAll('.cv-dash-entry-delete').forEach((deleteBtn) => {
							const deleteType = deleteBtn.dataset.deleteType;
							const index = deleteBtn.dataset.index ? parseInt(deleteBtn.dataset.index, 10) : -1;

							deleteBtn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();

								if (deleteType === 'summary') {
									state.summary = '';
								} else if (deleteType === 'languages') {
									if (Array.isArray(state.languages)) {
										state.languages.splice(index, 1);
									}
									if (Array.isArray(state.hidden_languages)) {
										state.hidden_languages = state.hidden_languages
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								} else if (deleteType === 'experience') {
									state.experience.splice(index, 1);
									if (Array.isArray(state.hidden_experience)) {
										state.hidden_experience = state.hidden_experience
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								} else if (deleteType === 'education') {
									state.education.splice(index, 1);
									if (Array.isArray(state.hidden_education)) {
										state.hidden_education = state.hidden_education
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								} else if (deleteType === 'courses') {
									if (Array.isArray(state.courses)) {
										state.courses.splice(index, 1);
									}
									if (Array.isArray(state.hidden_courses)) {
										state.hidden_courses = state.hidden_courses
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								} else if (deleteType === 'skills') {
									if (Array.isArray(state.skills)) {
										state.skills.splice(index, 1);
									}
									if (Array.isArray(state.hidden_skills)) {
										state.hidden_skills = state.hidden_skills
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								} else if (deleteType === 'certificates') {
									if (Array.isArray(state.certificates)) {
										state.certificates.splice(index, 1);
									}
									if (Array.isArray(state.hidden_certificates)) {
										state.hidden_certificates = state.hidden_certificates
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								} else if (deleteType === 'interests') {
									if (Array.isArray(state.interests)) {
										state.interests.splice(index, 1);
									}
									if (Array.isArray(state.hidden_interests)) {
										state.hidden_interests = state.hidden_interests
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								} else if (deleteType === 'projects') {
									if (Array.isArray(state.projects)) {
										state.projects.splice(index, 1);
									}
									if (Array.isArray(state.hidden_projects)) {
										state.hidden_projects = state.hidden_projects
											.filter(x => x !== index)
											.map(x => x > index ? x - 1 : x);
									}
								}

								save();
								renderAll();
								renderContentDashboard();
							});
						});

						// Section wide clear/delete click listener
						card.querySelectorAll('.cv-dash-section-clear-btn').forEach((clearSecBtn) => {
							const clearSectionId = clearSecBtn.dataset.clearSection;
							clearSecBtn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();
								if (confirm('Are you sure you want to clear all entries in this section?')) {
									removeSectionContent(clearSectionId);
								}
							});
						});

						card.querySelectorAll('.cv-dash-order-btn').forEach((moveBtn) => {
							moveBtn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();
								if (moveBtn.disabled || !Array.isArray(state.activeSections)) return;
								const currentIndex = state.activeSections.indexOf(moveBtn.dataset.moveSection);
								const nextIndex = currentIndex + (moveBtn.dataset.moveDirection === 'up' ? -1 : 1);
								if (currentIndex < 0 || nextIndex < 0 || nextIndex >= state.activeSections.length) return;
								[state.activeSections[currentIndex], state.activeSections[nextIndex]] = [state.activeSections[nextIndex], state.activeSections[currentIndex]];
								save();
								renderAll();
								renderContentDashboard();
							});
						});

						listContainer.appendChild(card);
					});

					// Bind drag and drop events on cards in the dashboard list
					let draggedCard = null;
					const cards = listContainer.querySelectorAll('.cv-dash-accordion-card');
					cards.forEach(c => {
						c.addEventListener('dragstart', (e) => {
							draggedCard = c;
							c.classList.add('cv-dragging');
							e.dataTransfer.effectAllowed = 'move';
						});

						c.addEventListener('dragover', (e) => {
							e.preventDefault();
							e.dataTransfer.dropEffect = 'move';
							const bounding = c.getBoundingClientRect();
							const offset = e.clientY - bounding.top - (bounding.height / 2);
							if (offset > 0) {
								c.after(draggedCard);
							} else {
								c.before(draggedCard);
							}
						});

						c.addEventListener('dragend', () => {
							if (draggedCard) {
								draggedCard.classList.remove('cv-dragging');
								draggedCard = null;

								// Read new order from DOM and update state
								const newOrder = Array.from(listContainer.querySelectorAll('.cv-dash-accordion-card'))
									.map(item => item.dataset.sectionId)
									.filter(Boolean);

								// Also keep any active sections that might not be in the visible sections list
								const remaining = state.activeSections.filter(s => !newOrder.includes(s));
								state.activeSections = [...newOrder, ...remaining];

								save();
								renderAll();
							}
						});
					});
				}
			};

			const openSectionForm = (sectionId) => {
				const dashboard = app.querySelector('#cv-content-dashboard');
				const formContainer = app.querySelector('#cv-dashboard-form-container');
				closeAddContentModal();

				if (!Array.isArray(state.activeSections)) {
					state.activeSections = [];
				}

				const supported = ['summary', 'education', 'experience', 'skills', 'languages', 'certificates', 'interests', 'projects', 'courses', 'awards', 'publications', 'references', 'declaration'];

				if (sectionId === 'other') {
					if (!state.activeSections.includes('languages')) state.activeSections.push('languages');
					if (!state.activeSections.includes('certificates')) state.activeSections.push('certificates');
					save();
					renderAll();
					if (dashboard && formContainer) {
						dashboard.classList.add('cv-hidden');
						formContainer.classList.remove('cv-hidden');
					}
					showFormSection('other');
				} else if (supported.includes(sectionId)) {
					if (!state.activeSections.includes(sectionId)) {
						state.activeSections.push(sectionId);
					}
					save();
					renderAll();

					if (dashboard && formContainer) {
						dashboard.classList.add('cv-hidden');
						formContainer.classList.remove('cv-hidden');
					}

					if (sectionId === 'certificates') {
						showFormSection('other');
					} else {
						showFormSection(sectionId);
					}
				} else if (sectionId === 'header') {
					if (dashboard && formContainer) {
						dashboard.classList.add('cv-hidden');
						formContainer.classList.remove('cv-hidden');
					}
					showFormSection('header');
			} else {
					alert(`The "${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}" section is not supported in the Image Classic Clear template. Supported sections: Summary, Education, Professional Experience, Skills, Languages, Certificates, Interests, and Projects.`);
				}

				if (isSectionEditorOpen() && window.parent && window.parent !== window) {
					window.parent.postMessage({ type: 'medbiomate-cv-editor-focus', hidden: true }, '*');
				}
			};

			const removeSectionContent = (sectionId) => {
				if (sectionId === 'summary') {
					state.summary = '';
				} else if (sectionId === 'experience') {
					state.experience = [];
				} else if (sectionId === 'education') {
					state.education = [];
				} else if (sectionId === 'skills') {
					state.skills = [];
				} else if (sectionId === 'languages') {
					state.languages = [];
				} else if (sectionId === 'certificates') {
					state.certificates = [];
				} else if (sectionId === 'interests') {
					state.interests = [];
				} else if (sectionId === 'projects') {
					state.projects = [];
				} else if (sectionId === 'other') {
					state.certificates = [];
					state.languages = [];
				}

				// Remove from activeSections
				if (Array.isArray(state.activeSections)) {
					if (sectionId === 'other') {
						state.activeSections = state.activeSections.filter(x => x !== 'languages' && x !== 'certificates');
					} else if (sectionId) {
						state.activeSections = state.activeSections.filter(x => x !== sectionId);
					}
				}

				save();
				renderAll();
				renderContentDashboard();
			};

			const templatesList = [
				{ id: 'classic', name: 'ATS Classic First', layoutDesc: 'Single-page A4 CV', preview: 'classic-template-preview-hq.png?v=20260919-hq' },
				{ id: 'clear', name: 'Image Classic Clear', layoutDesc: 'Editorial resume', preview: 'professional-preview.jpg?v=20260918' },
				{ id: 'modern', name: 'Modern Expressive', layoutDesc: 'Side split', preview: 'modern-preview.jpg' },
				{ id: 'bold', name: 'Newmorn CV', layoutDesc: 'Contrast header', preview: 'newmorn-preview.jpg' },
				{ id: 'simple', name: 'Minimel Conty ATS', layoutDesc: 'Centered layout', preview: 'simple-preview.jpg' },
				{ id: 'minimal', name: 'Minimal Sleek', layoutDesc: 'Minimalist', preview: 'minimal-preview.jpg' },
				{ id: 'chromatic', name: 'Clean Chromatic', layoutDesc: 'Bold layout', preview: 'chromatic-preview.jpg' },
				{ id: 'visual', name: 'VE Solid', layoutDesc: 'Visual split', preview: 'visual-preview.jpg' },
				{ id: 'sleek', name: 'Modern Unified CV', layoutDesc: 'Clean header', preview: 'sleek-preview.jpg' },
				{ id: 'flare', name: 'Creative Flare', layoutDesc: 'Creative sidebar', preview: 'flare-preview.png' },
				{ id: 'professional', name: 'Visual Professional', layoutDesc: 'Professional', preview: 'visual-professional-thumb.png' },
				{ id: 'polished', name: 'Creative Polished', layoutDesc: 'Center banner', preview: 'professional-preview.jpg' },
				{ id: 'freeform', name: 'Freeform Unique', layoutDesc: 'Dynamic flow', preview: 'flare-preview.png' }
			];

			const renderWorkspaceTemplates = () => {
				const container = app.querySelector('#cv-workspace-templates-list');
				if (!container) return;

				container.innerHTML = '';
				templatesList.forEach((tpl) => {
					const card = document.createElement('div');
					card.className = `cv-workspace-tpl-card ${state.template === tpl.id ? 'is-active' : ''}`;
					card.innerHTML = `
					<span class="cv-workspace-tpl-preview"><img src="${tpl.preview}" alt="${tpl.name} preview" loading="lazy"></span>
					<span class="cv-workspace-tpl-info"><strong>${tpl.name}</strong><small>${tpl.layoutDesc}</small></span>
					<span class="cv-workspace-tpl-selected" aria-hidden="true">✓</span>
				`;

					card.addEventListener('click', () => {
						state.template = tpl.id;
						applyTemplateDefaultPalette(state, tpl.id);
						save();
						renderAll();
						renderWorkspaceTemplates();
					});

					container.appendChild(card);
				});
			};

			const initWorkspaceTabs = () => {
				const tabBtns = app.querySelectorAll('[data-workspace-tab]');
				const panels = app.querySelectorAll('[data-tab-panel]');
				const topbar = app.querySelector('.cv-workspace-topbar');
				const collapseToggle = app.querySelector('.cv-mobile-topbar-toggle');
				let topbarTouchStartY = 0;
				const setTopbarCollapsed = (collapsed) => {
					document.body.classList.toggle('cv-mobile-topbar-collapsed', collapsed);
					if (collapseToggle) {
						collapseToggle.setAttribute('aria-expanded', String(!collapsed));
						collapseToggle.setAttribute('aria-label', collapsed ? 'Show editor tabs' : 'Hide editor tabs');
					}
					if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'medbiomate-cv-tabs-collapsed', collapsed }, '*');
				};
				window.addEventListener('message', (event) => {
					if (event.source === window.parent && event.data?.type === 'medbiomate-cv-expand-tabs') setTopbarCollapsed(false);
				});
				collapseToggle?.addEventListener('click', () => {
					setTopbarCollapsed(!document.body.classList.contains('cv-mobile-topbar-collapsed'));
				});
				topbar?.addEventListener('touchstart', (event) => {
					topbarTouchStartY = event.touches[0]?.clientY || 0;
				}, { passive: true });
				topbar?.addEventListener('touchend', (event) => {
					const endY = event.changedTouches[0]?.clientY || topbarTouchStartY;
					const deltaY = endY - topbarTouchStartY;
					if (deltaY < -24) setTopbarCollapsed(true);
					if (deltaY > 24) setTopbarCollapsed(false);
				}, { passive: true });

				tabBtns.forEach((btn) => {
					btn.addEventListener('click', () => {
						const tabName = btn.dataset.workspaceTab;

						tabBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
						panels.forEach((p) => {
							p.classList.toggle('cv-hidden', p.dataset.tabPanel !== tabName);
						});

						const workspace = app.querySelector('#cv-builder-workspace');
						if (workspace) {
							if (tabName === 'customize') {
								workspace.classList.add('formatting-mode');
								workspace.classList.remove('formatting-mode-disabled');
							} else {
								workspace.classList.remove('formatting-mode');
								workspace.classList.add('formatting-mode-disabled');
							}
						}

						if (tabName === 'customize') {
							showFormSection('formatting');
						} else if (tabName === 'content') {
							showContentDashboard();
						} else if (tabName === 'overview') {
							renderWorkspaceTemplates();
						}

						if (resizeWorkspacePreviewFn) {
							resizeWorkspacePreviewFn();
						}
					});
				});
			};


			const renderPhoto = () => {
				app.querySelectorAll('.cv-preview-sheet-container > [data-preview], [data-preview-modal]').forEach((previewNode) => {
					const previewImg = previewNode.querySelector('#cv-preview-avatar-img') || previewNode.querySelector('img[id$="avatar-img"]');
					const placeholder = previewNode.querySelector('.cv-preview-photo-placeholder');
					if (previewImg) {
						if (state.photo) {
							previewImg.src = state.photo;
							previewImg.classList.remove('cv-hidden');
							if (placeholder) {
								placeholder.classList.add('cv-hidden');
							}
						} else {
							previewImg.src = '';
							previewImg.classList.add('cv-hidden');
							if (placeholder) {
								placeholder.classList.remove('cv-hidden');
							}
						}
					}
				});

				// Update form photo uploader preview
				const formPhotoImg = app.querySelector('#cv-form-photo-img');
				const formPhotoPlaceholder = app.querySelector('#cv-form-photo-placeholder');
				if (formPhotoImg && formPhotoPlaceholder) {
					if (state.photo) {
						formPhotoImg.src = state.photo;
						formPhotoImg.classList.remove('cv-hidden');
						formPhotoPlaceholder.classList.add('cv-hidden');
					} else {
						formPhotoImg.src = '';
						formPhotoImg.classList.add('cv-hidden');
						formPhotoPlaceholder.classList.remove('cv-hidden');
					}
				}
			};

			const renderTemplateClass = () => {
				app.querySelectorAll('.cv-preview-sheet-container > [data-preview], [data-preview-modal]').forEach((previewNode) => {
					previewNode.classList.remove(
						'cv-preview-classic', 'cv-preview-simple', 'cv-preview-modern',
						'cv-preview-bold', 'cv-preview-flare', 'cv-preview-clear', 'cv-preview-minimal',
						'cv-preview-chromatic', 'cv-preview-visual', 'cv-preview-sleek', 'cv-preview-professional'
					);

					let mappedTemplate = state.template;
					if (['clear'].includes(state.template)) {
						mappedTemplate = 'clear';
					} else if (['simple', 'polished'].includes(state.template)) {
						mappedTemplate = 'simple';
					} else if (['minimal'].includes(state.template)) {
						mappedTemplate = 'minimal';
					} else if (['freeform'].includes(state.template)) {
						mappedTemplate = 'modern';
					} else if (['visual'].includes(state.template)) {
						mappedTemplate = 'visual';
					} else if (['chromatic'].includes(state.template)) {
						mappedTemplate = 'chromatic';
					} else if (['sleek'].includes(state.template)) {
						mappedTemplate = 'sleek';
					}

					previewNode.classList.add(`cv-preview-${mappedTemplate}`);
					if (mappedTemplate === 'classic') {
						previewNode.style.setProperty('font-family', "Georgia, 'Times New Roman', Times, serif", 'important');
						previewNode.style.setProperty('--cv-font-body', "Georgia, 'Times New Roman', Times, serif");
						previewNode.style.setProperty('--cv-font-title', "Georgia, 'Times New Roman', Times, serif");
					} else {
						previewNode.style.removeProperty('font-family');
						previewNode.style.removeProperty('--cv-font-body');
						previewNode.style.removeProperty('--cv-font-title');
					}
				});
			};
			const renderPageDividers = (previewNode, pageCount) => {
				previewNode.querySelectorAll('.cv-page-divider').forEach(el => el.remove());
				previewNode.querySelectorAll('.cv-page-border-overlay').forEach(el => el.remove());

				const isVisual = previewNode.classList.contains('cv-preview-visual') || (typeof state !== 'undefined' && state.template === 'visual');
				const computedPreviewStyles = window.getComputedStyle(previewNode);
				const overlayBorderWidth = isVisual ? 12 : 0;
				const customBorderWidth = previewNode.classList.contains('cv-has-border')
					? (parseFloat(computedPreviewStyles.getPropertyValue('--cv-border-width')) || 0)
					: 0;
				const pageFrameInset = Math.max(overlayBorderWidth, customBorderWidth, 0);

				if (isVisual) {
					for (let i = 0; i < pageCount; i++) {
						const borderOverlay = document.createElement('div');
						borderOverlay.className = 'cv-page-border-overlay';
						borderOverlay.setAttribute('data-page-index', i);
						borderOverlay.style.position = 'absolute';
						borderOverlay.style.top = `${i * PAGE_HEIGHT}px`;
						borderOverlay.style.left = '0';
						borderOverlay.style.right = '0';
						borderOverlay.style.height = `${PAGE_HEIGHT}px`;
						borderOverlay.style.boxSizing = 'border-box';
						borderOverlay.style.pointerEvents = 'none';
						borderOverlay.style.zIndex = '995'; // Below page dividers (999) to keep them separate
						previewNode.appendChild(borderOverlay);
					}
				}

				for (let i = 1; i < pageCount; i++) {
					const divider = document.createElement('div');
					divider.className = 'cv-page-divider';
					divider.style.position = 'absolute';
					divider.style.top = (i * 1131.4) + 'px';
					divider.style.left = `${pageFrameInset}px`;
					divider.style.right = `${pageFrameInset}px`;
					divider.style.height = '24px';
					divider.style.background = '#f7f3ea'; // Matches workspace background
					divider.style.zIndex = '999';
					divider.style.pointerEvents = 'none';

					// Page edge borders
					const borderTop = document.createElement('div');
					borderTop.style.position = 'absolute';
					borderTop.style.top = '0';
					borderTop.style.left = '0';
					borderTop.style.right = '0';
					borderTop.style.borderTop = '1px solid #cbd5e1';

					const borderBottom = document.createElement('div');
					borderBottom.style.position = 'absolute';
					borderBottom.style.bottom = '0';
					borderBottom.style.left = '0';
					borderBottom.style.right = '0';
					borderBottom.style.borderBottom = '1px solid #cbd5e1';

					// Top shadow (for top of next page)
					const topShadow = document.createElement('div');
					topShadow.style.position = 'absolute';
					topShadow.style.bottom = '0';
					topShadow.style.left = '0';
					topShadow.style.right = '0';
					topShadow.style.height = '4px';
					topShadow.style.boxShadow = 'inset 0 4px 4px -2px rgba(15, 23, 42, 0.08)';

					// Bottom shadow (for bottom of previous page)
					const bottomShadow = document.createElement('div');
					bottomShadow.style.position = 'absolute';
					bottomShadow.style.top = '0';
					bottomShadow.style.left = '0';
					bottomShadow.style.right = '0';
					bottomShadow.style.height = '4px';
					bottomShadow.style.boxShadow = 'inset 0 -4px 4px -2px rgba(15, 23, 42, 0.08)';

					divider.appendChild(borderTop);
					divider.appendChild(borderBottom);
					divider.appendChild(topShadow);
					divider.appendChild(bottomShadow);

					const label = document.createElement('span');
					label.textContent = `Page ${i} / Page ${i + 1}`;
					label.style.position = 'absolute';
					label.style.right = '20px';
					label.style.top = '3px';
					label.style.background = '#e2e8f0';
					label.style.color = '#475569';
					label.style.fontSize = '8px';
					label.style.padding = '1px 6px';
					label.style.borderRadius = '999px';
					label.style.fontWeight = 'bold';
					label.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';

					divider.appendChild(label);
					previewNode.appendChild(divider);
				}
			};

			const getElementOffsetWithin = (element, ancestor) => {
				if (!element || !ancestor) return 0;
				const rect = element.getBoundingClientRect();
				const ancestorRect = ancestor.getBoundingClientRect();
				const widthScale = ancestor.offsetWidth > 0 ? (ancestorRect.width / ancestor.offsetWidth) : 1;
				const scale = widthScale || 1;
				return (rect.top - ancestorRect.top) / scale;
			};

			const getFirstUsableContentNode = (element) => {
				if (!element) return null;

				if (element.classList.contains('cv-preview-section')) {
					const child = element.querySelector(
						'.cv-preview-item-header, .cv-preview-item > strong, .cv-preview-item > h4, .cv-preview-item > .cv-preview-item-meta, .cv-skill-list, p:not(:empty), .cv-lang-grid-item, .cv-lang-row-item, .cv-lang-chip-bubble, .cv-lang-level-item, .cv-language-chip, .cv-skill-chip, .cv-skill-level-item, .cv-certificate-chip, .cv-interests-chip'
					);
					if (child) return child;
					return element.querySelector('[class*="-layout"], .cv-certificate-list, .cv-language-list, .cv-skill-list, .cv-interests-list');
				}

				if (element.classList.contains('cv-preview-item')) {
					const header = element.querySelector('.cv-preview-item-header');
					if (header) return header;
					const details = element.querySelector('.cv-preview-item-details');
					if (!details) return null;
					return details.firstElementChild || details;
				}

				return null;
			};

			const adjustPageBreaks = (previewNode) => {
				if (!previewNode) return;

				// 1. Reset all margins first to compute clean baseline offsets
				const selectors = '.cv-preview-section h3, .cv-preview-section-subtitle, .cv-preview-item-header, .cv-preview-contact, .cv-preview-header, .cv-preview-section > p, .cv-preview-section > ul > li, .cv-preview-section > *, .cv-preview-item-details > *, .cv-preview-item-details li, .cv-preview-item-details p, .cv-preview-item li, .cv-preview-item p, .cv-language-list, .cv-certificate-list, .cv-certificate-chip, .cv-language-chip, .cv-skill-chip, .cv-lang-row-item, .cv-lang-level-item, .cv-lang-grid-item, .cv-lang-chip-bubble, .cv-skill-level-item, .cv-skill-grid-item, .cv-skill-chip-bubble, .cv-skill-row-item';
				const resetSelectors = '.cv-preview-section, .cv-preview-item, ' + selectors;
				previewNode.querySelectorAll(resetSelectors).forEach(el => {
					el.style.marginTop = '';
				});

				const pageHeight = PAGE_HEIGHT;
				const footerBuffer = PAGE_FOOTER_MARGIN; // 1cm bottom margin
				const headerBuffer = (typeof state !== 'undefined' && state.template === 'visual') ? 56 : PAGE_HEADER_MARGIN; // 1cm top margin (increased for visual template to clear top borders)

				// 2. Keep section headings attached to their first visible content block.
				previewNode.querySelectorAll('.cv-preview-section').forEach((section) => {
					if (section.offsetWidth === 0 && section.offsetHeight === 0) return;
					if (section.classList.contains('cv-hidden')) return;

					const heading = section.querySelector('h3');
					const firstContent = getFirstUsableContentNode(section);
					if (!heading || !firstContent || heading === firstContent) return;
					if (firstContent.offsetWidth === 0 && firstContent.offsetHeight === 0) return;

					const sectionTop = getElementOffsetWithin(section, previewNode);
					const headingTop = getElementOffsetWithin(heading, previewNode);
					const firstContentTop = getElementOffsetWithin(firstContent, previewNode);
					const firstContentBottom = firstContentTop + firstContent.offsetHeight;
					const headingPageIndex = Math.floor(headingTop / pageHeight);
					const headingPageBottom = (headingPageIndex + 1) * pageHeight;
					const activeBoundary = headingPageBottom - footerBuffer;
					const splitAcrossPages = Math.floor(firstContentTop / pageHeight) !== headingPageIndex;
					const insufficientRoom = firstContentBottom > activeBoundary;

					if (splitAcrossPages || insufficientRoom) {
						const pushOffset = (headingPageBottom + headerBuffer) - sectionTop;
						const currentMargin = parseFloat(window.getComputedStyle(section).marginTop) || 0;
						section.style.marginTop = `${currentMargin + pushOffset}px`;
					}
				});

				// 3. Block push logic for short experience/education entries
				previewNode.querySelectorAll('.cv-preview-item').forEach((item) => {
					if (item.offsetWidth === 0 && item.offsetHeight === 0) return;

					const itemTop = getElementOffsetWithin(item, previewNode);
					const itemHeight = item.offsetHeight;
					const itemBottom = itemTop + itemHeight;
					const pageIndex = Math.floor(itemTop / pageHeight);
					const pageBottom = (pageIndex + 1) * pageHeight;
					const activeBoundary = pageBottom - footerBuffer;
					const nextPageUsableHeight = pageHeight - headerBuffer - footerBuffer;

					const maxBlockPushHeight = 300; // Keep short blocks together
					if (itemBottom > activeBoundary && itemHeight <= nextPageUsableHeight && itemHeight <= maxBlockPushHeight) {
						const pushOffset = (pageBottom + headerBuffer) - itemTop;
						const currentMargin = parseFloat(window.getComputedStyle(item).marginTop) || 0;
						item.style.marginTop = `${currentMargin + pushOffset}px`;
					}
				});

				// 4. Loop through all content elements and apply page breaks
				previewNode.querySelectorAll(selectors).forEach(el => {
					if (el.offsetWidth === 0 && el.offsetHeight === 0) return;

					const elemTop = getElementOffsetWithin(el, previewNode);
					const elemHeight = el.offsetHeight;
					const elemBottom = elemTop + elemHeight;

					const pageIndex = Math.floor(elemTop / pageHeight);
					const pageStart = pageIndex * pageHeight;
					const pageBottom = pageStart + pageHeight;
					const activeBoundary = pageBottom - footerBuffer;

					const isSectionHeader = el.tagName === 'H3';
					const isItemHeader = el.classList.contains('cv-preview-item-header');

					// A. Push elements that cross page boundaries
					const remainingSpace = activeBoundary - elemTop;
					if (elemBottom > activeBoundary || (isSectionHeader && remainingSpace < 120)) {
						// For headings, push the parent container to keep heading + first content line together
						if (isSectionHeader || isItemHeader) {
							const parent = isSectionHeader ? el.closest('.cv-preview-section') : el.closest('.cv-preview-item');
							const target = parent || el;
							const targetTop = getElementOffsetWithin(target, previewNode);
							const pushOffset = (pageBottom + headerBuffer) - targetTop;
							const currentMargin = parseFloat(window.getComputedStyle(target).marginTop) || 0;
							target.style.marginTop = `${currentMargin + pushOffset}px`;
						} else if (elemHeight < (pageHeight - footerBuffer * 2)) {
							// For standard lines/bullets, push them individually
							const pushOffset = (pageBottom + headerBuffer) - elemTop;
							const currentMargin = parseFloat(window.getComputedStyle(el).marginTop) || 0;
							el.style.marginTop = `${currentMargin + pushOffset}px`;
						}
						return;
					}

					// B. Top Margin Alignment: Ensure elements starting on Page 2+ do not land inside the top margin zone
					if (pageIndex > 0) {
						const safetyZoneEnd = pageStart + headerBuffer;
						if (elemTop < safetyZoneEnd) {
							const pushOffset = safetyZoneEnd - elemTop;
							if (isSectionHeader || isItemHeader) {
								const parent = isSectionHeader ? el.closest('.cv-preview-section') : el.closest('.cv-preview-item');
								const target = parent || el;
								const targetTop = getElementOffsetWithin(target, previewNode);
								const currentMargin = parseFloat(window.getComputedStyle(target).marginTop) || 0;
								target.style.marginTop = `${currentMargin + (safetyZoneEnd - targetTop)}px`;
							} else {
								const currentMargin = parseFloat(window.getComputedStyle(el).marginTop) || 0;
								el.style.marginTop = `${currentMargin + pushOffset}px`;
							}
						}
					}
				});
			};

			const ensureColumnWrappers = (previewNode) => {
				if (!previewNode) return;
				previewNode.classList.toggle('cv-has-photo', !!state.photo);

				const belongsToSidebar = (secId, isModern, isBold, isFlare, isMinimal, isSleek) => {
					const pref = state['column_preference_' + secId] || 'default';
					if (pref === 'sidebar') return true;
					if (pref === 'main') return false;

					if (isModern || isMinimal || isSleek) {
						return ['summary', 'skills', 'languages', 'certificates', 'interests'].includes(secId);
					}
					if (isBold) {
						return ['summary', 'languages', 'interests'].includes(secId);
					}
					if (previewNode.classList.contains('cv-preview-professional')) {
						return ['summary', 'skills', 'languages', 'interests'].includes(secId);
					}
					if (isFlare) {
						return ['summary', 'skills', 'languages', 'interests'].includes(secId);
					}
					return false;
				};

				const existingMain = previewNode.querySelector('.cv-preview-col-main');
				const existingSidebar = previewNode.querySelector('.cv-preview-col-sidebar');
				if (existingMain && existingSidebar) {
					while (existingMain.firstChild) {
						previewNode.appendChild(existingMain.firstChild);
					}
					while (existingSidebar.firstChild) {
						previewNode.appendChild(existingSidebar.firstChild);
					}
					existingMain.remove();
					existingSidebar.remove();
				}

				const activeSecIds = Array.isArray(state.activeSections) ? state.activeSections : [];

				// A color target is a styling choice, not a layout choice. Creating
				// wrappers from it made single-column templates (especially Modern
				// Expressive) inherit Newmorn's two-column structure after switching.
				const hasColumns = ['bold', 'flare', 'minimal', 'sleek', 'professional'].some(t => previewNode.classList.contains(`cv-preview-${t}`));

				if (previewNode.classList.contains('cv-preview-clear') || previewNode.classList.contains('cv-preview-chromatic') || previewNode.classList.contains('cv-preview-visual') || !hasColumns) {
					const topSelectors = ['.cv-preview-photo-wrap', '.cv-preview-header', '.cv-preview-contact'];
					topSelectors.forEach((selector) => {
						const el = previewNode.querySelector(selector);
						if (el) previewNode.appendChild(el);
					});
					activeSecIds.forEach((secId, idx) => {
						const el = previewNode.querySelector(`.cv-preview-section-${secId}`);
						if (el) {
							el.style.setProperty('order', String(idx + 10), 'important');
							previewNode.appendChild(el);
						}
					});
					return;
				}

				const colMain = document.createElement('div');
				colMain.className = 'cv-preview-col-main';
				const colSidebar = document.createElement('div');
				colSidebar.className = 'cv-preview-col-sidebar';

				const header = previewNode.querySelector('.cv-preview-header');
				const photo = previewNode.querySelector('.cv-preview-photo-wrap');
				const contact = previewNode.querySelector('.cv-preview-contact');

				const isModern = previewNode.classList.contains('cv-preview-modern');
				const isFlare = previewNode.classList.contains('cv-preview-flare');
				const isBold = previewNode.classList.contains('cv-preview-bold');
				const isMinimal = previewNode.classList.contains('cv-preview-minimal');
				const isSleek = previewNode.classList.contains('cv-preview-sleek');
				const isProfessional = previewNode.classList.contains('cv-preview-professional');

				if (photo) {
					if (isMinimal || isSleek) {
						previewNode.appendChild(photo);
					} else {
						colSidebar.appendChild(photo);
					}
				}
				if (header) {
					if (isModern || isBold || isFlare || isProfessional) {
						colSidebar.appendChild(header);
					} else if (isMinimal || isSleek) {
						previewNode.appendChild(header);
					} else {
						colMain.appendChild(header);
					}
				}
				if (contact) {
					if (isMinimal || isSleek) {
						previewNode.appendChild(contact);
					} else {
						colSidebar.appendChild(contact);
					}
				}

				activeSecIds.forEach((secId, idx) => {
					const el = previewNode.querySelector(`.cv-preview-section-${secId}`);
					if (el) {
						el.style.setProperty('order', String(idx + 10), 'important');
						if (belongsToSidebar(secId, isModern, isBold, isFlare, isMinimal, isSleek)) {
							colSidebar.appendChild(el);
						} else {
							colMain.appendChild(el);
						}
					}
				});

				previewNode.appendChild(colMain);
				previewNode.appendChild(colSidebar);
			};



			const getPreviewContentHeight = (previewNode) => {
				if (!previewNode) return PAGE_HEIGHT;

				const measurableSelectors = [
					'.cv-preview-photo-wrap',
					'.cv-preview-header',
					'.cv-preview-contact',
					'.cv-preview-section',
					'.cv-preview-item'
				].join(', ');

				let maxBottom = 0;

				previewNode.querySelectorAll(measurableSelectors).forEach((element) => {
					if (element.classList.contains('cv-hidden')) return;
					const height = element.offsetHeight;
					if (height === 0) return;

					const styles = window.getComputedStyle(element);
					if (styles.display === 'none' || styles.visibility === 'hidden') return;

					const top = getElementOffsetWithin(element, previewNode);
					const marginBottom = parseFloat(styles.marginBottom) || 0;
					const bottom = top + height + marginBottom;
					maxBottom = Math.max(maxBottom, bottom);
				});

				return maxBottom > 0 ? maxBottom : PAGE_HEIGHT;
			};

			const getPageCountFromContentHeight = (contentHeight) => {
				// Subtract a 45px tolerance threshold to allow minor overflows to squeeze onto the current page
				return Math.max(1, Math.ceil((contentHeight - 45) / PAGE_HEIGHT));
			};

			const isCanonicalDefaultA4Content = () =>
				state.fullName === 'George Emmanuel' &&
				Array.isArray(state.experience) && state.experience.length === 4 &&
				state.experience[0]?.company === 'Northbridge Digital' &&
				Array.isArray(state.education) && state.education.length === 2 &&
				Array.isArray(state.skills) && state.skills.length === 10 &&
				Array.isArray(state.certificates) && state.certificates.length === 4 &&
				Array.isArray(state.languages) && state.languages.length === 4;

			const measurePaginatedPreview = (previewNode) => {
				if (!previewNode) {
					return {
						contentHeight: PAGE_HEIGHT,
						pageCount: 1
					};
				}

				const isDefaultA4 = isCanonicalDefaultA4Content();
				previewNode.classList.toggle('cv-default-a4-content', isDefaultA4);

				// Reset dynamic centering padding variables to baseline defaults before measuring
				previewNode.style.removeProperty('--cv-modern-padding-top');
				previewNode.style.removeProperty('--cv-modern-padding-bottom');

				let contentHeight = PAGE_HEIGHT;
				let pageCount = 1;
				let previousPageCount = 0;
				let safetyPasses = 0;

				while (safetyPasses < 3 && pageCount !== previousPageCount) {
					previousPageCount = pageCount;
					previewNode.style.height = 'auto';
					// Apply the same physical A4 safety area to every résumé, including the
					// built-in sample after a user changes its layout or typography. This
					// keeps content clear of the bottom edge and gives page 2+ a top margin.
					adjustPageBreaks(previewNode);
					contentHeight = getPreviewContentHeight(previewNode);
					pageCount = getPageCountFromContentHeight(contentHeight);
					previewNode.style.height = `${pageCount * PAGE_HEIGHT}px`;
					previewNode.style.setProperty('--page-count', pageCount);
					safetyPasses += 1;
				}

				return {
					contentHeight,
					pageCount
				};
			};

			const renderOptionalFields = () => {
				OPTIONAL_FIELDS.forEach((f) => {
					const id = f.id;
					const isActive = state.activeFields && state.activeFields.includes(id);

					// Find the wrapper in the form
					const wrapper = app.querySelector(`[data-optional-field="${id}"]`);
					if (wrapper) {
						wrapper.classList.toggle('cv-hidden', !isActive);
					}

					// Find the corresponding add button/pill
					const pill = app.querySelector(`[data-add-pill="${id}"]`);
					if (pill) {
						pill.classList.toggle('cv-hidden', isActive);
					}

					// Update link button visual state
					const linkBtn = app.querySelector(`[data-link-field="${id}"]`);
					if (linkBtn) {
						linkBtn.classList.toggle('is-linked', !!state['link_' + id]);
					}
				});
			};

			const renderHeadings = () => {
				const defaultHeadings = {
					summary: 'Summary',
					experience: 'Professional Experience',
					education: 'Education',
					courses: 'Courses',
					skills: 'Skills',
					certificates: 'Certificates',
					languages: 'Languages'
				};
				Object.keys(defaultHeadings).forEach(id => {
					const val = state['custom_heading_' + id] || defaultHeadings[id];
					app.querySelectorAll(`[data-bind-heading="${id}"]`).forEach(el => {
						el.textContent = val;
					});
				});
			};

			const renderSubtitles = () => {
				const sections = ['summary', 'experience', 'education', 'courses', 'skills', 'languages', 'certificates'];
				sections.forEach(id => {
					const val = state['subtitle_' + id] || '';
					app.querySelectorAll(`[data-bind-subtitle="${id}"]`).forEach(el => {
						el.textContent = val;
						el.classList.toggle('cv-hidden', !val);
					});
				});
			};

			const updateColorTargetAvailability = () => {
				const hasColorTargetControls = !!app.querySelector('[data-color-target]');
				const currentTemplate = state.template || 'classic';
				const isColumnLayout = ['visual', 'freeform', 'modern', 'chromatic', 'sleek', 'bold', 'flare', 'professional', 'minimal'].includes(currentTemplate);

				const btnFull = app.querySelector('[data-color-target="full"]');
				const btnColumn = app.querySelector('[data-color-target="column"]');

				if (!hasColorTargetControls) {
					state.colorTarget = (state.colorMode || 'single') === 'multi' ? 'column' : 'full';
					return;
				}

				if (isColumnLayout) {
					// Column layout active: Disable Full Page, enable Column
					if (btnFull) {
						btnFull.style.opacity = '0.3';
						btnFull.style.pointerEvents = 'none';
						btnFull.classList.remove('is-active');
					}
					if (btnColumn) {
						btnColumn.style.opacity = '';
						btnColumn.style.pointerEvents = '';
					}

					// Automatically switch target to Column if currently on Full Page
					if (state.colorTarget === 'full' || !state.colorTarget) {
						state.colorTarget = 'column';
						state.colorMode = 'multi';

						app.querySelectorAll('[data-color-mode]').forEach(b => {
							b.classList.toggle('is-active', b.dataset.colorMode === 'multi');
						});

						if (btnColumn) btnColumn.classList.add('is-active');
						save();
					}
				} else {
					// Full page layout active: Disable Column, enable Full Page
					if (btnColumn) {
						btnColumn.style.opacity = '0.3';
						btnColumn.style.pointerEvents = 'none';
						btnColumn.classList.remove('is-active');
					}
					if (btnFull) {
						btnFull.style.opacity = '';
						btnFull.style.pointerEvents = '';
					}

					// Automatically switch target to Full Page if currently on Column
					if (state.colorTarget === 'column') {
						state.colorTarget = 'full';
						if (btnFull) btnFull.classList.add('is-active');
						save();
					}
				}

				// Highlight the correct active target button
				app.querySelectorAll('[data-color-target]').forEach(btn => {
					btn.classList.toggle('is-active', btn.dataset.colorTarget === state.colorTarget);
				});

				// Synchronize Layout Columns selector UI:
				const layoutCol = state.colorTarget === 'column' ? 'two' : 'one';
				app.querySelectorAll('.cv-layout-col-btn').forEach(b => {
					b.classList.toggle('is-active', b.dataset.layoutCol === layoutCol);
				});
			};

			const renderAll = () => {
				applyTemplateStyle();
				updateColorTargetAvailability();

				// Refresh list of fields to include newly rendered ones
				const currentFields = app.querySelectorAll('[data-field]');
				currentFields.forEach((field) => {
					field.value = state[field.dataset.field] || '';
				});

				const summaryContent = app.querySelector('#cv-summary-rich-editor .cv-rich-editor-content');
				if (summaryContent) {
					setRichEditorValue(summaryContent, state.summary || '');
				}

				renderOptionalFields();

				// Hide summary checkbox/form wrapper sync
				const hideSummaryCheckbox = app.querySelector('#cv-hide-summary');
				if (hideSummaryCheckbox) {
					hideSummaryCheckbox.checked = !!state.hideSummary;
				}
				const summaryTextareaWrapper = app.querySelector('#cv-summary-textarea-wrapper');
				if (summaryTextareaWrapper) {
					summaryTextareaWrapper.classList.toggle('cv-hidden', !!state.hideSummary);
				}

				renderBindableFields();
				renderHeadings();
				renderSubtitles();
				renderTemplateClass();
				renderPhoto();
				renderSkills();
				renderCertificates();
				renderLanguages();
				renderInterests();
				renderExperienceList();
				renderEducationList();
				renderCoursesList();
				renderAwardsList();
				renderPublicationsList();
				renderReferencesList();
				renderSkillsList();
				renderLanguagesList();
				renderCertificatesList();
				renderInterestsList();
				renderCollectionPreview();

				// Toggle section visibility based on activeSections list and non-empty content
				app.querySelectorAll('.cv-preview-section-summary').forEach(el => {
					const hasContent = !!state.summary && !isRichEditorEmpty(state.summary);
					el.classList.toggle('cv-hidden', !!state.hideSummary || !Array.isArray(state.activeSections) || !state.activeSections.includes('summary') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-experience').forEach(el => {
					const hasContent = Array.isArray(state.experience) && state.experience.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('experience') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-education').forEach(el => {
					const hasContent = Array.isArray(state.education) && state.education.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('education') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-courses').forEach(el => {
					const hasContent = Array.isArray(state.courses) && state.courses.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('courses') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-skills').forEach(el => {
					const hasContent = Array.isArray(state.skills) && state.skills.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('skills') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-certificates').forEach(el => {
					const hasContent = Array.isArray(state.certificates) && state.certificates.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('certificates') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-languages').forEach(el => {
					const hasContent = Array.isArray(state.languages) && state.languages.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('languages') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-projects').forEach(el => {
					const hasContent = Array.isArray(state.projects) && state.projects.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('projects') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-interests').forEach(el => {
					const hasContent = Array.isArray(state.interests) && state.interests.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('interests') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-awards').forEach(el => {
					const hasContent = Array.isArray(state.awards) && state.awards.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('awards') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-publications').forEach(el => {
					const hasContent = Array.isArray(state.publications) && state.publications.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('publications') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-references').forEach(el => {
					const hasContent = Array.isArray(state.references) && state.references.length > 0;
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('references') || !hasContent);
				});
				app.querySelectorAll('.cv-preview-section-declaration').forEach(el => {
					const hasContent = state.declaration && (state.declaration.text || state.declaration.signature || state.declaration.name || state.declaration.place || state.declaration.date);
					el.classList.toggle('cv-hidden', !Array.isArray(state.activeSections) || !state.activeSections.includes('declaration') || !hasContent);
				});

				// Customizer styling application
				const scaleTitle = state.previewFontScaleTitle || 1.0;
				const scaleSubtitle = state.previewFontScaleSubtitle || 1.0;
				const scaleBody = state.previewFontScaleBody || 1.0;

				app.querySelectorAll('.cv-preview-sheet-container > [data-preview], [data-preview-modal]').forEach((previewNode) => {
					ensureColumnWrappers(previewNode);
					const isClassic = state.template === 'classic';
					if (isClassic) {
						previewNode.style.setProperty('font-family', "Georgia, 'Times New Roman', Times, serif", 'important');
						previewNode.style.setProperty('--cv-font-body', "Georgia, 'Times New Roman', Times, serif");
						previewNode.style.setProperty('--cv-font-title', "Georgia, 'Times New Roman', Times, serif");
					}

					previewNode.style.setProperty('--cv-font-scale-title', scaleTitle, 'important');
					previewNode.style.setProperty('--cv-font-scale-subtitle', scaleSubtitle, 'important');
					previewNode.style.setProperty('--cv-font-scale-body', scaleBody, 'important');

					// Customizer settings
					const baseSize = state.previewFontSizeBase || (isClassic ? 7.8 : 9);
					previewNode.style.setProperty('--cv-base-font-size', baseSize + 'pt', 'important');
					previewNode.style.setProperty('--cv-fullname-font-size', (baseSize + (state.previewFontSizeName ?? (isClassic ? 10 : 11))) + 'pt', 'important');
					previewNode.style.setProperty('--cv-title-font-size', (baseSize + (state.previewFontSizeTitle ?? (isClassic ? 2 : 5))) + 'pt', 'important');
					previewNode.style.setProperty('--cv-heading-font-size', (baseSize + (state.previewFontSizeHeading ?? (isClassic ? 1.5 : 3))) + 'pt', 'important');
					previewNode.style.setProperty('--cv-body-font-size', (baseSize + (state.previewFontSizeBody ?? 0)) + 'pt', 'important');
					previewNode.style.setProperty('--cv-entry-font-size', (baseSize + (state.previewFontSizeEntry ?? 0)) + 'pt', 'important');

					previewNode.style.setProperty('--cv-line-height', ((state.previewLineHeight ?? (isClassic ? 118 : 115)) / 100).toFixed(2), 'important');
					previewNode.style.setProperty('--cv-element-space', (state.previewElementSpace ?? (isClassic ? 5 : 12)) + 'px', 'important');
					previewNode.style.setProperty('--cv-side-margin', (state.previewSideMargin ?? (isClassic ? 14 : 22)) + 'mm', 'important');
					previewNode.style.setProperty('--cv-vertical-margin', (state.previewVerticalMargin ?? (isClassic ? 10 : 12)) + 'mm', 'important');
					previewNode.style.setProperty('--cv-subtitle-text-space', (state.previewSubtitleTextSpace ?? (isClassic ? 2 : 6)) + 'px', 'important');

					// Resolve dynamic color configuration
					const colorMode = state.colorMode || 'single';
					const hasColorTargetControls = !!app.querySelector('[data-color-target]');
					const colorTarget = hasColorTargetControls
						? (state.colorTarget || 'full')
						: (colorMode === 'multi' ? 'column' : 'full');

					// Reset dynamic variables & classes
					previewNode.style.removeProperty('--cv-page-bg');
					previewNode.style.removeProperty('--cv-main-bg');
					previewNode.style.removeProperty('--cv-sidebar-bg');
					previewNode.style.removeProperty('--cv-flare-sidebar-bg');
					previewNode.style.removeProperty('--cv-flare-sidebar-text');
					previewNode.classList.remove('cv-has-border', 'cv-border-top', 'cv-border-bottom', 'cv-border-left', 'cv-border-right');
					previewNode.style.removeProperty('--cv-border-width');
					previewNode.style.removeProperty('--cv-border-color');
					previewNode.style.removeProperty('background-image');
					previewNode.style.removeProperty('background-size');

					// Resolve target colors
					let resolvedColor = state.solidColor || '#22579b';
					let resolvedAccent = resolvedColor;
					let sidebarColorForContrast = resolvedColor;

					if (colorMode === 'multi') {
						resolvedColor = state.multiSidebarColor || '#1e293b';
						resolvedAccent = state.boxBubbleColor || '#ebeffa';
						sidebarColorForContrast = resolvedColor;
						previewNode.style.setProperty('--cv-page-bg', state.multiPageBackgroundColor || '#ffffff');
						previewNode.style.setProperty('--cv-main-bg', state.multiPageBackgroundColor || '#ffffff');
					}

					if (colorTarget === 'full') {
						if (colorMode === 'single') {
							if (resolvedColor !== 'transparent') {
								previewNode.style.setProperty('--cv-page-bg', '#ffffff');
								previewNode.style.setProperty('--cv-main-bg', '#ffffff');
								previewNode.style.setProperty('--cv-preview-accent', resolvedColor);
							} else {
								previewNode.style.setProperty('--cv-page-bg', '#ffffff');
								previewNode.style.setProperty('--cv-main-bg', '#ffffff');
								previewNode.style.setProperty('--cv-preview-accent', '#6366f1');
							}
						} else if (colorMode === 'image') {
							const pattern = state.pattern || 'leaf';
							if (pattern === 'leaf') {
								previewNode.style.backgroundImage = "url('assets/img/patterns/leaf.jpg')";
								previewNode.style.backgroundSize = "cover";
							} else if (pattern === 'geometric') {
								previewNode.style.backgroundImage = "radial-gradient(#cbd5e1 1px, transparent 0), radial-gradient(#cbd5e1 1px, #ffffff 0)";
								previewNode.style.backgroundSize = "8px 8px";
							} else if (pattern === 'dots') {
								previewNode.style.backgroundImage = "radial-gradient(#cbd5e1 1px, transparent 0)";
								previewNode.style.backgroundSize = "6px 6px";
							} else if (pattern === 'lines') {
								previewNode.style.backgroundImage = "linear-gradient(0deg, transparent 24%, rgba(203,213,225,.3) 25%, rgba(203,213,225,.3) 26%, transparent 27%, transparent 74%, rgba(203,213,225,.3) 75%, rgba(203,213,225,.3) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(203,213,225,.3) 25%, rgba(203,213,225,.3) 26%, transparent 27%, transparent 74%, rgba(203,213,225,.3) 75%, rgba(203,213,225,.3) 76%, transparent 77%)";
								previewNode.style.backgroundSize = "15px 15px";
							}
						}
					} else if (colorTarget === 'column') {
						if (resolvedColor !== 'transparent') {
							previewNode.style.setProperty('--cv-sidebar-bg', resolvedColor);
						}
						previewNode.style.setProperty('--cv-preview-accent', resolvedAccent);
					} else if (colorTarget === 'border') {
						if (resolvedColor !== 'transparent') {
							previewNode.classList.add('cv-has-border');
							if (state.borderTop !== false) previewNode.classList.add('cv-border-top');
							if (state.borderBottom !== false) previewNode.classList.add('cv-border-bottom');
							if (state.borderLeft !== false) previewNode.classList.add('cv-border-left');
							if (state.borderRight !== false) previewNode.classList.add('cv-border-right');

							const borderSize = state.borderSize || 'M';
							const borderWidth = borderSize === 'S' ? '4px' : borderSize === 'M' ? '8px' : '12px';
							previewNode.style.setProperty('--cv-border-width', borderWidth);
							previewNode.style.setProperty('--cv-border-color', resolvedColor);
							previewNode.style.setProperty('--cv-preview-accent', resolvedColor);
						}
					}

					// Apply Accent Toggles classes (disabled)
					previewNode.classList.remove(
						'cv-accent-name-active',
						'cv-accent-skills-active',
						'cv-accent-jobtitle-active',
						'cv-accent-dates-active',
						'cv-accent-headings-active',
						'cv-accent-subtitle-active',
						'cv-accent-headericons-active',
						'cv-accent-linkicons-active'
					);

					// Fallback for default color inputs
					if (state.previewColorTitle) {
						previewNode.style.setProperty('--cv-preview-color-title', state.previewColorTitle);
						previewNode.style.setProperty('--cv-preview-title', state.previewColorTitle);
					}
					if (state.previewColorSubtitle) {
						previewNode.style.setProperty('--cv-preview-color-subtitle', state.previewColorSubtitle);
						previewNode.style.setProperty('--cv-preview-subtitle', state.previewColorSubtitle);
					}
					if (state.previewColorBody) {
						previewNode.style.setProperty('--cv-preview-color-body', state.previewColorBody);
						previewNode.style.setProperty('--cv-preview-body', state.previewColorBody);
					}
					if (state.previewColorBullet) {
						previewNode.style.setProperty('--cv-preview-bullet', state.previewColorBullet);
					}
					if (state.previewColorDate) {
						previewNode.style.setProperty('--cv-preview-date', state.previewColorDate);
					}
					if (state.previewColorLocation) {
						previewNode.style.setProperty('--cv-preview-location', state.previewColorLocation);
					}
					const derivedSidebarTextColor = getContrastTextColor(
						colorMode === 'multi' ? (state.multiSidebarColor || sidebarColorForContrast) : sidebarColorForContrast
					);
					const effectiveSidebarTextColor = state.sidebarTextColor && state.sidebarTextColor !== '#ffffff'
						? state.sidebarTextColor
						: (colorMode === 'single'
							? (state.previewColorAccentInk || derivedSidebarTextColor)
							: derivedSidebarTextColor);
					previewNode.style.setProperty('--cv-sidebar-text-color', effectiveSidebarTextColor);
					previewNode.style.setProperty('--cv-flare-sidebar-text', effectiveSidebarTextColor);
					if (colorMode === 'multi') {
						previewNode.style.setProperty('--cv-preview-accent-ink', effectiveSidebarTextColor);
					}
					if (state.previewIconColor) previewNode.style.setProperty('--cv-preview-icon-color', state.previewIconColor);
					if (state.boxBubbleColor) {
						previewNode.style.setProperty('--cv-box-bubble-color', state.boxBubbleColor);
						previewNode.style.setProperty('--cv-preview-photo-box', state.boxBubbleColor);
					} else {
						previewNode.style.setProperty('--cv-box-bubble-color', '#ebeffa');
						previewNode.style.setProperty('--cv-preview-photo-box', '#ebeffa');
					}
					if (state.levelColor) {
						previewNode.style.setProperty('--cv-level-color', state.levelColor);
					}
					if (state.multiSidebarColor) {
						previewNode.style.setProperty('--cv-sidebar-bg', state.multiSidebarColor);
						previewNode.style.setProperty('--cv-flare-sidebar-bg', state.multiSidebarColor);
					}
					if (state.previewColorAccentDark) previewNode.style.setProperty('--cv-preview-accent-dark', state.previewColorAccentDark);
					if (state.previewColorAccentSoft) previewNode.style.setProperty('--cv-preview-accent-soft', state.previewColorAccentSoft);
					if (state.previewColorAccentInk) previewNode.style.setProperty('--cv-preview-accent-ink', state.previewColorAccentInk);
					if (state.previewColorAccentMuted) previewNode.style.setProperty('--cv-preview-accent-muted', state.previewColorAccentMuted);
					if (state.previewColorLeftBadge) previewNode.style.setProperty('--cv-preview-left-badge-bg', state.previewColorLeftBadge);
					if (state.previewColorRightBadge) previewNode.style.setProperty('--cv-preview-right-badge-bg', state.previewColorRightBadge);

					// Font styles customizer settings
					const subWeight = (state.custSubtitleStyle === 'bold') ? 'bold' : 'normal';
					const subStyle = (state.custSubtitleStyle === 'italic') ? 'italic' : 'normal';
					const dateWeight = (state.custDateStyle === 'bold') ? 'bold' : 'normal';
					const dateStyle = (state.custDateStyle === 'italic') ? 'italic' : 'normal';
					const locWeight = (state.custLocationStyle === 'bold') ? 'bold' : 'normal';
					const locStyle = (state.custLocationStyle === 'italic') ? 'italic' : 'normal';

					previewNode.style.setProperty('--cv-subtitle-weight', subWeight);
					previewNode.style.setProperty('--cv-subtitle-style', subStyle);
					previewNode.style.setProperty('--cv-date-weight', dateWeight);
					previewNode.style.setProperty('--cv-date-style', dateStyle);
					previewNode.style.setProperty('--cv-location-weight', locWeight);
					previewNode.style.setProperty('--cv-location-style', locStyle);

					// Subtitle Placement
					if (state.custSubtitlePlacement === 'same') {
						previewNode.style.setProperty('--cv-title-sub-direction', 'row');
						previewNode.style.setProperty('--cv-title-sub-align', 'baseline');
						previewNode.style.setProperty('--cv-title-sub-gap', '8px');
					} else {
						previewNode.style.setProperty('--cv-title-sub-direction', 'column');
						previewNode.style.setProperty('--cv-title-sub-align', 'flex-start');
						previewNode.style.setProperty('--cv-title-sub-gap', '2px');
					}

					// Location & Date Order & Placement
					const order = state.custDateLocOrder || 'date-loc';
					const placement = state.custLocationPlacement || 'same'; // 'same' or 'below'

					if (placement === 'same') {
						previewNode.style.setProperty('--cv-date-loc-direction', order === 'date-loc' ? 'row' : 'row-reverse');
						previewNode.style.setProperty('--cv-date-loc-align', 'baseline');
						previewNode.style.setProperty('--cv-date-loc-gap', '10px');
					} else {
						previewNode.style.setProperty('--cv-date-loc-direction', order === 'date-loc' ? 'column' : 'column-reverse');
						previewNode.style.setProperty('--cv-date-loc-align', 'flex-end');
						previewNode.style.setProperty('--cv-date-loc-gap', '2px');
					}

					// Indentation
					previewNode.style.setProperty('--cv-desc-indent', state.custIndentBody ? '15px' : '0px');

					// Photo Border Shape
					const photoShape = state.custPhotoShape || 'circle';
					let photoRadius = '8px';
					if (photoShape === 'circle') photoRadius = '50%';
					else if (photoShape === 'square') photoRadius = '0px';
					else if (photoShape === 'rounded') photoRadius = '8px';
					previewNode.style.setProperty('--cv-photo-border-radius', photoRadius);

					// List style class
					previewNode.classList.toggle('cv-preview-list-hyphen', state.custListStyle === 'hyphen');

					// Entry Layout toggles
					previewNode.classList.toggle('cv-preview-date-below', state.custDatePosition === 'below');
					previewNode.classList.toggle('cv-preview-sub-below', state.custSubtitlePlacement === 'below');
					previewNode.classList.toggle('cv-preview-loc-below', state.custLocationPlacement === 'below');

					// Heading customizer toggles
					const headingStyle = state.custHeadingStyle || '1';
					const headingCase = state.custHeadingCase || 'uppercase';
					const headingIcon = state.custHeadingIcon || 'none';

					for (let i = 1; i <= 9; i++) {
						previewNode.classList.remove(`cv-heading-style-${i}`);
					}
					previewNode.classList.add(`cv-heading-style-${headingStyle}`);
					previewNode.classList.toggle('cv-heading-case-capitalize', headingCase === 'capitalize');
					previewNode.classList.toggle('cv-heading-case-uppercase', headingCase === 'uppercase');
					previewNode.classList.toggle('cv-preview-icon-none', headingIcon === 'none');
					previewNode.classList.toggle('cv-preview-icon-outline', headingIcon === 'outline');
					previewNode.classList.toggle('cv-preview-icon-filled', headingIcon === 'filled');

					const { pageCount, contentHeight } = measurePaginatedPreview(previewNode);

					// Dynamic vertical centering for Modern template on a single page
					if (previewNode.classList.contains('cv-preview-modern')) {
						if (pageCount === 1) {
							const remaining = PAGE_HEIGHT - contentHeight;
							if (remaining > 0) {
								const extraPadding = remaining / 2;
								previewNode.style.setProperty('--cv-modern-padding-top', (24 + extraPadding) + 'px');
								previewNode.style.setProperty('--cv-modern-padding-bottom', (24 + extraPadding) + 'px');
							} else {
								previewNode.style.removeProperty('--cv-modern-padding-top');
								previewNode.style.removeProperty('--cv-modern-padding-bottom');
							}
						} else {
							previewNode.style.removeProperty('--cv-modern-padding-top');
							previewNode.style.removeProperty('--cv-modern-padding-bottom');
						}
					}

					// Apply page count to parent container and preview node
					previewNode.style.setProperty('--page-count', pageCount);
					const container = previewNode.closest('.cv-preview-sheet-container');
					if (container) {
						container.style.setProperty('--page-count', pageCount);
					}

					renderPageDividers(previewNode, pageCount);

					// Clean up temporary debug overlay
					const existingDebug = document.getElementById('cv-debug-overlay');
					if (existingDebug) existingDebug.remove();

					// Set preview element height to match page count
					previewNode.style.height = (pageCount * PAGE_HEIGHT) + 'px';

					if (resizeWorkspacePreviewFn) {
						resizeWorkspacePreviewFn();
					}
				});

				// Sync formatting range sliders to current state values
				const updateSliderVal = (sliderId, val) => {
					const slider = app.querySelector(`#${sliderId}`);
					if (slider && val !== undefined && val !== null && val !== '') {
						slider.value = val;

						// Also update label and track progress fill
						const valSpanId = sliderId.replace('cv-slider-', 'cv-val-');
						const valSpan = app.querySelector(`#${valSpanId}`);
						if (valSpan) {
							let unit = 'pt';
							if (sliderId === 'cv-slider-element-space' || sliderId === 'cv-slider-subtitle-text-space') unit = 'px';
							if (sliderId === 'cv-slider-side-margin' || sliderId === 'cv-slider-vertical-margin') unit = 'mm';

							if (sliderId === 'cv-slider-base-size') {
								valSpan.textContent = `${val}${unit}`;
							} else if (sliderId === 'cv-slider-line-height') {
								valSpan.textContent = (val / 100).toFixed(2);
							} else if (sliderId.includes('-size')) {
								valSpan.textContent = `${val > 0 ? '+' : ''}${val}${unit}`;
							} else {
								valSpan.textContent = `${val}${unit}`;
							}
						}
						const min = parseFloat(slider.min || 0);
						const max = parseFloat(slider.max || 100);
						const percent = ((val - min) / (max - min)) * 100;
						const track = slider.parentElement;
						if (track) {
							track.style.setProperty('--value-percent', `${percent}%`);
						}
					}
				};

				updateSliderVal('cv-slider-base-size', state.previewFontSizeBase);
				updateSliderVal('cv-slider-name-size', state.previewFontSizeName);
				updateSliderVal('cv-slider-title-size', state.previewFontSizeTitle);
				updateSliderVal('cv-slider-heading-size', state.previewFontSizeHeading);
				updateSliderVal('cv-slider-body-size', state.previewFontSizeBody);
				updateSliderVal('cv-slider-entry-size', state.previewFontSizeEntry);
				updateSliderVal('cv-slider-line-height', state.previewLineHeight);
				updateSliderVal('cv-slider-element-space', state.previewElementSpace);
				updateSliderVal('cv-slider-side-margin', state.previewSideMargin);
				updateSliderVal('cv-slider-vertical-margin', state.previewVerticalMargin);
				updateSliderVal('cv-slider-subtitle-text-space', state.previewSubtitleTextSpace);

				// Update all font size labels
				app.querySelectorAll('#cv-size-val-title, #cv-modal-size-val-title').forEach(node => {
					node.textContent = Math.round(scaleTitle * 100) + '%';
				});
				app.querySelectorAll('#cv-size-val-subtitle, #cv-modal-size-val-subtitle').forEach(node => {
					node.textContent = Math.round(scaleSubtitle * 100) + '%';
				});
				app.querySelectorAll('#cv-size-val-body, #cv-modal-size-val-body').forEach(node => {
					node.textContent = Math.round(scaleBody * 100) + '%';
				});

				// Update all color picker inputs and swatches
				const updateColorInput = (pickerSelector, bgSelector, color) => {
					if (!color) return;
					app.querySelectorAll(pickerSelector).forEach(picker => picker.value = color);
					app.querySelectorAll(bgSelector).forEach(bg => bg.style.backgroundColor = color);
				};

				updateColorInput('#cv-color-picker-title, #cv-modal-color-picker-title', '#cv-picker-bg-title, #cv-modal-picker-bg-title', state.previewColorTitle);
				updateColorInput('#cv-color-picker-subtitle, #cv-modal-color-picker-subtitle', '#cv-picker-bg-subtitle, #cv-modal-picker-bg-subtitle', state.previewColorSubtitle);
				updateColorInput('#cv-color-picker-body, #cv-modal-color-picker-body', '#cv-picker-bg-body, #cv-modal-picker-bg-body', state.previewColorBody);
				updateColorInput('#cv-cust-color-picker-bullet', '#cv-cust-picker-bullet', state.previewColorBullet);
				updateColorInput('#cv-cust-color-picker-date', '#cv-cust-picker-date', state.previewColorDate);
				updateColorInput('#cv-cust-color-picker-location', '#cv-cust-picker-location', state.previewColorLocation);
				updateColorInput('#cv-cust-color-picker-page-bg', '#cv-cust-picker-page-bg', state.multiPageBackgroundColor);
				updateColorInput('#cv-cust-color-picker-multi-sidebar', '#cv-cust-picker-multi-sidebar', state.multiSidebarColor);
				updateColorInput('#cv-cust-color-picker-sidebar-text', '#cv-cust-picker-sidebar-text', state.sidebarTextColor);
				updateColorInput('#cv-cust-color-picker-icon-color', '#cv-cust-picker-icon-color', state.previewIconColor);
				updateColorInput('#cv-cust-color-picker-level-color', '#cv-cust-picker-level-color', state.levelColor);
				updateColorInput('#cv-cust-color-picker-accent', '#cv-cust-picker-accent', state.previewColorAccent);
				updateColorInput('#cv-cust-color-picker-accent-dark', '#cv-cust-picker-accent-dark', state.previewColorAccentDark);
				updateColorInput('#cv-cust-color-picker-accent-soft', '#cv-cust-picker-accent-soft', state.previewColorAccentSoft);
				updateColorInput('#cv-cust-color-picker-accent-ink', '#cv-cust-picker-accent-ink', state.previewColorAccentInk);
				updateColorInput('#cv-cust-color-picker-accent-muted', '#cv-cust-picker-accent-muted', state.previewColorAccentMuted);
				updateColorInput('#cv-cust-color-picker-left-badge', '#cv-cust-picker-left-badge', state.previewColorLeftBadge);
				updateColorInput('#cv-cust-color-picker-right-badge', '#cv-cust-picker-right-badge', state.previewColorRightBadge);
				updateColorInput('#cv-cust-color-picker-box-bubble', '#cv-cust-picker-box-bubble', state.boxBubbleColor);

				if (resizeModalPreviewFn) {
					resizeModalPreviewFn();
				}

				if (resizeWorkspacePreviewFn) {
					resizeWorkspacePreviewFn();
				}
				renderContentDashboard();
			};

			const schedulePreviewRebuild = () => {
				const rerender = () => {
					renderAll();
					queuePreviewLayoutSync();
				};

				window.requestAnimationFrame(() => {
					window.requestAnimationFrame(rerender);
				});

				[80, 220, 450].forEach((delay) => {
					setTimeout(rerender, delay);
				});
			};

			app.querySelectorAll('[data-scroll-target]').forEach((button) => {
				button.addEventListener('click', () => {
					const selector = button.dataset.scrollTarget;
					const target = selector ? document.querySelector(selector) : null;
					if (target) {
						target.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				});
			});

			app.querySelectorAll('[data-accordion-item]').forEach((item) => {
				item.addEventListener('click', () => {
					app.querySelectorAll('[data-accordion-item]').forEach((candidate) => {
						const isActive = candidate === item;
						candidate.classList.toggle('is-active', isActive);
						const toggle = candidate.querySelector('.cv-step-toggle');
						if (toggle) {
							toggle.textContent = isActive ? '−' : '+';
						}
					});
				});
			});

			app.querySelectorAll('[data-template-choice]').forEach((button) => {
				button.addEventListener('click', () => {
					if (button.hasAttribute('data-template-open')) {
						return;
					}
					state.template = button.dataset.templateChoice || 'classic';
					applyTemplateDefaultPalette(state, state.template);
					if (Array.isArray(state.activeSections)) {
						if (!state.activeSections.includes('languages')) {
							state.activeSections.push('languages');
						}
						if (!state.activeSections.includes('certificates')) {
							state.activeSections.push('certificates');
						}
					}
					save();
					renderAll();
					queuePreviewLayoutSync();
					schedulePreviewRebuild();
				});
			});

			const carousel = app.querySelector('[data-template-carousel]');
			if (carousel) {
				const track = carousel.querySelector('[data-template-track]');
				const dots = Array.from(app.querySelectorAll('[data-template-dot]'));
				const slides = Array.from(carousel.querySelectorAll('.cv-template-slide'));
				const prev = app.querySelector('[data-template-prev]');
				const next = app.querySelector('[data-template-next]');
				let activeIndex = 0;

				const updateCarousel = () => {
					slides.forEach((slide, index) => {
						slide.style.display = index === activeIndex ? 'block' : 'none';
					});
					dots.forEach((dot, index) => {
						dot.classList.toggle('is-active', index === activeIndex);
					});
				};

				if (prev) {
					prev.addEventListener('click', () => {
						activeIndex = (activeIndex - 1 + slides.length) % slides.length;
						updateCarousel();
					});
				}

				if (next) {
					next.addEventListener('click', () => {
						activeIndex = (activeIndex + 1) % slides.length;
						updateCarousel();
					});
				}

				dots.forEach((dot) => {
					dot.addEventListener('click', () => {
						activeIndex = Number(dot.dataset.templateDot || 0);
						updateCarousel();
					});
				});

				updateCarousel();
			}

			fields.forEach((field) => {
				field.addEventListener('input', () => {
					state[field.dataset.field] = field.value;
					renderBindableFields();
					if (field.dataset.field === 'skills') {
						renderSkills();
					}
					if (field.dataset.field === 'certificates') {
						renderCertificates();
					}
					if (field.dataset.field === 'languages') {
						renderLanguages();
					}
					if (field.dataset.field === 'template') {
						renderTemplateClass();
					}
					save();
					schedulePreviewFieldRender();
				});
			});

			// Bind add optional field pills
			app.querySelectorAll('[data-add-pill]').forEach((pill) => {
				pill.addEventListener('click', (e) => {
					e.preventDefault();
					const id = pill.dataset.addPill;
					if (!state.activeFields.includes(id)) {
						state.activeFields.push(id);
					}
					save();
					renderAll();

					// Focus newly added field input
					const inputEl = app.querySelector(`[data-field="${id}"]`);
					if (inputEl) {
						inputEl.focus();
					}
				});
			});

			// Bind remove optional field buttons
			app.querySelectorAll('[data-remove]').forEach((removeBtn) => {
				removeBtn.addEventListener('click', (e) => {
					e.preventDefault();
					const id = removeBtn.dataset.remove;
					state.activeFields = state.activeFields.filter(x => x !== id);
					state[id] = '';
					state['link_' + id] = '';
					save();
					renderAll();
				});
			});

			// Bind link buttons for website and linkedin
			app.querySelectorAll('.cv-input-link-btn').forEach((btn) => {
				const field = btn.dataset.linkField;
				btn.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					const currentLink = state['link_' + field] || '';
					const newLink = prompt(`Enter URL for ${field.charAt(0).toUpperCase() + field.slice(1)}:`, currentLink);
					if (newLink !== null) {
						state['link_' + field] = newLink.trim();
						save();
						renderAll();
					}
				});
			});

			// Bind hide summary checkbox
			const hideSummaryCheckbox = app.querySelector('#cv-hide-summary');
			if (hideSummaryCheckbox) {
				hideSummaryCheckbox.addEventListener('change', () => {
					state.hideSummary = hideSummaryCheckbox.checked;
					renderAll();
					save();
				});
			}

			// Workspace new layout tabs and dashboard bindings
			initWorkspaceTabs();

			// Keep the workspace header in one stable layout while the editor scrolls.
			// Direction-based hiding caused Android WebView to flicker between layouts.
			document.body.classList.remove('cv-editor-chrome-hidden');

			const editContactBtn = app.querySelector('#cv-dash-edit-contact-btn');
			if (editContactBtn) {
				editContactBtn.addEventListener('click', () => {
					openSectionForm('header');
				});
			}

			const addContentBtn = app.querySelector('#cv-dash-add-content-btn');
			const addContentDropdown = app.querySelector('#cv-dash-add-content-dropdown');
			if (addContentBtn) {
				addContentBtn.addEventListener('click', (e) => {
					e.preventDefault();
					if (addContentDropdown) {
						addContentDropdown.classList.add('cv-hidden');
					}
					openAddContentModal();
				});
			}

			const contentModalClose = app.querySelector('#cv-content-modal-close');
			if (contentModalClose) {
				contentModalClose.addEventListener('click', closeAddContentModal);
			}

			app.querySelectorAll('[data-close-content-modal]').forEach((node) => {
				node.addEventListener('click', closeAddContentModal);
			});

			const contentModalImport = app.querySelector('#cv-content-modal-import');
			if (contentModalImport) {
				contentModalImport.addEventListener('click', () => {
					closeAddContentModal();
					const aiTabBtn = app.querySelector('[data-workspace-tab="ai"]');
					if (aiTabBtn) {
						aiTabBtn.click();
					}
				});
			}

			app.querySelectorAll('[data-add-section]').forEach((btn) => {
				btn.addEventListener('click', () => {
					openSectionForm(btn.dataset.addSection);
				});
			});

			const workspaceDownloadBtn = app.querySelector('#cv-workspace-download-btn');
			if (workspaceDownloadBtn) {
				workspaceDownloadBtn.addEventListener('click', (e) => {
					e.preventDefault();
					if (window.parent && window.parent !== window) {
						window.parent.postMessage({ type: 'medbiomate-cv-download' }, '*');
					} else {
						preparePrintClone();
						window.print();
					}
				});
			}

			// Header navigation actions
			const headerNext = app.querySelector('#cv-header-next-btn');
			if (headerNext) {
				headerNext.addEventListener('click', (e) => {
					e.preventDefault();
					if (document.activeElement instanceof HTMLElement) {
						document.activeElement.blur();
					}
					save();
					renderAll();
					showContentDashboard();
				});
			}
			const headerBack = app.querySelector('#cv-header-back-btn');
			if (headerBack) {
				headerBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Experience list navigation actions
			const expListBack = app.querySelector('#cv-exp-list-back-btn');
			if (expListBack) {
				expListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const expListContinue = app.querySelector('#cv-exp-list-continue-btn');
			if (expListContinue) {
				expListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Experience edit navigation actions
			const expAddMore = app.querySelector('#cv-exp-add-more-btn');
			if (expAddMore) {
				expAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openExperienceEdit(-1);
				});
			}
			const expEditBack = app.querySelector('#cv-exp-edit-back-btn');
			if (expEditBack) {
				expEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (state.experience.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-exp-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-exp-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const expEditSave = app.querySelector('#cv-exp-edit-save-btn');
			if (expEditSave) {
				expEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveExperienceEntry();
				});
			}

			// Current position toggle date disabler
			const expCurrentCheck = app.querySelector('#cv-exp-current');
			if (expCurrentCheck) {
				expCurrentCheck.addEventListener('change', () => {
					const endMonthSel = app.querySelector('#cv-exp-end-month');
					const endYearSel = app.querySelector('#cv-exp-end-year');
					const endContainer = app.querySelector('#cv-exp-end-date-container');
					if (expCurrentCheck.checked) {
						endMonthSel.disabled = true;
						endYearSel.disabled = true;
						endMonthSel.value = '';
						endYearSel.value = '';
						if (endContainer) endContainer.style.opacity = '0.5';
					} else {
						endMonthSel.disabled = false;
						endYearSel.disabled = false;
						if (endContainer) endContainer.style.opacity = '1';
					}
				});
			}

			// Education list navigation actions
			const eduListBack = app.querySelector('#cv-edu-list-back-btn');
			if (eduListBack) {
				eduListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const eduListContinue = app.querySelector('#cv-edu-list-continue-btn');
			if (eduListContinue) {
				eduListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Education edit navigation actions
			const eduAddMore = app.querySelector('#cv-edu-add-more-btn');
			if (eduAddMore) {
				eduAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openEducationEdit(-1);
				});
			}
			const eduEditBack = app.querySelector('#cv-edu-edit-back-btn');
			if (eduEditBack) {
				eduEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (state.education.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-edu-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-edu-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const eduEditSave = app.querySelector('#cv-edu-edit-save-btn');
			if (eduEditSave) {
				eduEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveEducationEntry();
				});
			}

			// Current study toggle date disabler
			const eduCurrentCheck = app.querySelector('#cv-edu-current');
			if (eduCurrentCheck) {
				eduCurrentCheck.addEventListener('change', () => {
					const endMonthSel = app.querySelector('#cv-edu-end-month');
					const endYearSel = app.querySelector('#cv-edu-end-year');
					const endContainer = app.querySelector('#cv-edu-end-date-container');
					if (eduCurrentCheck.checked) {
						endMonthSel.disabled = true;
						endYearSel.disabled = true;
						endMonthSel.value = '';
						endYearSel.value = '';
						if (endContainer) endContainer.style.opacity = '0.5';
					} else {
						endMonthSel.disabled = false;
						endYearSel.disabled = false;
						if (endContainer) endContainer.style.opacity = '1';
					}
				});
			}

			// Courses list navigation actions
			const coursesListBack = app.querySelector('#cv-courses-list-back-btn');
			if (coursesListBack) {
				coursesListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const coursesListContinue = app.querySelector('#cv-courses-list-continue-btn');
			if (coursesListContinue) {
				coursesListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Courses edit navigation actions
			const coursesAddMore = app.querySelector('#cv-courses-add-more-btn');
			if (coursesAddMore) {
				coursesAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openCoursesEdit(-1);
				});
			}
			const coursesEditBack = app.querySelector('#cv-courses-edit-back-btn');
			if (coursesEditBack) {
				coursesEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!state.courses || state.courses.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-courses-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-courses-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const coursesEditSave = app.querySelector('#cv-courses-edit-save-btn');
			if (coursesEditSave) {
				coursesEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveCoursesEntry();
				});
			}

			// Awards list navigation actions
			const awardsListBack = app.querySelector('#cv-awards-list-back-btn');
			if (awardsListBack) {
				awardsListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const awardsListContinue = app.querySelector('#cv-awards-list-continue-btn');
			if (awardsListContinue) {
				awardsListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Awards edit navigation actions
			const awardsAddMore = app.querySelector('#cv-awards-add-more-btn');
			if (awardsAddMore) {
				awardsAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openAwardsEdit(-1);
				});
			}
			const awardsEditBack = app.querySelector('#cv-awards-edit-back-btn');
			if (awardsEditBack) {
				awardsEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!state.awards || state.awards.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-awards-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-awards-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const awardsEditSave = app.querySelector('#cv-awards-edit-save-btn');
			if (awardsEditSave) {
				awardsEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveAwardsEntry();
				});
			}

			// Publications list navigation actions
			const publicationsListBack = app.querySelector('#cv-publications-list-back-btn');
			if (publicationsListBack) {
				publicationsListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const publicationsListContinue = app.querySelector('#cv-publications-list-continue-btn');
			if (publicationsListContinue) {
				publicationsListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Publications edit navigation actions
			const publicationsAddMore = app.querySelector('#cv-publications-add-more-btn');
			if (publicationsAddMore) {
				publicationsAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openPublicationsEdit(-1);
				});
			}
			const publicationsEditBack = app.querySelector('#cv-publications-edit-back-btn');
			if (publicationsEditBack) {
				publicationsEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!state.publications || state.publications.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-publications-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-publications-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const publicationsEditSave = app.querySelector('#cv-publications-edit-save-btn');
			if (publicationsEditSave) {
				publicationsEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					savePublicationsEntry();
				});
			}

			// References list navigation actions
			const referencesListBack = app.querySelector('#cv-references-list-back-btn');
			if (referencesListBack) {
				referencesListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const referencesListContinue = app.querySelector('#cv-references-list-continue-btn');
			if (referencesListContinue) {
				referencesListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// References edit navigation actions
			const referencesAddMore = app.querySelector('#cv-references-add-more-btn');
			if (referencesAddMore) {
				referencesAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openReferencesEdit(-1);
				});
			}
			const referencesEditBack = app.querySelector('#cv-references-edit-back-btn');
			if (referencesEditBack) {
				referencesEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!state.references || state.references.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-references-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-references-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const referencesEditSave = app.querySelector('#cv-references-edit-save-btn');
			if (referencesEditSave) {
				referencesEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveReferencesEntry();
				});
			}

			// Declaration edit navigation actions
			const declarationEditBack = app.querySelector('#cv-declaration-edit-back-btn');
			if (declarationEditBack) {
				declarationEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const declarationEditSave = app.querySelector('#cv-declaration-edit-save-btn');
			if (declarationEditSave) {
				declarationEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveDeclarationEntry();
				});
			}
			const declarationSigTrigger = app.querySelector('#cv-declaration-sig-trigger');
			if (declarationSigTrigger) {
				declarationSigTrigger.addEventListener('click', (e) => {
					e.preventDefault();
					openSignatureModal();
				});
			}
			const declarationSigRemove = app.querySelector('#cv-declaration-sig-remove');
			if (declarationSigRemove) {
				declarationSigRemove.addEventListener('click', (e) => {
					e.preventDefault();
					removeDeclarationSignature();
				});
			}

			// Signature Modal buttons
			const sigModalClose = app.querySelector('#cv-signature-modal-close-btn');
			if (sigModalClose) {
				sigModalClose.addEventListener('click', (e) => {
					e.preventDefault();
					closeSignatureModal();
				});
			}
			const sigCanvasClear = app.querySelector('#cv-signature-canvas-clear');
			if (sigCanvasClear) {
				sigCanvasClear.addEventListener('click', (e) => {
					e.preventDefault();
					clearSignatureCanvas();
				});
			}
			const sigCanvasSave = app.querySelector('#cv-signature-canvas-save');
			if (sigCanvasSave) {
				sigCanvasSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveSignatureCanvas();
				});
			}

			// Signature upload initialization
			initSignatureUpload();
			initSignatureTabs();

			// Skills list navigation actions
			const skillsListBack = app.querySelector('#cv-skills-list-back-btn');
			if (skillsListBack) {
				skillsListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const skillsListContinue = app.querySelector('#cv-skills-list-continue-btn');
			if (skillsListContinue) {
				skillsListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Skills edit navigation actions
			const skillsAddMore = app.querySelector('#cv-skills-add-more-btn');
			if (skillsAddMore) {
				skillsAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openSkillsEdit(-1);
				});
			}
			const skillsEditBack = app.querySelector('#cv-skills-edit-back-btn');
			if (skillsEditBack) {
				skillsEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!Array.isArray(state.skills) || state.skills.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-skills-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-skills-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const skillsEditSave = app.querySelector('#cv-skills-edit-save-btn');
			if (skillsEditSave) {
				skillsEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveSkillsEntry();
				});
			}

			// Languages list navigation actions
			const langListBack = app.querySelector('#cv-lang-list-back-btn');
			if (langListBack) {
				langListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const langListContinue = app.querySelector('#cv-lang-list-continue-btn');
			if (langListContinue) {
				langListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Languages edit navigation actions
			const langAddMore = app.querySelector('#cv-lang-add-more-btn');
			if (langAddMore) {
				langAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openLanguagesEdit(-1);
				});
			}
			const langEditBack = app.querySelector('#cv-lang-edit-back-btn');
			if (langEditBack) {
				langEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!Array.isArray(state.languages) || state.languages.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-lang-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-lang-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const langEditSave = app.querySelector('#cv-lang-edit-save-btn');
			if (langEditSave) {
				langEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveLanguagesEntry();
				});
			}

			// Certificates list navigation actions
			const certListBack = app.querySelector('#cv-cert-list-back-btn');
			if (certListBack) {
				certListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const certListContinue = app.querySelector('#cv-cert-list-continue-btn');
			if (certListContinue) {
				certListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Certificates edit navigation actions
			const certAddMore = app.querySelector('#cv-cert-add-more-btn');
			if (certAddMore) {
				certAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openCertificatesEdit(-1);
				});
			}
			const certEditBack = app.querySelector('#cv-cert-edit-back-btn');
			if (certEditBack) {
				certEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!Array.isArray(state.certificates) || state.certificates.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-cert-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-cert-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const certEditSave = app.querySelector('#cv-cert-edit-save-btn');
			if (certEditSave) {
				certEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveCertificatesEntry();
				});
			}

			// Interests list navigation actions
			const interestsListBack = app.querySelector('#cv-interests-list-back-btn');
			if (interestsListBack) {
				interestsListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const interestsListContinue = app.querySelector('#cv-interests-list-continue-btn');
			if (interestsListContinue) {
				interestsListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Interests edit navigation actions
			const interestsAddMore = app.querySelector('#cv-interests-add-more-btn');
			if (interestsAddMore) {
				interestsAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openInterestsEdit(-1);
				});
			}
			const interestsEditBack = app.querySelector('#cv-interests-edit-back-btn');
			if (interestsEditBack) {
				interestsEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!Array.isArray(state.interests) || state.interests.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-interests-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-interests-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const interestsEditSave = app.querySelector('#cv-interests-edit-save-btn');
			if (interestsEditSave) {
				interestsEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveInterestsEntry();
				});
			}

			const interestsTipsBtn = app.querySelector('#cv-interests-tips-btn');
			if (interestsTipsBtn) {
				interestsTipsBtn.addEventListener('click', (e) => {
					e.preventDefault();
					alert("Tips for Interests:\n• Include interests that demonstrate relevant transferable skills (e.g., leadership, teamwork, creativity).\n• Keep it professional and concise.");
				});
			}

			// Projects list navigation actions
			const projectsListBack = app.querySelector('#cv-projects-list-back-btn');
			if (projectsListBack) {
				projectsListBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const projectsListContinue = app.querySelector('#cv-projects-list-continue-btn');
			if (projectsListContinue) {
				projectsListContinue.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Projects edit navigation actions
			const projectsAddMore = app.querySelector('#cv-projects-add-more-btn');
			if (projectsAddMore) {
				projectsAddMore.addEventListener('click', (e) => {
					e.preventDefault();
					openProjectsEdit(-1);
				});
			}
			const projectsEditBack = app.querySelector('#cv-projects-edit-back-btn');
			if (projectsEditBack) {
				projectsEditBack.addEventListener('click', (e) => {
					e.preventDefault();
					if (!Array.isArray(state.projects) || state.projects.length === 0) {
						showContentDashboard();
					} else {
						app.querySelector('#cv-projects-edit-view').classList.add('cv-hidden');
						app.querySelector('#cv-projects-list-view').classList.remove('cv-hidden');
					}
				});
			}
			const projectsEditSave = app.querySelector('#cv-projects-edit-save-btn');
			if (projectsEditSave) {
				projectsEditSave.addEventListener('click', (e) => {
					e.preventDefault();
					saveProjectsEntry();
				});
			}

			const projectsTipsBtn = app.querySelector('#cv-projects-tips-btn');
			if (projectsTipsBtn) {
				projectsTipsBtn.addEventListener('click', (e) => {
					e.preventDefault();
					alert("Tips for Projects:\n• Highlight technical or leadership projects that showcase relevant experience.\n• Clearly state the technologies used, your role, and the project outcome.");
				});
			}

			// Summary navigation actions
			const summaryBack = app.querySelector('#cv-summary-back-btn');
			if (summaryBack) {
				summaryBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const summaryNext = app.querySelector('#cv-summary-next-btn');
			if (summaryNext) {
				summaryNext.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}

			// Formatting section navigation actions
			app.querySelector('#cv-save-template-style')?.addEventListener('click', () => {
				save();
				app.querySelector('#cv-style-save-status').textContent = 'Changes saved on this device.';
			});
			app.querySelector('#cv-restore-template-style')?.addEventListener('click', () => {
				Object.keys(state).filter(isStyleKey).forEach(key => { delete state[key]; });
				Object.assign(state, originalStyle(state.template));
				save();
				renderAll();
				app.querySelector('#cv-style-save-status').textContent = 'Original template formatting restored. Your CV content is kept.';
			});
			const formattingBack = app.querySelector('#cv-formatting-back-btn');
			if (formattingBack) {
				formattingBack.addEventListener('click', (e) => {
					e.preventDefault();
					const contentTab = app.querySelector('[data-workspace-tab="content"]');
					if (contentTab) contentTab.click();
				});
			}
			const formattingNext = app.querySelector('#cv-formatting-next-btn');
			if (formattingNext) {
				formattingNext.addEventListener('click', (e) => {
					e.preventDefault();
					const contentTab = app.querySelector('[data-workspace-tab="content"]');
					if (contentTab) contentTab.click();
				});
			}

			// Other sections navigation actions
			const otherBack = app.querySelector('#cv-other-back-btn');
			if (otherBack) {
				otherBack.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const otherNext = app.querySelector('#cv-other-next-btn');
			if (otherNext) {
				otherNext.addEventListener('click', (e) => {
					e.preventDefault();
					showContentDashboard();
				});
			}
			const otherPrint = app.querySelector('#cv-other-print-btn');
			if (otherPrint) {
				otherPrint.addEventListener('click', (e) => {
					e.preventDefault();
					preparePrintClone();
					window.print();
				});
			}
			const otherReset = app.querySelector('#cv-other-reset-btn');
			if (otherReset) {
				otherReset.addEventListener('click', (e) => {
					e.preventDefault();
					Object.keys(state).forEach((key) => delete state[key]);
					Object.assign(state, JSON.parse(JSON.stringify(defaultState)));
					save();
					renderAll();
					showContentDashboard();
				});
			}

			// Change template trigger
			const changeTemplateLink = app.querySelector('#cv-preview-change-template');
			if (changeTemplateLink) {
				changeTemplateLink.addEventListener('click', (e) => {
					e.preventDefault();
					const overviewTab = app.querySelector('[data-workspace-tab="overview"]');
					if (overviewTab) overviewTab.click();
				});
			}

			// Save CV trigger
			const saveCVButton = app.querySelector('#cv-preview-save-cv');
			if (saveCVButton) {
				saveCVButton.addEventListener('click', (e) => {
					e.preventDefault();
					preparePrintClone();
					window.print();
				});
			}



			// Onboarding navigation and flow
			const landingSection = app.querySelector('.cv-landing-section');
			const choiceSection = app.querySelector('.cv-onboarding-choice');
			const upgradeSection = app.querySelector('.cv-onboarding-upgrade');
			const workspaceSection = app.querySelector('.cv-builder-workspace');
			const aiLoader = app.querySelector('.cv-ai-loader-overlay');

			// Guided steps sections
			const stepExp = app.querySelector('.cv-step-experience');
			const stepCompany = app.querySelector('.cv-step-company');
			const stepGoals = app.querySelector('.cv-step-goals');
			const stepIndustries = app.querySelector('.cv-step-industries');
			const stepTemplates = app.querySelector('.cv-step-templates');

			const showSection = (sectionToShow) => {
				[
					landingSection, choiceSection, upgradeSection, workspaceSection,
					stepExp, stepCompany, stepGoals, stepIndustries, stepTemplates
				].forEach((section) => {
					if (section) {
						section.classList.add('cv-hidden');
					}
				});
				if (sectionToShow) {
					sectionToShow.classList.remove('cv-hidden');
					if (sectionToShow === stepTemplates) {
						queueTemplateCardPreviewFit();
					}
					queuePreviewLayoutSync();
					schedulePreviewRebuild();
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}
			};

			// "Create your CV" triggers
			app.querySelectorAll('[data-scroll-target="#cv-builder-workspace"]').forEach((btn) => {
				btn.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					window.location.hash = 'onboarding/choice';
				});
			});

			// Choice screen interaction
			const choiceCards = app.querySelectorAll('.cv-choice-card');
			let selectedChoice = null;

			const updateChoiceUI = () => {
				choiceCards.forEach((card) => {
					const isSelected = card.dataset.choice === selectedChoice;
					card.classList.toggle('is-selected', isSelected);
				});
			};

			choiceCards.forEach((card) => {
				card.addEventListener('click', () => {
					selectedChoice = card.dataset.choice;
					updateChoiceUI();
				});
			});

			// Start without a selection so the user makes an explicit choice.
			updateChoiceUI();

			// Choice Screen Buttons
			const choiceBackBtn = app.querySelector('.cv-onboarding-choice .cv-btn-back');
			if (choiceBackBtn) {
				choiceBackBtn.addEventListener('click', () => {
					window.location.hash = 'landing';
				});
			}

			const choiceContinueBtn = app.querySelector('.cv-onboarding-choice .cv-btn-continue');
			if (choiceContinueBtn) {
				choiceContinueBtn.addEventListener('click', () => {
					if (selectedChoice === 'create-new') {
						window.location.hash = 'onboarding/templates';
					} else {
						window.location.hash = 'onboarding/upgrade';
					}
				});
			}

			// Step 1: Experience Level Interaction
			const expCards = app.querySelectorAll('.cv-exp-card');
			let selectedExp = null;

			const updateExpUI = () => {
				expCards.forEach((card) => {
					const isSelected = card.dataset.exp === selectedExp;
					card.classList.toggle('is-selected', isSelected);
				});
			};

			expCards.forEach((card) => {
				card.addEventListener('click', () => {
					selectedExp = card.dataset.exp;
					updateExpUI();
				});
			});
			updateExpUI();

			const expBackBtn = app.querySelector('.cv-step-experience .cv-btn-back');
			if (expBackBtn) {
				expBackBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/choice';
				});
			}

			const expContinueBtn = app.querySelector('.cv-step-experience .cv-btn-continue');
			if (expContinueBtn) {
				expContinueBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/company';
				});
			}

			// Step 2: Target Companies Interaction
			const companyCards = app.querySelectorAll('.cv-company-card');
			let selectedCompany = null;

			const updateCompanyUI = () => {
				companyCards.forEach((card) => {
					const isSelected = card.dataset.company === selectedCompany;
					card.classList.toggle('is-selected', isSelected);
				});
			};

			companyCards.forEach((card) => {
				card.addEventListener('click', () => {
					selectedCompany = card.dataset.company;
					updateCompanyUI();
				});
			});
			updateCompanyUI();

			const companyBackBtn = app.querySelector('.cv-step-company .cv-btn-back');
			if (companyBackBtn) {
				companyBackBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/experience';
				});
			}

			const companyContinueBtn = app.querySelector('.cv-step-company .cv-btn-continue');
			if (companyContinueBtn) {
				companyContinueBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/goals';
				});
			}

			// Step 3: Goals Screen (Multi-select)
			const goalCards = app.querySelectorAll('.cv-goal-card');
			goalCards.forEach((card) => {
				card.addEventListener('click', () => {
					card.classList.toggle('is-selected');
				});
			});

			const goalsBackBtn = app.querySelector('.cv-step-goals .cv-btn-back');
			if (goalsBackBtn) {
				goalsBackBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/company';
				});
			}

			const goalsNextBtn = app.querySelector('.cv-step-goals .cv-btn-continue');
			if (goalsNextBtn) {
				goalsNextBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/choice';
				});
			}

			// Step 4: Industries Screen (Multi-select)
			const industryPills = app.querySelectorAll('.cv-industry-pill');
			industryPills.forEach((pill) => {
				pill.addEventListener('click', () => {
					pill.classList.toggle('is-selected');

					const span = pill.querySelector('span');
					if (span) {
						if (pill.classList.contains('is-selected')) {
							span.textContent = ' ✓';
						} else {
							span.textContent = ' +';
						}
					}
				});
			});

			const industriesBackBtn = app.querySelector('.cv-step-industries .cv-btn-back');
			if (industriesBackBtn) {
				industriesBackBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/goals';
				});
			}

			const industriesContinueBtn = app.querySelector('.cv-step-industries .cv-btn-continue');
			if (industriesContinueBtn) {
				industriesContinueBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/templates';
				});
			}

			const industriesSkipBtn = app.querySelector('.cv-step-industries .cv-btn-skip-link');
			if (industriesSkipBtn) {
				industriesSkipBtn.addEventListener('click', (e) => {
					e.preventDefault();
					window.location.hash = 'onboarding/templates';
				});
			}

			// Step 5: Choose Template Screen Interaction
			const tabButtons = app.querySelectorAll('.cv-tab');
			tabButtons.forEach((tab) => {
				tab.addEventListener('click', () => {
					tabButtons.forEach((btn) => btn.classList.remove('is-active'));
					tab.classList.add('is-active');
				});
			});

			const colorDots = app.querySelectorAll('.cv-color-dot');
			const previewThemeClasses = [
				'cv-theme-darkgray', 'cv-theme-beige', 'cv-theme-darkblue',
				'cv-theme-lightblue', 'cv-theme-medbiomate', 'cv-theme-cyan',
				'cv-theme-green', 'cv-theme-orange', 'cv-theme-pink'
			];
			const applyPreviewTheme = (previewNode, colorName) => {
				if (!previewNode) return;
				previewNode.classList.remove(...previewThemeClasses);
				if (colorName && colorName !== 'default') {
					previewNode.classList.add(`cv-theme-${colorName}`);
				}
			};

			colorDots.forEach((dot) => {
				dot.addEventListener('click', () => {
					colorDots.forEach((d) => d.classList.remove('is-active'));
					dot.classList.add('is-active');

					const chosenColor = dot.dataset.color;
					app.querySelectorAll('.cv-template-select-card .cv-preview').forEach((previewNode) => {
						applyPreviewTheme(previewNode, chosenColor);
					});
				});
			});

			// Template details modal setup

			const modalOverlay = app.querySelector('#cv-template-modal');
			const modalTitle = app.querySelector('#cv-modal-title');
			const modalDescLayout = app.querySelector('#cv-modal-desc-layout');
			const modalIndex = app.querySelector('#cv-modal-current-index');
			const modalPreviewContainer = app.querySelector('#cv-modal-preview-container');
			const modalCloseBtn = app.querySelector('#cv-modal-close-btn');
			const modalPrevBtn = app.querySelector('#cv-modal-prev-btn');
			const modalNextBtn = app.querySelector('#cv-modal-next-btn');
			const modalUseBtn = app.querySelector('#cv-modal-use-btn');
			const modalColorDots = app.querySelectorAll('.cv-modal-color-dot');

			const selectTemplateCards = app.querySelectorAll('.cv-template-select-card');
			let currentModalIndex = 0;
			const fitTemplateCardPreviews = () => {
				selectTemplateCards.forEach((card) => {
					const previewShell = card.querySelector('.cv-template-preview');
					const preview = card.querySelector('.cv-preview');
					if (!previewShell || !preview) return;

					const naturalWidth = 800;
					const naturalHeight = PAGE_HEIGHT;
					const styles = window.getComputedStyle(previewShell);
					const availableWidth = previewShell.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
					const availableHeight = previewShell.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
					if (availableWidth <= 0 || availableHeight <= 0) return;
					const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight) * 1.04;

					preview.style.setProperty('--cv-template-card-preview-scale', String(scale));
				});
			};

			const queueTemplateCardPreviewFit = () => {
				window.requestAnimationFrame(() => {
					window.requestAnimationFrame(() => {
						fitTemplateCardPreviews();
					});
				});
			};

			const fitModalPreview = () => {
				if (!modalPreviewContainer || modalOverlay?.classList.contains('cv-hidden')) return;

				const preview = modalPreviewContainer.querySelector('.cv-preview');
				if (!preview) return;

				const naturalWidth = 800;
				const naturalHeight = PAGE_HEIGHT;
				const styles = window.getComputedStyle(modalPreviewContainer);
				const availableWidth = modalPreviewContainer.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
				const availableHeight = modalPreviewContainer.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
				const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);

				preview.style.setProperty('--cv-modal-preview-scale', String(scale));
			};

			const updateTemplateSelection = (templateId) => {
				selectTemplateCards.forEach((card) => {
					card.classList.toggle('is-selected', card.dataset.templateChoice === templateId);
				});
			};

			updateTemplateSelection('classic');
			queueTemplateCardPreviewFit();

			const openTemplateModal = (index) => {
				currentModalIndex = index;
				const selectedCard = selectTemplateCards[index];
				if (!selectedCard) return;

				const templateId = selectedCard.dataset.templateChoice;
				const template = templatesList.find((t) => t.id === templateId);
				if (!template) return;

				if (modalTitle) modalTitle.textContent = template.name;
				if (modalDescLayout) modalDescLayout.textContent = template.layoutDesc;
				if (modalIndex) modalIndex.textContent = index + 1;

				// Clone preview structure from selected card
				if (modalPreviewContainer) {
					modalPreviewContainer.innerHTML = '';
					const previewElement = selectedCard.querySelector('.cv-preview');
					if (previewElement) {
						const clone = previewElement.cloneNode(true);
						modalPreviewContainer.appendChild(clone);

						// Apply current active onboarding color to the clone
						const activeOnboardingDot = app.querySelector('.cv-color-dot.is-active');
						const onboardingColor = activeOnboardingDot ? activeOnboardingDot.dataset.color : 'default';
						applyPreviewTheme(clone, onboardingColor);
					}
				}

				// Inherit active onboarding color dot state
				const activeOnboardingDot = app.querySelector('.cv-color-dot.is-active');
				const onboardingColor = activeOnboardingDot ? activeOnboardingDot.dataset.color : 'default';
				modalColorDots.forEach((dot) => {
					dot.classList.toggle('is-active', dot.dataset.color === onboardingColor);
				});

				if (modalOverlay) {
					modalOverlay.classList.remove('cv-hidden');
				}

				window.requestAnimationFrame(() => {
					fitModalPreview();
					window.requestAnimationFrame(fitModalPreview);
				});
			};

			const closeModal = () => {
				if (modalOverlay) {
					modalOverlay.classList.add('cv-hidden');
				}
			};

			const moveTemplateModal = (direction) => {
				if (!selectTemplateCards.length) return;
				const nextIndex = (currentModalIndex + direction + selectTemplateCards.length) % selectTemplateCards.length;
				openTemplateModal(nextIndex);
			};

			// Mobile users browse templates by swiping the document itself.
			if (modalPreviewContainer) {
				let swipeStartX = 0;
				let swipeStartY = 0;
				modalPreviewContainer.addEventListener('touchstart', (event) => {
					const touch = event.changedTouches[0];
					if (!touch) return;
					swipeStartX = touch.clientX;
					swipeStartY = touch.clientY;
				}, { passive: true });
				modalPreviewContainer.addEventListener('touchend', (event) => {
					const touch = event.changedTouches[0];
					if (!touch) return;
					const deltaX = touch.clientX - swipeStartX;
					const deltaY = touch.clientY - swipeStartY;
					if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
					moveTemplateModal(deltaX < 0 ? 1 : -1);
				}, { passive: true });
			}

			window.addEventListener('resize', fitModalPreview);
			window.addEventListener('resize', queueTemplateCardPreviewFit);

			// Clicking a template in the onboarding steps opens the modal
			selectTemplateCards.forEach((card, idx) => {
				card.addEventListener('click', () => {
					updateTemplateSelection(card.dataset.templateChoice);
					openTemplateModal(idx);
				});
			});

			app.querySelectorAll('[data-template-open]').forEach((button) => {
				button.addEventListener('click', (event) => {
					event.preventDefault();
					event.stopPropagation();
					const templateId = button.dataset.templateChoice;
					const cardIndex = Array.from(selectTemplateCards).findIndex((card) => card.dataset.templateChoice === templateId);
					if (cardIndex >= 0) {
						openTemplateModal(cardIndex);
					}
				});
			});

			if (modalPrevBtn) {
				modalPrevBtn.addEventListener('click', () => {
					moveTemplateModal(-1);
				});
			}

			if (modalNextBtn) {
				modalNextBtn.addEventListener('click', () => {
					moveTemplateModal(1);
				});
			}

			if (modalCloseBtn) {
				modalCloseBtn.addEventListener('click', closeModal);
			}

			if (modalOverlay) {
				modalOverlay.addEventListener('click', (e) => {
					if (e.target === modalOverlay) {
						closeModal();
					}
				});
			}

			// Color dots selection inside modal preview
			modalColorDots.forEach((dot) => {
				dot.addEventListener('click', () => {
					modalColorDots.forEach((d) => d.classList.remove('is-active'));
					dot.classList.add('is-active');

					const modalPreview = modalPreviewContainer.querySelector('.cv-preview');
					if (modalPreview) {
						const chosenColor = dot.dataset.color;
						applyPreviewTheme(modalPreview, chosenColor);
					}
				});
			});

			// Use template button inside modal logic
			if (modalUseBtn) {
				modalUseBtn.addEventListener('click', () => {
					try {
						let selectedTemplate = 'classic';
						if (selectTemplateCards && selectTemplateCards[currentModalIndex]) {
							selectedTemplate = selectTemplateCards[currentModalIndex].dataset.templateChoice;
						} else {
							const modalPreview = modalPreviewContainer ? modalPreviewContainer.querySelector('.cv-preview') : null;
							if (modalPreview) {
								selectedTemplate = modalPreview.dataset.previewTemplate || 'classic';
							}
						}

						// Prefill customized state based on experience level
						let prefillState = {};

						if (selectedExp === 'student') {
							prefillState = {
								fullName: 'George Emmanuel',
								jobTitle: 'Project Manager',
								email: 'george.emmanuel@email.com',
								phone: '+44 7911 123456',
								location: 'London, United Kingdom',
								website: 'linkedin.com/in/george-emmanuel',
								summary: 'Project Manager with 6+ years of experience leading cross-functional teams, managing budgets, and executing high-impact international projects. Strong background in stakeholder alignment, resource scheduling, risk management, and vendor negotiations. Proven track record of delivering projects on time and within scope while adhering to global standards and best practices.',
								skills: [
									{ name: 'Project Management', details: '', level: 'Expert' },
									{ name: 'Agile Methodologies', details: '', level: 'Expert' },
									{ name: 'Stakeholder Engagement', details: '', level: 'Expert' },
									{ name: 'Resource Allocation', details: '', level: 'Expert' },
									{ name: 'Risk Management', details: '', level: 'Expert' },
									{ name: 'Budget Tracking', details: '', level: 'Expert' }
								],
								experience: [
									{
										role: 'Senior Project Manager',
										company: 'Deloitte UK',
										startDate: '01/2022',
										endDate: 'Present',
										city: 'London',
										country: 'United Kingdom',
										details: 'Led delivery of enterprise digital transformation initiatives across EMEA.\nCoordinated resource allocation and budget management for a £2M portfolio.\nManaged client communications and secured steering committee approvals.'
									},
									{
										role: 'Project Associate',
										company: 'Unilever',
										startDate: '07/2019',
										endDate: '12/2021',
										city: 'London',
										country: 'United Kingdom',
										details: 'Supported cross-functional product development pipelines for global markets.\nMaintained milestone tracking and project documentation under Prince2 framework.\nResolved supply chain coordination issues to reduce shipping delays.'
									}
								],
								education: [
									{
										degree: 'M.Sc. in Project Management',
										school: 'University of Manchester',
										startDate: '2016',
										endDate: '2017',
										city: 'Manchester',
										country: 'United Kingdom',
										details: 'Specialized in Agile Project Delivery and Risk Mitigation frameworks.\nGraduated with Distinction.'
									}
								],
								certificates: [
									{ name: 'Lean Six Sigma Green Belt', link: '', details: '' },
									{ name: 'Certified Supply Chain Professional (CSCP)', link: '', details: '' }
								],
								languages: [
									{ name: 'English', details: '', level: 'Native/Bilingual' },
									{ name: 'Spanish', details: '', level: 'Fluent' },
									{ name: 'French', details: '', level: 'Conversational' }
								],
								interests: [],
								projects: [],
								photo: getPluginAssetUrl('george-avatar.png'),
								previewFontSizeBase: 8.5,
								previewFontSizeName: 10,
								previewFontSizeTitle: 4,
								previewFontSizeHeading: 2,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 110,
								previewElementSpace: 8,
								previewSideMargin: 18,
								previewVerticalMargin: 10
							};
						} else if (selectedExp === 'fresher') {
							prefillState = {
								fullName: 'George Emmanuel',
								jobTitle: 'Project Manager',
								email: 'george.emmanuel@email.com',
								phone: '+44 7911 123456',
								location: 'London, United Kingdom',
								website: 'linkedin.com/in/george-emmanuel',
								summary: 'Project Manager with 6+ years of experience leading cross-functional teams, managing budgets, and executing high-impact international projects. Strong background in stakeholder alignment, resource scheduling, risk management, and vendor negotiations. Proven track record of delivering projects on time and within scope while adhering to global standards and best practices.',
								skills: [
									{ name: 'Project Management', details: '', level: 'Expert' },
									{ name: 'Agile Methodologies', details: '', level: 'Expert' },
									{ name: 'Stakeholder Engagement', details: '', level: 'Expert' },
									{ name: 'Resource Allocation', details: '', level: 'Expert' },
									{ name: 'Risk Management', details: '', level: 'Expert' },
									{ name: 'Budget Tracking', details: '', level: 'Expert' }
								],
								experience: [
									{
										role: 'Senior Project Manager',
										company: 'Deloitte UK',
										startDate: '01/2022',
										endDate: 'Present',
										city: 'London',
										country: 'United Kingdom',
										details: 'Led delivery of enterprise digital transformation initiatives across EMEA.\nCoordinated resource allocation and budget management for a £2M portfolio.\nManaged client communications and secured steering committee approvals.'
									},
									{
										role: 'Project Associate',
										company: 'Unilever',
										startDate: '07/2019',
										endDate: '12/2021',
										city: 'London',
										country: 'United Kingdom',
										details: 'Supported cross-functional product development pipelines for global markets.\nMaintained milestone tracking and project documentation under Prince2 framework.\nResolved supply chain coordination issues to reduce shipping delays.'
									}
								],
								education: [
									{
										degree: 'M.Sc. in Project Management',
										school: 'University of Manchester',
										startDate: '2016',
										endDate: '2017',
										city: 'Manchester',
										country: 'United Kingdom',
										details: 'Specialized in Agile Project Delivery and Risk Mitigation frameworks.\nGraduated with Distinction.'
									}
								],
								certificates: [
									{ name: 'Lean Six Sigma Green Belt', link: '', details: '' },
									{ name: 'Certified Supply Chain Professional (CSCP)', link: '', details: '' }
								],
								languages: [
									{ name: 'English', details: '', level: 'Native/Bilingual' },
									{ name: 'Spanish', details: '', level: 'Fluent' },
									{ name: 'French', details: '', level: 'Conversational' }
								],
								interests: [],
								projects: [],
								photo: getPluginAssetUrl('george-avatar.png'),
								previewFontSizeBase: 8.5,
								previewFontSizeName: 10,
								previewFontSizeTitle: 4,
								previewFontSizeHeading: 2,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 110,
								previewElementSpace: 8,
								previewSideMargin: 18,
								previewVerticalMargin: 10
							};
						} else { // experienced
							prefillState = {
								fullName: 'George Emmanuel',
								jobTitle: 'Project Manager',
								email: 'george.emmanuel@email.com',
								phone: '+44 7911 123456',
								location: 'London, United Kingdom',
								website: 'linkedin.com/in/george-emmanuel',
								summary: 'Project Manager with 6+ years of experience leading cross-functional teams, managing budgets, and executing high-impact international projects. Strong background in stakeholder alignment, resource scheduling, risk management, and vendor negotiations. Proven track record of delivering projects on time and within scope while adhering to global standards and best practices.',
								skills: [
									{ name: 'Project Management', details: '', level: 'Expert' },
									{ name: 'Agile Methodologies', details: '', level: 'Expert' },
									{ name: 'Stakeholder Engagement', details: '', level: 'Expert' },
									{ name: 'Resource Allocation', details: '', level: 'Expert' },
									{ name: 'Risk Management', details: '', level: 'Expert' },
									{ name: 'Budget Tracking', details: '', level: 'Expert' }
								],
								certificates: [
									{ name: 'Lean Six Sigma Green Belt', link: '', details: '' },
									{ name: 'Certified Supply Chain Professional (CSCP)', link: '', details: '' }
								],
								languages: [
									{ name: 'English', details: '', level: 'Native/Bilingual' },
									{ name: 'Spanish', details: '', level: 'Fluent' },
									{ name: 'French', details: '', level: 'Conversational' }
								],
								interests: [],
								projects: [],
								experience: [
									{
										role: 'Senior Project Manager',
										company: 'Deloitte UK',
										startDate: '01/2022',
										endDate: 'Present',
										city: 'London',
										country: 'United Kingdom',
										details: 'Led delivery of enterprise digital transformation initiatives across EMEA.\nCoordinated resource allocation and budget management for a £2M portfolio.\nManaged client communications and secured steering committee approvals.'
									},
									{
										role: 'Project Associate',
										company: 'Unilever',
										startDate: '07/2019',
										endDate: '12/2021',
										city: 'London',
										country: 'United Kingdom',
										details: 'Supported cross-functional product development pipelines for global markets.\nMaintained milestone tracking and project documentation under Prince2 framework.\nResolved supply chain coordination issues to reduce shipping delays.'
									},
									{
										role: 'Project Assistant',
										company: 'Arup',
										startDate: '06/2017',
										endDate: '06/2019',
										city: 'Manchester',
										country: 'United Kingdom',
										details: 'Assisted senior managers in compiling project reports and client briefs.\nCoordinated weekly team syncs and monitored action logs.\nPrepared cost estimation drafts and monitored procurement cycles.'
									}
								],
								education: [
									{
										degree: 'M.Sc. in Project Management',
										school: 'University of Manchester',
										startDate: '2016',
										endDate: '2017',
										city: 'Manchester',
										country: 'United Kingdom',
										details: 'Specialized in Agile Project Delivery and Risk Mitigation frameworks.\nGraduated with Distinction.'
									},
									{
										degree: 'B.Sc. in Business Administration',
										school: 'University of Bristol',
										startDate: '2013',
										endDate: '2016',
										city: 'Bristol',
										country: 'United Kingdom',
										details: 'Majored in Operations Management and Business Strategy.\nPresident of the Student Consulting Club.'
									}
								],
								photo: getPluginAssetUrl('george-avatar.png'),
								previewFontSizeBase: 8.5,
								previewFontSizeName: 10,
								previewFontSizeTitle: 4,
								previewFontSizeHeading: 2,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 110,
								previewElementSpace: 8,
								previewSideMargin: 18,
								previewVerticalMargin: 10
							};

							// The former Professional-only sales profile is retained below as
							// legacy sample data, but is no longer used. Templates share the
							// same default CV content.
							if (false && selectedTemplate === 'professional') {
								prefillState = {
									fullName: 'Michael Nwosu',
									jobTitle: 'Sales Manager',
									email: 'michael.nwosu@email.com',
									phone: '+44 7700 516 284',
									location: 'Birmingham, United Kingdom',
									website: 'linkedin.com/in/michael-nwosu',
									summary: 'Commercial sales professional with over 6 years of experience in B2B, account development, and client retention. Track record of growing revenue, strengthening customer relationships, and improving sales processes across competitive markets. Brings proactive approach to pipeline management, cross-functional collaboration, and delivering consistent results across regional teams.',
									skills: [
										{ name: 'Account Management', details: '', level: 'Expert' },
										{ name: 'B2B Sales', details: '', level: 'Expert' },
										{ name: 'Lead Generation', details: '', level: 'Expert' },
										{ name: 'CRM Systems', details: '', level: 'Expert' },
										{ name: 'Negotiation', details: '', level: 'Expert' },
										{ name: 'Sales Forecasting', details: '', level: 'Expert' },
										{ name: 'Pipeline Management', details: '', level: 'Expert' }
									],
									certificates: [
										{ name: 'HubSpot Sales Software Certification', link: '', details: '' },
										{ name: 'Salesforce Certified Associate', link: '', details: '' },
										{ name: 'Level 4 Certificate in Sales Management', link: '', details: '' },
										{ name: 'LinkedIn Learning Certificate Negotiation Skills', link: '', details: '' }
									],
									languages: [
										{ name: 'English', details: '', level: '5/5' },
										{ name: 'Igbo', details: '', level: '3/5' },
										{ name: 'French', details: '', level: '2/5' }
									],
									interests: [],
									projects: [],
									experience: [
										{
											role: 'Sales Manager',
											company: 'Westford Commercial Services',
											startDate: '01/2022',
											endDate: 'Present',
											city: 'Birmingham',
											country: 'United Kingdom',
											details: 'Managed regional sales pipeline and exceeded annual revenue targets by 14%.\nLed account growth plans for key clients in logistics and professional services.\nImproved close rates through stronger qualification and structured follow-up activity.'
										},
										{
											role: 'Senior Sales Executive',
											company: 'Brightlane Solutions',
											startDate: '05/2019',
											endDate: '12/2021',
											city: 'Nottingham',
											country: 'United Kingdom',
											details: 'Owned the full sales cycle from prospecting to negotiation and contract closure.\nBuilt long-term client relationships that increased renewals and upsell opportunities.\nPartnered with marketing teams to improve lead quality and campaign conversion.'
										},
										{
											role: 'Sales Coordinator',
											company: 'Hartwell Systems',
											startDate: '07/2017',
											endDate: '04/2019',
											city: 'Leicester',
											country: 'United Kingdom',
											details: 'Supported sales reporting, CRM maintenance, and weekly pipeline coordination.\nContributed to outreach campaigns that expanded the qualified prospect pipeline.\nCoordinated client follow-ups and internal handovers to improve response times.'
										}
									],
									education: [
										{
											degree: 'Diploma in Professional Selling',
											school: 'Birmingham Metropolitan College',
											startDate: '2016',
											endDate: '2017',
											city: 'Birmingham',
											country: 'United Kingdom',
											details: ''
										},
										{
											degree: 'BA (Hons) Business Management',
											school: 'Aston University',
											startDate: '2014',
											endDate: '2017',
											city: 'Birmingham',
											country: 'United Kingdom',
											details: ''
										}
									],
									photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=700&h=700',
									activeSections: ['summary', 'experience', 'education', 'skills', 'languages', 'certificates'],
									previewFontSizeBase: 8.3,
									previewFontSizeName: 10,
									previewFontSizeTitle: 4,
									previewFontSizeHeading: 1,
									previewFontSizeBody: 0,
									previewFontSizeEntry: 0,
									previewLineHeight: 108,
									previewElementSpace: 7,
									previewSideMargin: 0,
									previewVerticalMargin: 0
								};
							}
						}

						// Templates change the design, never shorten the sample content.
						if (prefillState.fullName === 'George Emmanuel') {
							prefillState = Object.assign({}, prefillState, freshSample(), {sampleContentVersion:6});
						}

						const templateFormattingDefaults = {
							classic: {
								previewFontSizeBase: 8.5,
								previewFontSizeName: 10,
								previewFontSizeTitle: 4,
								previewFontSizeHeading: 2,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 110,
								previewElementSpace: 8,
								previewSideMargin: 18,
								previewVerticalMargin: 10
							},
							modern: {
								previewFontSizeBase: 8.0,
								previewFontSizeName: 10,
								previewFontSizeTitle: 4,
								previewFontSizeHeading: 2,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 105,
								previewElementSpace: 6,
								previewSideMargin: 18,
								previewVerticalMargin: 8
							},
							chromatic: {
								previewFontSizeBase: 8.5,
								previewFontSizeName: 10,
								previewFontSizeTitle: 4,
								previewFontSizeHeading: 2,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 110,
								previewElementSpace: 8,
								previewSideMargin: 18,
								previewVerticalMargin: 10
							},
							flare: {
								previewFontSizeBase: 8.2,
								previewFontSizeName: 9,
								previewFontSizeTitle: 3,
								previewFontSizeHeading: 1,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 106,
								previewElementSpace: 7,
								previewSideMargin: 0,
								previewVerticalMargin: 0
							},
							professional: {
								previewFontSizeBase: 8.3,
								previewFontSizeName: 10,
								previewFontSizeTitle: 4,
								previewFontSizeHeading: 1,
								previewFontSizeBody: 0,
								previewFontSizeEntry: 0,
								previewLineHeight: 108,
								previewElementSpace: 7,
								previewSideMargin: 0,
								previewVerticalMargin: 0
							}
						};

						const isDefaultExperiencedSeed = Object.keys(sampleContent).every(key => JSON.stringify(state[key]) === JSON.stringify(sampleContent[key]));
						const hasEdited = !isDefaultExperiencedSeed && (state.fullName || state.email || (state.experience && state.experience.length > 0) || (state.education && state.education.length > 0));

						if (hasEdited) {
							state.template = selectedTemplate;
							if (templateFormattingDefaults[selectedTemplate]) {
								Object.assign(state, templateFormattingDefaults[selectedTemplate]);
							}
						} else {
							const blankState = Object.assign({
								template: selectedTemplate,
								photo: ''
							}, prefillState);

							// Reset or initialize state for a new CV
							Object.keys(state).forEach((k) => delete state[k]);
							Object.assign(state, blankState);
							normalizeState(state);
						}

						if (Array.isArray(state.activeSections) && !state.activeSections.includes('skills')) {
							state.activeSections.push('skills');
						}

						if (Array.isArray(state.activeSections)) {
							if (!state.activeSections.includes('languages')) {
								state.activeSections.push('languages');
							}
							if (!state.activeSections.includes('certificates')) {
								state.activeSections.push('certificates');
							}
						}

						applyTemplateDefaultPalette(state, selectedTemplate);

						// Save selected color preset to editor state:
						const activeDot = app.querySelector('.cv-modal-color-dot.is-active');
						const chosenColor = activeDot ? activeDot.dataset.color : 'default';

						const colorPresets = {
							darkgray: { accent: '#374151', soft: '#e5e7eb', dark: '#111827' },
							beige: { accent: '#bda09c', soft: '#f1e8e6', dark: '#6b4f4a' },
							darkblue: { accent: '#1e3a8a', soft: '#dbeafe', dark: '#1e40af' },
							lightblue: { accent: '#3b82f6', soft: '#dbeafe', dark: '#2563eb' },
							medbiomate: { accent: '#0284c7', soft: '#f0f9ff', dark: '#0369a1' },
							cyan: { accent: '#06b6d4', soft: '#cffafe', dark: '#0891b2' },
							green: { accent: '#10b981', soft: '#d1fae5', dark: '#047857' },
							orange: { accent: '#f59e0b', soft: '#fef3c7', dark: '#d97706' },
							pink: { accent: '#e11d48', soft: '#ffe4e6', dark: '#be123c' }
						};

						if (colorPresets[chosenColor]) {
							const preset = colorPresets[chosenColor];
							state.solidColor = preset.accent;
							state.previewColorAccent = preset.accent;
							state.previewColorAccentDark = preset.dark;
							state.previewColorAccentSoft = preset.soft;
							state.previewColorAccentInk = '#ffffff';
							state.previewColorAccentMuted = 'rgba(255, 255, 255, 0.92)';
						} else {
							state.solidColor = '';
							state.previewColorAccent = '';
							state.previewColorAccentDark = '';
							state.previewColorAccentSoft = '';
							state.previewColorAccentInk = '';
							state.previewColorAccentMuted = '';
						}

						// Re-selecting a design must recover its saved formatting too.
						styledTemplate = null;
						applyTemplateStyle();
						save();
						renderAll();
						closeModal();

						window.location.hash = 'cv-workspace';

						// Defensive direct transition (bypassing hashchange interceptors)
						if (workspaceSection) {
							showSection(workspaceSection);
							const contentTab = app.querySelector('[data-workspace-tab="content"]');
							if (contentTab) {
								contentTab.click();
							} else {
								showContentDashboard();
							}
						}

						queuePreviewLayoutSync();
						schedulePreviewRebuild();
					} catch (err) {
						console.error('Use Template Error:', err);
						alert('Use Template Error: ' + err.message + '\nStack:\n' + err.stack);
					}
				});
			}

			const templatesBackBtn = app.querySelector('.cv-step-templates .cv-btn-back');
			if (templatesBackBtn) {
				templatesBackBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/choice';
				});
			}

			// Upgrade Screen Buttons
			const upgradeBackBtn = app.querySelector('.cv-onboarding-upgrade .cv-btn-back');
			if (upgradeBackBtn) {
				upgradeBackBtn.addEventListener('click', () => {
					window.location.hash = 'onboarding/choice';
				});
			}

			// Photo input handling
			const photoInput = app.querySelector('#cv-field-photo');
			if (photoInput) {
				const dashboardPhoto = app.querySelector('.cv-dash-photo-circle');
				if (dashboardPhoto) {
					dashboardPhoto.setAttribute('role', 'button');
					dashboardPhoto.setAttribute('tabindex', '0');
					dashboardPhoto.setAttribute('aria-label', 'Change profile photo or take a photo');
					dashboardPhoto.style.cursor = 'pointer';
					dashboardPhoto.addEventListener('click', () => photoInput.click());
					dashboardPhoto.addEventListener('keydown', (event) => {
						if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); photoInput.click(); }
					});
				}
				photoInput.addEventListener('change', async (e) => {
					const file = e.target.files[0];
					if (!file) return;
					const url = URL.createObjectURL(file);
					const previousPhoto = state.photo;
					try {
						const image = new Image();
						image.src = url;
						await image.decode();
						const ratio = Math.min(1, 300 / Math.max(image.naturalWidth, image.naturalHeight));
						const canvas = document.createElement('canvas');
						canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
						canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
						const context = canvas.getContext('2d');
						context.fillStyle = '#ffffff';
						context.fillRect(0, 0, canvas.width, canvas.height);
						context.drawImage(image, 0, 0, canvas.width, canvas.height);
						state.photo = canvas.toDataURL('image/jpeg', .70);
						save();
						renderAll();
						renderContentDashboard();
					} catch (error) {
						state.photo = previousPhoto;
						alert('Could not load this photo. Please try a JPEG or PNG photo.');
					} finally {
						URL.revokeObjectURL(url);
						photoInput.value = '';
					}
				});
			}

			// Router Setup
			const handleRouting = () => {
				const hash = window.location.hash || '#landing';

				if (hash === '#landing' || hash === '' || hash === '#') {
					showSection(landingSection);
				} else if (hash === '#onboarding/choice') {
					showSection(choiceSection);
				} else if (hash === '#onboarding/experience' || hash === '#onboarding/company' || hash === '#onboarding/goals' || hash === '#onboarding/industry') {
					window.location.hash = 'onboarding/templates';
				} else if (hash === '#onboarding/templates') {
					showSection(stepTemplates);
				} else if (hash === '#onboarding/templates/modal' || hash === '#template-modal') {
					showSection(stepTemplates);
					openTemplateModal(0);
				} else if (hash === '#onboarding/upgrade') {
					showSection(upgradeSection);
				} else if (hash === '#cv-workspace') {
					showSection(workspaceSection);
					const contentTab = app.querySelector('[data-workspace-tab="content"]');
					if (contentTab) {
						contentTab.click();
					} else {
						showContentDashboard();
					}
				} else {
					// Never leave the embedded app with every section hidden.
					window.location.replace('#cv-workspace');
				}
				queuePreviewLayoutSync();
			};

			window.addEventListener('hashchange', handleRouting);
			handleRouting();

			const PDFJS_SCRIPT_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
			const PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

			const showToast = (message, background = '#08cd7f') => {
				const toast = document.createElement('div');
				toast.style.position = 'fixed';
				toast.style.bottom = '24px';
				toast.style.left = '50%';
				toast.style.transform = 'translateX(-50%)';
				toast.style.background = background;
				toast.style.color = '#ffffff';
				toast.style.padding = '12px 28px';
				toast.style.borderRadius = '999px';
				toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
				toast.style.fontWeight = 'bold';
				toast.style.zIndex = '99999';
				toast.style.fontSize = '0.95rem';
				toast.textContent = message;
				document.body.appendChild(toast);

				setTimeout(() => {
					toast.style.opacity = '0';
					toast.style.transition = 'opacity 0.5s ease';
					setTimeout(() => toast.remove(), 500);
				}, 3000);
			};

			const normalizeExtractedLine = (line) => line
				.replace(/\s+/g, ' ')
				.replace(/[•▪◦]/g, '•')
				.trim();

			const isHeadingLine = (line) => /^(summary|professional summary|profile|about|experience|work experience|employment|education|skills|technical skills|projects|certifications|contact)$/i.test(line);
			const isBulletLine = (line) => /^[•▪◦\-*●■◆◇○✓✔✦]/.test(line.trim());
			const hasDateToken = (line) => /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present|current|20\d{2}|19\d{2})\b/i.test(line);
			const looksLikeEmail = (line) => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(line);

			const looksLikePhone = (line) => {
				if (/\b(?:19|20)\d{2}\b/.test(line)) return false;
				if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(line)) return false;
				return /(?:\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,5}/.test(line) || /\b\d{10}\b/.test(line) || /\b\d{5}[-\s]\d{5}\b/.test(line);
			};

			const looksLikeUrl = (line) => /(https?:\/\/|www\.|linkedin\.com|github\.com)/i.test(line);

			const findPhoneNumber = (text) => {
				const matches = text.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,5}\b|\b\d{10}\b|\b\d{5}[-\s]\d{5}\b/g);
				if (!matches) return '';
				for (const match of matches) {
					if (/\b(?:19|20)\d{2}\b/.test(match)) continue;
					return normalizeExtractedLine(match);
				}
				return '';
			};

			const getResumeSections = (lines) => {
				const sections = { header: [] };
				let currentKey = 'header';

				lines.forEach((line) => {
					if (isHeadingLine(line)) {
						currentKey = line.toLowerCase();
						sections[currentKey] = sections[currentKey] || [];
						return;
					}
					sections[currentKey] = sections[currentKey] || [];
					sections[currentKey].push(line);
				});

				return sections;
			};

			const findHeaderIdentity = (lines) => {
				const candidates = lines.filter((line) => (
					!isHeadingLine(line) &&
					!looksLikeEmail(line) &&
					!looksLikePhone(line) &&
					!looksLikeUrl(line) &&
					!/^(address|phone|email|website|location)[:\s-]*/i.test(line) &&
					line.split(' ').length >= 2 &&
					line.split(' ').length <= 6
				));

				const fullName = candidates[0] || '';
				const jobTitle = candidates[1] || '';
				return { fullName, jobTitle };
			};

			const extractLabeledValue = (lines, pattern) => {
				const matchLine = lines.find((line) => pattern.test(line));
				return matchLine ? matchLine.replace(pattern, '').trim() : '';
			};

			const parseDateRange = (lines) => {
				const joined = lines.join(' ');
				const match = joined.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s*\d{4}|\d{4})\s*(?:-|–|to)\s*((?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s*\d{4}|\d{4}))/i);
				return {
					startDate: match ? normalizeExtractedLine(match[1].replace(/\./g, '')) : '',
					endDate: match ? normalizeExtractedLine(match[2].replace(/\./g, '')) : ''
				};
			};

			const splitResumeEntries = (lines) => {
				const entries = [];
				let current = [];

				lines.forEach((line) => {
					const normalized = normalizeExtractedLine(line);
					if (!normalized) return;

					const startsEntry = current.length > 0 && !isBulletLine(normalized) && (hasDateToken(normalized) || /^[A-Z][A-Za-z0-9/&(),.\-+\s]{2,60}$/.test(normalized));
					if (startsEntry) {
						entries.push(current);
						current = [normalized];
						return;
					}
					current.push(normalized);
				});

				if (current.length) {
					entries.push(current);
				}

				return entries.filter((entry) => entry.length);
			};

			const parseExperienceEntries = (lines) => splitResumeEntries(lines).slice(0, 4).map((entry) => {
				const { startDate, endDate } = parseDateRange(entry);
				const rawRole = entry[0] || '';
				const rawCompany = entry.find((line, index) => index > 0 && !isBulletLine(line)) || '';

				let role = rawRole.replace(/\s*\|\s*.*/, '').replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s*\d{4}.*/i, '').trim();
				let company = rawCompany.replace(/\s*\|\s*.*/, '').replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s*\d{4}.*/i, '').trim();

				const jobTitleRegex = /\b(developer|engineer|manager|specialist|lead|analyst|director|associate|designer|consultant|officer|intern|trainee|head|supervisor|executive|admin|coordinator|technician|support|architect|representative|operator|agent|accountant|writer|editor|practitioner|clerk|nurse|physician|assistant|chef|driver|sales|marketing|billing)\b/i;

				if (jobTitleRegex.test(company) && !jobTitleRegex.test(role)) {
					const temp = role;
					role = company;
					company = temp;
				}

				const details = entry
					.filter((line, index) => index > 0 && line !== rawCompany)
					.map((line) => line.trim().replace(/^[•▪◦\-*●■◆◇○✓✔✦\s]+/g, ''))
					.join('\n');

				return {
					role: role || 'Job Position',
					company: company || 'Employer',
					startDate,
					endDate,
					details
				};
			}).filter((item) => item.role || item.company || item.details);

			const parseEducationEntries = (lines) => splitResumeEntries(lines).slice(0, 4).map((entry) => {
				const { startDate, endDate } = parseDateRange(entry);
				const rawDegree = entry[0] || '';
				const rawSchool = entry.find((line, index) => index > 0 && !isBulletLine(line)) || '';

				let degree = rawDegree.replace(/\s*\|\s*.*/, '').replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s*\d{4}.*/i, '').trim();
				let school = rawSchool.replace(/\s*\|\s*.*/, '').replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s*\d{4}.*/i, '').trim();

				const degreeRegex = /\b(degree|diploma|bachelor|master|phd|msc|bsc|btech|mtech|mba|associate|certificate|certification|studies|science|arts|engineering|technology)\b/i;

				if (degreeRegex.test(school) && !degreeRegex.test(degree)) {
					const temp = degree;
					degree = school;
					school = temp;
				}

				const details = entry
					.filter((line, index) => index > 0 && line !== rawSchool)
					.map((line) => line.trim().replace(/^[•▪◦\-*●■◆◇○✓✔✦\s]+/g, ''))
					.join('\n');

				return {
					degree: degree || 'Degree',
					school: school || 'School',
					startDate,
					endDate,
					details
				};
			}).filter((item) => item.degree || item.school || item.details);

			const parseSkills = (lines) => {
				const skillsStr = lines
					.join(' ')
					.split(/[•,|]/)
					.map((skill) => normalizeExtractedLine(skill))
					.filter((skill) => skill && skill.length < 40)
					.slice(0, 16)
					.join(', ');
				const oldSkills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
				return oldSkills.map(skill => {
					let name = skill;
					let level = 'Competent';
					if (skill.includes(':')) {
						const parts = skill.split(':');
						name = parts[0].trim();
						level = parts.slice(1).join(':').trim();
					}
					return {
						name: name,
						details: '',
						level: level
					};
				});
			};

			const extractResumeDataFromText = (text) => {
				const lines = text.split(/\n+/).map(normalizeExtractedLine).filter(Boolean);
				const sections = getResumeSections(lines);
				const headerLines = sections.header || lines.slice(0, 12);
				const identity = findHeaderIdentity(headerLines);
				const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
				const phone = findPhoneNumber(text);
				const urlMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/[^\s]+|github\.com\/[^\s]+|[A-Z0-9.-]+\.[A-Z]{2,}(?:\/[^\s]+)?)/i);

				return {
					fullName: identity.fullName,
					jobTitle: identity.jobTitle,
					email: emailMatch ? emailMatch[0] : extractLabeledValue(headerLines, /^email[:\s-]*/i),
					phone: phone || extractLabeledValue(headerLines, /^phone[:\s-]*/i),
					location: extractLabeledValue(headerLines, /^(address|location)[:\s-]*/i),
					website: urlMatch ? urlMatch[0].replace(/^https?:\/\//i, '') : extractLabeledValue(headerLines, /^website[:\s-]*/i),
					summary: (sections['professional summary'] || sections.summary || sections.profile || [])
						.slice(0, 5)
						.map(line => line.trim().replace(/^[•▪◦\-*●■◆◇○✓✔✦\s]+/g, ''))
						.join(' '),
					skills: parseSkills(sections.skills || sections['technical skills'] || []),
					experience: parseExperienceEntries(sections['work experience'] || sections.experience || sections.employment || []),
					education: parseEducationEntries(sections.education || [])
				};
			};

			const loadPdfJs = () => new Promise((resolve, reject) => {
				if (window.pdfjsLib) {
					window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
					resolve(window.pdfjsLib);
					return;
				}

				const existingScript = document.querySelector(`script[data-pdfjs-src="${PDFJS_SCRIPT_SRC}"]`);
				if (existingScript) {
					existingScript.addEventListener('load', () => {
						window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
						resolve(window.pdfjsLib);
					}, { once: true });
					existingScript.addEventListener('error', () => reject(new Error('Failed to load PDF parser.')), { once: true });
					return;
				}

				const script = document.createElement('script');
				script.src = PDFJS_SCRIPT_SRC;
				script.async = true;
				script.dataset.pdfjsSrc = PDFJS_SCRIPT_SRC;
				script.onload = () => {
					window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
					resolve(window.pdfjsLib);
				};
				script.onerror = () => reject(new Error('Failed to load PDF parser.'));
				document.head.appendChild(script);
			});

			const extractPdfText = async (file) => {
				const pdfjsLib = await loadPdfJs();
				const arrayBuffer = await file.arrayBuffer();
				const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
				const pageTexts = [];

				for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
					const page = await pdf.getPage(pageNumber);
					const content = await page.getTextContent();
					const rows = new Map();

					content.items.forEach((item) => {
						const text = normalizeExtractedLine(item.str || '');
						if (!text) return;
						const y = Math.round(item.transform[5]);
						const x = item.transform[4];
						if (!rows.has(y)) {
							rows.set(y, []);
						}
						rows.get(y).push({ x, text });
					});

					const pageLines = Array.from(rows.entries())
						.sort((a, b) => b[0] - a[0])
						.map(([, fragments]) => fragments.sort((a, b) => a.x - b.x).map((fragment) => fragment.text).join(' '))
						.map(normalizeExtractedLine)
						.filter(Boolean);

					pageTexts.push(pageLines.join('\n'));
				}

				return pageTexts.join('\n\n');
			};

			const extractFileText = async (file) => {
				const lowerName = file.name.toLowerCase();
				if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) {
					return extractPdfText(file);
				}
				if (file.type.startsWith('text/') || lowerName.endsWith('.txt')) {
					return file.text();
				}
				throw new Error('Only PDF and TXT uploads are supported right now.');
			};

			const buildUploadedState = (parsedData) => ({
				template: state.template || defaultState.template || 'classic',
				fullName: parsedData.fullName || '',
				jobTitle: parsedData.jobTitle || '',
				email: parsedData.email || '',
				phone: parsedData.phone || '',
				location: parsedData.location || '',
				country: parsedData.country || '',
				website: parsedData.website || '',
				summary: parsedData.summary || '',
				skills: parsedData.skills || [],
				languages: parsedData.languages || [],
				certificates: parsedData.certificates || [],
				experience: parsedData.experience && parsedData.experience.length ? parsedData.experience : [],
				education: parsedData.education && parsedData.education.length ? parsedData.education : [],
				photo: ''
			});

			const bindCvUpload = (triggerSelector, inputSelector, statusSelector) => {
				const trigger = app.querySelector(triggerSelector);
				const input = app.querySelector(inputSelector);
				const statusNode = app.querySelector(statusSelector);
				if (!trigger || !input) return;

				const updateStatus = (message, color = '#334155') => {
					if (!statusNode) return;
					statusNode.textContent = message;
					statusNode.style.color = color;
				};

				input.addEventListener('change', () => {
					if (input.files && input.files.length > 0) {
						updateStatus(`Uploading ${input.files[0].name}...`, '#2563eb');
						simulateAIParsing(input.files[0], input, updateStatus);
					} else {
						updateStatus('No file selected yet.');
					}
				});
			};

			const simulateAIParsing = async (file, sourceInput = null, updateStatus = null) => {
				if (!aiLoader) {
					window.location.hash = 'cv-workspace';
					return;
				}

				const statusText = aiLoader.querySelector('.cv-ai-loader-status');
				const subText = aiLoader.querySelector('.cv-ai-loader-sub');

				aiLoader.classList.add('is-active');

				try {
					statusText.textContent = 'Reading uploaded file...';
					subText.textContent = `Analyzing structure of ${file.name}`;
					if (updateStatus) {
						updateStatus(`Reading ${file.name}...`, '#2563eb');
					}

					const extractedText = await extractFileText(file);
					if (!extractedText.trim()) {
						throw new Error('No readable text was found in that file.');
					}

					statusText.textContent = 'Parsing contact info & header...';
					subText.textContent = 'Extracting name, title, email, phone number, and links';

					const parsedData = extractResumeDataFromText(extractedText);

					statusText.textContent = 'Analyzing work history & skills...';
					subText.textContent = 'Structuring experience, education, summary, and skills';

					const uploadedState = buildUploadedState(parsedData);

					statusText.textContent = 'Formatting professional layout...';
					subText.textContent = 'Mapping extracted details to the CV builder workspace';

					Object.assign(state, uploadedState);
					save();
					renderAll();

					aiLoader.classList.remove('is-active');
					window.location.hash = 'cv-workspace';
					if (updateStatus) {
						updateStatus(`Uploaded and parsed: ${file.name}`, '#16a34a');
					}
					showToast('CV parsed successfully! Draft updated.');
				} catch (error) {
					aiLoader.classList.remove('is-active');
					if (updateStatus) {
						updateStatus(error.message || 'Could not parse that CV file.', '#dc2626');
					}
					showToast(error.message || 'Could not parse that CV file.', '#ef4444');
				} finally {
					if (sourceInput) {
						sourceInput.value = '';
					}
				}
			};

			// Customizer controls event binding
			const initCustomizer = () => {
				const toggleBtn = app.querySelector('#cv-customizer-toggle');
				const modalNode = app.querySelector('#cv-formatting-modal');
				const closeBtn = app.querySelector('#cv-formatting-modal-close');
				const doneBtn = app.querySelector('#cv-formatting-modal-done-btn');

				const prevBtn = app.querySelector('#cv-modal-page-prev');

				// Workspace Pagination & Scaling
				const wPrevBtn = app.querySelector('#cv-workspace-page-prev');
				const wNextBtn = app.querySelector('#cv-workspace-page-next');
				const wCurrentSpan = app.querySelector('#cv-workspace-page-current');
				const wTotalSpan = app.querySelector('#cv-workspace-page-total');
				const wPaginationBar = app.querySelector('#cv-workspace-pagination');

				let workspaceCurrentPage = 1;
				let workspaceTotalPages = 1;

				const renderWorkspaceThumbnails = () => {
					const workspace = app.querySelector('#cv-builder-workspace');
					if (!workspace) return;
					const isFormatting = workspace.classList.contains('formatting-mode');
					const sidebar = app.querySelector('#cv-workspace-thumbnails-sidebar');
					if (!sidebar) return;

					if (!isFormatting) {
						sidebar.classList.add('cv-hidden');
						return;
					}

					sidebar.classList.remove('cv-hidden');
					sidebar.innerHTML = '';

					const previewNode = app.querySelector('.cv-preview-sheet-container > [data-preview]');
					if (!previewNode) return;

					// Temporarily reset transformation scale so we can read unscaled scrollHeight
					const origTransform = previewNode.style.transform;
					const origTop = previewNode.style.top;
					previewNode.style.transform = 'none';
					previewNode.style.top = '0';

					const contentHeight = getPreviewContentHeight(previewNode);
					const totalPages = getPageCountFromContentHeight(contentHeight);

					// Restore original styles
					previewNode.style.transform = origTransform;
					previewNode.style.top = origTop;

					for (let i = 1; i <= totalPages; i++) {
						const item = document.createElement('div');
						item.className = `cv-workspace-thumbnail-item${i === workspaceCurrentPage ? ' active' : ''}`;

						const label = document.createElement('div');
						label.className = 'cv-workspace-thumbnail-label';
						label.textContent = `${i} / ${totalPages}`;
						item.appendChild(label);

						const wrap = document.createElement('div');
						wrap.className = 'cv-workspace-thumbnail-preview-wrap';

						// Clone the preview node
						const clone = previewNode.cloneNode(true);
						clone.removeAttribute('id');
						clone.removeAttribute('data-preview');

						// Scale it down to 0.1375 (so 800px width becomes 110px width)
						const thumbScale = 110 / 800;
						clone.style.transform = `scale(${thumbScale})`;
						clone.style.transformOrigin = 'top left';
						clone.style.width = '800px';
						clone.style.height = `${PAGE_HEIGHT}px`;
						clone.style.top = `-${(i - 1) * PAGE_HEIGHT * thumbScale}px`;
						clone.style.position = 'absolute';
						clone.style.left = '0';

						wrap.appendChild(clone);
						item.appendChild(wrap);

						item.addEventListener('click', () => {
							workspaceCurrentPage = i;
							resizeWorkspacePreview();
							// Update active class on thumbnails
							sidebar.querySelectorAll('.cv-workspace-thumbnail-item').forEach((thumb, idx) => {
								thumb.classList.toggle('active', (idx + 1) === i);
							});
						});

						sidebar.appendChild(item);
					}
				};

				const resizeWorkspacePreview = () => {
					// Thumbnail capture temporarily expands the real first A4 sheet to its
					// authored size. Ignore resize callbacks during that short window or the
					// mobile fit routine will reapply its screen scale to the saved image.
					if (window.__medbiomateThumbnailCaptureActive) return;
					const workspace = app.querySelector('#cv-builder-workspace');
					const rightPanel = app.querySelector('.cv-workspace-preview-column');
					if (!workspace || !rightPanel) return;

					// Find all workspace containers (ignoring modal preview container)
					let containers = rightPanel.querySelectorAll('.cv-preview-sheet-container');
					if (containers.length === 0) return;

					const isFormatting = workspace.classList.contains('formatting-mode');

					// Scale to fit the right panel width dynamically
					const isMobilePreview = window.innerWidth <= 600 || document.body.classList.contains('cv-mobile-preview-mode');
					const padding = isMobilePreview ? 16 : 64;
					const measuredPanelWidth = rightPanel.clientWidth;
					const fallbackPanelWidth = isMobilePreview ? Math.max(240, window.innerWidth - 16) : 540;
					const availableWidth = Math.max(1, (measuredPanelWidth || fallbackPanelWidth) - padding);
					let scale = availableWidth / 800;

					// Clamp scale to reasonable bounds
					if (scale < (isMobilePreview ? 0.25 : 0.4)) scale = isMobilePreview ? 0.25 : 0.4;
					if (scale > (isMobilePreview ? 0.65 : 1.2)) scale = isMobilePreview ? 0.65 : 1.2;

					if (isFormatting) {
						const firstContainer = containers[0];
						const containerWidth = firstContainer ? firstContainer.clientWidth : 0;
						scale = containerWidth > 0 ? (containerWidth / 800) : 0.675;
					}

					// Calculate pages using the first container's preview sheet as template
					const firstPreview = containers[0].querySelector('[data-preview]');
					if (!firstPreview) return;

					const { pageCount: measuredWorkspacePages, contentHeight: measuredWorkspaceHeight } = measurePaginatedPreview(firstPreview);
					workspaceTotalPages = measuredWorkspacePages;
					firstPreview.style.height = (workspaceTotalPages * PAGE_HEIGHT) + 'px';
					firstPreview.style.setProperty('--page-count', workspaceTotalPages);



					// Clamp current page
					workspaceCurrentPage = Math.min(workspaceCurrentPage, workspaceTotalPages);

					// Editing preview shows one physical A4 card per measured page.
					// Formatting mode keeps a single paged viewport with its existing controls.
					const targetContainerCount = isFormatting ? 1 : workspaceTotalPages;

					if (containers.length !== targetContainerCount) {
						// Retrieve the template outerHTML from the first container
						const templateHTML = containers[0].outerHTML;

						// Remove all existing sheet containers from the right panel
						containers.forEach(c => c.remove());

						// Re-create the required number of page containers
						for (let i = 0; i < targetContainerCount; i++) {
							const tempDiv = document.createElement('div');
							tempDiv.innerHTML = templateHTML;
							const newContainer = tempDiv.firstElementChild;
							rightPanel.appendChild(newContainer);
						}

						// Re-query the newly created containers
						containers = rightPanel.querySelectorAll('.cv-preview-sheet-container');

						// Refresh the field rendering and collections across the new clones
						renderPhoto();
						renderTemplateClass();
						renderWorkspaceColors();
						renderFields();
						renderAllCollections();
					}

					// Apply scaling and position to the active page container
					containers.forEach((container, containerIndex) => {
						const preview = container.querySelector('[data-preview]');
						if (!preview) return;

						// Cloning and re-rendering the physical page cards rebuilds their
						// collection markup. Re-apply the A4 safety margins to the final DOM so
						// the visible copies keep the same page breaks as the measured source.
						adjustPageBreaks(preview);

						// Every visible card is one true A4 page. The full preview is shifted
						// behind each card so overflow continues naturally on the next page.
						const finalHeight = PAGE_HEIGHT;

						container.style.setProperty('flex', 'none', 'important');
						container.style.setProperty('width', `${800 * scale}px`, 'important');
						container.style.setProperty('height', `${finalHeight * scale}px`, 'important');
						container.style.setProperty('min-width', `${800 * scale}px`, 'important');
						container.style.setProperty('min-height', `${finalHeight * scale}px`, 'important');
						container.style.setProperty('max-width', `${800 * scale}px`, 'important');
						container.style.setProperty('max-height', `${finalHeight * scale}px`, 'important');
						container.style.setProperty('margin', '0 auto 24px auto', 'important');
						container.style.setProperty('position', 'relative', 'important');
						container.style.setProperty('overflow', 'hidden', 'important');
						container.style.setProperty('background', '#ffffff', 'important');
						container.style.setProperty('box-shadow', '0 10px 25px rgba(0,0,0,0.06)', 'important');
						container.style.setProperty('aspect-ratio', '210 / 297', 'important');
						container.style.setProperty('--page-count', workspaceTotalPages);
						container.setAttribute('data-page-number', String(isFormatting ? workspaceCurrentPage : containerIndex + 1));
						container.setAttribute('aria-label', `CV preview page ${isFormatting ? workspaceCurrentPage : containerIndex + 1} of ${workspaceTotalPages}`);

						// Apply transform to the inner page sheet
						preview.style.setProperty('transform', `scale(${scale})`);
						preview.style.setProperty('transform-origin', 'top left');
						preview.style.setProperty('width', '800px');
						preview.style.setProperty('height', `${workspaceTotalPages * PAGE_HEIGHT}px`);
						preview.style.setProperty('--page-count', workspaceTotalPages);
						preview.style.setProperty('position', 'absolute');
						preview.style.setProperty('left', '0');

						// Viewport shift: `top` positions the already scaled paper inside its
						// clipped viewport, so the A4 page distance must use the visible scale.
						const pageIndex = isFormatting ? (workspaceCurrentPage - 1) : containerIndex;
						preview.style.setProperty('top', `-${pageIndex * PAGE_HEIGHT * scale}px`);
					});

					const wPaginationBar = app.querySelector('#cv-workspace-pagination');
					if (wCurrentSpan) wCurrentSpan.textContent = String(workspaceCurrentPage);
					if (wTotalSpan) wTotalSpan.textContent = String(workspaceTotalPages);
					if (wPrevBtn) wPrevBtn.disabled = workspaceCurrentPage <= 1;
					if (wNextBtn) wNextBtn.disabled = workspaceCurrentPage >= workspaceTotalPages;

					if (isFormatting) {
						if (wPaginationBar) {
							wPaginationBar.classList.toggle('cv-hidden', workspaceTotalPages <= 1);
						}
						renderWorkspaceThumbnails();
					} else {
						const sidebar = app.querySelector('#cv-workspace-thumbnails-sidebar');
						if (sidebar) sidebar.classList.add('cv-hidden');
						if (wPaginationBar) {
							wPaginationBar.classList.add('cv-hidden');
						}
					}
				};

				resizeWorkspacePreviewFn = resizeWorkspacePreview;
				window.addEventListener('cv-refresh-preview', () => { renderAll(); resizeWorkspacePreview(); });

				if (wPrevBtn) {
					wPrevBtn.addEventListener('click', () => {
						if (workspaceCurrentPage > 1) {
							workspaceCurrentPage--;
							resizeWorkspacePreview();
						}
					});
				}

				if (wNextBtn) {
					wNextBtn.addEventListener('click', () => {
						if (workspaceCurrentPage < workspaceTotalPages) {
							workspaceCurrentPage++;
							resizeWorkspacePreview();
						}
					});
				}
				const nextBtn = app.querySelector('#cv-modal-page-next');
				const currentSpan = app.querySelector('#cv-modal-page-current');
				const totalSpan = app.querySelector('#cv-modal-page-total');
				const paginationBar = app.querySelector('#cv-modal-pagination');

				let modalCurrentPage = 1;
				let modalTotalPages = 1;

				const resizeModalPreview = () => {
					const container = app.querySelector('.cv-preview-sheet-container.large-preview');
					const modalPreview = app.querySelector('[data-preview-modal]');
					if (container && modalPreview) {
						const containerWidth = container.clientWidth;
						const scale = (containerWidth > 0 ? (containerWidth / 800) : 0.675) || 0.675;
						modalPreview.style.transform = `translateX(-50%) scale(${scale})`;
						modalPreview.style.width = `800px`;

						const { pageCount: measuredModalPages } = measurePaginatedPreview(modalPreview);
						modalTotalPages = measuredModalPages;
						modalPreview.style.height = (modalTotalPages * PAGE_HEIGHT) + 'px';
						modalPreview.style.setProperty('--page-count', modalTotalPages);

						// Clamp current page
						modalCurrentPage = Math.min(modalCurrentPage, modalTotalPages);

						// Shift position to show current page
		modalPreview.style.top = `-${(modalCurrentPage - 1) * PAGE_HEIGHT * scale}px`;

						// Update pagination bar visibility and labels
						if (modalTotalPages > 1) {
							if (paginationBar) paginationBar.classList.remove('cv-hidden');
							if (currentSpan) currentSpan.textContent = modalCurrentPage;
							if (totalSpan) totalSpan.textContent = modalTotalPages;
							if (prevBtn) prevBtn.disabled = (modalCurrentPage === 1);
							if (nextBtn) nextBtn.disabled = (modalCurrentPage === modalTotalPages);
						} else {
							if (paginationBar) paginationBar.classList.add('cv-hidden');
						}
					}
				};

				// Expose scaler globally within IIFE
				resizeModalPreviewFn = resizeModalPreview;

				const syncPreviewLayout = () => {
					if (resizeWorkspacePreviewFn) {
						resizeWorkspacePreviewFn();
					}
					if (resizeModalPreviewFn) {
						resizeModalPreviewFn();
					}
				};

				window.addEventListener('resize', syncPreviewLayout);
				if (window.visualViewport) {
					window.visualViewport.addEventListener('resize', syncPreviewLayout);
				}
				window.addEventListener('load', queuePreviewLayoutSync);
				if (document.fonts && document.fonts.ready) {
					document.fonts.ready.then(() => {
						queuePreviewLayoutSync();
					}).catch(() => { });
				}

				if (typeof ResizeObserver !== 'undefined') {
					if (previewResizeObserver) {
						previewResizeObserver.disconnect();
					}
					previewResizeObserver = new ResizeObserver(() => {
						syncPreviewLayout();
					});

					const workspaceContainer = app.querySelector('.cv-preview-sheet-container');
					const modalContainer = app.querySelector('.cv-preview-sheet-container.large-preview');
					const previewPanel = app.querySelector('.cv-builder-panel-preview');

					[workspaceContainer, modalContainer, previewPanel].forEach((node) => {
						if (node) {
							previewResizeObserver.observe(node);
						}
					});
				}

				if (prevBtn) {
					prevBtn.addEventListener('click', () => {
						if (modalCurrentPage > 1) {
							modalCurrentPage--;
							resizeModalPreview();
						}
					});
				}

				if (nextBtn) {
					nextBtn.addEventListener('click', () => {
						if (modalCurrentPage < modalTotalPages) {
							modalCurrentPage++;
							resizeModalPreview();
						}
					});
				}

				if (toggleBtn) {
					toggleBtn.addEventListener('click', (e) => {
						e.preventDefault();
						showFormSection('formatting');
					});
				}

				const closeModal = () => {
					if (modalNode) {
						modalNode.classList.add('cv-hidden');
					}
				};

				if (closeBtn) closeBtn.addEventListener('click', closeModal);
				if (doneBtn) doneBtn.addEventListener('click', closeModal);
				if (modalNode) {
					modalNode.addEventListener('click', (e) => {
						if (e.target === modalNode) {
							closeModal();
						}
					});
				}

				// Size adjustments
				const bindSizeChanger = (decSelector, incSelector, stateKey) => {
					app.querySelectorAll(decSelector).forEach(btn => {
						btn.addEventListener('click', () => {
							let scale = state[stateKey] || 1.0;
							scale = Math.max(0.6, scale - 0.05);
							state[stateKey] = parseFloat(scale.toFixed(2));
							save();
							renderAll();
						});
					});
					app.querySelectorAll(incSelector).forEach(btn => {
						btn.addEventListener('click', () => {
							let scale = state[stateKey] || 1.0;
							scale = Math.min(1.4, scale + 0.05);
							state[stateKey] = parseFloat(scale.toFixed(2));
							save();
							renderAll();
						});
					});
				};

				bindSizeChanger('#cv-size-dec-title, #cv-modal-size-dec-title', '#cv-size-inc-title, #cv-modal-size-inc-title', 'previewFontScaleTitle');
				bindSizeChanger('#cv-size-dec-subtitle, #cv-modal-size-dec-subtitle', '#cv-size-inc-subtitle, #cv-modal-size-inc-subtitle', 'previewFontScaleSubtitle');
				bindSizeChanger('#cv-size-dec-body, #cv-modal-size-dec-body', '#cv-size-inc-body, #cv-modal-size-inc-body', 'previewFontScaleBody');

				// Colors
				const bindColorChange = (pickerSelector, stateKey) => {
					app.querySelectorAll(pickerSelector).forEach(picker => {
						picker.addEventListener('input', (e) => {
							const val = e.target.value;
							state[stateKey] = val;
							if (['previewColorTitle','previewColorSubtitle','previewColorBody','previewColorBullet','previewColorDate','previewColorLocation'].includes(stateKey)) state.manualPageTextColor = true;
							if (stateKey === 'sidebarTextColor') state.manualSidebarTextColor = true;

							// Live updates to all previews (workspace and modal)
							app.querySelectorAll('.cv-preview-sheet-container > [data-preview], [data-preview-modal]').forEach((previewNode) => {
								if (stateKey === 'previewColorTitle') {
									previewNode.style.setProperty('--cv-preview-color-title', val);
									previewNode.style.setProperty('--cv-preview-title', val);
								} else if (stateKey === 'previewColorSubtitle') {
									previewNode.style.setProperty('--cv-preview-color-subtitle', val);
									previewNode.style.setProperty('--cv-preview-subtitle', val);
								} else if (stateKey === 'previewColorBody') {
									previewNode.style.setProperty('--cv-preview-color-body', val);
									previewNode.style.setProperty('--cv-preview-body', val);
								} else if (stateKey === 'previewColorBullet') {
									previewNode.style.setProperty('--cv-preview-bullet', val);
								} else if (stateKey === 'previewColorDate') {
									previewNode.style.setProperty('--cv-preview-date', val);
								} else if (stateKey === 'previewColorLocation') {
									previewNode.style.setProperty('--cv-preview-location', val);
								} else if (stateKey === 'sidebarTextColor') {
									previewNode.style.setProperty('--cv-sidebar-text-color', val);
								} else if (stateKey === 'previewIconColor') {
									previewNode.style.setProperty('--cv-preview-icon-color', val);
								} else if (stateKey === 'boxBubbleColor') {
									previewNode.style.setProperty('--cv-box-bubble-color', val);
									previewNode.style.setProperty('--cv-preview-photo-box', val);
									previewNode.style.setProperty('--cv-preview-accent', val);
								} else if (stateKey === 'levelColor') {
									previewNode.style.setProperty('--cv-level-color', val);
								} else if (stateKey === 'previewColorAccent') {
									previewNode.style.setProperty('--cv-preview-accent', val);
								} else if (stateKey === 'previewColorAccentDark') {
									previewNode.style.setProperty('--cv-preview-accent-dark', val);
								} else if (stateKey === 'previewColorAccentSoft') {
									previewNode.style.setProperty('--cv-preview-accent-soft', val);
								} else if (stateKey === 'previewColorAccentInk') {
									previewNode.style.setProperty('--cv-preview-accent-ink', val);
								} else if (stateKey === 'previewColorAccentMuted') {
									previewNode.style.setProperty('--cv-preview-accent-muted', val);
								} else if (stateKey === 'previewColorLeftBadge') {
									previewNode.style.setProperty('--cv-preview-left-badge-bg', val);
								} else if (stateKey === 'previewColorRightBadge') {
									previewNode.style.setProperty('--cv-preview-right-badge-bg', val);
								} else if (stateKey === 'previewColorPhotoBox') {
									previewNode.style.setProperty('--cv-preview-photo-box', val);
								}
							});

							// Update other pickers and swatches for the same color category
							let bgSelector = '';
							let otherPickerSelector = '';
							if (stateKey === 'previewColorTitle') {
								bgSelector = '#cv-picker-bg-title, #cv-modal-picker-bg-title, #cv-cust-picker-title';
								otherPickerSelector = '#cv-color-picker-title, #cv-modal-color-picker-title, #cv-cust-color-picker-title';
							} else if (stateKey === 'previewColorSubtitle') {
								bgSelector = '#cv-picker-bg-subtitle, #cv-modal-picker-bg-subtitle, #cv-cust-picker-subtitle';
								otherPickerSelector = '#cv-color-picker-subtitle, #cv-modal-color-picker-subtitle, #cv-cust-color-picker-subtitle';
							} else if (stateKey === 'previewColorBody') {
								bgSelector = '#cv-picker-bg-body, #cv-modal-picker-bg-body, #cv-cust-picker-body';
								otherPickerSelector = '#cv-color-picker-body, #cv-modal-color-picker-body, #cv-cust-color-picker-body';
							} else if (stateKey === 'previewColorBullet') {
								bgSelector = '#cv-cust-picker-bullet';
								otherPickerSelector = '#cv-cust-color-picker-bullet';
							} else if (stateKey === 'previewColorDate') {
								bgSelector = '#cv-cust-picker-date';
								otherPickerSelector = '#cv-cust-color-picker-date';
							} else if (stateKey === 'previewColorLocation') {
								bgSelector = '#cv-cust-picker-location';
								otherPickerSelector = '#cv-cust-color-picker-location';
							} else if (stateKey === 'previewColorAccent') {
								bgSelector = '#cv-cust-picker-accent';
								otherPickerSelector = '#cv-cust-color-picker-accent';
							} else if (stateKey === 'previewColorAccentDark') {
								bgSelector = '#cv-cust-picker-accent-dark';
								otherPickerSelector = '#cv-cust-color-picker-accent-dark';
							} else if (stateKey === 'previewColorAccentSoft') {
								bgSelector = '#cv-cust-picker-accent-soft';
								otherPickerSelector = '#cv-cust-color-picker-accent-soft';
							} else if (stateKey === 'previewColorAccentInk') {
								bgSelector = '#cv-cust-picker-accent-ink';
								otherPickerSelector = '#cv-cust-color-picker-accent-ink';
							} else if (stateKey === 'previewColorAccentMuted') {
								bgSelector = '#cv-cust-picker-accent-muted';
								otherPickerSelector = '#cv-cust-color-picker-accent-muted';
							} else if (stateKey === 'previewColorLeftBadge') {
								bgSelector = '#cv-cust-picker-left-badge';
								otherPickerSelector = '#cv-cust-color-picker-left-badge';
							} else if (stateKey === 'previewColorRightBadge') {
								bgSelector = '#cv-cust-picker-right-badge';
								otherPickerSelector = '#cv-cust-color-picker-right-badge';
							} else if (stateKey === 'boxBubbleColor') {
								bgSelector = '#cv-cust-picker-box-bubble';
								otherPickerSelector = '#cv-cust-color-picker-box-bubble';
							} else if (stateKey === 'levelColor') {
								bgSelector = '#cv-cust-picker-level-color';
								otherPickerSelector = '#cv-cust-color-picker-level-color';
							} else if (stateKey === 'sidebarTextColor') {
								bgSelector = '#cv-cust-picker-sidebar-text';
								otherPickerSelector = '#cv-cust-color-picker-sidebar-text';
							} else if (stateKey === 'previewIconColor') {
								bgSelector = '#cv-cust-picker-icon-color';
								otherPickerSelector = '#cv-cust-color-picker-icon-color';
							}
							app.querySelectorAll(bgSelector).forEach(bg => bg.style.backgroundColor = val);
							app.querySelectorAll(otherPickerSelector).forEach(p => {
								if (p !== picker) p.value = val;
							});
						});
						picker.addEventListener('change', () => {
							save();
						});
					});
				};

				bindColorChange('#cv-color-picker-title, #cv-modal-color-picker-title, #cv-cust-color-picker-title', 'previewColorTitle');
				bindColorChange('#cv-color-picker-subtitle, #cv-modal-color-picker-subtitle, #cv-cust-color-picker-subtitle', 'previewColorSubtitle');
				bindColorChange('#cv-color-picker-body, #cv-modal-color-picker-body, #cv-cust-color-picker-body', 'previewColorBody');
				bindColorChange('#cv-cust-color-picker-bullet', 'previewColorBullet');
				bindColorChange('#cv-cust-color-picker-date', 'previewColorDate');
				bindColorChange('#cv-cust-color-picker-location', 'previewColorLocation');
				bindColorChange('#cv-cust-color-picker-sidebar-text', 'sidebarTextColor');
				bindColorChange('#cv-cust-color-picker-icon-color', 'previewIconColor');
				bindColorChange('#cv-cust-color-picker-box-bubble', 'boxBubbleColor');
				bindColorChange('#cv-cust-color-picker-level-color', 'levelColor');

				// Colors target buttons
				app.querySelectorAll('[data-color-target]').forEach(btn => {
					const currentTarget = state.colorTarget || 'full';
					btn.classList.toggle('is-active', btn.dataset.colorTarget === currentTarget);
					btn.addEventListener('click', () => {
						app.querySelectorAll('[data-color-target]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.colorTarget = btn.dataset.colorTarget;

						// If Column target is selected, force Multi mode
						if (state.colorTarget === 'column') {
							state.colorMode = 'multi';
							app.querySelectorAll('[data-color-mode]').forEach(b => {
								b.classList.toggle('is-active', b.dataset.colorMode === 'multi');
							});
						}

						// Synchronize Layout Columns selector UI:
						const layoutCol = state.colorTarget === 'column' ? 'two' : 'one';
						app.querySelectorAll('.cv-layout-col-btn').forEach(b => {
							b.classList.toggle('is-active', b.dataset.layoutCol === layoutCol);
						});

						save();
						updateColorPanelVisibility();
						renderAll();
					});
				});

				// Colors mode buttons
				app.querySelectorAll('[data-color-mode]').forEach(btn => {
					const currentMode = state.colorMode || 'single';
					btn.classList.toggle('is-active', btn.dataset.colorMode === currentMode);
					btn.addEventListener('click', () => {
						const hasColorTargetControls = !!app.querySelector('[data-color-target]');

						// Column target ONLY supports Multi mode when explicit target controls exist
						if (hasColorTargetControls && state.colorTarget === 'column' && btn.dataset.colorMode !== 'multi') {
							return; // Do nothing
						}

						app.querySelectorAll('[data-color-mode]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.colorMode = btn.dataset.colorMode;
						if (!hasColorTargetControls) {
							state.colorTarget = state.colorMode === 'multi' ? 'column' : 'full';
						}
						save();
						updateColorPanelVisibility();
						renderAll();
					});
				});

				const updateColorPanelVisibility = () => {
					const mode = state.colorMode || 'single';
					const hasColorTargetControls = !!app.querySelector('[data-color-target]');
					const target = hasColorTargetControls
						? (state.colorTarget || 'full')
						: (mode === 'multi' ? 'column' : 'full');

					// Toggle panel sections
					const singlePanel = app.querySelector('#cv-color-panel-single');
					const multiPanel = app.querySelector('#cv-color-panel-multi');
					const imagePanel = app.querySelector('#cv-color-panel-image');
					const borderConfig = app.querySelector('#cv-border-config-block');
					const sidebarTextRow = app.querySelector('#cv-cust-row-sidebar-text');

					if (singlePanel) singlePanel.classList.toggle('cv-hidden', mode !== 'single');
					if (multiPanel) multiPanel.classList.toggle('cv-hidden', mode !== 'multi');
					if (imagePanel) imagePanel.classList.toggle('cv-hidden', mode !== 'image');
					if (borderConfig) borderConfig.classList.toggle('cv-hidden', target !== 'border');
					if (sidebarTextRow) sidebarTextRow.classList.toggle('cv-hidden', target !== 'column');
				};

				const applySolidColorPalette = (color) => {
					if (!color || color === 'transparent') {
						state.previewColorAccent = '';
						state.previewColorAccentDark = '';
						state.previewColorAccentSoft = '';
						state.previewColorAccentInk = '';
						state.previewColorAccentMuted = '';
						return;
					}

					const hex = color.replace('#', '');
					if (hex.length !== 6) {
						state.previewColorAccent = color;
						return;
					}

					const toRgb = (value) => ({
						r: parseInt(value.slice(0, 2), 16),
						g: parseInt(value.slice(2, 4), 16),
						b: parseInt(value.slice(4, 6), 16)
					});
					const mix = (base, target, amount) => Math.round(base + (target - base) * amount);
					const toHex = (value) => value.toString(16).padStart(2, '0');
					const rgb = toRgb(hex);
					const soft = `#${toHex(mix(rgb.r, 255, 0.82))}${toHex(mix(rgb.g, 255, 0.82))}${toHex(mix(rgb.b, 255, 0.82))}`;
					const dark = `#${toHex(mix(rgb.r, 0, 0.28))}${toHex(mix(rgb.g, 0, 0.28))}${toHex(mix(rgb.b, 0, 0.28))}`;
					const luminance = ((0.299 * rgb.r) + (0.587 * rgb.g) + (0.114 * rgb.b)) / 255;

					state.previewColorAccent = color;
					state.previewColorAccentDark = dark;
					state.previewColorAccentSoft = soft;
					state.previewColorAccentInk = luminance > 0.62 ? '#0f172a' : '#ffffff';
					state.previewColorAccentMuted = luminance > 0.62 ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.92)';
				};

				// Solid color preset buttons
				app.querySelectorAll('[data-solid-color]').forEach(btn => {
					const currentColor = state.solidColor || '#22579b';
					btn.classList.toggle('is-active', btn.dataset.solidColor === currentColor);
					btn.addEventListener('click', () => {
						app.querySelectorAll('[data-solid-color]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.solidColor = btn.dataset.solidColor;
						applySolidColorPalette(state.solidColor);
						save();
						renderAll();
					});
				});

				// Custom color wheel picker trigger
				const customWheelInput = app.querySelector('#cv-color-custom-wheel-picker');
				if (customWheelInput) {
					customWheelInput.value = state.solidColor && state.solidColor.startsWith('#') ? state.solidColor : '#22579b';
					customWheelInput.addEventListener('input', (e) => {
						const val = e.target.value;
						app.querySelectorAll('[data-solid-color]').forEach(b => b.classList.remove('is-active'));
						app.querySelector('#cv-color-custom-wheel-trigger').classList.add('is-active');
						state.solidColor = val;
						applySolidColorPalette(val);
						save();
						renderAll();
					});
				}

				const multiSidebarInput = app.querySelector('#cv-cust-color-picker-multi-sidebar');
				if (multiSidebarInput) {
					multiSidebarInput.value = state.multiSidebarColor || '#1e293b';
					multiSidebarInput.addEventListener('input', (e) => {
						const val = e.target.value;
						state.multiSidebarColor = val;
						if (!state.manualSidebarTextColor) state.sidebarTextColor = getContrastTextColor(val);
						const pickerBg = app.querySelector('#cv-cust-picker-multi-sidebar');
						if (pickerBg) pickerBg.style.backgroundColor = val;
						app.querySelectorAll('.cv-preview-sheet-container > [data-preview], [data-preview-modal]').forEach((previewNode) => {
							previewNode.style.setProperty('--cv-sidebar-bg', val);
							previewNode.style.setProperty('--cv-flare-sidebar-bg', val);
						});
						save();
						renderAll();
					});
				}

				const multiPageBgInput = app.querySelector('#cv-cust-color-picker-page-bg');
				if (multiPageBgInput) {
					multiPageBgInput.value = state.multiPageBackgroundColor || '#ffffff';
					multiPageBgInput.addEventListener('input', (e) => {
						const val = e.target.value;
						state.multiPageBackgroundColor = val;
						applyAutomaticPageContrast(state, val);
						const pickerBg = app.querySelector('#cv-cust-picker-page-bg');
						if (pickerBg) pickerBg.style.backgroundColor = val;
						app.querySelectorAll('.cv-preview-sheet-container > [data-preview], [data-preview-modal]').forEach((previewNode) => {
							previewNode.style.setProperty('--cv-page-bg', val);
							previewNode.style.setProperty('--cv-main-bg', val);
						});
						save();
						renderAll();
					});
				}

				const boxBubbleInput = app.querySelector('#cv-cust-color-picker-box-bubble');
				if (boxBubbleInput) {
					boxBubbleInput.value = state.boxBubbleColor || '#ebeffa';
					boxBubbleInput.addEventListener('input', (e) => {
						state.boxBubbleColor = e.target.value;
						save();
						renderAll();
					});
				}

				// Pattern selection buttons
				app.querySelectorAll('[data-pattern]').forEach(btn => {
					const currentPattern = state.pattern || 'leaf';
					btn.classList.toggle('is-active', btn.dataset.pattern === currentPattern);
					btn.addEventListener('click', () => {
						app.querySelectorAll('[data-pattern]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.pattern = btn.dataset.pattern;
						save();
						renderAll();
					});
				});

				// Border Size buttons
				app.querySelectorAll('[data-border-size]').forEach(btn => {
					const currentSize = state.borderSize || 'M';
					btn.classList.toggle('is-active', btn.dataset.borderSize === currentSize);
					btn.addEventListener('click', () => {
						app.querySelectorAll('[data-border-size]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.borderSize = btn.dataset.borderSize;
						save();
						renderAll();
					});
				});

				// Border check box bindings
				const bindBorderChk = (chkId, stateKey) => {
					const chk = app.querySelector(`#${chkId}`);
					if (chk) {
						chk.checked = state[stateKey] !== undefined ? !!state[stateKey] : true;
						chk.addEventListener('change', () => {
							state[stateKey] = chk.checked;
							save();
							renderAll();
						});
					}
				};
				bindBorderChk('cv-border-chk-top', 'borderTop');
				bindBorderChk('cv-border-chk-bottom', 'borderBottom');
				bindBorderChk('cv-border-chk-left', 'borderLeft');
				bindBorderChk('cv-border-chk-right', 'borderRight');

				// Accent Apply check box bindings
				const bindAccentChk = (chkId, stateKey) => {
					const chk = app.querySelector(`#${chkId}`);
					if (chk) {
						chk.checked = !!state[stateKey];
						chk.addEventListener('change', () => {
							state[stateKey] = chk.checked;
							save();
							renderAll();
						});
					}
				};
				bindAccentChk('cv-accent-chk-name', 'applyAccentName');
				bindAccentChk('cv-accent-chk-skills', 'applyAccentSkills');
				bindAccentChk('cv-accent-chk-jobtitle', 'applyAccentJobTitle');
				bindAccentChk('cv-accent-chk-dates', 'applyAccentDates');
				bindAccentChk('cv-accent-chk-headings', 'applyAccentHeadings');
				bindAccentChk('cv-accent-chk-subtitle', 'applyAccentSubtitle');
				bindAccentChk('cv-accent-chk-headericons', 'applyAccentHeaderIcons');
				bindAccentChk('cv-accent-chk-linkicons', 'applyAccentLinkIcons');

				// Trigger initial visibility setup
				updateColorPanelVisibility();

				// Customizer Subtab Switcher
				const subtabBtns = app.querySelectorAll('[data-customizer-subtab]');
				const subpanels = app.querySelectorAll('[data-customizer-panel]');

				subtabBtns.forEach(btn => {
					btn.addEventListener('click', () => {
						const target = btn.dataset.customizerSubtab;
						subtabBtns.forEach(b => b.classList.toggle('is-active', b === btn));
						subpanels.forEach(p => {
							p.classList.toggle('cv-hidden', p.dataset.customizerPanel !== target);
						});
					});
				});

				// Sliders bindings
				const bindSlider = (sliderId, valId, unit = '', stateKey = null) => {
					const slider = app.querySelector(`#${sliderId}`);
					const valSpan = app.querySelector(`#${valId}`);
					if (!slider) return;

					const updateVal = () => {
						let val = parseFloat(slider.value);
						if (valSpan) {
							if (sliderId === 'cv-slider-base-size') {
								valSpan.textContent = `${val}${unit}`;
							} else if (sliderId === 'cv-slider-line-height') {
								valSpan.textContent = (val / 100).toFixed(2);
							} else if (sliderId.includes('-size')) {
								valSpan.textContent = `${val > 0 ? '+' : ''}${val}${unit}`;
							} else {
								valSpan.textContent = `${val}${unit}`;
							}
						}

						// Update the progress fill styling dynamically on the parent track element
						const min = parseFloat(slider.min || 0);
						const max = parseFloat(slider.max || 100);
						const percent = ((val - min) / (max - min)) * 100;
						const track = slider.parentElement;
						if (track) {
							track.style.setProperty('--value-percent', `${percent}%`);
						}

						if (stateKey) {
							state[stateKey] = val;
							save();
							renderAll();
						}
					};

					slider.addEventListener('input', updateVal);
					slider.addEventListener('change', updateVal);

					// Set initial value from state
					if (stateKey && state[stateKey] !== undefined) {
						slider.value = state[stateKey];
					}
					// Force initial rendering of labels and track progress fill
					updateVal();
				};

				bindSlider('cv-slider-base-size', 'cv-val-base-size', 'pt', 'previewFontSizeBase');
				bindSlider('cv-slider-name-size', 'cv-val-name-size', 'pt', 'previewFontSizeName');
				bindSlider('cv-slider-title-size', 'cv-val-title-size', 'pt', 'previewFontSizeTitle');
				bindSlider('cv-slider-heading-size', 'cv-val-heading-size', 'pt', 'previewFontSizeHeading');
				bindSlider('cv-slider-body-size', 'cv-val-body-size', 'pt', 'previewFontSizeBody');
				bindSlider('cv-slider-entry-size', 'cv-val-entry-size', 'pt', 'previewFontSizeEntry');

				bindSlider('cv-slider-line-height', 'cv-val-line-height', '', 'previewLineHeight');
				bindSlider('cv-slider-element-space', 'cv-val-element-space', 'px', 'previewElementSpace');
				bindSlider('cv-slider-side-margin', 'cv-val-side-margin', 'mm', 'previewSideMargin');
				bindSlider('cv-slider-vertical-margin', 'cv-val-vertical-margin', 'mm', 'previewVerticalMargin');
				bindSlider('cv-slider-subtitle-text-space', 'cv-val-subtitle-text-space', 'px', 'previewSubtitleTextSpace');

				// Increment / Decrement Buttons for Sliders
				app.querySelectorAll('.cv-slider-step-btn').forEach(btn => {
					btn.addEventListener('click', () => {
						const targetId = btn.dataset.target;
						const slider = app.querySelector(`#${targetId}`);
						if (!slider) return;

						const min = parseFloat(slider.min);
						const max = parseFloat(slider.max);
						const step = parseFloat(slider.step || '1');
						const current = parseFloat(slider.value);

						if (btn.classList.contains('dec')) {
							slider.value = String(Math.max(min, current - step));
						} else {
							slider.value = String(Math.min(max, current + step));
						}

						slider.dispatchEvent(new Event('input'));
						slider.dispatchEvent(new Event('change'));
					});
				});

				// Browse Templates Button inside customizer
				const custBrowseBtn = app.querySelector('#cv-customizer-browse-templates-btn');
				if (custBrowseBtn) {
					custBrowseBtn.addEventListener('click', () => {
						const modal = app.querySelector('#cv-templates-modal') || app.querySelector('#cv-formatting-modal');
						if (modal) modal.classList.remove('cv-hidden');
					});
				}

				// Layout Columns selection
				app.querySelectorAll('.cv-layout-col-btn').forEach(btn => {
					btn.addEventListener('click', () => {
						app.querySelectorAll('.cv-layout-col-btn').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						const layoutVal = btn.dataset.layoutCol;

						// Synchronize with Color Target:
						if (layoutVal === 'one') {
							state.colorTarget = 'full';
						} else {
							state.colorTarget = 'column';
						}

						// Synchronize Color Target UI
						app.querySelectorAll('[data-color-target]').forEach(b => {
							b.classList.toggle('is-active', b.dataset.colorTarget === state.colorTarget);
						});

						// If Column target is selected, force Multi mode
						if (state.colorTarget === 'column') {
							state.colorMode = 'multi';
							app.querySelectorAll('[data-color-mode]').forEach(b => {
								b.classList.toggle('is-active', b.dataset.colorMode === 'multi');
							});
						}

						save();
						updateColorPanelVisibility();
						renderAll();
					});
				});

				// Initial Layout columns button states on load:
				const initialLayoutCol = (state.colorTarget || 'full') === 'column' ? 'two' : 'one';
				app.querySelectorAll('.cv-layout-col-btn').forEach(b => {
					b.classList.toggle('is-active', b.dataset.layoutCol === initialLayoutCol);
				});

				// Sections Visibility toggles
				const updateSectionSwitches = () => {
					app.querySelectorAll('[data-section-toggle]').forEach(chk => {
						const secId = chk.dataset.sectionToggle;
						chk.checked = Array.isArray(state.activeSections) && state.activeSections.includes(secId);
					});
				};
				updateSectionSwitches();

				app.querySelectorAll('[data-section-toggle]').forEach(chk => {
					chk.addEventListener('change', () => {
						const secId = chk.dataset.sectionToggle;
						if (!Array.isArray(state.activeSections)) {
							state.activeSections = [];
						}
						if (chk.checked) {
							if (!state.activeSections.includes(secId)) {
								state.activeSections.push(secId);
							}
						} else {
							state.activeSections = state.activeSections.filter(x => x !== secId);
						}
						save();
						renderAll();
					});
				});



				// Date Position binding
				app.querySelectorAll('[data-date-pos]').forEach(btn => {
					const currentVal = state.custDatePosition || 'right';
					btn.classList.toggle('is-active', btn.dataset.datePos === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-date-pos]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custDatePosition = btn.dataset.datePos;
						save();
						renderAll();
					});
				});



				// Subtitle Placement binding
				app.querySelectorAll('[data-sub-place]').forEach(btn => {
					const currentVal = state.custSubtitlePlacement || 'same';
					btn.classList.toggle('is-active', btn.dataset.subPlace === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-sub-place]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custSubtitlePlacement = btn.dataset.subPlace;
						save();
						renderAll();
					});
				});

				// Location Placement binding
				app.querySelectorAll('[data-loc-place]').forEach(btn => {
					const currentVal = state.custLocationPlacement || 'same';
					btn.classList.toggle('is-active', btn.dataset.locPlace === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-loc-place]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custLocationPlacement = btn.dataset.locPlace;
						save();
						renderAll();
					});
				});

				// Advanced settings accordion trigger
				const advTrigger = app.querySelector('#cv-cust-advanced-trigger');
				const advContent = app.querySelector('#cv-cust-advanced-content');
				if (advTrigger && advContent) {
					advTrigger.addEventListener('click', () => {
						const isExpanded = advTrigger.classList.toggle('is-expanded');
						advContent.classList.toggle('cv-hidden', !isExpanded);
					});
				}

				// Subtitle / Date / Location font styles choices
				app.querySelectorAll('.cv-font-style-choices').forEach(group => {
					const styleType = group.dataset.styleType;
					const stateKey = styleType === 'subtitle' ? 'custSubtitleStyle'
						: styleType === 'date' ? 'custDateStyle'
							: 'custLocationStyle';

					const currentVal = state[stateKey] || 'normal';
					group.querySelectorAll('.cv-style-choice-btn').forEach(btn => {
						btn.classList.toggle('is-active', btn.dataset.styleChoice === currentVal);
						btn.addEventListener('click', () => {
							group.querySelectorAll('.cv-style-choice-btn').forEach(b => b.classList.remove('is-active'));
							btn.classList.add('is-active');
							state[stateKey] = btn.dataset.styleChoice;
							save();
							renderAll();
						});
					});
				});

				// Heading Customizer bindings
				app.querySelectorAll('[data-heading-style]').forEach(btn => {
					const currentStyle = state.custHeadingStyle || '1';
					btn.classList.toggle('is-active', btn.dataset.headingStyle === currentStyle);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-heading-style]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custHeadingStyle = btn.dataset.headingStyle;
						save();
						renderAll();
					});
				});

				app.querySelectorAll('[data-heading-case]').forEach(btn => {
					const currentCase = state.custHeadingCase || 'uppercase';
					btn.classList.toggle('is-active', btn.dataset.headingCase === currentCase);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-heading-case]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custHeadingCase = btn.dataset.headingCase;
						save();
						renderAll();
					});
				});

				app.querySelectorAll('[data-heading-icon]').forEach(btn => {
					const currentIcon = state.custHeadingIcon || 'none';
					btn.classList.toggle('is-active', btn.dataset.headingIcon === currentIcon);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-heading-icon]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custHeadingIcon = btn.dataset.headingIcon;
						save();
						renderAll();
					});
				});

				// Indentation
				const indentChk = app.querySelector('#cv-toggle-indent-body');
				if (indentChk) {
					indentChk.checked = !!state.custIndentBody;
					indentChk.addEventListener('change', () => {
						state.custIndentBody = indentChk.checked;
						save();
						renderAll();
					});
				}

				// List style choices
				app.querySelectorAll('[data-list-style]').forEach(btn => {
					const currentListStyle = state.custListStyle || 'bullet';
					btn.classList.toggle('is-active', btn.dataset.listStyle === currentListStyle);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-list-style]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custListStyle = btn.dataset.listStyle;
						save();
						renderAll();
					});
				});

				// Date Location Order
				app.querySelectorAll('[data-order]').forEach(btn => {
					const currentOrder = state.custDateLocOrder || 'date-loc';
					btn.classList.toggle('is-active', btn.dataset.order === currentOrder);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-order]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custDateLocOrder = btn.dataset.order;
						save();
						renderAll();
					});
				});

				// Photo Border Shape
				app.querySelectorAll('[data-photo-shape]').forEach(btn => {
					const currentVal = state.custPhotoShape || 'circle';
					btn.classList.toggle('is-active', btn.dataset.photoShape === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-photo-shape]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custPhotoShape = btn.dataset.photoShape;
						save();
						renderAll();
					});
				});

				// Education Title & Subtitle Order
				app.querySelectorAll('[data-edu-order]').forEach(btn => {
					const currentVal = state.custEduOrder || 'degree-school';
					btn.classList.toggle('is-active', btn.dataset.eduOrder === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-edu-order]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custEduOrder = btn.dataset.eduOrder;
						save();
						renderAll();
					});
				});

				// Courses Title & Subtitle Order
				app.querySelectorAll('[data-courses-order]').forEach(btn => {
					const currentVal = state.custCoursesOrder || 'title-institution';
					btn.classList.toggle('is-active', btn.dataset.coursesOrder === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-courses-order]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custCoursesOrder = btn.dataset.coursesOrder;
						save();
						renderAll();
					});
				});

				// Awards Title & Subtitle Order
				app.querySelectorAll('[data-awards-order]').forEach(btn => {
					const currentVal = state.custAwardsOrder || 'title-issuer';
					btn.classList.toggle('is-active', btn.dataset.awardsOrder === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-awards-order]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custAwardsOrder = btn.dataset.awardsOrder;
						save();
						renderAll();
					});
				});

				// Publications Title & Subtitle Order
				app.querySelectorAll('[data-publications-order]').forEach(btn => {
					const currentVal = state.custPublicationsOrder || 'title-publisher';
					btn.classList.toggle('is-active', btn.dataset.publicationsOrder === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-publications-order]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custPublicationsOrder = btn.dataset.publicationsOrder;
						save();
						renderAll();
					});
				});

				// Skills Layout selector
				app.querySelectorAll('[data-skills-layout]').forEach(btn => {
					const currentVal = state.custSkillsLayout || 'grid';
					btn.classList.toggle('is-active', btn.dataset.skillsLayout === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-skills-layout]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custSkillsLayout = btn.dataset.skillsLayout;
						updateSkillsOptionViews(state.custSkillsLayout);
						save();
						renderAll();
					});
				});

				const updateSkillsOptionViews = (layout) => {
					app.querySelectorAll('.cv-skills-options-group').forEach(group => {
						group.classList.toggle('cv-hidden', group.dataset.skillsGroup !== layout);
					});
					const subinfoGroup = app.querySelector('.cv-skills-subinfo-group');
					if (subinfoGroup) {
						subinfoGroup.classList.toggle('cv-hidden', layout === 'grid' || layout === 'level');
					}
				};
				updateSkillsOptionViews(state.custSkillsLayout || 'grid');

				// Skills Grid columns
				app.querySelectorAll('[data-skills-cols]').forEach(btn => {
					const currentVal = state.custSkillsCols || 3;
					btn.classList.toggle('is-active', parseInt(btn.dataset.skillsCols, 10) === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-skills-cols]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custSkillsCols = parseInt(btn.dataset.skillsCols, 10);
						save();
						renderAll();
					});
				});

				// Skills Row Spacing
				app.querySelectorAll('[data-skills-row-space]').forEach(btn => {
					const currentVal = state.custSkillsRowSpace || 'tight';
					btn.classList.toggle('is-active', btn.dataset.skillsRowSpace === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-skills-row-space]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custSkillsRowSpace = btn.dataset.skillsRowSpace;
						save();
						renderAll();
					});
				});

				// Skills Row Bullets toggle
				const rowBulletsChk = app.querySelector('#cv-skills-row-bullets');
				if (rowBulletsChk) {
					rowBulletsChk.checked = !!state.custSkillsRowBullets;
					rowBulletsChk.addEventListener('change', () => {
						state.custSkillsRowBullets = rowBulletsChk.checked;
						save();
						renderAll();
					});
				}

				// Skills Hide Stars toggle
				const skillsHideStarsChk = app.querySelector('#cv-skills-hide-stars');
				if (skillsHideStarsChk) {
					skillsHideStarsChk.checked = !!state.hideSkillsStars;
					skillsHideStarsChk.addEventListener('change', () => {
						state.hideSkillsStars = skillsHideStarsChk.checked;
						save();
						renderAll();
					});
				}

				// Skills Separator
				app.querySelectorAll('[data-skills-sep]').forEach(btn => {
					const currentVal = state.custSkillsSep || 'bullet';
					btn.classList.toggle('is-active', btn.dataset.skillsSep === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-skills-sep]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custSkillsSep = btn.dataset.skillsSep;
						save();
						renderAll();
					});
				});

				// Skills Subinfo Style
				app.querySelectorAll('[data-skills-subinfo]').forEach(btn => {
					const currentVal = state.custSkillsSubinfo || 'colon';
					btn.classList.toggle('is-active', btn.dataset.skillsSubinfo === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-skills-subinfo]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custSkillsSubinfo = btn.dataset.skillsSubinfo;
						save();
						renderAll();
					});
				});

				// Certificates Order
				app.querySelectorAll('[data-cert-order]').forEach(btn => {
					const currentVal = state.custCertOrder || 'name-issuer';
					btn.classList.toggle('is-active', btn.dataset.certOrder === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-cert-order]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custCertOrder = btn.dataset.certOrder;
						save();
						renderAll();
					});
				});

				// Languages Layout selector
				app.querySelectorAll('[data-lang-layout]').forEach(btn => {
					const currentVal = state.custLangLayout || 'grid';
					btn.classList.toggle('is-active', btn.dataset.langLayout === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-lang-layout]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custLangLayout = btn.dataset.langLayout;
						updateLangOptionViews(state.custLangLayout);
						save();
						renderAll();
					});
				});

				const updateLangOptionViews = (layout) => {
					app.querySelectorAll('.cv-lang-options-group').forEach(group => {
						group.classList.toggle('cv-hidden', group.dataset.langGroup !== layout);
					});
					const subinfoGroup = app.querySelector('.cv-lang-subinfo-group');
					if (subinfoGroup) {
						subinfoGroup.classList.toggle('cv-hidden', layout === 'grid' || (layout === 'level' && state.custLangLevelStyle !== 'text'));
					}
				};
				updateLangOptionViews(state.custLangLayout || 'grid');

				// Languages Grid columns
				app.querySelectorAll('[data-lang-cols]').forEach(btn => {
					const currentVal = state.custLangCols || 3;
					btn.classList.toggle('is-active', parseInt(btn.dataset.langCols, 10) === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-lang-cols]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custLangCols = parseInt(btn.dataset.langCols, 10);
						save();
						renderAll();
					});
				});

				// Languages Row Spacing
				app.querySelectorAll('[data-lang-row-space]').forEach(btn => {
					const currentVal = state.custLangRowSpace || 'tight';
					btn.classList.toggle('is-active', btn.dataset.langRowSpace === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-lang-row-space]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custLangRowSpace = btn.dataset.langRowSpace;
						save();
						renderAll();
					});
				});

				// Languages Row Bullets toggle
				const langRowBulletsChk = app.querySelector('#cv-lang-row-bullets');
				if (langRowBulletsChk) {
					langRowBulletsChk.checked = !!state.custLangRowBullets;
					langRowBulletsChk.addEventListener('change', () => {
						state.custLangRowBullets = langRowBulletsChk.checked;
						save();
						renderAll();
					});
				}

				// Languages Hide Stars toggle
				const langHideStarsChk = app.querySelector('#cv-lang-hide-stars');
				if (langHideStarsChk) {
					langHideStarsChk.checked = !!state.hideLangStars;
					langHideStarsChk.addEventListener('change', () => {
						state.hideLangStars = langHideStarsChk.checked;
						save();
						renderAll();
					});
				}

				// Languages Separator
				app.querySelectorAll('[data-lang-sep]').forEach(btn => {
					const currentVal = state.custLangSep || 'bullet';
					btn.classList.toggle('is-active', btn.dataset.langSep === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-lang-sep]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custLangSep = btn.dataset.langSep;
						save();
						renderAll();
					});
				});

				// Languages Level Style
				app.querySelectorAll('[data-lang-level-style]').forEach(btn => {
					const currentVal = state.custLangLevelStyle || 'text';
					btn.classList.toggle('is-active', btn.dataset.langLevelStyle === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-lang-level-style]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custLangLevelStyle = btn.dataset.langLevelStyle;
						updateLangOptionViews(state.custLangLayout);
						save();
						renderAll();
					});
				});

				// Languages Subinfo Style
				app.querySelectorAll('[data-lang-subinfo]').forEach(btn => {
					const currentVal = state.custLangSubinfo || 'colon';
					btn.classList.toggle('is-active', btn.dataset.langSubinfo === currentVal);
					btn.addEventListener('click', () => {
						btn.parentElement.querySelectorAll('[data-lang-subinfo]').forEach(b => b.classList.remove('is-active'));
						btn.classList.add('is-active');
						state.custLangSubinfo = btn.dataset.langSubinfo;
						save();
						renderAll();
					});
				});

				// Section Customizations Collapsible Trigger
				const secCustTrigger = app.querySelector('#cv-cust-sections-customize-trigger');
				const secCustContent = app.querySelector('#cv-cust-sections-customize-content');
				if (secCustTrigger && secCustContent) {
					secCustTrigger.addEventListener('click', () => {
						const isExpanded = secCustTrigger.classList.toggle('is-expanded');
						secCustContent.classList.toggle('cv-hidden', !isExpanded);
					});
				}
			};

			bindCvUpload('.cv-btn-upload', '#cv-upload-input', '#cv-upload-status');
			bindCvUpload('.cv-btn-upload-workspace', '#cv-upload-input-workspace', '#cv-upload-status-workspace');

			initCustomizer();
			initRichEditors();
			renderAll();
			queuePreviewLayoutSync();

			if (window.location.search.includes('debug=true')) {
				setTimeout(() => {
					try {
						const previewNode = app.querySelector('.cv-preview[data-preview]');
						let debugText = '';
						if (previewNode) {
							debugText += `Active layout pageCount: ${previewNode.style.getPropertyValue('--page-count') || 'not set'}\n`;
							debugText += `Active layout height: ${previewNode.style.height || 'not set'}\n`;
							debugText += `CSS --cv-font-scale-body: ${window.getComputedStyle(previewNode).getPropertyValue('--cv-font-scale-body') || 'not set'}\n`;
							debugText += `CSS --cv-font-scale-title: ${window.getComputedStyle(previewNode).getPropertyValue('--cv-font-scale-title') || 'not set'}\n`;
							const sections = previewNode.querySelectorAll('.cv-preview-section');
							sections.forEach((sec, idx) => {
								const h3 = sec.querySelector('h3');
								const h3Text = h3 ? h3.innerText.trim() : 'NO H3';
								const secTop = getElementOffsetWithin(sec, previewNode);
								debugText += `SECTION ${idx + 1} (${h3Text}):\n`;
								debugText += `  Section offsetTop: ${sec.offsetTop}, offsetTopRelative: ${secTop}, offsetHeight: ${sec.offsetHeight}, marginTop: "${sec.style.marginTop}"\n`;
								if (h3) {
									const h3Top = getElementOffsetWithin(h3, previewNode);
									debugText += `    H3 offsetTopRelative: ${h3Top}, offsetHeight: ${h3.offsetHeight}, marginTop: "${h3.style.marginTop}"\n`;
								}
								sec.querySelectorAll('.cv-preview-item').forEach((item, itemIdx) => {
									const itemTop = getElementOffsetWithin(item, previewNode);
									debugText += `    Item ${itemIdx + 1} offsetTopRelative: ${itemTop}, offsetHeight: ${item.offsetHeight}, marginTop: "${item.style.marginTop}"\n`;
									item.querySelectorAll('li').forEach((li, lIdx) => {
										const liTop = getElementOffsetWithin(li, previewNode);
										debugText += `      Bullet ${lIdx + 1} offsetTopRelative: ${liTop}, offsetHeight: ${li.offsetHeight}, marginTop: "${li.style.marginTop}", text: "${li.innerText.trim().substring(0, 70)}"\n`;
									});
								});
								sec.querySelectorAll('.cv-language-list, .cv-language-chip, .cv-lang-row-item, .cv-lang-grid-item').forEach((lang, langIdx) => {
									const langTop = getElementOffsetWithin(lang, previewNode);
									debugText += `    Lang/List ${langIdx + 1} tagName: ${lang.tagName}, class: "${lang.className}", offsetTopRelative: ${langTop}, offsetHeight: ${lang.offsetHeight}, marginTop: "${lang.style.marginTop}"\n`;
								});
							});
						} else {
							debugText = 'Error: .cv-preview[data-preview] not found!';
						}
						if (collectedErrors.length > 0) {
							debugText += `\nCOLLECTED ERRORS:\n${collectedErrors.join('\n')}\n`;
						}
						document.body.innerHTML = '<pre id="dom-debug-output">' + debugText + '</pre>';
					} catch (e) {
						document.body.innerHTML = 'Error: ' + e.message;
					}
				}, 1000);
			}
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initApp);
	} else {
		initApp();
	}
})();

// Thumbnail capture handler — capture page one from the same rendered A4 used
// by Preview.  Capturing the full multi-page paper compresses every page into a
// single library card, while capturing a synthetic clone loses template styles.
window.addEventListener('message', async function (event) {
	if (!event.data || event.data.type !== 'medbiomate-capture-thumbnail') return;
	if (!window.parent || window.parent === window) return;
	let previewColumn = null;
	let previewColumnStyle = null;
	let sheet = null;
	let sheetStyle = null;
	let paper = null;
	let paperStyle = null;
	try {
		const app = document.querySelector('[data-cv-builder]');
		const col = app && app.querySelector('.cv-workspace-preview-column');
		previewColumn = col;
		// Let pending field changes rebuild the live paper before taking the image.
		window.dispatchEvent(new Event('cv-refresh-preview'));
		await new Promise(resolve => { requestAnimationFrame(() => requestAnimationFrame(resolve)); });
		sheet = col && col.querySelector('.cv-preview-sheet-container[data-page-number="1"]');
		if (!sheet) sheet = col && col.querySelector('.cv-preview-sheet-container');
		paper = sheet && sheet.querySelector('[data-preview]');
		if (!sheet || !paper) {
			window.parent.postMessage({ type: 'medbiomate-thumbnail-result', image: '' }, '*');
			return;
		}
		await document.fonts.ready;
		window.__medbiomateThumbnailCaptureActive = true;
		document.body.classList.add('cv-thumbnail-capture-mode');
		// Content mode hides the preview column on mobile. Render the real first
		// page at its authored 800px A4 width, off-screen, without changing views.
		previewColumnStyle = col.getAttribute('style');
		sheetStyle = sheet.getAttribute('style');
		paperStyle = paper.getAttribute('style');
		col.style.setProperty('display', 'block', 'important');
		col.style.setProperty('position', 'fixed', 'important');
		col.style.setProperty('left', '-10000px', 'important');
		col.style.setProperty('top', '0', 'important');
		col.style.setProperty('width', '800px', 'important');
		col.style.setProperty('height', '1132px', 'important');
		col.style.setProperty('padding', '0', 'important');
		col.style.setProperty('overflow', 'hidden', 'important');
		col.style.setProperty('visibility', 'visible', 'important');
		col.style.setProperty('pointer-events', 'none', 'important');
		sheet.style.setProperty('display', 'block', 'important');
		sheet.style.setProperty('position', 'relative', 'important');
		sheet.style.setProperty('width', '800px', 'important');
		sheet.style.setProperty('min-width', '800px', 'important');
		sheet.style.setProperty('max-width', '800px', 'important');
		sheet.style.setProperty('height', '1132px', 'important');
		sheet.style.setProperty('min-height', '1132px', 'important');
		sheet.style.setProperty('max-height', '1132px', 'important');
		sheet.style.setProperty('margin', '0', 'important');
		sheet.style.setProperty('overflow', 'hidden', 'important');
		sheet.style.setProperty('transform', 'none', 'important');
		sheet.style.setProperty('box-shadow', 'none', 'important');
		sheet.style.setProperty('border-radius', '0', 'important');
		sheet.style.setProperty('background', '#ffffff', 'important');
		sheet.style.setProperty('transition', 'none', 'important');
		const pageCount = Math.max(1, parseFloat(getComputedStyle(sheet).getPropertyValue('--page-count')) || 1);
		paper.style.setProperty('width', '800px', 'important');
		paper.style.setProperty('min-width', '800px', 'important');
		paper.style.setProperty('max-width', '800px', 'important');
		paper.style.setProperty('height', (1131.4 * pageCount) + 'px', 'important');
		paper.style.setProperty('transform', 'none', 'important');
		paper.style.setProperty('transform-origin', 'top left', 'important');
		paper.style.setProperty('top', '0', 'important');
		paper.style.setProperty('left', '0', 'important');

		// Wait for the template, web fonts and profile photo to settle.
		const images = Array.from(sheet.querySelectorAll('img'));
		await Promise.race([
			Promise.all(images.map(image => {
				if (image.complete) return typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve();
				return new Promise(resolve => {
					image.addEventListener('load', resolve, { once: true });
					image.addEventListener('error', resolve, { once: true });
				});
			})),
			new Promise(resolve => setTimeout(resolve, 1500))
		]);
		await new Promise(resolve => { requestAnimationFrame(() => requestAnimationFrame(resolve)); });
		let source;
		try {
			// Capture the authored A4 paper itself. Capturing its responsive viewport
			// can preserve the editor's narrower on-screen width and leave a large
			// blank strip on the right side of library thumbnails.
			source = await html2canvas(paper, { scale: 1, useCORS: true, backgroundColor: '#ffffff', logging: false, width: 800, height: 1132, windowWidth: 1440, windowHeight: 1200 });
		} catch (e) {
			source = await html2canvas(paper, { scale: 1, useCORS: false, backgroundColor: '#ffffff', logging: false, width: 800, height: 1132, windowWidth: 1440, windowHeight: 1200, ignoreElements: el => el.tagName === 'IMG' });
		}
		// Create thumbnail canvas.
		const thumb = document.createElement('canvas');
		thumb.width = 400; thumb.height = 566;
		const ctx = thumb.getContext('2d');
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, 400, 566);
		ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, 400, 566);
		const pixels = ctx.getImageData(0, 0, 400, 566).data;
		let visibleSamples = 0;
		let sampleCount = 0;
		for (let y = 0; y < 566; y += 8) {
			for (let x = 0; x < 400; x += 8) {
				const offset = (y * 400 + x) * 4;
				sampleCount++;
				if (pixels[offset] < 242 || pixels[offset + 1] < 242 || pixels[offset + 2] < 242) visibleSamples++;
			}
		}
		if (visibleSamples / sampleCount < 0.008) {
			window.parent.postMessage({ type: 'medbiomate-thumbnail-result', image: '' }, '*');
			return;
		}
		let result = '';
		try {
			result = thumb.toDataURL('image/jpeg', 0.88);
		} catch (taintErr) {
			console.warn('Thumbnail canvas tainted, retrying without external images:', taintErr);
			try {
				const cleanSource = await html2canvas(paper, { scale: 1, useCORS: false, backgroundColor: '#ffffff', logging: false, width: 800, height: 1132, windowWidth: 1440, windowHeight: 1200, ignoreElements: el => el.tagName === 'IMG' });
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, 400, 566);
				ctx.drawImage(cleanSource, 0, 0, cleanSource.width, cleanSource.height, 0, 0, 400, 566);
				result = thumb.toDataURL('image/jpeg', 0.88);
			} catch (cleanErr) {
				result = '';
			}
		}
		window.parent.postMessage({ type: 'medbiomate-thumbnail-result', image: result.length > 1000 ? result : '' }, '*');
	} catch (err) {
		console.warn('Iframe thumbnail capture failed:', err);
		window.parent.postMessage({ type: 'medbiomate-thumbnail-result', image: '' }, '*');
	} finally {
		document.body.classList.remove('cv-thumbnail-capture-mode');
		if (paper) {
			if (paperStyle === null) paper.removeAttribute('style');
			else paper.setAttribute('style', paperStyle);
		}
		if (sheet) {
			if (sheetStyle === null) sheet.removeAttribute('style');
			else sheet.setAttribute('style', sheetStyle);
		}
		if (previewColumn) {
			if (previewColumnStyle === null) previewColumn.removeAttribute('style');
			else previewColumn.setAttribute('style', previewColumnStyle);
		}
		window.__medbiomateThumbnailCaptureActive = false;
		window.dispatchEvent(new Event('resize'));
	}
});
