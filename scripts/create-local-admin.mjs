// Bootstrap only the isolated local preview. Read the password from hidden stdin.
import crypto from 'node:crypto';import {readFile,writeFile} from 'node:fs/promises';
if(process.env.NODE_ENV==='production')throw Error('Local-only bootstrap; use the production database account workflow.');
const [email,name='Medbiomate Admin']=process.argv.slice(2);if(!/^\S+@\S+\.\S+$/.test(email||''))throw Error('Usage: node scripts/create-local-admin.mjs EMAIL NAME (password on stdin)');
let password='';for await(const chunk of process.stdin)password+=chunk;password=password.trim();if(password.length<12)throw Error('Use at least 12 characters.');
const path=new URL('../backend/data/local-db.json',import.meta.url);let db={users:[],jobs:[],employers:[],posts:[],applications:[]};try{db=JSON.parse(await readFile(path,'utf8'))}catch{}if(db.users.some(u=>u.email===email))throw Error('Account already exists.');
const salt=crypto.randomBytes(16).toString('hex');db.users.push({id:crypto.randomUUID(),email,name,role:'Administrator',status:'active',passwordSalt:salt,passwordHash:crypto.scryptSync(password,salt,64).toString('hex'),createdAt:new Date().toISOString()});await writeFile(path,JSON.stringify(db,null,2),{mode:0o600});console.log('Local administrator created.');
