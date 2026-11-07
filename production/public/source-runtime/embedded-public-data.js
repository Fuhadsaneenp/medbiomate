// Reuse only the anonymous payload rendered for this exact URL, once.
export function takeEmbeddedPublicData(document,id,search){
 const node=document.getElementById(id);if(!node)return null;
 try{const embedded=JSON.parse(node.textContent);if(embedded.search!==search)return null;node.remove();return embedded.value;}catch{return null;}
}
