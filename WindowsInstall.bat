@ECHO OFF 
call npm install express 
call npm install sqlite3 
call npm install socket.io 
call cd projectapp 
call npm install react-scripts -f
call cd ..
call windowsQuickStart.bat