# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
# This File is From Noname Unofficial Free Software
# Licensed under GNU GENERAL PUBLIC LICENSE Version 3
# File: .gitlab-ci.yml (nofficalfs/noname-extension/records/.gitlab-ci.yml)
# Content:
# Copyright (c) 2023 nofficalfs All rights reserved
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

NAME 			:= Records
BRANCH 			:= Development
BUILD 			:= 1

YEAR 			:= 2023
MONTH 			:= 05
DAY 			:= 27
TIME 			:= 03


PACKAGE_NAME 	:= ${NAME}

# Rolling Template
ifeq ($(NIGHTLY), 1)
	PACKAGE_NAME = ${NAME}(Nightly ${YEAR}${MONTH}${DAY})
else
	ifeq ($(BRANCH), Development)
		PACKAGE_NAME = ${NAME}(Dev ${YEAR}.${MONTH}.${DAY}.${TIME})
	else
		ifeq ($(BRANCH), Master)
			PACKAGE_NAME = ${NAME}(Build ${BUILD})
			ifneq ($(strip $(NEXT_PREVIEW)),)
				PACKAGE_NAME = ${NAME}(Build ${BUILD} Form ${NEXT_PREVIEW})
			endif
		else
			ifeq ($(BRANCH), Stable)
				PACKAGE_NAME = ${NAME}(${YEAR}.${MONTH}.${DAY})
			endif
			ifeq ($(BRANCH), Testing)
				PACKAGE_NAME = ${NAME}(Beta ${YEAR}.${MONTH}.${DAY})
			endif
		endif
	endif
endif


DESCRIPT		:= $(shell git rev-parse --short=8 HEAD)
PACKAGE		:= zip
FILE		:= extension.js package.js LICENSE README.md .editorconfig
DIR 		:= 

FILE_NAME = ${PACKAGE_NAME}(p=${DESCRIPT})

pack: ${PACKAGE}

.PHONY: mkdir

mkdir: 
	mkdir -p out

zip: mkdir
	zip -P ${DESCRIPT} -r "out/${FILE_NAME}.zip" ${FILE} ${DIR}

7z: mkdir
	7z a -r "out/${FILE_NAME}.7z" ${FILE} ${DIR} -p${DESCRIPT}

xz: mkdir
	tar -cvf "out/${FILE_NAME}.tar" ${FILE} ${DIR}
	xz -T0 "out/${FILE_NAME}.tar"
	echo "${DESCRIPT}\n${DESCRIPT}" | bcrypt -ro "out/${FILE_NAME}.tar.xz" > "out/${FILE_NAME}.tar.xz.bfe"
	rm "out/${FILE_NAME}.tar.xz"

.PHONY: test clean

test:
	@echo "${FILE_NAME}"

clean:
	-rm -rf out/*.zip
	-rm -rf out/*.7z
	-rm -rf out/*.tar.xz.bfe

