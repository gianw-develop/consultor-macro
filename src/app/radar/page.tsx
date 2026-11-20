import {SectorsWorkspace} from '../../shared/ui/sectors-workspace';
import {loadMacroSnapshot} from '../../modules/annienexus/macro-loader';
export const dynamic='force-dynamic';
export default async function Page(){
 return <SectorsWorkspace snapshot={await loadMacroSnapshot()}/>;
}
