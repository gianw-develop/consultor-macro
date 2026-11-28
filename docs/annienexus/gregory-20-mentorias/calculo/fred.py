import urllib.request, pandas as pd, io, os, concurrent.futures as cf
D=os.path.dirname(os.path.abspath(__file__))+'/data/fred/'; os.makedirs(D,exist_ok=True)
S={'PERMIT':'Permisos de construcción','HOUST':'Viviendas iniciadas','ICSA':'Solicitudes iniciales','IC4WSA':'Solicitudes media 4s','CCSA':'Solicitudes continuas',
'T10Y2Y':'Curva 10Y-2Y','T10Y3M':'Curva 10Y-3M','DGS2':'Bono 2 años','DGS10':'Bono 10 años','DFEDTARU':'Fed límite superior','BAMLH0A0HYM2':'Diferencial high yield',
'AMTMNO':'Nuevos pedidos manufactura','NEWORDER':'Pedidos bienes de capital','UMCSENT':'Confianza Michigan','GDPNOW':'GDPNow Atlanta Fed','M1REAL':'M1 real',
'GDPC1':'PIB real','PAYEMS':'Empleo no agrícola','RSAFS':'Ventas minoristas','INDPRO':'Producción industrial','W875RX1':'Ingreso real sin transferencias',
'CPIAUCSL':'IPC','CPILFESL':'IPC subyacente','PCEPI':'PCE','PCEPILFE':'PCE subyacente','UNRATE':'Tasa de paro','CORESTICKM159SFRBATL':'Sticky CPI subyacente','SAHMREALTIME':'Regla de Sahm'}
def get(k):
    try:
        t=urllib.request.urlopen(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={k}",timeout=60).read().decode()
        open(D+k+'.csv','w').write(t); d=pd.read_csv(io.StringIO(t)); d=d[pd.to_numeric(d.iloc[:,1],errors='coerce').notna()]
        return k,d.iloc[-1,0],d.iloc[-1,1],len(d)
    except Exception as e: return k,'ERR',str(e)[:60],0
with cf.ThreadPoolExecutor(6) as ex:
    for k,dt,v,n in ex.map(get,S): print(f"{k:22s} {dt} {v} ({S[k]})")
