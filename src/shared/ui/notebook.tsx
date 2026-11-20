"use client";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { readNotebookBackup, mergeNotebookBackup, type NoteRecord } from "../notebook-backup";
export type NotebookEntry=NoteRecord;
const key="annienexus.notes.v1";
function subscribe(callback:()=>void){window.addEventListener("storage",callback);window.addEventListener("annienexus-notes",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("annienexus-notes",callback);};}
function snapshot(){try{return localStorage.getItem(key)??"";}catch{return "";}}
function localNotes(){const raw=snapshot();return raw?readNotebookBackup(JSON.stringify({version:1,notes:JSON.parse(raw)})):[];}
function write(notes:NotebookEntry[]){localStorage.setItem(key,JSON.stringify(notes));window.dispatchEvent(new Event("annienexus-notes"));}
type NotebookContextValue={notes:NoteRecord[];local:boolean;error:string;ready:boolean;saveNote:(text:string,topic:string)=>Promise<void>;removeNote:(id:string)=>Promise<void>;exportNotebook:()=>string;restoreNotebook:(raw:string)=>Promise<number>};
const NotebookContext=createContext<NotebookContextValue|null>(null);
export function NotebookProvider({children,local}:{children:React.ReactNode;local:boolean}){
 const pathname=usePathname(),raw=useSyncExternalStore(subscribe,snapshot,()=>"");
 const [cloud,setCloud]=useState<NoteRecord[]|null>(null),[error,setError]=useState("");
 const localState=useMemo(()=>{try{return {notes:raw?readNotebookBackup(JSON.stringify({version:1,notes:JSON.parse(raw)})):[],error:""};}catch{return {notes:[],error:"La copia local no es válida. Conserva una copia antes de modificarla."};}},[raw]);
 useEffect(()=>{if(local||pathname==="/acceso")return;const abort=new AbortController();fetch("/api/notes",{cache:"no-store",signal:abort.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);return readNotebookBackup(JSON.stringify({version:1,notes:data.notes}));}).then(notes=>{setCloud(notes);setError("");}).catch(error=>{if(!abort.signal.aborted)setError(error instanceof Error?error.message:"No se pudieron cargar los apuntes.");});return()=>abort.abort();},[local,pathname]);
 async function send(method:string,notes?:NoteRecord[],id?:string){const response=await fetch("/api/notes"+(id?"?id="+encodeURIComponent(id):""),{method,headers:{"Content-Type":"application/json"},body:notes?JSON.stringify({version:1,notes}):undefined});const data=await response.json();if(!response.ok)throw new Error(data.error??"No se pudieron guardar los apuntes.");const checked=readNotebookBackup(JSON.stringify({version:1,notes:data.notes}));setCloud(checked);setError("");return checked;}
 const notes=local?localState.notes:cloud??[],ready=local?!localState.error:cloud!==null&&!error;
 const value:NotebookContextValue={notes,local,error:local?localState.error:error,ready,
  async saveNote(text,topic){if(!ready)throw new Error("Espera a que se carguen tus apuntes o vuelve a abrir esta página.");if(!text.trim())return;const entry={id:crypto.randomUUID(),text:text.trim(),topic,at:new Date().toISOString()};readNotebookBackup(JSON.stringify({version:1,notes:[entry]}));if(local)write(mergeNotebookBackup(localNotes(),[entry]));else await send("POST",[entry]);},
  async removeNote(id){if(!ready)throw new Error("Los apuntes no están disponibles.");if(local)write(localNotes().filter(n=>n.id!==id));else await send("DELETE",undefined,id);},
  exportNotebook(){if(!ready)throw new Error("No se puede exportar hasta que tus apuntes estén disponibles.");return JSON.stringify({version:1,exportedAt:new Date().toISOString(),notes:local?localNotes():notes},null,2);},
  async restoreNotebook(raw){if(!ready)throw new Error("Espera a que se carguen tus apuntes antes de importar.");const incoming=readNotebookBackup(raw);if(local){const merged=mergeNotebookBackup(localNotes(),incoming);write(merged);return merged.length;}return (await send("POST",incoming)).length;}
 };
 return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>;
}
export function useNotebookActions(){const value=useContext(NotebookContext);if(!value)throw new Error("NotebookProvider missing");return value;}
export function useNotebook(){return useNotebookActions().notes;}
