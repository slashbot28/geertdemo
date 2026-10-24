=====================================================================
GEERT VERHULST - AMIGA 1200 AGA DEMOSCENE FOR PLAYSTATION 5
Native PS5 Homebrew Executable (Target: x86_64-sie-ps5)
Built with PS5 Payload SDK & Prospero Toolchain
=====================================================================

STANDAARD PS5 HOMEBREW DIRECTORY:
/data/homebrew/GEERT0001/

BESTANDEN IN DIT PAKKET:
1. eboot.bin - Native Fake-Signed ELF (FSELF) voor PS5 Homebrew
2. eboot.elf - Raw ELF binary voor direct injecteren via payload loaders (poort 9020/9021)
3. GEERT0001/ - Complete PS5 Homebrew App map met eboot.bin, sce_sys/param.json en icon0.png

HOE TE INSTALLEREN OP PLAYSTATION 5 (JAILBREAK / HOMEBREW):

METHODE 1: VIA FTP (FileZilla / WinSCP / PS5 FTP) - MEEST GEBRUIKT
1. Verbind via FTP naar je PS5 (standaard poort 2121 of 1337).
2. Ga naar de standaard PS5 Homebrew directory:
   /data/homebrew/
3. Upload de complete map 'GEERT0001' naar:
   /data/homebrew/GEERT0001/
   Zodat de bestanden als volgt staan:
   /data/homebrew/GEERT0001/eboot.bin
   /data/homebrew/GEERT0001/sce_sys/param.json
   /data/homebrew/GEERT0001/sce_sys/icon0.png
4. Open Itemzflow, Homebrew Store of herstart je homebrew launcher: de demo verschijnt direct met icoon in je lijst!

METHODE 2: VIA USB & ITEMZFLOW / BESTANDSBEHEERDER
1. Kopieer de map 'GEERT0001' naar de root van je USB-stick (FAT32/exFAT).
2. Steek de USB in de PS5 en open Itemzflow Bestandsbeheerder.
3. Kopieer 'GEERT0001' naar:
   /data/homebrew/
4. Klaar! Je kunt de demo direct starten vanuit Itemzflow of je PS5 homebrew dashboard.

METHODE 3: DIRECT INJECTEREN MET NETCAT / PAYLOAD LOADER
1. Start de PS5 Payload Loader (etaHEN / kstuff / elf loader) op poort 9020 of 9021.
2. Verstuur eboot.elf via netcat of ps5-payload-deploy:
   nc -w 3 <PS5_IP> 9021 < eboot.elf
3. De demo start direct op je scherm!

Veel plezier met de Amiga 1200 AGA Demo op je PlayStation 5!
