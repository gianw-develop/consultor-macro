import { Learning } from "../../../modules/annienexus/learning";
import library from "../../../modules/annienexus/published-library.json";
export default async function Page({searchParams}:{searchParams:Promise<{leccion?:string}>}){
 const {leccion}=await searchParams;
 const initialLesson=library.some(d=>d.id===leccion)?leccion:library[0].id;
 return <Learning library={library} initialLesson={initialLesson}/>;
}
