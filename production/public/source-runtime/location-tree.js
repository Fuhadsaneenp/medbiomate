const key=value=>String(value||'').trim().toLowerCase().replace(/^uae$/,'united arab emirates');
export function locationTree(items=[]){
 const rows=items.map(item=>typeof item==='string'?{name:item,slug:item}:item);const byId=new Map(rows.filter(r=>r.id).map(r=>[String(r.id),r]));const byName=new Map(rows.map(r=>[key(r.name),r]));
 const parentOf=row=>byId.get(String(row.parent))||byName.get(key(row.parent));
 const result=[],seen=new Set();
 const walk=(row,depth)=>{if(seen.has(row))return;seen.add(row);result.push({...row,depth,isCountry:depth===0});rows.filter(r=>parentOf(r)===row).sort((a,b)=>a.name.localeCompare(b.name)).forEach(child=>walk(child,depth+1));};
 const priority=['united arab emirates','saudi arabia','qatar','kuwait','oman','bahrain','egypt'];
 rows.filter(r=>!parentOf(r)).sort((a,b)=>{const ai=priority.indexOf(key(a.name)),bi=priority.indexOf(key(b.name));return (ai<0?99:ai)-(bi<0?99:bi)||a.name.localeCompare(b.name)}).forEach(row=>walk(row,0));rows.forEach(row=>walk(row,0));return result;
}
export function locationNames(items,selected){const tree=locationTree(items),index=tree.findIndex(r=>key(r.name)===key(selected));if(index<0)return [selected];const root=tree[index],names=[root.name];for(let i=index+1;i<tree.length&&tree[i].depth>root.depth;i++)names.push(tree[i].name);return names;}
