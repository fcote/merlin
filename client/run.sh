sed -i.ori 's~$ENDPOINT~'"${ENDPOINT}"'~' index.html

exec ./node_modules/.bin/serve -s . -l $CLIENT_PORT
