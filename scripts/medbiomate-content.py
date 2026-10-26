"""Medbiomate-owned copy layered onto the reference UI structure."""
from pathlib import Path
import json,re
out=Path(__file__).resolve().parents[1]/'public/source-runtime'
p=out/'app.js';s=p.read_text()
s=s.replace("Find your next <span class=\"hero-title-gradient\">career move</span> in the UAE", "Get Hired for a Job <span class=\"hero-title-gradient\">You’ll Love</span>")
s=s.replace('Verified Opportunities Across UAE &amp; GCC','Healthcare Opportunities Across the GCC')
s=s.replace("Over <span class=\"hero-live-job-count\" data-live-job-count>${formattedCount}</span> Verified Jobs Across Dubai, Abu Dhabi & the GCC", "The Middle East’s Leading Healthcare Job Search Site")
s=s.replace('alt="Medbiomate UAE Professionals Team" width="1116" height="542"','alt="Medbiomate healthcare professionals" width="1330" height="2560"')
s=s.replace('/source-runtime/assets/hero-team.webp','/assets/ef24f6c52136a96fc1d3.webp')
for old,new in [('Accountant','Pharmacist'),('Software','Medical Coder'),('Sales','Physiotherapist'),('Driver','Lab Technologist')]:
 s=s.replace(f'<a class="trending-chip" href="/jobs?q={old}">{old}</a>',f'<a class="trending-chip" href="/jobs?q={new.replace(" ","%20")}">{new}</a>')
s=s.replace('BROWSE BY INDUSTRY','BROWSE BY SPECIALTY').replace('Explore thousands of active vacancies across top in-demand industries in the UAE','Explore healthcare opportunities across in-demand specialties in the GCC').replace("'Top Companies Hiring'","'Top Healthcare Employers'")
s=s.replace('Job for Anyone, Anywhere','Healthcare careers across the GCC').replace('Job for anyone, anywhere','Healthcare careers across the GCC')
s=s.replace('Register an Account to Start','Create your healthcare career profile').replace('Explore Over Thousands of Jobs','Explore healthcare opportunities').replace('Find the Most Suitable Company and Job','Connect with healthcare employers')
about='''function about(){return `<main><section class="subhero"><h1>About Medbiomate</h1></section><article class="content"><h2>Healthcare careers across the Middle East</h2><p>Medbiomate is a healthcare job platform connecting healthcare professionals with employers across Saudi Arabia, the UAE, Qatar, Kuwait, Oman, and Bahrain.</p><p>We focus on opportunities for doctors, nurses, pharmacists, allied health professionals, and healthcare administrative and support teams.</p><h2>Our mission</h2><p>Help healthcare professionals find relevant opportunities and make it easier for healthcare employers to reach qualified candidates across the GCC.</p><h2>How we work</h2><p>We identify healthcare vacancies, review job information, and publish opportunities with the available employer and application details. You can explore roles by specialty, company, or location and follow the application instructions on each listing.</p><h2>Your next step</h2><p>Explore healthcare jobs, compare employers, and create a professional résumé using Medbiomate’s resume builder.</p><a class="primary" href="/jobs">Explore healthcare jobs</a></article></main>`}'''
a=s.index('function about(){');b=s.index('\nfunction ',a+10);s=s[:a]+about+s[b:]
faqs=[['What is Medbiomate?','Medbiomate is a healthcare job platform connecting professionals with healthcare employers across the GCC.'],['Which countries does Medbiomate cover?','Explore healthcare opportunities across Saudi Arabia, the United Arab Emirates, Qatar, Kuwait, Oman, and Bahrain.'],['What types of healthcare jobs are available?','Listings include nursing, medical, pharmacy, allied health, healthcare administration, and support roles.'],['Is Medbiomate free for job seekers?','Job seekers can browse healthcare jobs and follow the application details provided on each listing.'],['How do I apply for a job?','Open the job listing, review its requirements, and follow the employer’s application link or email instructions.'],['How can I contact Medbiomate?','Email info@medbiomate.com or text +91 8606 799 432 for assistance.']]
a=s.index('function faq(){');b=s.index('\nfunction ',a+10)
s=s[:a]+'''function faq(){const items='''+json.dumps(faqs)+''';return `<main><section class="subhero"><h1>Frequently Asked Questions</h1></section><div class="content faq"><h2>Using Medbiomate</h2>${items.map(([question,answer])=>`<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}</div></main>`}'''+s[b:]
s=s.replace('<b>Email</b><br>info@medbiomate.com</p>','<b>Email</b><br><a href="mailto:info@medbiomate.com">info@medbiomate.com</a></p><p><b>Text us</b><br><a href="https://wa.me/918606799432">+91 8606 799 432</a></p>')
s=s.replace('our gateway to limitless career opportunities in the UAE and beyond','healthcare career platform across the GCC')
s=s.replace('We are Konets, and this is not just a job portal—we’re your gateway to limitless career opportunities in the UAE and beyond.','We connect healthcare professionals with employers across the GCC.')
s=s.replace('We are Konets','We are Medbiomate')
# The database is the only source for fallback category labels/counts.
a=s.index('const defaultTopCategories = [');b=s.index('];',a)+2;s=s[:a]+'const defaultTopCategories = [];'+s[b:]
p.write_text(s)
# Retain reference menu markup while making every category healthcare-specific.
p=out/'site-header.js';s=p.read_text()
replacements={
'Accounting & Finance':'Pharmacy Jobs','/category/accounting-or-finance':'/category/pharmacy-jobs',
'Education & Training':'Specialist Doctors','/category/education-and-training':'/category/specialist-doctor-jobs',
'Administration':'Healthcare Administration','/category/administration':'/category/administration-jobs',
'IT & Software':'Biomedical Jobs','/jobs?q=IT':'/category/biomedical-jobs','Tech & Systems':'Healthcare Technology',
'Marketing & Sales':'Allied Health','/category/marketing-and-sales':'/category/physiotherapist-jobs',
'Human Resource':'Medical Laboratories','/category/human-resource':'/category/medical-laboratory-jobs',
'Find Your Role in UAE':'Find Your Healthcare Role','Verified vacancies from top hospitals, schools & enterprises.':'Healthcare opportunities from hospitals, clinics and medical employers.',
'Schools & Academies':'Medical Centres','Educational+Services':'Medical+Center','Educational Services':'Medical Center',
'Corporate Groups':'Healthcare Groups','Corporate+Group':'Healthcare+Group',
'Banking & Financial':'Pharmacies & Pharma','Banking':'Pharmacy',
'IT & Technology':'Medical Equipment','Information+Technology':'Medical+Equipment+Company',
'Retail & Aviation':'Home Healthcare','Retail':'Home+Health+Care',
'Government Entities':'Healthcare Providers','Government':'Healthcare+Group',
'Top Employers in UAE':'Healthcare Employers Across the GCC',
'Explore verified hiring companies, direct career pages & hospital networks.':'Explore healthcare employers, company profiles and their available opportunities.'}
for old,new in replacements.items():s=s.replace(old,new)
p.write_text(s)
p=out/'site-footer.js';s=p.read_text();a=s.index('const footerGuideRows = [');b=s.index('\n];',a)+3
columns=[('Nursing Jobs',[('Nurse Jobs','nurse-jobs'),('Registered Nurse Jobs','registered-nurse-jobs'),('Staff Nurse','staff-nurse'),('School Nurse Jobs','school-nurse-jobs'),('Home Nurse Jobs','home-nurse-jobs')]),('Doctors & Specialists',[('Specialist Doctor Jobs','specialist-doctor-jobs'),('Consultant Doctor Jobs','consultant-doctor-jobs'),('General Practitioner Jobs','general-practitioner-jobs'),('Dentist Jobs','dentist-jobs'),('Radiologist Jobs','radiologist-jobs')]),('Pharmacy & Allied Health',[('Pharmacy Jobs','pharmacy-jobs'),('Pharmacist Jobs','pharmacist-jobs'),('Physiotherapist Jobs','physiotherapist-jobs'),('Medical Laboratory Jobs','medical-laboratory-jobs'),('Biomedical Jobs','biomedical-jobs')]),('Healthcare Support',[('Medical Coder Jobs','medical-coder-jobs'),('Insurance Coordinator Jobs','insurance-coordinator-jobs'),('Medical Insurance Jobs','medical-insurance-jobs'),('Administration Jobs','administration-jobs'),('Healthcare Assistant Jobs','healthcare-assistant-jobs')])]
rows=[{'id':'job-categories','defaultOpen':True,'columns':[{'title':title,'links':[{'label':label,'url':'/category/'+slug} for label,slug in links]} for title,links in columns]}]
s=s[:a]+'const footerGuideRows = '+json.dumps(rows)+';'+s[b:]
s=s.replace('CAREERS ACROSS THE UAE & GCC','HEALTHCARE CAREERS ACROSS THE GCC').replace('Discover verified roles or find qualified professionals for your growing team.','Discover healthcare roles or connect with qualified professionals for your healthcare team.')
p.write_text(s)
p=out/'medbiomate-brand.css';s=p.read_text()+'''
/* Original Medbiomate illustration is a tall asset; show its healthcare team without the empty area. */
.hero-minimal-image-wrap{width:min(560px,100%);height:230px;margin:30px auto 0;overflow:hidden;position:relative}
.hero-minimal-image-wrap .hero-minimal-image{position:absolute;display:block;width:560px!important;max-width:none!important;height:auto!important;max-height:none!important;left:50%;bottom:-90px;transform:translateX(-50%);margin:0!important;filter:brightness(1.065)}
@media(max-width:600px){.hero-minimal-image-wrap{height:190px}.hero-minimal-image-wrap .hero-minimal-image{width:420px!important;bottom:-68px}}
''';p.write_text(s)
p=out/'shell.html';p.write_text(p.read_text().replace('/source-runtime/assets/hero-team.webp','/assets/ef24f6c52136a96fc1d3.webp'))

p=out/'app.js';s=p.read_text()
a=s.index('const companyTaglineMap = {');b=s.index('};',a)+2;s=s[:a]+'const companyTaglineMap = {};'+s[b:]
s=s.replace("pageTitle='Jobs in UAE'","pageTitle='Healthcare Jobs Across the GCC'").replace("allJobs && !cat ? 'Jobs in UAE'","allJobs && !cat ? 'Healthcare Jobs'")
s=s.replace('Explore current job vacancies across Dubai, Abu Dhabi, Sharjah, and all UAE emirates with direct employer hiring.','Explore healthcare vacancies across the UAE, Saudi Arabia, Qatar, Kuwait, Oman, and Bahrain.')
s=s.replace('Create an ATS-friendly CV tailored for UAE roles.','Create a professional CV for healthcare opportunities across the GCC.')
s=s.replace('https://www.linkedin.com/company/medbiomate-team','https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.medbiomate.com%2Fjobs')
a=s.index('function medicalCoderClassPage() {');b=s.index('\nfunction ',a+10)
s=s[:a]+'''function medicalCoderClassPage(){return `<main><section class="subhero"><h1>Medical Coding Careers</h1><p>Explore medical coding opportunities with Medbiomate.</p></section><article class="content"><h2>Find your next healthcare role</h2><p>Browse medical coder, medical billing, insurance coordination, and healthcare administration jobs across the GCC.</p><div class="employer-coming-actions"><a class="primary" href="/category/medical-coder-jobs">Browse medical coder jobs</a><a class="outline" href="/resume-library">Build your résumé</a></div><h2>Need assistance?</h2><p>Contact Medbiomate at <a href="mailto:info@medbiomate.com">info@medbiomate.com</a> or <a href="https://wa.me/918606799432">+91 8606 799 432</a>.</p></article></main>`}
'''+s[b:]
p.write_text(s)
p=out/'site-header.js';s=p.read_text()
for old,new in [('Top UAE Banks','Pharmacy Employers'),('Tech Companies','Healthcare Equipment'),('Top Conglomerates','Home Healthcare Providers'),('Public Sector','Healthcare Employers')]:s=s.replace(old,new)
p.write_text(s)
p=out/'detail-pages.js';s=p.read_text();s=re.sub(r"const isBateel = [^;]+;",'const isBateel = false;',s);s=s.replace('is a leading employer operating across the UAE and GCC region, providing top-tier professional career opportunities, modern workplace culture, and continuous development for talent.','has a company profile on Medbiomate. Explore the available healthcare opportunities and employer information below.');p.write_text(s)

# Brand-native process icons replace the reference site's stock step photographs.
icons=[
 '<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M16 4h5M18.5 1.5v5"/>',
 '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 7v6M7 10h6"/>',
 '<path d="M4 22V5h16v17M8 5V2h8v3M1 22h22M10 22v-5h4v5M9 10h6M12 7v6"/>'
]
p=out/'app.js';s=p.read_text()
for i,paths in enumerate(icons,1):
 name=f'medbiomate-step-{i}.svg';(out/'assets'/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0066ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{paths}</svg>')
 s=s.replace(f'/source-runtime/assets/step-{i}.jpg',f'/source-runtime/assets/{name}')
p.write_text(s)

p=out/'location-tree.js';p.write_text((out.parent/'location-tree.js').read_text())
p=out/'app.js';s=p.read_text();s="import {locationTree} from './location-tree.js';\n"+s
a=s.index('export function sortUaeLocations(items) {');b=s.index('\nconst defaultLocations',a);s=s[:a]+'export function sortUaeLocations(items){return locationTree(items);}\n'+s[b:]
a=s.index('const defaultLocations = [');b=s.index('];',a)+2;s=s[:a]+'const defaultLocations = [];'+s[b:]
s=s.replace('return { name: val, label: val };',"return { name: val, label: val, depth:item.depth||0, country:item.isCountry };")
s=s.replace('data-value="${escapeAttr(opt.name)}" role="option"','data-value="${escapeAttr(opt.name)}" style="padding-left:${14+(opt.depth||0)*18}px" data-country="${opt.country?\'true\':\'false\'}" role="option"')
p.write_text(s)
p=out/'medbiomate-brand.css';p.write_text(p.read_text()+'\n.custom-select-option[data-country="true"]{font-weight:700;border-top:1px solid #e2e8f0;margin-top:5px;color:#0f172a}.custom-select-list{max-height:360px;overflow-y:auto}\n')

p=out/'site-footer.js';s=p.read_text().replace('alt="Medbiomate">','class="medbiomate-footer-logo" alt="Medbiomate">');p.write_text(s)
p=out/'medbiomate-brand.css';p.write_text(p.read_text()+'\n.site-footer-standard .medbiomate-footer-logo{filter:brightness(0) invert(1);opacity:1;object-fit:contain}\n')
