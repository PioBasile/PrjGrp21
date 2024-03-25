const sqlite3 = require('sqlite3').verbose();


// Connexion à scoreboard.db
let scoreboardDb = new sqlite3.Database('./baseDeDonne/scoreboard.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } 
});

// Création de la table scoreboard
scoreboardDb.run(`CREATE TABLE IF NOT EXISTS scoreboard (
    "nom" TEXT PRIMARY KEY,
    "bataille-ouverte" INTEGER,
    "six-qui-prend" INTEGER, 
    "mille-bornes" INTEGER,
    "argent" INTEGER
    );`, (err) => {
    if (err) {
        console.error(err.message);
    } 
});

// Connexion à users.db
let usersDb = new sqlite3.Database('./baseDeDonne/users.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});


// Fonction pour obtenir les utilisateurs de users.db
function getUsers() {
    return new Promise((resolve, reject) => {
        usersDb.all("SELECT nom, argent FROM players", [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

//SELF EXPLANATORY
function transferUsersToScoreboard(users) {
    users.forEach(user => {    
        const sqlInsertOrUpdate = `
            INSERT INTO scoreboard ("nom", "bataille-ouverte", "six-qui-prend", "mille-bornes","argent")
            VALUES (?, 0, 0, 0, ?)
            ON CONFLICT(nom) 
            DO UPDATE SET argent = excluded.argent;`;

        scoreboardDb.run(sqlInsertOrUpdate, [user.nom, user.argent], function(err) {
            if (err) {
                console.error(`Erreur lors de l'insertion/mise à jour de ${user.nom}: ${err.message}`);
            }
        });
    });
}

getUsers().then(transferUsersToScoreboard).catch(console.error);


//renvoi un dic de {nom:[bataille,sqp,mb,argent], ... } dans cette ordre
function getAllScores() {
    return new Promise((resolve, reject) => {
        scoreboardDb.all('SELECT nom, "bataille-ouverte" AS bataille, "six-qui-prend" AS sqp, "mille-bornes" AS mb, argent FROM scoreboard', [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const result = rows.reduce((acc, row) => {
                acc[row.nom] = [row.bataille, row.sqp, row.mb ,row.argent];
                return acc;
            }, {});
            resolve(result);
        });
    });
}

//incrementer de +1 le score d'un jeu pour un joueur 
const changeScoreBoard = (jeu, nom) => {
    // éviter les injections SQL (askip c recommende)
    const validColumns = ["bataille-ouverte", "six-qui-prend", "mille-bornes"];
    if (!validColumns.includes(jeu)) {
        console.error("Nom de jeu invalide.");
        return;
    }
        
    const sqlUpdate = `UPDATE scoreboard SET "${jeu}" = "${jeu}" + 1 WHERE nom = ?`;
    
    scoreboardDb.run(sqlUpdate, [nom], function(err) {
        if (err) {
            console.error(err.message);
        }
    });
}

const changeMoney = (nom, argent) => {
    const sqlUpdateMoney = `UPDATE scoreboard SET argent = argent + ? WHERE nom = ?`;
    
    scoreboardDb.run(sqlUpdateMoney, [argent, nom], function(err) {
        if (err) {
            console.error(err.message);
        }
    });
}


module.exports = {getAllScores,changeScoreBoard,changeMoney };
