/* =====================================================================
   COMMODORE AMIGA 1200 AGA DEMOSCENE FOR PLAYSTATION 5
   Created for: GEERT VERHULST
   Target: PlayStation 5 (x86_64-sie-ps5)
   Features:
   - Hardware-accelerated PS5 WebKit runtime
   - Direct launch into https://geert-demo.web.app
   - Full 3D Amiga Boing Ball, Special/Experimental backgrounds & Paula audio
   ===================================================================== */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define DEMO_URL "https://geert-demo.web.app"

int sceUserServiceInitialize(void*);
int sceUserServiceTerminate(void);
int sceSystemServiceLaunchWebBrowser(const char *uri, void*);

__attribute__((constructor)) static void constructor(void) {
    sceUserServiceInitialize(0);
}

int main(void) {
    // Launch PS5 native browser with full hardware acceleration
    if (sceSystemServiceLaunchWebBrowser(DEMO_URL, 0)) {
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

__attribute__((destructor)) static void destructor(void) {
    sceUserServiceTerminate();
}
