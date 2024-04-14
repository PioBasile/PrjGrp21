PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE scoreboard (
    "nom" TEXT PRIMARY KEY,
    "bataille-ouverte" INTEGER,
    "six-qui-prend" INTEGER, 
    "mille-bornes" INTEGER,
    "argent" INTEGER
    );
INSERT INTO scoreboard VALUES('dummy',0,0,0,500);
INSERT INTO scoreboard VALUES('florian',19,1,0,140);
INSERT INTO scoreboard VALUES('pio',0,0,0,500);
INSERT INTO scoreboard VALUES('player2',0,1,0,500);
INSERT INTO scoreboard VALUES('a',0,0,0,500);
INSERT INTO scoreboard VALUES('b',0,0,0,500);
INSERT INTO scoreboard VALUES('poo',3,0,1,1037);
INSERT INTO scoreboard VALUES('123',0,0,0,500);
INSERT INTO scoreboard VALUES('hadii',0,0,0,500);
INSERT INTO scoreboard VALUES('cxcb',0,0,0,500);
INSERT INTO scoreboard VALUES('po',0,0,0,500);
INSERT INTO scoreboard VALUES('ppo',0,0,0,500);
INSERT INTO scoreboard VALUES('gygy',3,2,2,610);
INSERT INTO scoreboard VALUES('iop',1,0,0,0);
INSERT INTO scoreboard VALUES('player3',0,0,0,500);
INSERT INTO scoreboard VALUES('player10',0,0,0,500);
INSERT INTO scoreboard VALUES('player1',11,6,1,410);
INSERT INTO scoreboard VALUES('dudu',0,0,0,500);
INSERT INTO scoreboard VALUES('gugu',1,0,0,600);
INSERT INTO scoreboard VALUES('gygy ',0,0,0,0);
INSERT INTO scoreboard VALUES('reyder',3,0,0,900);
INSERT INTO scoreboard VALUES('flo',0,0,0,500);
INSERT INTO scoreboard VALUES('dorian',0,0,0,700);
INSERT INTO scoreboard VALUES('Pio',0,0,0,700);
INSERT INTO scoreboard VALUES('barbapapa',0,0,0,450);
INSERT INTO scoreboard VALUES('Allah',0,0,0,0);
INSERT INTO scoreboard VALUES('alladin',0,0,0,500);
INSERT INTO scoreboard VALUES('gaga',0,0,0,500);
INSERT INTO scoreboard VALUES('allah',0,0,0,600);
COMMIT;
