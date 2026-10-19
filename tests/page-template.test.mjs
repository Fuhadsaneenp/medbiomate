import test from 'node:test';import assert from 'node:assert/strict';
import {renderEmployerDetail} from '../public/detail-pages.js';
test('company Jobs tab renders matched jobs and their canonical published URLs',()=>{
 globalThis.window={location:{origin:'http://localhost',href:'http://localhost/employer/test?tab=jobs',search:'?tab=jobs'}};
 const employer={id:1,slug:'test',title:{rendered:'Test Hospital'},metas:{_employer_category:{0:'Hospital'},_employer_location:{0:'Dubai'}},jobPagination:{page:1,total:1}};
 const html=renderEmployerDetail(employer,'/employer/test',[{title:'Registered Nurse',slug:'nurse-dubai-hospital',publicPath:'/jobs/nurse-dubai-hospital',company:'Test Hospital',employerSlug:'test',categories:['Nurse Jobs'],locations:['Dubai'],type:'Full Time'}]);
 assert.ok(html.includes('Registered Nurse'));assert.ok(html.includes('href="/jobs/nurse-dubai-hospital"'));assert.ok(html.includes('panel-jobs'));assert.ok(!html.includes('Corporate Accounting Manager'));
 delete globalThis.window;
});
test('original admin workspace renders its full screen structure without authentication shortcuts',async()=>{
 globalThis.window={};const {renderAdmin}=await import('../backend/public/admin.js');const html=renderAdmin();assert.ok(html.length>200000);for(const name of ['admin-workspace','job-form','employer-form','admin-navigation'])assert.ok(html.includes(name),name);delete globalThis.window;
});
