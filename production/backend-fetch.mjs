import {Readable,Writable} from 'node:stream';
// Server rendering uses the same API handler without opening a second public listener.
export function backendFetch(handler,url) {
 return new Promise((resolve,reject)=>{
  const parsed=new URL(url,'http://localhost');
  const req=Readable.from([]);Object.assign(req,{url:parsed.pathname+parsed.search,method:'GET',headers:{host:parsed.host},socket:{remoteAddress:'127.0.0.1'}});
  const chunks=[],headers=new Headers();
  const res=new Writable({write(chunk,encoding,done){chunks.push(Buffer.from(chunk));done()}});
  res.statusCode=200;
  res.setHeader=(name,value)=>{headers.set(name,String(value));return res};
  res.getHeader=name=>headers.get(name);
  res.writeHead=(status,values={})=>{res.statusCode=status;for(const [name,value]of Object.entries(values))res.setHeader(name,value);return res};
  res.on('error',reject);
  res.on('finish',()=>resolve(new Response([204,304].includes(res.statusCode)?null:Buffer.concat(chunks),{status:res.statusCode,headers})));
  Promise.resolve(handler(req,res)).catch(reject);
 });
}
