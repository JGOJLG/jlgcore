"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Task = { id:string; text:string; completed:boolean; position:number };

export default function ShelfLaifSection(){
  const [userId,setUserId]=useState<string|null>(null);
  const [tasks,setTasks]=useState<Task[]>([]);
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let active=true;
    supabase.auth.getUser().then(({data})=>{if(!active)return;setUserId(data.user?.id??null)});
    const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>setUserId(session?.user?.id??null));
    return()=>{active=false;listener.subscription.unsubscribe()};
  },[]);

  useEffect(()=>{
    if(!userId){setTasks([]);setLoading(false);return}
    setLoading(true);
    supabase.from("jlg_core_tasks").select("id,text,completed,position").eq("category_id","shelflaif").order("position").order("created_at").then(({data})=>{
      setTasks((data??[]) as Task[]);setLoading(false);
    });
  },[userId]);

  async function addTask(e:FormEvent){
    e.preventDefault();
    const value=text.trim();
    if(!value||!userId)return;
    const {data}=await supabase.from("jlg_core_tasks").insert({user_id:userId,category_id:"shelflaif",text:value,completed:false,position:tasks.length}).select("id,text,completed,position").single();
    if(data){setTasks(current=>[...current,data as Task]);setText("")}
  }

  async function toggle(task:Task){
    const {data}=await supabase.from("jlg_core_tasks").update({completed:!task.completed}).eq("id",task.id).select("id,text,completed,position").single();
    if(data)setTasks(current=>current.map(item=>item.id===task.id?data as Task:item));
  }

  async function remove(id:string){
    const {error}=await supabase.from("jlg_core_tasks").delete().eq("id",id);
    if(!error)setTasks(current=>current.filter(item=>item.id!==id));
  }

  if(!userId)return null;
  const done=tasks.filter(task=>task.completed).length;

  return <section className="bg-[#f5f1e9] px-4 pt-4 text-[#26322c] sm:px-6 sm:pt-5">
    <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[30px] border border-[#cbd6c3] bg-[#e2e8dc] shadow-sm">
      <div className="flex flex-col gap-4 border-b border-black/10 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#70806c]">Active build</p>
          <h2 className="mt-1 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">ShelfLAIF</h2>
          <p className="mt-2 text-sm text-[#687365]">Social reading app · <a href="https://shelflaif.jlgcore.com" target="_blank" rel="noreferrer" className="underline underline-offset-4">Open ShelfLAIF ↗</a></p>
        </div>
        <div className="rounded-full border border-[#bdcbb7] bg-white/45 px-4 py-2 text-xs font-medium">{done} of {tasks.length} complete</div>
      </div>
      <div className="bg-[#fbf8f2]/75 p-5 sm:p-8">
        <form onSubmit={addTask} className="flex flex-col gap-2 sm:flex-row">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a ShelfLAIF task..." className="h-12 flex-1 rounded-[16px] border border-[#d4dbcf] bg-white px-4 text-sm outline-none focus:border-[#8da087]"/>
          <button className="h-12 rounded-[16px] bg-[#53684d] px-6 text-sm font-medium text-white">Add to checklist</button>
        </form>
        {loading?<p className="mt-5 text-sm text-[#778173]">Loading ShelfLAIF checklist...</p>:tasks.length===0?<p className="mt-5 rounded-[18px] border border-dashed border-[#cbd5c6] bg-white/45 px-4 py-6 text-center text-sm text-[#778173]">No ShelfLAIF tasks yet. Add the first one above.</p>:<div className="mt-5 grid gap-2 lg:grid-cols-2">{tasks.map(task=><div key={task.id} className="group flex items-center gap-3 rounded-[18px] border border-[#d8ded4] bg-white/75 px-4 py-3.5"><button type="button" onClick={()=>void toggle(task)} aria-label={task.completed?"Mark incomplete":"Mark complete"} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border text-xs ${task.completed?"border-[#64795e] bg-[#64795e] text-white":"border-[#aeb9aa] bg-white"}`}>{task.completed?"✓":""}</button><button type="button" onClick={()=>void toggle(task)} className={`flex-1 text-left text-sm ${task.completed?"text-[#8a9187] line-through":"text-[#344033]"}`}>{task.text}</button><button type="button" onClick={()=>void remove(task.id)} className="rounded-full px-2 py-1 text-sm text-[#9a7770] opacity-60 transition hover:bg-[#f2e7e4] hover:opacity-100" aria-label="Delete task">×</button></div>)}</div>}
      </div>
    </div>
  </section>;
}
