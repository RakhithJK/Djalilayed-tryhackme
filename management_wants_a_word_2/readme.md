## tryhackme room Management Wants a Word https://tryhackme.com/room/hh-managementwantsaword-6bf3cc41
## YouTube video walk through: https://youtu.be/XH_DXFg-QvA
```
C/Users/vera/Documents/backup
```
```
file C/Users/vera/Documents/backup
```
```
xxd -l 64 C/Users/vera/Documents/backup
```
```
find C/Users/vera -type f \
  \( -iname 'Login Data' \
  -o -iname 'Local State' \
  -o -iname 'Web Data' \
  -o -iname 'History' \) -print
```
 The important files are:

History: browser activity and searches.
Login Data: saved usernames and encrypted passwords.
Web Data: autofill information.
Local State: Chrome’s encrypted AES key.

==== Examine saved browser credentials
```
sqlite3 'path/to/Login Data'
```
```
.headers on
.mode column

SELECT
    origin_url,
    action_url,
    username_value,
    hex(password_value) AS encrypted_password
FROM logins;
```

==== The autofill database
```
sqlite3 'path/to/Web Data'
```
```
SELECT name, value, date_created, date_last_used
FROM autofill
ORDER BY date_last_used DESC;
```
==== Locate Vera's DPAPI master key
```
find C/Users/vera/AppData/Roaming/Microsoft/Protect \
  -type f -printf '%f %p\n'
```
```
SID:
S-1-5-21-2529683458-431225740-1723070931-1000

Master-key GUID:
c90719ef-5b98-474e-b934-136d606a702a
```
registry hives:
```
C/Windows/System32/config/SAM
C/Windows/System32/config/SYSTEM
C/Windows/System32/config/SECURITY
```
```
impacket.secretsdump \
  -sam C/Windows/System32/config/SAM \
  -system C/Windows/System32/config/SYSTEM \
  -security C/Windows/System32/config/SECURITY \
  LOCAL
```
```
[*] DefaultPassword 
(Unknown User):minivera  
```
====  Decrypt Vera's DPAPI master key

```
impacket.dpapi masterkey \
  -file 'C/Users/vera/AppData/Roaming/Microsoft/Protect/S-1-5-21-2529683458-431225740-1723070931-1000/c90719ef-5b98-474e-b934-136d606a702a' \
  -sid 'S-1-5-21-2529683458-431225740-1723070931-1000' \
  -password 'minivera'
```
```
Decrypted key with User Key (SHA1)
Decrypted key: 0x5e5715ec9b6df5a86e97902692a66d28e691f05d5bc1e04d0159cfe960e94c978c07e5004a0179d3a96df2468885a28175b0b02cc064445f116a752d2b3e9d40  
```
```
MASTERKEY='5e5715ec9b6df5a86e97902692a66d28e691f05d5bc1e04d0159cfe960e94c978c07e5004a0179d3a96df2468885a28175b0b02cc064445f116a752d2b3e9d40'
```
==== Extract Chrome's DPAPI-protected AES key
```
LOCAL_STATE="$(find "$PWD/C/Users/vera" \
  -type f -iname 'Local State' -print -quit)"
```
```
printf '%s\n' "$LOCAL_STATE"
```
The os_crypt.encrypted_key value is Base64-encoded and begins with the five-byte string DPAPI.
```
jq -r '.os_crypt.encrypted_key' "$LOCAL_STATE" |
base64 -d |
xxd
```
Extract the DPAPI blob while removing the five-byte prefix:
```
jq -r '.os_crypt.encrypted_key' "$LOCAL_STATE" |
base64 -d |
tail -c +6 > chrome-key.dpapi
```
==== Decrypt Chrome's AES key
```
python3 - "$MASTERKEY" <<'PY'
import sys
from impacket.dpapi import DPAPI_BLOB

masterkey = bytes.fromhex(sys.argv[1])

with open("chrome-key.dpapi", "rb") as f:
    blob = DPAPI_BLOB(f.read())

decrypted = blob.decrypt(masterkey)

if decrypted is None:
    raise SystemExit("DPAPI decryption failed")

with open("chrome-aes.key", "wb") as f:
    f.write(decrypted)

print(f"Wrote {len(decrypted)} bytes")
print(f"Chrome AES key: {decrypted.hex()}")
PY
```

==== Verify that the result is a 32-byte AES key:
```
wc -c chrome-aes.key
```
==== Decrypt Chrome's saved password
```
LOGIN_DATA="$(find "$PWD/C/Users/vera" \
  -type f -iname 'Login Data' -print -quit)"
```
```
printf '%s\n' "$LOGIN_DATA"
```
```
file "$LOGIN_DATA"
```
Decrypt the v10 credential:
```
python3 - "$LOGIN_DATA" ./chrome-aes.key <<'PY'
import sqlite3
import sys
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

database = Path(sys.argv[1]).resolve()
keyfile = Path(sys.argv[2]).resolve()

if not database.is_file():
    raise SystemExit(f"Missing database: {database}")

key = keyfile.read_bytes()

if len(key) != 32:
    raise SystemExit(f"Unexpected AES key length: {len(key)}")

db = sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)

for url, username, encrypted in db.execute("""
    SELECT origin_url, username_value, password_value
    FROM logins
"""):
    blob = bytes(encrypted)

    if not blob.startswith((b"v10", b"v11")):
        print(f"Unsupported format: {blob[:10]!r}")
        continue

    nonce = blob[3:15]
    ciphertext_and_tag = blob[15:]

    password = AESGCM(key).decrypt(
        nonce,
        ciphertext_and_tag,
        None
    ).decode("utf-8", errors="replace")

    print(f"URL:      {url}")
    print(f"Username: {username}")
    print(f"Password: {password}")
PY
```
```
Username: VeraSecretVault
Password: Wh4t1sV3raD0inG0nTh1sH0st
```
==== Open the VeraCrypt container

VeraCrypt itself was not required because Linux cryptsetup supports VeraCrypt containers:
```
sudo cryptsetup tcryptOpen \
  --veracrypt \
  'C/Users/vera/Documents/backup' \
  vera_backup
```
  
==== Mount the decrypted volume read-only:
```
sudo mkdir -p /mnt/vera
sudo mount -o ro /dev/mapper/vera_backup /mnt/vera
```
==== Clean up
```
sudo umount /mnt/vera
sudo cryptsetup close vera_backup
```
==== Conclusion:

Version 1.26.29
   → identify VeraCrypt

Documents/backup
   → suspected VeraCrypt container

Chrome Login Data
   → encrypted v10 password for VeraSecretVault

SECURITY + SYSTEM hives
   → LSA DefaultPassword: minivera

minivera
   → decrypt Vera’s DPAPI master key

DPAPI master key
   → decrypt Chrome Local State AES key

Chrome AES key
   → decrypt saved browser password

Browser password
   → unlock VeraCrypt backup

Mounted volume
   → PDF
   → flag
