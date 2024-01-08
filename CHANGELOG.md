## [0.4.0](https://github.com/anucha-tk/nestjs-std-office-backend/compare/0.3.1...0.4.0) (2023-09-02)

### Features

- **customer:** active and inactive ([d7ba98f](https://github.com/anucha-tk/nestjs-std-office-backend/commit/d7ba98fa0e039704bf263a5ac55b47764e2fa99e))
- **customer:** active and soft-delete guard ([eb40ed8](https://github.com/anucha-tk/nestjs-std-office-backend/commit/eb40ed85c48518d2e1f599028b1efc335038c965))
- **customer:** add deleteMany api controller ([ae07248](https://github.com/anucha-tk/nestjs-std-office-backend/commit/ae0724804ec50153ae1b5c48f11ef2d804b25319))
- **customer:** findAll customer api ([bd22e79](https://github.com/anucha-tk/nestjs-std-office-backend/commit/bd22e79d3ac0227bcdcd3bff7d16d076c55ad79f))
- **customer:** findAll getTotal service ([781a8fb](https://github.com/anucha-tk/nestjs-std-office-backend/commit/781a8fbbdec329fc569b698883ce18fe952be9d3))
- **customer:** rcover api controller ([9bc8fc4](https://github.com/anucha-tk/nestjs-std-office-backend/commit/9bc8fc46c15da5e21fa154951bc6d4c65d26ef68))
- **customer:** softremove api controller ([4b129ac](https://github.com/anucha-tk/nestjs-std-office-backend/commit/4b129acd24f235fd852d8c3c5d8a696d0bddf2df))
- **customer:** update address controller api ([cd5081c](https://github.com/anucha-tk/nestjs-std-office-backend/commit/cd5081c63fce43c7d245d407857d8802811337cf))
- **customer:** update customer api controller ([6733511](https://github.com/anucha-tk/nestjs-std-office-backend/commit/673351174d5d9107e1e1228b6ade4168c625af55))
- **pagination:** add search deep obj when relation entity ([9e50315](https://github.com/anucha-tk/nestjs-std-office-backend/commit/9e50315ca646e85fc24619f91c9f1b2b18d33310))

## [0.3.1](https://github.com/anucha-tk/nestjs-std-office-backend/compare/0.3.0...0.3.1) (2023-08-26)

### Features

- **address:** separate address and unittest ([c3d1f53](https://github.com/anucha-tk/nestjs-std-office-backend/commit/c3d1f53da751d351d796302137fe2c252c44f8f4))
- **customer:** add put and notfound guard, decorator ([d94a1f4](https://github.com/anucha-tk/nestjs-std-office-backend/commit/d94a1f47066e0e39f20604041e059c06f1cb7995))
- **customer:** create customer api controller ([9207bef](https://github.com/anucha-tk/nestjs-std-office-backend/commit/9207bef14671afe7d8e1a32a6a225a7487df9dc3))
- **customer:** createInstance service and unittest ([abe60db](https://github.com/anucha-tk/nestjs-std-office-backend/commit/abe60db8ed1a7105e4137120615d59f968a628c0))
- **customer:** get controller api ([4adec5d](https://github.com/anucha-tk/nestjs-std-office-backend/commit/4adec5dfa2a6bfcb058b64b5e87b8eb888c293b1))
- **phone,medicalteam:** add createInstance and createInstances service and unittest ([f5bdb09](https://github.com/anucha-tk/nestjs-std-office-backend/commit/f5bdb0964661cef70f1b506999a534656d978b59))

## [0.3.0](https://github.com/anucha-tk/nestjs-std-office-backend/compare/0.2.0...0.3.0) (2023-08-24)

### Features

- **customer:** findOne service ([1cc524e](https://github.com/anucha-tk/nestjs-std-office-backend/commit/1cc524eee713646c60ca2cfd40f72317c4f9450f))
- **medicalteam:** active and inactive api controller ([eab9703](https://github.com/anucha-tk/nestjs-std-office-backend/commit/eab9703544fd8972c981d36497752b50f03c5787))
- **medicalteam:** add guard and test ([2c7ae7f](https://github.com/anucha-tk/nestjs-std-office-backend/commit/2c7ae7fee36ce662688ebb43df4f7164d7d33e9c))
- **medicalteam:** create controller api ([801eeca](https://github.com/anucha-tk/nestjs-std-office-backend/commit/801eeca358642bce126f59da24bb595cf1425b23))
- **medicalteam:** delete api controller ([818aae9](https://github.com/anucha-tk/nestjs-std-office-backend/commit/818aae9e374d8650fde35dc034d6e600d66782e9))
- **medicalteam:** get api controller ([a0c064d](https://github.com/anucha-tk/nestjs-std-office-backend/commit/a0c064dc2603cd9dd470128b2bd10efef77b18f2))
- **medicalteam:** update api controller ([fb3bb9a](https://github.com/anucha-tk/nestjs-std-office-backend/commit/fb3bb9add3e82bb66ba349a27ea9c1917c0af026))

## [0.2.0](https://github.com/anucha-tk/nestjs-std-office-backend/compare/0.1.1...0.2.0) (2023-08-17)

### Features

- **customer:** add create service ([0d74963](https://github.com/anucha-tk/nestjs-std-office-backend/commit/0d74963d19945127a6d62d9a8bde1e9ee82b5baf))
- **customer:** add customer, phoneNumber, medicalTeam model ([447dfd6](https://github.com/anucha-tk/nestjs-std-office-backend/commit/447dfd6075344dc364cb1e2a811deca7cac41563))
- **customer:** add deleteAll service, fix userFaker, and customer josn and add policy enum ([c179d52](https://github.com/anucha-tk/nestjs-std-office-backend/commit/c179d52ae787e4e331e0cab839168bb62ba9b1f7))
- **customer:** create controller api ([ddeb33b](https://github.com/anucha-tk/nestjs-std-office-backend/commit/ddeb33b861a7025556b45500dab7fd9c3ee8cab9))
- **customer:** fix entity ([6d77d76](https://github.com/anucha-tk/nestjs-std-office-backend/commit/6d77d761451b177c74242a5a5c18fa524560f194))
- **customer:** separate phoneNumber and medicalTeam to self module ([a2739c0](https://github.com/anucha-tk/nestjs-std-office-backend/commit/a2739c03cc3b6e1835c4096f47fbd5adc7940901))
- **phone:** active phone ([2f75c9d](https://github.com/anucha-tk/nestjs-std-office-backend/commit/2f75c9dc024f11569698a5dca305b82cab71985d))
- **phone:** change phoneNumber to phone ([70ab250](https://github.com/anucha-tk/nestjs-std-office-backend/commit/70ab250956ecb71a9ee3fa2623e427efb95de520))
- **phone:** controller get api ([d505685](https://github.com/anucha-tk/nestjs-std-office-backend/commit/d5056857cf5e21ce942f3d93da57940edb811f7d))
- **phone:** delete api ([0c5f2da](https://github.com/anucha-tk/nestjs-std-office-backend/commit/0c5f2da906c74be006e3ba78f17a48b2f30a1fd9))
- **phone:** guards ([c5c3838](https://github.com/anucha-tk/nestjs-std-office-backend/commit/c5c38385de3fb575bb5c39b124277975cd3cb855))
- **phone:** inactive api ([89cb21c](https://github.com/anucha-tk/nestjs-std-office-backend/commit/89cb21c8c41b9fee1f869399e06bddd9ddc8dee1))
- **phonenumber:** create service and test ([6b0d784](https://github.com/anucha-tk/nestjs-std-office-backend/commit/6b0d784109969682799a1ecbce06b14cc95abe93))
- **phone:** phone create api ([f836018](https://github.com/anucha-tk/nestjs-std-office-backend/commit/f83601821b39bf9514e0d30765b6118bc24c6475))
- **phone:** service ([e0bed6e](https://github.com/anucha-tk/nestjs-std-office-backend/commit/e0bed6eea272f8b8fd67694fc17ce2702488ed3c))
- **phone:** update ([aeb066e](https://github.com/anucha-tk/nestjs-std-office-backend/commit/aeb066e4c4941ae59243ccaad6b4b39a81bdfad2))

## [0.1.1](https://github.com/anucha-tk/nestjs-std-office-backend/compare/0.1.0...0.1.1) (2023-08-16)

### Features

- **user:** filter in id user lists ([e96f491](https://github.com/anucha-tk/nestjs-std-office-backend/commit/e96f49178bf33dfbfbe3e40c267521b428d70302))

### Bug Fixes

- **entity:** fix transformer lowerCase with type guard ([3e3bbf8](https://github.com/anucha-tk/nestjs-std-office-backend/commit/3e3bbf81531d32dc369f2512bf6d66b26600a1e3))

## 0.1.0 (2023-08-10)

### Features

- **api-key:** add api-key module ([5f348f0](https://github.com/anucha-tk/nestjs-std-office-backend/commit/5f348f062042bdd94b09cb04c3a351eaa7e3b5a1))
- **api-key:** add apikey controller and test ([7d3fcd3](https://github.com/anucha-tk/nestjs-std-office-backend/commit/7d3fcd33b2fe1350bad1d66e4ea97a2668c6c7db))
- **api-key:** add service ([0ea4557](https://github.com/anucha-tk/nestjs-std-office-backend/commit/0ea4557a08e0f28ef3377d96fc1b62fdad363530))
- **api-key:** doc, dto, serialization ([fdf82f6](https://github.com/anucha-tk/nestjs-std-office-backend/commit/fdf82f613ec998dd39f97e3fcdcd327a1c43b4ea))
- **api-key:** findAll service ([926966b](https://github.com/anucha-tk/nestjs-std-office-backend/commit/926966b8f81b19fcb087c55e9902cdbc13edbccf))
- **apikey:** add apikey decorator ([5b7ffc3](https://github.com/anucha-tk/nestjs-std-office-backend/commit/5b7ffc38c48f154d31dac40c158cfb95a8f92451))
- **apikey:** deleteMany and createRaw ([8f6c20c](https://github.com/anucha-tk/nestjs-std-office-backend/commit/8f6c20c71be55fb1d4b4abea0feef9485da90c84))
- **app:** add app controller logger ([0f4e8e9](https://github.com/anucha-tk/nestjs-std-office-backend/commit/0f4e8e93741044d423db0cc8a2fe435456f7500e))
- **app:** change little type ([f31b656](https://github.com/anucha-tk/nestjs-std-office-backend/commit/f31b656fdeb9cfb5ef543ead1eddb99ef4c56a7c))
- **app:** doc router refactor app ([82f6f46](https://github.com/anucha-tk/nestjs-std-office-backend/commit/82f6f46d59584213730386337b08d6d07b5ec292))
- **app:** setup project ([fa76556](https://github.com/anucha-tk/nestjs-std-office-backend/commit/fa76556ed6f24bf082c693a593e42a1334638b28))
- **auth:** add auth module ([d3d98d8](https://github.com/anucha-tk/nestjs-std-office-backend/commit/d3d98d8fe25aa8b850eb0dfd4cee3982a61962d4))
- **database:** add database postgres typeorm ([6b5bca9](https://github.com/anucha-tk/nestjs-std-office-backend/commit/6b5bca99d87b1ea889bc71b47335be053a35bca4))
- **debugger:** add debugger ([14d45e0](https://github.com/anucha-tk/nestjs-std-office-backend/commit/14d45e09057806e14370795bb582826aa35fba89))
- **doc:** doc and more ([92b7d83](https://github.com/anucha-tk/nestjs-std-office-backend/commit/92b7d838592c2152f4d9010c6570469761b80436))
- **error:** error module ([365dfa6](https://github.com/anucha-tk/nestjs-std-office-backend/commit/365dfa6c6baf4b76f3a54be47ef21cceb769bb41))
- **file:** add file module ([e85e592](https://github.com/anucha-tk/nestjs-std-office-backend/commit/e85e592239f87c98f83741846ea68336910954f4))
- **helper:** add helper ([7c0460c](https://github.com/anucha-tk/nestjs-std-office-backend/commit/7c0460c50375d705da3a60a593f30337d316ca1d))
- **interfaces:** add more interfaces ([05a46fe](https://github.com/anucha-tk/nestjs-std-office-backend/commit/05a46fe8bd2ce947d33cd5b7cdce1f67f6cc1fe9))
- **languages:** add languages ([c51e5e4](https://github.com/anucha-tk/nestjs-std-office-backend/commit/c51e5e428b8c301fd8c5b47596a04bfdd1d83d4d))
- **logger:** add logger module ([758c7e6](https://github.com/anucha-tk/nestjs-std-office-backend/commit/758c7e6626e998c8cea175d8398afde511cd8b17))
- **message:** add message module ([708d649](https://github.com/anucha-tk/nestjs-std-office-backend/commit/708d649051d19b396eeed0220a4918c7f0157a23))
- **pagination:** add pagination module ([093141c](https://github.com/anucha-tk/nestjs-std-office-backend/commit/093141cc395f80f3ec8273941771b56467a4e2d0))
- **policy:** add policy module ([2618408](https://github.com/anucha-tk/nestjs-std-office-backend/commit/26184082e29bff36a9aced7068038c6bd307d3db))
- **reponse:** add response ([8207a67](https://github.com/anucha-tk/nestjs-std-office-backend/commit/8207a67b6f9e3e7a55d1782dda1762885caf919b))
- **request:** add request module ([58c588d](https://github.com/anucha-tk/nestjs-std-office-backend/commit/58c588dce562d1bc2b2966e204850b0fcf399d70))
- **role:** add active, inActive, create, get, updateName, updatePermissions ann test ([734c995](https://github.com/anucha-tk/nestjs-std-office-backend/commit/734c99532cbfcb5259563508cdb7579fd6891883))
- **role:** add findOneByIdLeftJoinTable service and database abstract ([68738b1](https://github.com/anucha-tk/nestjs-std-office-backend/commit/68738b1bde35769d03c4fc697ba65be44a8f3a6d))
- **role:** add role module etc ([6622d91](https://github.com/anucha-tk/nestjs-std-office-backend/commit/6622d91bb33b909d30f0b62c5cbc4391e047b328))
- **role:** createMany service ([d96e477](https://github.com/anucha-tk/nestjs-std-office-backend/commit/d96e4779d1287c25c97c446facad18ad09cf5d68))
- **role:** role controller api and a lot more etc ([0733dd5](https://github.com/anucha-tk/nestjs-std-office-backend/commit/0733dd5332d695ff6b2c4d2bc4fbc324665ba427))
- **role:** role create ([04d56ac](https://github.com/anucha-tk/nestjs-std-office-backend/commit/04d56ac8d14f37cdf140b0fa0dcb4ac9167cbab6))
- **role:** role guard and test ([de01935](https://github.com/anucha-tk/nestjs-std-office-backend/commit/de0193516825fb676a582cab7d91ade6569f2915))
- **role:** role update ([bc82116](https://github.com/anucha-tk/nestjs-std-office-backend/commit/bc821165f3e0f74a5e2b5557861259ac00924551))
- **setting:** add setting module ([c5036b6](https://github.com/anucha-tk/nestjs-std-office-backend/commit/c5036b6656d7a5606d5ad79b5c0b1ca69bc83b77))
- **user:** add user admin controller and another fix ([a7859b8](https://github.com/anucha-tk/nestjs-std-office-backend/commit/a7859b856cce3cf4d50378c4f0444bc27ce9a80d))
- **user:** add user controller and fix ([d413612](https://github.com/anucha-tk/nestjs-std-office-backend/commit/d4136121a2c5a8865ce3a80eae95e6a14536af67))
- **user:** add user guard and uservice ([e5830d3](https://github.com/anucha-tk/nestjs-std-office-backend/commit/e5830d3d1fea402a72f4326adc455b57bcd21606))
- **user:** singup controller ([fbfb29a](https://github.com/anucha-tk/nestjs-std-office-backend/commit/fbfb29adf0ac0cca5fbd5cc7bf02bc03c73d18b3))
- **user:** user auth controller api ([629601c](https://github.com/anucha-tk/nestjs-std-office-backend/commit/629601cf2cb04302b471e239466c74186c140412))
- **user:** user create, deleteMany, seed ,test ([60dd7c9](https://github.com/anucha-tk/nestjs-std-office-backend/commit/60dd7c91e2608d07d51c44739c5a11a2ae83041a))
- **user:** user login controller api ([b43364d](https://github.com/anucha-tk/nestjs-std-office-backend/commit/b43364d55bf52d8f1eb70b6af5d997cbb6db6fd4))
- **user:** user public signup google and login , fix null value serialization ([ab83c4d](https://github.com/anucha-tk/nestjs-std-office-backend/commit/ab83c4da4b78c3cda676df85a4f19a33125ba519))

### Bug Fixes

- **api:** little fix apikey ([68a2fb5](https://github.com/anucha-tk/nestjs-std-office-backend/commit/68a2fb59d28e20da6352f47ca7a5622ccbb0d3dd))
- **eslint:** remove fix lint ([0cd5b82](https://github.com/anucha-tk/nestjs-std-office-backend/commit/0cd5b820cba88f975e3f84c9e9724794e5713b32))
