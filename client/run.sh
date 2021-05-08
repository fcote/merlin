sed -i.ori 's~$ENDPOINT~'"${ENDPOINT}"'~' index.html

npx serve -s . -l $CLIENT_PORT
