import requests
symbols_str = "BTC-USD,ETH-USD"
url = f"https://query2.finance.yahoo.com/v8/finance/spark?symbols={symbols_str}"
headers = {'User-Agent': 'Mozilla/5.0'}
resp = requests.get(url, headers=headers, timeout=10)
data = resp.json()
for sym in symbols_str.split(','):
    if sym in data:
        close_arr = data[sym].get('close', [])
        if close_arr:
            # find last non-null close
            current_price = next((x for x in reversed(close_arr) if x is not None), None)
            prev_close = data[sym].get('previousClose', current_price)
            change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0
            print(f"{sym}: {current_price} ({change_pct:.2f}%)")
