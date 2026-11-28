import json, urllib.request, urllib.parse, pandas as pd, os
H={'User-Agent':'Mozilla/5.0'}
def get(s):
    u=f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(s)}?range=2y&interval=1d"
    r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30))['chart']['result'][0]
    x=pd.Series(r['indicators']['quote'][0]['close'],index=pd.to_datetime(r['timestamp'],unit='s').normalize()).dropna(); return x[~x.index.duplicated()]
px={s:get(s) for s in ['HG=F','GC=F','DX-Y.NYB','TLT','CL=F','IWM','SPY']}
df=pd.DataFrame(px).ffill().dropna(); df.to_csv('data/extra_px.csv')
def ch(x,n): return (x.iloc[-1]/x.iloc[-1-n]-1)*100
cg=df['HG=F']/df['GC=F']; sm=df['IWM']/df['SPY']
for nm,x in [('cobre/oro',cg),('IWM/SPY',sm),('oro',df['GC=F']),('dólar DXY',df['DX-Y.NYB']),('TLT',df['TLT']),('petróleo',df['CL=F'])]:
    print(f"{nm:10s} hoy {x.iloc[-1]:.4g} | 1m {ch(x,21):+.1f}% | 3m {ch(x,63):+.1f}% | vs EMA50 {(x.iloc[-1]/x.ewm(span=50,adjust=False).mean().iloc[-1]-1)*100:+.1f}%")
w=lambda s:s.resample('W-FRI').last().tail(52)
out={'cobreoro':{'v':[round(v,6) for v in w(cg)]},'iwmspy':{'v':[round(v,4) for v in w(sm)]},'gold':{'v':[round(v,1) for v in w(df['GC=F'])]},'dxy':{'v':[round(v,2) for v in w(df['DX-Y.NYB'])]},'oil':{'v':[round(v,2) for v in w(df['CL=F'])]}}
def c(s): return pd.read_csv(f'data/{s}.csv',index_col=0,parse_dates=True)['close'].dropna()
sect={'XLK':'Tecnología','XLC':'Comunicaciones','XLY':'Consumo discrecional','XLF':'Financiero','XLI':'Industrial','XLB':'Materiales','XLE':'Energía','XLRE':'Inmobiliario','XLP':'Consumo básico','XLV':'Salud','XLU':'Servicios públicos'}
rows=[]
for k,nme in sect.items():
    x=c(k); rows.append([k,nme,round(ch(x,21),1),round(ch(x,63),1),round((x.iloc[-1]/x.loc[:'2026-10-06'].iloc[-1]-1)*100,1)])
rows.sort(key=lambda r:-r[3]); out['sectors']=rows
for r in rows: print(r)
json.dump(out,open('data/extra.json','w'))
