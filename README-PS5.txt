=====================================================================
GEERT VERHULST - AMIGA 1200 AGA DEMOSCENE FOR PLAYSTATION 5
Native PS5 Homebrew Executable (Target: x86_64-sie-ps5)
Built with PS5 Payload SDK & Prospero Toolchain
=====================================================================

BESTANDEN IN DIT PAKKET:
1. eboot.bin - Native Fake-Signed ELF (FSELF) voor PS5 Homebrew
2. eboot.elf - Raw ELF binary voor direct injecteren via payload loaders (poort 9020/9021)
3. GEERT0001/ - Complete PS5 Homebrew App map met sce_sys/param.json en icon0.png

HOE TE INSTALLEREN OP PLAYSTATION 5 (JAILBREAK / HOMEBREW):

METHODE 1: VIA ITEMZFLOW OF PS5 APP MANAGER
1. Kopieer de map 'GEERT0001' naar een FAT32 of exFAT USB-stick.
2. Steek de USB-stick in de PS5.
3. Open Itemzflow of je PS5 Bestandsbeheerder en installeer/verplaats naar:
   /user/app/GEERT0001/
   en
   /system_ex/app/GEERT0001/
4. De demo verschijnt nu direct op je PS5 Dashboard met icoon!

METHODE 2: VIA FTP (FileZilla / WinSCP)
1. Verbind via FTP naar je PS5 (standaard poort 2121 of 1337).
2. Upload 'eboot.bin' naar:
   /system_ex/app/GEERT0001/eboot.bin
3. Upload 'sce_sys/param.json' en 'icon0.png' naar:
   /user/app/GEERT0001/sce_sys/
4. Start de app vanaf het hoofdscherm.

METHODE 3: DIRECT INJECTEREN MET NETCAT / PAYLOAD LOADER
1. Start de PS5 Payload Loader (etaHEN / kstuff) op poort 9021.
2. Verstuur eboot.elf via netcat of ps5-payload-deploy:
   nc -w 3 <PS5_IP> 9021 < eboot.elf
3. De demo start direct op je scherm!

Veel plezier met de Amiga 1200 AGA Demo op je PlayStation 5!
