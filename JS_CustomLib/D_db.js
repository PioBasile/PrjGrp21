const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./users.db',sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return console.error(err.message);
    }
  
  
    console.log('la connection est ouverte.');
  
    get_user_info("Pio").then((res) => {
  
      changeDataBase('nbGames',res.nbGames + 1,"Pio");
      console.log(res.nbGames);
  
    })
  
    get_user_info('Pio').then((res) => {
      console.log(res.nbGames);
    });
  
    
    
  
});



export function register(login, password) {


    return new Promise((resolve, reject) => {
      db.all('SELECT nom FROM users;', function(err, table) {
        let pris = false;
        table.forEach(element => {
          if(element.nom==login){pris=true;}
        });
  
        if(pris){
          resolve(0);
        } else {
           db.run("INSERT INTO users(nom,password,carte_pref) VALUES(?,?,'Aucunes')", [login,password]);
           resolve(1);
        }
      });
    });
  
   
    return 1;
  }
  
export function login(login,passwordd) {
  
  
    return new Promise((resolve, reject) => {
  
      db.all('SELECT * FROM users WHERE nom="' + login + '";', function(err, table){
        
        if(err || table == undefined || table.toString() == ""){resolve(0);return;}
  
        if(table[0].password == passwordd){
  
          resolve(1);
        } else {
          resolve(0);
        }
      });
    });
  };
  
  
export function  get_user_info(nom) {
  
    let res;
    return new Promise((resolve,reject) => {
  
      db.get('SELECT * FROM users WHERE nom="' + nom + '";', function(err, table) {
          resolve(table);
          });
  
        res = resolve
  
      });
}


export function changeDataBase(dataToChange, newData, nom) {
   const sqlUpdate = `UPDATE Users SET ${dataToChange} = ? WHERE nom = ?`
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
  
  
export function close() {
    
  
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }() => {
      console.log('La Connection est fermer');
      }   
    });
  
  }


