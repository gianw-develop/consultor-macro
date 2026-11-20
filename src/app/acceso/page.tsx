import { AccessForm } from "../../shared/ui/access-form";
import { authConfiguration } from "../../shared/server/auth-config";
import { safePostLoginPath } from "../../shared/auth-destination";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{next?:string|string[]}>}){
 const {next}=await searchParams;
 return <AccessForm configured={!!authConfiguration()} destination={safePostLoginPath(next)}/>;
}
