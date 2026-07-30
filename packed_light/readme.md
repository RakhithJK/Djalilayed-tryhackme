```
tshark -r traffic.pcapng \
    -Y 'tcp.port == 8080 && http.request && http.cookie' \
    -T fields \
    -e http.cookie
 ```   
``` 
tshark -r traffic.pcapng \
    -Y 'tcp.port == 8080 && http.request && http.cookie' \
    -T fields \
    -e http.cookie |
  sed 's/^hotel_sess_state=//'
```
  
```  
tshark -r traffic.pcapng \
    -Y 'tcp.port == 8080 && http.request && http.cookie' \
    -T fields \
    -e http.cookie | \
sed 's/^hotel_sess_state=//' | tr -d '\n'
```

```
tshark -r traffic.pcapng \
    -Y 'tcp.port == 8080 && http.request && http.cookie' \
    -T fields \
    -e http.cookie | \
sed 's/^hotel_sess_state=//' | \
python3 -c 'import sys, base64; print("".join(chr(base64.b64decode(line)[0] ^ ord("H")) for line in sys.stdin if line.strip()))'
```
