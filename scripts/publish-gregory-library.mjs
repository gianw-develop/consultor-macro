// Produce a source-traceable teaching selection. Imported originals are immutable.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const originals=[...await read('src/modules/annienexus/library.json'),...await read('private/learning-sources/gregory-additions-2026-10-02.json')];
const whitelist=await read('scripts/gregory-teaching-sections.json');
const continuation=await read('private/learning-sources/gregory-m9-continuation-normalized.json');
const selectedIds=['source-14','source-12','source-3','source-4','source-5','source-13','source-0','source-1'];
const mentorships={'source-14':1,'source-12':2,'source-3':3,'source-4':4,'source-5':6,'source-13':7,'source-0':8,'source-1':9};
const trace=[],omissions=[];
const cutAfter={
 'Bloque 8 · Expansión temprana y activos favorecidos':'Interpretación práctica:',
 'Continuación recibida: expansión madura y contracción temprana':'Aclaraciones propias:',
 'Secuencia, choques y uso del CLI':'Lectura correcta:',
 'Secuencia idealizada de los cuadrantes':'Lectura simple:',
};
const omitParagraph=/^(?:Corrección|Correcciones|Correccion|Corrección para|\*\*(?:Corrección|Control de calidad|Separación temporal|Regla para|Matiz histórico|Hueco identificado)|Para ANNIE Nexus|Para Aninexus|Se registra la atribucion del material|Las fechas, máximos|Estos valores se conservan como material|Este marco encaja|Precisión indispensable|Precisión para Aninexus|Matiz:|La utilidad del ejemplo para Aninexus|La idea válida|La fecha de octubre de 2023 es sospechosa|El punto 7 introduce|Distinciones propias|Observaciones de lectura|Validación pendiente|Consulta del usuario|Lectura propia|Aclaracion para el usuario|Continuacion:|Continuar con|Pendiente:|Pregunta del usuario|No son cuatro brújulas|Fragmento recibido con repeticiones|Fragmento oral recibido|Fragmento recibido empieza|Original conservado|Original:|Nueva imagen aportada)/;
const exactOmissions=[
 ' Para este proyecto, esas conexiones solo se investigaran cuando ayuden a explicar Dow, S&P 500 o Nasdaq; no implica ampliar la operativa del proyecto.',
 ' Para Aninexus la fuente estadística primaria deberá seguir siendo la oficina oficial de estadísticas laborales de Estados Unidos, aunque FRED pueda utilizarse como distribuidor reproducible.',
 ' La precisión oficial sobre exclusión de aeronaves se conserva en el contraste del bloque anterior.',
 '; nuestra reserva sobre posibles proyectos no ejecutados permanece separada',
 ' Se conserva su propuesta de simplificación y nuestra advertencia previa sobre mirar qué componentes explican el agregado.',
 ' Esta hipótesis y sus límites ya están registrados; no se presenta como regla comprobada.',
 ' No sustituirlo silenciosamente por ECRI.',
 ' Conservar el plazo de «siguiente mes» como hipótesis del profesor, no como relación validada.',
 ' Se conserva como afirmación del material; no se adopta como certeza predictiva ni regla validada.',
 ' Se conserva como afirmación y valoración del curso; no como resultado de pruebas propias.',

 ' También plantea combinar la lectura macro de Gregory con la información de derivados del segundo mentor para estudiar el posicionamiento de participantes grandes.',
 ' Esta recomendación no se incorpora al modelo: identificar correctamente un régimen no elimina caídas, errores de clasificación ni riesgo de pérdidas. El apalancamiento requiere límites independientes.',
 ' Ese porcentaje no se incorpora como dato hasta encontrar evidencia que lo respalde.',
 ' La serie T10Y2Y de FRED es en realidad la diferencia entre **rendimientos**: rendimiento a 10 años menos rendimiento a 2 años.',
 ' Aninexus deberá añadir rendimientos reales, dólar, inflación, liquidez y demanda defensiva antes de concluir que el capital “migra” automáticamente a metales.',
];
const titles={'source-14':'Gregory · mentoría 1 · fundamento macro','source-12':'Gregory · mentoría 2 · indicadores adelantados','source-5':'Gregory · clase 6 · curva (archivo rotulado 5)','source-1':'Gregory · mentoría 9 · en curso'};
const published=[];
for(const id of selectedIds){
 const sourceId=id==='source-14'?'source-12':id;
 const original=originals.find(d=>d.id===sourceId);if(!original)throw new Error('Missing '+id);
 if(hash(original.body)!==original.sha256)throw new Error('Original hash changed '+id);
 const lines=original.body.split('\n');
 const boundary=lines.indexOf('## Continuación · selección de indicadores adelantados');
 if(sourceId==='source-12'&&boundary!==398)throw new Error('Review M1/M2 boundary');
 const headings=lines.flatMap((l,i)=>/^#{1,6} /.test(l)?[{i,heading:l.replace(/^#+ /,'')}]:[]);
 const chunks=[];
 for(let j=0;j<headings.length;j++){
  const {i,heading}=headings[j],end=headings[j+1]?.i??lines.length;
  if(id==='source-14'&&i>=boundary||id==='source-12'&&i<boundary)continue;
  if(!(whitelist[id]??[]).includes(heading)){omissions.push({id,start:i+1,end,heading,reason:'Fuera de la selección atribuible; original conservado'});continue;}
  const raw=lines.slice(i+1,end).join('\n').trim();let text=raw;
  if(cutAfter[heading]&&text.includes(cutAfter[heading]))text=text.slice(0,text.indexOf(cutAfter[heading])).trim();
  // Omit complete editorial paragraphs; never replace the teacher's claim with a correction.
  text=text.split(/\n\n+/).filter(p=>!omitParagraph.test(p)).join('\n\n');
  for(const phrase of exactOmissions)text=text.replaceAll(phrase,'');
  // Preserve only the two course columns; the third is explicitly the project's correction.
  if(heading==='Las cuatro formas presentadas')text=text.split('\n').map(l=>l.startsWith('|')?l.split('|').slice(0,3).join('|')+'|':l).join('\n');
  if(heading==='Inflación, energía, liquidez y tramo a 2 años')text=text.replace(/\n\n- si suben las expectativas[\s\S]*?protección contra energía cara\./,'');
  // Cross-course/intraday examples have no place in the public Gregory selection.
  text=text.split('\n').filter(l=>!/(?:hunab|junat|segundo mentor|\bGEX\b|GDOW → Dow Jones|hipótesis intradía|en operativa intradía|Su lenguaje de «all-in»|Estado de validación:|Hay un intercambio transcrito)/i.test(l)).join('\n');
  text=text.trim();if(!text)continue;
  const fragmentId=`${id}-L${i+1}`;
  chunks.push(`## ${heading}\n\n${text}`);
  trace.push({id,fragmentId,sourceId,mentoria:mentorships[id],source:original.source,start:i+1,end,heading,sourceFragmentSha256:hash(raw),publishedText:text,publishedFragmentSha256:hash(text),extractionOnly:true});
  if(text!==raw)omissions.push({id,start:i+1,end,heading,reason:'Se omitieron anotaciones editoriales o referencias fuera de alcance; sin sustituir la enseñanza',originalFragmentSha256:hash(raw)});
 }
 let preamble='Apuntes recibidos y atribuidos a Gregory. Son notas de escucha, no una transcripción literal ni un diagnóstico actual. Las cifras y referencias a «hoy» corresponden a la grabación.';
 if(id==='source-14')preamble+=' Tramo recuperado del archivo compartido con la mentoría 2, antes de su continuación.';
 if(id==='source-5')preamble+=' Catalogación: la grabación se titula «Clase 6» y el archivo se rotuló 5. Se conserva una sola sesión; falta resolver si existe una sesión independiente con la etiqueta 5.';
 if(id==='source-0')preamble+=' Parte de la nota se reconstruyó desde un resumen; la fuente primaria completa sigue pendiente de recuperar.';
 if(id==='source-1'){
  preamble+=' Mentoría 9 en curso. Incluye la continuación recibida el 30/09/2026; no acredita cierre ni una mentoría 10.';
  for(const [i,s] of continuation.sections.entries()){
   chunks.push(`## ${s.title}\n\n${s.body}`);
   trace.push({id,fragmentId:`m9-continuation-${i+1}`,mentoria:9,heading:s.title,source:'Course Lab · sesión 30/09/2026',evidence:s.evidence,normalization:continuation.normalization,publishedText:s.body,publishedFragmentSha256:hash(s.body)});
  }
 }
 const title=titles[id]??original.title;
 const body=`# ${title}\n\n${preamble}\n\n${chunks.join('\n\n')}`;
 if(/hunab|junat|\bGEX\b|síntesis editorial|Regla provisional para|Uso correcto en Aninexus/i.test(body))throw new Error('Out-of-scope material '+id);
 published.push({...original,id,title,group:'Gregory',publishedAt:'2026-10-02',originalSha256:original.sha256,sha256:hash(body),status:`Selección de apuntes atribuibles a Gregory. ${id==='source-1'?'Mentoría 9 en curso. ':''}Validaciones internas separadas; no acredita reglas automáticas validadas.`,body});
}
// Only received class images. Previous project-generated M9 diagrams are not course sources.
const workspace='/Users/gianw/Documents/ChatGPT/Wall Street Visual Intelligence';
const images=[
 {id:'source-0',source:'sources/course-images/gregory/mentoria-8/mapa-cuatro-regimenes.jpg',alt:'Mapa de los cuatro regímenes · material recibido de la mentoría 8'},
 ...['01-cpi-vs-sp500-1960-1983.jpg','02-sticky-ex-food-energy-shelter.jpg','03-sticky-ex-food-energy-shelter-wide.jpg','04-fed-funds-vs-wilshire-1971-1978.jpg','05-slide-sticky-price.jpg','06-slide-politica-fiscal.jpg'].map(f=>({id:'source-1',source:'model/repasos/imagenes/gregory-mentoria-9/'+f,alt:'Captura recibida en mentoría 9 · '+f.replace(/\.jpg$/,'')})),
];
const resources=Object.fromEntries(selectedIds.map(id=>[id,{}])),files=[];
await fs.mkdir('private/learning-published',{recursive:true});
for(const item of images){
 const bytes=await fs.readFile(path.join(workspace,item.source));const sha256=hash(bytes),file=sha256.slice(0,16)+'.jpg';
 // Retain a private immutable copy so regeneration doesn't depend on external asset paths.
 await fs.writeFile('private/learning/'+file,bytes);await fs.writeFile('private/learning-published/'+file,bytes);
 files.push({file,sha256,lessonId:item.id,source:item.source});resources[item.id][item.source]={kind:'image',url:'/api/learning/'+file};
 const doc=published.find(d=>d.id===item.id);const image=`\n\n![${item.alt}](${item.source})`;const at=doc.body.indexOf('## Continuación recibida · 2Y');doc.body=at>=0?doc.body.slice(0,at)+image+'\n\n'+doc.body.slice(at):doc.body+image;doc.sha256=hash(doc.body);
}
for(const name of await fs.readdir('private/learning-published'))if(!files.some(f=>f.file===name))await fs.unlink('private/learning-published/'+name);
await fs.writeFile('src/modules/annienexus/published-library.json',JSON.stringify(published,null,2)+'\n');
await fs.writeFile('src/modules/annienexus/published-learning-resources.json',JSON.stringify(resources,null,2)+'\n');
await fs.writeFile('src/modules/annienexus/published-learning-files.json',JSON.stringify(files,null,2)+'\n');
await fs.writeFile('src/modules/annienexus/published-learning-topics.json',JSON.stringify([...new Set(published.flatMap(d=>[d.title,originals.find(o=>o.id===(d.id==='source-14'?'source-12':d.id)).title]))],null,2)+'\n');
await fs.writeFile('docs/annienexus/gregory-publication-audit.json',JSON.stringify({date:'2026-10-02',policy:'Only received attributable teaching; validation remains internal; original IDs and originals preserved',coveredMentorships:[1,2,3,4,6,7,8,9],catalogueConflict:'Clase 6 = archivo rotulado 5; one session, independent 5 unresolved',inProgress:[9],pendingInventory:['Independent session 5','Complete primary source M8','M9 beyond opening question'],selectedIds,excludedIds:originals.filter(d=>!selectedIds.includes(d.id)).map(d=>d.id),sources:published.map(d=>({id:d.id,mentoria:mentorships[d.id],source:d.source,originalSha256:d.originalSha256,publishedSha256:d.sha256})),fragments:trace,omissions,files,originals:originals.map(d=>({id:d.id,sha256:hash(d.body)}))},null,2)+'\n');
console.log({documents:published.length,fragments:trace.length,images:files.length,openMentorship:9});
