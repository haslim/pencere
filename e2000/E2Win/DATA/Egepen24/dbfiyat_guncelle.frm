TYPE=VIEW
query=select `egepen`.`dbfiyat`.`LISTENO` AS `LISTENO`,`egepen`.`dbfiyat`.`STOKKODU` AS `STOKKODU`,`egepen`.`dbstok`.`ACIKLAMA` AS `ACIKLAMA`,`egepen`.`dbstok`.`TIP` AS `TIP`,`egepen`.`dbfiyat`.`FIYAT1` AS `FIYAT1`,`egepen`.`dbfiyat`.`FIYAT2` AS `FIYAT2`,`egepen`.`dbfiyat`.`FIYAT3` AS `FIYAT3`,`egepen`.`dbfiyat`.`FIYAT4` AS `FIYAT4`,`egepen`.`dbfiyat`.`FIYAT5` AS `FIYAT5`,`egepen`.`dbfiyat`.`FIYAT6` AS `FIYAT6`,`egepen`.`dbfiyat`.`FIYAT7` AS `FIYAT7`,`egepen`.`dbfiyat`.`FIYAT8` AS `FIYAT8`,`egepen`.`dbfiyat`.`FIYAT9` AS `FIYAT9`,`egepen`.`dbfiyat`.`FIYAT10` AS `FIYAT10`,`egepen`.`dbfiyat`.`sayac` AS `sayac` from (`egepen`.`dbstok` join `egepen`.`dbfiyat` on((`egepen`.`dbfiyat`.`STOKKODU` = `egepen`.`dbstok`.`STOKKODU`)))
md5=f2b4ae2a078ff570553b2e1bf06ef836
updatable=1
algorithm=0
definer_user=root
definer_host=localhost
suid=1
with_check_option=0
timestamp=2024-03-25 20:09:33
create-version=1
source=select `dbfiyat`.`LISTENO` AS `LISTENO`,`dbfiyat`.`STOKKODU` AS `STOKKODU`,`dbstok`.`ACIKLAMA` AS `ACIKLAMA`,`dbstok`.`TIP` AS `TIP`,`dbfiyat`.`FIYAT1` AS `FIYAT1`,`dbfiyat`.`FIYAT2` AS `FIYAT2`,`dbfiyat`.`FIYAT3` AS `FIYAT3`,`dbfiyat`.`FIYAT4` AS `FIYAT4`,`dbfiyat`.`FIYAT5` AS `FIYAT5`,`dbfiyat`.`FIYAT6` AS `FIYAT6`,`dbfiyat`.`FIYAT7` AS `FIYAT7`,`dbfiyat`.`FIYAT8` AS `FIYAT8`,`dbfiyat`.`FIYAT9` AS `FIYAT9`,`dbfiyat`.`FIYAT10` AS `FIYAT10`,`dbfiyat`.`sayac` AS `sayac` from (`dbstok` join `dbfiyat` on((`dbfiyat`.`STOKKODU` = `dbstok`.`STOKKODU`)))
client_cs_name=utf8
connection_cl_name=utf8_general_ci
view_body_utf8=select `egepen`.`dbfiyat`.`LISTENO` AS `LISTENO`,`egepen`.`dbfiyat`.`STOKKODU` AS `STOKKODU`,`egepen`.`dbstok`.`ACIKLAMA` AS `ACIKLAMA`,`egepen`.`dbstok`.`TIP` AS `TIP`,`egepen`.`dbfiyat`.`FIYAT1` AS `FIYAT1`,`egepen`.`dbfiyat`.`FIYAT2` AS `FIYAT2`,`egepen`.`dbfiyat`.`FIYAT3` AS `FIYAT3`,`egepen`.`dbfiyat`.`FIYAT4` AS `FIYAT4`,`egepen`.`dbfiyat`.`FIYAT5` AS `FIYAT5`,`egepen`.`dbfiyat`.`FIYAT6` AS `FIYAT6`,`egepen`.`dbfiyat`.`FIYAT7` AS `FIYAT7`,`egepen`.`dbfiyat`.`FIYAT8` AS `FIYAT8`,`egepen`.`dbfiyat`.`FIYAT9` AS `FIYAT9`,`egepen`.`dbfiyat`.`FIYAT10` AS `FIYAT10`,`egepen`.`dbfiyat`.`sayac` AS `sayac` from (`egepen`.`dbstok` join `egepen`.`dbfiyat` on((`egepen`.`dbfiyat`.`STOKKODU` = `egepen`.`dbstok`.`STOKKODU`)))
