#!/bin/bash
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[1;31m'
NC='\033[0m'


if [ ! -d ./test/server/.meteor ]; then
(
    cd ./test/server/
    echo -e "${YELLOW}[+]\t installing server meteor${NC}"
    meteor create --bare .
    ) &
    wait
    cp -R ./test/server/. ./test/server2/
    cp test/server/conf.tmp.s2 test/server2/conf.js
    echo -e "${GREEN}[+]\t installing completed${NC}"
fi
curl -s -o "/dev/null" http://localhost:3000
if [ $? -eq 0 ]; then
  echo -e "${RED}[!]\t The address http://localhost:3000 is busy, maybe another Meteor instance?${NC}"
  echo -e "${RED}[!]\t exit${NC}"
  exit 0
fi
curl -s -o "/dev/null" http://localhost:3002
if [ $? -eq 0 ]; then
  echo -e "${RED}[!]\t The address http://localhost:3002 is busy, maybe another Meteor instance?${NC}"
  echo -e "${RED}[!]\t exit${NC}"
  exit o
fi
echo -e "${GREEN}[+]\t Start meteor server${NC}"
(cd test/server/ && meteor) &
(cd test/server2/ && meteor --port 3002) &
ready=-1
until [ $ready -eq 0 ]; do
	( curl -s -o "/dev/null" http://localhost:3000 && curl -s -o "/dev/null" http://localhost:3002 )
	ready=$?
	sleep 3
done

echo -e "${GREEN}[+]\t Start e2e test${NC}"
npm run e2e-test

echo -e "${GREEN}[+]\t Stop meteor${NC}"
pkill -t $(ps hotty $$)
exit 0
