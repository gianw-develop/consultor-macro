import pandas as pd, numpy as np, os
D=os.path.dirname(os.path.abspath(__file__))+'/data/'
dpx=pd.read_csv(D+'dow_px.csv',index_col=0,parse_dates=True)
dow=[c for c in dpx.columns if c not in ['^DJI','QQQ','QQEW','RSP','SPY','DIA','VZ']]
sp=pd.read_csv(D+'sp500_px.csv',index_col=0,parse_dates=True).ffill(limit=3)
def breadth(px,name,peak):
    last=px.iloc[-1]; n=last.notna().sum()
    hi52=px.rolling(252,min_periods=200).max(); lo52=px.rolling(252,min_periods=200).min()
    w=px.tail(5)
    nh=((w>=hi52.tail(5)*0.999).any()).sum(); nl=((w<=lo52.tail(5)*1.001).any()).sum()
    near_hi=(last>=hi52.iloc[-1]*0.98).sum(); near_lo=(last<=lo52.iloc[-1]*1.02).sum()
    a50=(last>px.rolling(50).mean().iloc[-1]).sum(); a200=(last>px.rolling(200).mean().iloc[-1]).sum()
    ytd=(last/px.loc[:'2025-12-31'].iloc[-1]-1)*100
    sincepk=(last/px.loc[:peak].iloc[-1]-1)*100
    bear=(last<=hi52.iloc[-1]*0.8).sum()
    print(f"\n== {name} ({n} valores) ==")
    print(f"Máximos 52s (última semana): {nh} | Mínimos 52s: {nl} | a <2% del máximo: {near_hi} | a <2% del mínimo: {near_lo}")
    print(f"Sobre su media 50: {a50} ({a50/n*100:.0f}%) | sobre su media 200: {a200} ({a200/n*100:.0f}%)")
    print(f"En positivo en el año: {(ytd>0).sum()} ({(ytd>0).sum()/n*100:.0f}%) | bajan desde el techo del índice ({peak}): {(sincepk<0).sum()} ({(sincepk<0).sum()/n*100:.0f}%) | en su propio mercado bajista (−20% de su máximo): {bear} ({bear/n*100:.0f}%)")
    print(f"Mediana de los valores desde el techo: {sincepk.median():.1f}% | en el año: {ytd.median():.1f}%")
    return ytd,sincepk
ytd,pk=breadth(dpx[dow],'DOW 30','2026-08-05')
# Dow points contribution since peak (Aug 5): price change * (1/divisor) = Δprice*5.9436
k=5.9436
con=((dpx[dow].iloc[-1]-dpx[dow].loc[:'2026-08-05'].iloc[-1])*k).sort_values()
print('Dow total desde el techo (puntos):',round(dpx['^DJI'].iloc[-1]-dpx['^DJI'].loc[:'2026-08-05'].iloc[-1]),'| suma contribuciones',round(con.sum()))
print('Más restan:',[(t,int(v)) for t,v in con.head(6).items()]); print('Más suman:',[(t,int(v)) for t,v in con.tail(6)[::-1].items()])
w=(dpx[dow].iloc[-1]/dpx[dow].iloc[-1].sum()*100).sort_values(ascending=False); print('Peso (precio) top6:',[(t,round(v,1)) for t,v in w.head(6).items()],'| top6 suman',round(w.head(6).sum(),1),'%')
ytd,pk=breadth(sp,'S&P 500','2026-10-06')
m7=['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA']; rest=[c for c in sp.columns if c not in m7+['GOOG']]
for lab,ser in [('en el año',ytd),('desde el techo 6-oct',pk)]:
    print(f"Magníficas 7 (media) {lab}: {ser[m7].mean():.1f}% | las otras 493 (media): {ser[rest].mean():.1f}% | detalle M7:",{t:round(ser[t],1) for t in m7})
def ret(s,a): x=dpx[s]; return (x.iloc[-1]/x.loc[:a].iloc[-1]-1)*100
for a,lab in [('2025-12-31','año'),('2026-10-06','desde techo')]:
    print(f"{lab}: SPY {ret('SPY',a):.1f}% vs RSP (equiponderado) {ret('RSP',a):.1f}% | QQQ {ret('QQQ',a):.1f}% vs QQEW (Nasdaq equiponderado) {ret('QQEW',a):.1f}%")
# history of % S&P above 200 and new lows count, last 12 weeks
a200=(sp>sp.rolling(200).mean()).sum(axis=1)/sp.notna().sum(axis=1)*100
lo=(sp<=sp.rolling(252,min_periods=200).min()).sum(axis=1); hi=(sp>=sp.rolling(252,min_periods=200).max()).sum(axis=1)
wk=pd.DataFrame({'%>200':a200,'nuevos_max':hi,'nuevos_min':lo}).resample('W-FRI').agg({'%>200':'last','nuevos_max':'sum','nuevos_min':'sum'}).tail(12)
print(wk.round(0).to_string())
