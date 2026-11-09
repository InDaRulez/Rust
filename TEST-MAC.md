# Version de test macOS

La tâche GitHub Actions « macOS test build » compile Astral pour Mac Intel et Apple Silicon. Le résultat est une application universelle, avec une signature ad hoc, sans notarisation Apple.

Après la réussite du workflow, télécharger l’artefact **Astral-mac-universal** dans l’onglet Actions. Il contient un DMG et un ZIP de l’application. Ouvrir le DMG et glisser Astral dans Applications, ou extraire le ZIP et déplacer Astral.app dans Applications.

Si macOS bloque une application non notariée, utiliser Réglages Système → Confidentialité et sécurité → Ouvrir quand même après la première tentative d’ouverture. Ne pas désactiver globalement Gatekeeper.

Les outils de développement et Rust ne sont pas nécessaires pour utiliser le résultat compilé. Les films distants nécessitent Internet. La bande-annonce Elephants Dream est intégrée pour un essai local.

Cette tâche vérifie les deux architectures du binaire et sa signature ; elle lance aussi le processus pendant huit secondes sur le runner macOS, sans test interactif sur un Mac physique. Les limites fonctionnelles sont décrites dans README.md.

## Compilation disponible

Compilation réussie le 9 novembre 2026 : https://github.com/InDaRulez/Rust/actions/runs/42618640630

Téléchargement (connexion GitHub requise, conservé jusqu’au 23 novembre 2026) : https://github.com/InDaRulez/Rust/actions/runs/42618640630/artifacts/13675386403

Décompresser le téléchargement, puis le fichier Astral-mac-universal.zip qu’il contient pour obtenir Astral.app. Le DMG est également inclus dans le sous-dossier src-tauri/target/universal-apple-darwin/release/bundle/dmg.
