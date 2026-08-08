@echo off
CALL C:\Ercom\E2Win\Sabit\MySQL32\bin\mysqld.exe --install MySQL32_Ercom --defaults-file="C:\Ercom\E2Win\Sabit\MySQL32\my.ini"
net start MySQL32_Ercom
