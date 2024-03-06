@ECHO OFF
call cd ..
call code .
START node server.js
cd projectapp
START npm run start
EXIT