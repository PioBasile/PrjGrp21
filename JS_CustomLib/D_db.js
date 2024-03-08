const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./baseDeDonne/users.db',sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return console.error(err.message);
    }
  
  
    console.log('la connection est ouverte.');
    
  
});



const register = (login, password) => {


    return new Promise((resolve, reject) => {
      db.all('SELECT nom FROM players;', function(err, table) {
        let pris = false;
        table.forEach(element => {
          if(element.nom==login){pris=true;}
        });
  
        if(pris){
          resolve(0);
        } else {
           db.run("INSERT INTO players(nom,password) VALUES(?,?)", [login,password]);
           resolve(1);
        }
      });
    });
  
   
    return 1;
  }
  
const login = (login,passwordd) => {
  

    return new Promise((resolve, reject) => {
  
      db.all('SELECT * FROM players WHERE nom="' + login + '";', function(err, table){
        
        if(err || table == undefined || table.toString() == ""){resolve(0);return;}
  
        if(table[0].password == passwordd){
  
          resolve(1);
        } else {
          resolve(0);
        }
      });
    });
  };
  
  
const get_user_info = (nom) => {
  
    let res;
    return new Promise((resolve,reject) => {
  
      db.get('SELECT * FROM players WHERE nom="' + nom + '";', function(err, table) {
          resolve(table);
          });
  
        res = resolve
  
      });
}


const changeDataBase = (dataToChange, newData, nom) => {
   const sqlUpdate = `UPDATE players SET ${dataToChange} = ? WHERE nom = ?`
   db.run( 
     sqlUpdate, [newData, nom], ( function(err) {
     if (err) {
       console.error(err.message);
     } else {
       console.log(`Mise à jour réussie pour ${nom}`);
     }
   })
   )
}
  

function close() {
    
  
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }() => {
      console.log('La Connection est fermer');
      }   
    });
  
  }


module.exports = { login, changeDataBase, get_user_info, register };