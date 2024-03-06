@ECHO OFF 
call cd ..
call npm install express 
call npm install sqlite3 
call npm install socket.io 
call cd projectapp 
call npm install --prefix ./ react-scripts -f
call cd ..
call cd ".\BUILD( FICHIER D'INSTALLATION RAPIDE )"
call windowsQuickStart.bat