@echo off
rem Terowongan SSH ke MySQL Hostinger memakai plink (satu paket dengan PuTTY).
rem Selama jendela ini terbuka, klien MySQL di komputer Anda bisa tersambung ke 127.0.0.1 port 3307.
set SSH_USER=u123456789
set SSH_HOST=ISI_IP_ATAU_HOSTNAME_HOSTINGER
set SSH_PORT=65002

plink.exe -ssh -P %SSH_PORT% -L 3307:127.0.0.1:3306 -N %SSH_USER%@%SSH_HOST%
pause
