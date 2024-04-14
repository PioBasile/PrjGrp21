PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE players (
                    nom TEXT PRIMARY KEY,
                    password TEXT,
                    nbGames INTEGER DEFAULT 0,
                    nbWin INTEGER DEFAULT 0,
                    roundWin INTEGER DEFAULT 0,
                    argent REAL DEFAULT 500
                );
INSERT INTO players VALUES('dummy','dumdum',0,0,0,500.0);
INSERT INTO players VALUES('player1','player',399,399,29,410.0);
INSERT INTO players VALUES('player3','player',0,0,0,500.0);
INSERT INTO players VALUES('player10','player',0,0,0,500.0);
INSERT INTO players VALUES('florian','flo',491,491,39,140.0);
INSERT INTO players VALUES('pio','JeDetesteLaFrance',0,0,0,500.0);
INSERT INTO players VALUES('player2','player',14,0,2,500.0);
INSERT INTO players VALUES('a','b',31,0,0,500.0);
INSERT INTO players VALUES('b','c',24,0,0,500.0);
INSERT INTO players VALUES('poo','123',106,106,16,1037.0);
INSERT INTO players VALUES('123','123',2,0,4,500.0);
INSERT INTO players VALUES('hadii','123',0,0,0,500.0);
INSERT INTO players VALUES('cxcb','fg',0,0,0,500.0);
INSERT INTO players VALUES('po','123',2,0,9,500.0);
INSERT INTO players VALUES('ppo','123',1,0,0,500.0);
INSERT INTO players VALUES('gygy','123',35,35,0,610.0);
INSERT INTO players VALUES('iop','123',53,53,3,0.0);
INSERT INTO players VALUES('dudu','321',1,0,0,500.0);
INSERT INTO players VALUES('gugu','123',6,7,0,600.0);
INSERT INTO players VALUES('gygy ','123',1,1,0,0.0);
INSERT INTO players VALUES('flo','flo',0,0,0,500.0);
INSERT INTO players VALUES('dorian','rey',12,12,0,700.0);
INSERT INTO players VALUES('Pio','123',8,9,0,700.0);
INSERT INTO players VALUES('barbapapa','mama',3,3,0,450.0);
INSERT INTO players VALUES('Allah','wakbar',1,1,0,0.0);
INSERT INTO players VALUES('alladin','1',2,2,0,500.0);
INSERT INTO players VALUES('gaga','123',0,0,0,500.0);
INSERT INTO players VALUES('allah','wakbar',2,3,0,600.0);
COMMIT;
