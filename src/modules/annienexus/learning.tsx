"use client";
import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import resources from "./published-learning-resources.json";
export type LearningDocument={id:string;title:string;group:string;horizon:string;source:string;workspace:string;importedAt:string;status:string;sha256:string;originalSha256?:string;publishedAt?:string;body:string};
type Resource={kind:string;id?:string;url?:string};
const resourceMap=resources as Record<string,Record<string,Resource>>;
import { Tag } from "../../shared/ui/primitives";
import { Icon } from "../../shared/ui/icons";
import { NotebookTransfer } from "../../shared/ui/notebook-transfer";
import { visibleLearningNotes } from "../../shared/learning-scope";
import { useNotebook, useNotebookActions } from "../../shared/ui/notebook";
const displayText=(s:string)=>s.replace(/Gregory(?: Trejo)?/g,"el docente");
const fold=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const topics=[{name:"Economía",icon:"trend",query:"crecimiento"},{name:"Bonos y tipos",icon:"coins",query:"bono"},{name:"Índices",icon:"bars",query:"índices"},{name:"Tesis y evidencia",icon:"source",query:"tesis"}];
export function Learning({library,initialLesson="source-14"}:{library:LearningDocument[];initialLesson?:string}){
 const documents=library;
 const [selected,setSelected]=useState(initialLesson),[query,setQuery]=useState(""),[topic,setTopic]=useState(""),[draft,setDraft]=useState(""),[message,setMessage]=useState("");
 const {saveNote,removeNote,local:localNotebook,error:noteError,ready:notesReady}=useNotebookActions();
 const [saving,setSaving]=useState(false);
 const allNotes=useNotebook();const notes=visibleLearningNotes(allNotes);const lesson=documents.find(d=>d.id===selected)??documents[0];
 const filtered=useMemo(()=>documents.filter(d=>fold(d.title+" "+d.body).includes(fold(query))),[query,documents]);
 const position=documents.findIndex(d=>d.id===lesson.id);
 async function save(e:React.FormEvent){e.preventDefault();if(saving)return;setSaving(true);try{await saveNote(draft,lesson.title);setDraft("");setMessage(localNotebook?"Apunte guardado en este navegador.":"Apunte guardado en tu cuenta.");}catch(error){setMessage(error instanceof Error?error.message:"No se pudo guardar. Conserva tu texto antes de salir.");}finally{setSaving(false);}}
 async function bookmark(){if(saving)return;setSaving(true);try{await saveNote("Concepto para repasar: "+lesson.title,lesson.title);setMessage("Concepto guardado en Mis apuntes.");}catch(error){setMessage(error instanceof Error?error.message:"No se pudo guardar el concepto.");}finally{setSaving(false);}}
 return <main className="main-content learning-page" id="main-content">
  <div className="page-heading"><div><h1>Comprender. Conectar. Recordar.</h1><p className="lead">Aprende el concepto y guarda cómo cambia tu lectura del mercado.</p></div><Tag>{library.length} DOCUMENTOS SELECCIONADOS</Tag></div>
  <div className="learning-layout">
   <aside className="panel library"><h2>Biblioteca</h2><div className="search-field"><Icon name="search" size={23}/><input className="search-input" aria-label="Buscar en los apuntes" placeholder="Buscar un concepto" value={query} onChange={e=>setQuery(e.target.value)}/></div>
    <div className="library-topics" role="group" aria-label="Tema de estudio">{topics.map(t=><button key={t.name} aria-pressed={topic===t.name} onClick={()=>{setTopic(t.name);setQuery(t.query);if(t.name==="Bonos y tipos")setSelected("source-5");}}><Icon name={t.icon} size={26}/><span>{t.name}</span><Icon name="chevron" size={20}/></button>)}</div>
    <div className="library-docs-heading"><h3>Apuntes documentados</h3><p>Solo apuntes recibidos del curso.</p></div>
    <div className="library-items">{filtered.map(doc=><button key={doc.id} aria-current={selected===doc.id} onClick={()=>setSelected(doc.id)}><Icon name="source" size={23}/><div><small>{displayText(doc.group).toUpperCase()}</small><span>{displayText(doc.title)}</span></div><Icon name="chevron" size={17}/></button>)}{!filtered.length&&<p className="small muted">No hay apuntes que coincidan con esta búsqueda.</p>}</div>
    <p className="library-horizon">Horizonte: semanas y meses.<br/>Mentorías 1–4, clase 6 (archivo 5), 7 y 8.<br/>Mentoría 9 en curso. La sesión de curva aparece una sola vez; conserva las etiquetas archivadas 5/6.</p>
   </aside>
   <article className="panel lesson-reader">
    <div className="lesson-breadcrumb"><span>{displayText(lesson.group)}</span><span>/</span><span>{lesson.horizon}</span></div><h2>{displayText(lesson.title)}</h2>
    <div className="markdown-reading" key={lesson.id}><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{h2:({children,node})=><h2 id={`tema-${node?.position?.start.line}`}>{children}</h2>,h1:({children})=><h2>{children}</h2>,a:({href,children})=>{const resource=resourceMap[lesson.id]?.[href??""];return href&&/^https?:\/\//.test(href)?<a href={href} target="_blank" rel="noreferrer">{children} ↗</a>:resource?.kind==="lesson"&&documents.some(d=>d.id===resource.id)?<button className="lesson-inline-link" onClick={()=>setSelected(resource.id!)}>{children}</button>:resource?.url?<a href={resource.url} target="_blank" rel="noreferrer">{children} ↗</a>:<span>{children}</span>;},img:({src,alt})=>{const resource=resourceMap[lesson.id]?.[typeof src==="string"?src:""];return resource?.url?<a href={resource.url} target="_blank" rel="noreferrer"><Image unoptimized src={resource.url} alt={alt??"Imagen del material original"} width={1200} height={800} sizes="(max-width:900px) 90vw, 800px" className="lesson-resource-image"/></a>:<span className="small muted">Recurso no disponible: {alt??"imagen"}</span>;},table:({children})=><div className="table-scroll"><table>{children}</table></div>}}>{displayText(lesson.body.replace(/^# [^\n]+\n+/,""))}</Markdown></div>
    <details className="source-details"><summary>Material de estudio · ver procedencia y estado</summary><p>{displayText(lesson.status)}</p><p>{lesson.workspace} · {lesson.source}</p><p>Fuente importada el {lesson.importedAt}; selección publicada el {lesson.publishedAt??"2026-10-02"}. Las cifras y referencias a «hoy» pertenecen al momento documentado. No hay sincronización automática.</p>{lesson.sha256&&<p className="micro">Huella de la selección: {lesson.sha256.slice(0,16)}…</p>}</details>
    <div className="lesson-navigation"><button className="button" disabled={position===0} onClick={()=>setSelected(documents[position-1].id)}><span>←</span>Anterior</button><button className="bookmark-button" disabled={saving||!notesReady} onClick={bookmark}><Icon name="bookmark" size={23}/>Guardar concepto</button><button className="button" disabled={position===documents.length-1} onClick={()=>setSelected(documents[position+1].id)}>Siguiente<Icon name="arrow" size={20}/></button></div>
   </article>
   <aside className="panel notes-panel"><div className="section-heading"><h2>Mis apuntes</h2><Tag tone="green">{localNotebook?"GUARDADO LOCAL":"CUENTA PRIVADA"}</Tag></div><p className="notes-description">Apuntes personales vinculados a las lecciones seleccionadas. No se atribuyen al docente.</p><form onSubmit={save}><label className="sr-only" htmlFor="note">¿Qué entendí y qué necesito comprobar?</label><textarea id="note" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={5000} rows={7} placeholder="¿Qué entendí y qué necesito comprobar?"/><button type="submit" className="button primary" disabled={!draft.trim()||saving||!notesReady}>{saving?"Guardando…":"Guardar apunte"}</button><p role="status">{message}</p></form>
    <p role="status">{noteError||(!notesReady?"Cargando tus apuntes…":"")}</p><NotebookTransfer/>{allNotes.length>notes.length&&<p className="small muted">{allNotes.length-notes.length} apuntes fuera de esta selección siguen conservados en tu copia completa.</p>}<div className="saved-notes" aria-label="Apuntes guardados">{notes.length?notes.map(note=><article key={note.id}><div className="note-actions"><time dateTime={note.at}>{new Date(note.at).toLocaleDateString("es-ES")}</time><button onClick={async()=>{try{await removeNote(note.id);setMessage("Apunte eliminado.");}catch{setMessage("No se pudo eliminar el apunte.");}}} aria-label={"Eliminar apunte: "+note.text.slice(0,35)}>Eliminar</button></div><span className="micro">{note.topic}</span><p>{note.text}</p></article>):<div className="empty-notes"><strong>Para contrastar</strong><div className="question-card"><span>?</span><p>¿Suben los rendimientos por más crecimiento o por inflación persistente?</p><Tag>Ejemplo</Tag></div><p className="notes-local-info">{localNotebook?<>Guardados solo en este navegador.<br/>Sin sincronización en la nube.</>:<>Guardados en tu cuenta.<br/>Solo tú puedes ver estos apuntes.</>}</p></div>}</div>
   </aside>
  </div>
 </main>;
}
