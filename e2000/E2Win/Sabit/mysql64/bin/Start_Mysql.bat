@echo off
CALL C:\Ercom\E2Win\Sabit\MySQL64\bin\mysqld.exe --install MySQL64_Ercom --defaults-file="C:\Ercom\E2Win\Sabit\MySQL64\my.ini"
net start MySQL64_Ercom
