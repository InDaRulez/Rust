# Astral

Première version d’une application de médiathèque inspirée de Stremio, avec une identité visuelle propre. **Cœur Rust + Tauri 2, interface HTML/CSS/JavaScript adaptative.** Ce projet n’est pas une application entièrement écrite en Rust et n’est pas affilié à Stremio.

## Fonctionnalités livrées

- Catalogue de démonstration : quatre œuvres Blender, recherche et filtres.
- Fiches, favoris, bibliothèque et reprise de lecture persistante.
- Lecteur vidéo HTML natif à la WebView, contrôles et plein écran selon la plateforme.
- Commandes Rust pour le stockage JSON local et les appels réseau aux extensions.
- Installation d’un manifeste HTTPS compatible Stremio, récupération des premiers catalogues movie/series et des sources vidéo HTTPS.
- Interface ordinateur, tablette et téléphone ; navigation inférieure sur mobile.
- Aperçu dans un navigateur : stockage localStorage, extensions désactivées. Dans Tauri : stockage dans le répertoire de données de l’application, réseau via Rust.

## Démarrage

Prérequis : Node.js 22 LTS ou plus récent, npm, Rust stable, et les dépendances Tauri de votre système.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite pour l’aperçu navigateur.

Application native :

```sh
npm run tauri dev
npm run tauri build
```

Windows : outils de compilation Visual Studio C++, WebView2 et Rust cible MSVC. macOS : Xcode Command Line Tools. Linux Debian/Ubuntu : dépendances de développement WebKitGTK 4.1, GTK 3, OpenSSL, librsvg, libayatana-appindicator, patchelf et outils C/C++ ; suivre la liste adaptée à la distribution sur https://v2.tauri.app/start/prerequisites/.

Les paquets sont générés dans `src-tauri/target/release/bundle/`. Générer chaque plateforme sur son système, puis signer les paquets pour distribution.

## Android

Installer Android Studio, SDK, NDK et JDK 17 ; définir `JAVA_HOME`, `ANDROID_HOME` et `NDK_HOME` selon l’installation. Installer les cibles Rust correspondant aux appareils/émulateurs, par exemple `aarch64-linux-android` et `x86_64-linux-android`.

```sh
npm run tauri android init
npm run tauri android dev
npm run tauri android build
```

Le projet Gradle est généré dans `src-tauri/gen/android`. Configurer la clé de signature pour une publication. Minimum Android configuré : API 26 ; une WebView récente est nécessaire.

## iPhone et iPad

Nécessite **un Mac avec Xcode**, les simulateurs iOS, et un compte Apple pour signer sur appareil/distribuer. Installer les cibles Rust `aarch64-apple-ios` et `aarch64-apple-ios-sim` (ou `x86_64-apple-ios` pour simulateur Intel).

```sh
npm run tauri ios init
npm run tauri ios dev
npm run tauri ios build
```

Ouvrir le projet généré dans `src-tauri/gen/apple` pour choisir l’équipe Apple, les appareils iPhone/iPad, les orientations et les paramètres de signature. Minimum iOS configuré : 16.0. Les projets natifs mobiles seront générés par ces commandes ; ils ne sont pas inclus ni validés dans cette livraison.

Documentation : https://v2.tauri.app/start/prerequisites/ et https://v2.tauri.app/develop/.

## Extensions

Dans l’application native, ouvrir Extensions et fournir `https://votre-source/manifest.json`. Le manifeste doit exposer `id`, `name`, `catalogs`. Les catalogues sont limités aux six premiers catalogues movie/series, cent entrées chacun. Chaque ressource est limitée à 4 Mo et quinze secondes. Aucune exécution de code d’extension. Les redirections HTTP sont refusées.

Cette implémentation couvre un **sous-ensemble** du protocole Stremio. Pas de pagination, extras obligatoires, résolution d’épisodes de séries, sous-titres d’extension, authentification ou traitement de `behaviorHints`. Les séries sont listées mais la navigation saisons/épisodes reste à développer. Les liens torrent, magnet, externalUrl et les sources DRM ne sont pas lus. Les codecs, conteneurs et HLS dépendent de la WebView de chaque appareil ; pas de transcodage. La lecture MP4 H.264/AAC est la cible recommandée.

## Tests et état de validation

```sh
npm run build
npm run test:rust
npx playwright install chromium
npm test
```

Pour utiliser un Chromium déjà installé : `CHROMIUM_PATH=/chemin/chromium npm test` (sous Unix). Playwright démarre Vite si nécessaire.

Validé dans l’environnement de développement Linux :

- Compilation de production de l’interface.
- Trois tests Rust : sérialisation de bibliothèque et validation des URL.
- Quatre tests Chromium : recherche/favoris et persistance, interface mobile/filtres/extensions, capture ordinateur, lecture réelle du clip local et reprise après rechargement.

**Compilation de l’application Tauri tentée, bloquée par les bibliothèques système GTK/WebKit de développement manquantes.** Les commandes Rust de l’application native et les extensions n’ont pas été testées de bout en bout. Aucun exécutable Windows/macOS/Linux, APK/AAB ou IPA signé n’est fourni. Aucun essai sur matériel Android ou Apple n’a été réalisé. Les tests de navigateur ne prouvent pas la compatibilité native.

## Organisation

- `crates/astral-core` : modèle de bibliothèque et validation HTTPS, testables sans WebView.
- `src-tauri` : application Rust/Tauri, stockage local et client d’extensions.
- `src` : interface adaptative et lecteur.
- `public` : illustrations et clip de démonstration local.
- `tests` : parcours fonctionnels Chromium.
- `CREDITS.md` : sources et licences des médias.

La sauvegarde est locale à chaque appareil. Pas de compte, serveur, synchronisation multiappareils, téléchargement hors ligne des films, Chromecast/AirPlay dédié ou publication en boutique dans cette version. Ne pas confondre cette base fonctionnelle avec l’ensemble des fonctionnalités de Stremio.
