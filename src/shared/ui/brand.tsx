// Web vector adaptation of the approved AWNexus / AWN reference (01 October 2026).
export function Brand({compact=false,className=""}:{compact?:boolean;className?:string}) {
 return <svg className={"awn-brand "+(compact?"awn-brand-icon ":"")+className} viewBox={compact?"-5 -6 590 208":"-5 -6 1120 208"} fill="none" role="img" aria-label={compact?"AWN":"AWNexus"}>
<path fill="#2dbbea" d="M212 190 291 54H321L242 190Z"/>
<path fill="currentColor" d="M0 190 108 5Q111 0 117 0H124Q130 0 133 6L232 190H205L118 22 13 190Z"/>
<path fill="currentColor" d="M64 116H166L172 126H59Z"/>
<path fill="currentColor" d="M179 54H204Q210 54 213 60L275 180H286L376 6Q379 0 385 0H406L311 184Q308 190 301 190H266Q259 190 256 184Z"/><path d="M422 190V5H425L562 185V0" fill="none" stroke="currentColor" strokeWidth="9"/>
{!compact&&<><path d="M589 121H716C714 29 587 28 587 121C587 201 666 222 709 155M742 54 842 190M842 54 742 190M871 54V134C871 211 974 211 974 134V54M1087 66C1058 33 1005 52 1005 80C1005 102 1030 109 1059 118C1119 134 1110 176 1076 187C1046 198 1011 194 1001 169" fill="none" stroke="currentColor" strokeWidth="9"/></>}
</svg>;
}
