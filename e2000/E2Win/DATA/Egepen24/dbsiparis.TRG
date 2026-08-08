TYPE=TRIGGERS
triggers='CREATE DEFINER=`root`@`localhost` TRIGGER dbsiparis_after_upd AFTER UPDATE ON dbsiparis FOR EACH ROW\nbegin\nif new.siparisno <> old.siparisno then\nupdate dbpoz set dbpoz.siparisno=new.siparisno where dbpoz.siparisno=old.siparisno;\n\nIF EXISTS (SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = N\'uretim\') then\nupdate uretim.planlama  set uretim.planlama.siparisno = new.siparisno where uretim.planlama.siparisno=old.siparisno and  dbname = (SELECT DATABASE() as dataname FROM dual); \nupdate uretim.kesimdata  set uretim. kesimdata.parent = new.siparisno where uretim.kesimdata.parent=old.siparisno and  dbname = (SELECT DATABASE() as dataname FROM dual); \nupdate uretim.kesimdata  set uretim.kesimdata.siparisno = new.siparisno, uretim.kesimdata.id = new.siparisno where (uretim.kesimdata.siparisno=old.siparisno and uretim.kesimdata.id=old.siparisno) and  dbname = (SELECT DATABASE() as dataname FROM dual); \nupdate uretim.siparisbul  set  uretim.siparisbul.siparisno = new.siparisno where uretim.siparisbul.siparisno=old.siparisno and  dbname = (SELECT DATABASE() as dataname FROM dual); \nend if;\nend if;\nend'
sql_modes=1344274432
definers='root@localhost'
client_cs_names='latin5'
connection_cl_names='latin5_turkish_ci'
db_cl_names='utf8_general_ci'
created=174117083399
