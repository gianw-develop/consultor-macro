import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const library=JSON.parse(await fs.readFile('src/modules/annienexus/library.json','utf8'));
const provenance=JSON.parse(await fs.readFile('docs/annienexus/learning-provenance.json','utf8'));
const root=path.resolve('private/learning');await fs.mkdir(root,{recursive:true});
const allowed=['/Users/gianw/Documents/ChatGPT/Wall Street Visual Intelligence/','/Users/gianw/Documents/Wall Street Visual Intelligence/'];
const manifest=[];
const mappings={};
for(const doc of library){
 const source=provenance.find(p=>p.id===doc.id).source;const links={};
 for(const match of doc.body.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
  const href=match[1];if(/^(https?:|#|mailto:)/.test(href))continue;
  const [relative,fragment]=href.split('#');const file=await fs.realpath(path.resolve(path.dirname(source),decodeURIComponent(relative)));
  if(!allowed.some(dir=>file.startsWith(dir)))throw new Error('Resource outside approved project: '+file);
  const internal=provenance.find(p=>p.source===file);
  if(internal){links[href]={kind:'lesson',id:internal.id};continue;}
  if(!/\.(jpg|jpeg|png|webp|md|txt|pdf)$/i.test(file))throw new Error('Unsupported resource '+file);
  const bytes=await fs.readFile(file);const sha256=createHash('sha256').update(bytes).digest('hex');
  const filename=sha256.slice(0,16)+path.extname(file).toLowerCase();
  await fs.writeFile(path.join(root,filename),bytes);
  const url='/api/learning/'+filename;
  links[href]={kind:/\.(jpg|jpeg|png|webp)$/i.test(file)?'image':'file',url:url+(fragment?'#'+fragment:'')};
  if(!manifest.some(m=>m.sha256===sha256))manifest.push({source:file,url,sha256,bytes:bytes.length});
 }
 mappings[doc.id]=links;
}
await fs.writeFile('src/modules/annienexus/learning-resources.json',JSON.stringify(mappings,null,2)+'\n');
await fs.writeFile('docs/annienexus/learning-resources-provenance.json',JSON.stringify({importedAt:new Date().toISOString(),resources:manifest},null,2)+'\n');
console.log({resources:manifest.length,links:Object.values(mappings).reduce((n,links)=>n+Object.keys(links).length,0)});
